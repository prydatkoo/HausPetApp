# HausPet Mobile App

React Native mobile companion for the HausPet smart collar.

## 📱 Quick Start

```bash
cd mobile
npm install
npx expo start
```

Press `i` for iOS or `a` for Android.

## 📚 Documentation

See [`docs/`](./docs/) for complete Notion-ready documentation:
- [Overview](./docs/Overview.md)
- [Setup](./docs/Setup.md)
- [Architecture](./docs/Architecture.md)
- [State & Navigation](./docs/State-and-Navigation.md)
- [API Integration](./docs/API.md)
- [Features](./docs/Features.md)
- [Cleanup Checklist](./docs/Cleanup-Checklist.md)

## 🛠 Tech Stack

- React Native (Expo SDK 53)
- TypeScript
- Redux Toolkit
- React Navigation
- Expo Camera, Location, Audio

## 🏗 Structure

```
mobile/
├── src/
│   ├── components/       # Reusable UI
│   ├── screens/         # App screens
│   ├── navigation/      # Routes & stacks
│   ├── store/           # Redux slices
│   ├── services/        # API clients
│   ├── constants/       # Config & constants
│   ├── types/           # TypeScript types
│   └── utils/           # Helpers
├── assets/              # Images, fonts
├── docs/                # Documentation
└── App.tsx              # Entry point
```

## 🚀 Key Features

- Pet health monitoring (steps, heart rate, temp)
- GPS tracking with Berlin demo paths
- AI chatbot (text + voice)
- Video call with AI analysis
- Dashboard widgets from AI confirmations

## 🔧 Scripts

```bash
npm start          # Start Expo dev server
npm run type-check # Run TypeScript check
npm run lint       # Run linter
```

## 📦 Environment

No `.env` required for demo mode. Backend uses mock/demo tokens when server is unavailable.
