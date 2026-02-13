# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**hear_bird** (问题鸟) is a bird sound identification app with two components:
- **hear_bird_backend/** - Python/FastAPI backend using BirdNET AI for audio analysis
- **hear_bird_web/** - React 19 + TypeScript frontend with Vite, mobile-ready via Capacitor

The app records or uploads audio files, sends them to the backend for BirdNET analysis, and displays identified bird species with confidence scores and descriptions.

## Commands

### Backend (hear_bird_backend/)
```bash
# Setup
cd hear_bird_backend
pip install -r requirements.txt

# Run development server (with auto-reload)
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Run production server
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Requirements**: Python >= 3.12, birdnet-analyzer, FastAPI, Uvicorn

### Frontend (hear_bird_web/)
```bash
# Setup
cd hear_bird_web
npm install

# Development server (localhost:3000)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Android Mobile Build
See README.md for full Capacitor + Android Studio build instructions.

## Architecture

### Request Flow
```
User (HomeView) → Record/Upload Audio → MediaRecorder API
→ POST /analyze with FormData → Backend saves temp file
→ birdnet_analyzer subprocess → CSV output
→ Parse CSV, normalize headers → JSON response
→ Frontend matches BIRD_DB by scientificName → Display results
```

### Backend Key Files
- **main.py** - Single-file FastAPI app with `/analyze` endpoint
  - `_run_birdnet_analyzer()`: Executes birdnet_analyzer as subprocess
  - `_normalize_header()`: Converts CSV headers like "Start (s)" → "start", "Common Name" → "commonName"
  - `_read_csv_rows()`: Parses CSV, filters "file" column, normalizes all keys
  - CSV filtering: Excludes "analysis_params" files, prefers "test*" prefixed files

### Frontend Key Files
- **App.tsx** - View router (home/results), state management for analysis results
- **components/HomeView.tsx** - Recording UI with MediaRecorder, file upload handler
- **components/ResultsScreen.tsx** - Results display with BIRD_DB enrichment
- **components/Visualizer.tsx** - Audio visualization
- **services/birdService.ts** - API client with fallback to MOCK_RESULTS_FALLBACK on error
- **types.ts** - TypeScript interfaces (BirdResult, ApiResponse, BirdData, BirdDatabase)
- **constants.ts** - API_URL, BIRD_DB (hardcoded bird species data), PLACEHOLDER_BIRD, MOCK_RESULTS_FALLBACK

## Configuration

### API_URL
Must be updated in `hear_bird_web/constants.ts` for deployment:
- Local dev: `http://localhost:8000/analyze`
- LAN: `http://192.168.x.x:8000/analyze`
- Public: `https://your-domain.com/analyze`

### CORS
Backend currently allows all origins (`allow_origins=["*"]`). Restrict for production.

## Code Style

### Python
- Functions: `snake_case`, private functions prefixed with `_`
- Type hints required: `def foo(x: str) -> str:`
- Use `Optional[float]` for nullable params
- Use `list[dict[str, str]]` for modern generics (Python 3.9+)
- Raise `HTTPException` for API errors, `RuntimeError` for internal failures

### TypeScript
- Components: `PascalCase` with named exports: `export const HomeView: React.FC = () => {}`
- Hooks/funcs: `camelCase`
- Interfaces: `PascalCase` (BirdResult, ApiResponse)
- Constants: `UPPER_SNAKE_CASE` (API_URL, BIRD_DB)
- No `any` types - use proper interfaces from `types.ts`
- Import order: React → components → services → types

### React Patterns
- Functional components with hooks
- `useMemo` for expensive computations
- Cleanup functions in `useEffect` (e.g., stopping media streams)
- Tailwind CSS for styling (no CSS modules)

## Data Flow Notes

1. Backend returns results with `scientificName` as key
2. Frontend `ResultsScreen` uses `useMemo` to join API results with `BIRD_DB` by `scientificName`
3. Unmatched species get `PLACEHOLDER_BIRD` image and generic description
4. `birdService.ts` has automatic fallback to mock data on API failure (for demo purposes)

## Known Limitations

- No test frameworks (add pytest for backend, Vitest for frontend)
- Temp files not cleaned up after analysis
- BIRD_DB is hardcoded (should be external API/database)
- TypeScript strict mode not fully enabled
