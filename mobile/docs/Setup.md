# Setup & Running

Prereqs
- Node 18+
- npm 10+
- Xcode (iOS) and/or Android Studio (Android)
- Expo CLI (`npx expo`)

Install
```bash
cd HausPetApp/HausPetApp
npm install
```

Run (dev)
```bash
npx expo start
```

Preferred quick run
```bash
cd HausPetApp && npx expo run
```

Troubleshooting
- Clear cache: `npx expo start --clear`
- Update Expo packages to suggested patch versions if warned
- iOS language for maps uses system; Android uses Google provider for English labels
