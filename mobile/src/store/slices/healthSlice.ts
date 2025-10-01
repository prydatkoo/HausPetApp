import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { HealthData } from '../../types';
import HealthService from '../../services/api/healthService';

interface HealthState {
  currentData: Record<string, HealthData>; // petId -> latest health data
  historicalData: Record<string, HealthData[]>; // petId -> health data array
  isLoading: boolean;
  error: string | null;
  alerts: HealthAlert[];
}

interface HealthAlert {
  id: string;
  petId: string;
  type: 'heartRate' | 'temperature' | 'activity' | 'sleep';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  isRead: boolean;
}

const initialState: HealthState = {
  currentData: {},
  historicalData: {},
  isLoading: false,
  error: null,
  alerts: [],
};

// Async thunks
export const fetchHealthData = createAsyncThunk(
  'health/fetchHealthData',
  async ({ petId, timeRange }: { petId: string; timeRange: 'day' | 'week' | 'month' }, { rejectWithValue }) => {
    try {
      const data = await HealthService.getHealthData(petId, timeRange);
      return { petId, data };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch health data');
    }
  }
);

export const fetchCurrentHealthData = createAsyncThunk(
  'health/fetchCurrentHealthData',
  async (petId: string, { rejectWithValue }) => {
    try {
      const data = await HealthService.getCurrentHealthData(petId);
      return { petId, data };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch current health data');
    }
  }
);

export const addHealthAlert = createAsyncThunk(
  'health/addHealthAlert',
  async (alert: Omit<HealthAlert, 'id'>, { rejectWithValue }) => {
    try {
      const newAlert = await HealthService.createHealthAlert(alert);
      return newAlert;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create health alert');
    }
  }
);

export const markAlertAsRead = createAsyncThunk(
  'health/markAlertAsRead',
  async (alertId: string, { rejectWithValue }) => {
    try {
      await HealthService.markAlertAsRead(alertId);
      return alertId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark alert as read');
    }
  }
);

const healthSlice = createSlice({
  name: 'health',
  initialState,
  reducers: {
    updateCurrentHealthData: (state, action: PayloadAction<{ petId: string; data: HealthData }>) => {
      const { petId, data } = action.payload;
      state.currentData[petId] = data;
      
      // Add to historical data
      if (!state.historicalData[petId]) {
        state.historicalData[petId] = [];
      }
      state.historicalData[petId].unshift(data);
      
      // Keep only last 1000 entries
      if (state.historicalData[petId].length > 1000) {
        state.historicalData[petId] = state.historicalData[petId].slice(0, 1000);
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    dismissAlert: (state, action: PayloadAction<string>) => {
      state.alerts = state.alerts.filter(alert => alert.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    // Fetch health data
    builder
      .addCase(fetchHealthData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHealthData.fulfilled, (state, action) => {
        state.isLoading = false;
        const { petId, data } = action.payload;
        state.historicalData[petId] = data;
        if (data.length > 0) {
          state.currentData[petId] = data[0]; // Most recent data
        }
        state.error = null;
      })
      .addCase(fetchHealthData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch current health data
    builder
      .addCase(fetchCurrentHealthData.fulfilled, (state, action) => {
        const { petId, data } = action.payload;
        state.currentData[petId] = data;
      });

    // Add health alert
    builder
      .addCase(addHealthAlert.fulfilled, (state, action) => {
        state.alerts.unshift(action.payload);
      });

    // Mark alert as read
    builder
      .addCase(markAlertAsRead.fulfilled, (state, action) => {
        const alert = state.alerts.find(a => a.id === action.payload);
        if (alert) {
          alert.isRead = true;
        }
      });
  },
});

export const { updateCurrentHealthData, clearError, dismissAlert } = healthSlice.actions;
export default healthSlice.reducer;