import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { useNavigation, useTheme } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Pet } from '../../types';

import { useAppSelector, useAppDispatch } from '../../store';
import { fetchPets, selectPet, deletePet } from '../../store/slices/petsSlice';
import { fetchCurrentHealthData } from '../../store/slices/healthSlice';
import { fetchCurrentLocation } from '../../store/slices/locationSlice';
import { fetchNotifications } from '../../store/slices/notificationsSlice';
import { logoutUser, setGuest, setInitialAuthRoute } from '../../store/slices/authSlice';

import ErrorMessage from '../../components/common/ErrorMessage';
import LoginGate from '../../components/common/LoginGate';
import { requestWidgetApproval, revokeWidget } from '../../store/slices/uiSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Avatar from '../../components/common/Avatar';
import { Image } from 'react-native';
import HealthAlertWidget from '../../components/dashboard/HealthAlertWidget';
import getPetIcon from '../../utils/getPetIcon';
import FirstPetTutorial from '../../components/pets/FirstPetTutorial';
import { APP_CONFIG } from '../../constants';
import { Linking } from 'react-native';

type DashboardNavigationProp = StackNavigationProp<RootStackParamList>;

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashboardNavigationProp>();
  const theme = useTheme();
  const styles = getStyles(theme);
  const dispatch = useAppDispatch();

  const { isAuthenticated, user, isGuest } = useAppSelector(state => state.auth);
  const { pets, selectedPet, isLoading: petsLoading, error: petsError } = useAppSelector(state => state.pets);
  const { currentData: healthData } = useAppSelector(state => state.health as { currentData: Record<string, any> });
  const { currentLocations } = useAppSelector(state => state.location);
  const { notifications, unreadCount } = useAppSelector(state => state.notifications);
  const { alerts: healthAlerts } = useAppSelector(state => state.healthAlerts);
  const { approvedHealthWidgets } = useAppSelector(state => state.ui);

  const [refreshing, setRefreshing] = useState(false);
  const [randomStatsByPet, setRandomStatsByPet] = useState<Record<string, { steps: number; heartRate: number }>>({});
  const [loginGate, setLoginGate] = useState<{
    visible: boolean;
    title: string;
    message: string;
    icon?: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap;
  }>({
    visible: false,
    title: '',
    message: '',
  });
  const [isTutorialVisible, setTutorialVisible] = useState(false);
  const tutorialShownRef = useRef(false);

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  const handleGuestSubscription = () => {
    navigation.getParent()?.navigate('Subscription');
  };

  const getStatus = (pet: Pet) => {
    const petHealth = healthData[pet.id];
    if (!petHealth) return { color: '#6B7280', text: 'Unknown' };

    if (petHealth.activityLevel > 5) return { color: '#10B981', text: 'Active' };
    if (['good', 'excellent'].includes(petHealth.sleepQuality)) return { color: '#8B5CF6', text: 'Sleeping' };
    
    return { color: '#F59E0B', text: 'Resting' };
  };

  const formatNumber = (num: number | string) => {
    if (num === null || num === undefined) return '—';
    const n = typeof num === 'string' ? Number(num) : num;
    if (isNaN(n)) return '—';
    try { return n.toLocaleString(); } catch { return String(n); }
  };

  useEffect(() => {
    // Fetch initial data when the component mounts and user is authenticated
    if (isAuthenticated) {
      dispatch(fetchPets());
      dispatch(fetchNotifications());
    }
  }, [isAuthenticated, dispatch]);

  const generateRandomForPet = (petId: string) => {
    const randomSteps = Math.floor(8000 + Math.random() * 12000); // 8k - 20k
    const randomBpm = Math.floor(70 + Math.random() * 40); // 70 - 110
    return { steps: randomSteps, heartRate: randomBpm };
  };

  useEffect(() => {
    if (!pets || pets.length === 0) return;
    setRandomStatsByPet(prev => {
      const next = { ...prev };
      pets.forEach(p => { if (!next[p.id]) next[p.id] = generateRandomForPet(p.id); });
      return next;
    });
  }, [pets]);

  // Auto-open tutorial once after login if user has no pets
  useEffect(() => {
    if ((isAuthenticated || isGuest) && !petsLoading && pets.length === 0 && !tutorialShownRef.current) {
      tutorialShownRef.current = true;
      setTutorialVisible(true);
    }
  }, [isAuthenticated, isGuest, petsLoading, pets.length]);

  const profileInitial = (user?.firstName || user?.email)?.charAt(0)?.toUpperCase() || 'H';

  const displayPets = pets;
  const displaySelectedPet = selectedPet;
  const displayHealthData = selectedPet ? healthData[selectedPet.id] : null;
  const displayLocationData = selectedPet ? currentLocations[selectedPet.id] : null;
  const displayNotifications = notifications;
  const displayUnreadCount = unreadCount;
  const activeAlerts = healthAlerts.map(alert => {
        const pet = pets.find(p => p.id === String(alert.petId));
    return pet ? { ...alert, petName: pet.name } : null;
  }).filter(Boolean);


  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    setRandomStatsByPet(prev => {
      const next: Record<string, { steps: number; heartRate: number }> = {};
      pets.forEach(p => { next[p.id] = generateRandomForPet(p.id); });
      return next;
    });
    setRefreshing(false);
  };

  const showLoginGate = (title: string, message: string, icon?: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap) => {
    setLoginGate({ visible: true, title, message, icon });
  };

  const handleEmergencyPress = () => {
    if (!isAuthenticated) {
      showLoginGate(
        'Emergency Mode',
        'Sign up to activate emergency features and get instant alerts when your pet needs help.',
        'warning'
      );
      return;
    }
    if (selectedPet) {
      navigation.navigate('EmergencyMode', { petId: selectedPet.id });
    }
  };

  const handleSubscriptionPress = () => {
    if (isAuthenticated) {
      const parentNavigator = navigation.getParent();
      if (parentNavigator) {
        parentNavigator.navigate('Subscription');
      } else {
        console.warn("Could not find parent navigator to open Subscription screen.");
      }
    } else {
      navigation.getParent()?.navigate('Subscription');
    }
  };

  const handleHealthPress = () => {
    if (!isAuthenticated) {
      showLoginGate(
        'Health Monitoring',
        'Create an account to track your pet\'s real-time health data, set up alerts, and monitor trends.',
        'heart'
      );
      return;
    }
    navigation.navigate('Main', { screen: 'Health' });
  };

  const handleLocationPress = () => {
    if (!isAuthenticated) {
      showLoginGate(
        'GPS Tracking',
        'Sign up to track your pet\'s location in real-time, set safe zones, and never lose your furry friend.',
        'location'
      );
      return;
    }
    navigation.navigate('Main', { screen: 'Map' });
  };

  const handleNotificationsPress = () => {
    if (!isAuthenticated) {
      showLoginGate(
        'Notifications & Alerts',
        'Get instant notifications about your pet\'s health, location, and safety. Sign up to stay connected.',
        'notifications'
      );
      return;
    }
    navigation.navigate('Notifications');
  };

  const handlePetSelect = (pet: any) => {
    if (!isAuthenticated) {
      showLoginGate(
        'Pet Management',
        'Create an account to add your pets, manage their profiles, and access all HausPet features.',
        'paw'
      );
      return;
    }
    dispatch(selectPet(pet));
    navigation.navigate('PetDetails', { petId: pet.id });
  };

  const handleAddPet = () => {
    if (isGuest) {
      showLoginGate(
        'Add a Pet',
        'Please sign in to add a pet and start monitoring their health and location.',
        'paw'
      );
      return;
    }
    navigation.getParent()?.navigate('AddPet');
  };

  const handleEditPet = (petId: string) => {
    // TODO: Open inline edit modal instead of navigation
    Alert.alert('Edit Pet', 'Inline editing coming soon!');
  };

  const handleDeletePet = (petId: string) => {
    Alert.alert(
      'Delete Pet',
      'Are you sure you want to delete this pet?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: async () => {
            try {
              await dispatch(deletePet(petId)).unwrap();
              Alert.alert('Pet Deleted', 'The pet has been successfully deleted.');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete pet. Please try again.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderRightActions = (petId: string) => {
    return (
      <View style={styles.rightActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditPet(petId)}
        >
          <Ionicons name="pencil" size={20} color="white" />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeletePet(petId)}
        >
          <Ionicons name="trash" size={20} color="white" />
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // data loading
  const loadDashboardData = async () => {
    if (!isAuthenticated) return;
    dispatch(fetchNotifications());
  };

  const loadPetSpecificData = async () => {
    if (!selectedPet || !isAuthenticated) return;
    try {
      await Promise.all([
        dispatch(fetchCurrentHealthData(selectedPet.id)).unwrap().catch(() => {}),
        dispatch(fetchCurrentLocation(selectedPet.id)).unwrap().catch(() => {}),
      ]);
    } catch {}
  };

  useEffect(() => {
    loadDashboardData();
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedPet) loadPetSpecificData();
  }, [selectedPet]);

  return (
    <View style={styles.container}>
      {/* Premium Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.greetingSection}>
            <Text style={styles.greeting}>Good {getTimeOfDay()}</Text>
            <Text style={styles.userName}>{isAuthenticated ? `Welcome back, ${user?.firstName || user?.email?.split('@')[0] || 'User'}` : 'Welcome, Guest'}</Text>
          </View>
          
          {isAuthenticated ? (
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.notificationButton}
                onPress={handleNotificationsPress}
              >
                <Ionicons name="notifications-outline" size={24} color={theme.dark ? '#9CA3AF' : "#6B7280"} />
                {displayUnreadCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>{displayUnreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.notificationButton}
                onPress={() => navigation.navigate('Settings')}
              >
                <Ionicons name="settings-outline" size={24} color={theme.dark ? '#9CA3AF' : "#6B7280"} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.notificationButton}
                onPress={async () => { await dispatch(logoutUser()); navigation.navigate('Auth'); }}
              >
                <Ionicons name="log-out-outline" size={24} color="#EF4444" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.subscribeButton} 
                onPress={() => navigation.getParent()?.navigate('Subscription')}
              >
                <Ionicons name="sparkles" size={16} color="white" />
                <Text style={styles.subscribeButtonText}>Subscribe</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.profileButton} accessibilityRole="button" accessibilityLabel="Open profile">
                <View style={styles.profileAvatar}>
                  <Text style={styles.profileInitial}>{profileInitial}</Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.authButtonsContainer}>
              <TouchableOpacity 
                style={styles.signInButton} 
                onPress={() => dispatch(setGuest(false))}
              >
                <Text style={styles.signInText}>Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.subscribeButton} 
                onPress={handleGuestSubscription}
              >
                <Ionicons name="sparkles" size={16} color="white" />
                <Text style={styles.subscribeButtonText}>Subscribe</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4285f4"
            colors={['#4285f4']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Health Alerts */}
        {activeAlerts.length > 0 && (
          <View style={styles.healthAlertsSection}>
            {activeAlerts.map((alert, index) => (
              <HealthAlertWidget
                key={index}
                petName={alert?.petName || 'Unknown'}
                condition={alert?.condition || 'Unknown'}
                onPress={() => navigation.navigate('Main', { screen: 'Health' })}
              />
            ))}
          </View>
        )}

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={[styles.heroTitle, { color: theme.colors.text }]}>Your Pets</Text>
          <Text style={[styles.heroSubtitle, { color: theme.dark ? '#9CA3AF' : '#6B7280' }]}>Keep track of your furry family members</Text>
        </View>

        {isGuest && (
          <View style={styles.guestPrompt}>
            <Text style={styles.guestPromptTitle}>Unlock HausPet's Full Potential</Text>
            <Text style={styles.guestPromptText}>
              To start tracking your pet's health and location, you'll need to purchase a HausPet collar.
            </Text>
            <TouchableOpacity style={styles.guestPromptButton} onPress={handleGuestSubscription}>
              <Text style={styles.guestPromptButtonText}>Purchase a Collar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty State Tutorial */}
        {!isGuest && displayPets.length === 0 && (
          <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, padding: 20, marginHorizontal: 24, marginBottom: 16 }]}> 
            <Text style={{ fontSize: 18, fontWeight: '800', color: theme.colors.text, marginBottom: 6 }}>Welcome to HausPet</Text>
            <Text style={{ color: theme.dark ? '#9CA3AF' : '#6B7280', marginBottom: 12 }}>Add your first dog to start live tracking, health insights, and chatting with Dr. HausPet.</Text>
            <TouchableOpacity onPress={handleAddPet} style={{ backgroundColor: '#111827', paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Add Your First Pet</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Approved Health Widgets from Chat */}
        {approvedHealthWidgets.length > 0 && (
          <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
            {approvedHealthWidgets.map((w) => (
              <View key={w.id} style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, padding: 16, marginBottom: 10 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.text }}>{w.title}</Text>
                  <TouchableOpacity onPress={() => dispatch(revokeWidget({ id: w.id }))}>
                    <Ionicons name="close" size={18} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                <Text style={{ marginTop: 6, color: theme.dark ? '#9CA3AF' : '#6B7280' }}>{w.metric}: {w.value}</Text>
                <Text style={{ marginTop: 4, fontSize: 12, color: '#9CA3AF' }}>Approved {new Date(w.approvedAt).toLocaleString()}</Text>
                {/* Prompt CTA */}
                <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center' }}>
                  {pets.find(p => p.id === w.petId)?.avatar ? (
                    <Image source={{ uri: pets.find(p => p.id === w.petId)?.avatar || undefined }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }} />
                  ) : (
                    <View style={{ marginRight: 12 }}>
                      <Avatar
                        species={pets.find(p => p.id === w.petId)?.species || 'dog'}
                        breed={pets.find(p => p.id === w.petId)?.breed}
                        size={40}
                      />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.colors.text, fontWeight: '600', marginBottom: 8 }}>
                      {`Is ${pets.find(p=>p.id===w.petId)?.name || 'your dog'} okay? Need further assistance?`}
                    </Text>
                     <View style={{ flexDirection: 'row', gap: 10 }}>
                      <TouchableOpacity
                        onPress={() => navigation.navigate('Main', { screen: 'Chat' })}
                         style={{ flex: 1, backgroundColor: '#111827', paddingVertical: 12, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                        accessibilityRole="button"
                        accessibilityLabel="Chat with Dr. HausPet"
                      >
                         <Ionicons name="medkit-outline" size={18} color="#fff" />
                         <Text style={{ color: '#fff', fontWeight: '700', marginLeft: 8, flexShrink: 1, textAlign: 'center' }}>Chat with{'\n'}Dr. HausPet</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => navigation.getParent()?.navigate('VideoCall')}
                         style={{ flex: 1, backgroundColor: '#2563EB', paddingVertical: 12, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', columnGap: 8 }}
                        accessibilityRole="button"
                        accessibilityLabel="Start video call with a vet"
                      >
                        <Ionicons name="videocam" size={16} color="#fff" />
                        <Text style={{ color: '#fff', fontWeight: '700' }}>Video Call Vet</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Pet Cards */}
        <View style={styles.petsSection}>
          {displayPets.map((pet, index) => (
            <Swipeable 
              key={pet.id || `pet-${index}`}
              renderRightActions={() => renderRightActions(pet.id)}
            >
              <TouchableOpacity 
                style={[styles.petCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                onPress={() => handlePetSelect(pet)}
                activeOpacity={0.95}
              >
              <View style={styles.petCardContent}>
                <View style={styles.petTopSection}>
                  <View style={styles.petImageSection}>
                    <View style={styles.petAvatarContainer}>
                      {pet.avatar ? (
                        <Image source={{ uri: pet.avatar }} style={styles.petAvatarImage} />
                      ) : (
                        <Avatar 
                          species={pet.species} 
                          breed={pet.breed} 
                          size={64}
                        />
                      )}
                    </View>
                    <View style={[
                      styles.statusIndicatorLarge,
                      { backgroundColor: getStatus(pet).color }
                    ]}>
                      <View style={styles.statusDotInner} />
                    </View>
                  </View>
                  
                  <View style={styles.petDetailsSection}>
                    <View style={styles.petNameRow}>
                      <Text 
                        style={[styles.petNameLarge, { color: theme.colors.text }]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {pet.name}
                      </Text>
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: getStatus(pet).color + '15' }
                      ]}>
                        <Text style={[
                          styles.statusBadgeText,
                          { color: getStatus(pet).color }
                        ]}>
                          {getStatus(pet).text}
                        </Text>
                      </View>
                    </View>
                    
                    <Text style={[styles.petBreedLarge, { color: theme.dark ? '#9CA3AF' : '#6B7280' }]}>
                      {pet.breed}
                    </Text>
                    
                    <View style={styles.petLocationRow}>
                      <View style={styles.locationIndicator}>
                        <Text style={styles.locationEmoji}>📍</Text>
                      </View>
                      <Text style={styles.locationTextLarge}>
                        {currentLocations[pet.id] ? `${currentLocations[pet.id].latitude.toFixed(2)}, ${currentLocations[pet.id].longitude.toFixed(2)}` : 'Unknown Location'}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={[styles.petStatsSection, { backgroundColor: theme.dark ? '#27272a' : '#F9FAFB' }]}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: theme.colors.text }]}>
                      {healthData[pet.id] ? formatNumber(healthData[pet.id].steps) : formatNumber(randomStatsByPet[pet.id]?.steps ?? generateRandomForPet(pet.id).steps)}
                    </Text>
                    <Text style={styles.statLabel}>steps</Text>
                  </View>
                  <View style={[styles.statDivider, { backgroundColor: theme.dark ? '#3f3f46' : '#E5E7EB'}]} />
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: theme.colors.text }]}>
                      {healthData[pet.id] ? formatNumber(healthData[pet.id].heartRate) : formatNumber(randomStatsByPet[pet.id]?.heartRate ?? generateRandomForPet(pet.id).heartRate)}
                    </Text>
                    <Text style={styles.statLabel}>bpm</Text>
                  </View>
                </View>
              </View>
              </TouchableOpacity>
            </Swipeable>
          ))}
          
          {/* Add New Pet Card */}
          <TouchableOpacity 
            style={[styles.addPetCardLarge, { backgroundColor: theme.colors.card, borderColor: theme.dark ? '#3f3f46' : '#E5E7EB' }]}
            onPress={handleAddPet}
            activeOpacity={0.95}
          >
            <View style={styles.addPetContent}>
              <View style={[styles.addPetIcon, { borderColor: theme.dark ? '#3f3f46' : '#E5E7EB'}]}>
                <Text style={[styles.addPetIconText, { color: theme.dark ? '#52525b' : '#9CA3AF'}]}>+</Text>
              </View>
              <Text style={[styles.addPetTitle, { color: theme.colors.text }]}>Add New Pet</Text>
              <Text style={[styles.addPetSubtitle, { color: theme.dark ? '#9CA3AF' : '#6B7280' }]}>Start monitoring your furry friend</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Browse Map Section */}
        <View style={styles.mapSection}>
          <TouchableOpacity 
            style={[styles.mapCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            onPress={() => navigation.navigate('Main', { screen: 'Map' })}
          >
            <View>
              <Text style={[styles.mapTitle, { color: theme.colors.text }]}>Browse Map</Text>
               <Text style={[styles.mapSubtitle, { color: theme.dark ? '#9CA3AF' : '#6B7280' }]}>Find pet sitters and services near you</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>


      </ScrollView>

      <LoginGate
        visible={loginGate.visible}
        onClose={() => setLoginGate({ ...loginGate, visible: false })}
        title={loginGate.title}
        message={loginGate.message}
        featureIcon={loginGate.icon}
        onSignIn={() => dispatch(setGuest(false))}
        onSignUp={() => {
          dispatch(setInitialAuthRoute('Register'));
          dispatch(setGuest(false));
        }}
      />
      
      
      <TouchableOpacity 
        style={styles.floatingActionButton}
                onPress={() => navigation.navigate('Main', { screen: 'Chat' })}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Open Dr. HausPet chat"
      >
        <Ionicons name="chatbubble-ellipses-outline" size={24} color="white" />
      </TouchableOpacity>
      {isTutorialVisible && (
        <FirstPetTutorial
          visible={isTutorialVisible}
          onClose={() => {
            setTutorialVisible(false);
            if (isAuthenticated) {
              navigation.getParent()?.navigate('AddPet');
            } else {
              showLoginGate(
                'Add a Pet',
                'Please sign in to add a pet and start monitoring their health and location.',
                'paw'
              );
            }
          }}
        />
      )}
    </View>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  
  // Premium Header
  header: {
    backgroundColor: theme.colors.card,
    paddingVertical: 20,
    paddingHorizontal: 24,
    paddingTop: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greetingSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 18,
    color: theme.dark ? '#9CA3AF' : '#6B7280',
    fontWeight: '600',
    marginBottom: 6,
  },
  userName: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.8,
  },
  authButtonsContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  demoButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#10B981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  demoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  exitDemoButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exitDemoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  signInButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  signInText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  subscribeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#111827',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subscribeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  signUpButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#111827',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signUpText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  profileButton: {
    padding: 4,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },

  // Hero Section
  heroSection: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
    letterSpacing: -1,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '600',
    lineHeight: 26,
  },

  healthAlertsSection: {
    paddingHorizontal: 24,
    marginTop: -16,
    marginBottom: 16,
  },

  // Pet Cards Section
  petsSection: {
    paddingHorizontal: 24,
    gap: 20,
    marginBottom: 32,
  },
  guestPrompt: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  guestPromptTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 10,
  },
  guestPromptText: {
    fontSize: 16,
    color: theme.dark ? '#9CA3AF' : '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  guestPromptButton: {
    backgroundColor: '#111827',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  guestPromptButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  petCard: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
  },
  petCardContent: {
    flexDirection: 'column',
    width: '100%',
  },
  petTopSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  petImageSection: {
    position: 'relative',
    marginRight: 20,
  },
  petAvatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petAvatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.dark ? '#3F3F46' : '#F3F4F6',
  },
  petAvatarImage: {
    width: 80,
    height: 80,
    borderRadius: 24,
  },
  petEmojiLarge: {
    fontSize: 36,
  },
  petIcon: {
    width: 48,
    height: 48,
  },
  statusIndicatorLarge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  statusDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
                    petDetailsSection: {
    flex: 1,
    flexShrink: 1,
    minWidth: 150,
    maxWidth: '70%',
  },
  petNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    minWidth: 0,
    flex: 1,
  },
  petNameLarge: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    flexShrink: 1,
    color: theme.colors.text,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  petBreedLarge: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
    color: theme.dark ? '#9CA3AF' : '#6B7280',
  },
  petLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIndicator: {
    marginRight: 6,
  },
  locationEmoji: {
    fontSize: 12,
  },
  locationTextLarge: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  petStatsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
    marginHorizontal: 16,
  },
  petActions: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginLeft: 16,
  },
  actionButton: {
    padding: 8,
  },

  // Swipe Actions
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 140,
  },
  editButton: {
    backgroundColor: '#3B82F6',
    width: 70,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    width: 70,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },

  // Add Pet Card
  addPetCardLarge: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  addPetContent: {
    alignItems: 'center',
  },
  addPetIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    marginBottom: 16,
  },
  addPetIconText: {
    fontSize: 28,
    fontWeight: '300',
  },
  addPetTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  addPetSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Map Section
  mapSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  mapCard: {
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    color: theme.colors.text,
  },
  mapSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.dark ? '#9CA3AF' : '#6B7280',
  },

  // Quick Actions Section
  quickActionsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitleLarge: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  primaryActionsRow: {
    gap: 16,
    marginBottom: 16,
  },
  primaryActionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  trackAction: {
    backgroundColor: '#EEF2FF',
  },
  healthAction: {
    backgroundColor: '#FEF2F2',
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionIconText: {
    fontSize: 20,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitleLarge: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  actionDescriptionLarge: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    lineHeight: 20,
  },
  actionArrow: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryActionCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F9FAFB',
  },
  secondaryActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  secondaryActionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  
  // Header Actions
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'white',
  },
  
  // Floating Action Button
  floatingActionButton: {
    position: 'absolute',
    bottom: 100,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 3,
    borderColor: theme.colors.background,
  },
  addPetButton: {
    marginTop: 20,
    backgroundColor: '#111827',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
  },
  addPetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
});

export default DashboardScreen;
