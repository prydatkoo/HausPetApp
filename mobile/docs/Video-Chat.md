# Video Chat & AI

Goal
- Show your dog to the assistant for quick visual guidance

Implementation
- Screen: `src/screens/video/VideoCallScreen.tsx`
- Permissions via `expo-camera`
- Capture photo → send to AI service (text reply)
- Hangup button returns to previous screen or Home

Future Enhancements
- Live WebRTC (Agora/Twilio) for real-time video
- Stream frames to vision model for continuous analysis
- In-call captions and vet handoff
