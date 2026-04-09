import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Modal } from 'react-native';
import { Colors2026, Spacing2026, Radius2026, Typography2026 } from '../../theme/designSystemV2';
import { Gilde } from '../../types/gilde';
import GildeCard from './GildeCard';

interface GildeSelectorProps {
  gilden: Gilde[];
  onSelect: (gilde: Gilde) => void;
  visible?: boolean;
  onClose?: () => void;
}

export default function GildeSelector({ gilden, onSelect, visible = true, onClose }: GildeSelectorProps) {
  const [search, setSearch] = useState('');

  const filteredGilden = gilden.filter(gilde =>
    gilde.name.toLowerCase().includes(search.toLowerCase()) ||
    gilde.concept.toLowerCase().includes(search.toLowerCase())
  );

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

        <View style={styles.listContainer}>
          {filteredGilden.map((gilde) => (
            <TouchableOpacity 
              key={gilde.id} 
              onPress={() => handleSelect(gilde)} 
              style={styles.gildeItem}
            >
              <GildeCard gilde={gilde} />
            </TouchableOpacity>
          ))}
        </View>
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
    ...Typography2026.h3,
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
  gildeItem: {
    marginHorizontal: Spacing2026.md,
  },
  separator: {
    height: Spacing2026.sm,
  },
  listContent: {
    paddingBottom: Spacing2026.xl,
  },
  listContainer: {
    flex: 1,
  },
});
