/**
 * Shopping Item CRUD Service
 * Handles all database operations for shopping items
 */
import { supabase } from './supabase';
import { ShoppingItem, ShoppingItemFormData } from '../types/shopping_item';

export interface ShoppingItemFilters {
  searchQuery?: string;
  category?: string;
  priority?: string;
  purchased?: boolean;
}

/**
 * Fetch all shopping items for current user with optional filters
 */
export async function fetchShoppingItems(filters?: ShoppingItemFilters): Promise<ShoppingItem[]> {
  let query = supabase
    .from('shopping_items')
    .select('*');

  // Apply filters if provided
  if (filters?.searchQuery) {
    query = query.ilike('item_name', `%${filters.searchQuery}%`);
  }

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  if (filters?.priority) {
    query = query.eq('priority', filters.priority);
  }

  if (filters?.purchased !== undefined) {
    query = query.eq('purchased', filters.purchased);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching shopping items:', error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch single shopping item by ID
 */
export async function fetchShoppingItem(id: string): Promise<ShoppingItem | null> {
  const { data, error } = await supabase
    .from('shopping_items')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching shopping item:', error);
    throw error;
  }

  return data;
}

/**
 * Create a new shopping item
 */
export async function createShoppingItem(itemData: ShoppingItemFormData): Promise<ShoppingItem> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User must be logged in to create shopping items');
  }

  const { data, error } = await supabase
    .from('shopping_items')
    .insert([
      {
        ...itemData,
        user_id: user.id,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating shopping item:', error);
    throw error;
  }

  return data;
}

/**
 * Update an existing shopping item
 */
export async function updateShoppingItem(id: string, itemData: ShoppingItemFormData): Promise<ShoppingItem> {
  const { data, error } = await supabase
    .from('shopping_items')
    .update(itemData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating shopping item:', error);
    throw error;
  }

  return data;
}

/**
 * Delete a shopping item
 */
export async function deleteShoppingItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('shopping_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting shopping item:', error);
    throw error;
  }
}

/**
 * Mark shopping item as purchased with actual price
 */
export async function markAsPurchased(id: string, actualPrice?: number): Promise<ShoppingItem> {
  const updateData: any = {
    purchased: true,
    purchased_at: new Date().toISOString(),
  };

  if (actualPrice !== undefined) {
    updateData.actual_price = actualPrice;
  }

  const { data, error } = await supabase
    .from('shopping_items')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error marking item as purchased:', error);
    throw error;
  }

  return data;
}

/**
 * Mark shopping item as not purchased
 */
export async function markAsNotPurchased(id: string): Promise<ShoppingItem> {
  const { data, error } = await supabase
    .from('shopping_items')
    .update({
      purchased: false,
      purchased_at: null,
      actual_price: null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error marking item as not purchased:', error);
    throw error;
  }

  return data;
}
