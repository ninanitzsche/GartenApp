import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors2026 } from '../../theme/designSystemV2';

export type QuickFilterType = 'overdue' | 'thisWeek' | 'nextWeek' | 'nextSteps';

interface Props {
  activeFilter: QuickFilterType | null;
  onFilterChange: (filter: QuickFilterType | null) => void;
  counts: {
    overdue: number;
    thisWeek: number;
    nextWeek: number;
    nextSteps: number;
  };
}

const FILTERS: { key: QuickFilterType; label: string; icon: string }[] = [
  { key: 'overdue', label: 'Überfällig', icon: 'warning' },
  { key: 'thisWeek', label: 'Diese Woche', icon: 'event' },
  { key: 'nextWeek', label: 'Nächste Woche', icon: 'event-note' },
  { key: 'nextSteps', label: 'Next Steps', icon: 'star' },
];

export default function QuickFilterChips({ activeFilter, onFilterChange, counts }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.chipsContainer}>
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter.key;
          const count = counts[filter.key];
          
          return (
            <TouchableOpacity
              key={filter.key}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => onFilterChange(isActive ? null : filter.key)}
            >
              <MaterialIcons 
                name={filter.icon as any} 
                size={16} 
                color={isActive ? '#fff' : Colors2026.primary} 
              />
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {filter.label}
              </Text>
              {count > 0 && (
                <View style={[styles.badge, isActive && styles.badgeActive]}>
                  <Text style={[styles.badgeText, isActive && styles.badgeTextActive]}>
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors2026.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors2026.divider,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
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
  chipActive: {
    backgroundColor: Colors2026.primary,
    borderColor: Colors2026.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors2026.primary,
  },
  chipTextActive: {
    color: '#fff',
  },
  badge: {
    backgroundColor: Colors2026.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 2,
  },
  badgeActive: {
    backgroundColor: '#fff',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  badgeTextActive: {
    color: Colors2026.primary,
  },
});