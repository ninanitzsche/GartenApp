import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { Flower2, Sun, Leaf, Snowflake, Check } from 'lucide-react-native';
import { Colors2026 } from '../../theme/designSystemV2';

const SEASONS = ['Alle', 'Frühling', 'Sommer', 'Herbst', 'Winter'];

const SEASON_COLORS: Record<string, string> = {
  'Frühling': '#5A8F6B',
  'Sommer': '#E8A838',
  'Herbst': '#8D5B3E',
  'Winter': '#4A6FA5',
};

const SEASON_ICONS: Record<string, React.ComponentType<any>> = {
  'Frühling': Flower2,
  'Sommer': Sun,
  'Herbst': Leaf,
  'Winter': Snowflake,
};

interface Props {
  selectedSeason: string;
  onSeasonChange: (season: string) => void;
}

export default function SeasonFilterDropdown({ selectedSeason, onSeasonChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const seasonColor = SEASON_COLORS[selectedSeason] || Colors2026.primary;
  const SeasonIcon = SEASON_ICONS[selectedSeason];
  const isActive = selectedSeason !== 'Alle';

  return (
    <>
      <TouchableOpacity 
        style={[styles.dropdown, isActive && { backgroundColor: seasonColor, borderColor: seasonColor }]}
        onPress={() => setIsOpen(true)}
      >
        {SeasonIcon && <SeasonIcon size={18} color={isActive ? '#fff' : seasonColor} />}
        <Text style={[styles.dropdownText, isActive && styles.dropdownTextActive]}>
          {selectedSeason === 'Alle' ? 'Jahreszeit' : selectedSeason}
        </Text>
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
            {SEASONS.map((season) => {
              const IconComponent = SEASON_ICONS[season];
              return (
                <TouchableOpacity
                  key={season}
                  style={[styles.menuItem, selectedSeason === season && styles.menuItemActive]}
                  onPress={() => {
                    onSeasonChange(season);
                    setIsOpen(false);
                  }}
                >
                  <View style={styles.menuItemLeft}>
                    {IconComponent && <IconComponent size={20} color={selectedSeason === season ? '#fff' : Colors2026.text} style={styles.menuItemIcon} />}
                    <Text style={[styles.menuItemText, selectedSeason === season && styles.menuItemTextActive]}>
                      {season}
                    </Text>
                  </View>
                  {selectedSeason === season && (
                    <Check size={20} color="#fff" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
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
  dropdownActive: {
    backgroundColor: Colors2026.primary,
  },
  dropdownTextActive: {
    color: '#fff',
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
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    marginRight: 12,
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
  currentBadge: {
    fontSize: 10,
    color: Colors2026.status.success,
    marginRight: 8,
  },
});