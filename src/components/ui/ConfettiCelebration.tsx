/**
 * ConfettiCelebration Component
 * Animated confetti burst using Reanimated particles
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = ['#2D4739', '#006064', '#C67B4A', '#8D5B3E', '#4A6FA5', '#E87A3D'];
const PARTICLE_COUNT = 20;

interface Particle {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
}

interface ConfettiCelebrationProps {
  visible: boolean;
  onComplete?: () => void;
}

function ParticleView({
  particle,
  onComplete,
}: {
  particle: Particle;
  onComplete?: () => void;
}) {
  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    const xEnd = (Math.random() - 0.5) * SCREEN_WIDTH * 0.8;
    const duration = 1200 + Math.random() * 800;

    translateY.value = withDelay(
      particle.delay,
      withTiming(SCREEN_HEIGHT + 50, {
        duration,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }, () => {
        if (onComplete) runOnJS(onComplete)();
      })
    );

    translateX.value = withDelay(
      particle.delay,
      withTiming(xEnd, {
        duration,
        easing: Easing.out(Easing.quad),
      })
    );

    opacity.value = withDelay(
      particle.delay + duration * 0.6,
      withTiming(0, { duration: duration * 0.4 })
    );

    rotation.value = withDelay(
      particle.delay,
      withTiming((Math.random() - 0.5) * 720, {
        duration,
        easing: Easing.linear,
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        animatedStyle,
        {
          left: particle.x,
          width: particle.size,
          height: particle.size * (0.4 + Math.random() * 0.6),
          backgroundColor: particle.color,
          borderRadius: particle.size / 2,
        },
      ]}
    />
  );
}

const SCREEN_HEIGHT = 800;

export default function ConfettiCelebration({
  visible,
  onComplete,
}: ConfettiCelebrationProps) {
  const [particles, setParticles] = React.useState<Particle[]>([]);

  useEffect(() => {
    if (visible) {
      const newParticles: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        x: SCREEN_WIDTH / 2 + (Math.random() - 0.5) * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 4 + Math.random() * 8,
        delay: Math.random() * 200,
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible || particles.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((p) => (
        <ParticleView key={p.id} particle={p} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  particle: {
    position: 'absolute',
    top: -20,
  },
});
