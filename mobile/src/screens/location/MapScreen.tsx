import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region, MapType } from 'react-native-maps';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '../../store';
import { useTheme } from '@react-navigation/native';
import { BERLIN_PATHS } from '../../constants/paths';
import DateTimePicker from '@react-native-community/datetimepicker';

const MapScreen: React.FC = () => {
  const theme = useTheme();
  const mapRef = useRef<MapView>(null);
  const { selectedPet } = useAppSelector((state) => state.pets);
  const pet = selectedPet;

  const [mapType, setMapType] = useState<MapType>('standard');
  const [showPath, setShowPath] = useState(true);
  const [activePathKey, setActivePathKey] = useState<string>('Today');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dynamicPaths, setDynamicPaths] = useState<typeof BERLIN_PATHS | Record<string, any>>({ ...BERLIN_PATHS });
  
  // State for live tracking simulation
  const [isLive, setIsLive] = useState(false);
  const [livePath, setLivePath] = useState<{ latitude: number, longitude: number }[]>([]);
  const simulationIndex = useRef(0);

  const initialRegion: Region = {
    latitude: 52.5200, // Berlin Center
    longitude: 13.4050,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Live location tracking is disabled. Please enable it in your device settings.');
      }
    })();
  }, []);

  // Live simulation effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isLive) {
      interval = setInterval(() => {
        const todayPath = BERLIN_PATHS['Today'];
        if (simulationIndex.current < todayPath.length) {
          const nextPoint = todayPath[simulationIndex.current];
          setLivePath(prev => [...prev, nextPoint]);
          
          mapRef.current?.animateToRegion({
            latitude: nextPoint.latitude,
            longitude: nextPoint.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }, 1000);

          simulationIndex.current++;
        } else {
          // End of simulation
          setIsLive(false);
        }
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLive]);

  const toggleLiveTracking = () => {
    setIsLive(prev => {
      const newLiveState = !prev;
      if (newLiveState) {
        // Start simulation
        setActivePathKey('Today'); // Ensure we are on the live view
        setLivePath([]); // Clear previous live path
        simulationIndex.current = 0;
      }
      return newLiveState;
    });
  };

  const recenter = useCallback(() => {
    if (!mapRef.current) return;
    const targetPath = (dynamicPaths as any)[activePathKey];

    if (isLive && livePath.length > 0) {
      mapRef.current.animateToRegion({ ...livePath[livePath.length - 1], latitudeDelta: 0.005, longitudeDelta: 0.005 }, 1000);
    } else if (targetPath && targetPath.length > 0) {
      mapRef.current.fitToCoordinates(targetPath, {
        edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
        animated: true,
      });
    } else {
      mapRef.current.animateToRegion(initialRegion, 400);
    }
  }, [activePathKey, isLive, livePath, initialRegion]);

  const handleSelectPath = (key: string) => {
    setIsLive(false); // Stop live tracking when viewing history
    setLivePath([]);
    setActivePathKey(key);
    setShowHistoryModal(false);
    setTimeout(() => {
      const targetPath = (dynamicPaths as any)[key];
      if (mapRef.current && targetPath && targetPath.length > 0) {
        mapRef.current.fitToCoordinates(targetPath, {
          edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
          animated: true,
        });
      }
    }, 300);
  };

  const historicalPath = activePathKey !== 'Today' ? (dynamicPaths as any)[activePathKey] : [];
  
  const generateCityPath = (seed: number) => {
    // Simple pseudo-random but smooth offsets around central Berlin, following rough streets
    const base: { latitude: number; longitude: number }[] = [
      { latitude: 52.52064, longitude: 13.40953 },
      { latitude: 52.52009, longitude: 13.40690 },
      { latitude: 52.51960, longitude: 13.40421 },
      { latitude: 52.51905, longitude: 13.40170 },
      { latitude: 52.51948, longitude: 13.39992 },
      { latitude: 52.52002, longitude: 13.39840 },
      { latitude: 52.52062, longitude: 13.39755 },
    ];
    const rand = (n: number) => ((Math.sin(n + seed) + 1) / 2 - 0.5) * 0.0025; // ~250m jitter
    return base.map((p, idx) => ({ latitude: p.latitude + rand(idx), longitude: p.longitude + rand(idx + 20) }));
  };
  
  const onPickDate = (_: any, date?: Date) => {
    setShowDatePicker(false);
    if (!date) return;
    const key = date.toDateString();
    if (!(dynamicPaths as any)[key]) {
      const path = generateCityPath(date.getTime() / (1000 * 60 * 60 * 24));
      setDynamicPaths(prev => ({ ...(prev as any), [key]: path }));
    }
    handleSelectPath(key);
  };

  const currentPetLocation = livePath.length > 0 
    ? livePath[livePath.length - 1]
    : (historicalPath.length > 0 ? historicalPath[0] : initialRegion);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass
        showsScale
        loadingEnabled
        mapType={mapType}
        customMapStyle={theme.dark ? mapDarkStyle : []}
      >
        {showPath && activePathKey !== 'Today' && <Polyline coordinates={historicalPath} strokeColor="#8B5CF6" strokeWidth={5} geodesic />}
        {isLive && <Polyline coordinates={livePath} strokeColor="#2563EB" strokeWidth={5} geodesic />}
        
        {currentPetLocation && (
          <Marker coordinate={currentPetLocation}>
          { (pet && pet.avatar) ? (
            <Image source={{ uri: pet.avatar }} style={styles.markerAvatar} />
          ) : (
            <Ionicons name="paw" size={22} color="#fff" style={styles.paw} />
          )}
          </Marker>
        )}
      </MapView>
      
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={[styles.controlButton, theme.dark && styles.controlButtonDark, isLive && { backgroundColor: '#10B981' }]} onPress={toggleLiveTracking}>
          <Ionicons name="pulse" size={20} color={isLive ? "#fff" : (theme.dark ? '#E5E7EB' : '#333')} />
          <Text style={[styles.controlText, theme.dark && { color: '#E5E7EB' }, isLive && { color: '#fff' }]}>Live</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlButton, theme.dark && styles.controlButtonDark]} onPress={recenter}>
          <Ionicons name="locate" size={20} color={theme.dark ? '#E5E7EB' : '#333'} />
          <Text style={[styles.controlText, theme.dark && { color: '#E5E7EB' }]}>Recenter</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlButton, theme.dark && styles.controlButtonDark]} onPress={() => setMapType(prev => (prev === 'standard' ? 'satellite' : 'standard'))}>
          <Ionicons name={mapType === 'standard' ? 'image-outline' : 'grid-outline'} size={20} color={theme.dark ? '#E5E7EB' : '#333'} />
          <Text style={[styles.controlText, theme.dark && { color: '#E5E7EB' }]}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlButton, theme.dark && styles.controlButtonDark]} onPress={() => setShowPath(prev => !prev)}>
          <Ionicons name={showPath ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.dark ? '#E5E7EB' : '#333'} />
          <Text style={[styles.controlText, theme.dark && { color: '#E5E7EB' }]}>Path</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlButton, theme.dark && styles.controlButtonDark]} onPress={() => setShowHistoryModal(true)}>
          <Ionicons name="time-outline" size={20} color={theme.dark ? '#E5E7EB' : '#333'} />
          <Text style={[styles.controlText, theme.dark && { color: '#E5E7EB' }]}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlButton, theme.dark && styles.controlButtonDark]} onPress={() => setShowDatePicker(true)}>
          <Ionicons name="calendar-outline" size={20} color={theme.dark ? '#E5E7EB' : '#333'} />
          <Text style={[styles.controlText, theme.dark && { color: '#E5E7EB' }]}>Date</Text>
        </TouchableOpacity>
        </View>

      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          themeVariant={theme.dark ? 'dark' : 'light'}
          textColor={(theme as any).colors?.text as any}
          onChange={onPickDate}
          maximumDate={new Date()}
        />
      )}

      {/* Active day chip */}
      <View style={{ position: 'absolute', top: 56, left: 16, backgroundColor: theme.dark ? 'rgba(28,28,30,0.9)' : 'rgba(255,255,255,0.9)', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: theme.dark ? '#3f3f46' : '#E5E7EB' }}>
        <Text style={{ color: theme.colors.text, fontWeight: '700' }}>{activePathKey}</Text>
      </View>

      <Modal
        visible={showHistoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowHistoryModal(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowHistoryModal(false)} activeOpacity={1}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }] }>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Walk History</Text>
            <FlatList
              data={Object.keys(dynamicPaths as any)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, { borderBottomColor: theme.colors.border }]}
                  onPress={() => handleSelectPath(item)}
                >
                  <Text style={[styles.modalItemText, { color: theme.colors.text }]}>{item}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: { flex: 1 },
  paw: { backgroundColor: '#111827', borderRadius: 12, padding: 4 },
  markerAvatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: '#111827' },
  controlsContainer: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: 'transparent',
    borderRadius: 20,
    gap: 12,
  },
  controlButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlButtonDark: {
    backgroundColor: 'rgba(28,28,30,0.9)',
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  controlText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    width: '100%',
    maxHeight: '50%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItemText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

const mapDarkStyle = [{"elementType":"geometry","stylers":[{"color":"#242f3e"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#746855"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#242f3e"}]},{"featureType":"administrative.locality","elementType":"labels.text.fill","stylers":[{"color":"#d59563"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#d59563"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#263c3f"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#6b9a76"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#38414e"}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"color":"#212a37"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#9ca5b3"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#746855"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#1f2835"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#f3d19c"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#2f3948"}]},{"featureType":"transit.station","elementType":"labels.text.fill","stylers":[{"color":"#d59563"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#17263c"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#515c6d"}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"color":"#17263c"}]}];

export default MapScreen;
