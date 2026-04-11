import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors2026, Spacing2026, Radius2026, Typography2026 } from '../../theme/designSystemV2';
import { MaterialIcons } from '@expo/vector-icons';

interface CompanionSuggestionProps {
  mainPlant: string;
  suggestions: { name: string; benefit: string }[];
  onSelect: (plantName: string) => void;
}

export default function CompanionSuggestion({ 
  mainPlant, 
  suggestions,
  onSelect,
}: CompanionSuggestionProps) {
  if (suggestions.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💡 Passend für {mainPlant}:</Text>
      <View style={styles.chips}>
        {suggestions.map(s => (
          <TouchableOpacity
            key={s.name}
            style={styles.chip}
            onPress={() => onSelect(s.name)}
          >
            <Text style={styles.chipName}>● {s.name}</Text>
            <Text style={styles.chipBenefit}>{s.benefit}</Text>
            <MaterialIcons name="add" size={16} color={Colors2026.primary} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: Spacing2026.md },
  title: { ...Typography2026.caption, color: Colors2026.textMuted, marginBottom: Spacing2026.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing2026.sm },
  chip: { 
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: Colors2026.surface,
    padding: Spacing2026.sm,
    borderRadius: Radius2026.md,
    gap: Spacing2026.xs,
  },
  chipName: { ...Typography2026.body, color: Colors2026.text },
  chipBenefit: { ...Typography2026.caption, color: Colors2026.status.success },
});