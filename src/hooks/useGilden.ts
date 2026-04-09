import { useState, useEffect, useCallback } from 'react';
import { Gilde } from '../types/gilde';
import { fetchGilden, fetchBeetGilden } from '../services/gildeService';
import { SYSTEM_GILDEN } from '../data/system-gilden';

export interface UseGildenReturn {
  gilden: Gilde[];
  loading: boolean;
  error: string | null;
  fetchGilden: () => Promise<void>;
  getBeetGilden: (bedId: string) => Promise<Gilde[]>;
}

export function useGilden(): UseGildenReturn {
  const [gilden, setGilden] = useState<Gilde[]>(SYSTEM_GILDEN);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGilden = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const userGilden = await fetchGilden();
      setGilden([...SYSTEM_GILDEN, ...userGilden]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const getBeetGilden = useCallback(async (bedId: string): Promise<Gilde[]> => {
    return fetchBeetGilden(bedId);
  }, []);

  useEffect(() => {
    loadGilden();
  }, [loadGilden]);

  return {
    gilden,
    loading,
    error,
    fetchGilden: loadGilden,
    getBeetGilden,
  };
}