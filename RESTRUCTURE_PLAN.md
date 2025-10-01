# Project Restructure Plan

## Current Issues
- Nested `HausPetApp/HausPetApp/` folders (confusing)
- Backend server (`ai-server/`) mixed with mobile app
- Duplicate/scattered config files
- iOS folder at wrong level (should be git-ignored, Expo-managed)

## Target Structure
```
HausPetApp/                    # Root repo
├── mobile/                    # React Native app (renamed from HausPetApp)
│   ├── src/
│   ├── assets/
│   ├── docs/
│   ├── App.tsx
│   ├── package.json
│   ├── app.json
│   └── README.md
├── backend/                   # Move ai-server here
│   └── (ai-server contents)
├── .gitignore                 # Root gitignore
└── README.md                  # Root overview
```

## Steps (Safe, Non-Breaking)
1. ✅ Document current structure
2. Create clean `mobile/` folder at root
3. Move essential app files from `HausPetApp/HausPetApp/` to `mobile/`
4. Move `ai-server/` to `backend/`
5. Update all import paths if needed
6. Clean up old nested folders
7. Update root README with monorepo structure

## What to Keep
- `/mobile/src/` — all app source
- `/mobile/assets/` — images, fonts
- `/mobile/docs/` — Notion docs
- `/mobile/package.json` — dependencies
- `/mobile/App.tsx`, `app.json`, `tsconfig.json`, `babel.config.js`

## What to Remove/Consolidate
- Nested `HausPetApp/HausPetApp/` structure
- Duplicate deployment scripts (keep in backend)
- `ios/` folder (Expo regenerates, should be in .gitignore)
- Old markdown guides (consolidate to docs/)
