import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import GlobalModal from './src/components/common/GlobalModal';
import GlobalToast from './src/components/common/GlobalToast';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <AppNavigator />
          <GlobalModal />
          <GlobalToast />
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
