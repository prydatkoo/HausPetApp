import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import HealthHistoryGraph from '../../components/health/HealthHistoryGraph';

const MOCK_PREDICTIONS = [
  {
    title: 'Allergy Flare-up',
    probability: '15%',
    description: 'The recent increase in scratching and licking, combined with a slightly elevated temperature, suggests a mild allergic reaction. This is common in Golden Retrievers, especially during seasonal changes.',
    recommendation: 'Monitor for excessive scratching. Consider using a hypoallergenic shampoo. If symptoms persist, a vet visit is recommended.',
  },
  {
    title: 'Ear Infection',
    probability: '5%',
    description: 'While less likely, the scratching could be related to an ear infection. There are no other strong indicators at this time.',
    recommendation: 'Gently check your pet\'s ears for redness or odor. Keep them clean and dry, especially after baths or swimming.',
  },
];

const AIDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'AIDetail'>>();
  const { summary } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Ionicons name="sparkles" size={32} color="#10B981" />
          <Text style={styles.headerTitle}>Dr. HausPet's In-Depth Analysis</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Summary</Text>
          <Text style={styles.summaryText}>{summary}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Observations</Text>
          <View style={styles.observationCard}>
            <Ionicons name="thermometer-outline" size={24} color="#F59E0B" />
            <View style={styles.observationTextContainer}>
              <Text style={styles.observationTitle}>Slightly Elevated Temperature</Text>
              <Text style={styles.observationDescription}>Temperature is slightly above the normal range, which could indicate a minor inflammation or reaction.</Text>
            </View>
          </View>
          <View style={styles.observationCard}>
            <Ionicons name="paw-outline" size={24} color="#EF4444" />
            <View style={styles.observationTextContainer}>
              <Text style={styles.observationTitle}>Increased Licking & Scratching</Text>
              <Text style={styles.observationDescription}>A noticeable increase in skin-related behaviors, suggesting potential irritation or allergies.</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Predictions</Text>
          {MOCK_PREDICTIONS.map((prediction, index) => (
            <View key={index} style={styles.predictionCard}>
              <View style={styles.predictionHeader}>
                <Text style={styles.predictionTitle}>{prediction.title}</Text>
                <Text style={styles.predictionProbability}>{prediction.probability}</Text>
              </View>
              <Text style={styles.predictionDescription}>{prediction.description}</Text>
              <Text style={styles.predictionRecommendation}>{prediction.recommendation}</Text>
            </View>
          ))}
        </View>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  observationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  observationTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  observationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  observationDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  predictionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  predictionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  predictionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  predictionProbability: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3B82F6',
  },
  predictionDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
    lineHeight: 20,
  },
  predictionRecommendation: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '600',
  }
});

export default AIDetailScreen;

