# Cleanup Checklist

## Unused Screens (safe to remove)
- [ ] `src/screens/community/CommunityScreen.tsx` — not imported anywhere
- [ ] `src/screens/location/LocationScreen.tsx` — not imported anywhere
- [ ] `src/screens/pets/SitterDetailScreen.tsx` — not imported anywhere

## Empty Folders (safe to remove)
- [ ] `src/components/forms/` — empty
- [ ] `src/components/ui/` — empty
- [ ] `src/hooks/` — empty
- [ ] `src/services/bluetooth/` — empty
- [ ] `src/services/location/firebase/` — empty parent
- [ ] `src/services/notifications/` — empty

## Unused Services & Slices (review before removing)
- [ ] `src/services/api/collarService.ts` — only used in `collarSlice`, no UI consumers
- [ ] `src/store/slices/collarSlice.ts` — registered in store but no `useAppSelector(state => state.collar)` usage found
- [ ] `src/store/slices/communitySlice.ts` — only used in `PetSittersScreen` (which shows "In the works")

## Lightly Used Utils (consider consolidating)
- [ ] `src/utils/getPetIcon.ts` — only used in `DashboardScreen`, could inline or keep if expanding
- [ ] `src/utils/petEmojis.ts` — check if referenced

## Config & Constants Cleanup
- [ ] `src/config/production.ts` — verify if used, may be legacy
- [ ] `src/constants/breeds.json` vs `breeds.ts` — consolidate to one source

## Recommendations
1. Remove unused screens and empty folders first (non-breaking)
2. Review collar/community slices: remove if truly unused, or add placeholder UI to Settings if keeping for future
3. Consolidate breed constants into one file
4. Add header docblocks to remaining core modules for readability
