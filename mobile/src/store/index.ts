import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authSlice from './slices/authSlice';
import petsSlice from './slices/petsSlice';
import healthSlice from './slices/healthSlice';
import locationSlice from './slices/locationSlice';
import notificationsSlice from './slices/notificationsSlice';
import collarSlice from './slices/collarSlice';
import communitySlice from './slices/communitySlice';
import uiSlice from './slices/uiSlice';
import healthAlertSlice from './slices/healthAlertSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    pets: petsSlice,
    health: healthSlice,
    location: locationSlice,
    notifications: notificationsSlice,
    collar: collarSlice,
    community: communitySlice,
    ui: uiSlice,
    healthAlerts: healthAlertSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['register'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;