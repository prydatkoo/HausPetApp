import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
  retryText?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  showRetry = false,
  retryText = 'Try Again',
  icon = 'alert-circle-outline',
}) => {
  return (
    <View style={styles.container}>
      <Ionicons 
        name={icon} 
        size={48} 
        color="#FF4444" 
        style={styles.icon}
      />
      <Text style={styles.message}>
        {message}
      </Text>
      {showRetry && onRetry && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
        >
          <Text style={styles.retryText}>
            {retryText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
    color: '#111827',
    fontWeight: '500',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#111827',
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ErrorMessage;