import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Plant } from '../types/plant';
import { TaskListItem } from '../types/task';
import {
  getPlantableNow,
  getPlantableSoon,
  getSeasonStatus,
  searchPlants,
  getMonthName,
  getActionLabel,
  getUserPlantsStatus,
  getRecommendedActionsForUserPlants,
  PlantablePlant,
} from '../services/plantingCalendarService';
import { fetchPlants } from '../services/plantService';
import { fetchTasks } from '../services/taskService';
import { getCurrentSeasonalKnowledge } from '../data/seasonalKnowledge';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SEASONS = {
  spring: { bg: '#F0FAF0', accent: '#2D9D4F', emoji: '🌸' },
  summer: { bg: '#FFF8E7', accent: '#E8943A', emoji: '☀️' },
  autumn: { bg: '#FFF0E7', accent: '#D4633A', emoji: '🍂' },
  winter: { bg: '#F0F4FA', accent: '#5B8DEF', emoji: '❄️' },
};

const PLANT_COLORS: Record<string, string> = {
  tomate: '#E53935', paprika: '#FB8C00', gurke: '#43A047',
  zucchini: '#7CB342', moehre: '#FF7043', radieschen: '#EC407A',
  spinat: '#66BB6A', salat: '#26A69A', rucola: '#9CCC65',
  zwiebel: '#8D6E63', knoblauch: '#A1887F', basilikum: '#4CAF50',
  petersilie: '#2E7D32', schnittlauch: '#689F38', bohne: '#558B2F',
  erbsen: '#7CB342', kohl: '#388E3C', brokkoli: '#4CAF50',
  kartoffeln: '#A1887F', kuerbis: '#EF6C00', lauch: '#43A047',
  default: '#56AB2F',
};

const getPlantColor = (name: string): string => {
  const n = name.toLowerCase().replace(/[öüä]/g, (c: string) => ({ö:'o',ü:'u',ä:'a'}[c] || c));
  for (const [k, v] of Object.entries(PLANT_COLORS)) if (n.includes(k)) return v;
  return PLANT_COLORS.default;
};

const Chip = ({ children, color, small }: { children: React.ReactNode; color?: string; small?: boolean }) => (
  <View style={[styles.chip, small && styles.chipSmall, color && { backgroundColor: color + '20' }]}>
    <Text style={[styles.chipText, small && styles.chipTextSmall, color && { color }]}>{children}</Text>
  </View>
);

