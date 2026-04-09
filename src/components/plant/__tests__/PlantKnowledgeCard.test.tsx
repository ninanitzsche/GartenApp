/**
 * PlantKnowledgeCard Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import PlantKnowledgeCard from '../PlantKnowledgeCard';

describe('PlantKnowledgeCard', () => {
  const mockKnowledge = {
    plantName: 'Tomate',
    articleIds: [],
    extractedInfo: {
      diseases: ['Krautfäule', 'Blütenendfäule'],
      pests: ['Blattläuse', 'Weiße Fliege'],
      careTips: ['Regelmäßig gießen', 'Ausgeizen'],
      companions: [
        { plant: 'Basilikum', type: 'good' },
        { plant: 'Fenchel', type: 'avoid' },
      ],
      sowingTime: 'Februar-März',
      harvestTime: 'Juli-September',
    },
  };

  it('should render plant name', () => {
    render(<PlantKnowledgeCard knowledge={mockKnowledge} />);
    
    expect(screen.getByText('Tomate')).toBeTruthy();
  });

  it('should render diseases section', () => {
    render(<PlantKnowledgeCard knowledge={mockKnowledge} />);
    
    expect(screen.getByText('Krautfäule')).toBeTruthy();
    expect(screen.getByText('Blütenendfäule')).toBeTruthy();
  });

  it('should render pests section', () => {
    render(<PlantKnowledgeCard knowledge={mockKnowledge} />);
    
    expect(screen.getByText('Blattläuse')).toBeTruthy();
    expect(screen.getByText('Weiße Fliege')).toBeTruthy();
  });

  it('should render good companions', () => {
    render(<PlantKnowledgeCard knowledge={mockKnowledge} />);
    
    expect(screen.getByText(/Basilikum/)).toBeTruthy();
  });

  it('should render bad companions', () => {
    render(<PlantKnowledgeCard knowledge={mockKnowledge} />);
    
    expect(screen.getByText(/Fenchel/)).toBeTruthy();
  });

  it('should render sowing time', () => {
    render(<PlantKnowledgeCard knowledge={mockKnowledge} />);
    
    expect(screen.getByText('Februar-März')).toBeTruthy();
  });

  it('should render harvest time', () => {
    render(<PlantKnowledgeCard knowledge={mockKnowledge} />);
    
    expect(screen.getByText('Juli-September')).toBeTruthy();
  });
});
