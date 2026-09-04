import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Colors2026, Spacing2026, Radius2026, Typography2026 } from '../../theme/designSystemV2';
import { Gilde } from '../../types/gilde';
import GildeCard from './GildeCard';
import { getSuggestedGilden } from '../../services/gildeService';

interface GildeSelectorProps {
  gilden: Gilde[];
  onSelect: (gilde: Gilde) => void;
  visible?: boolean;
  onClose?: () => void;
  bedPlantNames?: string[];
}

export default function GildeSelector({ 
  gilden, 
  onSelect, 
  visible = true, 
  onClose,
  bedPlantNames = [],
}: GildeSelectorProps) {
  const [search, setSearch] = useState('');

  const { suggestions, regular } = useMemo(() => {
    if (!search && bedPlantNames.length > 0) {
      const suggested = getSuggestedGilden(gilden, bedPlantNames);
      return {
        suggestions: suggested,
        regular: [] as { gilde: Gilde; matchScore: number; matchingPlants: string[] }[],
      };
    }

    const filtered = gilden.filter(gilde =>
      gilde.name.toLowerCase().includes(search.toLowerCase()) ||
      gilde.concept.toLowerCase().includes(search.toLowerCase())
    );

    return { suggestions: [], regular: filtered };
  }, [gilden, search, bedPlantNames]);

  const handleSelect = (gilde: Gilde) => {
    onSelect(gilde);
    if (onClose) onClose();
  };

  return (
    <Modal visible={visible} animationType="none">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Gilde auswählen</Text>
          {onClose && (
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Schließen</Text>
            </TouchableOpacity>
          )}
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Gilde suchen..."
          placeholderTextColor={Colors2026.textMuted}
          value={search}
          onChangeText={setSearch}
        />

        <ScrollView style={styles.scrollContainer}>
          {suggestions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Vorschläge für dein Beet</Text>
              <Text style={styles.sectionSubtitle}>
                Basierend auf: {bedPlantNames.slice(0, 3).join(', ')}
                {bedPlantNames.length > 3 && '...'}
              </Text>
              {suggestions.map(({ gilde, matchScore, matchingPlants }) => (
                <TouchableOpacity 
                  key={gilde.id} 
                  onPress={() => handleSelect(gilde)}
                  style={styles.gildeItem}
                >
                  <GildeCard gilde={gilde} />
                  <View style={styles.matchBadge}>
                    <Text style={styles.matchText}>
                      {matchScore}% Match ({matchingPlants.length} Pflanzen)
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.section}>
            {suggestions.length > 0 && (
              <Text style={styles.sectionTitle}>Alle Gilden</Text>
            )}
            {(regular.length > 0 ? regular : gilden).map((item) => {
              const gilde = 'gilde' in item ? item.gilde : item;
              return (
                <TouchableOpacity 
                  key={gilde.id} 
                  onPress={() => handleSelect(gilde)}
                  style={styles.gildeItem}
                >
                  <GildeCard gilde={gilde} />
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors2026.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing2026.md,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: Colors2026.divider,
  },
  title: {
    ...Typography2026.title,
    color: Colors2026.text,
  },
  closeText: {
    ...Typography2026.body,
    color: Colors2026.primary,
  },
  searchInput: {
    margin: Spacing2026.md,
    padding: Spacing2026.sm,
    backgroundColor: Colors2026.surface,
    borderRadius: Radius2026.md,
    color: Colors2026.text,
    fontSize: 16,
  },
  separator: {
    height: Spacing2026.sm,
  },
  scrollContainer: {
    flex: 1,
  },
  section: {
    paddingHorizontal: Spacing2026.md,
    paddingBottom: Spacing2026.lg,
  },
  sectionTitle: {
    ...Typography2026.title,
    color: Colors2026.text,
    marginBottom: Spacing2026.xs,
  },
  sectionSubtitle: {
    ...Typography2026.caption,
    color: Colors2026.textMuted,
    marginBottom: Spacing2026.md,
  },
  gildeItem: {
    marginBottom: Spacing2026.sm,
  },
  matchBadge: {
    backgroundColor: Colors2026.primary + '20',
    paddingHorizontal: Spacing2026.sm,
    paddingVertical: Spacing2026.xs,
    borderRadius: Radius2026.sm,
    marginTop: -Spacing2026.sm,
    marginLeft: Spacing2026.md,
    alignSelf: 'flex-start',
  },
  matchText: {
    ...Typography2026.small,
    color: Colors2026.primary,
    fontWeight: '600',
  },
});
