import { supabase } from './supabase';
import { Gilde } from '../types/gilde';

export async function fetchGilden(): Promise<Gilde[]> {
  const { data, error } = await supabase
    .from('gilden')
    .select('*')
    .order('number', { ascending: true, nullsFirst: false });

  if (error) throw error;
  return data || [];
}

export async function fetchGildeById(id: string): Promise<Gilde | null> {
  const { data, error } = await supabase
    .from('gilden')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createGilde(gilde: Omit<Gilde, 'id' | 'created_at'>): Promise<Gilde> {
  const { data, error } = await supabase
    .from('gilden')
    .insert(gilde)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchBeetGilden(bedId: string): Promise<Gilde[]> {
  const { data, error } = await supabase
    .from('beet_gilden')
    .select('gilden(*)')
    .eq('bed_id', bedId);

  if (error) throw error;
  return (data || []).map((item: any) => item.gilden);
}

export async function addGildeToBed(bedId: string, gildeId: string): Promise<void> {
  const { error } = await supabase
    .from('beet_gilden')
    .insert({ bed_id: bedId, gilde_id: gildeId });

  if (error) throw error;
}

export async function removeGildeFromBed(bedId: string, gildeId: string): Promise<void> {
  const { error } = await supabase
    .from('beet_gilden')
    .delete()
    .eq('bed_id', bedId)
    .eq('gilde_id', gildeId);

  if (error) throw error;
}