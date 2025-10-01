import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppSelector, useAppDispatch } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';
import { useTheme, useNavigation } from '@react-navigation/native';
import { usePreferences } from '../../context/PreferencesContext';
import { StackNavigationProp } from '@react-navigation/stack';

type SettingsNavigationProp = StackNavigationProp<any>;


const SettingsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<SettingsNavigationProp>();
  const { user } = useAppSelector(state => state.auth);
  const theme = useTheme();
  const styles = getStyles(theme);
  const { prefs, setDarkMode, setHealthAlerts, setLocationAlerts, setBiometricEnabled } = usePreferences();
  const handleLogout = async () => { await dispatch(logoutUser()); };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>
          Customize your HausPet experience
        </Text>

        <View style={styles.section} key="account-section">
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.setting}> 
            <Text style={styles.settingText}>Logged in as</Text>
            <Text style={styles.valueText}>{user?.firstName || user?.email || 'Guest'}</Text>
          </View>
          <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.primary }]} onPress={() => navigation.navigate('Subscription')}>
            <Text style={styles.buttonText}>Subscription</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { backgroundColor: '#EF4444' }]} onPress={handleLogout}>
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section} key="appearance-section">
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.setting}>
            <Text style={styles.settingText}>Dark Mode</Text>
            <Switch value={prefs.darkMode} onValueChange={setDarkMode} />
          </View>
        </View>

        <View style={styles.section} key="notifications-section">
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.setting}>
            <Text style={styles.settingText}>Health Alerts</Text>
            <Switch value={prefs.notifications.healthAlerts} onValueChange={setHealthAlerts} />
          </View>
          <View style={styles.setting}>
            <Text style={styles.settingText}>Location Alerts</Text>
            <Switch value={prefs.notifications.locationAlerts} onValueChange={setLocationAlerts} />
          </View>
        </View>

        <View style={styles.section} key="security-section">
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.setting}>
            <Text style={styles.settingText}>Biometric Unlock</Text>
            <Switch value={prefs.biometricEnabled} onValueChange={setBiometricEnabled} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    color: theme.colors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: theme.colors.text,
  },
  section: {
    width: '100%',
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: 16,
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  valueText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  button: {
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default SettingsScreen;