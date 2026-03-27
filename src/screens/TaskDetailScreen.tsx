import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { Colors2026, Spacing2026, Radius2026, Typography2026, Shadows2026 } from '../theme/designSystemV2';
import GlassCard from '../components/ui/GlassCard';
import { TasksStackParamList } from '../types/navigation';

interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  content: string;
}

interface Task {
  id: string;
  title: string;
  category: string;
  priority: string;
  scheduled_date: string;
  description: string;
  knowledge_article_ids: string[];
  completed?: boolean;
}

type Props = NativeStackScreenProps<TasksStackParamList, 'TaskDetail'>;

const CATEGORY_CONFIG: Record<string, { icon: any; color: string }> = {
  planting: { icon: 'grass', color: Colors2026.primary },
  pruning: { icon: 'content-cut', color: Colors2026.accent },
  watering: { icon: 'water-drop', color: '#4A6FA5' },
  mulching: { icon: 'layers', color: Colors2026.status.warning },
  harvesting: { icon: 'agriculture', color: Colors2026.status.success },
  maintenance: { icon: 'build', color: Colors2026.textSecondary },
};

export const TaskDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { taskId } = route.params;
  const { user } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTaskDetails();
  }, [taskId, user?.id]);

  const loadTaskDetails = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .eq('user_id', user.id)
        .single();

      if (taskError) throw taskError;
      setTask(taskData);

      if (taskData?.knowledge_article_ids && taskData.knowledge_article_ids.length > 0) {
        const { data: articles, error: articlesError } = await supabase
          .from('knowledge_articles')
          .select('id, title, category, content')
          .in('id', taskData.knowledge_article_ids);

        if (articlesError) throw articlesError;
        setRelatedArticles(articles || []);
      }
    } catch (err) {
      console.error('Error loading task details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors2026.primary} />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={48} color={Colors2026.status.error} />
        <Text style={styles.errorText}>Aufgabe nicht gefunden</Text>
      </View>
    );
  }

  const categoryConfig = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.maintenance;
  const priorityColor = Colors2026.priority[task.priority as keyof typeof Colors2026.priority] || Colors2026.textSecondary;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View 
        style={styles.heroSection}
        entering={FadeInDown.duration(400).delay(100)}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${categoryConfig.color}15` }]}>
          <MaterialIcons name={categoryConfig.icon} size={40} color={categoryConfig.color} />
        </View>
        <Text style={styles.title}>{task.title}</Text>
        <View style={styles.metaRow}>
          <View style={[styles.priorityBadge, { backgroundColor: `${priorityColor}15` }]}>
            <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
            <Text style={[styles.priorityText, { color: priorityColor }]}>
              {task.priority === 'hoch' ? 'Hoch' : task.priority === 'mittel' ? 'Mittel' : 'Niedrig'}
            </Text>
          </View>
          <View style={styles.categoryBadge}>
            <MaterialIcons name="folder" size={14} color={Colors2026.textSecondary} />
            <Text style={styles.categoryText}>{task.category}</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(400).delay(200)}>
        <GlassCard style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>
            <MaterialIcons name="assignment" size={18} color={Colors2026.primary} /> Aufgaben-Details
          </Text>
          
          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <MaterialIcons name="event" size={20} color={Colors2026.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Geplant für</Text>
              <Text style={styles.detailValue}>{task.scheduled_date || 'Kein Datum'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <MaterialIcons name={categoryConfig.icon} size={20} color={categoryConfig.color} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Kategorie</Text>
              <Text style={styles.detailValue}>{task.category}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <MaterialIcons name="flag" size={20} color={priorityColor} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Priorität</Text>
              <Text style={[styles.detailValue, { color: priorityColor }]}>
                {task.priority === 'hoch' ? 'Hoch' : task.priority === 'mittel' ? 'Mittel' : 'Niedrig'}
              </Text>
            </View>
          </View>

          {task.description && (
            <>
              <View style={styles.divider} />
              <View style={styles.descriptionSection}>
                <View style={styles.descriptionIcon}>
                  <MaterialIcons name="notes" size={20} color={Colors2026.primary} />
                </View>
                <View style={styles.descriptionContent}>
                  <Text style={styles.descriptionLabel}>Beschreibung</Text>
                  <View style={styles.descriptionBox}>
                    <Text style={styles.descriptionText}>{task.description}</Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </GlassCard>
      </Animated.View>

      {relatedArticles.length > 0 && (
        <Animated.View entering={FadeInDown.duration(400).delay(300)}>
          <GlassCard style={styles.articlesCard}>
            <Text style={styles.sectionTitle}>
              <MaterialIcons name="menu-book" size={18} color={Colors2026.primary} /> Verwandte Wissensbasis ({relatedArticles.length})
            </Text>
            
            <View style={styles.articlesList}>
              {relatedArticles.map((article, index) => (
                <Pressable
                  key={article.id}
                  style={[
                    styles.articleItem,
                    index === relatedArticles.length - 1 && styles.articleItemLast,
                  ]}
                  onPress={() => navigation.navigate('ArticleDetail', { articleId: article.id })}
                >
                  <View style={styles.articleContent}>
                    <Text style={styles.articleTitle}>{article.title}</Text>
                    <Text style={styles.articlePreview} numberOfLines={2}>
                      {article.content.substring(0, 80)}...
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color={Colors2026.textMuted} />
                </Pressable>
              ))}
            </View>
          </GlassCard>
        </Animated.View>
      )}

      {relatedArticles.length === 0 && (
        <Animated.View style={styles.emptyState} entering={FadeInDown.duration(400).delay(300)}>
          <GlassCard style={styles.emptyCard}>
            <MaterialIcons name="info-outline" size={32} color={Colors2026.textMuted} />
            <Text style={styles.emptyText}>Keine verwandten Artikel vorhanden</Text>
          </GlassCard>
        </Animated.View>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors2026.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors2026.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors2026.background,
    gap: Spacing2026.md,
  },
  errorText: {
    ...Typography2026.body,
    color: Colors2026.status.error,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: Spacing2026.xxl,
    paddingHorizontal: Spacing2026.lg,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: Radius2026.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing2026.lg,
    ...Shadows2026.md,
  },
  title: {
    ...Typography2026.display,
    color: Colors2026.text,
    textAlign: 'center',
    marginBottom: Spacing2026.md,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing2026.sm,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing2026.xs,
    paddingHorizontal: Spacing2026.md,
    borderRadius: Radius2026.round,
    gap: Spacing2026.xs,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    ...Typography2026.caption,
    fontWeight: '600',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing2026.xs,
    paddingHorizontal: Spacing2026.md,
    borderRadius: Radius2026.round,
    backgroundColor: Colors2026.glass.medium,
    gap: Spacing2026.xs,
  },
  categoryText: {
    ...Typography2026.caption,
    color: Colors2026.textSecondary,
  },
  detailsCard: {
    marginHorizontal: Spacing2026.lg,
    padding: Spacing2026.lg,
  },
  sectionTitle: {
    ...Typography2026.title,
    color: Colors2026.text,
    marginBottom: Spacing2026.lg,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing2026.sm,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius2026.md,
    backgroundColor: Colors2026.glass.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing2026.md,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    ...Typography2026.small,
    color: Colors2026.textMuted,
    marginBottom: 2,
  },
  detailValue: {
    ...Typography2026.body,
    fontWeight: '500',
    color: Colors2026.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors2026.divider,
    marginVertical: Spacing2026.sm,
  },
  descriptionSection: {
    flexDirection: 'row',
    paddingTop: Spacing2026.sm,
  },
  descriptionIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius2026.md,
    backgroundColor: Colors2026.glass.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing2026.md,
  },
  descriptionContent: {
    flex: 1,
  },
  descriptionLabel: {
    ...Typography2026.small,
    color: Colors2026.textMuted,
    marginBottom: Spacing2026.xs,
  },
  descriptionBox: {
    backgroundColor: Colors2026.glass.tint,
    borderRadius: Radius2026.md,
    padding: Spacing2026.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors2026.primary,
  },
  descriptionText: {
    ...Typography2026.body,
    color: Colors2026.text,
    lineHeight: 24,
  },
  articlesCard: {
    marginHorizontal: Spacing2026.lg,
    marginTop: Spacing2026.lg,
    padding: Spacing2026.lg,
  },
  articlesList: {
    gap: Spacing2026.sm,
  },
  articleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing2026.md,
    paddingHorizontal: Spacing2026.md,
    backgroundColor: Colors2026.glass.light,
    borderRadius: Radius2026.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors2026.primary,
  },
  articleItemLast: {
    borderBottomWidth: 0,
  },
  articleContent: {
    flex: 1,
  },
  articleTitle: {
    ...Typography2026.body,
    fontWeight: '600',
    color: Colors2026.text,
    marginBottom: 4,
  },
  articlePreview: {
    ...Typography2026.small,
    color: Colors2026.textSecondary,
    lineHeight: 18,
  },
  emptyState: {
    marginHorizontal: Spacing2026.lg,
    marginTop: Spacing2026.lg,
  },
  emptyCard: {
    padding: Spacing2026.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography2026.body,
    color: Colors2026.textMuted,
    marginTop: Spacing2026.sm,
  },
  bottomSpacer: {
    height: Spacing2026.xxxl,
  },
});

export default TaskDetailScreen;
