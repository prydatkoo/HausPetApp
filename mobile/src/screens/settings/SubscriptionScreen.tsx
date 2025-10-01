import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../types';

type Plan = 'monthly' | 'yearly';

const SubscriptionScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const theme = useTheme();
  const styles = getStyles(theme);
  const [selectedPlan, setSelectedPlan] = useState<Plan>('yearly');

  const plans = {
    monthly: {
      title: 'Monthly',
      price: '$12.99',
      period: '/month',
      description: 'Flexible plan, cancel anytime.',
    },
    yearly: {
      title: 'Yearly',
      price: '$8.33',
      period: '/month',
      description: 'Billed as $99.99 annually. Save 35%!',
      badge: 'Best Value',
    },
  };

  const features = [
    { icon: 'map-outline', text: 'Real-time GPS Tracking', detail: 'Never lose your pet with live location updates.' },
    { icon: 'heart-outline', text: 'Health & Activity Monitoring', detail: 'Track vitals, sleep, and daily activity.' },
    { icon: 'chatbubble-ellipses-outline', text: '24/7 Dr. HausPet AI Chat', detail: 'Instant vet advice from our AI assistant.' },
    { icon: 'shield-checkmark-outline', text: 'Safe Zone Alerts', detail: 'Get notified when your pet leaves a designated area.' },
    { icon: 'videocam-outline', text: 'Vet Video Call Credits', detail: 'Connect with a professional vet via video call.' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="close" size={28} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.heroSection}>
          <Image source={{ uri: 'https://i.imgur.com/sC4J4i8.png' }} style={styles.collarImage} />
          <Text style={styles.heroTitle}>Complete Peace of Mind</Text>
          <Text style={styles.heroSubtitle}>
            Pair the HausPet Collar with a Premium plan for total protection and insight into your pet's life.
          </Text>
        </View>

        <View style={styles.planContainer}>
          {Object.keys(plans).map((planKey) => {
            const plan = plans[planKey as Plan];
            const isSelected = selectedPlan === planKey;
            return (
              <TouchableOpacity
                key={planKey}
                style={[styles.planCard, isSelected && styles.planCardSelected]}
                onPress={() => setSelectedPlan(planKey as Plan)}
              >
                {plan.badge && <View style={styles.badge}><Text style={styles.badgeText}>{plan.badge}</Text></View>}
                <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                  {isSelected && <View style={styles.radioInnerCircle} />}
                </View>
                <Text style={styles.planTitle}>{plan.title}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.planPrice}>{plan.price}</Text>
                  <Text style={styles.planPeriod}>{plan.period}</Text>
                </View>
                <Text style={styles.planDescription}>{plan.description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.featureSection}>
          <Text style={styles.featureSectionTitle}>All Plans Include</Text>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name={feature.icon as any} size={24} color={theme.colors.primary} style={styles.featureIcon} />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureText}>{feature.text}</Text>
                <Text style={styles.featureDetail}>{feature.detail}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.ctaButton}>
          <Text style={styles.ctaButtonText}>Get Your Plan</Text>
        </TouchableOpacity>
        <Text style={styles.footerText}>
          By continuing, you agree to our Terms of Service. Cancel anytime.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingBottom: 150,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    backButton: {
      padding: 8,
    },
    heroSection: {
      alignItems: 'center',
      paddingHorizontal: 24,
      marginBottom: 32,
    },
    collarImage: {
        width: 200,
        height: 200,
        resizeMode: 'contain',
        marginBottom: 24,
    },
    heroTitle: {
      fontSize: 28,
      fontWeight: '800',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 12,
    },
    heroSubtitle: {
      fontSize: 16,
      color: theme.dark ? '#9CA3AF' : '#6B7280',
      textAlign: 'center',
      lineHeight: 24,
    },
    planContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginHorizontal: 24,
      marginBottom: 32,
      gap: 16,
    },
    planCard: {
      flex: 1,
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      padding: 20,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    planCardSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.dark ? '#1E293B' : '#F0F5FF',
    },
    badge: {
      position: 'absolute',
      top: -1,
      right: 12,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      borderTopRightRadius: 0,
      borderBottomLeftRadius: 8,

    },
    badgeText: {
      color: 'white',
      fontSize: 11,
      fontWeight: '700',
    },
    radioCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: theme.dark ? '#4B5563' : '#D1D5DB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    radioCircleSelected: {
        borderColor: theme.colors.primary,
    },
    radioInnerCircle: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: theme.colors.primary,
    },
    planTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 8,
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginBottom: 4,
    },
    planPrice: {
      fontSize: 28,
      fontWeight: '800',
      color: theme.colors.text,
    },
    planPeriod: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.dark ? '#9CA3AF' : '#6B7280',
      marginLeft: 4,
    },
    planDescription: {
      fontSize: 13,
      color: theme.dark ? '#9CA3AF' : '#6B7280',
    },
    featureSection: {
      paddingHorizontal: 24,
    },
    featureSectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    featureIcon: {
      marginRight: 16,
    },
    featureTextContainer: {
        flex: 1,
    },
    featureText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 2,
    },
    featureDetail: {
        fontSize: 14,
        color: theme.dark ? '#9CA3AF' : '#6B7280',
    },
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 24,
      paddingTop: 16,
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderColor: theme.colors.border,
    },
    ctaButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: 'center',
      marginBottom: 12,
    },
    ctaButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '700',
    },
    footerText: {
      fontSize: 12,
      color: theme.dark ? '#9CA3AF' : '#6B7280',
      textAlign: 'center',
    },
  });

export default SubscriptionScreen;
