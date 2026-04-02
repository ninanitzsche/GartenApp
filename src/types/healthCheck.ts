import { Photo } from './photo';
import { PlantDiseaseData } from './ai';

export interface HealthCheck {
  id: string;
  plant_id: string;
  photo_id?: string;
  photo?: Photo;
  disease_data?: PlantDiseaseData;
  health_status: 'gesund' | 'krank' | 'unsicher';
  notes?: string;
  created_at: string;
  user_id: string;
}

export interface HealthCheckFormData {
  photoUri: string;
  runAI?: boolean;
  notes?: string;
}

export function calculateHealthStatus(
  diseaseData?: PlantDiseaseData
): 'gesund' | 'krank' | 'unsicher' {
  if (!diseaseData || !diseaseData.results || diseaseData.results.length === 0) {
    return 'gesund';
  }
  const topScore = diseaseData.results[0]?.score || 0;
  if (topScore >= 0.7) return 'krank';
  if (topScore >= 0.4) return 'unsicher';
  return 'gesund';
}
