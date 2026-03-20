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
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Colors from '../theme/colors';
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
  getDifficultyColor,
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

const PLANT_EMOJIS: Record<string, string> = {
  tomate: '🍅',
  paprika: '🌶️',
  gurke: '🥒',
  zucchini: '🎃',
  moehre: '🥕',
  radieschen: '🔴',
  spinat: '🥬',
  salat: '🥗',
  rucola: '🌿',
  zwiebel: '🧅',
  knoblauch: '🧄',
  basilikum: '🌱',
  petersilie: '🌿',
  schnittlauch: '🧅',
  bohne: '🫘',
  erbsen: '🟢',
  kohl: '🥬',
  brokkoli: '🥦',
  kartoffeln: '🥔',
  ruebe: '🟣',
  kuerbis: '🎃',
  lauch: '🌱',
  sellerie: '🥬',
  fenchel: '🌿',
  majoran: '🌿',
  thymian: '🌿',
  rosmarin: '🌿',
  minze: '🌿',
  dill: '🌿',
  korian: '🌿',
  gemüse: '🥕',
  kräuter: '🌿',
  obst: '🍎',
  default: '🌱',
};

const CATEGORY_COLORS: Record<string, string> = {
  gemüse: '#4CAF50',
  kräuter: '#8BC34A',
  obst: '#FF9800',
  salat: '#66BB6A',
};

const getPlantEmoji = (plantName: string, category?: string): string => {
  const normalized = plantName.toLowerCase().replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ä/g, 'a');
  for (const [key, emoji] of Object.entries(PLANT_EMOJIS)) {
    if (normalized.includes(key)) return emoji;
  }
  if (category && CATEGORY_COLORS[category]) return '🌱';
  return PLANT_EMOJIS.default;
};

const getCategoryColor = (category: string): string => {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.default;
};

const SEASON_GRADIENTS: Record<string, [string, string]> = {
  spring: ['#81C784', '#4CAF50'],
  summer: ['#FFD54F', '#FF9800'],
  autumn: ['#FF8A65', '#E64A19'],
  winter: ['#90CAF9', '#42A5F5'],
};

