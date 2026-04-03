import { getMotivationMessage, getTodayCompletedCount } from '../services/gamificationService';
import { PlantTaskProgress } from '../services/dashboardService';

describe('gamificationService motivation plant selection', () => {
  const createPlantProgress = (
    plantId: string,
    plantName: string,
    totalTasks: number,
    completedTasks: number
  ): PlantTaskProgress => ({
    plantId,
    plantName,
    plantStatus: 'aktiv',
    totalTasks,
    completedTasks,
    completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    allDone: totalTasks > 0 && completedTasks === totalTasks,
  });

  describe('getMotivationMessage', () => {
    it('should only select plants with open tasks', () => {
      const plants: PlantTaskProgress[] = [
        createPlantProgress('p1', 'Rotklee', 3, 3), // all done
        createPlantProgress('p2', 'Sonnenblume', 5, 2), // has open tasks
      ];

      const result = getMotivationMessage(plants, 1);

      expect(result.plantId).toBe('p2');
      expect(result.plantId).not.toBe('p1');
    });

    it('should select random plant from multiple with open tasks', () => {
      const plants: PlantTaskProgress[] = [
        createPlantProgress('p1', 'Rotklee', 3, 1),
        createPlantProgress('p2', 'Sonnenblume', 5, 2),
        createPlantProgress('p3', 'Glockenblume', 2, 0),
      ];

      const results = new Set<string>();
      for (let i = 0; i < 20; i++) {
        const result = getMotivationMessage(plants, 1);
        if (result.plantId) results.add(result.plantId);
      }

      expect(results.size).toBeGreaterThan(1);
    });

    it('should return no plant when all tasks are done', () => {
      const plants: PlantTaskProgress[] = [
        createPlantProgress('p1', 'Rotklee', 3, 3),
        createPlantProgress('p2', 'Sonnenblume', 5, 5),
      ];

      const result = getMotivationMessage(plants, 1);

      expect(result.plantId).toBeUndefined();
      expect(result.message).toContain('geschafft');
    });

    it('should return motivational message when no plants exist', () => {
      const result = getMotivationMessage([], 0);

      expect(result.message).toContain('Starte');
      expect(result.plantId).toBeUndefined();
    });
  });
});

describe('HomeScreen task filtering', () => {
  interface Task {
    id: string;
    title: string;
    completed_at?: string;
    linked_plants?: Array<{ id: string; name: string }>;
  }

  const createTask = (id: string, title: string, plantId?: string, plantName?: string): Task => ({
    id,
    title,
    completed_at: undefined,
    linked_plants: plantId && plantName ? [{ id: plantId, name: plantName }] : [],
  });

  it('should filter tasks by motivation plant when plant has tasks', () => {
    const tasks: Task[] = [
      createTask('t1', 'Gießen', 'p1', 'Rotklee'),
      createTask('t2', 'Düngen', 'p1', 'Rotklee'),
      createTask('t3', 'Ernten', 'p2', 'Sonnenblume'),
    ];
    const motivationPlantId = 'p1';

    const filteredTasks = tasks.filter(t => {
      const taskPlantId = t.linked_plants?.[0]?.id;
      return taskPlantId === motivationPlantId;
    });

    expect(filteredTasks.length).toBe(2);
    expect(filteredTasks.every(t => t.linked_plants?.[0]?.id === 'p1')).toBe(true);
  });

  it('should return empty when motivation plant has no pending tasks', () => {
    const tasks: Task[] = [
      createTask('t3', 'Ernten', 'p2', 'Sonnenblume'),
    ];
    const motivationPlantId = 'p1'; // Rotklee has no tasks

    const filteredTasks = tasks.filter(t => {
      const taskPlantId = t.linked_plants?.[0]?.id;
      return taskPlantId === motivationPlantId;
    });

    expect(filteredTasks.length).toBe(0);
  });

  it('should filter to plant that actually has pending tasks', () => {
    // Simulating the case: motivation says Rotklee but Rotklee has no tasks
    // We need to find another plant with tasks
    const tasks: Task[] = [
      createTask('t1', 'Ernten', 'p2', 'Sonnenblume'),
      createTask('t2', 'Gießen', 'p3', 'Glockenblume'),
    ];
    const motivationPlantId = 'p1'; // Rotklee - no tasks
    const allPlants = [
      { id: 'p1', name: 'Rotklee' },
      { id: 'p2', name: 'Sonnenblume' },
      { id: 'p3', name: 'Glockenblume' },
    ];

    // Current filter returns empty for p1
    const filteredForMotivation = tasks.filter(t => t.linked_plants?.[0]?.id === motivationPlantId);
    
    // Expected: should fall back to next plant with tasks
    let displayTasks = filteredForMotivation;
    if (displayTasks.length === 0 && motivationPlantId) {
      const plantWithTasks = allPlants.find(p => 
        tasks.some(t => t.linked_plants?.[0]?.id === p.id)
      );
      if (plantWithTasks) {
        displayTasks = tasks.filter(t => t.linked_plants?.[0]?.id === plantWithTasks.id);
      }
    }

    // After fallback, we should show tasks for the next plant (Sonnenblume)
    expect(displayTasks.length).toBe(1);
    expect(displayTasks[0].linked_plants?.[0]?.name).toBe('Sonnenblume');
  });

  it('should show all tasks when no motivation plant', () => {
    const tasks: Task[] = [
      createTask('t1', 'Gießen', 'p1', 'Rotklee'),
      createTask('t2', 'Düngen', 'p2', 'Sonnenblume'),
    ];
    const motivationPlantId = undefined;

    const displayTasks = motivationPlantId
      ? tasks.filter(t => t.linked_plants?.[0]?.id === motivationPlantId)
      : tasks;

    expect(displayTasks.length).toBe(2);
  });
});
