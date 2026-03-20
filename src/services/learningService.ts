/**
 * Learning Service
 * Handles all database operations for learnings
 */
import { supabase } from './supabase';
import { Learning, LearningFormData, LearningRating } from '../types/learning';
import { Zeitraum } from '../types/zeitraum';

/**
 * Fetch learnings for the current season/zeitraum
 * Returns learnings that are relevant for the given zeitraum and plants
 */
export async function fetchLearningsForSeason(
  plantNames: string[],
  zeitraum: Zeitraum
): Promise<Learning[]> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('learnings')
      .select('*')
      .eq('user_id', user.id)
      .eq('dismissed', false)
      .or(`valid_for_zeitraeume@>.{${zeitraum}},valid_for_zeitraeume@>.{flexibel}`)
      .order('relevance_score', { ascending: false })
      .limit(10);

    if (error) throw error;
    return (data || []) as Learning[];
  } catch (error: any) {
    throw new Error(`Error fetching learnings for season: ${error.message}`);
  }
}

/**
 * Fetch all learnings for current user
 */
export async function fetchLearnings(): Promise<Learning[]> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('learnings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Learning[];
  } catch (error: any) {
    throw new Error(`Error fetching learnings: ${error.message}`);
  }
}

/**
 * Fetch single learning by ID
 */
export async function fetchLearning(learningId: string): Promise<Learning | null> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('learnings')
      .select('*')
      .eq('id', learningId)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return data as Learning;
  } catch (error: any) {
    throw new Error(`Error fetching learning: ${error.message}`);
  }
}

/**
 * Create new learning
 */
export async function createLearning(formData: LearningFormData): Promise<Learning> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('User not authenticated');

    if (!formData.title || formData.title.trim().length === 0) {
      throw new Error('Learning title is required');
    }

    if (!formData.content || formData.content.trim().length === 0) {
      throw new Error('Learning content is required');
    }

    const { data, error } = await supabase
      .from('learnings')
      .insert({
        user_id: user.id,
        title: formData.title.trim(),
        content: formData.content.trim(),
        related_plants: formData.related_plants || [],
        valid_for_zeitraeume: formData.valid_for_zeitraeume || [],
        flexible: formData.flexible ?? false,
        dismissed: false,
        relevance_score: formData.relevance_score ?? 0,
        user_rating: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select();

    if (error) throw error;
    if (!data || data.length === 0) throw new Error('Failed to create learning');

    return data[0] as Learning;
  } catch (error: any) {
    throw new Error(`Error creating learning: ${error.message}`);
  }
}

/**
 * Update existing learning
 */
export async function updateLearning(
  learningId: string,
  formData: Partial<LearningFormData>
): Promise<Learning> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('User not authenticated');

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (formData.title !== undefined) {
      if (formData.title.trim().length === 0) {
        throw new Error('Learning title is required');
      }
      updateData.title = formData.title.trim();
    }

    if (formData.content !== undefined) {
      if (formData.content.trim().length === 0) {
        throw new Error('Learning content is required');
      }
      updateData.content = formData.content.trim();
    }

    if (formData.related_plants !== undefined) {
      updateData.related_plants = formData.related_plants;
    }

    if (formData.valid_for_zeitraeume !== undefined) {
      updateData.valid_for_zeitraeume = formData.valid_for_zeitraeume;
    }

    if (formData.flexible !== undefined) {
      updateData.flexible = formData.flexible;
    }

    if (formData.relevance_score !== undefined) {
      updateData.relevance_score = formData.relevance_score;
    }

    const { data, error } = await supabase
      .from('learnings')
      .update(updateData)
      .eq('id', learningId)
      .eq('user_id', user.id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) throw new Error('Failed to update learning');

    return data[0] as Learning;
  } catch (error: any) {
    throw new Error(`Error updating learning: ${error.message}`);
  }
}

/**
 * Rate a learning (helpful or not helpful)
 */
export async function rateLearning(
  learningId: string,
  rating: LearningRating
): Promise<Learning> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('learnings')
      .update({
        user_rating: rating,
        updated_at: new Date().toISOString(),
      })
      .eq('id', learningId)
      .eq('user_id', user.id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) throw new Error('Failed to rate learning');

    return data[0] as Learning;
  } catch (error: any) {
    throw new Error(`Error rating learning: ${error.message}`);
  }
}

/**
 * Dismiss a learning (hide from suggestions)
 */
export async function dismissLearning(learningId: string): Promise<Learning> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('learnings')
      .update({
        dismissed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', learningId)
      .eq('user_id', user.id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) throw new Error('Failed to dismiss learning');

    return data[0] as Learning;
  } catch (error: any) {
    throw new Error(`Error dismissing learning: ${error.message}`);
  }
}

/**
 * Delete a learning
 */
export async function deleteLearning(learningId: string): Promise<void> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('User not authenticated');

    const { error: deleteError } = await supabase
      .from('learnings')
      .delete()
      .eq('id', learningId)
      .eq('user_id', user.id);

    if (deleteError) throw deleteError;
  } catch (error: any) {
    throw new Error(`Error deleting learning: ${error.message}`);
  }
}

/**
 * Fetch learnings for a specific plant
 */
export async function fetchLearningsForPlant(plantId: string): Promise<Learning[]> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('learnings')
      .select('*')
      .eq('user_id', user.id)
      .contains('related_plants', [plantId])
      .eq('dismissed', false)
      .order('relevance_score', { ascending: false });

    if (error) throw error;
    return (data || []) as Learning[];
  } catch (error: any) {
    throw new Error(`Error fetching learnings for plant: ${error.message}`);
  }
}

export const learningService = {
  fetchLearningsForSeason,
  fetchLearnings,
  fetchLearning,
  createLearning,
  updateLearning,
  rateLearning,
  dismissLearning,
  deleteLearning,
  fetchLearningsForPlant,
};
