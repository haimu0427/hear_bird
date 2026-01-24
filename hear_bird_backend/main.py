import csv
import glob
import os
import re
import shutil
import subprocess
import sys
import tempfile
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _run_birdnet_analyzer(
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

    result = subprocess.run(
        command,
        capture_output=True,
        text=True,
    )
    
    print(f"Command output: {result.stdout}")  # 打印命令输出
    print(f"Command error: {result.stderr}")   # 打印错误输出
    
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or "BirdNET analysis failed")

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


@app.post("/analyze")
def analyze_audio(
    file: UploadFile = File(...),
    lat: Optional[float] = Form(None),
    lon: Optional[float] = Form(None),
):

    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing audio filename")

    temp_dir = tempfile.mkdtemp(prefix="birdnet_", dir=os.getcwd())
    audio_path = os.path.join(temp_dir, file.filename)

    try:
        with open(audio_path, "wb") as audio_handle:
            shutil.copyfileobj(file.file, audio_handle)
            print(f"Audio file saved at {audio_path}")

        csv_path = _run_birdnet_analyzer(audio_path, temp_dir, lat, lon)
        results = _read_csv_rows(csv_path)
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        file.file.close()

    return {
        "msg": "success",
        "results": results,
    }
