# Migration Guide — Clean Structure

## ✅ What Changed

**OLD Structure (confusing):**
```
HausPetApp/
├── HausPetApp/          # Nested folder (confusing!)
│   ├── src/
│   ├── ai-server/       # Backend mixed with mobile
│   ├── ios/             # Should be gitignored
│   └── ...
└── src/                 # Duplicate? Unused?
```

**NEW Structure (clean):**
```
HausPetApp/
├── mobile/              # React Native app
│   ├── src/
│   ├── docs/
│   ├── assets/
│   └── package.json
├── backend/             # Backend API
│   └── ai-server/
└── README.md            # Root overview
```

## 🚀 How to Use

### Running Mobile App
```bash
cd mobile
npm install
npx expo start
```

### Running Backend
```bash
cd backend/ai-server
pip install -r requirements.txt
python app.py
```

## 📝 What Was Removed

From old `HausPetApp/HausPetApp/`:
- ❌ Duplicate deployment scripts (moved to backend)
- ❌ `ios/` folder (Expo regenerates, now gitignored)
- ❌ Old markdown guides (consolidated to docs/)
- ❌ Nested structure confusion

## 🔄 Migration Steps (if you pulled old repo)

1. **Clone fresh** or pull latest
2. **Delete old nested folder:**
   ```bash
   rm -rf HausPetApp/HausPetApp
   rm -rf HausPetApp/src  # if exists
   ```
3. **Install mobile:**
   ```bash
   cd mobile && npm install
   ```
4. **Install backend:**
   ```bash
   cd backend/ai-server && pip install -r requirements.txt
   ```

## ✨ Benefits

- Clear separation: `mobile/` and `backend/`
- No nested confusion
- Proper gitignore for build artifacts
- Monorepo-ready structure
- Easy to navigate and document
