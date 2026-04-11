import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors2026, Spacing2026, Radius2026, Typography2026 } from '../../theme/designSystemV2';

interface BulkActionBarProps {
  onSelectAll: () => void;
  onDeselectAll: () => void;
  count: number;
}

export default function BulkActionBar({ 
  onSelectAll, 
  onDeselectAll,
  count,
}: BulkActionBarProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onSelectAll}>
        <Text style={styles.buttonText}>Alle auswählen</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={onDeselectAll}>
        <Text style={styles.buttonText}>Alle abwählen</Text>
      </TouchableOpacity>
      <Text style={styles.count}>{count} ausgewählt</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing2026.sm,
    backgroundColor: Colors2026.surface,
    borderRadius: Radius2026.md,
    marginBottom: Spacing2026.md,
  },
  button: {
    paddingHorizontal: Spacing2026.md,
    paddingVertical: Spacing2026.xs,
    borderRadius: Radius2026.sm,
    borderWidth: 1,
    borderColor: Colors2026.primary,
  },
  buttonText: { ...Typography2026.caption, color: Colors2026.primary },
  count: { ...Typography2026.caption, color: Colors2026.textMuted },
});