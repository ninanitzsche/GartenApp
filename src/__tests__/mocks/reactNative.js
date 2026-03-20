/**
 * Mock for React Native
 * Provides minimal implementation for testing components
 */

const React = require('react');

const createMockComponent = (name) => {
  return React.forwardRef(({ children, testID, ...props }, ref) => {
    return React.createElement(name, { testID, ref, ...props }, children);
  });
};

const View = createMockComponent('View');
const Text = createMockComponent('Text');
const TouchableOpacity = createMockComponent('TouchableOpacity');
const Pressable = createMockComponent('Pressable');
const Image = createMockComponent('Image');
const ScrollView = createMockComponent('ScrollView');
const FlatList = createMockComponent('FlatList');
const TextInput = createMockComponent('TextInput');
const Switch = createMockComponent('Switch');
const KeyboardAvoidingView = createMockComponent('KeyboardAvoidingView');
const SafeAreaView = createMockComponent('SafeAreaView');
const ActivityIndicator = createMockComponent('ActivityIndicator');
const Modal = createMockComponent('Modal');

const StyleSheet = {
  create: (styles) => styles,
  flatten: (style) => {
    if (Array.isArray(style)) {
      return style.reduce((acc, s) => ({ ...acc, ...s }), {});
    }
    return style || {};
  },
};

const Dimensions = {
  get: () => ({ width: 375, height: 812 }),
};

const Platform = {
  OS: 'ios',
  select: (obj) => obj.ios || obj.default,
};

const BackHandler = {
  exitApp: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

const PixelRatio = {
  get: () => 2,
  getFontScale: () => 1,
};

module.exports = {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Image,
  ScrollView,
  FlatList,
  TextInput,
  Switch,
  KeyboardAvoidingView,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  StyleSheet,
  Dimensions,
  Platform,
  BackHandler,
  PixelRatio,
};
