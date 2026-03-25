/**
 * SectionHeader Component
 * 2026 Animated Section Header
 */

import React from 'react';
import { Text, View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeIn,
  FadeInRight,
} from 'react-native-reanimated';
import { Colors2026, Spacing2026, Typography2026 } from '../../theme/designSystemV2';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  icon?: React.ReactNode;
  animated?: boolean;
  delay?: number;
  testID?: string;
}

export default function SectionHeader({
  title,
  subtitle,
  action,
  icon,
  animated = true,
  delay = 0,
  testID,
}: SectionHeaderProps) {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(-10);

  React.useEffect(() => {
    if (animated) {
      opacity.value = withTiming(1, { duration: 400 });
      translateX.value = withSpring(0, { damping: 15, stiffness: 120 });
    } else {
      opacity.value = 1;
      translateX.value = 0;
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View
      style={[styles.container, animatedStyle]}
      entering={animated ? FadeIn.delay(delay).duration(300) : undefined}
      testID={testID}
    >
      <View style={styles.titleContainer}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      {action && (
        <Pressable onPress={action.onPress} style={styles.actionButton}>
          <Text style={styles.actionText}>{action.label}</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing2026.md,
    paddingHorizontal: Spacing2026.xs,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: Spacing2026.sm,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: Typography2026.title.fontSize,
    fontWeight: '700',
    color: Colors2026.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: Typography2026.caption.fontSize,
    color: Colors2026.textMuted,
    marginTop: 2,
  },
  actionButton: {
    paddingHorizontal: Spacing2026.md,
    paddingVertical: Spacing2026.sm,
  },
  actionText: {
    fontSize: Typography2026.caption.fontSize,
    fontWeight: '600',
    color: Colors2026.primary,
  },
});
