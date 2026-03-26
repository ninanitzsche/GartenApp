/**
 * ErrorBoundary Component
 * Catches React errors and displays user-friendly messages
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors2026, Spacing2026, Typography2026, Radius2026 } from '../theme/designSystemV2';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container} accessibilityRole="alert">
          <View style={styles.content}>
            <Text style={styles.title}>Etwas ist schief gelaufen</Text>
            <Text style={styles.message}>
              Entschuldigung, es ist ein unerwarteter Fehler aufgetreten. Bitte versuche es erneut.
            </Text>
            <Pressable
              style={styles.button}
              onPress={this.handleRetry}
              accessibilityRole="button"
              accessibilityLabel="Erneut versuchen"
            >
              <Text style={styles.buttonText}>Erneut versuchen</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors2026.bg,
    padding: Spacing2026.xl,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  title: {
    fontSize: Typography2026.headline.fontSize,
    fontWeight: '700',
    color: Colors2026.text,
    marginBottom: Spacing2026.md,
    textAlign: 'center',
  },
  message: {
    fontSize: Typography2026.body.fontSize,
    color: Colors2026.textMuted,
    textAlign: 'center',
    marginBottom: Spacing2026.xl,
    lineHeight: Typography2026.body.lineHeight,
  },
  button: {
    backgroundColor: Colors2026.primary,
    paddingVertical: Spacing2026.md,
    paddingHorizontal: Spacing2026.xxl,
    borderRadius: Radius2026.md,
    minWidth: 160,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: Typography2026.body.fontSize,
    fontWeight: '600',
  },
});
