import React, { useEffect } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors2026, Spacing2026, Radius2026 } from '../../theme/designSystemV2';
import { HealthCheck } from '../../types/healthCheck';

interface Props {
  healthCheck: HealthCheck;
  index: number;
  onPress: (hc: HealthCheck) => void;
}

const STATUS_COLORS: Record<string, string> = {
  gesund: Colors2026.status.success,
  krank: Colors2026.status.error,
  unsicher: Colors2026.status.warning,
};

export default function HealthCheckCard({ healthCheck, index, onPress }: Props) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.ease }),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + pulse.value * 0.6,
    transform: [{ scale: 0.8 + pulse.value * 0.2 }],
  }));

  const date = new Date(healthCheck.created_at).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const photoUrl = healthCheck.photo?.photo_url;

  return (
    <Animated.View
      entering={FadeIn.delay(index * 100).duration(400)}
      style={styles.cardWrapper}
    >
      <Pressable onPress={() => onPress(healthCheck)} style={styles.card}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.placeholder]} />
        )}

        <Animated.View
          style={[
            styles.statusBadge,
            { backgroundColor: STATUS_COLORS[healthCheck.health_status] },
            pulseStyle,
          ]}
        />

        <View style={styles.dateOverlay}>
          <Text style={styles.dateText}>{date}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    flex: 1,
    margin: Spacing2026.xs,
  },
  card: {
    aspectRatio: 1,
    borderRadius: Radius2026.lg,
    overflow: 'hidden',
    backgroundColor: Colors2026.glass.tint,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    backgroundColor: Colors2026.bg,
  },
  statusBadge: {
    position: 'absolute',
    top: Spacing2026.sm,
    right: Spacing2026.sm,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dateOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing2026.sm,
    paddingVertical: Spacing2026.xs,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  dateText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '500',
  },
});
