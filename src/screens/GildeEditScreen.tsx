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
import { fetchGildeById, createGilde, updateGilde, deleteGilde, addGildeToBed } from '../services/gildeService';
import { fetchPhotosForGilde, setGildeCoverPhoto, uploadPhotoForGilde, unlinkPhotoFromGilde } from '../services/photoGildeService';
import { useBeets } from '../hooks/useBeets';
import { useGilden } from '../hooks/useGilden';
import { SYSTEM_GILDEN } from '../data/system-gilden';
import { getGoodCompanions } from '../data/plant-knowledge-map';
import { fetchBedPlants, linkBedToPlant } from '../services/bedService';
import { fetchPlants } from '../services/plantService';
import { Plant } from '../types/plant';
import PlantToggleRow from '../components/gilde/PlantToggleRow';
import CompanionSuggestion from '../components/gilde/CompanionSuggestion';
import PlantSearchWithToptip from '../components/gilde/PlantSearchWithToptip';
import BulkActionBar from '../components/gilde/BulkActionBar';
import GildeRecommendationRow, { RecommendationState } from '../components/gilde/GildeRecommendationRow';

type Props = NativeStackScreenProps<RootStackParamList, 'GildeEdit'>;

export default function GildeEditScreen({ navigation, route }: Props) {
  const { gildeId, bedId: initialBedId, templatePlants } = route.params || {};
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

  const { beets, loading: loadingBeets } = useBeets();
  const { gilden: allGilden } = useGilden();
  const [selectedBedId, setSelectedBedId] = useState<string | null>(null);
  const [beetPflanzen, setBeetPflanzen] = useState<Plant[]>([]);
  const [allePflanzen, setAllePflanzen] = useState<Plant[]>([]);
  const [loadingPflanzen, setLoadingPflanzen] = useState(false);
  const [showBeetPicker, setShowBeetPicker] = useState(false);
  const [showPlantPicker, setShowPlantPicker] = useState<number | null>(null);
  const [toggleMode, setToggleMode] = useState(false);
  const [pflanzenZugeordnet, setPflanzenZugeordnet] = useState<string[]>([]);

  useEffect(() => {
    if (isEditing && gildeId) {
      loadGilde();
    }
  }, [gildeId]);

  useEffect(() => {
    if (initialBedId && beets.length > 0) {
      setSelectedBedId(initialBedId);
    }
  }, [initialBedId, beets]);

  useEffect(() => {
    if (templatePlants && templatePlants.length > 0 && !isEditing) {
      setPlants(templatePlants.map(name => ({ name, role: '' })));
    }
  }, [templatePlants, isEditing]);

  

  useEffect(() => {
    if (gildeId) {
      loadPhotos();
    }
  }, [gildeId, gilde]);

  useEffect(() => {
    loadAllPlants();
  }, []);

  useEffect(() => {
    if (selectedBedId) {
      loadBeetPflanzen(selectedBedId);
      const bed = beets.find(b => b.id === selectedBedId);
      if (bed?.notes) {
        setStandort(bed.notes);
      }
    }
  }, [selectedBedId, beets]);

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
    
    // Check if it's a system gilde first
    const systemGilde = SYSTEM_GILDEN.find(g => g.id === gildeId);
    if (systemGilde) {
      setName(systemGilde.name);
      setConcept(systemGilde.concept || '');
      setStandort(systemGilde.standort || '');
      setPlants(systemGilde.plants || []);
      setTips(systemGilde.tips || []);
      setGilde(systemGilde);
      setLoading(false);
      return;
    }
    
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

  const loadAllPlants = async () => {
    setLoadingPflanzen(true);
    try {
      const pflanzen = await fetchPlants();
      setAllePflanzen(pflanzen);
    } catch (e) {
      console.warn('Error loading plants:', e);
    } finally {
      setLoadingPflanzen(false);
    }
  };

  const loadBeetPflanzen = async (bedId: string) => {
    try {
      const pflanzen = await fetchBedPlants(bedId);
      setBeetPflanzen(pflanzen);
    } catch (e) {
      console.warn('Error loading beet plants:', e);
    }
  };

  const handleBedChange = (bedId: string | null) => {
    setSelectedBedId(bedId);
    if (!bedId) {
      setBeetPflanzen([]);
    }
  };

  const getPrioritizedPlants = (): Plant[] => {
    // 1. Meine eigenen Pflanzen aus dem Inventar (allePflanzen) - zuerst
    // 2. Beet-Pflanzen (die noch nicht im Inventar sind)
    // 3. Alle anderen
    
    return allePflanzen;
  };

  const selectPlant = (plantName: string, index: number) => {
    updatePlant(index, 'name', plantName);
    setShowPlantPicker(null);
  };

  const togglePflanze = (plantName: string) => {
    if (pflanzenZugeordnet.includes(plantName)) {
      setPflanzenZugeordnet(pflanzenZugeordnet.filter(p => p !== plantName));
      setPlants(plants.filter(p => p.name !== plantName));
    } else {
      setPflanzenZugeordnet([...pflanzenZugeordnet, plantName]);
      setPlants([...plants, { name: plantName, role: '' }]);
    }
  };

  const isZugeordnet = (plantName: string) => pflanzenZugeordnet.includes(plantName);

  const handleAddToBed = async (plantName: string) => {
    if (!selectedBedId) {
      Alert.alert('Fehler', 'Bitte zuerst ein Beet auswählen.');
      return;
    }
    const plant = allePflanzen.find(p => p.name === plantName);
    if (!plant) {
      Alert.alert('Fehler', `${plantName} nicht im Inventar gefunden.`);
      return;
    }
    try {
      await linkBedToPlant(selectedBedId, plant.id);
      await loadBeetPflanzen(selectedBedId);
      if (!pflanzenZugeordnet.includes(plantName)) {
        togglePflanze(plantName);
      }
    } catch (e) {
      console.warn('Error adding plant to bed:', e);
      Alert.alert('Fehler', `${plantName} konnte nicht zum Beet hinzugefügt werden.`);
    }
  };

  const handleCreateNew = (plantName: string) => {
    navigation.navigate('AddPlant', { prefillName: plantName });
  };

  const movePlantUp = (index: number) => {
    if (index === 0) return;
    const updated = [...plants];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setPlants(updated);
  };

  const movePlantDown = (index: number) => {
    if (index === plants.length - 1) return;
    const updated = [...plants];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setPlants(updated);
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
        const newGilde = await createGilde(gildeData as any);
        if (selectedBedId) {
          await addGildeToBed(selectedBedId, newGilde.id);
        }
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

          <Text style={styles.label}>Beet</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowBeetPicker(!showBeetPicker)}
          >
            <Text style={styles.pickerButtonText}>
              {selectedBedId
                ? beets.find(b => b.id === selectedBedId)?.name || 'Beet auswählen'
                : 'Beet auswählen'}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={24} color={Colors2026.text} />
          </TouchableOpacity>

          {showBeetPicker && (
            <View style={styles.pickerContainer}>
              <TouchableOpacity
                style={styles.pickerItem}
                onPress={() => {
                  handleBedChange(null);
                  setShowBeetPicker(false);
                }}
              >
                <Text style={styles.pickerItemText}>Kein Beet</Text>
              </TouchableOpacity>
              {beets.map((bed) => (
                <TouchableOpacity
                  key={bed.id}
                  style={[
                    styles.pickerItem,
                    selectedBedId === bed.id && styles.pickerItemSelected,
                  ]}
                  onPress={() => {
                    handleBedChange(bed.id);
                    setShowBeetPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      selectedBedId === bed.id && styles.pickerItemTextSelected,
                    ]}
                  >
                    {bed.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

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

          <View style={styles.toggleModeContainer}>
            <TouchableOpacity
              style={[styles.toggleModeButton, !toggleMode && styles.toggleModeButtonActive]}
              onPress={() => setToggleMode(false)}
            >
              <Text style={[styles.toggleModeText, !toggleMode && styles.toggleModeTextActive]}>
                Liste
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleModeButton, toggleMode && styles.toggleModeButtonActive]}
              onPress={() => setToggleMode(true)}
            >
              <Text style={[styles.toggleModeText, toggleMode && styles.toggleModeTextActive]}>
                Toggle
              </Text>
            </TouchableOpacity>
          </View>

          {/* Beet-Pflanzen wenn Toggle-Modus */}
          {toggleMode && selectedBedId && beetPflanzen.length > 0 ? (
            <>
              {/* Empfehlungen Section */}
              {gilde?.plants && gilde.plants.length > 0 && (
                <View style={styles.plantSection}>
                  <Text style={styles.sectionLabel}>💡 Empfohlene Pflanzen</Text>
                  {gilde.plants.map(gPlant => {
                    const inBeet = beetPflanzen.some(p => p.name === gPlant.name);
                    const inInventory = allePflanzen.some(p => p.name === gPlant.name);
                    const isAssigned = pflanzenZugeordnet.includes(gPlant.name);
                    
                    let state: RecommendationState;
                    if (inBeet && isAssigned) {
                      state = 'in_beet_assigned';
                    } else if (inBeet && !isAssigned) {
                      state = 'in_beet_not_assigned';
                    } else if (inInventory && !inBeet) {
                      state = 'in_inventory';
                    } else {
                      state = 'not_in_inventory';
                    }

                    return (
                      <GildeRecommendationRow
                        key={gPlant.name}
                        plantName={gPlant.name}
                        state={state}
                        gildeName={gilde.name}
                        onAddToGilde={() => {
                          if (!pflanzenZugeordnet.includes(gPlant.name)) {
                            togglePflanze(gPlant.name);
                          }
                        }}
                        onAddToBed={() => handleAddToBed(gPlant.name)}
                        onCreateNew={() => handleCreateNew(gPlant.name)}
                      />
                    );
                  })}
                </View>
              )}

              <View style={styles.plantSection}>
                <View style={styles.plantSectionHeader}>
                  <Text style={styles.sectionLabel}>Aus Beet</Text>
                <Text style={styles.plantCountLabel}>
                  {pflanzenZugeordnet.length} von {beetPflanzen.length} zugeordnet
                </Text>
              </View>
              <BulkActionBar
                onSelectAll={() => beetPflanzen.forEach(p => {
                  if (!pflanzenZugeordnet.includes(p.name)) {
                    togglePflanze(p.name);
                  }
                })}
                onDeselectAll={() => {
                  setPflanzenZugeordnet([]);
                  setPlants([]);
                }}
                count={pflanzenZugeordnet.length}
              />
              {(() => {
                const gildePlantNames = gilde?.plants?.map(p => p.name) || [];
                const sortedPflanzen = [...beetPflanzen].sort((a, b) => {
                  const aInGilde = gildePlantNames.includes(a.name);
                  const bInGilde = gildePlantNames.includes(b.name);
                  if (aInGilde && !bInGilde) return -1;
                  if (!aInGilde && bInGilde) return 1;
                  return 0;
                });
                return sortedPflanzen.map((plant, index) => {
                  const recommendation = gildePlantNames.includes(plant.name) ? 'Gilde-Pflanze' : undefined;
                const plantRole = plants?.find(p => p?.name === plant.name)?.role || '';
                const plantIndex = plants?.findIndex(p => p?.name === plant.name) ?? -1;
                return (
                  <PlantToggleRow
                    key={plant.id}
                    plantName={plant.name}
                    role={plantRole}
                    isZugeordnet={isZugeordnet(plant.name)}
                    onToggle={() => togglePflanze(plant.name)}
                    onRoleChange={(role: string) => {
                      const idx = plants?.findIndex(p => p?.name === plant.name) ?? -1;
                      if (idx >= 0 && plants) {
                        const updated = [...plants];
                        updated[idx] = { ...updated[idx], role };
                        setPlants(updated);
                      }
                    }}
                    onMoveUp={() => {
                      if (plantIndex > 0 && plants) {
                        const updated = [...plants];
                        const current = updated[plantIndex];
                        updated[plantIndex] = updated[plantIndex - 1];
                        updated[plantIndex - 1] = current;
                        setPlants(updated);
                      }
                    }}
                    onMoveDown={() => {
                      if (plantIndex >= 0 && plantIndex < (plants?.length ?? 0) - 1 && plants) {
                        const updated = [...plants];
                        const current = updated[plantIndex];
                        updated[plantIndex] = updated[plantIndex + 1];
                        updated[plantIndex + 1] = current;
                        setPlants(updated);
                      }
                    }}
                    showReorder={toggleMode && isZugeordnet(plant.name) && (plants?.length ?? 0) > 1}
                    recommendation={recommendation}
                  />
                );
              });
              })()}

              {(() => {
                const allCompanions = plants
                  .filter(p => p.name)
                  .flatMap(p => getGoodCompanions(p.name))
                  .filter((c, i, arr) => arr.findIndex(a => a.name === c.name) === i)
                  .filter(c => !plants.some(p => p.name === c.name));
                if (allCompanions.length === 0) return null;
                return (
                  <CompanionSuggestion
                    mainPlant="deine Gilde"
                    suggestions={allCompanions}
                    onSelect={(name) => {
                      if (!plants.some(p => p.name === name)) {
                        setPlants([...plants, { name, role: '' }]);
                      }
                    }}
                  />
                );
              })()}
            </View>
            </>
          ) : (
            /* Existing list code - keep the existing plants.map for non-toggle mode */
            plants.map((plant, index) => (
              <View key={index} style={styles.plantRow}>
                <View style={styles.plantInputs}>
                  <TouchableOpacity
                    style={styles.plantInput}
                    onPress={() => setShowPlantPicker(showPlantPicker === index ? null : index)}
                  >
                    <Text style={[styles.plantInputText, !plant.name && styles.placeholderText]}>
                      {plant.name || 'Pflanze auswählen'}
                    </Text>
                  </TouchableOpacity>
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
                {showPlantPicker === index && (
                  <View style={styles.plantPickerContainer}>
                    {getPrioritizedPlants().map((p) => (
                      <TouchableOpacity
                        key={p.id}
                        style={styles.plantPickerItem}
                        onPress={() => selectPlant(p.name, index)}
                      >
                        <Text style={styles.plantPickerItemText}>{p.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))
          )}

          {/* Fallback: Im Inventar suchen */}
          {(!selectedBedId || (toggleMode && selectedBedId && beetPflanzen.length > 0)) && !toggleMode && (
            <PlantSearchWithToptip
              onSelectPlant={(name) => {
                if (!plants.some(p => p.name === name)) {
                  setPlants([...plants, { name, role: '' }]);
                }
              }}
              existingPlants={plants.map(p => p.name)}
              mainPlant={plants[0]?.name}
            />
          )}
          {(!selectedBedId || (toggleMode && selectedBedId && beetPflanzen.length > 0)) && toggleMode && (
            <TouchableOpacity 
              style={styles.fallbackButton} 
              onPress={() => {
                if (toggleMode) {
                  setShowPlantPicker(0);
                } else {
                  setShowPlantPicker(showPlantPicker);
                }
              }}
            >
              <MaterialIcons name="search" size={20} color={Colors2026.primary} />
              <Text style={styles.fallbackButtonText}>Im Inventar suchen</Text>
            </TouchableOpacity>
          )}

          {plants.length === 0 && toggleMode && (
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
  plantInputText: {
    ...Typography2026.body,
    color: Colors2026.text,
  },
  placeholderText: {
    color: Colors2026.textMuted,
  },
  plantPickerContainer: {
    position: 'absolute',
    left: 0,
    right: 60,
    top: 50,
    backgroundColor: Colors2026.surface,
    borderRadius: Radius2026.sm,
    borderWidth: 1,
    borderColor: Colors2026.border,
    maxHeight: 200,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  plantPickerItem: {
    padding: Spacing2026.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors2026.border,
  },
  plantPickerItemText: {
    ...Typography2026.body,
    color: Colors2026.text,
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
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors2026.surface,
    borderRadius: Radius2026.sm,
    padding: Spacing2026.sm,
    borderWidth: 1,
    borderColor: Colors2026.border,
  },
  pickerButtonText: {
    ...Typography2026.body,
    color: Colors2026.text,
  },
  pickerContainer: {
    backgroundColor: Colors2026.surface,
    borderRadius: Radius2026.sm,
    borderWidth: 1,
    borderColor: Colors2026.border,
    marginTop: Spacing2026.xs,
    maxHeight: 200,
  },
  pickerItem: {
    padding: Spacing2026.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors2026.border,
  },
  pickerItemSelected: {
    backgroundColor: Colors2026.primary + '20',
  },
  pickerItemText: {
    ...Typography2026.body,
    color: Colors2026.text,
  },
  pickerItemTextSelected: {
    color: Colors2026.primary,
    fontWeight: '600',
  },
  fallbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing2026.md,
    marginTop: Spacing2026.sm,
    borderTopWidth: 1,
    borderTopColor: Colors2026.border,
    gap: Spacing2026.sm,
  },
  fallbackButtonText: {
    ...Typography2026.body,
    color: Colors2026.primary,
  },
  toggleModeContainer: {
    flexDirection: 'row',
    backgroundColor: Colors2026.surface,
    borderRadius: Radius2026.sm,
    padding: 2,
  },
  toggleModeButton: {
    paddingHorizontal: Spacing2026.sm,
    paddingVertical: Spacing2026.xs,
    borderRadius: Radius2026.sm - 2,
  },
  toggleModeButtonActive: {
    backgroundColor: Colors2026.primary + '20',
  },
  toggleModeText: {
    ...Typography2026.small,
    color: Colors2026.textMuted,
  },
  toggleModeTextActive: {
    color: Colors2026.primary,
    fontWeight: '600',
  },
  sectionLabel: {
    ...Typography2026.caption,
    color: Colors2026.textSecondary,
    marginTop: Spacing2026.sm,
    marginBottom: Spacing2026.xs,
  },
  plantSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing2026.xs,
  },
  plantCountLabel: {
    ...Typography2026.caption,
    color: Colors2026.primary,
    fontWeight: '600',
  },
  plantSection: {
    marginBottom: Spacing2026.sm,
  },
  bottomSpacer: {
    height: 50,
  },
});
