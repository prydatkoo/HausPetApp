# State & Navigation

Redux Slices (high-level)
- `authSlice`: user, token, guest mode, initializeAuth
- `petsSlice`: pets list, selectedPet, optimistic `updatePetLocally`
- `healthSlice`: current health data map by petId
- `locationSlice`: current locations + history
- `notificationsSlice`: list + unread count
- `uiSlice`: `approvedHealthWidgets`, toasts, modals
- `healthAlertSlice`: health alerts per pet

Selectors
- `useAppSelector(state => state.pets.selectedPet)`

Navigation
- Root: `AppNavigator.tsx` with conditional stacks
- Tabs: `TabNavigator.tsx` (Map, Health, Home, Chat, Settings)
- Important routes: `Subscription`, `AIDetail`, `VideoCall`, `AddPet`, `PetDetails`

Patterns
- Navigate to nested tab via `navigation.navigate('Main', { screen: 'Chat' })`
- For modals, set `presentation` on the stack route
