import { useState, useEffect } from 'react';
import { fetchBeds } from '../services/bedService';
import { Bed } from '../types/bed';

export function useBeets() {
  const [beets, setBeets] = useState<Bed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBeets();
  }, []);

  const loadBeets = async () => {
    try {
      setLoading(true);
      const data = await fetchBeds();
      setBeets(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error loading beets');
    } finally {
      setLoading(false);
    }
  };

  return { beets, loading, error, reload: loadBeets };
}