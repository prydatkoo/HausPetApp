# Architecture

Layers
- Screens: User-facing pages under `src/screens/*`
- Components: Reusable UI under `src/components/*`
- Store: Redux Toolkit slices in `src/store/slices/*`
- Services: API clients in `src/services/api/*`
- Navigation: Stacks/tabs in `src/navigation/*`
- Constants/Types: App config and TS types

Key Modules
- `apiClient.ts`: Base fetch with auth header, 5xx retry, dev-friendly 404 logs
- `authService.ts`: Login/register with demo fallback on 5xx + token storage
- `communityService.ts`: AI chat/text API
- Slices: `authSlice`, `petsSlice`, `healthSlice`, `locationSlice`, `notificationsSlice`, `uiSlice`, `healthAlertSlice`

Navigation
- Root stack in `AppNavigator.tsx`
- Bottom tabs in `TabNavigator.tsx` (Map, Health, Home, Chat, Settings)
- Guest mode registers `Subscription`, `AIDetail`, `VideoCall` so CTA works without auth
