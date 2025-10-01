import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface LoginGateProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  featureIcon?: keyof typeof Ionicons.glyphMap;
  onSignIn: () => void;
  onSignUp: () => void;
}

const LoginGate: React.FC<LoginGateProps> = ({
  visible,
  onClose,
  title,
  message,
  featureIcon = 'lock-closed',
  onSignIn,
  onSignUp,
}) => {
  const navigation = useNavigation();

  const handleLogin = () => {
    onClose();
    onSignIn();
  };

  const handleSignUp = () => {
    onClose();
    onSignUp();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.iconContainer}>
            <Ionicons name={featureIcon} size={48} color="#111827" />
          </View>

          <Text style={styles.title}>
            {title}
          </Text>

          <Text style={styles.message}>
            {message}
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSignUp}
            >
              <Text style={styles.primaryButtonText}>
                Get Started
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleLogin}
            >
              <Text style={styles.secondaryButtonText}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.benefitText}>
            ✓ Real-time pet health monitoring{'\n'}
            ✓ GPS location tracking{'\n'}
            ✓ Smart collar integration{'\n'}
            ✓ Community features
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 8,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
    color: '#111827',
    letterSpacing: -0.5,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    color: '#6B7280',
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 24,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#111827',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  benefitText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    color: '#6B7280',
    fontWeight: '500',
  },
});

export default LoginGate;