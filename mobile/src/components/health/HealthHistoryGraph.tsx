import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface HealthHistoryGraphProps {
  data: number[];
  labels: string[];
  title: string;
  unit: string;
  healthyRange: [number, number];
}

const HealthHistoryGraph: React.FC<HealthHistoryGraphProps> = ({
  data,
  labels,
  title,
  unit,
  healthyRange,
}) => {
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#3B82F6',
    },
  };

  const chartData = {
    labels: labels,
    datasets: [
      {
        data: data,
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        strokeWidth: 2,
      },
      {
        data: Array(data.length).fill(healthyRange[1]),
        withDots: false,
        color: () => 'rgba(16, 185, 129, 0.2)',
      },
      {
        data: Array(data.length).fill(healthyRange[0]),
        withDots: false,
        color: () => 'rgba(16, 185, 129, 0.2)',
      },
    ],
    legend: [`${title} (${unit})`],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title} History</Text>
      <LineChart
        data={chartData}
        width={Dimensions.get('window').width - 40}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />
      <View style={styles.legendContainer}>
        <View style={[styles.legendItem, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]} />
        <Text style={styles.legendText}>Healthy Range ({healthyRange[0]} - {healthyRange[1]} {unit})</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendItem: {
    width: 20,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default HealthHistoryGraph;

