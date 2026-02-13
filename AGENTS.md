# AGENTS.md - Development Guide for AI Coding Agents

## Project Overview

**hear_bird** is a monorepo with two main components:
- **hear_bird_backend**: Python/FastAPI backend for bird sound analysis using BirdNET
- **hear_bird_web**: React/TypeScript frontend with Vite, mobile-ready with Capacitor

## Build, Test, and Run Commands

### Backend (hear_bird_backend/)

**Setup:**
```bash
cd hear_bird_backend
pip install -r requirements.txt
```

**Run Development Server:**
```bash
cd hear_bird_backend
uvicorn main:app --host 0.0.0.0 --port 8000
# Or with auto-reload for development:
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Requirements:**
- Python >= 3.12
- Dependencies: FastAPI, Uvicorn, birdnet-analyzer

**No test framework configured** - Add pytest if needed

### Frontend (hear_bird_web/)

**Setup:**
```bash
cd hear_bird_web
npm install
```

**Available Scripts:**
```bash
npm run dev       # Start development server (localhost:3000)
npm run build     # Production build
npm run preview   # Preview production build
```

**No test framework configured** - Add Vitest or Jest if needed

**Running Single Tests:**
Not applicable yet - test framework not configured.

### Mobile App Build (Android)

See README.md for full Capacitor Android build instructions.

## Project Structure

### Backend Structure
```
hear_bird_backend/
├── main.py              # FastAPI app, CORS config, /analyze endpoint
└── requirements.txt     # Python dependencies
```

### Frontend Structure
```
hear_bird_web/
├── App.tsx              # Root component, view routing
├── index.tsx            # React entry point
├── types.ts             # TypeScript interfaces
├── constants.ts         # API_URL, BIRD_DB, mock data
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
├── components/
│   ├── HomeView.tsx     # Home screen with recording UI
│   ├── ResultsScreen.tsx # Results display screen
│   └── Visualizer.tsx   # Audio visualization component
└── services/
    └── birdService.ts   # API client for bird analysis
```

## Code Style Guidelines

### Python Backend (hear_bird_backend/)

**Import Organization:**
```python
# Standard library imports first
import csv
import glob
import os
import re
import shutil

# Third-party imports
from fastapi import FastAPI, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
```

**Naming Conventions:**
- Functions: `snake_case` (e.g., `_run_birdnet_analyzer`, `_normalize_header`)
- Private/internal functions: prefix with `_` (e.g., `_read_csv_rows`)
- Variables: `snake_case` (e.g., `audio_path`, `csv_candidates`)
- Constants: `UPPER_SNAKE_CASE` (not present in current code, but standard)

**Type Hints:**
- Use type hints for function parameters and return types
- Example: `def _run_birdnet_analyzer(audio_path: str, output_dir: str, lat: Optional[float], lon: Optional[float]) -> str:`
- Use `Optional[T]` for nullable types
- Use `list[dict[str, str]]` for modern generic types (Python 3.9+)

**Error Handling:**
- Use try/except blocks for external operations (file I/O, subprocess calls)
- Raise `HTTPException` for API errors with appropriate status codes
- Use `RuntimeError` for internal processing failures
- Always use `finally` blocks for cleanup (e.g., closing file handles)

**Async/Await:**
- Not used in current codebase - synchronous endpoints only
- FastAPI supports async, but current implementation is sync

**Documentation:**
- Minimal inline comments in current code
- Add docstrings for complex functions
- Use print statements for debugging (seen in current code)

### TypeScript/React Frontend (hear_bird_web/)

**Import Organization:**
```typescript
// React imports first
import React, { useState, useEffect, useRef } from 'react';

// Component imports
import { HomeView } from './components/HomeView';
import { ResultsScreen } from './components/ResultsScreen';

// Service imports
import { analyzeAudio } from './services/birdService';

