# HausPet — Smart Pet Care Platform

Comprehensive pet health monitoring and location tracking system with smart collar integration.

## 📁 Repository Structure

```
HausPetApp/
├── mobile/          # React Native mobile app (Expo)
├── backend/         # AI server & API (Python/Flask)
└── docs/            # Shared documentation
```

## 🚀 Quick Start

### Mobile App
```bash
cd mobile
npm install
npx expo start
```

### Backend Server
```bash
cd backend/ai-server
pip install -r requirements.txt
python app.py
```

## 📱 Mobile App

- **Framework**: React Native (Expo SDK 53)
- **Language**: TypeScript
- **State**: Redux Toolkit
- **Navigation**: React Navigation

**Features:**
- Real-time health dashboard
- GPS tracking with live simulation
- AI chatbot (text + voice)
- Video call with AI analysis
- Pet management & profiles

[→ Mobile Documentation](./mobile/docs/)

## 🔧 Backend

- **Framework**: Flask (Python)
- **AI**: OpenAI GPT integration
- **Database**: PostgreSQL (production), JSON (dev)

**APIs:**
- `/api/v1/auth/*` — Authentication
- `/api/v1/pets/*` — Pet management
- `/api/v1/ai/*` — AI chat & analysis
- `/api/v1/community/*` — Social features

[→ Backend Documentation](./backend/ai-server/README.md)

## 🏗 Architecture

### Mobile
- **Screens**: Dashboard, Health, Map, Chat, Settings
- **Components**: Modular UI with Avatar, Widgets, Graphs
- **Store**: Redux slices for auth, pets, health, location
- **Services**: API clients with retry & fallback logic

### Backend
- RESTful API with JWT auth
- AI-powered health analysis
- Real-time location processing
- Image analysis via OpenAI Vision

## 📚 Documentation

- [Mobile Setup Guide](./mobile/docs/Setup.md)
- [Architecture Overview](./mobile/docs/Architecture.md)
- [API Integration](./mobile/docs/API.md)
- [Features & UX](./mobile/docs/Features.md)

## 🔐 Environment Setup

### Mobile
Demo mode works without env vars. For production:
```env
# mobile/.env (optional)
EXPO_PUBLIC_API_URL=https://your-api.com
```

### Backend
```env
# backend/ai-server/.env
OPENAI_API_KEY=your_key
DATABASE_URL=postgresql://...
```

## 🧪 Development

### Mobile
```bash
cd mobile
npm start              # Expo dev server
npm run type-check     # TypeScript
```

### Backend
```bash
cd backend/ai-server
python app.py          # Local server
pytest                 # Run tests
```

## 📦 Deployment

### Mobile
- **Expo EAS**: `eas build --platform all`
- **App Store/Play Store**: Follow Expo guides

### Backend
- **Railway/Vercel**: Auto-deploy from `backend/` folder
- **Docker**: See `backend/Dockerfile`

## 🛠 Tech Stack

**Mobile:**
- React Native, TypeScript, Redux Toolkit
- Expo (Camera, Location, Audio, Maps)
- React Navigation, Expo Secure Store

**Backend:**
- Python, Flask, PostgreSQL
- OpenAI API, JWT, SQLAlchemy

## 📄 License

MIT License — See LICENSE file

## 🆘 Support

- Documentation: [mobile/docs/](./mobile/docs/)
- Issues: GitHub Issues
- Email: info@hauspet.net

---

**HausPet** — Keeping pets safe, healthy, and happy 🐾
