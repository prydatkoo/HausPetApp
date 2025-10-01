import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme, Theme } from '@react-navigation/native';
import { PreferencesProvider, usePreferences } from '../context/PreferencesContext';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSelector, useAppDispatch } from '../store';
import { setInitialized, initializeAuth } from '../store/slices/authSlice';
// import AuthService from '../services/api/authService';
import { RootStackParamList } from '../types';

// Screens
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';

// Individual screens

import HealthDetailScreen from '../screens/health/HealthDetailScreen';
import LocationDetailScreen from '../screens/location/LocationDetailScreen';
import AppointmentScreen from '../screens/health/AppointmentScreen';
import EmergencyModeScreen from '../screens/location/EmergencyModeScreen';
import CollarSettingsScreen from '../screens/settings/CollarSettingsScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import SubscriptionScreen from '../screens/settings/SubscriptionScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import AddPetScreen from '../screens/pets/AddPetScreen';
import PetDetailsScreen from '../screens/pets/PetDetailsScreen';
// // EditPetScreen removed due to persistent errors // Temporarily disabled
import EditPetScreen from '../screens/pets/EditPetScreen';
import AIDetailScreen from '../screens/health/AIDetailScreen';
import VideoCallScreen from '../screens/video/VideoCallScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppStack: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isInitialized, isGuest } = useAppSelector(state => state.auth);
  const { isOnboardingCompleted } = useAppSelector(state => state.ui);
  const { prefs } = usePreferences();

  useEffect(() => {
    // Initialize app - check for stored auth token, etc.
    const initializeApp = async () => {
      await dispatch(initializeAuth());
      dispatch(setInitialized());
    };

    initializeApp();
  }, [dispatch]);

  if (!isInitialized) {
    // Show splash screen or loading indicator
    return null;
  }

  const navTheme: Theme = prefs.darkMode ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isGuest ? (
          <Stack.Group>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen 
              name="Subscription" 
              component={SubscriptionScreen}
              options={{ headerShown: true, title: 'Subscription', presentation: 'modal' }}
            />
            <Stack.Screen 
              name="AIDetail" 
              component={AIDetailScreen}
              options={{ headerShown: true, title: 'Dr. HausPet Analysis', presentation: 'modal' }}
            />
            <Stack.Screen 
              name="VideoCall" 
              component={VideoCallScreen}
              options={{ headerShown: true, title: 'Video Call', presentation: 'fullScreenModal' }}
            />
          </Stack.Group>
        ) : isAuthenticated ? (
          <Stack.Group>
            <Stack.Screen 
              name="Main" 
              component={TabNavigator}
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen 
              name="HealthDetail" 
              component={HealthDetailScreen}
              options={{
                headerShown: true,
                title: 'Health Details',
              }}
            />
            <Stack.Screen 
              name="LocationDetail" 
              component={LocationDetailScreen}
              options={{
                headerShown: true,
                title: 'Location Tracking',
              }}
            />
            <Stack.Screen 
              name="Appointment" 
              component={AppointmentScreen}
              options={{
                headerShown: true,
                title: 'Appointment',
                presentation: 'modal',
              }}
            />
            <Stack.Screen 
              name="EmergencyMode" 
              component={EmergencyModeScreen}
              options={{
                headerShown: true,
                title: 'Emergency Mode',
                presentation: 'fullScreenModal',
              }}
            />
            <Stack.Screen 
              name="CollarSettings" 
              component={CollarSettingsScreen}
              options={{
                headerShown: true,
                title: 'Collar Settings',
                presentation: 'modal',
              }}
            />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen}
              options={{
                headerShown: true,
                title: 'Profile',
                presentation: 'modal',
              }}
            />
            <Stack.Screen 
              name="Notifications" 
              component={NotificationsScreen}
              options={{
                headerShown: true,
                title: 'Notifications',
              }}
            />
            <Stack.Screen 
              name="AddPet" 
              component={AddPetScreen}
              options={{
                headerShown: false,
                presentation: 'modal',
              }}
            />
            <Stack.Screen 
              name="PetDetails" 
              component={PetDetailsScreen}
              options={{
                headerShown: true,
                title: 'Pet Details',
              }}
            />
            <Stack.Screen 
              name="EditPet"
              component={EditPetScreen}
              options={{
                headerShown: true,
                title: 'Edit Pet',
                presentation: 'modal',
              }}
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen}
              options={{
                headerShown: true,
                title: 'Settings',
              }}
            />
            <Stack.Screen 
              name="Subscription" 
              component={SubscriptionScreen}
              options={{
                headerShown: true,
                title: 'Subscription',
                presentation: 'modal',
              }}
            />
            <Stack.Screen 
              name="AIDetail" 
              component={AIDetailScreen}
              options={{
                headerShown: true,
                title: 'Dr. HausPet Analysis',
                presentation: 'modal',
              }}
            />
            <Stack.Screen 
              name="VideoCall" 
              component={VideoCallScreen}
              options={{
                headerShown: true,
                title: 'Video Call',
                presentation: 'fullScreenModal',
              }}
            />
          </Stack.Group>
        ) : (
          <Stack.Screen 
            name="Auth" 
            component={AuthNavigator}
            options={{ gestureEnabled: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const AppNavigator: React.FC = () => (
  <PreferencesProvider>
    <AppStack />
  </PreferencesProvider>
);

export default AppNavigator;