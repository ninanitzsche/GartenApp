import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import {
  KnowledgeArticle,
  KNOWLEDGE_CATEGORIES,
  KnowledgeCategory,
} from '../types/knowledge';
import { Colors2026, Spacing2026, Radius2026, Typography2026, Shadows2026 } from '../theme/designSystemV2';
import Animated, { FadeInDown } from 'react-native-reanimated';
import GlassCard from '../components/ui/GlassCard';
import {
  fetchArticles,
  searchArticles,
  getArticlesByCategory,
  getCategoryLabel,
  getCategoryColor,
} from '../services/knowledgeService';

type Props = NativeStackScreenProps<RootStackParamList, 'KnowledgeBase'>;

export default function KnowledgeBaseScreen({ navigation }: Props) {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<KnowledgeCategory | null>(null);

  // Load articles on mount
  useEffect(() => {
    loadArticles();
  }, []);

  // Filter articles when search or category changes
  useEffect(() => {
    filterArticles();
  }, [articles, searchQuery, selectedCategory]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await fetchArticles();
      setArticles(data);
    } catch (error: any) {
      Alert.alert('Fehler', `Artikel konnten nicht geladen werden: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await loadArticles();
    } finally {
      setRefreshing(false);
    }
  };

  const filterArticles = async () => {
    try {
      let results = articles;

      // Filter by category
      if (selectedCategory) {
        results = results.filter((a) => a.category === selectedCategory);
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const searchResults = await searchArticles(searchQuery);
        results = results.filter((a) =>
          searchResults.some((sr) => sr.id === a.id)
        );
      }

      setFilteredArticles(results);
    } catch (error) {
      console.error('Error filtering articles:', error);
    }
  };

  const handleCategoryToggle = (category: KnowledgeCategory) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const renderArticleCard = ({ item }: { item: KnowledgeArticle }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ArticleDetail', { articleId: item.id })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.articleTitle}>{item.title}</Text>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: getCategoryColor(item.category) + '20' },
            ]}
          >
            <Text
              style={[
                styles.categoryBadgeText,
                { color: getCategoryColor(item.category) },
              ]}
            >
              {getCategoryLabel(item.category)}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.articlePreview} numberOfLines={3}>
        {item.content.substring(0, 100)}...
      </Text>

      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
          {item.tags.length > 3 && (
            <Text style={styles.moreTagsText}>+{item.tags.length - 3}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors2026.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color={Colors2026.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Artikel suchen..."
          placeholderTextColor={Colors2026.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialIcons name="close" size={20} color={Colors2026.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
      >
        {KNOWLEDGE_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipSelected,
            ]}
            onPress={() => handleCategoryToggle(category)}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === category && styles.categoryChipTextSelected,
              ]}
            >
              {getCategoryLabel(category)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Articles List */}
      <FlatList
        data={filteredArticles}
        keyExtractor={(item) => item.id}
        renderItem={renderArticleCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons
              name="sentiment-dissatisfied"
              size={48}
              color={Colors2026.textSecondary}
            />
            <Text style={styles.emptyStateText}>
              {searchQuery.length > 0 || selectedCategory
                ? 'Keine Artikel gefunden'
                : 'Keine Artikel verfügbar'}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery.length > 0
                ? 'Versuchen Sie eine andere Suchanfrage'
                : 'Laden Sie die Seite neu'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors2026.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors2026.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginHorizontal: 12,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: Colors2026.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 14,
    color: Colors2026.text,
  },
  categoryScroll: {
    borderBottomWidth: 1,
    borderBottomColor: Colors2026.border,
  },
  categoryContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  categoryChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors2026.border,
    backgroundColor: Colors2026.surface,
  },
  categoryChipSelected: {
    backgroundColor: Colors2026.primary,
    borderColor: Colors2026.primary,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors2026.text,
  },
  categoryChipTextSelected: {
    color: '#fff',
  },
  listContent: {
    padding: 12,
  },
  card: {
    backgroundColor: Colors2026.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors2026.border,
  },
  cardHeader: {
    marginBottom: 10,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  articleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors2026.text,
    flex: 1,
  },
  categoryBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  articlePreview: {
    fontSize: 12,
    color: Colors2026.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: Colors2026.background,
    borderWidth: 1,
    borderColor: Colors2026.border,
  },
  tagText: {
    fontSize: 10,
    color: Colors2026.primary,
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 10,
    color: Colors2026.textSecondary,
    alignSelf: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors2026.text,
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: Colors2026.textSecondary,
    marginTop: 6,
  },
});
