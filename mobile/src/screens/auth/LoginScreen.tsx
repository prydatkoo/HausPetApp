import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppSelector, useAppDispatch } from '../../store';
import { loginUser, socialLogin, setGuest } from '../../store/slices/authSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AuthService from '../../services/api/authService';

type AuthNavigationProp = StackNavigationProp<any>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<AuthNavigationProp>();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(state => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError && validateEmail(text)) {
      setEmailError('');
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (passwordError && text.length >= 6) {
      setPasswordError('');
    }
  };

  const handleLogin = async () => {
    let hasErrors = false;

    if (!email.trim()) {
      setEmailError('Email is required');
      hasErrors = true;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      hasErrors = true;
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      hasErrors = true;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      hasErrors = true;
    }

    if (hasErrors) return;

    try {
      // Clear any stored token before attempting login
      await AuthService.clearStoredToken();
      
      await dispatch(loginUser({ email, password })).unwrap();
      
      // Navigate to Main screen after successful login
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        (navigation as any).replace('Main');
      }
    } catch (error: any) {
      if (typeof error === 'string' && error.toLowerCase().includes('user not found')) {
        Alert.alert(
          'User Not Found',
          'Would you like to register with this email?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Register', 
              onPress: () => navigation.navigate('Register', { email }),
            },
          ],
        );
      } else {
        Alert.alert('Login Failed', error || 'Please check your credentials and try again.');
      }
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    try {
      // For demo purposes, simulate successful social login
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Create a demo user
      const demoUser = {
        id: 'demo-user-1',
        firstName: 'Demo',
        lastName: 'User',
        email: 'demo@example.com',
        phoneNumber: '+1234567890',
        avatar: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Set the user as authenticated
      dispatch({ 
        type: 'auth/loginUser/fulfilled', 
        payload: { user: demoUser, token: 'demo-token' } 
      });
      
      Alert.alert(
        'Login Successful',
        `Welcome back to HausPet via ${provider}!`,
        [{ 
          text: 'OK', 
          onPress: () => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              (navigation as any).replace('Main');
            }
          }
        }]
      );
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || `Failed to login with ${provider}`);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleSignUp = () => {
    navigation.navigate('Register');
  };

  const handleGuestLogin = () => {
    dispatch(setGuest(true));
  };

  const renderErrorMessage = () => {
    if (!error) return null;
    
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={24} color="#FF4444" />
        <Text style={styles.errorMessage}>{error}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient colors={theme.dark ? ['#0B0F14', '#0B0F14'] : ['#FFFFFF', '#FFFFFF']} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} />

      {isLoading && <LoadingSpinner />}
      {error && renderErrorMessage()}
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
          <TouchableOpacity style={styles.closeButton} onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              dispatch(setGuest(true));
            }
          }}>
            <Ionicons name="close-circle" size={28} color="#9CA3AF" />
          </TouchableOpacity>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: theme.dark ? '#9CA3AF' : '#6B7280' }]}>Sign in to your HausPet account</Text>

          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Email</Text>
              <View style={[
                styles.inputContainer,
                { borderColor: emailError ? '#FF4444' : (theme.dark ? '#3f3f46' : '#E0E0E0'), backgroundColor: theme.dark ? '#111827' : '#F9FAFB' }
              ]}>
                <Ionicons name="mail-outline" size={20} color="#757575" />
                <TextInput
                  key="email-input"
                  style={[styles.input, { color: theme.colors.text }]}
                  value={email}
                  onChangeText={handleEmailChange}
                  placeholder="Enter your email"
                  placeholderTextColor={theme.dark ? '#9CA3AF' : '#757575'}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Password</Text>
              <View style={[
                styles.inputContainer,
                { borderColor: passwordError ? '#FF4444' : (theme.dark ? '#3f3f46' : '#E0E0E0'), backgroundColor: theme.dark ? '#111827' : '#F9FAFB' }
              ]}>
                <Ionicons name="lock-closed-outline" size={20} color="#757575" />
                <TextInput
                  key="password-input"
                  style={[styles.input, { color: theme.colors.text }]}
                  value={password}
                  onChangeText={handlePasswordChange}
                  placeholder="Enter your password"
                  placeholderTextColor={theme.dark ? '#9CA3AF' : '#757575'}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                    size={20} 
                    color="#757575"
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword}>
              <Text style={[styles.forgotPasswordText, { color: theme.dark ? '#9CA3AF' : '#2E7D5A' }]}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity 
              key="login-button"
              style={[styles.loginButton, { backgroundColor: '#111827' }]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              key="guest-button"
              style={[styles.guestButton, { backgroundColor: theme.dark ? '#111827' : '#F9FAFB', borderColor: theme.dark ? '#3f3f46' : '#E5E7EB' }]}
              onPress={handleGuestLogin}
            >
              <Text style={[styles.guestButtonText, { color: theme.colors.text }]}>Continue as Guest</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={[styles.dividerText, { color: theme.dark ? '#9CA3AF' : '#6B7280' }]}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login Buttons */}
            <TouchableOpacity 
              key="google-login-button"
              style={[styles.socialButton, { backgroundColor: theme.dark ? '#111827' : '#F9FAFB', borderColor: theme.dark ? '#3f3f46' : '#E5E7EB' }]}
              onPress={() => handleSocialLogin('google')}
            >
              <Ionicons name="logo-google" size={20} color="#212121" />
              <Text style={[styles.socialButtonText, { color: theme.colors.text }]}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              key="apple-login-button"
              style={[styles.socialButton, { backgroundColor: theme.dark ? '#111827' : '#F9FAFB', borderColor: theme.dark ? '#3f3f46' : '#E5E7EB' }]}
              onPress={() => handleSocialLogin('apple')}
            >
              <Ionicons name="logo-apple" size={20} color="#212121" />
              <Text style={[styles.socialButtonText, { color: theme.colors.text }]}>Continue with Apple</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.dark ? '#9CA3AF' : '#6B7280' }] }>
              Don't have an account?{' '}
              <TouchableOpacity onPress={handleSignUp}>
                <Text style={[styles.signUpText, { color: theme.dark ? '#60A5FA' : '#2E7D5A' }]}>Sign Up</Text>
              </TouchableOpacity>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '500',
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#FF4444',
    marginTop: 4,
    fontWeight: '500',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 32,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#2E7D5A',
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#111827',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  guestButton: {
    backgroundColor: '#F9FAFB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontSize: 14,
    color: '#6B7280',
    paddingHorizontal: 16,
    fontWeight: '500',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 12,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  signUpText: {
    fontSize: 14,
    color: '#2E7D5A',
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    margin: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorMessage: {
    fontSize: 14,
    color: '#DC2626',
    marginLeft: 12,
    flex: 1,
    fontWeight: '500',
  },
});

export default LoginScreen;