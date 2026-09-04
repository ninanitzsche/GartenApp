import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { Colors2026, Spacing2026, Radius2026, Typography2026 } from '../../theme/designSystemV2';
import { getGoodCompanions, PLANT_KNOWLEDGE_MAP } from '../../data/plant-knowledge-map';

interface PlantSearchWithToptipProps {
  onSelectPlant: (plantName: string) => void;
  existingPlants?: string[];
  mainPlant?: string;
}

export default function PlantSearchWithToptip({ 
  onSelectPlant, 
  existingPlants = [],
  mainPlant,
}: PlantSearchWithToptipProps) {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const suggestions = useMemo(() => {
    const allPlants = PLANT_KNOWLEDGE_MAP.map(p => p.plantName);
    const filtered = allPlants.filter(name => 
      name.toLowerCase().includes(query.toLowerCase()) &&
      !existingPlants.includes(name)
    );
    return filtered.slice(0, 10);
  }, [query, existingPlants]);

  const goodCompanions = useMemo(() => {
    return mainPlant ? getGoodCompanions(mainPlant) : [];
  }, [mainPlant]);

  const isRecommended = (plantName: string) => {
    return goodCompanions.some(c => c.name === plantName);
  };

  const getBenefit = (plantName: string) => {
    return goodCompanions.find(c => c.name === plantName)?.benefit || '';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>+ Weitere Pflanze hinzufügen</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Pflanze suchen..."
        placeholderTextColor={Colors2026.textMuted}
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          setShowResults(text.length > 0);
        }}
        onFocus={() => query.length > 0 && setShowResults(true)}
      />
      {showResults && suggestions.length > 0 && (
        <View style={styles.resultsContainer}>
          {suggestions.map(name => (
            <TouchableOpacity
              key={name}
              style={styles.resultItem}
              onPress={() => {
                onSelectPlant(name);
                setQuery('');
                setShowResults(false);
              }}
            >
              {isRecommended(name) && <Text style={styles.star}>★</Text>}
              <Text style={styles.resultText}>{name}</Text>
              {isRecommended(name) && (
                <Text style={styles.benefitText}>{getBenefit(name)}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
      {showResults && suggestions.length === 0 && query.length > 0 && (
        <Text style={styles.noResults}>Keine Pflanzen gefunden</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: Spacing2026.md, zIndex: 100 },
  label: { ...Typography2026.caption, color: Colors2026.textMuted, marginBottom: Spacing2026.sm },
  searchInput: {
    backgroundColor: Colors2026.surface,
    borderRadius: Radius2026.md,
    padding: Spacing2026.md,
    color: Colors2026.text,
    fontSize: 16,
  },
  resultsContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: Colors2026.bg,
    borderRadius: Radius2026.md,
    borderWidth: 1,
    borderColor: Colors2026.divider,
    maxHeight: 300,
    zIndex: 1000,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing2026.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors2026.divider,
  },
  star: {
    color: Colors2026.status.success,
    fontSize: 16,
    marginRight: Spacing2026.xs,
  },
  resultText: { ...Typography2026.body, flex: 1 },
  benefitText: { ...Typography2026.caption, color: Colors2026.status.success },
  noResults: { ...Typography2026.caption, color: Colors2026.textMuted, marginTop: Spacing2026.sm },
});