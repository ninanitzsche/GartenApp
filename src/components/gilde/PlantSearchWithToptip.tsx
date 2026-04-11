import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Colors2026, Spacing2026, Radius2026, Typography2026 } from '../../theme/designSystemV2';

interface PlantSearchWithToptipProps {
  onSelectPlant: (plantName: string) => void;
  existingPlants?: string[];
}

export default function PlantSearchWithToptip({ 
  onSelectPlant, 
  existingPlants = [],
}: PlantSearchWithToptipProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>+ Weitere Pflanze hinzufügen</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Pflanze suchen..."
        placeholderTextColor={Colors2026.textMuted}
        // Placeholder - full implementation later
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: Spacing2026.md },
  label: { ...Typography2026.caption, color: Colors2026.textMuted, marginBottom: Spacing2026.sm },
  searchInput: {
    backgroundColor: Colors2026.surface,
    borderRadius: Radius2026.md,
    padding: Spacing2026.md,
    color: Colors2026.text,
    fontSize: 16,
  },
});