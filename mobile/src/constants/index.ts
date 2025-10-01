// Constants and configuration for HausPet app
import { Theme } from '../types';

// App Configuration
export const APP_CONFIG = {
  name: 'HausPet',
  version: '1.0.0',
  apiBaseUrl: process.env.EXPO_PUBLIC_API_URL || 'https://ai-server-hauspet-dsjlm9yjw-hauspets-projects.vercel.app',
  websiteUrl: 'https://hauspet.net',
  supportEmail: 'support@hauspet.net',
  privacyPolicyUrl: 'https://hauspet.net/privacy',
  termsOfServiceUrl: 'https://hauspet.net/terms',
};

// Firebase Configuration
export const FIREBASE_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Location Configuration
export const LOCATION_CONFIG = {
  accuracy: 'high' as const,
  updateInterval: 30000, // 30 seconds
  fastestInterval: 10000, // 10 seconds
  maxWaitTime: 60000, // 1 minute
  geofenceRadius: 100, // meters
  lostPetUpdateInterval: 5000, // 5 seconds for lost pet mode
};

// Bluetooth Configuration
export const BLUETOOTH_CONFIG = {
  scanTimeout: 10000,
  connectionTimeout: 15000,
  deviceName: 'HausPet-Collar',
  serviceUUID: '6E400001-B5A3-F393-E0A9-E50E24DCCA9E',
  characteristicUUID: '6E400002-B5A3-F393-E0A9-E50E24DCCA9E',
};

// Health Monitoring Thresholds
export const HEALTH_THRESHOLDS = {
  dog: {
    heartRate: { min: 70, max: 120, critical: 150 },
    temperature: { min: 38.0, max: 39.2, critical: 40.0 },
    activityLevel: { min: 30, max: 80, critical: 90 },
  },
  cat: {
    heartRate: { min: 140, max: 200, critical: 240 },
    temperature: { min: 38.0, max: 39.5, critical: 40.5 },
    activityLevel: { min: 20, max: 70, critical: 85 },
  },
};

// Pet Species Options
export const PET_SPECIES = [
  { label: 'Dog', value: 'dog' },
  { label: 'Other', value: 'other' },
];

// Pet Breeds (simplified list)
export const DOG_BREEDS = [
  'Golden Retriever', 'Labrador Retriever', 'German Shepherd', 'Bulldog',
  'Poodle', 'Beagle', 'Rottweiler', 'Yorkshire Terrier', 'Boxer', 'Siberian Husky',
  'Chihuahua', 'Shih Tzu', 'Boston Terrier', 'Pomeranian', 'Border Collie',
  'Australian Shepherd', 'Dachshund', 'Maltese', 'Cocker Spaniel',
  'Goldendoodle', 'Labradoodle', 'Cockapoo', 'Maltipoo', 'Cavapoo', 'Bernedoodle',
  'Mixed Breed',
];

export const CAT_BREEDS = [
  'Persian', 'Maine Coon', 'Siamese', 'Ragdoll', 'British Shorthair',
  'Abyssinian', 'Russian Blue', 'Bengal', 'Scottish Fold', 'Sphynx',
  'American Shorthair', 'Birman', 'Oriental Shorthair', 'Burmese', 'Mixed Breed',
];

// Notification Types
export const NOTIFICATION_TYPES = {
  HEALTH_ALERT: 'health',
  LOCATION_ALERT: 'location',
  BATTERY_LOW: 'battery',
  COLLAR_DISCONNECTED: 'collar',
  APPOINTMENT_REMINDER: 'appointment',
  SOCIAL_UPDATE: 'social',
} as const;

// Theme Configuration
export const LIGHT_THEME: Theme = {
  colors: {
    primary: '#2E7D5A',
    secondary: '#4A90A4',
    accent: '#FF6B6B',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    error: '#FF4444',
    warning: '#FFA726',
    success: '#4CAF50',
    text: '#212121',
    textSecondary: '#757575',
    border: '#E0E0E0',
    shadow: '#000000',
  },
  fonts: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 24,
      xxl: 32,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
};

