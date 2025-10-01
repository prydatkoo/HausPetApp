import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

interface LoadingSpinnerProps {
  visible?: boolean;
  size?: 'small' | 'large';
  message?: string;
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  visible = true,
  size = 'large',
  message,
  color = '#111827',
}) => {
  if (!visible) return null;
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text style={styles.message}>
          {message}
        </Text>
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
  message: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    color: '#6B7280',
    fontWeight: '500',
  },
});

export default LoadingSpinner;