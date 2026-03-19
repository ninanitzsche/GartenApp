/**
 * Task Suggestion Modal Component
 * Bottom sheet modal for displaying and accepting task suggestions
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../theme/colors';
import { TaskSuggestion } from '../types/taskSuggestion';
import { acceptSuggestion } from '../services/taskSuggestionService';
import { getCategoryColor } from '../services/taskService';

interface TaskSuggestionModalProps {
  visible: boolean;
  suggestions: TaskSuggestion[];
  plantName?: string;
  linkedPlantId?: string;
  onClose: () => void;
  onTaskCreated?: () => void;
}

export default function TaskSuggestionModal({
  visible,
  suggestions,
  plantName,
  linkedPlantId,
  onClose,
  onTaskCreated,
}: TaskSuggestionModalProps) {
  const [loadingTaskId, setLoadingTaskId] = useState<number | null>(null);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  const handleAccept = async (suggestion: TaskSuggestion, index: number) => {
    setLoadingTaskId(index);
    try {
      await acceptSuggestion(suggestion, linkedPlantId);
      setAcceptedCount(prev => prev + 1);
      if (onTaskCreated) {
        onTaskCreated();
      }
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setLoadingTaskId(null);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    onClose();
  };

  const handleClose = () => {
    setAcceptedCount(0);
    setDismissed(false);
    onClose();
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'hoch':
        return 'priority-high';
      case 'mittel':
        return 'remove';
      case 'niedrig':
        return 'arrow-downward';
      default:
        return 'remove';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'hoch':
        return Colors.error;
      case 'mittel':
        return Colors.warning;
      case 'niedrig':
        return Colors.textLight;
      default:
        return Colors.textLight;
    }
  };

  const renderSuggestionCard = (suggestion: TaskSuggestion, index: number) => {
    const isLoading = loadingTaskId === index;

    return (
      <View style={styles.suggestionCard} key={`suggestion-${index}`}>
        <View style={styles.cardHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(suggestion.category) }]}>
            <Text style={styles.categoryText}>{suggestion.category}</Text>
          </View>
          <View style={styles.priorityContainer}>
            <MaterialIcons
              name={getPriorityIcon(suggestion.priority)}
              size={16}
              color={getPriorityColor(suggestion.priority)}
            />
            <Text style={[styles.priorityText, { color: getPriorityColor(suggestion.priority) }]}>
              {suggestion.priority === 'hoch' ? 'Hoch' : suggestion.priority === 'mittel' ? 'Mittel' : 'Niedrig'}
            </Text>
          </View>
        </View>

        <Text style={styles.taskTitle}>{suggestion.title}</Text>
        {suggestion.reason && (
          <Text style={styles.reasonText}>{suggestion.reason}</Text>
        )}

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.dismissButton]}
            onPress={() => {}}
          >
            <MaterialIcons name="close" size={18} color={Colors.textLight} />
            <Text style={styles.dismissText}>Überspringen</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handleAccept(suggestion, index)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={Colors.surface} />
            ) : (
              <>
                <MaterialIcons name="add" size={18} color={Colors.surface} />
                <Text style={styles.acceptText}>Hinzufügen</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (dismissed && acceptedCount > 0) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleDismiss}>
              <MaterialIcons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.titleSection}>
            <MaterialIcons name="lightbulb" size={32} color={Colors.primary} />
            <Text style={styles.title}>Aufgaben-Vorschläge</Text>
            {plantName && (
              <Text style={styles.subtitle}>
                Für: {plantName}
              </Text>
            )}
            <Text style={styles.hint}>
              Basierend auf Pflanzenart und Jahreszeit
            </Text>
          </View>

          <ScrollView
            style={styles.suggestionList}
            showsVerticalScrollIndicator={false}
          >
            {suggestions.map((suggestion, index) => renderSuggestionCard(suggestion, index))}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.dismissAllButton}
              onPress={handleDismiss}
            >
              <Text style={styles.dismissAllText}>
                {acceptedCount > 0 ? `Fertig (${acceptedCount} Aufgabe${acceptedCount > 1 ? 'n' : ''} hinzugefügt)` : 'Alle überspringen'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
  },
  titleSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  suggestionList: {
    paddingHorizontal: 24,
  },
  suggestionCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 12,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  dismissButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  acceptButton: {
    backgroundColor: Colors.primary,
  },
  dismissText: {
    color: Colors.textLight,
    fontSize: 14,
    fontWeight: '500',
  },
  acceptText: {
    color: Colors.surface,
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 8,
  },
  dismissAllButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dismissAllText: {
    color: Colors.textLight,
    fontSize: 14,
    fontWeight: '500',
  },
});
