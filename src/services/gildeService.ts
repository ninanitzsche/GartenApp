import { supabase } from './supabase';
import { Gilde, GildeRating } from '../types/gilde';

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

export async function updateGilde(id: string, gilde: Partial<Gilde>): Promise<Gilde> {
  const { data, error } = await supabase
    .from('gilden')
    .update(gilde)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteGilde(id: string): Promise<void> {
  const { error } = await supabase
    .from('gilden')
    .delete()
    .eq('id', id);

  if (error) throw error;
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
  console.log('[addGildeToBed] bedId:', bedId, 'gildeId:', gildeId);
  
  if (!gildeId) {
    console.error('[addGildeToBed] Ungültige gildeId:', gildeId);
    throw new Error('Ungültige Gilde-ID');
  }
  
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

export async function fetchRating(bedId: string, gildeId: string): Promise<GildeRating | null> {
  const { data, error } = await supabase
    .from('gilde_ratings')
    .select('*')
    .eq('bed_id', bedId)
    .eq('gilde_id', gildeId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function upsertRating(
  rating: Omit<GildeRating, 'id' | 'created_at' | 'updated_at'>
): Promise<GildeRating> {
  const existing = await fetchRating(rating.bed_id, rating.gilde_id);

  if (existing) {
    const { data, error } = await supabase
      .from('gilde_ratings')
      .update({ rating: rating.rating, comment: rating.comment, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from('gilde_ratings')
    .insert(rating)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchBeetGildenWithRatings(bedId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('beet_gilden')
    .select(`
      bed_id,
      gilde_id,
      gilden (*),
      gilde_ratings (*)
    `)
    .eq('bed_id', bedId);

  if (error) throw error;
  return data || [];
}

export async function fetchUserGilden(): Promise<Gilde[]> {
  const { data, error } = await supabase
    .from('gilden')
    .select('*')
    .eq('is_system', false)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export function getSuggestedGilden(
  gilden: Gilde[],
  bedPlantNames: string[]
): { gilde: Gilde; matchScore: number; matchingPlants: string[] }[] {
  if (!bedPlantNames.length) {
    return gilden.map(gilde => ({ gilde, matchScore: 0, matchingPlants: [] }));
  }

  const normalizedBedPlants = bedPlantNames.map(n => n.toLowerCase().trim());

  const suggestions = gilden.map(gilde => {
    const matchingPlants: string[] = [];
    
    for (const plant of gilde.plants) {
      const normalizedPlant = plant.name.toLowerCase().trim();
      if (normalizedBedPlants.some(bp => 
        normalizedPlant.includes(bp) || bp.includes(normalizedPlant)
      )) {
        matchingPlants.push(plant.name);
      }
    }

    const matchScore = gilde.plants.length > 0
      ? Math.round((matchingPlants.length / gilde.plants.length) * 100)
      : 0;

    return { gilde, matchScore, matchingPlants };
  });

  return suggestions
    .filter(s => s.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);
}