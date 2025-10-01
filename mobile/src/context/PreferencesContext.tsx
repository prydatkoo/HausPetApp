import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';

type AppPreferences = {
  darkMode: boolean;
  notifications: {
    healthAlerts: boolean;
    locationAlerts: boolean;
  };
  biometricEnabled: boolean;
};

type PreferencesContextType = {
  prefs: AppPreferences;
  setDarkMode: (value: boolean) => void;
  setHealthAlerts: (value: boolean) => void;
  setLocationAlerts: (value: boolean) => void;
  setBiometricEnabled: (value: boolean) => void;
};

const defaultPrefs: AppPreferences = {
  darkMode: false,
  notifications: { healthAlerts: true, locationAlerts: true },
  biometricEnabled: false,
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prefs, setPrefs] = useState<AppPreferences>(defaultPrefs);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEYS.APP_PREFERENCES);
        if (saved) setPrefs(JSON.parse(saved));
      } catch {}
    })();
  }, []);

  const persist = async (next: AppPreferences) => {
    setPrefs(next);
    try { await AsyncStorage.setItem(STORAGE_KEYS.APP_PREFERENCES, JSON.stringify(next)); } catch {}
  };

  const value = useMemo<PreferencesContextType>(() => ({
    prefs,
    setDarkMode: (value) => persist({ ...prefs, darkMode: value }),
    setHealthAlerts: (value) => persist({ ...prefs, notifications: { ...prefs.notifications, healthAlerts: value } }),
    setLocationAlerts: (value) => persist({ ...prefs, notifications: { ...prefs.notifications, locationAlerts: value } }),
    setBiometricEnabled: (value) => persist({ ...prefs, biometricEnabled: value }),
  }), [prefs]);

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = (): PreferencesContextType => {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider');
  return ctx;
};


