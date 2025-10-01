import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  isDarkMode: boolean;
  isOnboardingCompleted: boolean;
  activeTab: string;
  isLoading: boolean;
  loadingMessage: string;
  toast: ToastState | null;
  modal: ModalState | null;
  networkStatus: 'online' | 'offline';
  appState: 'active' | 'background' | 'inactive';
  approvedHealthWidgets: Array<{ id: string; petId: string; title: string; metric: string; value: string; approvedAt: string }>;
}

interface ToastState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ModalState {
  id: string;
  type: 'alert' | 'confirm' | 'custom';
  title: string;
  message?: string;
  component?: React.ComponentType;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const initialState: UIState = {
  isDarkMode: false,
  isOnboardingCompleted: false, // Require onboarding/login by default
  activeTab: 'Dashboard',
  isLoading: false,
  loadingMessage: '',
  toast: null,
  modal: null,
  networkStatus: 'online',
  appState: 'active',
  approvedHealthWidgets: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.isDarkMode = action.payload === 'dark';
    },
    toggleTheme: (state) => {
      state.isDarkMode = !state.isDarkMode;
    },
    setOnboardingCompleted: (state, action: PayloadAction<boolean>) => {
      state.isOnboardingCompleted = action.payload;
    },
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
    setLoading: (state, action: PayloadAction<{ isLoading: boolean; message?: string }>) => {
      state.isLoading = action.payload.isLoading;
      state.loadingMessage = action.payload.message || '';
    },
    showToast: (state, action: PayloadAction<Omit<ToastState, 'id'>>) => {
      state.toast = {
        id: Math.random().toString(36).substr(2, 9),
        ...action.payload,
      };
    },
    hideToast: (state) => {
      state.toast = null;
    },
    showModal: (state, action: PayloadAction<Omit<ModalState, 'id'>>) => {
      state.modal = {
        id: Math.random().toString(36).substr(2, 9),
        ...action.payload,
      };
    },
    hideModal: (state) => {
      state.modal = null;
    },
    setNetworkStatus: (state, action: PayloadAction<'online' | 'offline'>) => {
      state.networkStatus = action.payload;
    },
    setAppState: (state, action: PayloadAction<'active' | 'background' | 'inactive'>) => {
      state.appState = action.payload;
    },
    requestWidgetApproval: (state, action: PayloadAction<{ id: string; petId: string; title: string; metric: string; value: string }>) => {
      // In a real app, show OS prompt. For now, auto-approve on request (chatbot decides when to dispatch).
      const { id, petId, title, metric, value } = action.payload;
      state.approvedHealthWidgets = [
        { id, petId, title, metric, value, approvedAt: new Date().toISOString() },
        ...state.approvedHealthWidgets.filter(w => w.id !== id),
      ];
    },
    revokeWidget: (state, action: PayloadAction<{ id: string }>) => {
      state.approvedHealthWidgets = state.approvedHealthWidgets.filter(w => w.id !== action.payload.id);
    },
    showSuccessToast: (state, action: PayloadAction<{ title: string; message?: string }>) => {
      state.toast = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'success',
        ...action.payload,
      };
    },
    showErrorToast: (state, action: PayloadAction<{ title: string; message?: string }>) => {
      state.toast = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'error',
        ...action.payload,
      };
    },
    showWarningToast: (state, action: PayloadAction<{ title: string; message?: string }>) => {
      state.toast = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'warning',
        ...action.payload,
      };
    },
    showInfoToast: (state, action: PayloadAction<{ title: string; message?: string }>) => {
      state.toast = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'info',
        ...action.payload,
      };
    },
    showConfirmModal: (state, action: PayloadAction<{
      title: string;
      message?: string;
      onConfirm: () => void;
      onCancel?: () => void;
      confirmText?: string;
      cancelText?: string;
    }>) => {
      state.modal = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'confirm',
        ...action.payload,
      };
    },
    showAlertModal: (state, action: PayloadAction<{
      title: string;
      message?: string;
      onConfirm?: () => void;
    }>) => {
      state.modal = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'alert',
        ...action.payload,
      };
    },
  },
});

export const {
  setTheme,
  toggleTheme,
  setOnboardingCompleted,
  setActiveTab,
  setLoading,
  showToast,
  hideToast,
  showModal,
  hideModal,
  setNetworkStatus,
  setAppState,
  requestWidgetApproval,
  revokeWidget,
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showInfoToast,
  showConfirmModal,
  showAlertModal,
} = uiSlice.actions;

export default uiSlice.reducer;