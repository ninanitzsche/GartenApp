/**
 * Knowledge Service
 * Fetch and search knowledge articles from database
 * Read-only service for system articles
 */

import { supabase } from './supabase';
import {
  KnowledgeArticle,
  KnowledgeCategory,
  KnowledgeFilters,
  KnowledgeSearchResult,
} from '../types/knowledge';

/**
 * Fetch all knowledge articles (system articles only, user_id IS NULL)
 * Sorted by category, then by title
 */
export async function fetchArticles(filters?: KnowledgeFilters): Promise<KnowledgeArticle[]> {
  try {
    let query = supabase
      .from('knowledge_articles')
      .select('*')
      .is('user_id', null) // Only system articles
      .order('category', { ascending: true })
      .order('title', { ascending: true });

    // Apply category filter if provided
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []) as KnowledgeArticle[];
  } catch (error: any) {
    console.error('Error fetching articles:', error.message);
    throw new Error(`Error fetching articles: ${error.message}`);
  }
}

/**
 * Fetch single article by ID
 */
export async function fetchArticle(articleId: string): Promise<KnowledgeArticle | null> {
  try {
    const { data, error } = await supabase
      .from('knowledge_articles')
      .select('*')
      .eq('id', articleId)
      .is('user_id', null)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" which is expected when not found
      throw error;
    }

    return (data || null) as KnowledgeArticle | null;
  } catch (error: any) {
    console.error(`Error fetching article ${articleId}:`, error.message);
    throw new Error(`Error fetching article: ${error.message}`);
  }
}

/**
 * Search articles by title and content
 * Case-insensitive partial match
 */
export async function searchArticles(query: string): Promise<KnowledgeSearchResult[]> {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const searchTerm = `%${query.toLowerCase()}%`;

    // Use raw SQL for full-text search across title and content
    const { data, error } = await supabase
      .rpc('search_knowledge_articles', {
        search_term: searchTerm,
      });

    if (error) {
      // Fallback to simple filter if RPC fails
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('knowledge_articles')
        .select('*')
        .is('user_id', null)
        .or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`)
        .order('title', { ascending: true });

      if (fallbackError) throw fallbackError;

      return ((fallbackData || []) as KnowledgeArticle[]).map(addPreview);
    }

    return ((data || []) as KnowledgeArticle[]).map(addPreview);
  } catch (error: any) {
    console.error('Error searching articles:', error.message);
    throw new Error(`Error searching articles: ${error.message}`);
  }
}

/**
 * Get articles by category
 */
export async function getArticlesByCategory(
  category: KnowledgeCategory
): Promise<KnowledgeArticle[]> {
  try {
    const { data, error } = await supabase
      .from('knowledge_articles')
      .select('*')
      .eq('category', category)
      .is('user_id', null)
      .order('title', { ascending: true });

    if (error) throw error;

    return (data || []) as KnowledgeArticle[];
  } catch (error: any) {
    console.error(`Error fetching articles by category ${category}:`, error.message);
    throw new Error(`Error fetching articles: ${error.message}`);
  }
}

/**
 * Get articles by tag
 */
export async function getArticlesByTag(tag: string): Promise<KnowledgeArticle[]> {
  try {
    if (!tag || tag.trim().length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from('knowledge_articles')
      .select('*')
      .is('user_id', null)
      .contains('tags', [tag.toLowerCase()])
      .order('title', { ascending: true });

    if (error) throw error;

    return (data || []) as KnowledgeArticle[];
  } catch (error: any) {
    console.error(`Error fetching articles by tag ${tag}:`, error.message);
    return [];
  }
}

/**
 * Add preview to article (first 100 chars of content)
 */
function addPreview(article: KnowledgeArticle): KnowledgeSearchResult {
  return {
    ...article,
    preview: article.content.substring(0, 100) + (article.content.length > 100 ? '...' : ''),
  };
}

/**
 * Get category label in German
 */
export function getCategoryLabel(category: KnowledgeCategory): string {
  const labels: Record<KnowledgeCategory, string> = {
    pflege: 'Pflege',
    schädlinge: 'Schädlinge',
    pflanzen: 'Pflanzen',
    ernte: 'Ernte',
    boden: 'Boden',
    sonstiges: 'Sonstiges',
  };
  return labels[category] || 'Sonstiges';
}

/**
 * Get category color for UI display
 */
export function getCategoryColor(category: KnowledgeCategory): string {
  const colors: Record<KnowledgeCategory, string> = {
    pflege: '#4CAF50', // Green
    schädlinge: '#F44336', // Red
    pflanzen: '#2196F3', // Blue
    ernte: '#FF9800', // Orange
    boden: '#795548', // Brown
    sonstiges: '#9C27B0', // Purple
  };
  return colors[category] || '#757575';
}
