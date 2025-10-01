import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useAppSelector, useAppDispatch } from '../../store';
import { hideToast } from '../../store/slices/uiSlice';
import { Ionicons } from '@expo/vector-icons';

const toastColors = {
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
};

const GlobalToast: React.FC = () => {
  const dispatch = useAppDispatch();
  const toast = useAppSelector((state) => state.ui.toast);
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (toast) {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        dispatch(hideToast());
      }, toast.duration || 3000);

      return () => clearTimeout(timer);
    } else {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [toast, dispatch, animatedValue]);

  if (!toast) {
    return null;
  }

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 20],
  });

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
      <View style={[styles.toast, { backgroundColor: toastColors[toast.type] }]}>
        <Ionicons name="notifications" size={24} color="white" />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{toast.title}</Text>
          {toast.message && <Text style={styles.message}>{toast.message}</Text>}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
  },
  textContainer: {
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  message: {
    fontSize: 14,
    color: 'white',
  },
});

export default GlobalToast;
