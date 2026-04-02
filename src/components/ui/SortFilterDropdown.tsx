import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors2026 } from '../../theme/designSystemV2';

const SORT_OPTIONS = [
  { value: 'priority', label: 'Nach Priorität' },
  { value: 'created_at', label: 'Nach Erstellungsdatum' },
  { value: 'category', label: 'Nach Kategorie' },
  { value: 'title', label: 'Nach Titel' },
  { value: 'month', label: 'Nach Monat' },
];

interface Props {
  selectedSort: string;
  onSortChange: (sort: string) => void;
}

export default function SortFilterDropdown({ selectedSort, onSortChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const currentLabel = SORT_OPTIONS.find(o => o.value === selectedSort)?.label || 'Sortieren';

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.dropdown}
        onPress={() => setIsOpen(true)}
      >
        <MaterialIcons name="sort" size={18} color={Colors2026.textMuted} />
        <Text style={styles.dropdownText}>{currentLabel}</Text>
        <MaterialIcons name="arrow-drop-down" size={20} color={Colors2026.textMuted} />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setIsOpen(false)}>
          <View style={styles.menu}>
            <Text style={styles.menuTitle}>Sortieren nach</Text>
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.menuItem, selectedSort === option.value && styles.menuItemActive]}
                onPress={() => {
                  onSortChange(option.value);
                  setIsOpen(false);
                }}
              >
                <Text style={[styles.menuItemText, selectedSort === option.value && styles.menuItemTextActive]}>
                  {option.label}
                </Text>
                {selectedSort === option.value && (
                  <MaterialIcons name="check" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    height: 40,
    borderRadius: 16,
    backgroundColor: Colors2026.surface,
    borderWidth: 1,
    borderColor: Colors2026.divider,
  },
  dropdownText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors2026.text,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    backgroundColor: Colors2026.surface,
    borderRadius: 16,
    padding: 16,
    width: '80%',
    maxWidth: 300,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors2026.text,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  menuItemActive: {
    backgroundColor: Colors2026.primary,
  },
  menuItemText: {
    fontSize: 14,
    color: Colors2026.text,
  },
  menuItemTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
});