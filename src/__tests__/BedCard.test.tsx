import BedCard from '../components/BedCard';
import { render, screen } from '@testing-library/react-native';

test('BedCard zeigt keine Dimensionsangaben', () => {
  const bed = {
    id: '1',
    user_id: 'user-1',
    name: 'Test Beet',
    width: 20,
    height: 15,
    color: '#4CAF50',
    shape: 'rectangle',
    notes: undefined,
    garden_id: '1',
    created_at: new Date().toISOString(),
  };

  render(<BedCard bed={bed} plantCount={3} onPress={() => {}} />);
  
  expect(screen.queryByText(/20%/)).toBeNull();
  expect(screen.queryByText(/15%/)).toBeNull();
  expect(screen.queryByText(/×/)).toBeNull();
});