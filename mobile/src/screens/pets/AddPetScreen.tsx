import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useTheme } from '@react-navigation/native';
import { useAppDispatch } from '../../store';
import { createPet, updatePetLocally } from '../../store/slices/petsSlice';
import { Pet } from '../../types';
import AvatarGenerator from '../../components/common/AvatarGenerator';
import Avatar from '../../components/common/Avatar';
import { DOG_BREEDS } from '../../constants';

const AddPetScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const styles = getStyles(theme);

  const [avatarGeneratorVisible, setAvatarGeneratorVisible] = useState(false);
  const [generatedAvatar, setGeneratedAvatar] = useState<string | null>(null);
  const [pickedPhoto, setPickedPhoto] = useState<string | null>(null);
  const [breedModalVisible, setBreedModalVisible] = useState(false);
  const [breedQuery, setBreedQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    species: 'dog' as 'dog',
    breed: '',
    age: '',
    gender: 'male',
    weight: '',
    color: '',
  });

  const handleAvatarGenerated = (avatar: string) => {
    setGeneratedAvatar(avatar);
    setAvatarGeneratorVisible(false);
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => {
      const newState = { ...prev, [field]: value };
      if (field === 'species') {
        newState.breed = ''; // Reset breed when species changes
      }
      return newState;
    });
  };

  const handleAddPet = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Name Required', 'Please enter a name for your pet.');
      return;
    }

    if (!formData.breed.trim()) {
      Alert.alert('Breed Required', 'Please select your pet\'s breed.');
      return;
    }

    if (!formData.age || isNaN(Number(formData.age)) || Number(formData.age) < 0) {
      Alert.alert('Invalid Age', 'Please enter a valid non-negative age.');
      return;
    }

    if (!formData.weight || isNaN(Number(formData.weight)) || Number(formData.weight) < 0) {
      Alert.alert('Invalid Weight', 'Please enter a valid non-negative weight.');
      return;
    }

    const newPet: Omit<Pet, 'id' | 'createdAt' | 'updatedAt'> = {
      ...formData,
      gender: formData.gender as 'male' | 'female',
      age: parseInt(formData.age, 10) || 0,
      weight: parseFloat(formData.weight) || 0,
      avatar: pickedPhoto || generatedAvatar,
      medicalHistory: [],
      vaccinations: [],
      medications: [],
      ownerId: 'demo-user-1', // Replace with actual user ID
    };

    try {
      const created = await dispatch(createPet(newPet)).unwrap();
      // Ensure local state carries avatar immediately
      if (pickedPhoto || generatedAvatar) {
        dispatch(updatePetLocally({ ...created, avatar: pickedPhoto || generatedAvatar } as any));
      }
      Alert.alert('Pet Added!', `${formData.name} has been added to your family.`);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to add pet. Please try again.');
      console.error('Failed to add pet:', error);
    }
  };

  const renderBreedItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      key={item}
      style={styles.modalItem}
      onPress={() => {
        handleInputChange('breed', item);
        setBreedModalVisible(false);
      }}
    >
      <Text style={styles.modalItemText}>{item}</Text>
    </TouchableOpacity>
  );

  const normalizedQuery = breedQuery.trim().toLowerCase();
  const breedData = DOG_BREEDS.filter((b) => b.toLowerCase().includes(normalizedQuery));

  const requestImagePermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need access to your photo library to set a pet picture.');
      return false;
    }
    return true;
  };

  const pickImageFromLibrary = async () => {
    const granted = await requestImagePermissions();
    if (!granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPickedPhoto(result.assets[0].uri);
    }
  };

  const onAvatarPress = () => {
    Alert.alert(
      'Pet Picture',
      'How would you like to set the picture?',
      [
        { text: 'Choose Photo', onPress: pickImageFromLibrary },
        { text: 'Generate Icon', onPress: () => setAvatarGeneratorVisible(true) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add a New Pet</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarSection}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={onAvatarPress}
          >
            <Avatar
              species={formData.species}
              breed={formData.breed}
              imageUrl={pickedPhoto || generatedAvatar}
              size={120}
            />
            <View style={styles.editAvatarIcon}>
                <Ionicons name="pencil" size={14} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarPrompt}>Tap the avatar to choose a photo or generate an icon.</Text>
        </View>

        <AvatarGenerator
          visible={avatarGeneratorVisible}
          onClose={() => setAvatarGeneratorVisible(false)}
          onAvatarGenerated={handleAvatarGenerated}
          petName={formData.name}
        />

        <View style={styles.form}>
          <TextInput
            style={[styles.input, { color: theme.colors.text }]}
            placeholder="Pet's Name"
            placeholderTextColor={theme.dark ? '#9CA3AF' : '#999'}
            value={formData.name}
            onChangeText={(text) => handleInputChange('name', text)}
          />
          
          <TouchableOpacity 
            style={styles.input}
            onPress={() => setBreedModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Select breed"
          >
            <Text style={formData.breed ? styles.inputText : styles.placeholder}>
              {formData.breed || 'Select Breed'}
            </Text>
          </TouchableOpacity>

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput, { color: theme.colors.text }]}
              placeholder="Age"
              placeholderTextColor={theme.dark ? '#9CA3AF' : '#999'}
              keyboardType="numeric"
              value={formData.age}
              onChangeText={(text) => handleInputChange('age', text)}
            />
            <TextInput
              style={[styles.input, styles.halfInput, { color: theme.colors.text }]}
              placeholder="Weight (kg)"
              placeholderTextColor={theme.dark ? '#9CA3AF' : '#999'}
              keyboardType="numeric"
              value={formData.weight}
              onChangeText={(text) => handleInputChange('weight', text)}
            />
          </View>
          <TextInput
            style={[styles.input, { color: theme.colors.text }]}
            placeholder="Color"
            placeholderTextColor={theme.dark ? '#9CA3AF' : '#999'}
            value={formData.color}
            onChangeText={(text) => handleInputChange('color', text)}
          />

          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Species</Text>
            <View style={styles.toggleButtons}>
              <TouchableOpacity 
                style={[styles.toggleButton, styles.toggleActive]}
                onPress={() => {}}
                accessibilityRole="button"
                accessibilityLabel="Dog species selected"
              >
                <Text style={[styles.toggleText, styles.toggleActiveText]}>Dog</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Gender</Text>
            <View style={styles.toggleButtons}>
              <TouchableOpacity 
                style={[styles.toggleButton, formData.gender === 'male' && styles.toggleActive]}
                onPress={() => handleInputChange('gender', 'male')}
              >
                <Text style={[styles.toggleText, formData.gender === 'male' && styles.toggleActiveText]}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.toggleButton, formData.gender === 'female' && styles.toggleActive]}
                onPress={() => handleInputChange('gender', 'female')}
              >
                <Text style={[styles.toggleText, formData.gender === 'female' && styles.toggleActiveText]}>Female</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAddPet} accessibilityRole="button" accessibilityLabel="Add pet">
          <Text style={styles.addButtonText}>Add Pet</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={breedModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBreedModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setBreedModalVisible(false)}>
          <View style={styles.modalContent}>
            <TextInput
              style={[styles.input, { marginBottom: 8 }]}
              placeholder="Search breed or type your own..."
              placeholderTextColor={theme.dark ? '#9CA3AF' : '#999'}
              value={breedQuery}
              onChangeText={setBreedQuery}
              autoFocus
            />
            <FlatList
              data={breedData}
              renderItem={renderBreedItem}
              keyExtractor={(item) => item}
              ListEmptyComponent={
                normalizedQuery.length > 0 ? (
                  <TouchableOpacity
                    key="use-custom-breed"
                    style={styles.modalItem}
                    onPress={() => {
                      handleInputChange('breed', breedQuery.trim());
                      setBreedModalVisible(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>Use "{breedQuery.trim()}"</Text>
                  </TouchableOpacity>
                ) : null
              }
            />
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: theme.colors.text },
  scrollContent: { padding: 20 },
  avatarSection: { alignItems: 'center', marginBottom: 30 },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 3,
    borderColor: theme.colors.border,
  },
  avatarEmoji: { fontSize: 60 },
  editAvatarIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#111827',
    padding: 8,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: theme.colors.card,
  },
  avatarPrompt: { marginTop: 12, color: theme.dark ? '#9CA3AF' : '#6B7280', fontWeight: '500' },
  form: { marginBottom: 20 },
  input: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    justifyContent: 'center',
    color: theme.colors.text,
  },
  inputText: {
    color: theme.colors.text,
  },
  placeholder: {
    color: theme.dark ? '#9CA3AF' : '#9CA3AF',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { flex: 1, marginRight: 8 },
  toggleContainer: { marginBottom: 20 },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  toggleButtons: { flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  toggleActive: { backgroundColor: '#111827' },
  toggleText: { fontSize: 14, fontWeight: '600', color: theme.dark ? '#E5E7EB' : '#374151' },
  toggleActiveText: { color: 'white' },
  addButton: {
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: { fontSize: 16, fontWeight: '600', color: 'white' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '60%',
  },
  modalItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalItemText: {
    fontSize: 16,
    color: theme.colors.text,
  },
});

export default AddPetScreen;
