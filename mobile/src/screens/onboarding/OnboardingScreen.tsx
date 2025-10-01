import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch } from '../../store';
import { setOnboardingCompleted } from '../../store/slices/uiSlice';
import Swiper from 'react-native-swiper';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  image: string;
}

const onboardingSlides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Welcome to HausPet',
    description: 'Your comprehensive pet health and location monitoring companion. Keep your furry friends safe and healthy with real-time tracking.',
    image: '🐕',
  },
  {
    id: '2',
    title: 'Real-time Health Monitoring',
    description: 'Track your pet\'s heart rate, temperature, activity levels, and sleep patterns with our smart collar technology.',
    image: '💓',
  },
  {
    id: '3',
    title: 'GPS Location Tracking',
    description: 'Always know where your pet is with precise GPS tracking, safe zones, and instant alerts if they wander off.',
    image: '📍',
  },
  {
    id: '4',
    title: 'Smart Collar Integration',
    description: 'Connect seamlessly with your HausPet smart collar for comprehensive monitoring and peace of mind.',
    image: '📱',
  },
  {
    id: '5',
    title: 'Community & Support',
    description: 'Connect with other pet owners, find trusted pet sitters, and access veterinary services in your area.',
    image: '👥',
  },
];

const OnboardingScreen: React.FC = () => {
  const dispatch = useAppDispatch();

  const handleGetStarted = () => {
    dispatch(setOnboardingCompleted(true));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Swiper
        loop={false}
        dot={<View style={styles.dot} />}
        activeDot={<View style={styles.activeDot} />}
      >
        {onboardingSlides.map((slide, index) => (
          <View style={styles.slideContainer} key={slide.id}>
            <View style={styles.imageContainer}>
              <Text style={styles.emoji}>{slide.image}</Text>
            </View>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.description}</Text>
            {index === onboardingSlides.length - 1 && (
              <TouchableOpacity
                style={styles.getStartedButton}
                onPress={handleGetStarted}
              >
                <Text style={styles.getStartedButtonText}>Get Started</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </Swiper>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  slideContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    color: '#111827',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: '#6B7280',
  },
  dot: {
    backgroundColor: 'rgba(0,0,0,.2)',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3,
  },
  activeDot: {
    backgroundColor: '#111827',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3,
  },
  getStartedButton: {
    marginTop: 40,
    backgroundColor: '#111827',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  getStartedButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default OnboardingScreen;