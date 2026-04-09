/**
 * CareTaskCard Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { CareTask } from '../../services/plantCareTaskService';
import CareTaskCard from '../CareTaskCard';

describe('CareTaskCard', () => {
  const mockTasks: CareTask[] = [
    {
      title: 'Regelmäßig gießen',
      description: 'Am besten morgens direkt an den Wurzelbereich gießen',
      category: 'watering',
      priority: 'high',
    },
    {
      title: 'Ausgeizen',
      description: 'Seitentriebe in den Blattachseln regelmäßig entfernen',
      category: 'pruning',
      priority: 'medium',
    },
  ];

  it('should render task title', () => {
    render(<CareTaskCard tasks={mockTasks} />);
    
    expect(screen.getByText(/Regelmäßig gießen/)).toBeTruthy();
  });

  it('should render multiple tasks', () => {
    render(<CareTaskCard tasks={mockTasks} />);
    
    expect(screen.getByText(/Regelmäßig gießen/)).toBeTruthy();
    expect(screen.getByText(/Ausgeizen/)).toBeTruthy();
  });

  it('should render priority badge', () => {
    render(<CareTaskCard tasks={mockTasks} />);
    
    expect(screen.getByText(/wichtig/)).toBeTruthy();
  });

  it('should render category badge', () => {
    render(<CareTaskCard tasks={mockTasks} />);
    
    expect(screen.getByText(/Pflegetipps/)).toBeTruthy();
  });

  it('should return null for empty tasks', () => {
    const { toJSON } = render(<CareTaskCard tasks={[]} />);
    expect(toJSON()).toBeNull();
  });
});
