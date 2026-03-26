import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors2026 } from '../../theme/designSystemV2';
import { getCurrentSeason } from '../../services/taskService';

const SEASONS = ['Alle', 'Frühling', 'Sommer', 'Herbst', 'Winter'];

interface Props {
  selectedSeason: string;
  onSeasonChange: (season: string) => void;
}

export default function SeasonFilterDropdown({ selectedSeason, onSeasonChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const defaultSeason = getCurrentSeason();

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.dropdown}
        onPress={() => setIsOpen(true)}
      >
        <MaterialIcons name="filter-list" size={18} color={Colors2026.primary} />
        <Text style={styles.dropdownText}>
          {selectedSeason === 'Alle' ? 'Jahreszeit' : selectedSeason}
        </Text>
        <MaterialIcons name="arrow-drop-down" size={20} color={Colors2026.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setIsOpen(false)}>
          <View style={styles.menu}>
            <Text style={styles.menuTitle}>Jahreszeit</Text>
            {SEASONS.map((season) => (
              <TouchableOpacity
                key={season}
                style={[styles.menuItem, selectedSeason === season && styles.menuItemActive]}
                onPress={() => {
                  onSeasonChange(season);
                  setIsOpen(false);
                }}
              >
                <Text style={[styles.menuItemText, selectedSeason === season && styles.menuItemTextActive]}>
                  {season}
                </Text>
                {season === defaultSeason && (
                  <Text style={styles.currentBadge}>Aktuell</Text>
                )}
                {selectedSeason === season && (
                  <MaterialIcons name="check" size={20} color={Colors2026.primary} />
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
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors2026.primaryLight,
    borderWidth: 1,
    borderColor: Colors2026.primary,
  },
  dropdownText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors2026.primary,
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
    backgroundColor: Colors2026.primaryLight,
  },
  menuItemText: {
    fontSize: 14,
    color: Colors2026.text,
  },
  menuItemTextActive: {
    color: Colors2026.primary,
    fontWeight: '600',
  },
  currentBadge: {
    fontSize: 10,
    color: Colors2026.status.success,
    marginRight: 8,
  },
});