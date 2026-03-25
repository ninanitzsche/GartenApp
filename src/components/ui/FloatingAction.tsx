/**
 * FloatingAction Component
 * 2026 FAB with Spring Animation
 */

import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import { Colors2026, Radius2026, Shadows2026 } from '../../theme/designSystemV2';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface FloatingActionProps {
  onPress: () => void;
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  animated?: boolean;
  accessibilityLabel?: string;
  testID?: string;
}

export default function FloatingAction({
  onPress,
  icon,
  variant = 'primary',
  size = 'md',
  disabled = false,
  animated = true,
  accessibilityLabel,
  testID,
}: FloatingActionProps) {
  const scale = useSharedValue(0);
  const pressScale = useSharedValue(1);
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    if (animated) {
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    } else {
      scale.value = 1;
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value * pressScale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const handlePressIn = () => {
    pressScale.value = withSpring(0.9, { damping: 20, stiffness: 300 });
    rotation.value = withTiming(45, { duration: 200 });
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1, { damping: 10, stiffness: 200 });
    rotation.value = withTiming(0, { duration: 200 });
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: Colors2026.primary,
          ...Shadows2026.lg,
        };
      case 'secondary':
        return {
          backgroundColor: Colors2026.glass.tint,
          borderWidth: 1,
          borderColor: 'rgba(45,157,79,0.3)',
          ...Shadows2026.md,
        };
      case 'glass':
        return {
          backgroundColor: Colors2026.glass.medium,
          borderWidth: 1,
          borderColor: Colors2026.glass.border,
          ...Shadows2026.glass,
        };
      default:
        return {
          backgroundColor: Colors2026.primary,
          ...Shadows2026.lg,
        };
    }
  };

  const getSize = () => {
    switch (size) {
      case 'sm':
        return 48;
      case 'md':
        return 56;
      case 'lg':
        return 64;
      default:
        return 56;
    }
  };

  const sizeValue = getSize();

  return (
    <AnimatedPressable
      style={[
        styles.container,
        {
          width: sizeValue,
          height: sizeValue,
          borderRadius: sizeValue / 2,
        },
        getVariantStyles(),
        disabled && styles.disabled,
        animatedStyle,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      entering={animated ? FadeIn.duration(300) : undefined}
    >
      {icon}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  disabled: {
    opacity: 0.5,
  },
});
