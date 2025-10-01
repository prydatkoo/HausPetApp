import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import HealthHistoryGraph from '../../components/health/HealthHistoryGraph';

// Mock Data
const MOCK_HISTORY_DATA = {
  'Heart Rate': {
    data: [85, 88, 90, 87, 86, 89, 88],
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    unit: 'bpm',
    healthyRange: [70, 120],
  },
  'Temperature': {
    data: [101.2, 101.5, 101.3, 101.6, 101.4, 101.5, 101.3],
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    unit: '°F',
    healthyRange: [100.5, 102.5],
  },
  'Licks': {
    data: [30, 32, 28, 35, 33, 31, 32],
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    unit: 'times',
    healthyRange: [20, 40],
  },
  'Scratches': {
    data: [10, 12, 11, 13, 14, 11, 12],
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    unit: 'times',
    healthyRange: [5, 15],
  },
};

type HealthDetailScreenRouteProp = RouteProp<RootStackParamList, 'HealthDetail'>;

const HealthDetailScreen: React.FC = () => {
  const route = useRoute<HealthDetailScreenRouteProp>();
  const { dataType } = route.params;

  const metricData = MOCK_HISTORY_DATA[dataType as keyof typeof MOCK_HISTORY_DATA];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {metricData ? (
          <HealthHistoryGraph
            data={metricData.data}
            labels={metricData.labels}
            title={dataType}
            unit={metricData.unit}
            healthyRange={metricData.healthyRange as [number, number]}
          />
        ) : (
          <Text>No data available for {dataType}</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 20,
  },
});

export default HealthDetailScreen;
