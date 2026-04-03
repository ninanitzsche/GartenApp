/**
 * Jest Setup File
 * Runs before all tests to configure the testing environment
 */

import '@testing-library/jest-dom';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn().mockResolvedValue(undefined),
  getItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(undefined),
  clear: jest.fn().mockResolvedValue(undefined),
  multiSet: jest.fn().mockResolvedValue(undefined),
  multiGet: jest.fn().mockResolvedValue([]),
  getAllKeys: jest.fn().mockResolvedValue([]),
}));

// Mock react-native-svg to avoid Touchable issues
jest.mock('react-native-svg', () => {
  const React = require('react');
  const Svg = (props: any) => React.createElement('svg', props);
  Svg.Rect = (props: any) => React.createElement('rect', props);
  Svg.Circle = (props: any) => React.createElement('circle', props);
  Svg.Path = (props: any) => React.createElement('path', props);
  Svg.Text = (props: any) => React.createElement('text', props);
  Svg.G = (props: any) => React.createElement('g', props);
  return {
    __esModule: true,
    default: Svg,
    Svg,
    Rect: Svg.Rect,
    Circle: Svg.Circle,
    Path: Svg.Path,
    Text: Svg.Text,
    G: Svg.G,
  };
});

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => ({
  Leaf: 'Leaf',
  Sun: 'Sun',
  Cloud: 'Cloud',
  CloudRain: 'CloudRain',
  Snowflake: 'Snowflake',
  Flower2: 'Flower2',
  Check: 'Check',
  ChevronDown: 'ChevronDown',
  ChevronUp: 'ChevronUp',
  Plus: 'Plus',
  Trash2: 'Trash2',
  Edit: 'Edit',
  Eye: 'Eye',
  X: 'X',
  Calendar: 'Calendar',
  Star: 'Star',
  AlertCircle: 'AlertCircle',
  Clock: 'Clock',
  MapPin: 'MapPin',
  Filter: 'Filter',
  Search: 'Search',
  Home: 'Home',
  List: 'List',
  ShoppingCart: 'ShoppingCart',
  BookOpen: 'BookOpen',
  Settings: 'Settings',
  User: 'User',
  LogOut: 'LogOut',
  Menu: 'Menu',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
  MoreVertical: 'MoreVertical',
  Sprout: 'Sprout',
  ChevronRight: 'ChevronRight',
}));

// Mock Supabase (configured in individual tests)
jest.mock('../services/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

// Suppress console errors in tests (optional - can be removed if needed)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
