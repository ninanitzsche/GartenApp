import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Colors2026, Spacing2026, Radius2026, Typography2026 } from '../../theme/designSystemV2';
import GlassCard from '../ui/GlassCard';
import { GildeRating } from '../../types/gilde';

interface GildeRatingProps {
  rating?: GildeRating | null;
  onSave: (rating: number, comment?: string) => void;
  readonly?: boolean;
}

export default function GildeRatingComponent({ rating, onSave, readonly = false }: GildeRatingProps) {
  const [selectedRating, setSelectedRating] = useState(rating?.rating || 0);
  const [comment, setComment] = useState(rating?.comment || '');
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = hoverRating || selectedRating;

  const handleStarPress = (star: number) => {
    if (readonly) return;
    setSelectedRating(star);
    onSave(star, comment);
  };

  const handleCommentSave = () => {
    if (selectedRating > 0) {
      onSave(selectedRating, comment);
    }
  };

  return (
    <GlassCard style={styles.container}>
      <Text style={styles.title}>Bewertung</Text>
      
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => handleStarPress(star)}
            onPressIn={() => !readonly && setHoverRating(star)}
            onPressOut={() => setHoverRating(0)}
            disabled={readonly}
          >
            <Text style={[styles.star, displayRating >= star && styles.starFilled]}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {!readonly && (
        <View style={styles.commentContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Kommentar (optional)"
            placeholderTextColor={Colors2026.textMuted}
            value={comment}
            onChangeText={setComment}
            onBlur={handleCommentSave}
            multiline
            numberOfLines={2}
          />
        </View>
      )}

      {readonly && rating?.comment && (
        <Text style={styles.commentText}>{rating.comment}</Text>
      )}

      {rating?.updated_at && (
        <Text style={styles.dateText}>
          Aktualisiert: {new Date(rating.updated_at).toLocaleDateString('de-DE')}
        </Text>
      )}
    </GlassCard>
  );
}

const STAR_COLOR = '#FFB800';

const styles = StyleSheet.create({
  container: {
    padding: Spacing2026.md,
  },
  title: {
    ...Typography2026.caption,
    color: Colors2026.textSecondary,
    marginBottom: Spacing2026.sm,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: Spacing2026.xs,
  },
  star: {
    fontSize: 32,
    color: Colors2026.surface,
  },
  starFilled: {
    color: STAR_COLOR,
  },
  commentContainer: {
    marginTop: Spacing2026.md,
  },
  commentInput: {
    ...Typography2026.body,
    color: Colors2026.text,
    backgroundColor: Colors2026.surface,
    borderRadius: Radius2026.sm,
    padding: Spacing2026.sm,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  commentText: {
    ...Typography2026.body,
    color: Colors2026.text,
    marginTop: Spacing2026.sm,
    fontStyle: 'italic',
  },
  dateText: {
    ...Typography2026.small,
    color: Colors2026.textMuted,
    marginTop: Spacing2026.sm,
  },
});
