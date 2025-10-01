import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Collar, CollarSettings } from '../../types';
import CollarService from '../../services/api/collarService';

interface CollarState {
  collars: Record<string, Collar>; // collarId -> collar data
  connectedCollars: string[]; // list of connected collar IDs
  isScanning: boolean;
  isConnecting: string | null; // collar ID being connected
  firmwareUpdates: Record<string, FirmwareUpdate>; // collarId -> update info
  isLoading: boolean;
  error: string | null;
}

interface FirmwareUpdate {
  available: boolean;
  version: string;
  downloadProgress: number;
  installProgress: number;
  isInstalling: boolean;
}

const initialState: CollarState = {
  collars: {},
  connectedCollars: [],
  isScanning: false,
  isConnecting: null,
  firmwareUpdates: {},
  isLoading: false,
  error: null,
};

// Async thunks
export const scanForCollars = createAsyncThunk(
  'collar/scanForCollars',
  async (_, { rejectWithValue }) => {
    try {
      const collars = await CollarService.scanForCollars();
      return collars;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to scan for collars');
    }
  }
);

export const connectToCollar = createAsyncThunk(
  'collar/connectToCollar',
  async (collarId: string, { rejectWithValue }) => {
    try {
      const collar = await CollarService.connectToCollar(collarId);
      return collar;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to connect to collar');
    }
  }
);

export const disconnectFromCollar = createAsyncThunk(
  'collar/disconnectFromCollar',
  async (collarId: string, { rejectWithValue }) => {
    try {
      await CollarService.disconnectFromCollar(collarId);
      return collarId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to disconnect from collar');
    }
  }
);

export const updateCollarSettings = createAsyncThunk(
  'collar/updateSettings',
  async ({ collarId, settings }: { collarId: string; settings: Partial<CollarSettings> }, { rejectWithValue }) => {
    try {
      const updatedCollar = await CollarService.updateSettings(collarId, settings);
      return updatedCollar;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update collar settings');
    }
  }
);

export const getCollarStatus = createAsyncThunk(
  'collar/getStatus',
  async (collarId: string, { rejectWithValue }) => {
    try {
      const status = await CollarService.getStatus(collarId);
      return { collarId, status };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get collar status');
    }
  }
);

export const checkFirmwareUpdate = createAsyncThunk(
  'collar/checkFirmwareUpdate',
  async (collarId: string, { rejectWithValue }) => {
    try {
      const updateInfo = await CollarService.checkFirmwareUpdate(collarId);
      return { collarId, updateInfo };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to check firmware update');
    }
  }
);

export const installFirmwareUpdate = createAsyncThunk(
  'collar/installFirmwareUpdate',
  async (collarId: string, { rejectWithValue }) => {
    try {
      await CollarService.installFirmwareUpdate(collarId);
      return collarId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to install firmware update');
    }
  }
);

export const sendCollarCommand = createAsyncThunk(
  'collar/sendCommand',
  async ({ collarId, command, params }: { collarId: string; command: string; params?: any }, { rejectWithValue }) => {
    try {
      const result = await CollarService.sendCommand(collarId, command, params);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to send collar command');
    }
  }
);

const collarSlice = createSlice({
  name: 'collar',
  initialState,
  reducers: {
    updateCollarStatus: (state, action: PayloadAction<{ collarId: string; data: Partial<Collar> }>) => {
      const { collarId, data } = action.payload;
      if (state.collars[collarId]) {
        state.collars[collarId] = { ...state.collars[collarId], ...data };
      }
    },
    addCollar: (state, action: PayloadAction<Collar>) => {
      state.collars[action.payload.id] = action.payload;
    },
    removeCollar: (state, action: PayloadAction<string>) => {
      delete state.collars[action.payload];
      state.connectedCollars = state.connectedCollars.filter(id => id !== action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
    updateFirmwareProgress: (state, action: PayloadAction<{ collarId: string; progress: Partial<FirmwareUpdate> }>) => {
      const { collarId, progress } = action.payload;
      if (state.firmwareUpdates[collarId]) {
        state.firmwareUpdates[collarId] = { ...state.firmwareUpdates[collarId], ...progress };
      }
    },
  },
  extraReducers: (builder) => {
    // Scan for collars
    builder
      .addCase(scanForCollars.pending, (state) => {
        state.isScanning = true;
        state.error = null;
      })
      .addCase(scanForCollars.fulfilled, (state, action) => {
        state.isScanning = false;
        action.payload.forEach(collar => {
          state.collars[collar.id] = collar;
        });
        state.error = null;
      })
      .addCase(scanForCollars.rejected, (state, action) => {
        state.isScanning = false;
        state.error = action.payload as string;
      });

    // Connect to collar
    builder
      .addCase(connectToCollar.pending, (state, action) => {
        state.isConnecting = action.meta.arg;
        state.error = null;
      })
      .addCase(connectToCollar.fulfilled, (state, action) => {
        state.isConnecting = null;
        state.collars[action.payload.id] = action.payload;
        if (!state.connectedCollars.includes(action.payload.id)) {
          state.connectedCollars.push(action.payload.id);
        }
        state.error = null;
      })
      .addCase(connectToCollar.rejected, (state, action) => {
        state.isConnecting = null;
        state.error = action.payload as string;
      });

    // Disconnect from collar
    builder
      .addCase(disconnectFromCollar.fulfilled, (state, action) => {
        state.connectedCollars = state.connectedCollars.filter(id => id !== action.payload);
        if (state.collars[action.payload]) {
          state.collars[action.payload].bluetoothConnected = false;
        }
      });

    // Update settings
    builder
      .addCase(updateCollarSettings.fulfilled, (state, action) => {
        state.collars[action.payload.id] = action.payload;
      });

    // Get status
    builder
      .addCase(getCollarStatus.fulfilled, (state, action) => {
        const { collarId, status } = action.payload;
        if (state.collars[collarId]) {
          state.collars[collarId] = { ...state.collars[collarId], ...status };
        }
      });

    // Check firmware update
    builder
      .addCase(checkFirmwareUpdate.fulfilled, (state, action) => {
        const { collarId, updateInfo } = action.payload;
        state.firmwareUpdates[collarId] = updateInfo;
      });

    // Install firmware update
    builder
      .addCase(installFirmwareUpdate.pending, (state, action) => {
        const collarId = action.meta.arg;
        if (state.firmwareUpdates[collarId]) {
          state.firmwareUpdates[collarId].isInstalling = true;
          state.firmwareUpdates[collarId].installProgress = 0;
        }
      })
      .addCase(installFirmwareUpdate.fulfilled, (state, action) => {
        const collarId = action.payload;
        if (state.firmwareUpdates[collarId]) {
          state.firmwareUpdates[collarId].isInstalling = false;
          state.firmwareUpdates[collarId].installProgress = 100;
          state.firmwareUpdates[collarId].available = false;
        }
      })
      .addCase(installFirmwareUpdate.rejected, (state, action) => {
        // Find which collar failed (meta.arg)
        const collarId = action.meta.arg;
        if (state.firmwareUpdates[collarId]) {
          state.firmwareUpdates[collarId].isInstalling = false;
        }
        state.error = action.payload as string;
      });
  },
});

export const {
  updateCollarStatus,
  addCollar,
  removeCollar,
  clearError,
  updateFirmwareProgress,
} = collarSlice.actions;

export default collarSlice.reducer;