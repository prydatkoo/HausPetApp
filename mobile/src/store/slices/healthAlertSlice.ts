import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface HealthAlert {
  petId: string;
  condition: string;
}

interface HealthAlertState {
  alerts: HealthAlert[];
}

const initialState: HealthAlertState = {
  alerts: [],
};

const healthAlertSlice = createSlice({
  name: 'healthAlerts',
  initialState,
  reducers: {
    addHealthAlert: (state, action: PayloadAction<HealthAlert>) => {
      // Avoid duplicate alerts for the same pet and condition
      const existingAlert = state.alerts.find(
        (alert) => alert.petId === action.payload.petId && alert.condition === action.payload.condition
      );
      if (!existingAlert) {
        state.alerts.push(action.payload);
      }
    },
    clearHealthAlerts: (state) => {
      state.alerts = [];
    },
  },
});

export const { addHealthAlert, clearHealthAlerts } = healthAlertSlice.actions;
export default healthAlertSlice.reducer;

