import React from 'react';
import { View, Text, ScrollView, Pressable, Image, StyleSheet } from 'react-native';
import { Camera, FileText, Sprout } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors2026, Spacing2026, Radius2026, Typography2026 } from '../../theme/designSystemV2';
import GlassCard from '../ui/GlassCard';
import SectionHeader from '../ui/SectionHeader';
import { Photo } from '../../types/photo';
import { HarvestTotal } from '../../types/harvest';
import { RootStackParamList } from '../../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface Props {
  plantId: string;
  plantName: string;
  photos: Photo[];
  notes?: string;
  harvestTotals: HarvestTotal[];
}

export default function PlantMetaSection({ plantId, plantName, photos, notes, harvestTotals }: Props) {
  const navigation = useNavigation<Nav>();

  return (
    <>
      {/* Fotos */}
      {photos.length > 0 && (
        <View style={styles.section}>
          <SectionHeader
            title="Fotos"
            subtitle={`${photos.length} Foto${photos.length > 1 ? 's' : ''}`}
            icon={<Camera size={20} color={Colors2026.primary} />}
            animated={true}
            delay={100}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
            {photos.map((photo, index) => (
              <Pressable
                key={photo.id || index}
                style={styles.photoThumbnail}
                onPress={() => navigation.navigate('PhotoGallery', { plantId })}
              >
                <Image
                  source={{ uri: photo.photo_url }}
                  style={styles.photoThumbnail}
                  resizeMode="cover"
                />
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Notizen */}
      {notes && (
        <View style={styles.section}>
          <SectionHeader
            title="Notizen"
            icon={<FileText size={20} color={Colors2026.primary} />}
            animated={true}
            delay={100}
          />
          <GlassCard variant="light">
            <Text style={styles.notesText}>{notes}</Text>
          </GlassCard>
        </View>
      )}

      {/* Ernten */}
      {harvestTotals.length > 0 && (
        <View style={styles.section}>
          <SectionHeader
            title="Ernten"
            subtitle={`${harvestTotals.reduce((sum, h) => sum + h.quantity, 0).toFixed(1)} ${harvestTotals[0]?.unit || 'Stück'} gesamt`}
            icon={<Sprout size={20} color={Colors2026.plantStatus.geerntet} />}
            animated={true}
            delay={200}
          />
          <GlassCard variant="light">
            {harvestTotals.map((total, index) => (
              <View style={styles.harvestRow} key={index}>
                <Text style={styles.harvestName}>{plantName}</Text>
                <Text style={styles.harvestValue}>{total.quantity.toFixed(1)} {total.unit}</Text>
              </View>
            ))}
          </GlassCard>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing2026.xl,
    paddingHorizontal: Spacing2026.xl,
  },
  photoScroll: {
    marginTop: Spacing2026.sm,
  },
  photoThumbnail: {
    width: 160,
    height: 120,
    borderRadius: Radius2026.md,
    marginRight: Spacing2026.sm,
    backgroundColor: Colors2026.glass.tint,
  },
  notesText: {
    fontSize: Typography2026.body.fontSize,
    color: Colors2026.text,
    lineHeight: 24,
  },
  harvestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing2026.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors2026.border,
  },
  harvestName: {
    fontSize: Typography2026.body.fontSize,
    color: Colors2026.text,
  },
  harvestValue: {
    fontSize: Typography2026.body.fontSize,
    fontWeight: '600',
    color: Colors2026.primary,
  },
});
