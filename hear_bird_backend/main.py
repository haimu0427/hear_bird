import asyncio
import csv
import glob
import logging
import os
import re
import shutil
import subprocess
import sys
import tempfile
import uuid
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile, Depends, Security
from fastapi.security import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# API key configuration
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)
valid_api_keys = os.getenv("API_KEYS", "").split(",")

async def verify_api_key(api_key: Optional[str] = Security(api_key_header)) -> str:
    if not api_key:
        raise HTTPException(
            status_code=401,
            detail="API key required. Provide X-API-Key header."
        )
    if not valid_api_keys or not any(key.strip() for key in valid_api_keys):
        # If no API keys configured, allow all requests (dev mode)
        logger.warning("No API keys configured - running in open access mode")
        return api_key
    if api_key not in [key.strip() for key in valid_api_keys if key.strip()]:
        raise HTTPException(
            status_code=403,
            detail="Invalid API key"
        )
    return api_key

# Configure rate limiting
limiter = Limiter(key_func=get_remote_address)

app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS with environment variable support
def validate_origins(origins: list[str]) -> list[str]:
    """Validate and sanitize CORS origins"""
    from urllib.parse import urlparse

    valid_origins = []
    for origin in origins:
        parsed = urlparse(origin.strip())
        if not all([parsed.scheme in ('http', 'https'), parsed.netloc]):
            logger.warning(f"Invalid origin: {origin}")
            continue
        valid_origins.append(parsed.geturl())
    return valid_origins

allowed_origins = validate_origins(
    os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "X-API-Key"],
    allow_credentials=True,
)

# Allowed audio formats and file size limit (50MB)
ALLOWED_AUDIO_TYPES = {
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/wave",
    "audio/x-wav",
    "audio/webm",
    "audio/ogg",
    "audio/aac",
    "audio/m4a",
    "audio/x-m4a",
    "audio/mp4",
}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB in bytes

# Constants for file validation and processing
MAGIC_BYTES_HEADER_SIZE = 8  # Bytes to read for magic bytes check
BIRDNET_ANALYSIS_TIMEOUT_SECONDS = 300  # 5 minutes timeout for analysis
ALLOWED_FILE_EXTENSIONS = {".mp3", ".wav", ".webm", ".ogg", ".aac", ".m4a", ".mp4"}

# Audio file magic bytes
AUDIO_MAGIC_BYTES = {
    b"\xff\xfb": "mp3",
    b"\xff\xfa": "mp3",
    b"\x49\x44\x33": "mp3",
    b"\x52\x49\x46\x46": "wav",
    b"\x1a\x45\xdf\xa3": "webm",
    b"\x4f\x67\x67\x53": "ogg",
}


def _validate_audio_file(file: UploadFile) -> None:
    """Validate uploaded audio file for size, MIME type, and magic bytes."""
    # Check filename
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing audio filename")

    # Get file extension
    _, ext = os.path.splitext(file.filename)
    ext = ext.lower()
    if ext not in ALLOWED_FILE_EXTENSIONS:
        allowed_exts = ", ".join(sorted(ALLOWED_FILE_EXTENSIONS))
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format: {ext}. Allowed formats: {allowed_exts}"
        )

    # Check MIME type
    if file.content_type not in ALLOWED_AUDIO_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported MIME type: {file.content_type}"
        )

    # Check file size and read first bytes for magic number check
    file.file.seek(0, os.SEEK_END)
    file_size = file.file.tell()
    file.file.seek(0)

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large: {file_size / (1024 * 1024):.2f}MB. Maximum size: {MAX_FILE_SIZE / (1024 * 1024):.0f}MB"
        )

    if file_size == 0:
        raise HTTPException(status_code=400, detail="File is empty")

    # Check magic bytes
    header = file.file.read(MAGIC_BYTES_HEADER_SIZE)
    file.file.seek(0)
    is_valid_audio = False
    for magic_bytes in AUDIO_MAGIC_BYTES:
        if header.startswith(magic_bytes):
            is_valid_audio = True
            break

    if not is_valid_audio:
        raise HTTPException(
            status_code=400,
            detail="Invalid audio file format"
        )


