import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors2026 } from '../../theme/designSystemV2';

export type QuickFilterType = 'overdue' | 'thisWeek' | 'thisMonth' | 'nextSteps';

interface Props {
  activeFilter: QuickFilterType | null;
  onFilterChange: (filter: QuickFilterType | null) => void;
  counts: {
    overdue: number;
    thisWeek: number;
    thisMonth: number;
    nextSteps: number;
  };
}

const FILTER_COLORS: Record<QuickFilterType, string> = {
  overdue: '#B33A3A',
  thisWeek: '#4A6FA5',
  thisMonth: '#006064',
  nextSteps: '#2D4739',
};

const FILTERS: { key: QuickFilterType; label: string; icon: string }[] = [
  { key: 'overdue', label: 'Überfällig', icon: 'warning' },
  { key: 'thisWeek', label: 'Diese Woche', icon: 'event' },
  { key: 'thisMonth', label: '30 Tage', icon: 'calendar-month' },
  { key: 'nextSteps', label: 'Wichtig', icon: 'star' },
];

export default function QuickFilterChips({ activeFilter, onFilterChange, counts }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.chipsContainer}>
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter.key;
          const count = counts[filter.key];
          const chipColor = FILTER_COLORS[filter.key];
          
          return (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.chip, 
                isActive && { backgroundColor: chipColor, borderColor: chipColor }
              ]}
              onPress={() => onFilterChange(isActive ? null : filter.key)}
            >
              <MaterialIcons 
                name={filter.icon as any} 
                size={16} 
                color={isActive ? '#fff' : chipColor} 
              />
              <Text style={[
                styles.chipText, 
                isActive && styles.chipTextActive
              ]}>
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
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    height: 40,
    borderRadius: 16,
    backgroundColor: Colors2026.surface,
    borderWidth: 1,
    borderColor: Colors2026.divider,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors2026.text,
  },
  chipTextActive: {
    color: '#fff',
  },
  badge: {
    backgroundColor: Colors2026.textMuted,
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
    color: Colors2026.text,
  },
});