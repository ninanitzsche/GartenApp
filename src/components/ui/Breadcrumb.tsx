/**
 * Breadcrumb Component
 * Navigation breadcrumb for better orientation
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { Colors2026, Spacing2026, Typography2026, TouchTargets2026 } from '../../theme/designSystemV2';

interface BreadcrumbItem {
  label: string;
  onPress?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  testID?: string;
}

export default function Breadcrumb({ items, testID }: BreadcrumbProps) {
  return (
    <View 
      style={styles.container}
      accessibilityLabel="Navigationspfad"
      testID={testID}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <View key={index} style={styles.item}>
            {index > 0 && (
              <ChevronRight 
                size={14} 
                color={Colors2026.textMuted} 
                style={styles.separator}
              />
            )}
            {isLast ? (
              <Text 
                style={styles.current}
                accessibilityRole="text"
                accessibilityLabel={`Aktuelle Seite: ${item.label}`}
              >
                {item.label}
              </Text>
            ) : (
              <Pressable
                onPress={item.onPress}
                style={styles.link}
                accessibilityRole="link"
                accessibilityLabel={`Gehe zu ${item.label}`}
              >
                <Text style={styles.linkText}>{item.label}</Text>
              </Pressable>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing2026.lg,
    paddingVertical: Spacing2026.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  separator: {
    marginHorizontal: Spacing2026.xs,
  },
  link: {
    paddingVertical: Spacing2026.xs,
    paddingHorizontal: Spacing2026.xs,
    minHeight: TouchTargets2026.minimum,
    justifyContent: 'center',
  },
  linkText: {
    fontSize: Typography2026.caption.fontSize,
    color: Colors2026.primary,
    fontWeight: '500',
  },
  current: {
    fontSize: Typography2026.caption.fontSize,
    color: Colors2026.textMuted,
    fontWeight: '500',
    paddingVertical: Spacing2026.xs,
    paddingHorizontal: Spacing2026.xs,
  },
});
