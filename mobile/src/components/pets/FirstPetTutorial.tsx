import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Swiper from 'react-native-swiper';
import { useTheme } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface FirstPetTutorialProps {
  visible: boolean;
  onClose: () => void;
}

const FirstPetTutorial: React.FC<FirstPetTutorialProps> = ({ visible, onClose }) => {
  const theme = useTheme();
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { backgroundColor: theme.colors.card }] }>
          <Swiper
            loop={false}
            dot={<View style={styles.dot} />}
            activeDot={<View style={styles.activeDot} />}
          >
            <View style={styles.slide}>
              <Ionicons name="paw-outline" size={80} color="#3B82F6" />
              <Text style={[styles.title, { color: theme.colors.text }]}>Welcome to HausPet!</Text>
              <Text style={[styles.text, { color: theme.dark ? '#9CA3AF' : '#6B7280' }]}>Your all-in-one solution for pet care. Let's get you started.</Text>
            </View>
            <View style={styles.slide}>
              <Ionicons name="map-outline" size={80} color="#3B82F6" />
              <Text style={[styles.title, { color: theme.colors.text }]}>Live Location Tracking</Text>
              <Text style={[styles.text, { color: theme.dark ? '#9CA3AF' : '#6B7280' }]}>Never lose sight of your furry friend. Track their location in real-time.</Text>
            </View>
            <View style={styles.slide}>
              <Ionicons name="heart-outline" size={80} color="#3B82F6" />
              <Text style={[styles.title, { color: theme.colors.text }]}>Health Monitoring</Text>
              <Text style={[styles.text, { color: theme.dark ? '#9CA3AF' : '#6B7280' }]}>Keep an eye on their vitals and get instant health alerts.</Text>
            </View>
            <View style={styles.slide}>
              <Ionicons name="hardware-chip-outline" size={80} color="#3B82F6" />
              <Text style={[styles.title, { color: theme.colors.text }]}>HausPet Smart Collar</Text>
              <Text style={[styles.text, { color: theme.dark ? '#9CA3AF' : '#6B7280' }]}>
                Real‑time GPS • Heart rate • Activity & Sleep • Water‑resistant • 25+ day battery, depending on activity.
              </Text>
              <TouchableOpacity style={styles.finishButton} onPress={onClose}>
                <Text style={styles.finishButtonText}>Purchase Collar</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.slide}>
              <Ionicons name="chatbubble-ellipses-outline" size={80} color="#3B82F6" />
              <Text style={[styles.title, { color: theme.colors.text }]}>Chat with Dr. HausPet</Text>
              <Text style={[styles.text, { color: theme.dark ? '#9CA3AF' : '#6B7280' }]}>Get expert advice from our AI vet assistant, anytime you need.</Text>
              <TouchableOpacity style={styles.finishButton} onPress={onClose}>
                <Text style={styles.finishButtonText}>Add Your First Pet</Text>
              </TouchableOpacity>
            </View>
          </Swiper>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: width * 0.9,
    height: '60%',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  finishButton: {
    marginTop: 30,
    backgroundColor: '#3B82F6',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  finishButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dot: {
    backgroundColor: 'rgba(0,0,0,.2)',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3,
  },
  activeDot: {
    backgroundColor: '#3B82F6',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3,
  },
});

export default FirstPetTutorial;
