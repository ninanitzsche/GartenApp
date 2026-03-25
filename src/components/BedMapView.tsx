/**
 * BedMapView Component
 * Responsive grid of bed cards
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  Pressable,
  Image,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Sprout, Plus, ChevronRight, Flower2 } from 'lucide-react-native';
import { Bed } from '../types/bed';
import { Colors2026, Spacing2026, Radius2026, Typography2026, Shadows2026 } from '../theme/designSystemV2';

interface BedWithPlantCount extends Bed {
  plantCount?: number;
}

interface BedMapViewProps {
  beds: BedWithPlantCount[];
  onBedPress: (bedId: string) => void;
  onAddBedPress?: () => void;
  style?: ViewStyle;
}

const DEFAULT_COLORS = ['#4CAF50', '#8D6E63', '#2196F3', '#FF9800', '#9C27B0', '#E91E63'];

function getBedColor(bed: Bed, index: number): string {
  return bed.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
}

function getBedEmoji(index: number): string {
  const emojis = ['🌿', '🌻', '🥕', '🍅', '🌶️', '🫑', '🥒', '🍆', '🥬', '🌱'];
  return emojis[index % emojis.length];
}

export default function BedMapView({
  beds,
  onBedPress,
  onAddBedPress,
  style,
}: BedMapViewProps) {
  if (beds.length === 0) {
    return (
      <View style={[styles.emptyContainer, style]}>
        <View style={styles.emptyCard}>
          <Flower2 size={40} color={Colors2026.primary} />
          <Text style={styles.emptyTitle}>Noch keine Beete</Text>
          <Text style={styles.emptySubtitle}>Erstelle dein erstes Beet</Text>
          {onAddBedPress && (
            <Pressable style={styles.emptyAddButton} onPress={onAddBedPress}>
              <Plus size={20} color="#fff" />
              <Text style={styles.emptyAddText}>Beet hinzufügen</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.grid, style]}>
      {beds.map((bed, index) => {
        const color = getBedColor(bed, index);
        const emoji = getBedEmoji(index);
        const plantCount = bed.plantCount || 0;

        return (
          <Animated.View
            key={bed.id}
            entering={FadeIn.delay(index * 60).duration(300)}
            style={styles.gridItem}
          >
            <Pressable
              style={styles.card}
              onPress={() => onBedPress(bed.id)}
            >
              {/* Header: Cover Photo or Colored Background */}
              <View style={[styles.cardHeader, { backgroundColor: color }]}>
                {bed.cover_photo_url ? (
                  <Image
                    source={{ uri: bed.cover_photo_url }}
                    style={StyleSheet.absoluteFillObject}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={styles.emoji}>{emoji}</Text>
                )}
                <View style={styles.cardHeaderOverlay}>
                  <Text style={styles.bedName} numberOfLines={1}>{bed.name}</Text>
                </View>
              </View>

              {/* Card Body */}
              <View style={styles.cardBody}>
                {plantCount > 0 ? (
                  <View style={styles.plantBadge}>
                    <Sprout size={13} color={Colors2026.primary} />
                    <Text style={styles.plantCount}>
                      {plantCount}x
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.emptyBedText}>Leer</Text>
                )}

                <View style={styles.cardFooter}>
                  <ChevronRight size={14} color={Colors2026.textMuted} />
                </View>
              </View>
            </Pressable>
          </Animated.View>
        );
      })}

      {/* Add Card */}
      {onAddBedPress && (
        <Animated.View
          entering={FadeIn.delay(beds.length * 60).duration(300)}
          style={styles.gridItem}
        >
          <Pressable style={styles.addCard} onPress={onAddBedPress}>
            <View style={styles.addIconContainer}>
              <Plus size={24} color={Colors2026.primary} />
            </View>
            <Text style={styles.addText}>Hinzufügen</Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing2026.md,
    paddingHorizontal: Spacing2026.xl,
  },
  gridItem: {
    width: '47%',
  },
  card: {
    borderRadius: Radius2026.lg,
    backgroundColor: Colors2026.surface,
    overflow: 'hidden',
    ...Shadows2026.md,
  },
  cardHeader: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  emoji: {
    fontSize: 28,
  },
  cardHeaderOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing2026.sm,
    paddingVertical: Spacing2026.xs,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  bedName: {
    fontSize: Typography2026.caption.fontSize,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.2,
  },
  cardBody: {
    padding: Spacing2026.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  plantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors2026.glass.tint,
    paddingHorizontal: Spacing2026.sm,
    paddingVertical: 2,
    borderRadius: Radius2026.round,
  },
  plantCount: {
    fontSize: Typography2026.small.fontSize,
    fontWeight: '600',
    color: Colors2026.primary,
  },
  emptyBedText: {
    fontSize: Typography2026.small.fontSize,
    color: Colors2026.textMuted,
    fontStyle: 'italic',
  },
  cardFooter: {
    alignItems: 'flex-end',
  },
  addCard: {
    height: 140,
    borderRadius: Radius2026.lg,
    backgroundColor: Colors2026.glass.light,
    borderWidth: 2,
    borderColor: Colors2026.glass.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing2026.sm,
  },
  addIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors2026.glass.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addText: {
    fontSize: Typography2026.caption.fontSize,
    fontWeight: '600',
    color: Colors2026.primary,
  },
  emptyContainer: {
    paddingHorizontal: Spacing2026.xl,
  },
  emptyCard: {
    height: 180,
    borderRadius: Radius2026.lg,
    backgroundColor: Colors2026.glass.light,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing2026.sm,
    ...Shadows2026.md,
  },
  emptyTitle: {
    fontSize: Typography2026.title.fontSize,
    fontWeight: '700',
    color: Colors2026.text,
  },
  emptySubtitle: {
    fontSize: Typography2026.caption.fontSize,
    color: Colors2026.textMuted,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing2026.xs,
    backgroundColor: Colors2026.primary,
    paddingHorizontal: Spacing2026.lg,
    paddingVertical: Spacing2026.sm,
    borderRadius: Radius2026.round,
    marginTop: Spacing2026.sm,
  },
  emptyAddText: {
    fontSize: Typography2026.caption.fontSize,
    fontWeight: '600',
    color: '#fff',
  },
});
