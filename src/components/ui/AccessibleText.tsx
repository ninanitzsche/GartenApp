/**
 * AccessibleText Component
 * Supports font scaling for accessibility (WCAG)
 */

import React from 'react';
import { Text, TextStyle, StyleSheet, Platform } from 'react-native';
import { Colors2026, Typography2026 } from '../../theme/designSystemV2';

interface AccessibleTextProps {
  children: React.ReactNode;
  style?: TextStyle;
  variant?: 'display' | 'headline' | 'title' | 'body' | 'caption' | 'small';
  color?: string;
  numberOfLines?: number;
  accessibilityLabel?: string;
  accessibilityRole?: 'header' | 'text' | 'link';
  testID?: string;
}

const MAX_FONT_SCALE = 2;

export default function AccessibleText({
  children,
  style,
  variant = 'body',
  color,
  numberOfLines,
  accessibilityLabel,
  accessibilityRole,
  testID,
}: AccessibleTextProps) {
  const variantStyle = Typography2026[variant];
  
  const textStyle: TextStyle = {
    ...variantStyle,
    ...(color && { color }),
  };

  return (
    <Text
      style={[styles.base, textStyle, style]}
      maxFontSizeMultiplier={MAX_FONT_SCALE}
      numberOfLines={numberOfLines}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      testID={testID}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    color: Colors2026.text,
  },
});
