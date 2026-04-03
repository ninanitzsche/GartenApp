/**
 * Mock for react-native-reanimated
 */
module.exports = {
  default: {
    createAnimatedComponent: (Component) => Component,
    View: 'Animated.View',
    Text: 'Animated.Text',
    ScrollView: 'Animated.ScrollView',
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
};
