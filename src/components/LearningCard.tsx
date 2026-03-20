import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Learning } from '../types/learning';
import Colors from '../theme/colors';

interface LearningCardProps {
  learning: Learning;
  onRate: (helpful: boolean) => void;
  onDismiss: () => void;
}

const categoryIcons: Record<string, string> = {
  pflege: 'spa',
  ernte: 'agriculture',
  schädlinge: 'bug-report',
  bewässerung: 'water-drop',
  düngung: 'compost',
  allgemein: 'lightbulb',
};

const categoryLabels: Record<string, string> = {
  pflege: 'Pflege',
  ernte: 'Ernte',
  schädlinge: 'Schädlinge',
  bewässerung: 'Bewässerung',
  düngung: 'Düngung',
  allgemein: 'Allgemein',
};

export default function LearningCard({
  learning,
  onRate,
  onDismiss,
}: LearningCardProps) {
  const icon = categoryIcons[learning.category] || 'lightbulb';
  const categoryLabel = categoryLabels[learning.category] || learning.category;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.categoryBadge}>
          <MaterialIcons name={icon as any} size={14} color={Colors.primary} />
          <Text style={styles.categoryText}>{categoryLabel}</Text>
        </View>
        <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialIcons name="close" size={20} color={Colors.textLight} />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>{learning.title}</Text>
      <Text style={styles.content} numberOfLines={3}>
        {learning.content}
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onRate(false)}
        >
          <MaterialIcons name="thumb-down" size={18} color={Colors.textLight} />
          <Text style={styles.actionText}>Nicht hilfreich</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.helpfulButton]}
          onPress={() => onRate(true)}
        >
          <MaterialIcons name="thumb-up" size={18} color={Colors.success} />
          <Text style={[styles.actionText, styles.helpfulText]}>Hilfreich</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  categoryText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  content: {
    fontSize: 13,
    color: Colors.textLight,
    lineHeight: 18,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: Colors.background,
  },
  helpfulButton: {
    backgroundColor: Colors.success + '15',
  },
  actionText: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '500',
  },
  helpfulText: {
    color: Colors.success,
  },
});
