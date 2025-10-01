import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HealthIssue {
  condition: string;
  date: string;
}

interface HealthIssuesWidgetProps {
  issues: HealthIssue[];
}

const HealthIssuesWidget: React.FC<HealthIssuesWidgetProps> = ({ issues }) => {
  if (issues.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="shield-checkmark-outline" size={32} color="#10B981" />
        <Text style={styles.emptyText}>No health issues have been recorded for this pet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recorded Health Issues</Text>
      {issues.map((issue, index) => (
        <View key={index} style={styles.issueItem}>
          <Ionicons name="warning-outline" size={24} color="#F59E0B" style={styles.issueIcon} />
          <View>
            <Text style={styles.issueCondition}>{issue.condition}</Text>
            <Text style={styles.issueDate}>Recorded on: {issue.date}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  issueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  issueIcon: {
    marginRight: 12,
  },
  issueCondition: {
    fontSize: 16,
    color: '#333',
  },
  issueDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  emptyContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginVertical: 10,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
  },
});

export default HealthIssuesWidget;

