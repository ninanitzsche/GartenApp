# Gartenplaner App - Tech Stack

## Overview
React Native/Expo TypeScript app for permaculture garden planning with Supabase backend.

## Frontend

### Core Framework
- **React Native:** 0.83.2 (latest)
- **React:** 19.2.0
- **Expo:** ~55.0.4
- **TypeScript:** ~5.9.2 (strict mode)

### Navigation
- **@react-navigation/native:** ^7.1.31
- **@react-navigation/native-stack:** ^7.14.2
- **@react-navigation/bottom-tabs:** ^7.15.3
- **react-native-screens:** ~4.23.0
- **react-native-safe-area-context:** ~5.6.2

### UI/UX
- **@expo/vector-icons:** ^15.0.2 (MaterialIcons)
- **expo-status-bar:** ~55.0.4
- **Custom theme:** `src/theme/colors.ts`

### Storage
- **@react-native-async-storage/async-storage:** 2.2.0
- **expo-secure-store:** ^55.0.8

### Media
- **expo-image-picker:** ^55.0.10
- **expo-image-manipulator:** ^55.0.9

### Web Support
- **react-dom:** 19.2.0
- **react-native-web:** ^0.21.0

## Backend

### Database & Auth
- **@supabase/supabase-js:** ^2.98.0
- **react-native-url-polyfill:** ^3.0.0

### Environment
- **dotenv:** ^17.3.1

## Development & Build

### Babel
- **@babel/preset-env:** ^7.29.0
- **@babel/preset-react:** ^7.28.5
- **@babel/preset-typescript:** ^7.28.5
- **@babel/plugin-syntax-jsx:** ^7.28.6
- **@babel/plugin-syntax-typescript:** ^7.28.6
- **babel-jest:** ^29.7.0

### Testing
- **jest:** ^29.7.0
- **jest-environment-jsdom:** ^29.7.0
- **@jest/globals:** ^29.7.0
- **@testing-library/jest-dom:** ^6.1.5
- **@testing-library/react:** ^13.4.0
- **@testing-library/react-native:** ^11.5.0
- **@types/jest:** ^29.5.11

### Types
- **@types/react:** ~19.2.2

### Build Tools
- **sharp:** ^0.33.0 (image processing)

## Project Configuration
- **tsconfig.json:** Extends `expo/tsconfig.base` with strict mode
- **babel.config.js:** Standard Expo config
- **jest.config.js:** Node environment for service testing
- **app.json:** Expo config (name, icon, splash, platform settings)
- **expo.config.js:** Additional Expo configuration
