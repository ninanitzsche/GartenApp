import { extractPlantNameFromMotivation, filterTasksByMotivation } from '../utils/motivationTaskUtils';

interface Task {
  id: string;
  title: string;
  completed_at?: string;
  linked_plants?: Array<{ id: string; name: string }>;
}

describe('extractPlantNameFromMotivation', () => {
  it('should extract plant name from "Deine X braucht dich" format', () => {
    const result = extractPlantNameFromMotivation('Deine Katzenminze braucht dich 💚');
    expect(result).toBe('Katzenminze');
  });

  it('should extract plant name from "X wartet auf dich" format', () => {
    const result = extractPlantNameFromMotivation('Katzenminze wartet auf dich 🌿');
    expect(result).toBe('Katzenminze');
  });

  it('should extract plant name from "X braucht noch N Aufgaben" format', () => {
    const result = extractPlantNameFromMotivation('Katzenminze braucht noch 3 Aufgaben 🍃');
    expect(result).toBe('Katzenminze');
  });

  it('should extract plant name from "Nur noch N Aufgabe für X" format', () => {
    const result = extractPlantNameFromMotivation('Nur noch 1 Aufgabe für Katzenminze! 🌿');
    expect(result).toBe('Katzenminze');
  });

  it('should extract plant name from "Nur noch N X Aufgabe" format', () => {
    const result = extractPlantNameFromMotivation('Nur noch 2 Katzenminze Aufgabe');
    expect(result).toBe('Katzenminze');
  });

  it('should return null for unmatching motivation', () => {
    const result = extractPlantNameFromMotivation('Alle Aufgaben erledigt! 🎉');
    expect(result).toBeNull();
  });
});

describe('filterTasksByMotivation', () => {
  const createTask = (id: string, title: string, plantName?: string): Task => ({
    id,
    title,
    completed_at: undefined,
    linked_plants: plantName ? [{ id: `p-${plantName}`, name: plantName }] : [],
  });

  it('should filter tasks matching plant name from motivation', () => {
    const tasks: Task[] = [
      createTask('t1', 'Gießen', 'Katzenminze'),
      createTask('t2', 'Düngen', 'Katzenminze'),
      createTask('t3', 'Ernten', 'Tomate'),
    ];

    const result = filterTasksByMotivation(tasks, 'Katzenminze braucht dich 💚');

    expect(result.length).toBe(2);
    expect(result.every(t => t.linked_plants?.[0]?.name === 'Katzenminze')).toBe(true);
  });

  it('should do partial match - task plant contains search term', () => {
    const tasks: Task[] = [
      createTask('t1', 'Gießen', 'Katzenminze'),
      createTask('t2', 'Düngen', 'Tomate'),
    ];

    const result = filterTasksByMotivation(tasks, 'Katze braucht dich');

    expect(result.length).toBe(1);
    expect(result[0].title).toBe('Gießen');
  });

  it('should do partial match - search term contains task plant', () => {
    const tasks: Task[] = [
      createTask('t1', 'Gießen', 'Katze'),
      createTask('t2', 'Düngen', 'Tomate'),
    ];

    const result = filterTasksByMotivation(tasks, 'Katzenminze braucht dich');

    expect(result.length).toBe(1);
    expect(result[0].title).toBe('Gießen');
  });

  it('should handle umlauts in matching', () => {
    const tasks: Task[] = [
      createTask('t1', 'Gießen', 'Tomate'),
      createTask('t2', 'Düngen', 'Gurke'),
    ];

    const result = filterTasksByMotivation(tasks, 'Tomate braucht dich');

    expect(result.length).toBe(1);
  });

  it('should fall back to all tasks when no matches found', () => {
    const tasks: Task[] = [
      createTask('t1', 'Gießen', 'Tomate'),
      createTask('t2', 'Düngen', 'Gurke'),
    ];

    const result = filterTasksByMotivation(tasks, 'Kartoffel braucht dich');

    expect(result.length).toBe(2);
  });

  it('should return all tasks when no plant name extracted', () => {
    const tasks: Task[] = [
      createTask('t1', 'Gießen', 'Tomate'),
    ];

    const result = filterTasksByMotivation(tasks, 'Alle erledigt!');

    expect(result.length).toBe(1);
  });

  it('should return empty array for empty tasks', () => {
    const result = filterTasksByMotivation([], 'Katzenminze braucht dich');
    expect(result.length).toBe(0);
  });
});