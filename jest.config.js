/**
 * Jest Configuration for React Native Services
 * Configured for testing services and utilities
 */

module.exports = {
  // Use node environment for service/utility testing
  testEnvironment: 'node',

  // Transform ignore patterns for React Native
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@testing-library|expo|@expo|@expo/vector-icons)/)',
  ],

  // Module name mapper for handling assets and non-JS imports
  moduleNameMapper: {
    '^react-native$': '<rootDir>/src/__tests__/mocks/reactNative.js',
    '@expo/vector-icons': '<rootDir>/src/__tests__/mocks/expoVectorIcons.js',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/src/__tests__/mocks/fileMock.ts',
    '\\.(css|less|scss|sass)$': '<rootDir>/src/__tests__/mocks/styleMock.ts',
  },

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],

  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
    '**/?(*.)+(spec|test).ts?(x)',
  ],

  // Transform files
  transform: {
    '^.+\\.(ts|tsx)$': ['babel-jest', { cwd: __dirname }],
  },

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Coverage configuration
  collectCoverageFrom: [
    'src/services/**/*.{ts,tsx}',
    'src/utils/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70,
    },
    './src/services/': {
      statements: 79,
      branches: 70,
      functions: 85,
      lines: 79,
    },
  },

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.expo/',
  ],

  // Coverage ignore patterns
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/.expo/',
  ],

  // Verbose output
  verbose: true,

  // Clear mocks after each test
  clearMocks: true,

  // Timeout for tests (in ms)
  testTimeout: 10000,

  // Skip React Native setup
  unmockedModulePathPatterns: [],

  // Reset modules between tests
  resetModules: false,
};
