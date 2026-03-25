/**
 * ExportService - Export-Funktion
 * Story 052: Export-Funktion
 */

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Task } from '../types/task';
import { Plant } from '../types/plant';
import { Harvest } from '../types/harvest';

interface ExportOptions {
  format: 'csv' | 'json';
  includeHarvests: boolean;
  includeTasks: boolean;
  includePlants: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export async function exportToCSV(
  data: {
    plants?: Plant[];
    tasks?: Task[];
    harvests?: Harvest[];
  },
  options: ExportOptions
): Promise<string> {
  const lines: string[] = [];

  // Plants
  if (options.includePlants && data.plants) {
    lines.push('--- PFLANZEN ---');
    lines.push('Name,Lateinischer Name,Status,Standort,Typ,Menge,Essbar,Winterhart');
    data.plants.forEach(plant => {
      lines.push([
        plant.name,
        plant.latin_name || '',
        plant.status,
        plant.location || '',
        plant.type,
        plant.quantity || 1,
        plant.essbar ? 'Ja' : 'Nein',
        plant.winterhart ? 'Ja' : 'Nein',
      ].map(v => `"${v}"`).join(','));
    });
    lines.push('');
  }

  // Tasks
  if (options.includeTasks && data.tasks) {
    lines.push('--- AUFGABEN ---');
    lines.push('Titel,Beschreibung,Kategorie,Priorität,Erledigt');
    data.tasks.forEach(task => {
      lines.push([
        task.title,
        task.description || '',
        task.category,
        task.priority,
        task.completed_at ? 'Ja' : 'Nein',
      ].map(v => `"${v}"`).join(','));
    });
    lines.push('');
  }

  // Harvests
  if (options.includeHarvests && data.harvests) {
    lines.push('--- ERNTEN ---');
    lines.push('Pflanze,Menge,Einheit,Datum');
    data.harvests.forEach(harvest => {
      lines.push([
        harvest.plant_name || '',
        harvest.quantity,
        harvest.unit || 'Stück',
        harvest.harvest_date,
      ].map(v => `"${v}"`).join(','));
    });
  }

  return lines.join('\n');
}

export async function exportToJSON(
  data: {
    plants?: Plant[];
    tasks?: Task[];
    harvests?: Harvest[];
  },
  options: ExportOptions
): Promise<string> {
  const exportData: any = {
    exportDate: new Date().toISOString(),
    version: '1.0.0',
  };

  if (options.includePlants && data.plants) {
    exportData.plants = data.plants.map(p => ({
      name: p.name,
      latin_name: p.latin_name,
      status: p.status,
      location: p.location,
      type: p.type,
      quantity: p.quantity,
      essbar: p.essbar,
      winterhart: p.winterhart,
      notes: p.notes,
      created_at: p.created_at,
    }));
  }

  if (options.includeTasks && data.tasks) {
    exportData.tasks = data.tasks.map(t => ({
      title: t.title,
      description: t.description,
      category: t.category,
      priority: t.priority,
      completed_at: t.completed_at,
      created_at: t.created_at,
    }));
  }

  if (options.includeHarvests && data.harvests) {
    exportData.harvests = data.harvests.map(h => ({
      plant_name: h.plant_name,
      quantity: h.quantity,
      unit: h.unit,
      harvest_date: h.harvest_date,
    }));
  }

  return JSON.stringify(exportData, null, 2);
}

export async function saveAndShareExport(
  content: string,
  filename: string,
  mimeType: string
): Promise<boolean> {
  try {
    const fileUri = `${FileSystem.documentDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(fileUri, content, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType,
        dialogTitle: 'Gartenplaner Export teilen',
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error saving/sharing export:', error);
    return false;
  }
}

export async function exportGardenData(
  data: {
    plants?: Plant[];
    tasks?: Task[];
    harvests?: Harvest[];
  },
  options: ExportOptions
): Promise<boolean> {
  try {
    let content: string;
    let filename: string;
    let mimeType: string;

    if (options.format === 'csv') {
      content = await exportToCSV(data, options);
      filename = `gartenplaner_export_${new Date().toISOString().split('T')[0]}.csv`;
      mimeType = 'text/csv';
    } else {
      content = await exportToJSON(data, options);
      filename = `gartenplaner_export_${new Date().toISOString().split('T')[0]}.json`;
      mimeType = 'application/json';
    }

    return await saveAndShareExport(content, filename, mimeType);
  } catch (error) {
    console.error('Error exporting garden data:', error);
    return false;
  }
}
