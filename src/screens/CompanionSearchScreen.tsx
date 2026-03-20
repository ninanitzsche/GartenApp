import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { searchCompanions } from '../services/companionService';
import { PlantCompanion } from '../types/companion';
import Colors from '../theme/colors';

export default function CompanionSearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlantCompanion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchDebounce = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(searchDebounce);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      const data = await searchCompanions(searchQuery);
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (name: string): string => {
    const nameMap: Record<string, string> = {
      tomato: 'Tomate',
      carrot: 'Karotte',
      onion: 'Zwiebel',
      pea: 'Erbsen',
      bean: 'Bohnen',
      cucumber: 'Gurke',
      lettuce: 'Salat',
      radish: 'Radieschen',
      spinach: 'Spinat',
      potato: 'Kartoffel',
      cabbage: 'Kohl',
      pepper: 'Paprika',
      zucchini: 'Zucchini',
      eggplant: 'Aubergine',
      basil: 'Basilikum',
      dill: 'Dill',
      parsley: 'Petersilie',
      chive: 'Schnittlauch',
      rosemary: 'Rosmarin',
      sage: 'Salbei',
      thyme: 'Thymian',
      mint: 'Minze',
      marigold: 'Ringelblume',
      nasturtium: 'Kapuzinerkresse',
      sunflower: 'Sonnenblume',
      strawberry: 'Erdbeere',
    };
    return nameMap[name.toLowerCase()] || name;
  };

  const renderItem = ({ item }: { item: PlantCompanion }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.plantName}>
          {item.plant_name_de || getDisplayName(item.plant_name)}
        </Text>
        {item.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        )}
      </View>

      {item.good_companions && item.good_companions.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="thumb-up" size={16} color={Colors.success} />
            <Text style={styles.sectionTitle}>Gute Nachbarn</Text>
          </View>
          <View style={styles.chips}>
            {item.good_companions.slice(0, 5).map((comp, idx) => (
              <View key={idx} style={[styles.chip, styles.goodChip]}>
                <Text style={styles.chipText}>{getDisplayName(comp)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {item.bad_companions && item.bad_companions.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="thumb-down" size={16} color={Colors.error} />
            <Text style={[styles.sectionTitle, { color: Colors.error }]}>Schlechte Nachbarn</Text>
          </View>
          <View style={styles.chips}>
            {item.bad_companions.slice(0, 5).map((comp, idx) => (
              <View key={idx} style={[styles.chip, styles.badChip]}>
                <Text style={styles.chipText}>{getDisplayName(comp)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {item.nitrogen_fixer && (
        <View style={styles.infoRow}>
          <MaterialIcons name="eco" size={16} color={Colors.primary} />
          <Text style={styles.infoText}>Stickstoff-Fixierer</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={24} color={Colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Pflanze suchen..."
          placeholderTextColor={Colors.textDisabled}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <MaterialIcons name="close" size={24} color={Colors.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {query.length >= 2 && (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialIcons name="search-off" size={48} color={Colors.textLight} />
              <Text style={styles.emptyText}>
                {loading ? 'Suche...' : 'Keine Ergebnisse gefunden'}
              </Text>
            </View>
          }
        />
      )}

      {query.length < 2 && (
        <View style={styles.hint}>
          <MaterialIcons name="lightbulb" size={24} color={Colors.accent} />
          <Text style={styles.hintText}>
            Gib mindestens 2 Zeichen ein, um nach Pflanzen zu suchen
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    margin: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  plantName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  categoryBadge: {
    backgroundColor: Colors.primaryLight + '30',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  section: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.success,
    marginLeft: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  goodChip: {
    backgroundColor: Colors.success + '20',
  },
  badChip: {
    backgroundColor: Colors.error + '20',
  },
  chipText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  infoText: {
    fontSize: 13,
    color: Colors.primary,
    marginLeft: 8,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 16,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  hintText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    maxWidth: 250,
  },
});
