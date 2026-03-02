/**
 * Shopping Item type definition matching Supabase schema
 */
export interface ShoppingItem {
  id: string;
  item_name: string;
  category?: string;
  quantity?: string;
  priority?: string;
  estimated_price?: number;
  actual_price?: number;
  purchased: boolean;
  purchased_at?: string;
  where_to_buy?: string;
  link?: string;
  notes?: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface ShoppingItemFormData {
  item_name: string;
  category?: string;
  quantity?: string;
  priority?: string;
  estimated_price?: number;
  actual_price?: number;
  purchased?: boolean;
  purchased_at?: string;
  where_to_buy?: string;
  link?: string;
  notes?: string;
}

export const SHOPPING_CATEGORIES = [
  { label: 'Saatgut', value: 'saatgut' },
  { label: 'Werkzeug', value: 'werkzeug' },
  { label: 'Dünger', value: 'dünger' },
  { label: 'Erde', value: 'erde' },
  { label: 'Töpfe', value: 'töpfe' },
  { label: 'Sonstiges', value: 'sonstiges' },
];

export const SHOPPING_PRIORITIES = [
  { label: 'Niedrig', value: 'niedrig' },
  { label: 'Mittel', value: 'mittel' },
  { label: 'Hoch', value: 'hoch' },
  { label: 'Dringend', value: 'dringend' },
];
