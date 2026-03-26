import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Home, Leaf, Flower2, Menu } from 'lucide-react-native';
import { Colors2026, Spacing2026, TouchTargets2026 } from '../../theme/designSystemV2';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const iconMap: Record<string, React.ComponentType<any>> = {
  Home,
  Plants: Leaf,
  GardenOverview: Flower2,
  More: Menu,
};

const tabLabels: Record<string, string> = {
  Home: 'Startseite',
  Plants: 'Pflanzen',
  GardenOverview: 'Garten',
  More: 'Mehr',
};

export default function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <BlurView 
      intensity={80} 
      style={styles.container}
      accessibilityRole="tablist"
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const Icon = iconMap[route.name] || Home;
        
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const label = tabLabels[route.name] || route.name;
        
        return (
          <Pressable 
            key={route.key} 
            onPress={onPress} 
            style={styles.tab}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected: isFocused }}
          >
            <Icon 
              size={24} 
              color={isFocused ? Colors2026.primary : Colors2026.tab.inactive} 
            />
            {isFocused && <View style={styles.activeDot} />}
          </Pressable>
        );
      })}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingBottom: 20,
    paddingTop: Spacing2026.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing2026.sm,
    minHeight: TouchTargets2026.minimum,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors2026.primary,
    marginTop: 4,
  },
});
