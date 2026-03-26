/**
 * AnimatedButton Component
 * 2026 Spring Animation Button
 */

import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Colors2026, Radius2026, Spacing2026, Typography2026 } from '../../theme/designSystemV2';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export default function AnimatedButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  disabled = false,
  fullWidth = false,
  style,
  testID,
  accessibilityLabel,
  accessibilityHint,
}: AnimatedButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 20, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 200 });
  };

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: Colors2026.primary,
          },
          text: {
            color: '#FFFFFF',
          },
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: Colors2026.glass.tint,
            borderWidth: 1,
            borderColor: 'rgba(45,157,79,0.3)',
          },
          text: {
            color: Colors2026.primary,
          },
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          text: {
            color: Colors2026.primary,
          },
        };
      case 'danger':
        return {
          container: {
            backgroundColor: Colors2026.status.error,
          },
          text: {
            color: '#FFFFFF',
          },
        };
      default:
        return {
          container: { backgroundColor: Colors2026.primary },
          text: { color: '#FFFFFF' },
        };
    }
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          container: {
            paddingHorizontal: Spacing2026.md,
            paddingVertical: Spacing2026.sm,
            borderRadius: Radius2026.sm,
          },
          text: {
            fontSize: Typography2026.caption.fontSize,
          },
        };
      case 'md':
        return {
          container: {
            paddingHorizontal: Spacing2026.xl,
            paddingVertical: Spacing2026.md,
            borderRadius: Radius2026.md,
          },
          text: {
            fontSize: Typography2026.body.fontSize,
          },
        };
      case 'lg':
        return {
          container: {
            paddingHorizontal: Spacing2026.xxl,
            paddingVertical: Spacing2026.lg,
            borderRadius: Radius2026.lg,
          },
          text: {
            fontSize: Typography2026.title.fontSize,
          },
        };
      default:
        return {
          container: { paddingHorizontal: Spacing2026.xl, paddingVertical: Spacing2026.md },
          text: { fontSize: Typography2026.body.fontSize },
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <AnimatedPressable
      style={[
        styles.container,
        variantStyles.container,
        sizeStyles.container,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        animatedStyle,
        style,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      testID={testID}
    >
      {icon && <>{icon}</>}
      <Text
        style={[
          styles.text,
          variantStyles.text,
          sizeStyles.text,
          icon !== undefined ? styles.textWithIcon : undefined,
        ]}
      >
        {title}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing2026.sm,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  textWithIcon: {
    marginLeft: Spacing2026.xs,
  },
});
