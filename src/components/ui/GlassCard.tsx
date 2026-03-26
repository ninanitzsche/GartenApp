/**
 * GlassCard Component
 * 2026 Glassmorphism Card mit Blur
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Colors2026, Radius2026, Shadows2026, Spacing2026 } from '../../theme/designSystemV2';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GlassCardProps {
  children: React.ReactNode;
  variant?: 'light' | 'medium' | 'tint';
  intensity?: number;
  onPress?: () => void;
  style?: any;
  animated?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

export default function GlassCard({
  children,
  variant = 'light',
  intensity = 40,
  onPress,
  style,
  animated = true,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: GlassCardProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  React.useEffect(() => {
    if (animated) {
      opacity.value = withTiming(1, { duration: 400 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 120 });
    } else {
      opacity.value = 1;
      translateY.value = 0;
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.97, { damping: 20, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1, { damping: 10, stiffness: 200 });
    }
  };

  const getColors = () => {
    switch (variant) {
      case 'light':
        return {
          bg: Colors2026.glass.light,
          border: Colors2026.glass.border,
        };
      case 'medium':
        return {
          bg: Colors2026.glass.medium,
          border: Colors2026.glass.border,
        };
      case 'tint':
        return {
          bg: Colors2026.glass.tint,
          border: 'rgba(45,157,79,0.15)',
        };
      default:
        return {
          bg: Colors2026.glass.light,
          border: Colors2026.glass.border,
        };
    }
  };

  const colors = getColors();

  const Container = onPress ? AnimatedPressable : Animated.View;

  return (
    <Animated.View style={[styles.container, animatedStyle, style]} testID={testID}>
      <Container
        style={[styles.card, { backgroundColor: colors.bg, borderColor: colors.border }]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole={onPress ? 'button' : undefined}
      >
        <BlurView intensity={intensity} style={styles.blur}>
          {children}
        </BlurView>
      </Container>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing2026.md,
  },
  card: {
    borderRadius: Radius2026.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...Shadows2026.glass,
  },
  blur: {
    padding: Spacing2026.lg,
  },
});