// Type imports
import { ApiResponse, BirdResult } from './types';
```

**Naming Conventions:**
- Components: `PascalCase` with `.tsx` extension (e.g., `HomeView.tsx`, `ResultsScreen.tsx`)
- Component files: Named exports matching component name
- Hooks/functions: `camelCase` (e.g., `handleFileSelect`, `startRecording`)
- Interfaces/Types: `PascalCase` (e.g., `BirdResult`, `ApiResponse`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `API_URL`, `BIRD_DB`, `PLACEHOLDER_BIRD`)
- CSS classes: `kebab-case` or Tailwind utility classes

**Type Definitions:**
- Define interfaces in `types.ts` for shared types
- Use `interface` for object shapes, `type` for unions/aliases
- Explicit type annotations for function parameters
- Example: `const handleFileSelect = async (file: File) => { ... }`

**Component Patterns:**
- Functional components with TypeScript: `const Component: React.FC<Props> = ({ prop1, prop2 }) => { ... }`
- Props interfaces defined above component: `interface ComponentProps { ... }`
- Use `useState`, `useEffect`, `useRef`, `useMemo` hooks
- Export components as named exports: `export const HomeView: React.FC<Props> = ...`

**State Management:**
- useState for local component state
- Props drilling for parent-child communication (no global state library currently)
- Hooks pattern: declare all hooks at top of component

**Error Handling:**
- Try/catch blocks for async operations
- Console.error for logging errors
- Alert/UI feedback for user-facing errors
- Example pattern in `birdService.ts`: fallback to mock data on API failure

**Async/Await:**
- Use async/await for all asynchronous operations
- Handle promises with try/catch
- Example: `const data = await analyzeAudio(file);`

**TypeScript Configuration:**
- Target: ES2022
- Module: ESNext
- JSX: react-jsx (new JSX transform)
- Path alias: `@/*` maps to project root
- Strict mode: Not fully enabled (consider enabling `strict: true`)

**Styling:**
- Tailwind CSS utility classes exclusively
- Custom classes defined in index.html (bg-surface-dark, bg-primary, etc.)
- Responsive: Use `min-h-[100dvh]` for mobile viewport
- Dark mode: Classes prefixed with `dark:`
- No CSS modules or styled-components

**Best Practices:**
- Keep components focused and single-responsibility
- Extract reusable logic into custom hooks or utility functions
- Use TypeScript's type system - avoid `any`
- Prefer const over let
- Use optional chaining: `dbEntry?.coverImageCenterX ?? 0.5`
- Clean up effects: return cleanup functions in useEffect
- Handle edge cases (no results, API failures, permission denials)

## Configuration Files

### tsconfig.json
- Module resolution: bundler
- Experimental decorators: enabled
- Path aliases: `@/*` → project root
- JSX: react-jsx

### vite.config.ts
- Dev server: port 3000, host 0.0.0.0
- Alias: `@` → project root
- Environment variables: GEMINI_API_KEY exposed as process.env
- Plugin: @vitejs/plugin-react

## API Integration

**Backend Endpoint:**
- POST `/analyze` - Accepts audio file, optional lat/lon coordinates
- Returns: `{ msg: string, results: BirdResult[] }`

**Frontend Constants:**
- `API_URL` in `constants.ts` must be updated for deployment
- Default: `http://localhost:8000/analyze`
- Change for LAN/public deployment

**Error Handling Pattern:**
```typescript
try {
  const data = await analyzeAudio(file);
  // Handle success
} catch (error) {
  console.error("Analysis failed", error);
  // Fallback or user feedback
}
```

## Git Commit Style

Based on recent commits:
- Use Chinese or English (project uses Chinese in README)
- Descriptive, concise messages
- Example: "增加开发文档" (Add development documentation)
- Initialize commits: "Initialize hear_bird web and backend"

## Mobile Development Notes

- Capacitor for Android build
- Requires Android Studio
- Permissions needed: RECORD_AUDIO, MODIFY_AUDIO_SETTINGS
- Mixed content mode enabled for local debugging
- See README.md for full build process

## Common Pitfalls

1. **Backend URL**: Update `constants.ts` API_URL before deployment
2. **Python Version**: Requires Python >= 3.12 (BirdNET dependency)
3. **Audio Format**: Backend accepts any audio format that BirdNET supports
4. **CORS**: Backend allows all origins - restrict for production
5. **Type Safety**: No `any` types - use proper TypeScript types
6. **Error Boundaries**: Not implemented - consider adding for production
7. **Testing**: No test framework configured - add before production

## Future Improvements

- Add test frameworks (pytest for backend, Vitest for frontend)
- Add ESLint/Prettier configuration
- Enable TypeScript strict mode
- Add error boundaries in React
- Restrict CORS origins in production
- Add environment variable validation
- Add logging framework (replace print statements)
- Add API documentation (Swagger/OpenAPI)
