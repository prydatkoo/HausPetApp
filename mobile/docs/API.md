# API Integration

Base Client: `src/services/api/apiClient.ts`
- Adds `Authorization: Bearer <token>` from SecureStore
- Dev-friendly 404 logs for expected missing resources
- Retries transient 5xx errors with backoff
- Demo token attached for AI/community endpoints when no auth token (so AI chat works as guest)

Auth: `authService.ts`
- Stores token on login/register
- Demo fallback user on 5xx (server down) to keep app usable

Community/AI: `communityService.ts`
- `sendChatMessage(message, petId)` → `{ response, context_used, condition_detected }`

Pets: `petService.ts`
- CRUD using `/api/v1/pets`
- Optimistic updates with `updatePetLocally`

Endpoints: see `src/constants/index.ts` under `API_ENDPOINTS`
