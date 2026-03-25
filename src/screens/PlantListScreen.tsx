/**
 * PlantListScreen - Redesigned 2026
 * Glassmorphism + Bold Cards
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert,
  ScrollView,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useReduceMotion } from '../utils/accessibility';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Search, Filter, X, ChevronRight, Sprout, Leaf, Snowflake, Sparkles, MapPin, Plus } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { RootStackParamList } from '../types/navigation';
import { Colors2026, Spacing2026, Radius2026, Typography2026, Shadows2026 } from '../theme/designSystemV2';
import { Plant, PLANT_STATUSES } from '../types/plant';
import { fetchPlants, getUniqueLocations, PlantFilters } from '../services/plantService';
import GlassCard from '../components/ui/GlassCard';
import GlassInput from '../components/ui/GlassInput';
import SectionHeader from '../components/ui/SectionHeader';
import EmptyState from '../components/ui/EmptyState';
import FloatingAction from '../components/ui/FloatingAction';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyPlantsIllustration from '../components/illustrations/EmptyPlantsIllustration';
import TaskListContent from '../components/TaskListContent';
import ShoppingListContent from '../components/ShoppingListContent';

type Props = NativeStackScreenProps<RootStackParamList, 'PlantList'>;

export default function PlantListScreen({ navigation }: Props) {
  const reduceMotion = useReduceMotion();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatusList, setFilterStatusList] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const searchDebounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const tabs = ['Pflanzen', 'Aufgaben', 'Einkauf'];

  useFocusEffect(
    useCallback(() => {
      loadPlants();
      loadLocations();
    }, [])
  );

  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      loadPlants();
    }, 300);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchQuery, filterStatusList]);

  const loadPlants = async () => {
    try {
      const filters: PlantFilters = {
        searchQuery: searchQuery || undefined,
        statuses: filterStatusList.length > 0 ? filterStatusList : undefined,
      };
      const data = await fetchPlants(filters);
      setPlants(data);
    } catch (error) {
      console.error('Error loading plants:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadLocations = async () => {
    try {
      const data = await getUniqueLocations();
      setLocations(data);
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPlants();
  };

  const handleStatusFilterToggle = (status: string) => {
    setFilterStatusList(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const renderPlantItem = ({ item, index }: { item: Plant; index: number }) => {
    const content = (
      <Pressable
        style={styles.plantCard}
        onPress={() => navigation.navigate('PlantDetail', { plantId: item.id })}
      >
        <View style={styles.plantHeader}>
          <View style={styles.plantIcon}>
            <Leaf size={20} color={Colors2026.primary} />
          </View>
          <View style={styles.plantInfo}>
            <Text style={styles.plantName}>{item.name}</Text>
            {item.latin_name && (
              <Text style={styles.plantLatin}>{item.latin_name}</Text>
            )}
          </View>
          <ChevronRight size={20} color={Colors2026.textMuted} />
        </View>

        <View style={styles.plantMeta}>
          <StatusBadge
            status={item.status}
            size="sm"
          />
          {item.location && (
            <View style={styles.locationChip}>
              <MapPin size={12} color={Colors2026.textMuted} />
              <Text style={styles.locationText}>{item.location}</Text>
            </View>
          )}
        </View>

        <View style={styles.plantBadges}>
          {item.essbar && (
            <View style={styles.badge}>
              <Sprout size={14} color={Colors2026.status.success} />
              <Text style={styles.badgeText}>Essbar</Text>
            </View>
          )}
          {item.winterhart && (
            <View style={styles.badge}>
              <Snowflake size={14} color={Colors2026.status.info} />
              <Text style={styles.badgeText}>Winterhart</Text>
            </View>
          )}
          {item.identification_source === 'ai' && (
            <View style={styles.badge}>
              <Sparkles size={14} color={Colors2026.plantStatus.bestellt} />
              <Text style={styles.badgeText}>KI</Text>
            </View>
          )}
          {item.quantity && item.quantity > 1 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.quantity}x</Text>
            </View>
          )}
        </View>
      </Pressable>
    );

    if (reduceMotion) return content;

    return (
      <Animated.View entering={FadeInUp.delay(index * 50).duration(300)}>
        {content}
      </Animated.View>
    );
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 0:
        return (
          <View style={styles.tabContent}>
            {/* Search Bar */}
            <GlassInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Pflanze suchen..."
              icon={<Search size={20} color={Colors2026.textMuted} />}
            />

            {/* Filter Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterChips}
            >
              <Pressable
                style={[
                  styles.filterChip,
                  showFilters && styles.filterChipActive,
                ]}
                onPress={() => setShowFilters(!showFilters)}
              >
                <Filter size={16} color={showFilters ? '#fff' : Colors2026.primary} />
                <Text style={[
                  styles.filterChipText,
                  showFilters && styles.filterChipTextActive,
                ]}>
                  Filter
                </Text>
              </Pressable>

              {showFilters && PLANT_STATUSES.map(status => (
                <Pressable
                  key={status}
                  style={[
                    styles.statusChip,
                    filterStatusList.includes(status) && styles.statusChipActive,
                  ]}
                  onPress={() => handleStatusFilterToggle(status)}
                >
                  <Text style={[
                    styles.statusChipText,
                    filterStatusList.includes(status) && styles.statusChipTextActive,
                  ]}>
                    {status}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Plants List */}
            <FlatList
              data={plants}
              renderItem={renderPlantItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors2026.primary} />
              }
              ListEmptyComponent={
                <EmptyState
                  icon={<EmptyPlantsIllustration />}
                  title={filterStatusList.length > 0 ? 'Keine Pflanzen gefunden' : 'Noch keine Pflanzen'}
                  subtitle={filterStatusList.length > 0
                    ? 'Passen Sie Ihre Filter an'
                    : 'Fügen Sie Ihre erste Pflanze hinzu'
                  }
                />
              }
            />
          </View>
        );
      case 1:
        return <TaskListContent navigation={navigation} showHeader={false} />;
      case 2:
        return <ShoppingListContent />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors2026.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Glass Header */}
      <BlurView intensity={60} style={styles.glassHeader}>
        <Text style={styles.title}>Pflanzen</Text>
        <Text style={styles.subtitle}>{plants.length} Pflanzen</Text>
      </BlurView>

      {/* Tab Selector */}
      <View style={styles.tabSelector}>
        {tabs.map((tab, index) => (
          <Pressable
            key={tab}
            style={[styles.tab, selectedTab === index && styles.tabActive]}
            onPress={() => setSelectedTab(index)}
          >
            <Text style={[styles.tabText, selectedTab === index && styles.tabTextActive]}>
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Tab Content */}
      {renderTabContent()}

      {/* FAB */}
      {selectedTab === 0 && (
        <FloatingAction
          onPress={() => navigation.navigate('AddPlant')}
          icon={<Plus size={24} color="#fff" />}
          accessibilityLabel="Pflanze hinzufügen"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors2026.bg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors2026.bg,
  },
  glassHeader: {
    paddingTop: 60,
    paddingBottom: Spacing2026.xl,
    paddingHorizontal: Spacing2026.xl,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.3)',
  },
  title: {
    fontSize: Typography2026.display.fontSize,
    fontWeight: '800',
    color: Colors2026.text,
    letterSpacing: -1.5,
  },
  subtitle: {
    fontSize: Typography2026.caption.fontSize,
    color: Colors2026.textMuted,
    marginTop: Spacing2026.xs,
  },
  tabSelector: {
    flexDirection: 'row',
    paddingHorizontal: Spacing2026.xl,
    paddingVertical: Spacing2026.md,
    gap: Spacing2026.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing2026.sm,
    paddingHorizontal: Spacing2026.md,
    borderRadius: Radius2026.md,
    backgroundColor: Colors2026.glass.light,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: Colors2026.primary,
  },
  tabText: {
    fontSize: Typography2026.caption.fontSize,
    fontWeight: '600',
    color: Colors2026.textSecondary,
  },
  tabTextActive: {
    color: '#fff',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: Spacing2026.xl,
  },
  filterChips: {
    marginBottom: Spacing2026.md,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing2026.xs,
    paddingHorizontal: Spacing2026.md,
    paddingVertical: Spacing2026.sm,
    borderRadius: Radius2026.round,
    backgroundColor: Colors2026.glass.tint,
    borderWidth: 1,
    borderColor: 'rgba(45,157,79,0.2)',
    marginRight: Spacing2026.sm,
  },
  filterChipActive: {
    backgroundColor: Colors2026.primary,
    borderColor: Colors2026.primary,
  },
  filterChipText: {
    fontSize: Typography2026.small.fontSize,
    fontWeight: '600',
    color: Colors2026.primary,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  statusChip: {
    paddingHorizontal: Spacing2026.md,
    paddingVertical: Spacing2026.sm,
    borderRadius: Radius2026.round,
    backgroundColor: Colors2026.glass.light,
    borderWidth: 1,
    borderColor: Colors2026.border,
    marginRight: Spacing2026.sm,
  },
  statusChipActive: {
    backgroundColor: Colors2026.primary,
    borderColor: Colors2026.primary,
  },
  statusChipText: {
    fontSize: Typography2026.small.fontSize,
    fontWeight: '500',
    color: Colors2026.textSecondary,
  },
  statusChipTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingBottom: 100,
  },
  plantCard: {
    backgroundColor: Colors2026.surface,
    borderRadius: Radius2026.lg,
    padding: Spacing2026.lg,
    marginBottom: Spacing2026.md,
    ...Shadows2026.md,
  },
  plantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing2026.md,
  },
  plantIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors2026.glass.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plantInfo: {
    flex: 1,
  },
  plantName: {
    fontSize: Typography2026.body.fontSize,
    fontWeight: '700',
    color: Colors2026.text,
    letterSpacing: -0.3,
  },
  plantLatin: {
    fontSize: Typography2026.caption.fontSize,
    color: Colors2026.textMuted,
    fontStyle: 'italic',
  },
  plantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing2026.sm,
    marginTop: Spacing2026.md,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing2026.sm,
    paddingVertical: Spacing2026.xs,
    borderRadius: Radius2026.round,
    backgroundColor: Colors2026.bg,
  },
  locationText: {
    fontSize: Typography2026.small.fontSize,
    color: Colors2026.textMuted,
  },
  plantBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing2026.sm,
    marginTop: Spacing2026.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing2026.sm,
    paddingVertical: Spacing2026.xs,
    borderRadius: Radius2026.round,
    backgroundColor: Colors2026.bg,
  },
  badgeText: {
    fontSize: Typography2026.small.fontSize,
    color: Colors2026.textSecondary,
    fontWeight: '500',
  },
});
