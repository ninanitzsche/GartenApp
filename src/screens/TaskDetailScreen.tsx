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
}

type RootStackParamList = {
  TaskDetail: { taskId: string };
  KnowledgeDetail: { articleId: string };
};

type Props = NativeStackScreenProps<RootStackParamList, 'TaskDetail'>;

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
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Task nicht gefunden</Text>
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
        <Text style={styles.icon}>{CATEGORY_ICONS[task.category] || '🔧'}</Text>
        <Text style={styles.title}>{task.title}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Aufgaben-Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Kategorie:</Text>
          <Text style={styles.value}>{task.category}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Priorität:</Text>
          <Text style={[styles.value, task.priority === 'hoch' && styles.highPriority]}>
            {task.priority === 'hoch' ? '🔴 HOCH' : '🟡 Mittel'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Zeitfenster:</Text>
          <Text style={styles.value}>{task.scheduled_date}</Text>
        </View>
        {task.description && (
          <View style={styles.descriptionBox}>
            <Text style={styles.description}>{task.description}</Text>
          </View>
        )}
      </View>

      {relatedArticles.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            📚 Verwandte Wissensbasis ({relatedArticles.length})
          </Text>
          <FlatList
            scrollEnabled={false}
            data={relatedArticles}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.articleCard}
                onPress={() =>
                  navigation.navigate('KnowledgeDetail', { articleId: item.id })
                }
                activeOpacity={0.7}
              >
                <View style={styles.articleHeader}>
                  <Text style={styles.articleTitle}>{item.title}</Text>
                  <Text style={styles.articleCategory}>→</Text>
                </View>
                <Text style={styles.articlePreview} numberOfLines={2}>
                  {item.content.substring(0, 100)}...
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {relatedArticles.length === 0 && (
        <View style={styles.section}>
          <Text style={styles.emptyText}>Keine verwandten Artikel gefunden</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  header: { paddingHorizontal: 16, paddingVertical: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  icon: { fontSize: 32, marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '700', color: '#333' },
  section: { backgroundColor: '#fff', marginHorizontal: 12, marginVertical: 12, paddingHorizontal: 16, paddingVertical: 16, borderRadius: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#333' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  label: { fontSize: 13, fontWeight: '600', color: '#666' },
  value: { fontSize: 13, color: '#333' },
  highPriority: { color: '#F44336', fontWeight: '600' },
  descriptionBox: { backgroundColor: '#f9f9f9', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 6, marginTop: 12, borderLeftWidth: 3, borderLeftColor: '#4CAF50' },
  description: { fontSize: 13, color: '#555', lineHeight: 18 },
  articleCard: { backgroundColor: '#f5f5f5', paddingHorizontal: 12, paddingVertical: 12, marginVertical: 6, borderRadius: 6, borderLeftWidth: 3, borderLeftColor: '#4CAF50' },
  articleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  articleTitle: { fontSize: 13, fontWeight: '600', color: '#333', flex: 1 },
  articleCategory: { fontSize: 11, color: '#999', marginLeft: 8 },
  articlePreview: { fontSize: 12, color: '#666', lineHeight: 16 },
  emptyText: { fontSize: 13, color: '#999', textAlign: 'center', paddingVertical: 20 },
  errorText: { fontSize: 14, color: '#D32F2F', textAlign: 'center', marginTop: 20 },
});

export default TaskDetailScreen;
