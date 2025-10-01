import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppSelector, useAppDispatch } from '../../store';
import { resetPassword, clearError as clearAuthError } from '../../store/slices/authSlice';
import { clearError as clearHealthError } from '../../store/slices/healthSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';

type AuthNavigationProp = StackNavigationProp<any>;

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<AuthNavigationProp>();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector(state => state.auth);

  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    dispatch(clearAuthError());
    dispatch(clearHealthError());
  }, [dispatch]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      await dispatch(resetPassword(email)).unwrap();
      setEmailSent(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send reset email. Please try again.');
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  const handleResendEmail = () => {
    setEmailSent(false);
    handleResetPassword();
  };

  if (emailSent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="mail" size={48} color="#10B981" />
          </View>
          
          <Text style={styles.title}>Check Your Email</Text>
          
          <Text style={styles.description}>
            We've sent a password reset link to{'\n'}
            <Text style={styles.emailText}>{email}</Text>
          </Text>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={handleBackToLogin}
          >
            <Text style={styles.buttonText}>Back to Login</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={handleResendEmail}
          >
            <Text style={styles.linkText}>Didn't receive the email? Resend</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LoadingSpinner visible={isLoading} />
      
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="lock-closed" size={48} color="#111827" />
        </View>
        
        <Text style={styles.title}>Forgot Password?</Text>
        
        <Text style={styles.description}>
          Enter your email address and we'll send you a link to reset your password.
        </Text>
        
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#757575" />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#757575"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          
          <TouchableOpacity 
            style={[
              styles.button,
              { opacity: isLoading ? 0.7 : 1 }
            ]}
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Send Reset Link</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.linkButton}
          onPress={handleBackToLogin}
        >
          <Text style={styles.linkText}>← Back to Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
    fontWeight: '500',
  },
  emailText: {
    fontWeight: '600',
    color: '#111827',
  },
  form: {
    width: '100%',
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 24,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
  },
  button: {
    backgroundColor: '#111827',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  linkButton: {
    padding: 12,
  },
  linkText: {
    fontSize: 14,
    color: '#2E7D5A',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ForgotPasswordScreen;