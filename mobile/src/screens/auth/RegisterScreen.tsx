import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useTheme, RouteProp, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppSelector, useAppDispatch } from '../../store';
import { registerUser, clearError } from '../../store/slices/authSlice';
import { setOnboardingCompleted } from '../../store/slices/uiSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

type AuthNavigationProp = StackNavigationProp<any>;
type RegisterScreenRouteProp = RouteProp<{ params: { email?: string } }, 'params'>;

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<AuthNavigationProp>();
  const route = useRoute<RegisterScreenRouteProp>();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { error } = useAppSelector(state => state.auth);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (route.params?.email) {
      setFormData(prev => ({ ...prev, email: route.params.email }));
    }
  }, [route.params?.email]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    };
    let isValid = true;

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      // Find the first error and alert the user
      const firstError = Object.values(errors).find(error => error);
      if (firstError) {
        Alert.alert('Registration Error', firstError);
      }
      return;
    }

    try {
      setSubmitting(true);
      await dispatch(registerUser(formData)).unwrap();
      dispatch(setOnboardingCompleted(true));
      // AppNavigator will switch to Main once isAuthenticated is true
    } catch (error: any) {
      // It's better to let the authSlice handle the error state,
      // but for specific UI feedback like this alert, handling it here is fine.
      Alert.alert('Registration Failed', error || 'An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignIn = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient colors={theme.dark ? ['#0B0F14', '#0B0F14'] : ['#FFFFFF', '#FFFFFF']} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} />

      {submitting && <LoadingSpinner />}
      
      <KeyboardAwareScrollView 
        style={styles.keyboardAvoidingView}
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid={true}
        extraScrollHeight={Platform.OS === 'ios' ? 100 : 0}
      >
          <TouchableOpacity style={styles.closeButton} onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Login'); // Fallback to Login screen
            }
          }}>
            <Ionicons name="close-circle" size={28} color="#9CA3AF" />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: theme.dark ? '#9CA3AF' : '#6B7280' }]}>Join HausPet to keep your pets safe</Text>

          <View style={styles.form}>
            {/* First Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>First Name</Text>
              <View style={[
                styles.inputContainer,
                { borderColor: errors.firstName ? '#FF4444' : (theme.dark ? '#3f3f46' : '#E0E0E0'), backgroundColor: theme.dark ? '#111827' : '#F9FAFB' }
              ]}>
                <TextInput
                  key="first-name-input"
                  style={[styles.input, { color: theme.colors.text }]}
                  value={formData.firstName}
                  onChangeText={(text) => handleInputChange('firstName', text)}
                  placeholder="Enter your first name"
                  placeholderTextColor={theme.dark ? '#9CA3AF' : '#757575'}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
              {errors.firstName ? (
                <Text style={styles.errorText}>{errors.firstName}</Text>
              ) : null}
            </View>

            {/* Last Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Last Name</Text>
              <View style={[
                styles.inputContainer,
                { borderColor: errors.lastName ? '#FF4444' : (theme.dark ? '#3f3f46' : '#E0E0E0'), backgroundColor: theme.dark ? '#111827' : '#F9FAFB' }
              ]}>
                <TextInput
                  key="last-name-input"
                  style={[styles.input, { color: theme.colors.text }]}
                  value={formData.lastName}
                  onChangeText={(text) => handleInputChange('lastName', text)}
                  placeholder="Enter your last name"
                  placeholderTextColor={theme.dark ? '#9CA3AF' : '#757575'}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
              {errors.lastName ? (
                <Text style={styles.errorText}>{errors.lastName}</Text>
              ) : null}
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Email</Text>
              <View style={[
                styles.inputContainer,
                { borderColor: errors.email ? '#FF4444' : (theme.dark ? '#3f3f46' : '#E0E0E0'), backgroundColor: theme.dark ? '#111827' : '#F9FAFB' }
              ]}>
                <Ionicons name="mail-outline" size={20} color="#757575" />
                <TextInput
                  key="email-input"
                  style={[styles.input, { color: theme.colors.text }]}
                  value={formData.email}
                  onChangeText={(text) => handleInputChange('email', text)}
                  placeholder="Enter your email"
                  placeholderTextColor={theme.dark ? '#9CA3AF' : '#757575'}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}
            </View>

            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Phone Number (Optional)</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#757575" />
                <TextInput
                  key="phone-number-input"
                  style={[styles.input, { color: theme.colors.text }]}
                  value={formData.phoneNumber}
                  onChangeText={(text) => handleInputChange('phoneNumber', text)}
                  placeholder="Enter your phone number"
                  placeholderTextColor={theme.dark ? '#9CA3AF' : '#757575'}
                  keyboardType="phone-pad"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Password</Text>
              <View style={[
                styles.inputContainer,
                { borderColor: errors.password ? '#FF4444' : (theme.dark ? '#3f3f46' : '#E0E0E0'), backgroundColor: theme.dark ? '#111827' : '#F9FAFB' }
              ]}>
                <Ionicons name="lock-closed-outline" size={20} color="#757575" />
                <TextInput
                  key="password-input"
                  style={[styles.input, { color: theme.colors.text }]}
                  value={formData.password}
                  onChangeText={(text) => handleInputChange('password', text)}
                  placeholder="Create a password"
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
              {errors.password ? (
                <Text style={styles.errorText}>{errors.password}</Text>
              ) : null}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Confirm Password</Text>
              <View style={[
                styles.inputContainer,
                { borderColor: errors.confirmPassword ? '#FF4444' : (theme.dark ? '#3f3f46' : '#E0E0E0'), backgroundColor: theme.dark ? '#111827' : '#F9FAFB' }
              ]}>
                <Ionicons name="lock-closed-outline" size={20} color="#757575" />
                <TextInput
                  key="confirm-password-input"
                  style={[styles.input, { color: theme.colors.text }]}
                  value={formData.confirmPassword}
                  onChangeText={(text) => handleInputChange('confirmPassword', text)}
                  placeholder="Confirm your password"
                  placeholderTextColor={theme.dark ? '#9CA3AF' : '#757575'}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons 
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} 
                    size={20} 
                    color="#757575"
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword ? (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              ) : null}
            </View>

            {/* Register Button */}
            <TouchableOpacity 
              key="register-button"
              style={[styles.registerButton, { backgroundColor: '#111827' }]}
              onPress={handleRegister}
              disabled={submitting}
            >
              <Text style={styles.registerButtonText}>Create Account</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.dark ? '#9CA3AF' : '#6B7280' }] }>
              Already have an account?{' '}
              <TouchableOpacity onPress={handleSignIn}>
                <Text style={[styles.signInText, { color: theme.dark ? '#60A5FA' : '#2E7D5A' }]}>Sign In</Text>
              </TouchableOpacity>
            </Text>
          </View>
      </KeyboardAwareScrollView>
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
    flexGrow: 1,
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
  registerButton: {
    backgroundColor: '#111827',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
  signInText: {
    fontSize: 14,
    color: '#2E7D5A',
    fontWeight: '600',
  },
});

export default RegisterScreen;
