import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { SlideInDown, SlideOutDown, FadeIn, FadeOut } from 'react-native-reanimated';
import { fetchPlant } from '../../services/plantService';
import { Colors2026, Spacing2026, Radius2026, Typography2026 } from '../../theme/designSystemV2';

interface Plant {
  id: string;
  name: string;
  planted_date?: string;
  location?: string;
  status?: string;
  health_status?: string;
  notes?: string;
  primary_photo?: { photo_url: string };
}

interface Props {
  visible: boolean;
  plantId: string | null;
  onClose: () => void;
  onViewDetails: (plantId: string) => void;
}

export default function PlantQuickViewModal({ visible, plantId, onClose, onViewDetails }: Props) {
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && plantId) {
      loadPlant();
    }
  }, [visible, plantId]);

  const loadPlant = async () => {
    if (!plantId) return;
    setLoading(true);
    try {
      const data = await fetchPlant(plantId);
      setPlant(data);
    } catch (e) {
      console.error('Error loading plant:', e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'gesund': return Colors2026.status.success;
      case 'krank': return Colors2026.status.error;
      case 'neutral': return Colors2026.status.warning;
      default: return Colors2026.textSecondary;
    }
  };

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        
        <Animated.View
          entering={SlideInDown.duration(300)}
          exiting={SlideOutDown.duration(200)}
          style={styles.container}
        >
          <View style={styles.handle} />
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors2026.primary} />
              </View>
            ) : plant ? (
              <>
                {plant.primary_photo && (
                  <Image
                    source={{ uri: plant.primary_photo.photo_url }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                )}
                
                <View style={styles.content}>
                  <Text style={styles.name}>{plant.name}</Text>
                  
                  {plant.status && (
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(plant.status) + '20' }]}>
                      <View style={[styles.statusDot, { backgroundColor: getStatusColor(plant.status) }]} />
                      <Text style={[styles.statusText, { color: getStatusColor(plant.status) }]}>
                        {plant.status === 'gesund' ? 'Gesund' : plant.status}
                      </Text>
                    </View>
                  )}
                  
                  <View style={styles.details}>
                    {plant.location && (
                      <View style={styles.detailRow}>
                        <MaterialIcons name="location-on" size={18} color={Colors2026.textSecondary} />
                        <Text style={styles.detailText}>{plant.location}</Text>
                      </View>
                    )}
                    
                    {plant.planted_date && (
                      <View style={styles.detailRow}>
                        <MaterialIcons name="event" size={18} color={Colors2026.textSecondary} />
                        <Text style={styles.detailText}>
                          Gepflanzt: {new Date(plant.planted_date).toLocaleDateString('de-DE')}
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  {plant.notes && (
                    <View style={styles.notesSection}>
                      <Text style={styles.notesLabel}>Notizen</Text>
                      <Text style={styles.notesText}>{plant.notes}</Text>
                    </View>
                  )}
                  
                  <Pressable
                    style={styles.viewDetailsButton}
                    onPress={() => onViewDetails(plant.id)}
                  >
                    <Text style={styles.viewDetailsText}>Alle Details anzeigen</Text>
                    <MaterialIcons name="chevron-right" size={20} color="#fff" />
                  </Pressable>
                </View>
              </>
            ) : (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Pflanze nicht gefunden</Text>
              </View>
            )}
          </ScrollView>
          
          <Pressable style={styles.closeButton} onPress={onClose}>
            <MaterialIcons name="close" size={24} color={Colors2026.text} />
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    backgroundColor: Colors2026.bg,
    borderTopLeftRadius: Radius2026.xl,
    borderTopRightRadius: Radius2026.xl,
    maxHeight: '80%',
    minHeight: 300,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors2026.divider,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: Spacing2026.md,
    marginBottom: Spacing2026.sm,
  },
  loadingContainer: {
    padding: Spacing2026.xl,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: Spacing2026.xl,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors2026.text,
    marginBottom: Spacing2026.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing2026.md,
    paddingVertical: Spacing2026.xs,
    borderRadius: Radius2026.round,
    marginBottom: Spacing2026.lg,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing2026.xs,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  details: {
    gap: Spacing2026.md,
    marginBottom: Spacing2026.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing2026.sm,
  },
  detailText: {
    fontSize: 14,
    color: Colors2026.text,
  },
  notesSection: {
    backgroundColor: Colors2026.glass.light,
    padding: Spacing2026.md,
    borderRadius: Radius2026.md,
    marginBottom: Spacing2026.lg,
  },
  notesLabel: {
    fontSize: 12,
    color: Colors2026.textMuted,
    marginBottom: Spacing2026.xs,
  },
  notesText: {
    fontSize: 14,
    color: Colors2026.text,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors2026.primary,
    paddingVertical: Spacing2026.md,
    borderRadius: Radius2026.md,
    gap: Spacing2026.xs,
  },
  viewDetailsText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  errorContainer: {
    padding: Spacing2026.xl,
    alignItems: 'center',
  },
  errorText: {
    color: Colors2026.status.error,
    fontSize: 16,
  },
  closeButton: {
    position: 'absolute',
    top: Spacing2026.md,
    right: Spacing2026.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
