import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types';
import { useAppSelector, useAppDispatch } from '../../store';
import { deletePet, updatePet, updatePetLocally } from '../../store/slices/petsSlice';
import Avatar from '../../components/common/Avatar';
import * as ImagePicker from 'expo-image-picker';
type Props = StackScreenProps<RootStackParamList, 'PetDetails'>;

const PetDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { petId } = route.params;
  const dispatch = useAppDispatch();
  const pet = useAppSelector((state) =>
    state.pets.pets.find((p) => p.id === petId)
  );
  const healthData = useAppSelector(
    (state) => state.health.currentData[petId]
  );
  const locationData = useAppSelector(
    (state) => state.location.currentLocations[petId]
  );

  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);

  const requestImagePermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need access to your photo library to update the pet picture.');
      return false;
    }
    return true;
  };

  const pickAndUpdateAvatar = async () => {
    if (!pet) return;
    const granted = await requestImagePermissions();
    if (!granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      try {
        setIsUpdatingAvatar(true);
        // Optimistic local update so Dashboard reflects immediately even if backend delays
        dispatch(updatePetLocally({ ...pet, avatar: result.assets[0].uri }));
        await dispatch(updatePet({ id: pet.id, data: { avatar: result.assets[0].uri } })).unwrap();
        Alert.alert('Updated', 'Pet picture updated.');
      } catch (e) {
        Alert.alert('Error', 'Failed to update pet picture.');
      } finally {
        setIsUpdatingAvatar(false);
      }
    }
  };

  const handleEditPet = () => {
    navigation.navigate('EditPet', { petId });
  };

  const handleDeletePet = async () => {
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
              navigation.goBack();
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

  if (!pet) {
    return (
      <View style={styles.container}>
        <Text>Pet not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={pickAndUpdateAvatar} activeOpacity={0.8}>
          <View>
            <Avatar species={pet.species} breed={pet.breed} imageUrl={pet.avatar || undefined} size={120} />
            <View style={styles.editAvatarIcon}><Ionicons name="pencil" size={14} color="#fff" /></View>
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{pet.name}</Text>
        <Text style={styles.breed}>{pet.breed}</Text>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.sectionTitle}>Details</Text>
        <View style={styles.detailItem} key="age">
          <Text style={styles.label}>Age:</Text>
          <Text style={styles.value}>{pet.age} years</Text>
        </View>
        <View style={styles.detailItem} key="weight">
          <Text style={styles.label}>Weight:</Text>
          <Text style={styles.value}>{pet.weight} kg</Text>
        </View>
        <View style={styles.detailItem} key="color">
          <Text style={styles.label}>Color:</Text>
          <Text style={styles.value}>{pet.color}</Text>
        </View>
        <Text style={styles.sectionTitle}>Health</Text>
        <View style={styles.detailItem} key="heart-rate">
          <Text style={styles.label}>Heart Rate:</Text>
          <Text style={styles.value}>{healthData?.heartRate || 'N/A'} bpm</Text>
        </View>
        <View style={styles.detailItem} key="activity-level">
          <Text style={styles.label}>Activity Level:</Text>
          <Text style={styles.value}>{healthData?.activityLevel || 'N/A'}</Text>
        </View>
        <Text style={styles.sectionTitle}>Location</Text>
        <View style={styles.detailItem} key="latitude">
          <Text style={styles.label}>Latitude:</Text>
          <Text style={styles.value}>{locationData?.latitude || 'N/A'}</Text>
        </View>
        <View style={styles.detailItem} key="longitude">
          <Text style={styles.label}>Longitude:</Text>
          <Text style={styles.value}>{locationData?.longitude || 'N/A'}</Text>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.editButton} onPress={handleEditPet}>
            <Ionicons name="pencil" size={20} color="white" />
            <Text style={styles.buttonText}>Edit Pet</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePet}>
            <Ionicons name="trash" size={20} color="white" />
            <Text style={styles.buttonText}>Delete Pet</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: 'white',
  },
  editAvatarIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#111827',
    padding: 8,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'white',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  breed: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  detailsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  label: {
    fontSize: 16,
    color: '#374151',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    paddingHorizontal: 8,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 8,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 12,
    marginLeft: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default PetDetailsScreen;