export default function SaisonPlanerScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState<'my' | 'ideas'>('my');
  const [plants, setPlants] = useState<Plant[]>([]);
  const [tasks, setTasks] = useState<TaskListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [p, t] = await Promise.all([fetchPlants(), fetchTasks()]);
        setPlants(p);
        setTasks(t);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const season = useMemo(() => SEASONS[getSeasonStatus().seasonPhase] || SEASONS.spring, []);
  const status = useMemo(() => getSeasonStatus(), []);
  const myWithStatus = useMemo(() => getUserPlantsStatus(plants), [plants]);
  const recs = useMemo(() => getRecommendedActionsForUserPlants(plants), [plants]);
  const now = useMemo(() => getPlantableNow(), []);
  const soon = useMemo(() => getPlantableSoon(8), []);
  const knowledge = useMemo(() => getCurrentSeasonalKnowledge(), []);
  const pendingTasks = useMemo(() => tasks.filter(t => !t.completed_at).length, [tasks]);

  const ideas = useMemo(() => {
    if (searchQuery.trim()) return searchPlants(searchQuery).map(p => ({ plant: p, urgency: 'now' as const, weeksUntilOptimal: 0, action: 'direct_sow' as const }));
    return [...now, ...soon].sort((a, b) => a.weeksUntilOptimal - b.weeksUntilOptimal);
  }, [searchQuery, now, soon]);

  const navigateToPlant = (plantId: string) => navigation.navigate('PlantDetail' as any, { plantId });
  const navigateToAddPlant = (name?: string) => navigation.navigate('AddPlant' as any, name ? { prefillName: name } : {});
  const navigateToTasks = () => navigation.navigate('Tasks' as any);

  const renderMyPlant = ({ item }: { item: typeof myWithStatus[0] }) => (
    <TouchableOpacity style={styles.plantRow} onPress={() => navigateToPlant(item.plantId)} activeOpacity={0.7}>
      <View style={[styles.plantDot, { backgroundColor: item.isOverdue ? '#E53935' : item.isOnTrack ? '#2D9D4F' : '#FFA726' }]} />
      <View style={styles.plantRowContent}>
        <Text style={styles.plantRowName}>{item.plantName}</Text>
        <Text style={styles.plantRowMeta}>
          {item.statusLabel}
          {item.calendarEntry && ` · ${getActionLabel(item.nextAction)}`}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CCC" />
    </TouchableOpacity>
  );

  const renderIdea = ({ item }: { item: PlantablePlant }) => (
    <TouchableOpacity style={styles.ideaCard} onPress={() => navigateToAddPlant(item.plant.plant_name)} activeOpacity={0.8}>
      <View style={[styles.ideaHeader, { backgroundColor: getPlantColor(item.plant.plant_name) + '15' }]}>
        <View style={[styles.ideaBadge, { backgroundColor: getPlantColor(item.plant.plant_name) }]}>
          <Text style={styles.ideaBadgeText}>
            {item.urgency === 'now' || item.weeksUntilOptimal === 0 ? '🌱' : `${item.weeksUntilOptimal}w`}
          </Text>
        </View>
        <Text style={styles.ideaName}>{item.plant.plant_name}</Text>
        {item.plant.latin_name && <Text style={styles.ideaLatin}>{item.plant.latin_name}</Text>}
      </View>
      <View style={styles.ideaBody}>
        <View style={styles.ideaMeta}>
          <Text style={styles.ideaMetaText}>📅 {getActionLabel(item.action)}</Text>
          <Text style={styles.ideaMetaText}>☀️ {item.plant.sunlight === 'full' ? 'Vollsonne' : 'Halbschatten'}</Text>
        </View>
        {item.plant.planting_tip && (
          <Text style={styles.ideaTip} numberOfLines={2}>💡 {item.plant.planting_tip}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: season.bg }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerSeason}>{season.emoji} {SEASONS[status.seasonPhase as keyof typeof SEASONS]?.bg.includes('spring') ? 'Frühling' : SEASONS[status.seasonPhase as keyof typeof SEASONS]?.bg.includes('summer') ? 'Sommer' : SEASONS[status.seasonPhase as keyof typeof SEASONS]?.bg.includes('autumn') ? 'Herbst' : 'Winter'}</Text>
            <Text style={styles.headerTitle}>Saison-Planer</Text>
          </View>
          <TouchableOpacity style={styles.monthBadge}>
            <Text style={styles.monthText}>{getMonthName(status.currentMonth)}</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: season.accent }]}>{now.length}</Text>
            <Text style={styles.statLab}>Jetzt pflanzbar</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: season.accent }]}>{plants.length}</Text>
            <Text style={styles.statLab}>Meine Pflanzen</Text>
          </View>
          <View style={styles.statSep} />
          <TouchableOpacity style={styles.stat} onPress={navigateToTasks}>
            <Text style={[styles.statNum, { color: pendingTasks > 0 ? '#E53935' : season.accent }]}>{pendingTasks}</Text>
            <Text style={styles.statLab}>Aufgaben</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Pflanze suchen..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'my' && { backgroundColor: season.accent }]}
          onPress={() => setTab('my')}
        >
          <Text style={[styles.tabText, tab === 'my' && styles.tabTextOn]}>{'Meine Pflanzen'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'ideas' && { backgroundColor: season.accent }]}
          onPress={() => setTab('ideas')}
        >
          <Text style={[styles.tabText, tab === 'ideas' && styles.tabTextOn]}>{'Pflanz-Ideen'}</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {tab === 'my' ? (
        loading ? (
          <View style={styles.loading}><ActivityIndicator size="large" color={season.accent} /></View>
        ) : (
          <FlatList
            data={myWithStatus}
            keyExtractor={(item) => item.plantId}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <>
                {recs.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>⚡ Das steht an</Text>
                    {recs.map((r, i) => (
                      <View key={i} style={[styles.recCard, r.urgency === 'high' && styles.recHigh, r.urgency === 'medium' && styles.recMed]}>
                        <Ionicons name={r.urgency === 'high' ? 'warning' : 'information-circle'} size={20} color={r.urgency === 'high' ? '#E53935' : '#FFA726'} />
                        <Text style={styles.recText}>{r.recommendation}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {pendingTasks > 0 && (
                  <TouchableOpacity style={[styles.taskBanner, { backgroundColor: season.accent }]} onPress={navigateToTasks}>
                    <Text style={styles.taskBannerText}>{pendingTasks} offene Aufgaben</Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFF" />
                  </TouchableOpacity>
                )}
                <Text style={styles.listTitle}>Deine Pflanzen ({myWithStatus.length})</Text>
              </>
            }
            renderItem={renderMyPlant}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>🌻</Text>
                <Text style={styles.emptyTitle}>Keine Pflanzen vorhanden</Text>
                <Text style={styles.emptySub}>Füge deine erste Pflanze hinzu!</Text>
                <TouchableOpacity style={[styles.addBtn, { backgroundColor: season.accent }]} onPress={() => navigateToAddPlant()}>
                  <Text style={styles.addBtnText}>+ Pflanze hinzufügen</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )
      ) : (
        <FlatList
          data={ideas}
          keyExtractor={(item) => `${item.plant.id}-${item.action}`}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              <View style={[styles.knowledgeCard, { borderLeftColor: season.accent }]}>
                <Text style={styles.knowledgeTitle}>💡 {knowledge?.title}</Text>
                <View style={styles.knowledgeTips}>
                  {knowledge?.tips.slice(0, 3).map((t, i) => (
                    <View key={i} style={styles.knowledgeTip}>
                      <View style={[styles.dot, { backgroundColor: season.accent }]} />
                      <Text style={styles.knowledgeTipText}>{t}</Text>
                    </View>
                  ))}
                </View>
              </View>
              {knowledge?.companionPlantingTips && knowledge.companionPlantingTips.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>🌿 Mischkultur</Text>
                  {knowledge.companionPlantingTips?.slice(0, 3).map((c: any, i: number) => (
                    <View key={i} style={[styles.companionCard, c.type === 'avoid' && styles.companionAvoid]}>
                      <Text style={styles.companionPlants}>{c.plant1} ↔ {c.plant2}</Text>
                      <Chip color={c.type === 'good' ? '#2D9D4F' : '#E53935'}>{c.type === 'good' ? '✓ Gut' : '✗ Meiden'}</Chip>
                      <Text style={styles.companionReason}>{c.benefit}</Text>
                    </View>
                  ))}
                </View>
              )}
              <Text style={styles.listTitle}>🌱 Pflanzbar im {getMonthName(status.currentMonth)}</Text>
            </>
          }
          renderItem={renderIdea}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyTitle}>Keine Pflanzen gefunden</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAFA' },
  
  header: {
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerSeason: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -1,
  },
  monthBadge: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  monthText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 32, fontWeight: '800', letterSpacing: -1 },
  statLab: { fontSize: 11, color: '#888', marginTop: 4, fontWeight: '500' },
  statSep: { width: 1, backgroundColor: '#EEE', marginHorizontal: 8 },

  searchWrap: { paddingHorizontal: 24, marginTop: -12, marginBottom: 8 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#333' },

  tabs: {
    flexDirection: 'row',
    marginHorizontal: 24,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 6,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  tabText: { fontSize: 14, fontWeight: '600', color: '#888' },
  tabTextOn: { color: '#FFF' },

  list: { paddingHorizontal: 24, paddingBottom: 100 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 },
  
  recCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA726',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  recHigh: { borderLeftColor: '#E53935', backgroundColor: '#FFF5F5' },
  recMed: { borderLeftColor: '#FFA726', backgroundColor: '#FFFBF0' },
  recText: { flex: 1, fontSize: 14, color: '#333', lineHeight: 20 },

  taskBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  taskBannerText: { fontSize: 16, fontWeight: '600', color: '#FFF' },

  listTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 },

  plantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  plantDot: { width: 12, height: 12, borderRadius: 6 },
  plantRowContent: { flex: 1 },
  plantRowName: { fontSize: 16, fontWeight: '600', color: '#1A1A1A', marginBottom: 2 },
  plantRowMeta: { fontSize: 13, color: '#888' },

  ideaCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  ideaHeader: {
    padding: 18,
    paddingBottom: 14,
  },
  ideaBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ideaBadgeText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
  ideaName: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginTop: 20, marginRight: 50 },
  ideaLatin: { fontSize: 12, color: '#888', fontStyle: 'italic', marginTop: 2 },
  ideaBody: { padding: 18, paddingTop: 14 },
  ideaMeta: { flexDirection: 'row', gap: 16, marginBottom: 10 },
  ideaMetaText: { fontSize: 13, color: '#666', fontWeight: '500' },
  ideaTip: { fontSize: 13, color: '#795548', fontStyle: 'italic', lineHeight: 18 },

  knowledgeCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  knowledgeTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A1A', marginBottom: 14 },
  knowledgeTips: { gap: 10 },
  knowledgeTip: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  knowledgeTipText: { flex: 1, fontSize: 14, color: '#444', lineHeight: 20 },

  companionCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2D9D4F',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  companionAvoid: { borderLeftColor: '#E53935' },
  companionPlants: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  companionReason: { fontSize: 12, color: '#888', lineHeight: 18 },

  chip: { backgroundColor: '#F0F0F0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  chipSmall: { paddingHorizontal: 8, paddingVertical: 3 },
  chipText: { fontSize: 12, fontWeight: '600', color: '#666' },
  chipTextSmall: { fontSize: 10 },

  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 72, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 6 },
  emptySub: { fontSize: 14, color: '#888', marginBottom: 24 },
  addBtn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14 },
  addBtnText: { fontSize: 15, fontWeight: '600', color: '#FFF' },

  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
