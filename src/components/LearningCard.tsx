import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Learning } from '../types/learning';
import Colors from '../theme/colors';

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
          <MaterialIcons name="lightbulb" size={20} color={Colors.accent} />
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {learning.title}
        </Text>
        <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
          <MaterialIcons name="close" size={18} color={Colors.textLight} />
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
            >
              <MaterialIcons name="thumb-up" size={18} color={Colors.textLight} />
              <Text style={styles.ratingText}>Hilfreich</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.ratingButton} 
              onPress={() => onRate(false)}
            >
              <MaterialIcons name="thumb-down" size={18} color={Colors.textLight} />
              <Text style={styles.ratingText}>Nicht hilfreich</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.ratedContainer}>
            <MaterialIcons 
              name={learning.user_rating === 'helpful' ? 'thumb-up' : 'thumb-down'} 
              size={16} 
              color={learning.user_rating === 'helpful' ? Colors.success : Colors.textLight} 
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
    backgroundColor: Colors.surface,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
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
    color: Colors.text,
    fontWeight: '600',
    marginRight: 8,
  },
  dismissButton: {
    padding: 2,
  },
  content: {
    fontSize: 13,
    color: Colors.textLight,
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
    borderTopColor: Colors.divider,
  },
  ratingButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  ratingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  ratingText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  ratedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratedText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  source: {
    fontSize: 11,
    color: Colors.textLight,
  },
});