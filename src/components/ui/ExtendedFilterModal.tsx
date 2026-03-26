import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors2026, Spacing2026, Radius2026 } from '../../theme/designSystemV2';

interface FilterOptions {
  priorities: string[];
  categories: string[];
  plants: string[];
  timeframes: string[];
  status: string[];
}

interface Props {
  visible: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availablePlants: { id: string; name: string }[];
}

const PRIORITIES = ['hoch', 'mittel', 'niedrig'];
const CATEGORIES = ['Aussaat', 'Pflanzen', 'Gartenarbeiten', 'Beobachten', 'Ernten'];
const TIMEFRAMES = ['Diese Woche', 'Nächste Woche', 'Dieser Monat', 'Nächster Monat'];
const STATUS_OPTIONS = ['offen', 'erledigt'];

export default function ExtendedFilterModal({ visible, onClose, filters, onFiltersChange, availablePlants }: Props) {
  const toggleArray = (arr: string[], item: string) => 
    arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];

  const togglePriority = (p: string) => 
    onFiltersChange({ ...filters, priorities: toggleArray(filters.priorities, p) });

  const toggleCategory = (c: string) => 
    onFiltersChange({ ...filters, categories: toggleArray(filters.categories, c) });

  const togglePlant = (p: string) => 
    onFiltersChange({ ...filters, plants: toggleArray(filters.plants, p) });

  const toggleTimeframe = (t: string) => 
    onFiltersChange({ ...filters, timeframes: toggleArray(filters.timeframes, t) });

  const toggleStatus = (s: string) => 
    onFiltersChange({ ...filters, status: toggleArray(filters.status, s) });

  const clearFilters = () => {
    onFiltersChange({
      priorities: [],
      categories: [],
      plants: [],
      timeframes: [],
      status: [],
    });
  };

  const hasFilters = filters.priorities.length > 0 || filters.categories.length > 0 || 
    filters.plants.length > 0 || filters.timeframes.length > 0 || filters.status.length > 0;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Filter</Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={24} color={Colors2026.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Priorität</Text>
            <View style={styles.chips}>
              {PRIORITIES.map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.chip, filters.priorities.includes(p) && styles.chipActive]}
                  onPress={() => togglePriority(p)}
                >
                  <Text style={[styles.chipText, filters.priorities.includes(p) && styles.chipTextActive]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kategorie</Text>
            <View style={styles.chips}>
              {CATEGORIES.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.chip, filters.categories.includes(c) && styles.chipActive]}
                  onPress={() => toggleCategory(c)}
                >
                  <Text style={[styles.chipText, filters.categories.includes(c) && styles.chipTextActive]}>
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Zeitraum</Text>
            <View style={styles.chips}>
              {TIMEFRAMES.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, filters.timeframes.includes(t) && styles.chipActive]}
                  onPress={() => toggleTimeframe(t)}
                >
                  <Text style={[styles.chipText, filters.timeframes.includes(t) && styles.chipTextActive]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>
            <View style={styles.chips}>
              {STATUS_OPTIONS.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip, filters.status.includes(s) && styles.chipActive]}
                  onPress={() => toggleStatus(s)}
                >
                  <Text style={[styles.chipText, filters.status.includes(s) && styles.chipTextActive]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {availablePlants.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pflanzen</Text>
              <View style={styles.chips}>
                {availablePlants.slice(0, 10).map(p => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.chip, filters.plants.includes(p.id) && styles.chipActive]}
                    onPress={() => togglePlant(p.id)}
                  >
                    <Text style={[styles.chipText, filters.plants.includes(p.id) && styles.chipTextActive]}>
                      {p.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          {hasFilters && (
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Zurücksetzen</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.applyButton} onPress={onClose}>
            <Text style={styles.applyButtonText}>Anwenden</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors2026.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing2026.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors2026.divider,
  },
  title: { fontSize: 20, fontWeight: '700', color: Colors2026.text },
  content: { flex: 1, padding: Spacing2026.lg },
  section: { marginBottom: Spacing2026.xl },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: Colors2026.textSecondary, marginBottom: Spacing2026.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing2026.sm },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors2026.surface,
    borderWidth: 1,
    borderColor: Colors2026.divider,
  },
  chipActive: { backgroundColor: Colors2026.primary, borderColor: Colors2026.primary },
  chipText: { fontSize: 14, color: Colors2026.text },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    gap: Spacing2026.md,
    padding: Spacing2026.lg,
    borderTopWidth: 1,
    borderTopColor: Colors2026.divider,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Radius2026.md,
    borderWidth: 1,
    borderColor: Colors2026.divider,
    alignItems: 'center',
  },
  clearButtonText: { fontSize: 16, fontWeight: '600', color: Colors2026.textSecondary },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: Radius2026.md,
    backgroundColor: Colors2026.primary,
    alignItems: 'center',
  },
  applyButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});