import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { PlantingCalendarEntry } from '../data/plantingCalendarData';
import { Plant } from '../types/plant';
import { TaskListItem } from '../types/task';
import {
  getPlantableNow,
  getPlantableSoon,
  getSeasonStatus,
  searchPlants,
  getMonthName,
  getActionLabel,
  getDifficultyLabel,
  getUserPlantsStatus,
  getRecommendedActionsForUserPlants,
  PlantablePlant,
} from '../services/plantingCalendarService';
import { fetchPlants } from '../services/plantService';
import { fetchTasks } from '../services/taskService';
import { getCurrentSeasonalKnowledge } from '../data/seasonalKnowledge';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

const SEASON_THEMES = {
  spring: {
    gradient: ['#A8E6CF', '#56AB2F'],
    emoji: '🌸',
    title: 'Frühling',
    accent: '#56AB2F',
  },
  summer: {
    gradient: ['#FAD0C4', '#FFD1FF'],
    emoji: '☀️',
    title: 'Sommer',
    accent: '#FF9A44',
  },
  autumn: {
    gradient: ['#F8B595', '#F67280'],
    emoji: '🍂',
    title: 'Herbst',
    accent: '#F67280',
  },
  winter: {
    gradient: ['#E0EAFC', '#CFDEF3'],
    emoji: '❄️',
    title: 'Winter',
    accent: '#667EEA',
  },
};

const PLANT_ICONS: Record<string, string> = {
  tomate: 'food-apple',
  paprika: 'chili-mild',
  gurke: 'cucumber',
  zucchini: 'ghost',
  moehre: 'carrot',
  radieschen: 'radio',
  spinat: 'leaf',
  salat: 'food-variant',
  rucola: 'grass',
  zwiebel: 'onion',
  knoblauch: 'garlic',
  basilikum: 'leaf-maple',
  petersilie: 'herb',
  schnittlauch: 'chives',
  bohne: 'seed',
  erbsen: 'pea',
  kohl: 'cabbage',
  brokkoli: 'broccoli',
  kartoffeln: 'pot-mashed',
  kuerbis: 'pumpkin',
  lauch: 'leek',
  sellerie: 'celery',
  default: 'sprout',
};

