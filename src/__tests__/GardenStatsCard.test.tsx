import GardenStatsCard from '../components/GardenStatsCard';
import { render, screen } from '@testing-library/react-native';

test('GardenStatsCard zeigt taskCount', () => {
  render(<GardenStatsCard bedCount={5} plantCount={20} taskCount={3} />);
  
  expect(screen.getByText('3')).toBeTruthy();
  expect(screen.getByText('Aufgaben')).toBeTruthy();
});
