// Core type definitions for HausPet app

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profilePicture?: string;
  isSitter?: boolean;
  emergencyContacts: EmergencyContact[];
  subscription: SubscriptionPlan;
  createdAt: Date;
  updatedAt: Date;
}

export interface Pet {
  id: string;
  name: string;
  breed: string;
  species: 'dog' | 'cat' | 'other';
  gender: 'male' | 'female';
  age: number;
  weight: number;
  color: string;
  avatar?: string | null;
  microchipId?: string;
  medicalHistory: MedicalRecord[];
  vaccinations: Vaccination[];
  medications: Medication[];
  collarId?: string;
  ownerId: string;
  emergencyVet?: VeterinaryContact;
  createdAt: Date;
  updatedAt: Date;
}

export interface HealthData {
  id: string;
  petId: string;
  heartRate: number;
  temperature: number;
  activityLevel: number;
  steps: number;
  distance: number;
  licking: number;
  scratching: number;
  sleepDuration: number;
  sleepQuality: 'poor' | 'fair' | 'good' | 'excellent';
  timestamp: Date;
  gpsCoordinates?: GpsLocation;
}

export interface LocationData {
  id: string;
  petId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  timestamp: Date;
  isInSafeZone: boolean;
  batteryLevel?: number;
}

export interface GpsLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface SafeZone {
  id: string;
  name: string;
  center: GpsLocation;
  radius: number; // in meters
  isActive: boolean;
  petIds: string[];
  notifications: boolean;
  createdAt: Date;
}

export interface Collar {
  id: string;
  model: string;
  serialNumber: string;
  firmwareVersion: string;
  batteryLevel: number;
  isCharging: boolean;
  solarChargingStatus: 'active' | 'inactive' | 'optimal' | 'poor';
  bluetoothConnected: boolean;
  gpsEnabled: boolean;
  lastSync: Date;
  settings: CollarSettings;
}

export interface CollarSettings {
  gpsInterval: number; // seconds
  healthMonitoringEnabled: boolean;
  heartRateAlert: AlertThreshold;
  temperatureAlert: AlertThreshold;
  activityAlert: AlertThreshold;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  ledEnabled: boolean;
}

export interface AlertThreshold {
  enabled: boolean;
  minValue?: number;
  maxValue?: number;
  criticalValue?: number;
}

export interface Notification {
  id: string;
  type: 'health' | 'location' | 'battery' | 'collar' | 'appointment' | 'social';
  title: string;
  message: string;
  petId?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  actionRequired: boolean;
  data?: Record<string, any>;
  createdAt: Date;
}

export interface MedicalRecord {
  id: string;
  petId: string;
  date: Date;
  type: 'checkup' | 'emergency' | 'surgery' | 'test' | 'prescription';
  veterinarian: string;
  clinic: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  documents?: string[];
  nextAppointment?: Date;
}

export interface Vaccination {
  id: string;
  name: string;
  date: Date;
  expiryDate: Date;
  veterinarian: string;
  batchNumber?: string;
  nextDue?: Date;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  instructions: string;
  veterinarian: string;
  isActive: boolean;
}

export interface Appointment {
  id: string;
  petId: string;
  veterinarianId: string;
  type: 'checkup' | 'vaccination' | 'emergency' | 'surgery' | 'grooming';
  date: Date;
  duration: number; // minutes
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  reminders: Date[];
}

export interface VeterinaryContact {
  id: string;
  name: string;
  clinic: string;
  phone: string;
  email: string;
  address: string;
  specialization?: string[];
  isEmergency: boolean;
  hours: BusinessHours;
}

export interface BusinessHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  open: string;
  close: string;
  isClosed: boolean;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  relationship: string;
  isPrimary: boolean;
}

export interface SubscriptionPlan {
  type: 'basic' | 'premium' | 'family';
  status: 'active' | 'expired' | 'cancelled';
  startDate: Date;
  endDate?: Date;
  features: string[];
  maxPets: number;
}

export interface CommunityPost {
  id: string;
  userId: string;
  petId?: string;
  type: 'photo' | 'update' | 'question' | 'announcement';
  content: string;
  images?: string[];
  location?: GpsLocation;
  likes: number;
  comments: Comment[];
  isPublic: boolean;
  createdAt: Date;
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  likes: number;
  createdAt: Date;
}

export interface PetSitter {
  id: string;
  name: string;
  rating: number;
  reviews: Review[];
  services: SitterService[];
  availability: Availability[];
  location: GpsLocation;
  radius: number; // service radius in km
  hourlyRate: number;
  images: string[];
  bio: string;
  experience: number; // years
  isVerified: boolean;
}

export interface SitterService {
  type: 'walking' | 'sitting' | 'boarding' | 'daycare' | 'grooming';
  price: number;
  duration: number; // minutes
  description: string;
}

export interface Availability {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string;
  endTime: string;
}

export interface Review {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  petId: string;
  serviceDate: Date;
  createdAt: Date;
}

export interface AppState {
  user: User | null;
  pets: Pet[];
  selectedPet: Pet | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface NavigationProps {
  navigation: any;
  route: any;
}

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    error: string;
    warning: string;
    success: string;
    text: string;
    textSecondary: string;
    border: string;
    shadow: string;
  };
  fonts: {
    regular: string;
    medium: string;
    bold: string;
    sizes: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
    };
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
}

export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  Main: { screen?: keyof TabParamList } | undefined;
  PetProfile: { petId: string };
  HealthDetail: { petId: string; dataType: string };
  LocationDetail: { petId: string };
  Appointment: { petId: string; appointmentId?: string };
  EmergencyMode: { petId: string };
  CollarSettings: { collarId: string };
  Profile: undefined;
  Notifications: undefined;
  AddPet: undefined;
  PetDetails: { petId: string };
  EditPet: { petId: string };
  Settings: undefined;
  Subscription: undefined;
  AIDetail: { summary: string };
  VideoCall: { roomId?: string } | undefined;
};

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

export type TabParamList = {
  Map: undefined;
  Health: undefined;
  Home: undefined;
  Chat: undefined;
  Settings: undefined;
  // Sitters removed
};