const getPlantIcon = (name: string): string => {
  const lower = name.toLowerCase().replace(/[öüä]/g, (c) => ({ö:'o',ü:'u',ä:'a'}[c]));
  for (const [key, icon] of Object.entries(PLANT_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return PLANT_ICONS.default;
};

const ModernCard = ({ children, style, onPress }: any) => {
  const content = (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
  
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
};

const FloatingButton = ({ children, style, onPress }: any) => (
  <TouchableOpacity 
    onPress={onPress} 
    activeOpacity={0.8}
    style={[styles.floatingButton, style]}
  >
    {children}
  </TouchableOpacity>
);

export default function SaisonPlanerScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'my' | 'ideas'>('my');
  const [userPlants, setUserPlants] = useState<Plant[]>([]);
  const [tasks, setTasks] = useState<TaskListItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [plants, taskList] = await Promise.all([
        fetchPlants(),
        fetchTasks()
      ]);
      setUserPlants(plants);
      setTasks(taskList);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  const userPlantsWithStatus = useMemo(() => getUserPlantsStatus(userPlants), [userPlants]);
  const recommendations = useMemo(() => getRecommendedActionsForUserPlants(userPlants), [userPlants]);
  const seasonStatus = useMemo(() => getSeasonStatus(), []);
  const plantableNow = useMemo(() => getPlantableNow(), []);
  const plantableSoon = useMemo(() => getPlantableSoon(8), []);
  const seasonalKnowledge = useMemo(() => getCurrentSeasonalKnowledge(), []);
  const pendingTasksCount = useMemo(() => tasks.filter(t => !t.completed_at).length, [tasks]);

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
    return [...plantableNow, ...plantableSoon].sort((a, b) => 
      a.weeksUntilOptimal - b.weeksUntilOptimal
    );
  }, [searchQuery, searchResults, plantableNow, plantableSoon]);

  const theme = SEASON_THEMES[seasonStatus.seasonPhase] || SEASON_THEMES.spring;

  const renderPlantIdeaCard = ({ item }: { item: PlantablePlant }) => (
    <ModernCard style={styles.ideaCard}>
      <View style={styles.ideaCardHeader}>
        <View style={styles.ideaIconContainer}>
          <MaterialCommunityIcons 
            name={getPlantIcon(item.plant.plant_name) as any} 
            size={28} 
            color="#56AB2F" 
          />
        </View>
        <View style={styles.ideaInfo}>
          <Text style={styles.ideaName}>{item.plant.plant_name}</Text>
          {item.plant.latin_name && (
            <Text style={styles.ideaLatin}>{item.plant.latin_name}</Text>
          )}
        </View>
        <View style={[
          styles.urgencyPill, 
          { backgroundColor: item.urgency === 'now' ? '#FF6B6B' : '#FFE66D' }
        ]}>
          <Text style={[
            styles.urgencyText, 
            { color: item.urgency === 'now' ? '#fff' : '#333' }
          ]}>
            {item.urgency === 'now' ? '🌱 Jetzt' : `${item.weeksUntilOptimal}w`}
          </Text>
        </View>
      </View>
      
      <View style={styles.ideaMeta}>
        <View style={styles.metaChip}>
          <MaterialCommunityIcons name="clock-outline" size={14} color="#666" />
          <Text style={styles.metaChipText}>{getActionLabel(item.action)}</Text>
        </View>
        <View style={styles.metaChip}>
          <MaterialCommunityIcons name={item.plant.sunlight === 'full' ? 'white-balance-sunny' : 'weather-partly-cloudy'} size={14} color="#666" />
          <Text style={styles.metaChipText}>
            {item.plant.sunlight === 'full' ? 'Sonne' : 'Halbschatten'}
          </Text>
        </View>
        <View style={[styles.difficultyPill, { backgroundColor: getDifficultyLabel(item.plant.difficulty) === 'Einfach' ? '#E8F5E9' : getDifficultyLabel(item.plant.difficulty) === 'Mittel' ? '#FFF3E0' : '#FFEBEE' }]}>
          <Text style={[styles.difficultyText, { color: getDifficultyLabel(item.plant.difficulty) === 'Einfach' ? '#4CAF50' : getDifficultyLabel(item.plant.difficulty) === 'Mittel' ? '#FF9800' : '#F44336' }]}>
            {getDifficultyLabel(item.plant.difficulty)}
          </Text>
        </View>
      </View>
      
      {item.plant.planting_tip && (
        <View style={styles.tipBubble}>
          <MaterialCommunityIcons name="lightbulb-outline" size={14} color="#FFC107" />
          <Text style={styles.tipText}>{item.plant.planting_tip}</Text>
        </View>
      )}
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('AddPlant' as any, {
          prefillName: item.plant.plant_name,
        })}
      >
        <Text style={styles.addButtonText}>Zur Liste hinzufügen</Text>
        <MaterialCommunityIcons name="arrow-right" size={18} color="#56AB2F" />
      </TouchableOpacity>
    </ModernCard>
  );

  const renderMyPlantCard = ({ item }: any) => (
    <ModernCard 
      style={styles.myPlantCard}
      onPress={() => navigation.navigate('PlantDetail' as any, { plantId: item.plantId })}
    >
      <View style={styles.myPlantRow}>
        <View style={styles.myPlantIcon}>
          <MaterialCommunityIcons name="sprout" size={24} color="#56AB2F" />
        </View>
        <View style={styles.myPlantInfo}>
          <Text style={styles.myPlantName}>{item.plantName}</Text>
          <View style={styles.myPlantMeta}>
            <View style={[
              styles.statusDot, 
              { backgroundColor: item.isOverdue ? '#FF6B6B' : item.isOnTrack ? '#4CAF50' : '#FFE66D' }
            ]} />
            <Text style={styles.statusLabel}>{item.statusLabel}</Text>
            {item.calendarEntry && (
              <Text style={styles.nextAction}>· {getActionLabel(item.nextAction)}</Text>
            )}
          </View>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
      </View>
    </ModernCard>
  );

  return (
    <View style={styles.container}>
      {/* Hero Section */}
      <View style={[styles.hero, { backgroundColor: theme.gradient[0] }]}>
        <View style={styles.heroContent}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroEmoji}>{theme.emoji}</Text>
              <Text style={styles.heroTitle}>Saison-Planer</Text>
              <Text style={styles.heroSubtitle}>{getMonthName(seasonStatus.currentMonth)}</Text>
            </View>
          </View>
          
          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{plantableNow.length}</Text>
              <Text style={styles.statLabel}>Jetzt pflanzbar</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{userPlants.length}</Text>
              <Text style={styles.statLabel}>Meine Pflanzen</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{pendingTasksCount}</Text>
              <Text style={styles.statLabel}>Aufgaben</Text>
            </View>
          </View>
        </View>
        
        {/* Decorative circles */}
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={22} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Pflanze suchen..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabWrapper}>
        <View style={styles.tabBar}>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'my' && styles.tabActive]}
            onPress={() => setSelectedTab('my')}
          >
            <MaterialCommunityIcons 
              name="leaf" 
              size={20} 
              color={selectedTab === 'my' ? '#fff' : '#666'} 
            />
            <Text style={[styles.tabLabel, selectedTab === 'my' && styles.tabLabelActive]}>
              Meine Pflanzen
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'ideas' && styles.tabActive]}
            onPress={() => setSelectedTab('ideas')}
          >
            <MaterialCommunityIcons 
              name="lightbulb-outline" 
              size={20} 
              color={selectedTab === 'ideas' ? '#fff' : '#666'} 
            />
            <Text style={[styles.tabLabel, selectedTab === 'ideas' && styles.tabLabelActive]}>
              Pflanz-Ideen
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {selectedTab === 'my' ? (
        loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color="#56AB2F" />
          </View>
        ) : (
          <FlatList
            data={userPlantsWithStatus}
            keyExtractor={(item) => item.plantId}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <>
                {/* Recommendations */}
                {recommendations.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Das steht an</Text>
                    {recommendations.map((rec, idx) => (
                      <View key={idx} style={[
                        styles.recCard,
                        rec.urgency === 'high' && styles.recCardUrgent,
                        rec.urgency === 'medium' && styles.recCardWarning,
                      ]}>
                        <MaterialCommunityIcons 
                          name={rec.urgency === 'high' ? 'alert-circle' : 'information'} 
                          size={20} 
                          color={rec.urgency === 'high' ? '#FF6B6B' : '#FFE66D'} 
                        />
                        <Text style={styles.recText}>{rec.recommendation}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Tasks Banner */}
                {pendingTasksCount > 0 && (
                  <TouchableOpacity 
                    style={styles.tasksBanner}
                    onPress={() => navigation.navigate('Tasks' as any)}
                  >
                    <View style={styles.tasksBannerLeft}>
                      <View style={styles.tasksBadge}>
                        <Text style={styles.tasksBadgeText}>{pendingTasksCount}</Text>
                      </View>
                      <Text style={styles.tasksBannerText}>Offene Aufgaben</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#fff" />
                  </TouchableOpacity>
                )}

                <Text style={styles.listHeader}>
                  Deine Pflanzen ({userPlantsWithStatus.length})
                </Text>
              </>
            }
            renderItem={renderMyPlantCard}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🌻</Text>
                <Text style={styles.emptyTitle}>Keine Pflanzen vorhanden</Text>
                <Text style={styles.emptySubtitle}>Füge deine erste Pflanze hinzu!</Text>
                <TouchableOpacity 
                  style={styles.emptyButton}
                  onPress={() => navigation.navigate('AddPlant' as any, {})}
                >
                  <Text style={styles.emptyButtonText}>+ Pflanze hinzufügen</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )
      ) : (
        <FlatList
          data={displayedPlants}
          keyExtractor={(item) => `${item.plant.id}-${item.action}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              {/* Knowledge Card */}
              <ModernCard style={styles.knowledgeCard}>
                <View style={styles.knowledgeHeader}>
                  <Text style={styles.knowledgeEmoji}>💡</Text>
                  <Text style={styles.knowledgeTitle}>{seasonalKnowledge?.title}</Text>
                </View>
                
                <View style={styles.knowledgeSection}>
                  <Text style={styles.knowledgeSectionTitle}>Tipps für heute</Text>
                  {seasonalKnowledge?.tips.slice(0, 3).map((tip, idx) => (
                    <View key={idx} style={styles.knowledgeItem}>
                      <View style={styles.bulletPoint} />
                      <Text style={styles.knowledgeText}>{tip}</Text>
                    </View>
                  ))}
                </View>
              </ModernCard>

              {/* Companion Tips */}
              {seasonalKnowledge?.companionPlantingTips?.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>🌿 Mischkultur-Tipps</Text>
                  {seasonalKnowledge.companionPlantingTips.slice(0, 3).map((tip, idx) => (
                    <View key={idx} style={[
                      styles.companionCard,
                      tip.type === 'avoid' && styles.companionCardAvoid,
                    ]}>
                      <View style={styles.companionRow}>
                        <Text style={styles.companionPlants}>{tip.plant1} ↔ {tip.plant2}</Text>
                        <View style={[
                          styles.companionBadge,
                          tip.type === 'good' ? styles.badgeGood : styles.badgeAvoid,
                        ]}>
                          <Text style={[
                            styles.badgeText,
                            { color: tip.type === 'good' ? '#4CAF50' : '#FF6B6B' }
                          ]}>
                            {tip.type === 'good' ? '✓ Gut' : '✗ Meiden'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.companionReason}>{tip.benefit}</Text>
                    </View>
                  ))}
                </View>
              )}

              <Text style={styles.listHeader}>
                🌱 Pflanzbar im {getMonthName(seasonStatus.currentMonth)}
              </Text>
            </>
          }
          renderItem={renderPlantIdeaCard}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyTitle}>Keine Pflanzen gefunden</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  
  // Hero Section
  hero: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'relative',
    overflow: 'hidden',
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
  },
  heroTop: {
    marginBottom: 20,
  },
  heroEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: -1,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#56AB2F',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },
  decorCircle1: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  decorCircle2: {
    position: 'absolute',
    right: 40,
    bottom: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },

  // Search
  searchWrapper: {
    paddingHorizontal: 20,
    marginTop: -15,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },

  // Tabs
  tabWrapper: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  tabActive: {
    backgroundColor: '#56AB2F',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabLabelActive: {
    color: '#fff',
  },

  // List Content
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  
  // Recommendation Cards
  recCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFE66D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  recCardUrgent: {
    borderLeftColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  recCardWarning: {
    borderLeftColor: '#FFE66D',
    backgroundColor: '#FFFBEB',
  },
  recText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },

  // Tasks Banner
  tasksBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#56AB2F',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  tasksBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tasksBadge: {
    backgroundColor: '#fff',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tasksBadgeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#56AB2F',
  },
  tasksBannerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  // List Header
  listHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },

  // Cards
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  
  // My Plant Card
  myPlantCard: {
    padding: 16,
  },
  myPlantRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  myPlantIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  myPlantInfo: {
    flex: 1,
  },
  myPlantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  myPlantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusLabel: {
    fontSize: 13,
    color: '#666',
  },
  nextAction: {
    fontSize: 13,
    color: '#56AB2F',
    marginLeft: 4,
  },

  // Idea Card
  ideaCard: {
    padding: 18,
  },
  ideaCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  ideaIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  ideaInfo: {
    flex: 1,
  },
  ideaName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  ideaLatin: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 2,
  },
  urgencyPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: '700',
  },
  ideaMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  metaChipText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  difficultyPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tipBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#795548',
    lineHeight: 18,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#56AB2F',
  },

  // Knowledge Card
  knowledgeCard: {
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  knowledgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  knowledgeEmoji: {
    fontSize: 28,
  },
  knowledgeTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
  },
  knowledgeSection: {
    marginTop: 8,
  },
  knowledgeSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
  },
  knowledgeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 10,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#56AB2F',
    marginTop: 6,
  },
  knowledgeText: {
    flex: 1,
    fontSize: 13,
    color: '#444',
    lineHeight: 20,
  },

  // Companion Cards
  companionCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#56AB2F',
  },
  companionCardAvoid: {
    borderLeftColor: '#FF6B6B',
  },
  companionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  companionPlants: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  companionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeGood: {
    backgroundColor: '#E8F5E9',
  },
  badgeAvoid: {
    backgroundColor: '#FFEBEE',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  companionReason: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#56AB2F',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },

  // Loading
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Floating Button
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#56AB2F',
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#56AB2F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
