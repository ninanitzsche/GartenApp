/**
 * usePlantKnowledge Hook
 * Provides access to plant knowledge data (diseases, pests, care tips, companions)
 */

import { useMemo } from 'react';
import { PLANT_KNOWLEDGE_MAP, PlantKnowledgeEntry } from '../data/plant-knowledge-map';

export interface UsePlantKnowledgeReturn {
  allPlants: string[];
  getKnowledgeForPlant: (plantName: string) => PlantKnowledgeEntry | undefined;
  searchKnowledge: (query: string) => PlantKnowledgeEntry[];
}

export function usePlantKnowledge(): UsePlantKnowledgeReturn {
  const allPlants = useMemo(() => {
    return PLANT_KNOWLEDGE_MAP.map(entry => entry.plantName);
  }, []);

  const getKnowledgeForPlant = (plantName: string): PlantKnowledgeEntry | undefined => {
    return PLANT_KNOWLEDGE_MAP.find(
      entry => entry.plantName.toLowerCase() === plantName.toLowerCase()
    );
  };

  const searchKnowledge = (query: string): PlantKnowledgeEntry[] => {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    return PLANT_KNOWLEDGE_MAP.filter(entry => {
      const nameMatch = entry.plantName.toLowerCase().includes(lowerQuery);
      const diseaseMatch = entry.extractedInfo.diseases?.some(d => 
        d.toLowerCase().includes(lowerQuery)
      );
      const pestMatch = entry.extractedInfo.pests?.some(p => 
        p.toLowerCase().includes(lowerQuery)
      );
      return nameMatch || diseaseMatch || pestMatch;
    });
  };

  return {
    allPlants,
    getKnowledgeForPlant,
    searchKnowledge,
  };
}
