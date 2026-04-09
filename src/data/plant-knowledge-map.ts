/**
 * Plant to Knowledge mapping
 */

export interface PlantKnowledgeEntry {
  plantName: string;
  articleIds: string[];
  extractedInfo: {
    diseases?: string[];
    pests?: string[];
    careTips?: string[];
    companions?: { plant: string; type: 'good' | 'avoid' }[];
    sowingTime?: string;
    harvestTime?: string;
  };
}

export const PLANT_KNOWLEDGE_MAP: PlantKnowledgeEntry[] = [];
