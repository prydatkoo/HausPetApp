import React, { useState, useLayoutEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation, RouteProp, useTheme } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store';
import { updatePet, deletePet } from '../../store/slices/petsSlice';
import { RootStackParamList } from '../../types';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as Haptics from 'expo-haptics';

type EditPetScreenRouteProp = RouteProp<RootStackParamList, 'EditPet'>;

const EditPetScreen = () => {
  const route = useRoute<EditPetScreenRouteProp>();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const styles = getStyles(theme);
  const { petId } = route.params;

  const pet = useAppSelector(state =>
    state.pets.pets.find(p => p.id === petId)
  );

  const [formData, setFormData] = useState({
    name: pet?.name || '',
    breed: pet?.breed || '',
    dateOfBirth: pet?.dateOfBirth || '',
    weight: pet?.weight?.toString() || '',
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleDelete} style={{ marginRight: 15 }}>
          <Text style={{ color: 'red', fontSize: 16 }}>Delete</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, handleDelete]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async () => {
    if (!pet) return;

    try {
      await dispatch(
        updatePet({
          id: pet.id,
          data: { ...formData, weight: parseFloat(formData.weight) },
        })
      ).unwrap();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Update Failed', 'An error occurred while updating the pet.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Pet',
      'Are you sure you want to delete this pet? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            if (!pet) return;
            try {
              await dispatch(deletePet(pet.id)).unwrap();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              navigation.navigate('Main', { screen: 'Home' });
            } catch (error) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('Delete Failed', 'An error occurred while deleting the pet.');
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
    <KeyboardAwareScrollView style={styles.container}>
      <Text style={styles.label}>Name</Text>
      <TextInput
        key="name"
        style={styles.input}
        value={formData.name}
        onChangeText={text => handleInputChange('name', text)}
        placeholderTextColor={theme.dark ? '#9CA3AF' : '#999'}
      />

      <Text style={styles.label}>Breed</Text>
      <TextInput
        key="breed"
        style={styles.input}
        value={formData.breed}
        onChangeText={text => handleInputChange('breed', text)}
        placeholderTextColor={theme.dark ? '#9CA3AF' : '#999'}
      />

      <Text style={styles.label}>Date of Birth</Text>
      <TextInput
        key="dateOfBirth"
        style={styles.input}
        value={formData.dateOfBirth}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={theme.dark ? '#9CA3AF' : '#999'}
        onChangeText={text => handleInputChange('dateOfBirth', text)}
      />

      <Text style={styles.label}>Weight (kg)</Text>
      <TextInput
        key="weight"
        style={styles.input}
        value={formData.weight}
        keyboardType="numeric"
        onChangeText={text => handleInputChange('weight', text)}
        placeholderTextColor={theme.dark ? '#9CA3AF' : '#999'}
      />

      <Button title="Save Changes" onPress={handleUpdate} key="save-button" />
    </KeyboardAwareScrollView>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: theme.colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    color: theme.colors.text,
  },
});

export default EditPetScreen;
