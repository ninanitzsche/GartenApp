/**
 * GlassInput Component
 * 2026 Glassmorphism Input Field
 */

import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Colors2026, Radius2026, Spacing2026, Typography2026, Shadows2026 } from '../../theme/designSystemV2';

interface GlassInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  multiline?: boolean;
  numberOfLines?: number;
  disabled?: boolean;
  testID?: string;
}

export default function GlassInput({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  icon,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  disabled = false,
  testID,
}: GlassInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const borderColor = useSharedValue('rgba(255,255,255,0.3)');

  const handleFocus = () => {
    setIsFocused(true);
    borderColor.value = withTiming(Colors2026.primary, { duration: 200 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    borderColor.value = withTiming('rgba(255,255,255,0.3)', { duration: 200 });
  };

  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: borderColor.value,
  }));

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Animated.View
        style={[
          styles.inputContainer,
          animatedBorderStyle,
          isFocused && styles.focused,
          error && styles.error,
          disabled && styles.disabled,
        ]}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          style={[
            styles.input,
            icon !== undefined && styles.inputWithIcon,
            multiline && styles.multiline,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors2026.textMuted}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          testID={testID}
        />
      </Animated.View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing2026.md,
  },
  label: {
    fontSize: Typography2026.caption.fontSize,
    fontWeight: '600',
    color: Colors2026.textSecondary,
    marginBottom: Spacing2026.xs,
    letterSpacing: -0.2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors2026.glass.medium,
    borderRadius: Radius2026.md,
    borderWidth: 1,
    overflow: 'hidden',
    ...Shadows2026.sm,
  },
  focused: {
    borderColor: Colors2026.primary,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  error: {
    borderColor: Colors2026.status.error,
  },
  disabled: {
    opacity: 0.5,
  },
  iconContainer: {
    paddingLeft: Spacing2026.md,
    paddingRight: Spacing2026.sm,
  },
  input: {
    flex: 1,
    paddingHorizontal: Spacing2026.lg,
    paddingVertical: Spacing2026.md,
    fontSize: Typography2026.body.fontSize,
    fontWeight: '500',
    color: Colors2026.text,
  },
  inputWithIcon: {
    paddingLeft: 0,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: Typography2026.caption.fontSize,
    color: Colors2026.status.error,
    marginTop: Spacing2026.xs,
    marginLeft: Spacing2026.xs,
  },
});
