import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Learning } from '../types/learning';
import { Colors2026, Spacing2026, Radius2026, Typography2026, Shadows2026 } from '../theme/designSystemV2';

interface LearningCardProps {
  learning: Learning;
  onRate: (helpful: boolean) => void;
  onDismiss: () => void;
}

export default function LearningCard({ learning, onRate, onDismiss }: LearningCardProps) {
  const hasRated = learning.user_rating !== undefined;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="lightbulb" size={20} color={Colors2026.accent} />
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {learning.title}
        </Text>
        <TouchableOpacity 
          onPress={onDismiss} 
          style={styles.dismissButton}
          accessibilityLabel="Tipp verwerfen"
          accessibilityRole="button"
        >
          <MaterialIcons name="close" size={18} color={Colors2026.textSecondary} />
        </TouchableOpacity>
      </View>
      
      {learning.content && (
        <Text style={styles.content} numberOfLines={3}>
          {learning.content}
        </Text>
      )}
      
      <View style={styles.footer}>
        {!hasRated ? (
          <View style={styles.ratingButtons}>
            <TouchableOpacity 
              style={styles.ratingButton} 
              onPress={() => onRate(true)}
              accessibilityLabel="Als hilfreich bewerten"
              accessibilityRole="button"
            >
              <MaterialIcons name="thumb-up" size={18} color={Colors2026.textSecondary} />
              <Text style={styles.ratingText}>Hilfreich</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.ratingButton} 
              onPress={() => onRate(false)}
              accessibilityLabel="Als nicht hilfreich bewerten"
              accessibilityRole="button"
            >
              <MaterialIcons name="thumb-down" size={18} color={Colors2026.textSecondary} />
              <Text style={styles.ratingText}>Nicht hilfreich</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.ratedContainer}>
            <MaterialIcons 
              name={learning.user_rating === 'helpful' ? 'thumb-up' : 'thumb-down'} 
              size={16} 
              color={learning.user_rating === 'helpful' ? Colors2026.status.success : Colors2026.textSecondary} 
            />
            <Text style={styles.ratedText}>
              {learning.user_rating === 'helpful' ? 'Als hilfreich markiert' : 'Als nicht hilfreich markiert'}
            </Text>
          </View>
        )}
        
        {learning.source_name && (
          <Text style={styles.source}>
            {learning.source_type === 'knowledge_base' ? '📚' : '📝'} {learning.source_name}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: Colors2026.surface,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors2026.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: 10,
    marginTop: 2,
  },
  title: {
    flex: 1,
    fontSize: 14,
    color: Colors2026.text,
    fontWeight: '600',
    marginRight: 8,
  },
  dismissButton: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    fontSize: 13,
    color: Colors2026.textSecondary,
    marginTop: 8,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors2026.divider,
  },
  ratingButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  ratingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 10,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: Colors2026.textSecondary,
  },
  ratedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratedText: {
    fontSize: 12,
    color: Colors2026.textSecondary,
  },
  source: {
    fontSize: 11,
    color: Colors2026.textSecondary,
  },
});