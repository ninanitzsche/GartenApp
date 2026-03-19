import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';

interface Task {
  id: string;
  title: string;
  category: string;
  priority: string;
  scheduled_date: string;
}

interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  related_task_ids: string[];
}

type RootStackParamList = {
  TaskDetail: { taskId: string };
  KnowledgeDetail: { articleId: string };
};

type Props = NativeStackScreenProps<RootStackParamList, 'KnowledgeDetail'>;

export const KnowledgeDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { articleId } = route.params;
  const { user } = useAuth();
  const [article, setArticle] = useState<KnowledgeArticle | null>(null);
  const [relatedTasks, setRelatedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticleDetails();
  }, [articleId, user?.id]);

  const loadArticleDetails = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      const { data: articleData, error: articleError } = await supabase
        .from('knowledge_articles')
        .select('*')
        .eq('id', articleId)
        .eq('user_id', user.id)
        .single();

      if (articleError) throw articleError;
      setArticle(articleData);

      if (articleData?.related_task_ids && articleData.related_task_ids.length > 0) {
        const { data: tasks, error: tasksError } = await supabase
          .from('tasks')
          .select('id, title, category, priority, scheduled_date')
          .in('id', articleData.related_task_ids);

        if (tasksError) throw tasksError;
        setRelatedTasks(tasks || []);
      }
    } catch (err) {
      console.error('Error loading article details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!article) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Artikel nicht gefunden</Text>
      </View>
    );
  }

  const CATEGORY_ICONS: { [key: string]: string } = {
    planting: '🌻',
    pruning: '✂️',
    watering: '💧',
    mulching: '🛡️',
    harvesting: '🌾',
    maintenance: '🔧',
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.categoryBadge}>{article.category}</Text>
        <Text style={styles.title}>{article.title}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.content}>{article.content}</Text>
      </View>

      {relatedTasks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            ✅ Zugehörige Aufgaben ({relatedTasks.length})
          </Text>
          <FlatList
            scrollEnabled={false}
            data={relatedTasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.taskCard}
                onPress={() =>
                  navigation.navigate('TaskDetail', { taskId: item.id })
                }
                activeOpacity={0.7}
              >
                <View style={styles.taskHeader}>
                  <Text style={styles.taskIcon}>
                    {CATEGORY_ICONS[item.category] || '🔧'}
                  </Text>
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text
                      style={[
                        styles.taskPriority,
                        item.priority === 'hoch' && styles.highPriority,
                      ]}
                    >
                      {item.priority === 'hoch' ? '🔴 HOCH' : '🟡 Mittel'}
                    </Text>
                  </View>
                  <Text style={styles.arrow}>→</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {relatedTasks.length === 0 && (
        <View style={styles.section}>
          <Text style={styles.emptyText}>Keine zugehörigen Aufgaben</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  header: { paddingHorizontal: 16, paddingVertical: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  categoryBadge: { fontSize: 11, fontWeight: '600', color: '#666', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: 20, fontWeight: '700', color: '#333' },
  section: { backgroundColor: '#fff', marginHorizontal: 12, marginVertical: 12, paddingHorizontal: 16, paddingVertical: 16, borderRadius: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#333' },
  content: { fontSize: 14, color: '#555', lineHeight: 22 },
  taskCard: { backgroundColor: '#f5f5f5', paddingHorizontal: 12, paddingVertical: 12, marginVertical: 6, borderRadius: 6, borderLeftWidth: 3, borderLeftColor: '#2196F3' },
  taskHeader: { flexDirection: 'row', alignItems: 'center' },
  taskIcon: { fontSize: 20, marginRight: 12 },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 4 },
  taskPriority: { fontSize: 11, fontWeight: '600', color: '#666' },
  highPriority: { color: '#D32F2F' },
  arrow: { fontSize: 16, color: '#999', marginLeft: 8 },
  emptyText: { fontSize: 13, color: '#999', textAlign: 'center', paddingVertical: 20 },
  errorText: { fontSize: 14, color: '#D32F2F', textAlign: 'center', marginTop: 20 },
});

export default KnowledgeDetailScreen;
