/**
 * HomeScreen Learnings Section Tests
 */

// Mock react-native first - must be before any imports
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    RefreshControl: 'RefreshControl',
    ActivityIndicator: 'ActivityIndicator',
    ScrollView: 'ScrollView',
    TouchableOpacity: 'TouchableOpacity',
    View: 'View',
    Text: 'Text',
    StyleSheet: RN.StyleSheet,
  };
});

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
  useNavigation: () => ({ navigate: jest.fn() }),
  useRoute: () => ({ params: {} }),
}));

jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'MaterialIcons',
}));

jest.mock('../services/dashboardService', () => ({
  getDashboardData: jest.fn().mockResolvedValue({
    harvests: { totalHarvests: 0, totalByPlant: [] },
    tasks: { totalTasks: 0, completedTasks: 0, completionRate: 0, avgTimeSpent: 0, totalTimeSpent: 0 },
    statusDistribution: [],
    recentActivity: [],
  }),
}));

jest.mock('../services/taskService', () => ({
  fetchTasks: jest.fn().mockResolvedValue([]),
  toggleTaskCompletion: jest.fn(),
  formatTimeSpent: jest.fn().mockReturnValue('0m'),
}));

jest.mock('../theme/colors', () => ({
  primary: '#4CAF50',
  primaryLight: '#E8F5E9',
  secondary: '#2196F3',
  accent: '#FF9800',
  success: '#4CAF50',
  info: '#2196F3',
  warning: '#FF9800',
  error: '#F44336',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  card: '#FFFFFF',
  text: '#212121',
  textLight: '#757575',
  border: '#E0E0E0',
  divider: '#EEEEEE',
  statusGeplant: '#9E9E9E',
  statusBestellt: '#2196F3',
  statusAusgesaet: '#8BC34A',
  statusPikiert: '#4CAF50',
  statusAusgepflanzt: '#CDDC39',
  statusEtabliert: '#FFEB3B',
  statusGeerntet: '#F44336',
  statusUnklar: '#607D8B',
}));

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import HomeScreen from '../screens/HomeScreen';
import { Learning } from '../types/learning';
import { Zeitraum, Jahreszeit } from '../types/zeitraum';

const mockLearnings: Learning[] = [
  {
    id: '1',
    user_id: 'user1',
    source_type: 'knowledge_base',
    source_name: 'Garten Tipps',
    title: 'Tomaten nicht von oben gießen',
    content: 'Gießen Sie Tomatenpflanzen immer von unten, um Pilzkrankheiten zu vermeiden.',
    related_plants: ['Tomate'],
    related_categories: ['pflege'],
    valid_for_zeitraeume: ['sommer_frueh', 'sommer_mitte'],
    relevance_score: 8,
    created_at: '2024-01-15',
    dismissed: false,
  },
  {
    id: '2',
    user_id: 'user1',
    source_type: 'manual',
    source_name: 'Eigene Notiz',
    title: 'Frühbeet im März vorbereiten',
    content: 'Im März das Frühbeet reinigen und Boden vorbereiten.',
    related_plants: [],
    related_categories: ['vorbereitung'],
    valid_for_zeitraeume: ['fruehjahr_frueh'],
    relevance_score: 7,
    created_at: '2024-01-10',
    dismissed: false,
    user_rating: 'helpful' as const,
  },
];

const mockLearningService = {
  getLearningsForSeason: jest.fn(),
  fetchLearnings: jest.fn(),
  fetchLearning: jest.fn(),
  createLearning: jest.fn(),
  updateLearning: jest.fn(),
  rateLearning: jest.fn(),
  dismissLearning: jest.fn(),
  deleteLearning: jest.fn(),
  fetchLearningsForPlant: jest.fn(),
};

jest.mock('../services/learningService', () => ({
  learningService: mockLearningService,
}));

const mockGetAktuelleSaison = jest.fn();
const mockGetJahreszeit = jest.fn();
const mockGetJahreszeitLabel = jest.fn();

jest.mock('../utils/zeitraumUtils', () => ({
  getAktuelleSaison: (...args: any[]) => mockGetAktuelleSaison(...args),
  getJahreszeit: (...args: any[]) => mockGetJahreszeit(...args),
  getJahreszeitLabel: (...args: any[]) => mockGetJahreszeitLabel(...args),
  getZeitraumShortLabel: jest.fn().mockReturnValue('Frühjahr, früh'),
  sortZeitraeume: jest.fn().mockImplementation((arr) => arr),
  getPhase: jest.fn(),
  getZeitraumLabel: jest.fn(),
  getZeitraumIcon: jest.fn(),
  getZeitraumIconComponent: jest.fn(),
  isRelevantForCurrentPhase: jest.fn(),
}));

const flushPromises = () => new Promise(resolve => process.nextTick(resolve));

