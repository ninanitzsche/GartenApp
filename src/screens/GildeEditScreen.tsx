/**
 * GildeEditScreen - Create or edit a Gilde (Plant Guild)
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '../types/navigation';
import { Colors2026, Spacing2026, Radius2026, Typography2026 } from '../theme/designSystemV2';
import GlassCard from '../components/ui/GlassCard';
import GlassInput from '../components/ui/GlassInput';
import CoverImagePicker from '../components/ui/CoverImagePicker';
import PhotoGallery from '../components/ui/PhotoGallery';
import { Gilde, GildePlant } from '../types/gilde';
import { Photo } from '../types/photo';
import { fetchGildeById, createGilde, updateGilde, deleteGilde } from '../services/gildeService';
import { fetchPhotosForGilde, setGildeCoverPhoto, uploadPhotoForGilde, unlinkPhotoFromGilde } from '../services/photoGildeService';

type Props = NativeStackScreenProps<RootStackParamList, 'GildeEdit'>;

export default function GildeEditScreen({ navigation, route }: Props) {
  const { gildeId } = route.params || {};
  const isEditing = !!gildeId;

  const [name, setName] = useState('');
  const [concept, setConcept] = useState('');
  const [standort, setStandort] = useState('');
  const [plants, setPlants] = useState<GildePlant[]>([]);
  const [tips, setTips] = useState<string[]>([]);
  const [newTip, setNewTip] = useState('');
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [gilde, setGilde] = useState<Gilde | null>(null);
  const [coverPhoto, setCoverPhoto] = useState<string | null>(gilde?.cover_photo_url || null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [savingPhoto, setSavingPhoto] = useState(false);

  useEffect(() => {
    if (isEditing && gildeId) {
      loadGilde();
    }
  }, [gildeId]);

  useEffect(() => {
    if (gildeId) {
      loadPhotos();
    }
  }, [gildeId, gilde]);

  const loadPhotos = async () => {
    if (!gildeId) return;
    setLoadingPhotos(true);
    try {
      const gildePhotos = await fetchPhotosForGilde(gildeId);
      setPhotos(gildePhotos);
      if (gilde?.cover_photo_url) {
        setCoverPhoto(gilde.cover_photo_url);
      }
    } catch (e) {
      console.warn('Fehler beim Laden:', e);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const loadGilde = async () => {
    if (!gildeId) return;
    try {
      const gilde = await fetchGildeById(gildeId);
      if (gilde) {
        setName(gilde.name);
        setConcept(gilde.concept || '');
        setStandort(gilde.standort || '');
        setPlants(gilde.plants || []);
        setTips(gilde.tips || []);
        setGilde(gilde);
      }
    } catch (error) {
      console.error('Error loading gilde:', error);
      Alert.alert('Fehler', 'Gilde konnte nicht geladen werden.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Fehler', 'Name ist erforderlich.');
      return false;
    }
    if (plants.length === 0) {
      Alert.alert('Fehler', 'Mindestens eine Pflanze ist erforderlich.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const gildeData = {
        name: name.trim(),
        concept: concept.trim() || undefined,
        standort: standort.trim() || undefined,
        plants,
        tips,
        is_system: false,
      };

      if (isEditing && gildeId) {
        await updateGilde(gildeId, gildeData);
        Alert.alert('Erfolg', 'Gilde aktualisiert.');
      } else {
        await createGilde(gildeData as any);
        Alert.alert('Erfolg', 'Gilde erstellt.');
      }
      navigation.goBack();
    } catch (error: any) {
      console.error('Error saving gilde:', error);
      Alert.alert('Fehler', error.message || 'Gilde konnte nicht gespeichert werden.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!gildeId) return;

    Alert.alert(
      'Gilde löschen',
      'Möchten Sie diese Gilde wirklich löschen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteGilde(gildeId);
              Alert.alert('Erfolg', 'Gilde gelöscht.');
              navigation.goBack();
            } catch (error: any) {
              console.error('Error deleting gilde:', error);
              Alert.alert('Fehler', error.message || 'Gilde konnte nicht gelöscht werden.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const addPlant = () => {
    setPlants([...plants, { name: '', role: '' }]);
  };

  const updatePlant = (index: number, field: keyof GildePlant, value: string) => {
    const updated = [...plants];
    updated[index] = { ...updated[index], [field]: value };
    setPlants(updated);
  };

  const removePlant = (index: number) => {
    setPlants(plants.filter((_, i) => i !== index));
  };

  const addTip = () => {
    if (newTip.trim()) {
      setTips([...tips, newTip.trim()]);
      setNewTip('');
    }
  };

  const removeTip = (index: number) => {
    setTips(tips.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors2026.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="close" size={24} color={Colors2026.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Gilde bearbeiten' : 'Neue Gilde erstellen'}
        </Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color={Colors2026.primary} />
          ) : (
            <Text style={styles.saveButton}>Speichern</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <GlassCard style={styles.card}>
          <Text style={styles.label}>Name *</Text>
          <GlassInput
            value={name}
            onChangeText={setName}
            placeholder="z.B. Meine Kräuter-Gilde"
          />

          <Text style={styles.label}>Konzept</Text>
          <GlassInput
            value={concept}
            onChangeText={setConcept}
            placeholder="z.B. Mediterrane Kräuter für den Balkon"
            multiline
            numberOfLines={2}
          />

          <Text style={styles.label}>Standort</Text>
          <GlassInput
            value={standort}
            onChangeText={setStandort}
            placeholder="z.B. Südbalkon, Beet Nord-West"
          />
        </GlassCard>

        <GlassCard style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pflanzen *</Text>
            <TouchableOpacity style={styles.addButton} onPress={addPlant}>
              <MaterialIcons name="add" size={20} color={Colors2026.primary} />
              <Text style={styles.addButtonText}>Hinzufügen</Text>
            </TouchableOpacity>
          </View>

          {plants.map((plant, index) => (
            <View key={index} style={styles.plantRow}>
              <View style={styles.plantInputs}>
                <TextInput
                  style={styles.plantInput}
                  value={plant.name}
                  onChangeText={(v) => updatePlant(index, 'name', v)}
                  placeholder="Pflanzenname"
                  placeholderTextColor={Colors2026.textMuted}
                />
                <TextInput
                  style={styles.roleInput}
                  value={plant.role}
                  onChangeText={(v) => updatePlant(index, 'role', v)}
                  placeholder="Rolle"
                  placeholderTextColor={Colors2026.textMuted}
                />
              </View>
              <TouchableOpacity onPress={() => removePlant(index)}>
                <MaterialIcons name="remove-circle" size={24} color={Colors2026.status.error} />
              </TouchableOpacity>
            </View>
          ))}

          {plants.length === 0 && (
            <Text style={styles.emptyText}>Noch keine Pflanzen hinzugefügt.</Text>
          )}
        </GlassCard>

        <GlassCard style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tipps</Text>
          </View>

          <View style={styles.tipInputRow}>
            <TextInput
              style={styles.tipTextInput}
              value={newTip}
              onChangeText={setNewTip}
              placeholder="Neuer Tipp"
              placeholderTextColor={Colors2026.textMuted}
            />
            <TouchableOpacity style={styles.tipAddButton} onPress={addTip}>
              <MaterialIcons name="add" size={24} color={Colors2026.primary} />
            </TouchableOpacity>
          </View>

          {tips.map((tip, index) => (
            <View key={index} style={styles.tipRow}>
              <Text style={styles.tipText}>{tip}</Text>
              <TouchableOpacity onPress={() => removeTip(index)}>
                <MaterialIcons name="close" size={20} color={Colors2026.textMuted} />
              </TouchableOpacity>
            </View>
          ))}
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={styles.label}>Titelbild</Text>
          {savingPhoto ? (
            <ActivityIndicator />
          ) : (
            <CoverImagePicker
              imageUrl={coverPhoto}
              onChangeImage={async (uri) => {
                if (!gildeId || !uri) return;
                setSavingPhoto(true);
                try {
                  const path = await uploadPhotoForGilde(gildeId, uri);
                  await setGildeCoverPhoto(gildeId, path);
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

        <GlassCard style={styles.card}>
          <Text style={styles.label}>Galerie</Text>
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
                if (!result.canceled && result.assets[0] && gildeId) {
                  const path = await uploadPhotoForGilde(gildeId, result.assets[0].uri);
                  setPhotos([...photos, { id: 'new', photo_url: path } as Photo]);
                }
              }}
              onRemovePhoto={async (photoId) => {
                if (gildeId) {
                  await unlinkPhotoFromGilde(photoId, gildeId);
                  setPhotos(photos.filter(p => p.id !== photoId));
                }
              }}
            />
          )}
        </GlassCard>

        {isEditing && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator size="small" color={Colors2026.status.error} />
            ) : (
              <>
                <MaterialIcons name="delete" size={20} color={Colors2026.status.error} />
                <Text style={styles.deleteButtonText}>Gilde löschen</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors2026.bg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors2026.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing2026.md,
    paddingVertical: Spacing2026.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors2026.border,
  },
  headerTitle: {
    ...Typography2026.title,
    color: Colors2026.text,
  },
  saveButton: {
    ...Typography2026.body,
    color: Colors2026.primary,
    fontWeight: '600',
  },
  form: {
    padding: Spacing2026.md,
  },
  card: {
    marginBottom: Spacing2026.md,
  },
  label: {
    ...Typography2026.caption,
    color: Colors2026.textSecondary,
    marginBottom: Spacing2026.xs,
    marginTop: Spacing2026.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing2026.sm,
  },
  sectionTitle: {
    ...Typography2026.title,
    color: Colors2026.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors2026.primary + '15',
    borderRadius: Radius2026.round,
  },
  addButtonText: {
    ...Typography2026.small,
    color: Colors2026.primary,
    fontWeight: '600',
  },
  plantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing2026.sm,
    gap: Spacing2026.sm,
  },
  plantInputs: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing2026.sm,
  },
  plantInput: {
    flex: 2,
    ...Typography2026.body,
    color: Colors2026.text,
    backgroundColor: Colors2026.surface,
    borderRadius: Radius2026.sm,
    padding: Spacing2026.sm,
  },
  roleInput: {
    flex: 1,
    ...Typography2026.body,
    color: Colors2026.text,
    backgroundColor: Colors2026.surface,
    borderRadius: Radius2026.sm,
    padding: Spacing2026.sm,
  },
  emptyText: {
    ...Typography2026.body,
    color: Colors2026.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: Spacing2026.md,
  },
  tipInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing2026.sm,
  },
  tipTextInput: {
    flex: 1,
    ...Typography2026.body,
    color: Colors2026.text,
    backgroundColor: Colors2026.surface,
    borderRadius: Radius2026.sm,
    padding: Spacing2026.sm,
  },
  tipAddButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors2026.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing2026.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors2026.border,
  },
  tipText: {
    ...Typography2026.body,
    color: Colors2026.text,
    flex: 1,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing2026.sm,
    paddingVertical: Spacing2026.md,
    marginTop: Spacing2026.md,
  },
  deleteButtonText: {
    ...Typography2026.body,
    color: Colors2026.status.error,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 50,
  },
});
