import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppSelector } from '../../store';

const AppointmentScreen: React.FC = () => {
  

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#FFFFFF" }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: "#111827" }]}>
          Appointment
        </Text>
        <Text style={[styles.subtitle, { color: "#6B7280" }]}>
          Coming soon - Schedule and manage veterinary appointments
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
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default AppointmentScreen;