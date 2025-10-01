import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Modal, Image, Platform, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppSelector, useAppDispatch } from '../../store';
import HealthIssuesWidget from '../../components/health/HealthIssuesWidget';
import HealthHistoryGraph from '../../components/health/HealthHistoryGraph';
import { RootStackParamList, Pet, HealthData, LocationData } from '../../types';
import { useTheme } from '@react-navigation/native';

const MOCK_PET: Pet = {
  id: '1',
  name: 'Buddy',
  species: 'dog',
  breed: 'Golden Retriever',
  age: 5,
  weight: 29,
  gender: 'male',
  color: 'Golden',
  avatar: 'https://example.com/buddy.jpg',
  ownerId: '1',
  collarId: '1',
  medicalHistory: [],
  vaccinations: [],
  medications: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const MOCK_HEALTH_DATA: HealthData = {
  id: '1',
  petId: '1',
  heartRate: 78,
  temperature: 38.6,
  activityLevel: 7,
  steps: 14231,
  distance: 7.1,
  licking: 5,
  scratching: 3,
  sleepDuration: 8.2,
  sleepQuality: 'good',
  timestamp: new Date(),
};

const MOCK_LOCATION_DATA: LocationData = {
  id: '1',
  petId: '1',
  latitude: 52.51627,
  longitude: 13.37770,
  accuracy: 10,
  timestamp: new Date(),
  isInSafeZone: true,
};

type HealthMetric = 'Heart Rate' | 'Temperature' | 'Activity' | 'Sleep' | 'Steps' | 'Distance' | 'Licking' | 'Scratching';

const MOCK_HISTORICAL_HEALTH_DATA: Record<HealthMetric, { x: string; y: number }[]> = {
  'Heart Rate': [
    { x: '12 AM', y: 75 },
    { x: '2 AM', y: 72 },
    { x: '4 AM', y: 74 },
    { x: '6 AM', y: 78 },
    { x: '8 AM', y: 85 },
    { x: '10 AM', y: 92 },
    { x: '12 PM', y: 90 },
    { x: '2 PM', y: 88 },
    { x: '4 PM', y: 82 },
    { x: '6 PM', y: 78 },
    { x: '8 PM', y: 76 },
    { x: '10 PM', y: 75 },
  ],
  'Temperature': [
    { x: '12 AM', y: 38.5 },
    { x: '3 AM', y: 38.4 },
    { x: '6 AM', y: 38.5 },
    { x: '9 AM', y: 38.7 },
    { x: '12 PM', y: 38.8 },
    { x: '3 PM', y: 38.6 },
    { x: '6 PM', y: 38.5 },
    { x: '9 PM', y: 38.4 },
  ],
  'Activity': [
    { x: '12 AM', y: 0 },
    { x: '3 AM', y: 0 },
    { x: '6 AM', y: 2 },
    { x: '9 AM', y: 7 },
    { x: '12 PM', y: 9 },
    { x: '3 PM', y: 6 },
    { x: '6 PM', y: 4 },
    { x: '9 PM', y: 1 },
  ],
  'Sleep': [
    { x: 'Mon', y: 7 },
    { x: 'Tue', y: 7.5 },
    { x: 'Wed', y: 6.5 },
    { x: 'Thu', y: 8 },
    { x: 'Fri', y: 7 },
    { x: 'Sat', y: 8.5 },
    { x: 'Sun', y: 7.5 },
  ],
  'Steps': [
    { x: 'Mon', y: 10000 },
    { x: 'Tue', y: 12345 },
    { x: 'Wed', y: 9876 },
    { x: 'Thu', y: 15432 },
    { x: 'Fri', y: 11234 },
    { x: 'Sat', y: 18765 },
    { x: 'Sun', y: 13456 },
  ],
  'Distance': [
    { x: 'Mon', y: 5.2 },
    { x: 'Tue', y: 6.1 },
    { x: 'Wed', y: 4.8 },
    { x: 'Thu', y: 7.5 },
    { x: 'Fri', y: 5.5 },
    { x: 'Sat', y: 9.3 },
    { x: 'Sun', y: 6.7 },
  ],
  'Licking': [
    { x: 'Mon', y: 4 },
    { x: 'Tue', y: 5 },
    { x: 'Wed', y: 3 },
    { x: 'Thu', y: 6 },
    { x: 'Fri', y: 5 },
    { x: 'Sat', y: 4 },
    { x: 'Sun', y: 5 },
  ],
  'Scratching': [
    { x: 'Mon', y: 2 },
    { x: 'Tue', y: 3 },
    { x: 'Wed', y: 4 },
    { x: 'Thu', y: 2 },
    { x: 'Fri', y: 3 },
    { x: 'Sat', y: 2 },
    { x: 'Sun', y: 3 },
  ],
};

const AI_SUMMARY = (petName: string, healthData: any) => {
  if (!healthData) {
    return `No health data available for ${petName}.`;
  }
  return `Based on today's data, ${petName}'s activity levels are fantastic, indicating a happy and energetic pup! Heart rate is normal, but temperature is slightly elevated. The increased licking and scratching could suggest a minor skin irritation. I predict a very low probability of any immediate health concerns, but it's worth keeping an eye on the skin.`;
}

// --- Components ---

const HealthMetricCard: React.FC<{ title: string; value: string; unit: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void; }> = ({ title, value, unit, icon, onPress }) => {
  const theme = useTheme();
  const cardStyles = getStyles(theme);
  return (
  <TouchableOpacity style={cardStyles.metricCard} onPress={onPress}>
    <Ionicons name={icon} size={24} color="#3B82F6" />
    <Text style={cardStyles.metricTitle}>{title}</Text>
    <View style={cardStyles.metricValueContainer}>
      <Text style={cardStyles.metricValue}>{value}</Text>
      <Text style={cardStyles.metricUnit}>{unit}</Text>
    </View>
  </TouchableOpacity>
)};

const LocationWidget: React.FC<{ location: any; pet?: Pet; styles: any }> = ({ location, pet, styles: widgetStyles }) => {
  if (!location) {
    return (
      <View style={widgetStyles.locationWidget}>
        <Text>No location data available.</Text>
      </View>
    );
  }

  const initialRegion = {
    latitude: location.latitude,
    longitude: location.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  // Sample Berlin walking path near Brandenburg Gate → Tiergarten
  const berlinPath = [
    { latitude: 52.51627, longitude: 13.37770 },
    { latitude: 52.51680, longitude: 13.37250 },
    { latitude: 52.51740, longitude: 13.36850 },
    { latitude: 52.51690, longitude: 13.36330 },
    { latitude: 52.51570, longitude: 13.36020 },
    { latitude: 52.51460, longitude: 13.35750 },
    { latitude: 52.51380, longitude: 13.35490 },
    { latitude: 52.51490, longitude: 13.35150 },
  ];

  return (
    <View style={widgetStyles.locationWidget}>
      <MapView
        style={widgetStyles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={initialRegion}
        scrollEnabled={true}
        zoomEnabled={true}
      >
        <Polyline coordinates={berlinPath} strokeColor="#2563EB" strokeWidth={5} geodesic={true} />
        {/* Start marker shows pet avatar if available */}
        <Marker coordinate={berlinPath[0]}>
          {pet?.avatar ? (
            <Image source={{ uri: pet.avatar }} style={widgetStyles.markerAvatar} />
          ) : (
            <Ionicons name="paw" size={20} color="#10B981" style={widgetStyles.petIconOnMap} />
          )}
        </Marker>
        {/* Current location marker */}
        <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }}>
          <Ionicons name="paw" size={24} color="#FFFFFF" style={widgetStyles.petIconOnMap} />
        </Marker>
        {/* End marker */}
        <Marker coordinate={berlinPath[berlinPath.length - 1]}>
          <Ionicons name="location-outline" size={20} color="#F59E0B" style={widgetStyles.petIconOnMap} />
        </Marker>
      </MapView>
    </View>
  );
};

// Removed - not used in current implementation


// --- Main Screen ---

type HealthScreenNavigationProp = StackNavigationProp<RootStackParamList, 'HealthDetail'>;

const HealthScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const theme = useTheme();
  const styles = getStyles(theme);
  const [selectedMetric, setSelectedMetric] = React.useState<HealthMetric>('Heart Rate');
  const [modalVisible, setModalVisible] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [timeframe, setTimeframe] = React.useState<'24h' | '7d' | '30d'>('24h');

  const { selectedPet } = useAppSelector((state) => state.pets);
  const { currentLocations } = useAppSelector((state) => state.location as any);
  const pet = selectedPet || MOCK_PET;
  const petHealth = MOCK_HEALTH_DATA;
  const petLocation = selectedPet ? currentLocations[selectedPet.id] || MOCK_LOCATION_DATA : MOCK_LOCATION_DATA;
  const petAlerts = [
    { condition: 'Slightly elevated heart rate', date: '2023-10-27' },
    { condition: 'Lower than usual activity', date: '2023-10-26' },
  ];
  const petName = pet.name;

  const handleMetricPress = (dataType: HealthMetric) => {
    navigation.navigate('HealthDetail', { petId: pet.id, dataType });
  };
  
  const handleAIPress = () => {
    navigation.navigate('AIDetail', { summary: AI_SUMMARY(petName, petHealth) });
  };

  const graphData = MOCK_HISTORICAL_HEALTH_DATA[selectedMetric];
  const unit = selectedMetric === 'Heart Rate' ? 'bpm' : selectedMetric === 'Temperature' ? '°C' : selectedMetric === 'Activity' ? 'level' : selectedMetric === 'Sleep' ? 'hours' : selectedMetric === 'Steps' ? 'steps' : selectedMetric === 'Distance' ? 'km' : 'times';
  const healthyRange: [number, number] | undefined = selectedMetric === 'Heart Rate' ? [60, 100] : selectedMetric === 'Temperature' ? [38, 39] : undefined;

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 600));
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}>
        <Text style={styles.headerTitle}>{petName}'s Health Summary</Text>
        <View style={styles.timeframeRow}>
          {(['24h','7d','30d'] as const).map(tf => (
            <TouchableOpacity key={tf} onPress={() => setTimeframe(tf)} style={[styles.timeChip, timeframe===tf && styles.timeChipActive]}>
              <Text style={[styles.timeChipText, timeframe===tf && styles.timeChipTextActive]}>{tf}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity onPress={handleAIPress} style={styles.aiSummaryWidget}>
          <View style={styles.aiSummaryHeader}>
            <Ionicons name="sparkles" size={24} color={theme.dark ? '#6ee7b7' : "#047857"} />
            <Text style={styles.aiSummaryTitle}>Dr. HausPet's Analysis for {petName}</Text>
          </View>
          <Text style={styles.aiSummaryText}>{AI_SUMMARY(petName, petHealth)}</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recorded Health Issues</Text>
          {petAlerts.map((a, idx) => (
            <View key={idx} style={[styles.issueRow, { borderBottomColor: theme.colors.border, paddingVertical: 12, borderBottomWidth: idx === petAlerts.length - 1 ? 0 : 1 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="warning-outline" size={18} color="#F59E0B" />
                <Text style={styles.issueText}>{a.condition}</Text>
              </View>
              <Text style={{ color: theme.colors.text, opacity: 0.6, fontSize: 12 }}>Recorded on: {a.date}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.metricsGrid}>
          <HealthMetricCard title="Heart Rate" value={petHealth?.heartRate?.toString() || 'N/A'} unit="bpm" icon="heart-outline" onPress={() => handleMetricPress('Heart Rate')} />
          <HealthMetricCard title="Temperature" value={petHealth?.temperature?.toString() || 'N/A'} unit="°C" icon="thermometer-outline" onPress={() => handleMetricPress('Temperature')} />
          <HealthMetricCard title="Activity Level" value={petHealth?.activityLevel?.toString() || 'N/A'} unit="level" icon="walk-outline" onPress={() => handleMetricPress('Activity')} />
          <HealthMetricCard title="Sleep" value={petHealth?.sleepDuration?.toString() || 'N/A'} unit="hours" icon="moon-outline" onPress={() => handleMetricPress('Sleep')} />
          <HealthMetricCard title="Steps" value={petHealth?.steps?.toString() || 'N/A'} unit="steps" icon="footsteps-outline" onPress={() => handleMetricPress('Steps')} />
          <HealthMetricCard title="Distance" value={petHealth?.distance?.toString() || 'N/A'} unit="km" icon="navigate-outline" onPress={() => handleMetricPress('Distance')} />
          <HealthMetricCard title="Licking" value={petHealth?.licking?.toString() || 'N/A'} unit="times" icon="paw-outline" onPress={() => handleMetricPress('Licking')} />
          <HealthMetricCard title="Scratching" value={petHealth?.scratching?.toString() || 'N/A'} unit="times" icon="paw-outline" onPress={() => handleMetricPress('Scratching')} />
        </View>

        <View style={styles.locationWidget}>
          <MapView
            style={styles.map}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            initialRegion={{ latitude: petLocation.latitude, longitude: petLocation.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
            scrollEnabled={true}
            zoomEnabled={true}
          >
            <Polyline coordinates={[{ latitude: petLocation.latitude, longitude: petLocation.longitude }]} strokeColor="#2563EB" strokeWidth={5} geodesic={true} />
            <Marker coordinate={{ latitude: petLocation.latitude, longitude: petLocation.longitude }}>
              <Ionicons name="paw" size={24} color="#FFFFFF" style={{ backgroundColor: '#3B82F6', borderRadius: 15, padding: 3 }} />
            </Marker>
          </MapView>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

// --- Styles ---

const { width } = Dimensions.get('window');

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: theme.colors.text,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
  },
  aiSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiSummaryTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '700',
    color: theme.dark ? '#d1fae5' : '#047857',
  },
  aiSummaryText: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.dark ? '#d1fae5' : '#065f46',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: theme.colors.text,
  },
  issueRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  issueText: {
    fontSize: 16,
    flex: 1,
    color: theme.colors.text,
  },
  issueDate: {
    fontSize: 14,
    color: '#9E9E9E',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  timeframeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  timeChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  timeChipActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  timeChipText: { color: theme.dark ? '#E5E7EB' : '#374151', fontWeight: '600' },
  timeChipTextActive: { color: '#fff' },
  metricCard: {
    width: (width - 50) / 2,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
  },
  metricIcon: {
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: theme.colors.text,
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 4,
    color: theme.colors.text,
  },
  metricUnit: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  locationWidget: {
    marginTop: 10,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  map: {
    height: 200,
  },
  petIconOnMap: {
    backgroundColor: '#3B82F6',
    borderRadius: 15,
    padding: 3,
  },
  markerAvatar: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: '#111827' },
  locationDetails: {
    padding: 16,
  },
  locationSteps: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  aiSummaryWidget: {
    backgroundColor: theme.dark ? '#047857' : '#E0F2F1',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default HealthScreen;
