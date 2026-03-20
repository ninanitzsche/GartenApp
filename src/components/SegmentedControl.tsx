import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../theme/colors';

interface SegmentedControlProps {
  segments: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  icons?: string[];
}

export default function SegmentedControl({
  segments,
  selectedIndex,
  onSelect,
  icons,
}: SegmentedControlProps) {
  return (
    <View style={styles.container}>
      {segments.map((segment, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.segment, index === selectedIndex && styles.selected]}
          onPress={() => onSelect(index)}
          accessibilityRole="tab"
          accessibilityState={{ selected: index === selectedIndex }}
        >
          {icons && icons[index] && (
            <MaterialIcons
              name={icons[index] as any}
              size={16}
              color={index === selectedIndex ? Colors.primary : Colors.textLight}
              style={styles.icon}
            />
          )}
          <Text style={[styles.text, index === selectedIndex && styles.selectedText]}>
            {segment}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 6,
  },
  selected: {
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  icon: {
    marginRight: 2,
  },
  text: {
    fontSize: 13,
    color: Colors.textLight,
    fontWeight: '500',
  },
  selectedText: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