async def _run_birdnet_analyzer(
    audio_path: str,
    output_dir: str,
    lat: Optional[float],
    lon: Optional[float],
) -> str:
    command = [
        sys.executable,
        "-m",
        "birdnet_analyzer.analyze",
        audio_path,
        "-o",
        output_dir,
        "--rtype",
        "csv",
    ]

    if lat is not None and lon is not None:
        command.extend(["--lat", str(lat), "--lon", str(lon)])

    try:
        process = await asyncio.create_subprocess_exec(
            *command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        try:
            stdout, stderr = await asyncio.wait_for(
                process.communicate(),
                timeout=BIRDNET_ANALYSIS_TIMEOUT_SECONDS,
            )
        except asyncio.TimeoutError:
            process.kill()
            logger.error("BirdNET analysis timed out")
            raise RuntimeError("BirdNET analysis timed out")

        if stdout:
            logger.info(f"Command output: {stdout.decode()}")
        if stderr:
            logger.warning(f"Command error: {stderr.decode()}")

        if process.returncode != 0:
            error_msg = stderr.decode().strip() if stderr else "BirdNET analysis failed"
            raise RuntimeError(error_msg)
    except Exception as exc:
        if isinstance(exc, RuntimeError):
            raise
        logger.error(f"Unexpected error running BirdNET: {exc}")
        raise RuntimeError(f"Failed to run BirdNET analysis: {exc}") from exc

    csv_candidates = glob.glob(os.path.join(output_dir, "*.csv"))
    if not csv_candidates:
        raise RuntimeError("BirdNET analysis produced no CSV output")

    csv_candidates = [
        path
        for path in csv_candidates
        if "analysis_params" not in os.path.basename(path)
    ]
    if not csv_candidates:
        raise RuntimeError("BirdNET analysis produced no usable CSV output")

    test_candidates = [
        path for path in csv_candidates if os.path.basename(path).startswith("test")
    ]
    selected_candidates = test_candidates or csv_candidates
    selected_candidates.sort(key=os.path.getmtime, reverse=True)
    return selected_candidates[0]


def _normalize_header(header: str) -> str:
    cleaned = re.sub(r"\s*\(s\)\s*", " ", header, flags=re.IGNORECASE)
    parts = [part for part in re.split(r"[^0-9a-zA-Z]+", cleaned.strip()) if part]
    if not parts:
        return ""
    return parts[0].lower() + "".join(part.capitalize() for part in parts[1:])


def _read_csv_rows(csv_path: str) -> list[dict[str, str]]:
    with open(csv_path, "r", newline="") as handle:
        reader = csv.DictReader(handle)
        rows = list(reader)

    normalized_rows: list[dict[str, str]] = []
    for row in rows:
        normalized: dict[str, str] = {}
        for key, value in row.items():
            if key.strip().lower() == "file":
                continue
            normalized_key = _normalize_header(key)
            if normalized_key:
                normalized[normalized_key] = value
        normalized_rows.append(normalized)

    return normalized_rows


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "version": "1.0.0",
    }


@app.post("/analyze")
@limiter.limit("5/minute")
async def analyze_audio(
    file: UploadFile = File(...),
    lat: Optional[float] = Form(None),
    lon: Optional[float] = Form(None),
    api_key: str = Depends(verify_api_key),
):
    # Validate uploaded file
    _validate_audio_file(file)

    # Generate secure random filename
    file_ext = os.path.splitext(file.filename)[1] if file.filename else ".wav"
    secure_filename = f"audio_{uuid.uuid4().hex}{file_ext}"

    # Use system temp directory instead of current working directory for security
    temp_dir = tempfile.mkdtemp(prefix="birdnet_")
    audio_path = os.path.join(temp_dir, secure_filename)

    try:
        with open(audio_path, "wb") as audio_handle:
            shutil.copyfileobj(file.file, audio_handle)
        logger.info(f"Audio file saved at {audio_path}")

        csv_path = await _run_birdnet_analyzer(audio_path, temp_dir, lat, lon)
        results = _read_csv_rows(csv_path)
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except HTTPException:
        # Re-raise HTTPExceptions (validation errors)
        raise
    except Exception as exc:
        logger.error(f"Unexpected error during analysis: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error") from exc
    finally:
        file.file.close()
        # Cleanup temporary directory
        try:
            shutil.rmtree(temp_dir)
            logger.debug(f"Cleaned up temp directory: {temp_dir}")
        except Exception as exc:
            logger.warning(f"Failed to cleanup temp directory {temp_dir}: {exc}")

    return {
        "msg": "success",
        "results": results,
    }
