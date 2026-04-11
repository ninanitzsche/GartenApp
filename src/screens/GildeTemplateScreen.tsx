import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { Colors2026, Spacing2026, Radius2026, Typography2026 } from '../theme/designSystemV2';
import { Gilde, GildeMatch } from '../types/gilde';
import { fetchGilden } from '../services/gildeService';
import { SYSTEM_GILDEN } from '../data/system-gilden';
import { calculateGildeMatches } from '../services/gildeMatchService';
import GildeMatchCard from '../components/gilde/GildeMatchCard';
import { useBeets } from '../hooks/useBeets';

type Props = NativeStackScreenProps<RootStackParamList, 'GildeTemplate'>;
type FilterType = 'all' | 'system' | 'user';

export default function GildeTemplateScreen({ navigation, route }: Props) {
  const { bedId } = route.params || {};
  const [filter, setFilter] = useState<FilterType>('all');
  const [gilden, setGilden] = useState<Gilde[]>([]);
  const [bedPlants, setBedPlants] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { beets } = useBeets();
  const bed = useMemo(() => beets.find(b => b.id === bedId), [beets, bedId]);

  useEffect(() => {
    loadData();
  }, [bedId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const userGilden = await fetchGilden();
      setGilden(userGilden);
    } catch (e) {
      console.error('Error loading data:', e);
    } finally {
      setLoading(false);
    }
  };

  const allGilden = useMemo(() => [...SYSTEM_GILDEN, ...gilden], [gilden]);

  const matches = useMemo(() => {
    if (bedPlants.length === 0) {
      return allGilden.map(g => ({
        gilde: g,
        matchScore: 0,
        matchingPlants: [],
        missingPlants: g.plants?.map(p => p.name) || [],
      }));
    }
    return calculateGildeMatches(bedPlants, allGilden);
  }, [allGilden, bedPlants]);

  const filteredMatches = useMemo(() => {
    if (filter === 'system') return matches.filter(m => m.gilde.is_system);
    if (filter === 'user') return matches.filter(m => !m.gilde.is_system);
    return matches;
  }, [matches, filter]);

  const handleSelect = (match: GildeMatch) => {
    navigation.navigate('GildeEdit', { 
      gildeId: match.gilde.id,
      bedId,
      templatePlants: match.missingPlants,
    });
  };

  const handleCreateEmpty = () => {
    navigation.navigate('GildeEdit', { bedId });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors2026.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors2026.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {bed ? `Gilde für ${bed.name}` : 'Neue Gilde'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.filterBar}>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>Alle</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'system' && styles.filterButtonActive]}
          onPress={() => setFilter('system')}
        >
          <Text style={[styles.filterText, filter === 'system' && styles.filterTextActive]}>System</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'user' && styles.filterButtonActive]}
          onPress={() => setFilter('user')}
        >
          <Text style={[styles.filterText, filter === 'user' && styles.filterTextActive]}>Eigene</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {filteredMatches.map(match => (
          <GildeMatchCard
            key={match.gilde.id}
            match={match}
            onSelect={handleSelect}
          />
        ))}

        <TouchableOpacity 
          style={styles.emptyButton}
          onPress={handleCreateEmpty}
        >
          <MaterialIcons name="add" size={24} color={Colors2026.primary} />
          <Text style={styles.emptyButtonText}>Leere Gilde erstellen</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors2026.bg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors2026.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing2026.md, borderBottomWidth: 1, borderBottomColor: Colors2026.divider },
  headerTitle: { ...Typography2026.title, color: Colors2026.text },
  filterBar: { flexDirection: 'row', padding: Spacing2026.md, gap: Spacing2026.sm },
  filterButton: { paddingHorizontal: Spacing2026.md, paddingVertical: Spacing2026.sm, borderRadius: Radius2026.md, backgroundColor: Colors2026.surface },
  filterButtonActive: { backgroundColor: Colors2026.primary },
  filterText: { ...Typography2026.body, color: Colors2026.textMuted },
  filterTextActive: { color: '#fff' },
  scrollContainer: { flex: 1, padding: Spacing2026.md },
  emptyButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: Spacing2026.lg, borderWidth: 2, borderStyle: 'dashed', borderColor: Colors2026.primary, borderRadius: Radius2026.md, marginTop: Spacing2026.md },
  emptyButtonText: { ...Typography2026.body, color: Colors2026.primary, marginLeft: Spacing2026.sm },
});