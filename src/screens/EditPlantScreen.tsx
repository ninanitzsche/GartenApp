import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { RootStackParamList } from '../types/navigation';
import { Colors2026, Spacing2026, Radius2026, Typography2026 } from '../theme/designSystemV2';
import { PlantFormData, PLANT_STATUSES, PLANT_TYPES } from '../types/plant';
import { fetchPlant, updatePlant, deletePlant } from '../services/plantService';
import GlassInput from '../components/ui/GlassInput';
import GlassCard from '../components/ui/GlassCard';
import AnimatedButton from '../components/ui/AnimatedButton';
import CoverImagePicker from '../components/ui/CoverImagePicker';
import PhotoGallery from '../components/ui/PhotoGallery';
import { Photo } from '../types/photo';
import { fetchPhotosForPlant, setPlantCoverPhoto, uploadPhotoForPlant, unlinkPhotoFromPlant } from '../services/photoPlantService';

type Props = NativeStackScreenProps<RootStackParamList, 'EditPlant'>;

const typeIcons: Record<string, React.ComponentProps<typeof MaterialIcons>['name']> = {
  'gemüse': 'grass',
  'obst': 'restaurant',
  'kräuter': 'spa',
  'blumen': 'local-florist',
  'sonstiges': 'category',
};

export default function EditPlantScreen({ navigation, route }: Props) {
  const { plantId } = route.params;
  const [formData, setFormData] = useState<PlantFormData>({
    name: '',
    latin_name: '',
    location: '',
    type: '',
    status: 'geplant',
    winterhart: false,
    essbar: false,
    quantity: undefined,
    planted_date: '',
    harvest_date: '',
    notes: '',
    tags: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [plant, setPlant] = useState<any>(null);
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [savingPhoto, setSavingPhoto] = useState(false);

  useEffect(() => {
    loadPlant();
  }, [plantId]);

  const loadPlant = async () => {
    try {
      const plant = await fetchPlant(plantId);
      if (plant) {
        setPlant(plant);
        setCoverPhoto(plant.cover_photo_url || null);
        setFormData({
          name: plant.name || '',
          latin_name: plant.latin_name || '',
          location: plant.location || '',
          type: plant.type || '',
          status: plant.status || 'geplant',
          winterhart: plant.winterhart || false,
          essbar: plant.essbar || false,
          quantity: plant.quantity,
          planted_date: plant.planted_date || '',
          harvest_date: plant.harvest_date || '',
          notes: plant.notes || '',
          tags: plant.tags || [],
        });
      }
    } catch (error) {
      console.error('Error loading plant:', error);
      Alert.alert('Fehler', 'Pflanze konnte nicht geladen werden.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (plantId) {
      loadPhotos();
    }
  }, [plantId, plant]);

  const loadPhotos = async () => {
    if (!plantId) return;
    setLoadingPhotos(true);
    try {
      const plantPhotos = await fetchPhotosForPlant(plantId);
      setPhotos(plantPhotos);
      if (plant?.cover_photo_url) {
        setCoverPhoto(plant.cover_photo_url);
      }
    } catch (e) {
      console.warn('Fehler beim Laden:', e);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name ist erforderlich';
    }

    if (!formData.status) {
      newErrors.status = 'Status ist erforderlich';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Fehler', 'Bitte füllen Sie alle erforderlichen Felder aus.');
      return;
    }

    setSaving(true);
    try {
      const cleanData: any = { ...formData };
      Object.keys(cleanData).forEach((key) => {
        if (cleanData[key] === '') {
          cleanData[key] = undefined;
        }
      });

      await updatePlant(plantId, cleanData);
      Alert.alert('Erfolg', 'Pflanze wurde aktualisiert.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error updating plant:', error);
      Alert.alert('Fehler', 'Pflanze konnte nicht aktualisiert werden.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Pflanze löschen',
      'Möchten Sie diese Pflanze wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePlant(plantId);
              navigation.navigate('PlantList');
              Alert.alert('Erfolg', 'Pflanze wurde gelöscht.');
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Fehler', 'Pflanze konnte nicht gelöscht werden.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors2026.primary} />
        <Text style={styles.loadingText}>Lade Pflanze...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={styles.header}
          entering={FadeInDown.duration(400).delay(100)}
        >
          <Text style={styles.headerTitle}>Pflanze bearbeiten</Text>
          <Text style={styles.headerSubtitle}>Ändere die Details deiner Pflanze</Text>
        </Animated.View>

        <GlassCard style={styles.formCard}>
          <Animated.View entering={FadeInDown.duration(400).delay(200)}>
            <GlassInput
              label="Name *"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="z.B. Tomate"
              error={errors.name}
              icon={<MaterialIcons name="eco" size={22} color={Colors2026.primary} />}
            />

            <GlassInput
              label="Lateinischer Name"
              value={formData.latin_name || ''}
              onChangeText={(text) => setFormData({ ...formData, latin_name: text })}
              placeholder="z.B. Solanum lycopersicum"
              icon={<MaterialIcons name="school" size={22} color={Colors2026.primary} />}
            />

            <GlassInput
              label="Standort"
              value={formData.location || ''}
              onChangeText={(text) => setFormData({ ...formData, location: text })}
              placeholder="z.B. Hauptbeet, Gewächshaus"
              icon={<MaterialIcons name="place" size={22} color={Colors2026.primary} />}
            />
          </Animated.View>

          <Animated.View style={styles.divider} entering={FadeInDown.duration(400).delay(250)} />

          <Animated.View entering={FadeInDown.duration(400).delay(300)}>
            <Text style={styles.sectionLabel}>Typ</Text>
            <View style={styles.chipContainer}>
              {PLANT_TYPES.map((type) => (
                <Pressable
                  key={type.value}
                  style={[
                    styles.chip,
                    formData.type === type.value && styles.chipSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, type: type.value })}
                >
                  <MaterialIcons 
                    name={typeIcons[type.value] || 'eco'} 
                    size={18} 
                    color={formData.type === type.value ? '#fff' : Colors2026.primary} 
                  />
                  <Text
                    style={[
                      styles.chipText,
                      formData.type === type.value && styles.chipTextSelected,
                    ]}
                  >
                    {type.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(350)}>
            <Text style={styles.sectionLabel}>Status *</Text>
            <View style={styles.chipContainer}>
              {PLANT_STATUSES.map((status) => {
                const statusColor = Colors2026.plantStatus[status.value as keyof typeof Colors2026.plantStatus] || Colors2026.primary;
                return (
                  <Pressable
                    key={status.value}
                    style={[
                      styles.chip,
                      formData.status === status.value && { 
                        backgroundColor: statusColor,
                        borderColor: statusColor,
                      },
                    ]}
                    onPress={() => setFormData({ ...formData, status: status.value })}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        formData.status === status.value && styles.chipTextSelected,
                      ]}
                    >
                      {status.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {errors.status && <Text style={styles.errorText}>{errors.status}</Text>}
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(400)}>
            <GlassInput
              label="Anzahl"
              value={formData.quantity?.toString() || ''}
              onChangeText={(text) => {
                const num = parseInt(text, 10);
                setFormData({ ...formData, quantity: isNaN(num) ? undefined : num });
              }}
              placeholder="z.B. 5"
              keyboardType="numeric"
              icon={<MaterialIcons name="tag" size={22} color={Colors2026.primary} />}
            />
          </Animated.View>

          <Animated.View style={styles.switchSection} entering={FadeInDown.duration(400).delay(450)}>
            <View style={styles.switchRow}>
              <View style={styles.switchInfo}>
                <MaterialIcons name="ac-unit" size={24} color={Colors2026.accent} />
                <View style={styles.switchTextContainer}>
                  <Text style={styles.switchLabel}>Winterhart</Text>
                  <Text style={styles.switchDescription}>Verträgt Frost</Text>
                </View>
              </View>
              <Switch
                value={formData.winterhart}
                onValueChange={(value) => setFormData({ ...formData, winterhart: value })}
                trackColor={{ false: Colors2026.border, true: Colors2026.primaryLight }}
                thumbColor={formData.winterhart ? Colors2026.primary : Colors2026.textLight}
              />
            </View>

            <View style={[styles.switchRow, styles.switchRowBorder]}>
              <View style={styles.switchInfo}>
                <MaterialIcons name="restaurant" size={24} color={Colors2026.status.success} />
                <View style={styles.switchTextContainer}>
                  <Text style={styles.switchLabel}>Essbar</Text>
                  <Text style={styles.switchDescription}>Kann verzehrt werden</Text>
                </View>
              </View>
              <Switch
                value={formData.essbar}
                onValueChange={(value) => setFormData({ ...formData, essbar: value })}
                trackColor={{ false: Colors2026.border, true: Colors2026.primaryLight }}
                thumbColor={formData.essbar ? Colors2026.primary : Colors2026.textLight}
              />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(500)}>
            <GlassInput
              label="Notizen"
              value={formData.notes || ''}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              placeholder="Zusätzliche Informationen..."
              multiline
              numberOfLines={4}
              icon={<MaterialIcons name="notes" size={22} color={Colors2026.primary} />}
            />
          </Animated.View>
        </GlassCard>

        <GlassCard style={styles.formCard}>
          <Text style={styles.sectionLabel}>Titelbild</Text>
          {savingPhoto ? (
            <ActivityIndicator />
          ) : (
            <CoverImagePicker
              imageUrl={coverPhoto}
              onChangeImage={async (uri) => {
                if (!plantId || !uri) return;
                setSavingPhoto(true);
                try {
                  const path = await uploadPhotoForPlant(plantId, uri);
                  await setPlantCoverPhoto(plantId, path);
                  setCoverPhoto(uri);
                } catch (e) {
                  Alert.alert('Fehler', 'Bild konnte nicht gespeichert werden');
                } finally {
                  setSavingPhoto(false);
                }
              }}
            />
          )}
        </GlassCard>

        <GlassCard style={styles.formCard}>
          <Text style={styles.sectionLabel}>Galerie</Text>
          {loadingPhotos ? (
            <ActivityIndicator />
          ) : (
            <PhotoGallery
              photos={photos}
              onAddPhoto={async () => {
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  quality: 0.8,
                });
                if (!result.canceled && result.assets[0] && plantId) {
                  const path = await uploadPhotoForPlant(plantId, result.assets[0].uri);
                  setPhotos([...photos, { id: 'new', photo_url: path } as Photo]);
                }
              }}
              onRemovePhoto={async (photoId) => {
                if (plantId) {
                  await unlinkPhotoFromPlant(photoId, plantId);
                  setPhotos(photos.filter(p => p.id !== photoId));
                }
              }}
            />
          )}
        </GlassCard>

        <Animated.View style={styles.buttonContainer} entering={FadeInDown.duration(400).delay(550)}>
          <AnimatedButton
            title={saving ? '' : 'Speichern'}
            onPress={handleSave}
            disabled={saving}
            fullWidth
            size="lg"
            icon={!saving && <MaterialIcons name="save" size={22} color="#fff" />}
          />
          {saving && <ActivityIndicator color="#fff" />}
        </Animated.View>

        <Animated.View style={styles.deleteContainer} entering={FadeInDown.duration(400).delay(600)}>
          <AnimatedButton
            title="Pflanze löschen"
            onPress={handleDelete}
            variant="danger"
            fullWidth
            size="md"
            icon={<MaterialIcons name="delete" size={20} color="#fff" />}
          />
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors2026.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors2026.background,
  },
  loadingText: {
    marginTop: Spacing2026.md,
    fontSize: Typography2026.body.fontSize,
    color: Colors2026.textMuted,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing2026.xl,
    paddingTop: Spacing2026.xl,
    paddingBottom: Spacing2026.lg,
  },
  headerTitle: {
    ...Typography2026.headline,
    color: Colors2026.text,
    marginBottom: Spacing2026.xs,
  },
  headerSubtitle: {
    ...Typography2026.body,
    color: Colors2026.textSecondary,
  },
  formCard: {
    marginHorizontal: Spacing2026.lg,
    padding: Spacing2026.lg,
  },
  divider: {
    height: 1,
    backgroundColor: Colors2026.divider,
    marginVertical: Spacing2026.lg,
  },
  sectionLabel: {
    ...Typography2026.caption,
    fontWeight: '600',
    color: Colors2026.textSecondary,
    marginBottom: Spacing2026.sm,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing2026.sm,
    marginBottom: Spacing2026.lg,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing2026.sm,
    paddingHorizontal: Spacing2026.md,
    borderRadius: Radius2026.round,
    backgroundColor: Colors2026.glass.medium,
    borderWidth: 1,
    borderColor: Colors2026.border,
    gap: Spacing2026.xs,
  },
  chipSelected: {
    backgroundColor: Colors2026.primary,
    borderColor: Colors2026.primary,
  },
  chipText: {
    fontSize: Typography2026.caption.fontSize,
    fontWeight: '500',
    color: Colors2026.text,
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  switchSection: {
    marginBottom: Spacing2026.lg,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing2026.sm,
  },
  switchRowBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors2026.divider,
    marginTop: Spacing2026.sm,
    paddingTop: Spacing2026.md,
  },
  switchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing2026.md,
  },
  switchTextContainer: {
    gap: 2,
  },
  switchLabel: {
    ...Typography2026.body,
    fontWeight: '500',
    color: Colors2026.text,
  },
  switchDescription: {
    ...Typography2026.small,
    color: Colors2026.textMuted,
  },
  errorText: {
    color: Colors2026.status.error,
    fontSize: Typography2026.small.fontSize,
    marginTop: Spacing2026.xs,
  },
  buttonContainer: {
    marginHorizontal: Spacing2026.lg,
    marginTop: Spacing2026.xl,
    minHeight: 56,
    justifyContent: 'center',
  },
  deleteContainer: {
    marginHorizontal: Spacing2026.lg,
    marginTop: Spacing2026.md,
  },
  bottomSpacer: {
    height: Spacing2026.xxxl,
  },
});
