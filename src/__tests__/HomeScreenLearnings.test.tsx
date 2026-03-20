/**
 * HomeScreen Learnings Section Tests
 */

import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
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
    content: 'Gießen Sie Tomatenpflanzen immer von unten.',
    related_plants: ['Tomate'],
    related_categories: ['pflege'],
    valid_for_zeitraeume: ['sommer_frueh'],
    relevance_score: 8,
    created_at: '2024-01-15',
    dismissed: false,
  },
  {
    id: '2',
    user_id: 'user1',
    source_type: 'manual',
    title: 'Frühbeet vorbereiten',
    content: 'Im März das Frühbeet reinigen.',
    related_plants: [],
    related_categories: [],
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
  useFocusEffect: jest.fn((callback) => {
    callback();
  }),
  useNavigation: () => ({ navigate: jest.fn() }),
  useRoute: () => ({ params: {} }),
  createNavigationContainerRef: () => ({ current: null }),
  NavigationContainer: ({ children }: any) => children,
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

describe('HomeScreen Learnings Section', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAktuelleSaison.mockReturnValue(Zeitraum.FRUEHJAHR_FRUH);
    mockGetJahreszeit.mockReturnValue(Jahreszeit.FRUEHJAHR);
    mockGetJahreszeitLabel.mockReturnValue('Frühjahr');
  });

  describe('Learnings section rendering', () => {
    it('renders seasonal label correctly', async () => {
      mockLearningService.getLearningsForSeason.mockResolvedValue(mockLearnings);
      
      let container: any;
      await act(async () => {
        container = render(<HomeScreen navigation={{} as any} route={{} as any} />);
      });
      
      expect(container.getByText('Tipps für Frühjahr')).toBeTruthy();
    });

    it('renders learning titles when learnings exist', async () => {
      mockLearningService.getLearningsForSeason.mockResolvedValue(mockLearnings);
      
      let container: any;
      await act(async () => {
        container = render(<HomeScreen navigation={{} as any} route={{} as any} />);
      });
      
      expect(container.getByText('Tomaten nicht von oben gießen')).toBeTruthy();
      expect(container.getByText('Frühbeet vorbereiten')).toBeTruthy();
    });

    it('renders learning content', async () => {
      mockLearningService.getLearningsForSeason.mockResolvedValue([mockLearnings[0]]);
      
      let container: any;
      await act(async () => {
        container = render(<HomeScreen navigation={{} as any} route={{} as any} />);
      });
      
      expect(container.getByText(/Gießen Sie Tomatenpflanzen/)).toBeTruthy();
    });

    it('renders source name when available', async () => {
      mockLearningService.getLearningsForSeason.mockResolvedValue([mockLearnings[0]]);
      
      let container: any;
      await act(async () => {
        container = render(<HomeScreen navigation={{} as any} route={{} as any} />);
      });
      
      expect(container.getByText('Garten Tipps')).toBeTruthy();
    });

    it('shows rated state when learning has user_rating', async () => {
      mockLearningService.getLearningsForSeason.mockResolvedValue([mockLearnings[1]]);
      
      let container: any;
      await act(async () => {
        container = render(<HomeScreen navigation={{} as any} route={{} as any} />);
      });
      
      expect(container.getByText('Als hilfreich markiert')).toBeTruthy();
    });

    it('renders dismiss button with correct accessibility label', async () => {
      mockLearningService.getLearningsForSeason.mockResolvedValue([mockLearnings[0]]);
      
      let container: any;
      await act(async () => {
        container = render(<HomeScreen navigation={{} as any} route={{} as any} />);
      });
      
      expect(container.getByLabelText('Tipp verwerfen')).toBeTruthy();
    });

    it('renders helpful button with correct accessibility label', async () => {
      mockLearningService.getLearningsForSeason.mockResolvedValue([mockLearnings[0]]);
      
      let container: any;
      await act(async () => {
        container = render(<HomeScreen navigation={{} as any} route={{} as any} />);
      });
      
      expect(container.getByLabelText('Als hilfreich bewerten')).toBeTruthy();
    });

    it('renders not helpful button with correct accessibility label', async () => {
      mockLearningService.getLearningsForSeason.mockResolvedValue([mockLearnings[0]]);
      
      let container: any;
      await act(async () => {
        container = render(<HomeScreen navigation={{} as any} route={{} as any} />);
      });
      
      expect(container.getByLabelText('Als nicht hilfreich bewerten')).toBeTruthy();
    });

    it('renders all learning cards for multiple learnings', async () => {
      mockLearningService.getLearningsForSeason.mockResolvedValue(mockLearnings);
      
      let container: any;
      await act(async () => {
        container = render(<HomeScreen navigation={{} as any} route={{} as any} />);
      });
      
      expect(container.getByText('Tomaten nicht von oben gießen')).toBeTruthy();
      expect(container.getByText('Frühbeet vorbereiten')).toBeTruthy();
    });
  });

  describe('Seasonal label display', () => {
    it('displays correct seasonal label based on getJahreszeitLabel', async () => {
      mockLearningService.getLearningsForSeason.mockResolvedValue([mockLearnings[0]]);
      mockGetJahreszeitLabel.mockReturnValue('Sommer');
      
      let container: any;
      await act(async () => {
        container = render(<HomeScreen navigation={{} as any} route={{} as any} />);
      });
      
      expect(container.getByText('Tipps für Sommer')).toBeTruthy();
    });

    it('displays Herbst label correctly', async () => {
      mockLearningService.getLearningsForSeason.mockResolvedValue([mockLearnings[0]]);
      mockGetJahreszeitLabel.mockReturnValue('Herbst');
      
      let container: any;
      await act(async () => {
        container = render(<HomeScreen navigation={{} as any} route={{} as any} />);
      });
      
      expect(container.getByText('Tipps für Herbst')).toBeTruthy();
    });

    it('displays Winter label correctly', async () => {
      mockLearningService.getLearningsForSeason.mockResolvedValue([mockLearnings[0]]);
      mockGetJahreszeitLabel.mockReturnValue('Winter');
      
      let container: any;
      await act(async () => {
        container = render(<HomeScreen navigation={{} as any} route={{} as any} />);
      });
      
      expect(container.getByText('Tipps für Winter')).toBeTruthy();
    });
  });
});
