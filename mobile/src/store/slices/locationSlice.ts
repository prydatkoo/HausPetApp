import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { LocationData, SafeZone, GpsLocation } from '../../types';
import LocationService from '../../services/api/locationService';

interface LocationState {
  currentLocations: Record<string, LocationData>; // petId -> latest location
  locationHistory: Record<string, LocationData[]>; // petId -> location history
  safeZones: SafeZone[];
  isTracking: Record<string, boolean>; // petId -> tracking status
  isLostPetMode: Record<string, boolean>; // petId -> lost pet mode
  isLoading: boolean;
  error: string | null;
}

const initialState: LocationState = {
  currentLocations: {},
  locationHistory: {},
  safeZones: [],
  isTracking: {},
  isLostPetMode: {},
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchLocationData = createAsyncThunk(
  'location/fetchLocationData',
  async ({ petId, timeRange }: { petId: string; timeRange: 'day' | 'week' | 'month' }, { rejectWithValue }) => {
    try {
      const data = await LocationService.getLocationHistory(petId, timeRange);
      return { petId, data };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch location data');
    }
  }
);

export const fetchCurrentLocation = createAsyncThunk(
  'location/fetchCurrentLocation',
  async (petId: string, { rejectWithValue }) => {
    try {
      const location = await LocationService.getCurrentLocation(petId);
      return { petId, location };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch current location');
    }
  }
);

export const createSafeZone = createAsyncThunk(
  'location/createSafeZone',
  async (safeZone: Omit<SafeZone, 'id' | 'createdAt'>, { rejectWithValue }) => {
    try {
      const newSafeZone = await LocationService.createSafeZone(safeZone);
      return newSafeZone;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create safe zone');
    }
  }
);

export const updateSafeZone = createAsyncThunk(
  'location/updateSafeZone',
  async ({ id, data }: { id: string; data: Partial<SafeZone> }, { rejectWithValue }) => {
    try {
      const updatedSafeZone = await LocationService.updateSafeZone(id, data);
      return updatedSafeZone;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update safe zone');
    }
  }
);

export const deleteSafeZone = createAsyncThunk(
  'location/deleteSafeZone',
  async (safeZoneId: string, { rejectWithValue }) => {
    try {
      await LocationService.deleteSafeZone(safeZoneId);
      return safeZoneId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete safe zone');
    }
  }
);

export const fetchSafeZones = createAsyncThunk(
  'location/fetchSafeZones',
  async (_, { rejectWithValue }) => {
    try {
      const safeZones = await LocationService.getSafeZones();
      return safeZones;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch safe zones');
    }
  }
);

export const activateLostPetMode = createAsyncThunk(
  'location/activateLostPetMode',
  async (petId: string, { rejectWithValue }) => {
    try {
      await LocationService.activateLostPetMode(petId);
      return petId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to activate lost pet mode');
    }
  }
);

export const deactivateLostPetMode = createAsyncThunk(
  'location/deactivateLostPetMode',
  async (petId: string, { rejectWithValue }) => {
    try {
      await LocationService.deactivateLostPetMode(petId);
      return petId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to deactivate lost pet mode');
    }
  }
);

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    updateCurrentLocation: (state, action: PayloadAction<{ petId: string; location: LocationData }>) => {
      const { petId, location } = action.payload;
      state.currentLocations[petId] = location;
      
      // Add to history
      if (!state.locationHistory[petId]) {
        state.locationHistory[petId] = [];
      }
      state.locationHistory[petId].unshift(location);
      
      // Keep only last 10000 entries
      if (state.locationHistory[petId].length > 10000) {
        state.locationHistory[petId] = state.locationHistory[petId].slice(0, 10000);
      }
    },
    startTracking: (state, action: PayloadAction<string>) => {
      state.isTracking[action.payload] = true;
    },
    stopTracking: (state, action: PayloadAction<string>) => {
      state.isTracking[action.payload] = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearLocationHistory: (state, action: PayloadAction<string>) => {
      delete state.locationHistory[action.payload];
    },
  },
  extraReducers: (builder) => {
    // Fetch location data
    builder
      .addCase(fetchLocationData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLocationData.fulfilled, (state, action) => {
        state.isLoading = false;
        const { petId, data } = action.payload;
        state.locationHistory[petId] = data;
        if (data.length > 0) {
          state.currentLocations[petId] = data[0]; // Most recent location
        }
        state.error = null;
      })
      .addCase(fetchLocationData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch current location
    builder
      .addCase(fetchCurrentLocation.fulfilled, (state, action) => {
        const { petId, location } = action.payload;
        state.currentLocations[petId] = location;
      });

    // Safe zones
    builder
      .addCase(fetchSafeZones.fulfilled, (state, action) => {
        state.safeZones = action.payload;
      })
      .addCase(createSafeZone.fulfilled, (state, action) => {
        state.safeZones.push(action.payload);
      })
      .addCase(updateSafeZone.fulfilled, (state, action) => {
        const index = state.safeZones.findIndex(zone => zone.id === action.payload.id);
        if (index !== -1) {
          state.safeZones[index] = action.payload;
        }
      })
      .addCase(deleteSafeZone.fulfilled, (state, action) => {
        state.safeZones = state.safeZones.filter(zone => zone.id !== action.payload);
      });

    // Lost pet mode
    builder
      .addCase(activateLostPetMode.fulfilled, (state, action) => {
        state.isLostPetMode[action.payload] = true;
      })
      .addCase(deactivateLostPetMode.fulfilled, (state, action) => {
        state.isLostPetMode[action.payload] = false;
      });
  },
});

export const {
  updateCurrentLocation,
  startTracking,
  stopTracking,
  clearError,
  clearLocationHistory,
} = locationSlice.actions;

export default locationSlice.reducer;