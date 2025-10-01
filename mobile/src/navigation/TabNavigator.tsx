import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAppSelector } from '../store';
import { useTheme } from '@react-navigation/native';
import { TabParamList } from '../types';
import { useNavigation } from '@react-navigation/native';

// Screens
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import HealthScreen from '../screens/health/HealthScreen';
import MapScreen from '../screens/location/MapScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import ChatbotScreen from '../screens/community/ChatbotScreen';

const Tab = createBottomTabNavigator<TabParamList>();

const HomeButton: React.FC<{
  onPress?: (e: any) => void;
  accessibilityState?: { selected?: boolean };
}> = ({ onPress, accessibilityState }) => {
  const focused = accessibilityState?.selected;

  const handlePress = async (e: any) => {
    try { await Haptics.selectionAsync(); } catch {}
    onPress?.(e);
  };

  return (
    <View style={styles.homeButtonContainer}>
      <TouchableOpacity
        style={[styles.homeButton, focused && styles.homeButtonFocused]}
        onPress={handlePress}
      >
        <Ionicons
          name={focused ? 'home' : 'home-outline'}
          size={32}
          color={focused ? '#FFFFFF' : '#111827'}
        />
      </TouchableOpacity>
    </View>
  );
};

const TabNavigator: React.FC = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { isAuthenticated } = useAppSelector(state => state.auth);

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Map':
              iconName = 'map-outline';
              break;
            case 'Health':
              iconName = focused ? 'heart' : 'heart-outline';
              break;
            case 'Chat':
              iconName = 'chatbubble-outline';
              break;
            // no-op
            default:
              iconName = 'map-outline';
          }

          if (route.name === 'Home') {
            return null;
          }

          return <Ionicons name={iconName} size={24} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.text,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          paddingBottom: 24,
          paddingTop: 12,
          height: 88,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
          elevation: 12,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 6,
        },
        headerShown: false,
        tabBarShowLabel: true,
      })}
    >
            <Tab.Screen 
        name="Map" 
        component={MapScreen}
        options={{
          tabBarLabel: 'Map',
        }}
      />
      <Tab.Screen 
        name="Health" 
        component={HealthScreen}
        options={{
          tabBarLabel: 'Health',
        }}
      />
      <Tab.Screen 
        name="Home" 
        component={DashboardScreen}
        options={{
          tabBarLabel: '',
          tabBarButton: (props) => <HomeButton {...props} />,
        }}
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatbotScreen}
        options={{
          tabBarLabel: 'Dr. HausPet',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="medkit-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" color={color} size={size} />
          ),
        }}
      />
      {/** Sitters tab temporarily removed */}
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  homeButtonContainer: {
    top: -24,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: 80,
  },
  homeButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 4,
    borderColor: 'white',
  },
  homeButtonFocused: {
    backgroundColor: '#111827',
  },
  // overlayContainer removed
});

export default TabNavigator;