/**
 * Mock for react-native-reanimated
 */
const FadeIn = {
  duration: jest.fn().mockReturnValue({})
};

const FadeOut = {
  duration: jest.fn().mockReturnValue({})
};

module.exports = {
  default: {
    createAnimatedComponent: (Component) => Component,
    View: 'Animated.View',
    Text: 'Animated.Text',
    ScrollView: 'Animated.ScrollView',
    FadeIn,
    FadeOut,
  },
  createAnimatedComponent: (Component) => Component,
  useSharedValue: jest.fn(() => ({ value: 0 })),
  useAnimatedStyle: jest.fn(() => ({})),
  withSpring: jest.fn(),
  withTiming: jest.fn(),
  withDelay: jest.fn(),
  withSequence: jest.fn(),
  interpolate: jest.fn(),
  Extrapolate: { CLAMP: 'clamp' },
  View: 'Animated.View',
  Text: 'Animated.Text',
  ScrollView: 'Animated.ScrollView',
  FadeIn,
  FadeOut,
};
