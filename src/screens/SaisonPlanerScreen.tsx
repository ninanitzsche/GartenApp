import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Colors from '../theme/colors';
import { RootStackParamList } from '../types/navigation';
import { PlantingCalendarEntry } from '../data/plantingCalendarData';
import {
  getPlantableNow,
  getPlantableSoon,
  getSeasonStatus,
  searchPlants,
  getMonthName,
  getActionLabel,
  getDifficultyColor,
  getDifficultyLabel,
  PlantablePlant,
} from '../services/plantingCalendarService';
import EmptyState from '../components/EmptyState';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SaisonPlanerScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'now' | 'soon' | 'all'>('now');
  
  const seasonStatus = useMemo(() => getSeasonStatus(), []);
  const plantableNow = useMemo(() => getPlantableNow(), []);
  const plantableSoon = useMemo(() => getPlantableSoon(8), []);
  
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchPlants(searchQuery);
  }, [searchQuery]);
  
  const displayedPlants = useMemo(() => {
    if (searchQuery.trim()) {
      return searchResults.map(plant => ({
        plant,
        action: 'direct_sow' as const,
        urgency: 'now' as const,
        weeksUntilOptimal: 0,
      }));
    }
    
    switch (selectedTab) {
      case 'now':
        return plantableNow;
      case 'soon':
        return plantableSoon;
      case 'all':
        return [...plantableNow, ...plantableSoon].sort((a, b) => {
          return a.weeksUntilOptimal - b.weeksUntilOptimal;
        });
      default:
        return plantableNow;
    }
  }, [searchQuery, selectedTab, searchResults, plantableNow, plantableSoon]);
  
  const handleAddPlant = useCallback((plant: PlantingCalendarEntry) => {
    navigation.navigate('AddPlant', {
      prefillName: plant.plant_name,
      prefillLatinName: plant.latin_name || undefined,
    });
  }, [navigation]);
  
  const getUrgencyColor = (urgency: string, weeksUntilOptimal: number): string => {
    if (urgency === 'now' || weeksUntilOptimal === 0) return Colors.error;
    if (weeksUntilOptimal <= 2) return Colors.warning;
    return Colors.primary;
  };
  
  const getUrgencyLabel = (item: PlantablePlant): string => {
    if (item.urgency === 'now' || item.weeksUntilOptimal === 0) return 'JETZT';
    if (item.weeksUntilOptimal <= 2) return `${item.weeksUntilOptimal} Woche${item.weeksUntilOptimal > 1 ? 'n' : ''}`;
    return `in ${item.weeksUntilOptimal} Wochen`;
  };
  
  const renderPlantCard = ({ item }: { item: PlantablePlant }) => (
    <TouchableOpacity
      style={styles.plantCard}
      onPress={() => handleAddPlant(item.plant)}
      accessibilityLabel={`${item.plant.plant_name} hinzufügen`}
      accessibilityRole="button"
    >
      <View style={styles.plantCardHeader}>
        <View style={styles.plantInfo}>
          <Text style={styles.plantName}>{item.plant.plant_name}</Text>
          {item.plant.latin_name && (
            <Text style={styles.plantLatin}>{item.plant.latin_name}</Text>
          )}
        </View>
        <View style={[
          styles.urgencyBadge,
          { backgroundColor: getUrgencyColor(item.urgency, item.weeksUntilOptimal) }
        ]}>
          <Text style={styles.urgencyText}>{getUrgencyLabel(item)}</Text>
        </View>
      </View>
      
      <View style={styles.plantDetails}>
        <View style={styles.detailRow}>
          <MaterialIcons name="schedule" size={14} color={Colors.textLight} />
          <Text style={styles.detailText}>
            {getActionLabel(item.action)}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <MaterialIcons name="wb-sunny" size={14} color={Colors.textLight} />
          <Text style={styles.detailText}>
            {item.plant.sunlight === 'full' ? 'Vollsonne' : 
             item.plant.sunlight === 'partial' ? 'Halbschatten' : 'Schatten'}
          </Text>
        </View>
        
        <View style={[styles.detailRow, { marginLeft: 'auto' }]}>
          <View style={[
            styles.difficultyBadge,
            { backgroundColor: getDifficultyColor(item.plant.difficulty) }
          ]}>
            <Text style={styles.difficultyText}>
              {getDifficultyLabel(item.plant.difficulty)}
            </Text>
          </View>
        </View>
      </View>
      
      {item.plant.planting_tip && (
        <View style={styles.tipContainer}>
          <MaterialIcons name="lightbulb" size={14} color={Colors.accent} />
          <Text style={styles.tipText} numberOfLines={2}>
            {item.plant.planting_tip}
          </Text>
        </View>
      )}
      
      <View style={styles.addButton}>
        <MaterialIcons name="add-circle" size={24} color={Colors.primary} />
        <Text style={styles.addButtonText}>Zur Liste hinzufügen</Text>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌱 Saison-Planer</Text>
        <Text style={styles.headerSubtitle}>
          {getMonthName(seasonStatus.currentMonth)} {new Date().getFullYear()}
        </Text>
      </View>
      
      {/* Season Overview */}
      <View style={styles.seasonCard}>
        <View style={styles.seasonInfo}>
          <View style={styles.seasonStat}>
            <Text style={styles.seasonStatValue}>{plantableNow.length}</Text>
            <Text style={styles.seasonStatLabel}>Jetzt pflanzbar</Text>
          </View>
          <View style={styles.seasonDivider} />
          <View style={styles.seasonStat}>
            <Text style={styles.seasonStatValue}>{plantableSoon.length}</Text>
            <Text style={styles.seasonStatLabel}>Demnächst</Text>
          </View>
        </View>
        <Text style={styles.seasonHint}>
          {seasonStatus.seasonPhase === 'spring' && '🌸 Frühling - Zeit zum Säen!'}
          {seasonStatus.seasonPhase === 'summer' && '☀️ Sommer - Pflege und Ernte!'}
          {seasonStatus.seasonPhase === 'autumn' && '🍂 Herbst - Letzte Ernten!'}
          {seasonStatus.seasonPhase === 'winter' && '❄️ Winter - Planung fürs nächste Jahr!'}
        </Text>
      </View>
      
      {/* Search */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color={Colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Pflanze suchen..."
          placeholderTextColor={Colors.textDisabled}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialIcons name="close" size={20} color={Colors.textLight} />
          </TouchableOpacity>
        ) : null}
      </View>
      
      {/* Tabs */}
      {!searchQuery && (
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'now' && styles.tabActive]}
            onPress={() => setSelectedTab('now')}
          >
            <Text style={[styles.tabText, selectedTab === 'now' && styles.tabTextActive]}>
              Jetzt
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'soon' && styles.tabActive]}
            onPress={() => setSelectedTab('soon')}
          >
            <Text style={[styles.tabText, selectedTab === 'soon' && styles.tabTextActive]}>
              Bald
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'all' && styles.tabActive]}
            onPress={() => setSelectedTab('all')}
          >
            <Text style={[styles.tabText, selectedTab === 'all' && styles.tabTextActive]}>
              Alle
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Plant List */}
      {displayedPlants.length > 0 ? (
        <FlatList
          data={displayedPlants}
          renderItem={renderPlantCard}
          keyExtractor={(item) => `${item.plant.id}-${item.action}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState
          icon="eco"
          title={searchQuery ? 'Keine Pflanzen gefunden' : 'Keine Pflanzen verfügbar'}
          message={
            searchQuery 
              ? 'Versuche einen anderen Suchbegriff'
              : selectedTab === 'now' 
                ? 'Im Moment keine Pflanzen zum Pflanzen. Versuche "Bald" oder "Alle".'
                : 'Keine Pflanzen in dieser Kategorie.'
          }
          containerStyle={styles.emptyContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  seasonCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginTop: -10,
    borderRadius: 12,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  seasonInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  seasonStat: {
    alignItems: 'center',
    flex: 1,
  },
  seasonStatValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  seasonStatLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  seasonDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  seasonHint: {
    textAlign: 'center',
    fontSize: 14,
    color: Colors.text,
    marginTop: 12,
    fontStyle: 'italic',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    height: 44,
    marginHorizontal: 8,
    fontSize: 16,
    color: Colors.text,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textLight,
  },
  tabTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plantCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  plantCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  plantInfo: {
    flex: 1,
  },
  plantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  plantLatin: {
    fontSize: 12,
    color: Colors.textLight,
    fontStyle: 'italic',
    marginTop: 2,
  },
  urgencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgencyText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  plantDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.background,
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 6,
    fontStyle: 'italic',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 4,
  },
});
