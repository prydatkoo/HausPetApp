import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const NotificationsScreen: React.FC = () => {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient colors={theme.dark ? ['#0B0F14', '#0B0F14'] : ['#FFFFFF', '#FFFFFF']} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} />
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Notifications
        </Text>
        <Text style={[styles.subtitle, { color: theme.dark ? '#9CA3AF' : '#6B7280' }]}>
          Coming soon - View and manage all your pet alerts and notifications
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default NotificationsScreen;