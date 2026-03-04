# src/theme/ - Design System

**Last Updated:** 2026-03-04
**Status:** Production code
**Purpose:** Centralized design tokens (colors, spacing, typography)

---

## 🎯 What is a Theme?

A **theme** is a collection of design constants:
- **Colors** - Brand colors, semantic colors (error, success, etc.)
- **Spacing** - Padding, margin values (8px, 16px, 24px, etc.)
- **Typography** - Font sizes, weights, line heights
- **Shadows** - Drop shadows for depth
- **Borders** - Border radius, border widths

**Benefits:**
- Consistency across app
- Easy to change (single place)
- Accessible design system
- DRY principle (don't repeat values)

---

## 📋 Theme Structure

```typescript
// src/theme/index.ts

export const colors = {
  // Primary brand colors
  primary: '#4CAF50',
  primaryLight: '#A5D6A7',
  primaryDark: '#2E7D32',

  // Semantic colors
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',

  // Neutral colors
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#BDBDBD',
  },
  border: '#E0E0E0',
  divider: '#EEEEEE',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    bold: '600' as const,
    heavy: '700' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
};
```

---

## 🎨 Using Theme in Components

### In Styles

```typescript
import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';

const styles = StyleSheet.create({
  container: {
    padding: spacing.md, // 16
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  title: {
    fontSize: typography.sizes.lg, // 18
    fontWeight: typography.weights.bold, // '600'
    color: colors.text.primary,
    marginBottom: spacing.sm, // 8
    lineHeight: typography.lineHeights.tight,
  },
  subtitle: {
    fontSize: typography.sizes.md, // 16
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.lg, // 24
    ...shadows.md, // Apply shadow
  },
  error: {
    color: colors.error,
  },
  success: {
    color: colors.success,
  },
});
```

### Inline Styles (Avoid, but when needed)

```typescript
<View style={{ padding: spacing.md, backgroundColor: colors.background }}>
  <Text style={{ fontSize: typography.sizes.lg, color: colors.text.primary }}>
    Title
  </Text>
</View>
```

---

## 📚 Design Token Categories

### Colors

```typescript
export const colors = {
  // Brand (use sparingly)
  primary: '#4CAF50',
  secondary: '#2196F3',

  // Semantic (use in most cases)
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',

  // Neutral (backgrounds, text)
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: {
    primary: '#212121',     // Main text
    secondary: '#757575',   // Muted text
    disabled: '#BDBDBD',    // Disabled state
    inverse: '#FFFFFF',     // Text on dark background
  },

  // Structural (borders, dividers)
  border: '#E0E0E0',
  divider: '#EEEEEE',
};
```

**Usage guide:**
```typescript
// Text colors
<Text style={{ color: colors.text.primary }}>Main text</Text>
<Text style={{ color: colors.text.secondary }}>Muted text</Text>

// Status colors
<Text style={{ color: colors.success }}>Success!</Text>
<Text style={{ color: colors.error }}>Error!</Text>

// Backgrounds
<View style={{ backgroundColor: colors.background }}>Content</View>
<View style={{ backgroundColor: colors.surface }}>Card</View>
```

### Spacing

```typescript
export const spacing = {
  xs: 4,    // Tight spacing
  sm: 8,    // Small gap
  md: 16,   // Medium (standard)
  lg: 24,   // Large
  xl: 32,   // Extra large
  xxl: 48,  // 2x large
};
```

**Usage:**
```typescript
<View style={{ padding: spacing.md, marginBottom: spacing.lg }}>
  <Text style={{ marginTop: spacing.sm }}>Content</Text>
</View>
```

**Prefer:** `md` (16px) as default, adjust up/down based on context

### Typography

```typescript
export const typography = {
  // Font sizes (pixels)
  sizes: {
    xs: 12,   // Small labels
    sm: 14,   // Helper text
    md: 16,   // Body text (default)
    lg: 18,   // Emphasis text
    xl: 20,   // Section titles
    xxl: 24,  // Page titles
  },

  // Font weights
  weights: {
    regular: '400',  // Normal text
    medium: '500',   // Slightly bold
    bold: '600',     // Bold text
    heavy: '700',    // Very bold
  },

  // Line heights (multiplier)
  lineHeights: {
    tight: 1.2,      // 1.2x font size
    normal: 1.5,     // 1.5x font size (default)
    relaxed: 1.75,   // 1.75x font size
  },
};
```

**Usage:**
```typescript
// Headings
<Text style={{ fontSize: sizes.xxl, fontWeight: weights.bold }}>
  Page Title
</Text>

// Body
<Text style={{ fontSize: sizes.md, fontWeight: weights.regular }}>
  Body text
</Text>

// Labels
<Text style={{ fontSize: sizes.sm, fontWeight: weights.medium }}>
  Label
</Text>
```

### Border Radius

```typescript
export const radius = {
  sm: 4,      // Subtle curves
  md: 8,      // Standard
  lg: 12,     // Rounded buttons
  xl: 16,     // Large cards
  full: 9999, // Circles
};
```

**Usage:**
```typescript
<View style={{ borderRadius: radius.md }}>Card</View>
<View style={{ borderRadius: radius.full }}>Circle</View>
```

### Shadows

```typescript
export const shadows = {
  sm: { /* 2px elevation */ },
  md: { /* 5px elevation */ },
  lg: { /* 8px elevation */ },
};
```

**Usage:**
```typescript
<View style={{ ...shadows.md, borderRadius: 8 }}>
  Card with shadow
</View>
```

---

## 🎨 Component Theme Integration

### Button Component

```typescript
import { colors, spacing, typography, radius } from '../theme';

type ButtonProps = {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
  onPress: () => void;
};

export function Button({ title, variant = 'primary', onPress }: ButtonProps) {
  const buttonColors = {
    primary: colors.primary,
    secondary: colors.surface,
    danger: colors.error,
  };

  const textColors = {
    primary: colors.text.inverse,
    secondary: colors.text.primary,
    danger: colors.text.inverse,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: buttonColors[variant],
        padding: spacing.md,
        borderRadius: radius.md,
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          fontSize: typography.sizes.md,
          fontWeight: typography.weights.bold,
          color: textColors[variant],
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
```

---

## 🌙 Dark Mode (Optional)

**Extended theme with dark mode:**

```typescript
type ThemeMode = 'light' | 'dark';

export const themes = {
  light: {
    colors: {
      background: '#FFFFFF',
      text: '#212121',
      primary: '#4CAF50',
    },
  },
  dark: {
    colors: {
      background: '#121212',
      text: '#FFFFFF',
      primary: '#66BB6A',
    },
  },
};
```

**Using with context:**

```typescript
const ThemeContext = createContext<ThemeMode>('light');

export function useTheme() {
  const mode = useContext(ThemeContext);
  return themes[mode];
}
```

---

## 📏 Responsive Design

**Scale values based on screen size (optional):**

```typescript
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('screen').width;

export const responsive = {
  isMobile: screenWidth < 768,
  isTablet: screenWidth >= 768 && screenWidth < 1024,
  isLarge: screenWidth >= 1024,
};

// Usage
<Text style={{ fontSize: responsive.isMobile ? sizes.md : sizes.lg }}>
  Responsive text
</Text>
```

---

## ✅ Best Practices

### 1. Use Theme Consistently
```typescript
// ✅ GOOD: All colors from theme
<View style={{ backgroundColor: colors.surface }}>
  <Text style={{ color: colors.text.primary }}>Text</Text>
</View>

// ❌ BAD: Hardcoded colors
<View style={{ backgroundColor: '#F5F5F5' }}>
  <Text style={{ color: '#212121' }}>Text</Text>
</View>
```

### 2. Create Compound Styles

```typescript
// ✅ GOOD: Reusable style combinations
const baseCardStyle = {
  backgroundColor: colors.surface,
  borderRadius: radius.md,
  padding: spacing.lg,
  ...shadows.md,
};

<View style={baseCardStyle}>Card</View>
```

### 3. Don't Over-Tokenize
```typescript
// ❌ Too much
export const sizes = { h1: 24, h2: 22, h3: 20, ... };

// ✅ Simpler
export const typography = { sizes: { xs: 12, sm: 14, md: 16, lg: 18, xl: 20, xxl: 24 } };
```

---

## 🔗 Related Files

- **Components:** `src/components/` - Use theme in styles
- **Screens:** `src/screens/` - Use theme for consistency
- **Utils:** `src/utils/` - Theme utilities if needed

---

## 📊 Theme Metrics

- **Colors:** 3-5 semantic colors (success, error, warning, info)
- **Spacing scale:** 6-8 values (xs, sm, md, lg, xl, xxl)
- **Typography levels:** 6 sizes (xs-xxl)
- **Border radius:** 4-5 values (sm-full)
- **Shadows:** 2-3 levels (sm, md, lg)

---

**Purpose:** Centralized design system
**Owner:** Design/Development team
**Usage:** Single source of truth for visual design