export const DARK_THEME: Theme = {
  ...LIGHT_THEME,
  colors: {
    primary: '#4A9B7A',
    secondary: '#6BAAC2',
    accent: '#FF8A80',
    background: '#121212',
    surface: '#1E1E1E',
    error: '#CF6679',
    warning: '#FFB74D',
    success: '#81C784',
    text: '#FFFFFF',
    textSecondary: '#B3B3B3',
    border: '#2C2C2C',
    shadow: '#000000',
  },
};

// Animation Durations
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
};

// Map Configuration
export const MAP_CONFIG = {
  defaultRegion: {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.015,
    longitudeDelta: 0.0121,
  },
  markerSize: 40,
  polylineStrokeWidth: 3,
  geofenceStrokeWidth: 2,
  geofenceFillOpacity: 0.2,
};

// Subscription Plans
export const SUBSCRIPTION_PLANS = [
  {
    type: 'basic',
    name: 'Basic',
    price: 9.99,
    maxPets: 1,
    features: [
      'Real-time GPS tracking',
      'Basic health monitoring',
      'Safe zone alerts',
      'Mobile app access',
    ],
  },
  {
    type: 'premium',
    name: 'Premium',
    price: 19.99,
    maxPets: 3,
    features: [
      'Everything in Basic',
      'Advanced health analytics',
      'Veterinary integration',
      'Activity trends',
      'Priority support',
    ],
  },
  {
    type: 'family',
    name: 'Family',
    price: 29.99,
    maxPets: 10,
    features: [
      'Everything in Premium',
      'Multi-user access',
      'Family sharing',
      'Advanced reporting',
      'Custom alerts',
    ],
  },
];

// Storage Keys
export const STORAGE_KEYS = {
  USER_TOKEN: 'user_token',
  USER_DATA: 'user_data',
  PETS_DATA: 'pets_data',
  THEME_MODE: 'theme_mode',
  NOTIFICATION_SETTINGS: 'notification_settings',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  APP_PREFERENCES: 'app_preferences',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },
  USER: {
    PROFILE: '/api/v1/user/profile',
    UPDATE_PROFILE: '/user/profile',
    EMERGENCY_CONTACTS: '/user/emergency-contacts',
  },
  PETS: {
    LIST: '/api/v1/pets',
    CREATE: '/api/v1/pets',
    UPDATE: '/api/v1/pets/:id',
    DELETE: '/api/v1/pets/:id',
    HEALTH_DATA: '/pets/:id/health',
    LOCATION_DATA: '/pets/:id/location',
  },
  COLLAR: {
    SETTINGS: '/collar/:id/settings',
    STATUS: '/collar/:id/status',
    FIRMWARE: '/collar/:id/firmware',
  },
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: '/notifications/:id/read',
    SETTINGS: '/notifications/settings',
  },
  COMMUNITY: {
    POSTS: '/community/posts',
    PET_SITTERS: '/community/pet-sitters',
    REVIEWS: '/community/reviews',
    AI_CHAT: '/api/v1/ai/chat',
  AI_VOICE_CHAT: '/api/v1/ai/voice-chat',
  },
  VETERINARY: {
    CLINICS: '/veterinary/clinics',
    APPOINTMENTS: '/veterinary/appointments',
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
  AUTH_FAILED: 'Authentication failed. Please check your credentials.',
  PERMISSION_DENIED: 'Permission denied. Please grant the required permissions.',
  LOCATION_UNAVAILABLE: 'Location services are not available.',
  BLUETOOTH_UNAVAILABLE: 'Bluetooth is not available on this device.',
  COLLAR_NOT_FOUND: 'HausPet collar not found. Please check the connection.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Profile updated successfully!',
  PET_ADDED: 'Pet added successfully!',
  COLLAR_CONNECTED: 'Collar connected successfully!',
  NOTIFICATION_SENT: 'Notification sent successfully!',
  APPOINTMENT_SCHEDULED: 'Appointment scheduled successfully!',
} as const;