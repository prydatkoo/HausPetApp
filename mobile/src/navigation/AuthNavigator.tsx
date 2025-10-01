import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import { useAppSelector } from '../store';

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  const { initialAuthRoute } = useAppSelector(state => state.auth);

  return (
    <Stack.Navigator 
      initialRouteName={initialAuthRoute}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
        options={{
          headerShown: true,
          title: 'Reset Password',
          headerBackTitle: 'Back',
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;