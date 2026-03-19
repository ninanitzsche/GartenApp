import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { KnowledgeArticle } from '../types/knowledge';
import Colors from '../theme/colors';
import { fetchArticle, getCategoryLabel, getCategoryColor } from '../services/knowledgeService';

type Props = NativeStackScreenProps<RootStackParamList, 'ArticleDetail'>;
type RouteProps = RouteProp<RootStackParamList, 'ArticleDetail'>;

export default function ArticleDetailScreen({ navigation }: Props) {
  const route = useRoute<RouteProps>();
  const { articleId } = route.params;

  const [article, setArticle] = useState<KnowledgeArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticle();
  }, [articleId]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const data = await fetchArticle(articleId);
      if (!data) {
        Alert.alert('Fehler', 'Artikel nicht gefunden');
        navigation.goBack();
        return;
      }
      setArticle(data);
    } catch (error: any) {
      Alert.alert('Fehler', `Artikel konnte nicht geladen werden: ${error.message}`);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Article Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{article.title}</Text>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: getCategoryColor(article.category) + '20' },
            ]}
          >
            <Text
              style={[
                styles.categoryBadgeText,
                { color: getCategoryColor(article.category) },
              ]}
            >
              {getCategoryLabel(article.category)}
            </Text>
          </View>
        </View>

        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <MaterialIcons name="calendar-today" size={16} color={Colors.textLight} />
            <Text style={styles.metaText}>{formatDate(article.created_at)}</Text>
          </View>
        </View>
      </View>

      {/* Article Content */}
      <View style={styles.contentSection}>
        <Text style={styles.contentText}>{article.content}</Text>
      </View>

      {/* Tags Section */}
      {article.tags && article.tags.length > 0 && (
        <View style={styles.tagsSection}>
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.tagsContainer}>
            {article.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Spacer */}
      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
  },
  categoryBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metaContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  contentSection: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  contentText: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.text,
  },
  tagsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  tagText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    marginTop: 20,
  },
  spacer: {
    height: 20,
  },
});
