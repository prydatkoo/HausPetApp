import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

interface HealthAlertWidgetProps {
  petName: string;
  condition: string;
  onPress: () => void;
}

const HealthAlertWidget: React.FC<HealthAlertWidgetProps> = ({ petName, condition, onPress }) => {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <View style={[styles.iconContainer, { backgroundColor: theme.dark ? '#3f3f46' : '#F3F4F6' }] }>
        <Ionicons name="warning" size={22} color="#F59E0B" />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Health Alert for {petName}</Text>
        <Text style={[styles.conditionText, { color: theme.dark ? '#9CA3AF' : '#6B7280' }]}>Possible: {condition}</Text>
      </View>
      <TouchableOpacity onPress={onPress} style={[styles.button, { backgroundColor: '#111827' }] }>
        <Ionicons name="chevron-forward" size={20} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  conditionText: {
    fontSize: 14,
    marginTop: 4,
  },
  button: {
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HealthAlertWidget;