describe('HomeScreen Learnings Section', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockGetAktuelleSaison.mockReturnValue(Zeitraum.FRUEHJAHR_FRUH);
    mockGetJahreszeit.mockReturnValue(Jahreszeit.FRUEHJAHR);
    mockGetJahreszeitLabel.mockReturnValue('Frühjahr');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Learnings section visibility', () => {
    it('renders Learnings section when learnings exist', async () => {
      mockLearningService.getLearningsForSeason.mockResolvedValue(mockLearnings);

      let container: any;
      await act(async () => {
        const result = render(<HomeScreen navigation={{} as any} route={{} as any} />);
        container = result;
        jest.runAllTimers();
      });
      
      expect(container.getByText('Tipps für Frühjahr')).toBeTruthy();
    });

    it('hides Learnings section when no learnings available', async () => {
      mockLearningService.getLearningsForSeason.mockResolvedValue([]);

      const { queryByText } = render(<HomeScreen navigation={{} as any} route={{} as any} />);

      await flushPromises();
      
      expect(queryByText('Tipps für')).toBeNull();
    });

    it('renders multiple LearningCards when multiple learnings exist', async () => {
      mockLearningService.getLearningsForSeason.mockResolvedValue(mockLearnings);

      const { getByText } = render(<HomeScreen navigation={{} as any} route={{} as any} />);

      await flushPromises();
      
      expect(getByText('Tomaten nicht von oben gießen')).toBeTruthy();
      expect(getByText('Frühbeet im März vorbereiten')).toBeTruthy();
    });
  });

  describe('LearningCard rendering', () => {
    it('renders learning title correctly', async () => {
      mockLearningService.getLearningsForSeason.mockResolvedValue([mockLearnings[0]]);

      const { getByText } = render(<HomeScreen navigation={{} as any} route={{} as any} />);

      await flushPromises();
      
      expect(getByText('Tomaten nicht von oben gießen')).toBeTruthy();
    });

    it('renders learning content correctly', async () => {
      mockLearningService.getLearningsForSeason.mockResolvedValue([mockLearnings[0]]);

      const { getByText } = render(<HomeScreen navigation={{} as any} route={{} as any} />);

      await flushPromises();
      
      expect(getByText(/Gießen Sie Tomatenpflanzen/)).toBeTruthy();
    });

    it('renders source name when available', async () => {
      mockLearningService.getLearningsForSeason.mockResolvedValue([mockLearnings[0]]);

      const { getByText } = render(<HomeScreen navigation={{} as any} route={{} as any} />);

      await flushPromises();
      
      expect(getByText('Garten Tipps')).toBeTruthy();
    });

    it('shows rated state when learning has user_rating', async () => {
      mockLearningService.getLearningsForSeason.mockResolvedValue([mockLearnings[1]]);

      const { getByText } = render(<HomeScreen navigation={{} as any} route={{} as any} />);

      await flushPromises();
      
      expect(getByText('Als hilfreich markiert')).toBeTruthy();
    });
  });

  describe('Rate callback functionality', () => {
    it('calls rateLearning with helpful=true when helpful button pressed', async () => {
      mockLearningService.getLearningsForSeason
        .mockResolvedValueOnce([mockLearnings[0]])
        .mockResolvedValueOnce([]);
      mockLearningService.rateLearning.mockResolvedValue(mockLearnings[0]);

      const { getByText } = render(<HomeScreen navigation={{} as any} route={{} as any} />);

      await flushPromises();
      
      expect(getByText('Tomaten nicht von oben gießen')).toBeTruthy();

      const helpfulButton = getByText('Hilfreich');
      fireEvent.press(helpfulButton);

      expect(mockLearningService.rateLearning).toHaveBeenCalledWith('1', 'helpful');
    });

    it('calls rateLearning with not_helpful when not helpful button pressed', async () => {
      mockLearningService.getLearningsForSeason
        .mockResolvedValueOnce([mockLearnings[0]])
        .mockResolvedValueOnce([]);
      mockLearningService.rateLearning.mockResolvedValue(mockLearnings[0]);

      const { getByText } = render(<HomeScreen navigation={{} as any} route={{} as any} />);

      await flushPromises();
      
      expect(getByText('Tomaten nicht von oben gießen')).toBeTruthy();

      const notHelpfulButton = getByText('Nicht hilfreich');
      fireEvent.press(notHelpfulButton);

      expect(mockLearningService.rateLearning).toHaveBeenCalledWith('1', 'not_helpful');
    });

    it('reloads learnings after rating', async () => {
      mockLearningService.getLearningsForSeason
        .mockResolvedValueOnce([mockLearnings[0]])
        .mockResolvedValueOnce([]);
      mockLearningService.rateLearning.mockResolvedValue(mockLearnings[0]);

      const { getByText } = render(<HomeScreen navigation={{} as any} route={{} as any} />);

      await flushPromises();
      
      expect(getByText('Tomaten nicht von oben gießen')).toBeTruthy();

      const helpfulButton = getByText('Hilfreich');
      fireEvent.press(helpfulButton);

      await flushPromises();
      
      expect(mockLearningService.getLearningsForSeason).toHaveBeenCalledTimes(2);
    });
  });

  describe('Dismiss callback functionality', () => {
    it('calls dismissLearning when dismiss button pressed', async () => {
      mockLearningService.getLearningsForSeason
        .mockResolvedValueOnce([mockLearnings[0]])
        .mockResolvedValueOnce([]);
      mockLearningService.dismissLearning.mockResolvedValue(mockLearnings[0]);

      const { getByLabelText } = render(<HomeScreen navigation={{} as any} route={{} as any} />);

      await flushPromises();
      
      expect(getByLabelText('Tomaten nicht von oben gießen')).toBeTruthy();

      const dismissButton = getByLabelText('Tipp verwerfen');
      fireEvent.press(dismissButton);

      expect(mockLearningService.dismissLearning).toHaveBeenCalledWith('1');
    });

    it('reloads learnings after dismissing', async () => {
      mockLearningService.getLearningsForSeason
        .mockResolvedValueOnce([mockLearnings[0]])
        .mockResolvedValueOnce([]);
      mockLearningService.dismissLearning.mockResolvedValue(mockLearnings[0]);

      const { getByLabelText } = render(<HomeScreen navigation={{} as any} route={{} as any} />);

      await flushPromises();
      
      expect(getByLabelText('Tomaten nicht von oben gießen')).toBeTruthy();

      const dismissButton = getByLabelText('Tipp verwerfen');
      fireEvent.press(dismissButton);

      await flushPromises();
      
      expect(mockLearningService.getLearningsForSeason).toHaveBeenCalledTimes(2);
    });
  });

  describe('Seasonal label display', () => {
    it('displays correct seasonal label based on current season', async () => {
      mockLearningService.getLearningsForSeason.mockResolvedValue([mockLearnings[0]]);
      mockGetJahreszeitLabel.mockReturnValue('Sommer');

      const { getByText } = render(<HomeScreen navigation={{} as any} route={{} as any} />);

      await flushPromises();
      
      expect(getByText('Tipps für Sommer')).toBeTruthy();
    });

    it('displays Herbst label correctly', async () => {
      mockLearningService.getLearningsForSeason.mockResolvedValue([mockLearnings[0]]);
      mockGetJahreszeitLabel.mockReturnValue('Herbst');

      const { getByText } = render(<HomeScreen navigation={{} as any} route={{} as any} />);

      await flushPromises();
      
      expect(getByText('Tipps für Herbst')).toBeTruthy();
    });

    it('displays Winter label correctly', async () => {
      mockLearningService.getLearningsForSeason.mockResolvedValue([mockLearnings[0]]);
      mockGetJahreszeitLabel.mockReturnValue('Winter');

      const { getByText } = render(<HomeScreen navigation={{} as any} route={{} as any} />);

      await flushPromises();
      
      expect(getByText('Tipps für Winter')).toBeTruthy();
    });
  });

  describe('Error handling', () => {
    it('handles learningService errors gracefully', async () => {
      mockLearningService.getLearningsForSeason.mockRejectedValue(new Error('Failed to load'));

      const { queryByText } = render(<HomeScreen navigation={{} as any} route={{} as any} />);

      await flushPromises();
      
      expect(queryByText('Tipps für')).toBeNull();
    });

    it('handles rateLearning errors gracefully', async () => {
      mockLearningService.getLearningsForSeason
        .mockResolvedValueOnce([mockLearnings[0]])
        .mockResolvedValueOnce([]);
      mockLearningService.rateLearning.mockRejectedValue(new Error('Failed to rate'));

      const { getByText } = render(<HomeScreen navigation={{} as any} route={{} as any} />);

      await flushPromises();
      
      expect(getByText('Tomaten nicht von oben gießen')).toBeTruthy();

      const helpfulButton = getByText('Hilfreich');
      fireEvent.press(helpfulButton);

      await flushPromises();
      
      expect(mockLearningService.rateLearning).toHaveBeenCalled();
    });

    it('handles dismissLearning errors gracefully', async () => {
      mockLearningService.getLearningsForSeason
        .mockResolvedValueOnce([mockLearnings[0]])
        .mockResolvedValueOnce([]);
      mockLearningService.dismissLearning.mockRejectedValue(new Error('Failed to dismiss'));

      const { getByLabelText } = render(<HomeScreen navigation={{} as any} route={{} as any} />);

      await flushPromises();
      
      expect(getByLabelText('Tomaten nicht von oben gießen')).toBeTruthy();

      const dismissButton = getByLabelText('Tipp verwerfen');
      fireEvent.press(dismissButton);

      await flushPromises();
      
      expect(mockLearningService.dismissLearning).toHaveBeenCalled();
    });
  });

  describe('Integration with loadLearnings', () => {
    it('calls getLearningsForSeason with correct parameters', async () => {
      mockLearningService.getLearningsForSeason.mockResolvedValue([]);
      mockGetAktuelleSaison.mockReturnValue(Zeitraum.SOMMER_MITTE);

      render(<HomeScreen navigation={{} as any} route={{} as any} />);

      await flushPromises();
      
      expect(mockLearningService.getLearningsForSeason).toHaveBeenCalledWith(
        expect.any(Array),
        Zeitraum.SOMMER_MITTE
      );
    });
  });
});
