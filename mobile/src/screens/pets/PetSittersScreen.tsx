import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppSelector, useAppDispatch } from '../../store';
import { fetchPetSitters } from '../../store/slices/communitySlice';
import { PetSitter } from '../../types';
import { Ionicons } from '@expo/vector-icons';

import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';

type PetSittersScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const PetSitterItem: React.FC<{ sitter: PetSitter; onPress: () => void }> = ({ sitter, onPress }) => (
  <TouchableOpacity style={styles.sitterContainer} onPress={onPress}>
    <Image 
      source={{ uri: sitter.images[0] || 'https://i.pravatar.cc/150' }} 
      style={styles.sitterImage} 
    />
    <View style={styles.sitterInfo}>
      <Text style={styles.sitterName}>{sitter.name}</Text>
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={16} color="#F59E0B" />
        <Text style={styles.sitterRating}>{sitter.rating.toFixed(1)}</Text>
      </View>
      <Text style={styles.sitterBio} numberOfLines={2}>{sitter.bio}</Text>
    </View>
    <View style={styles.sitterRateContainer}>
      <Text style={styles.sitterRate}>${sitter.hourlyRate.toFixed(2)}</Text>
      <Text style={styles.rateLabel}>/hr</Text>
    </View>
  </TouchableOpacity>
);

const PetSittersScreen: React.FC = () => {
  const navigation = useNavigation<PetSittersScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const { petSitters: sitters, isLoading: loading, error } = useAppSelector((state) => state.community);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Fetch sitters data (placeholder fetch guarded by try/catch inside thunk)
    dispatch(fetchPetSitters({} as any));
  }, [dispatch]);

  const filteredSitters = useMemo(() => {
    if (!sitters || !Array.isArray(sitters)) {
      return [];
    }
    if (!searchQuery) {
      return sitters;
    }
    return sitters.filter(sitter =>
      sitter.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sitters, searchQuery]);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={64} color="#9CA3AF" />
      <Text style={styles.emptyTitle}>No Pet Sitters Found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery 
          ? `No sitters match "${searchQuery}". Try a different search term.`
          : "We're working on finding trusted pet sitters in your area. Check back soon!"
        }
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.header}>Pet Sitters</Text>
        <Text style={styles.subHeader}>
          In the works — we’re building sitter matching and booking.
        </Text>
      </View>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for sitters..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Finding pet sitters near you...</Text>
        </View>
      )}
      
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={24} color="#EF4444" />
          <Text style={styles.errorText}>Unable to load sitters. Please try again.</Text>
        </View>
      )}
      
      <FlatList
        data={filteredSitters}
        renderItem={({ item }) => <PetSitterItem sitter={item} onPress={() => navigation.navigate('SitterDetail', { sitterId: item.id })} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          filteredSitters.length === 0 && !loading && styles.listContentEmpty
        ]}
        ListEmptyComponent={!loading && !error ? renderEmptyState : null}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subHeader: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 22,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  sitterContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sitterInfo: {},
  sitterName: {
    fontSize: 16,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  sitterRating: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  sitterBio: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  sitterImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  sitterRateContainer: {
    alignItems: 'flex-end',
  },
  sitterRate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  rateLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  listContentEmpty: {
    flex: 1,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginHorizontal: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginLeft: 8,
  },
});

export default PetSittersScreen;