const SEASON_EMOJIS: Record<string, string> = {
  spring: '🌸',
  summer: '☀️',
  autumn: '🍂',
  winter: '❄️',
};

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
  
  const userPlantsWithStatus = useMemo(() => {
    return getUserPlantsStatus(userPlants);
  }, [userPlants]);
  
  const recommendations = useMemo(() => {
    return getRecommendedActionsForUserPlants(userPlants);
  }, [userPlants]);
  
  const seasonStatus = useMemo(() => getSeasonStatus(), []);
  const plantableNow = useMemo(() => getPlantableNow(), []);
  const plantableSoon = useMemo(() => getPlantableSoon(8), []);
  const seasonalKnowledge = useMemo(() => getCurrentSeasonalKnowledge(), []);
  
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

  const pendingTasksCount = useMemo(() => {
    return tasks.filter(t => !t.completed_at).length;
  }, [tasks]);
  
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
    if (item.weeksUntilOptimal <= 2) return `${item.weeksUntilOptimal} Wo${item.weeksUntilOptimal > 1 ? 'chen' : 'che'}`;
    return `${item.weeksUntilOptimal} Wo.`;
  };
  
  const renderPlantCard = ({ item }: { item: PlantablePlant }) => (
    <TouchableOpacity
      style={styles.modernCard}
      onPress={() => handleAddPlant(item.plant)}
      activeOpacity={0.8}
      accessibilityLabel={`${item.plant.plant_name} hinzufügen`}
      accessibilityRole="button"
    >
      <View style={[styles.cardEmojiContainer, { backgroundColor: `${getCategoryColor(item.plant.category)}20` }]}>
        <Text style={styles.cardEmoji}>{getPlantEmoji(item.plant.plant_name, item.plant.category)}</Text>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardPlantName}>{item.plant.plant_name}</Text>
            <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(item.urgency, item.weeksUntilOptimal) }]}>
              <Text style={styles.urgencyText}>{getUrgencyLabel(item)}</Text>
            </View>
          </View>
          {item.plant.latin_name && (
            <Text style={styles.cardLatin}>{item.plant.latin_name}</Text>
          )}
        </View>
        
        <View style={styles.cardMeta}>
          <View style={styles.metaItem}>
            <MaterialIcons name="schedule" size={14} color={Colors.textLight} />
            <Text style={styles.metaText}>{getActionLabel(item.action)}</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialIcons name={item.plant.sunlight === 'full' ? 'wb-sunny' : 'wb-twilight'} size={14} color={Colors.textLight} />
            <Text style={styles.metaText}>
              {item.plant.sunlight === 'full' ? 'Vollsonne' : 
               item.plant.sunlight === 'partial' ? 'Halbschatten' : 'Schatten'}
            </Text>
          </View>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.plant.difficulty) }]}>
            <Text style={styles.difficultyText}>{getDifficultyLabel(item.plant.difficulty)}</Text>
          </View>
        </View>
        
        {item.plant.planting_tip && (
          <View style={styles.tipContainer}>
            <MaterialIcons name="lightbulb" size={12} color={Colors.accent} />
            <Text style={styles.tipText} numberOfLines={2}>{item.plant.planting_tip}</Text>
          </View>
        )}
        
        <TouchableOpacity style={styles.addButtonFull} onPress={() => handleAddPlant(item.plant)}>
          <MaterialIcons name="add-circle" size={20} color={Colors.primary} />
          <Text style={styles.addButtonText}>Zur Liste hinzufügen</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
  
  const seasonGradient = SEASON_GRADIENTS[seasonStatus.seasonPhase] || SEASON_GRADIENTS.spring;
  const seasonEmoji = SEASON_EMOJIS[seasonStatus.seasonPhase] || '🌱';

  return (
    <View style={styles.container}>
      {/* Modern Gradient Header */}
      <LinearGradient
        colors={[...seasonGradient, '#2E7D32']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <Text style={styles.headerEmoji}>{seasonEmoji}</Text>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Saison-Planer</Text>
              <Text style={styles.headerSubtitle}>
                {getMonthName(seasonStatus.currentMonth)} {new Date().getFullYear()}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Season Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{plantableNow.length}</Text>
            <Text style={styles.statLabel}>Jetzt pflanzbar</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userPlants.length}</Text>
            <Text style={styles.statLabel}>Meine Pflanzen</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{pendingTasksCount}</Text>
            <Text style={styles.statLabel}>Aufgaben</Text>
          </View>
        </View>
      </LinearGradient>
      
      {/* Tabs with animated style */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'my' && styles.tabActive]}
          onPress={() => setSelectedTab('my')}
          activeOpacity={0.7}
        >
          <MaterialIcons 
            name="local-florist" 
            size={18} 
            color={selectedTab === 'my' ? '#fff' : Colors.textLight} 
          />
          <Text style={[styles.tabText, selectedTab === 'my' && styles.tabTextActive]}>
            Meine Pflanzen
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'ideas' && styles.tabActive]}
          onPress={() => setSelectedTab('ideas')}
          activeOpacity={0.7}
        >
          <MaterialIcons 
            name="lightbulb" 
            size={18} 
            color={selectedTab === 'ideas' ? '#fff' : Colors.textLight} 
          />
          <Text style={[styles.tabText, selectedTab === 'ideas' && styles.tabTextActive]}>
            Pflanz-Ideen
          </Text>
        </TouchableOpacity>
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
          <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="close" size={20} color={Colors.textLight} />
          </TouchableOpacity>
        ) : null}
      </View>
      
      {/* Tab Content */}
      {selectedTab === 'my' ? (
        loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Lade deine Pflanzen...</Text>
          </View>
        ) : (
          <FlatList
            data={userPlantsWithStatus}
            keyExtractor={(item) => item.plantId}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View>
                {/* Recommendations Section */}
                {recommendations.length > 0 && (
                  <View style={styles.recommendationSection}>
                    <View style={styles.sectionHeader}>
                      <MaterialIcons name="notifications-active" size={20} color={Colors.primary} />
                      <Text style={styles.sectionTitle}>Das steht an</Text>
                    </View>
                    {recommendations.map((rec, index) => (
                      <View 
                        key={index} 
                        style={[
                          styles.recommendationCard,
                          rec.urgency === 'high' && styles.recommendationHigh,
                          rec.urgency === 'medium' && styles.recommendationMedium,
                        ]}
                      >
                        <View style={[styles.recIconContainer, { backgroundColor: rec.urgency === 'high' ? '#FFEBEE' : '#FFF8E1' }]}>
                          <MaterialIcons 
                            name={rec.urgency === 'high' ? 'warning' : 'info'} 
                            size={18} 
                            color={rec.urgency === 'high' ? Colors.error : Colors.warning} 
                          />
                        </View>
                        <Text style={styles.recommendationText}>{rec.recommendation}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Tasks Section */}
                {pendingTasksCount > 0 && (
                  <TouchableOpacity 
                    style={styles.tasksBanner}
                    onPress={() => navigation.navigate('Tasks' as any)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.tasksBannerLeft}>
                      <View style={styles.tasksBadge}>
                        <Text style={styles.tasksBadgeText}>{pendingTasksCount}</Text>
                      </View>
                      <Text style={styles.tasksBannerText}>Offene Aufgaben</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={24} color="#fff" />
                  </TouchableOpacity>
                )}
                
                {/* User Plants Header */}
                <Text style={styles.listHeader}>
                  <MaterialIcons name="eco" size={18} color={Colors.primary} /> Deine Pflanzen ({userPlantsWithStatus.length})
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.userPlantCard}
                onPress={() => navigation.navigate('PlantDetail', { plantId: item.plantId })}
                activeOpacity={0.8}
              >
                <View style={[styles.userPlantEmoji, { backgroundColor: '#E8F5E9' }]}>
                  <Text style={styles.userPlantEmojiText}>🌱</Text>
                </View>
                <View style={styles.userPlantInfo}>
                  <Text style={styles.userPlantName}>{item.plantName}</Text>
                  <View style={styles.userPlantMeta}>
                    <View style={[styles.statusBadge, { 
                      backgroundColor: item.isOverdue ? '#FFEBEE' : item.isOnTrack ? '#E8F5E9' : Colors.background 
                    }]}>
                      <MaterialIcons 
                        name={item.isOverdue ? 'warning' : item.isOnTrack ? 'check-circle' : 'schedule'} 
                        size={12} 
                        color={item.isOverdue ? Colors.error : item.isOnTrack ? Colors.success : Colors.textLight} 
                      />
                      <Text style={[styles.statusBadgeText, { color: item.isOverdue ? Colors.error : item.isOnTrack ? Colors.success : Colors.textLight }]}>
                        {item.statusLabel}
                      </Text>
                    </View>
                    {item.calendarEntry && (
                      <View style={styles.nextActionBadge}>
                        <MaterialIcons name="arrow-forward" size={12} color={Colors.primary} />
                        <Text style={styles.nextActionText}>{getActionLabel(item.nextAction)}</Text>
                      </View>
                    )}
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={Colors.textLight} />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>🌻</Text>
                <Text style={styles.emptyText}>Keine Pflanzen vorhanden</Text>
                <Text style={styles.emptySubtext}>Füge deine erste Pflanze hinzu!</Text>
                <TouchableOpacity 
                  style={styles.addPlantButton}
                  onPress={() => navigation.navigate('AddPlant', {})}
                >
                  <MaterialIcons name="add" size={20} color="#fff" />
                  <Text style={styles.addPlantButtonText}>+ Pflanze hinzufügen</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )
      ) : (
        <FlatList
          data={displayedPlants}
          renderItem={renderPlantCard}
          keyExtractor={(item) => `${item.plant.id}-${item.action}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View>
              {/* Seasonal Knowledge Card */}
              <View style={styles.knowledgeCard}>
                <View style={styles.knowledgeHeader}>
                  <Text style={styles.knowledgeEmoji}>📚</Text>
                  <Text style={styles.knowledgeTitle}>{seasonalKnowledge?.title}</Text>
                </View>
                
                <Text style={styles.knowledgeSectionTitle}>💡 Tipps für heute</Text>
                {seasonalKnowledge?.tips.map((tip, index) => (
                  <View key={`tip-${index}`} style={styles.knowledgeItem}>
                    <View style={styles.bulletDot} />
                    <Text style={styles.knowledgeText}>{tip}</Text>
                  </View>
                ))}
                
                <Text style={styles.knowledgeSectionTitle}>🌱 Diese Woche</Text>
                {seasonalKnowledge?.activities.map((activity, index) => (
                  <View key={`act-${index}`} style={styles.knowledgeItem}>
                    <MaterialIcons name="check" size={14} color={Colors.success} />
                    <Text style={styles.knowledgeText}>{activity}</Text>
                  </View>
                ))}
              </View>
              
              {/* Companion Planting Tips */}
              {seasonalKnowledge?.companionPlantingTips && seasonalKnowledge.companionPlantingTips.length > 0 && (
                <View style={styles.companionSection}>
                  <Text style={styles.sectionTitle}>
                    <MaterialIcons name="group-add" size={20} color={Colors.primary} /> Mischkultur-Tipps
                  </Text>
                  {seasonalKnowledge.companionPlantingTips.map((tip, index) => (
                    <View 
                      key={`comp-${index}`} 
                      style={[
                        styles.companionCard,
                        tip.type === 'avoid' && styles.companionCardAvoid,
                      ]}
                    >
                      <View style={styles.companionHeader}>
                        <View style={styles.companionPlants}>
                          <Text style={styles.companionPlant}>{tip.plant1}</Text>
                          <MaterialIcons name={tip.type === 'good' ? 'swap-horiz' : 'block'} size={16} color={tip.type === 'good' ? Colors.success : Colors.error} />
                          <Text style={styles.companionPlant}>{tip.plant2}</Text>
                        </View>
                        <View style={[
                          styles.companionBadge,
                          tip.type === 'good' ? styles.companionBadgeGood : styles.companionBadgeAvoid,
                        ]}>
                          <Text style={[styles.companionBadgeText, { color: tip.type === 'good' ? Colors.success : Colors.error }]}>
                            {tip.type === 'good' ? '✓ Gut' : '✗ Meiden'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.companionBenefit}>{tip.benefit}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              {/* Plantable Plants Header */}
              <View style={styles.plantListHeader}>
                <MaterialIcons name="eco" size={22} color={Colors.primary} />
                <Text style={styles.plantListHeaderText}>Pflanzbar im {getMonthName(seasonStatus.currentMonth)}</Text>
              </View>
              {plantableNow.length === 0 && (
                <Text style={styles.noPlantsHint}>Keine Pflanzen aktuell pflanzbar. Schau unten für bald pflanzbare Pflanzen!</Text>
              )}
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyText}>Keine Pflanzen gefunden</Text>
              <Text style={styles.emptySubtext}>Versuche einen anderen Suchbegriff</Text>
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
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerContent: {
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: 40,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: -10,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    height: 46,
    marginHorizontal: 10,
    fontSize: 16,
    color: Colors.text,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  recommendationSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.text,
  },
  recommendationCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recommendationHigh: {
    backgroundColor: '#FFF3F3',
    borderColor: Colors.error,
  },
  recommendationMedium: {
    backgroundColor: '#FFFDE7',
    borderColor: Colors.warning,
  },
  recIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  tasksBanner: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tasksBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tasksBadge: {
    backgroundColor: '#fff',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tasksBadgeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  tasksBannerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  listHeader: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  userPlantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  userPlantEmoji: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  userPlantEmojiText: {
    fontSize: 24,
  },
  userPlantInfo: {
    flex: 1,
  },
  userPlantName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  userPlantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  nextActionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nextActionText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 20,
  },
  addPlantButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  addPlantButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textLight,
  },
  modernCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  cardEmojiContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardEmoji: {
    fontSize: 32,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    marginBottom: 8,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  cardPlantName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
  },
  cardLatin: {
    fontSize: 11,
    color: Colors.textLight,
    fontStyle: 'italic',
    marginTop: 2,
  },
  urgencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF8E1',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    gap: 6,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    color: '#795548',
    lineHeight: 18,
  },
  addButtonFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  knowledgeCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
  },
  knowledgeSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 10,
    marginTop: 14,
  },
  knowledgeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 10,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 6,
  },
  knowledgeText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
    lineHeight: 20,
  },
  companionSection: {
    marginBottom: 20,
  },
  companionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  companionCardAvoid: {
    borderLeftColor: Colors.error,
  },
  companionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  companionPlants: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  companionPlant: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  companionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  companionBadgeGood: {
    backgroundColor: '#E8F5E9',
  },
  companionBadgeAvoid: {
    backgroundColor: '#FFEBEE',
  },
  companionBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  companionBenefit: {
    fontSize: 12,
    color: Colors.textLight,
    lineHeight: 18,
  },
  plantListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 10,
  },
  plantListHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  noPlantsHint: {
    fontSize: 13,
    color: Colors.textLight,
    fontStyle: 'italic',
    marginBottom: 12,
  },
});
