/**
 * PlantDetailScreen - Redesigned 2026
 * Glassmorphism + Bold Cards + Hero Image
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Alert,
  Image,
} from 'react-native';
import { Leaf, Edit, Camera, Sprout, ChevronLeft, Snowflake, MapPin, Calendar, Sparkles, Droplets, Thermometer, RefreshCw, Heart, Settings, Sun, Cloud, Scissors, Book, Image as LucideImage } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image as RNImage } from 'react-native';
import { identifyDisease } from '../services/plantDiseaseService';
import { BlurView } from 'expo-blur';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../services/supabase';
import { fetchPlant } from '../services/plantService';
import { enrichPhotoWithUrl } from '../services/photoService';
import { refreshPlantData, hasAllSources } from '../services/plantInfoService';
import { getHarvestsByPlant, getTotalHarvestByPlant } from '../services/harvestService';
import { getCompanionsByPlantName } from '../services/companionService';
import { Plant } from '../types/plant';
import { Photo } from '../types/photo';
import { Harvest, HarvestTotal } from '../types/harvest';
import { RootStackParamList } from '../types/navigation';
import { Colors2026, Spacing2026, Radius2026, Typography2026, Shadows2026 } from '../theme/designSystemV2';
import GlassCard from '../components/ui/GlassCard';
import SectionHeader from '../components/ui/SectionHeader';
import StatusBadge from '../components/ui/StatusBadge';
import AnimatedButton from '../components/ui/AnimatedButton';
import FloatingAction from '../components/ui/FloatingAction';
import CompanionCard from '../components/CompanionCard';

type PlantDetailRouteProp = RouteProp<RootStackParamList, 'PlantDetail'>;
type PlantDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PlantDetail'>;

export default function PlantDetailScreen() {
  const route = useRoute<PlantDetailRouteProp>();
  const navigation = useNavigation<PlantDetailNavigationProp>();
  const { plantId } = route.params;

  const [plant, setPlant] = useState<Plant | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [harvestTotals, setHarvestTotals] = useState<HarvestTotal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [checkingHealth, setCheckingHealth] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchPlantDetails();
    }, [plantId])
  );

  const fetchPlantDetails = async () => {
    try {
      setLoading(true);

      const [plantData, photoDataResult, harvestData, totals] = await Promise.all([
        fetchPlant(plantId),
        supabase.from('photo_plants').select('photos(*)').eq('plant_id', plantId),
        getHarvestsByPlant(plantId).catch(() => []),
        getTotalHarvestByPlant(plantId).catch(() => []),
      ]);

      setPlant(plantData);

      if (!photoDataResult.error && photoDataResult.data) {
        const photoList = photoDataResult.data
          .map((pp: any) => pp.photos)
          .filter((p: Photo | null) => p !== null)
          .map((p: Photo) => enrichPhotoWithUrl(p))
          .filter((p: Photo) => !!p.photo_url) as Photo[];
        setPhotos(photoList);
      }

      setHarvests(harvestData);
      setHarvestTotals(totals);

    } catch (error: any) {
      console.error('Error fetching plant details:', error);
      Alert.alert('Fehler', 'Pflanze konnte nicht geladen werden.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('de-DE');
  };

   const handleRefresh = async () => {
     if (!plant) return;
     setRefreshing(true);
     try {
       // Prefer latin name for API searches as it's more precise
       const searchName = plant.latin_name || plant.name;
       console.log('Refreshing plant data using search name:', searchName, '(latin_name:', plant.latin_name, ')');
       const result = await refreshPlantData(plant.id, searchName);
       if (result.success) {
         await fetchPlantDetails();
         Alert.alert('Erfolg', `Daten aktualisiert von: ${result.sources.join(', ')}`);
       } else {
         Alert.alert('Info', 'Keine zusätzlichen Daten von APIs gefunden');
       }
     } catch (error) {
       Alert.alert('Fehler', 'Update fehlgeschlagen');
     } finally {
       setRefreshing(false);
     }
   };

  const canRefresh = plant && !hasAllSources(plant.plant_info_sources);

  const handleHealthCheck = async () => {
    if (!plant) return;
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Bitte erlaube Fotzugriff.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    setCheckingHealth(true);
    try {
      const diseaseData = await identifyDisease(result.assets[0].uri);
      
      if (diseaseData) {
        await supabase
          .from('plants')
          .update({
            disease_data: diseaseData,
            last_health_check: new Date().toISOString(),
          })
          .eq('id', plant.id);
        
        await fetchPlantDetails();
        
        const topResult = diseaseData.results[0];
        if (topResult) {
          Alert.alert(
            'Gesundheitscheck',
            `Top-Verdacht: ${topResult.label}\nConfidence: ${Math.round(topResult.score * 100)}%`
          );
        } else {
          Alert.alert('Ergebnis', 'Keine Krankheiten identifiziert. Die Pflanze ist vielleicht nicht in der PlantNet-Datenbank für Krankheiten enthalten.');
        }
      } else {
        Alert.alert('Fehler', 'Krankheitsidentifikation fehlgeschlagen. Bitte anderes Bild versuchen.');
      }
    } catch (error) {
      Alert.alert('Fehler', 'Gesundheitscheck fehlgeschlagen: ' + error);
    } finally {
      setCheckingHealth(false);
    }
  };

  const isExistingPlant = plant && plant.status !== 'geplant' && plant.status !== 'bestellt';

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors2026.primary} />
      </View>
    );
  }

  if (!plant) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Pflanze nicht gefunden</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Glass Header */}
        <BlurView intensity={60} style={styles.glassHeader}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
              <ChevronLeft size={24} color={Colors2026.text} />
            </Pressable>
            <View style={styles.headerInfo}>
              <Text style={styles.plantName}>{plant.name}</Text>
              {plant.latin_name && (
                <Text style={styles.plantLatin}>{plant.latin_name}</Text>
              )}
            </View>
            <Pressable 
              onPress={handleRefresh} 
              style={[styles.editButton, !canRefresh && styles.disabledButton]}
              disabled={!canRefresh || refreshing}
            >
              {refreshing ? (
                <ActivityIndicator size={16} color={Colors2026.primary} />
              ) : (
                <RefreshCw size={20} color={canRefresh ? Colors2026.primary : Colors2026.textMuted} />
              )}
            </Pressable>
            {isExistingPlant && (
              <Pressable 
                onPress={handleHealthCheck} 
                style={[styles.editButton, checkingHealth && styles.disabledButton]}
                disabled={checkingHealth}
              >
                {checkingHealth ? (
                  <ActivityIndicator size={16} color={Colors2026.status.success} />
                ) : (
                  <Heart size={20} color={Colors2026.status.success} />
                )}
              </Pressable>
            )}
            <Pressable onPress={() => navigation.navigate('EditPlant', { plantId: plant.id })} style={styles.editButton}>
              <Edit size={20} color={Colors2026.primary} />
            </Pressable>
          </View>
        </BlurView>

        {/* Status & Quick Info */}
        <View style={styles.quickInfo}>
          <StatusBadge status={plant.status} size="md" />

          <View style={styles.infoRow}>
            {plant.location && (
              <View style={styles.infoChip}>
                <MapPin size={14} color={Colors2026.textMuted} />
                <Text style={styles.infoText}>{plant.location}</Text>
              </View>
            )}
            {plant.quantity && plant.quantity > 1 && (
              <View style={styles.infoChip}>
                <Text style={styles.infoText}>{plant.quantity}x</Text>
              </View>
            )}
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.section}>
          <SectionHeader
            title="Details"
            icon={<Leaf size={20} color={Colors2026.primary} />}
            animated={true}
          />

          <GlassCard variant="light">
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Sprout size={16} color={Colors2026.primary} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Typ</Text>
                  <Text style={styles.detailValue}>{plant.type || '-'}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Calendar size={16} color={Colors2026.primary} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Gepflanzt</Text>
                  <Text style={styles.detailValue}>{formatDate(plant.planted_date)}</Text>
                </View>
              </View>

              {plant.essbar && (
                <View style={styles.detailItem}>
                  <Sparkles size={16} color={Colors2026.status.success} />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Essbar</Text>
                    <Text style={styles.detailValue}>Ja</Text>
                  </View>
                </View>
              )}

              {plant.winterhart && (
                <View style={styles.detailItem}>
                  <Snowflake size={16} color={Colors2026.status.info} />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Winterhart</Text>
                    <Text style={styles.detailValue}>Ja</Text>
                  </View>
                </View>
              )}
            </View>
          </GlassCard>
        </View>

        {/* PlantNet Info Section */}
        {plant.plantnet_data && !plant.plantnet_data.notFound && (
          <View style={styles.section}>
            <SectionHeader
              title="Pflanzen-Info"
              icon={<Leaf size={20} color={Colors2026.primary} />}
              animated={true}
              delay={50}
            />
            <GlassCard variant="light">
              {plant.plantnet_data.commonNames?.length > 0 && (
                <View style={styles.plantNetInfoRow}>
                  <Text style={styles.infoLabel}>Deutsche Namen:</Text>
                  <Text style={styles.infoValue}>
                    {plant.plantnet_data.commonNames.join(', ')}
                  </Text>
                </View>
              )}
              {plant.plantnet_data.family && (
                <View style={styles.plantNetInfoRow}>
                  <Text style={styles.infoLabel}>Familie:</Text>
                  <Text style={styles.infoValue}>{plant.plantnet_data.family}</Text>
                </View>
              )}
              {plant.plantnet_data.genus && (
                <View style={styles.plantNetInfoRow}>
                  <Text style={styles.infoLabel}>Gattung:</Text>
                  <Text style={styles.infoValue}>{plant.plantnet_data.genus}</Text>
                </View>
              )}
              {plant.plantnet_data.scientificName && (
                <View style={styles.plantNetInfoRow}>
                  <Text style={styles.infoLabel}>Wissenschaftlich:</Text>
                  <Text style={[styles.infoValue, styles.italic]}>
                    {plant.plantnet_data.scientificName}
                  </Text>
                </View>
              )}
              {plant.plantnet_data.confidence && (
                <View style={styles.plantNetInfoRow}>
                  <Text style={styles.infoLabel}>KI-Identifikation:</Text>
                  <Text style={styles.infoValue}>
                    {Math.round(plant.plantnet_data.confidence * 100)}% sicher
                  </Text>
                </View>
              )}
            </GlassCard>
          </View>
        )}

        {plant.plantnet_data?.notFound && (
          <View style={styles.section}>
            <View style={styles.notFoundBadge}>
              <Text style={styles.notFoundText}>⚠️ Keine PlantNet-Daten gefunden</Text>
            </View>
          </View>
        )}

        {/* Perenual Info Section */}
        {plant.perenual_data && (
          <View style={styles.section}>
            <SectionHeader
              title="Pflege-Info"
              subtitle="Perenual"
              icon={<Droplets size={20} color={Colors2026.status.info} />}
              animated={true}
              delay={60}
            />
            <GlassCard variant="light">
              {plant.perenual_data.watering && (
                <View style={styles.plantNetInfoRow}>
                  <Text style={styles.infoLabel}>💧 Gießen:</Text>
                  <Text style={styles.infoValue}>{plant.perenual_data.watering}</Text>
                </View>
              )}
              {plant.perenual_data.sunlight && plant.perenual_data.sunlight.length > 0 && (
                <View style={styles.plantNetInfoRow}>
                  <Text style={styles.infoLabel}>☀️ Licht:</Text>
                  <Text style={styles.infoValue}>{plant.perenual_data.sunlight.join(', ')}</Text>
                </View>
              )}
              {plant.perenual_data.care_level && (
                <View style={styles.plantNetInfoRow}>
                  <Text style={styles.infoLabel}>📊 Pflege-Level:</Text>
                  <Text style={styles.infoValue}>{plant.perenual_data.care_level}</Text>
                </View>
              )}
              {plant.perenual_data.growth_rate && (
                <View style={styles.plantNetInfoRow}>
                  <Text style={styles.infoLabel}>📈 Wachstum:</Text>
                  <Text style={styles.infoValue}>{plant.perenual_data.growth_rate}</Text>
                </View>
              )}
              {plant.perenual_data.cycle && (
                <View style={styles.plantNetInfoRow}>
                  <Text style={styles.infoLabel}>🔄 Lebenszyklus:</Text>
                  <Text style={styles.infoValue}>{plant.perenual_data.cycle}</Text>
                </View>
              )}
              {plant.perenual_data.soil && plant.perenual_data.soil.length > 0 && (
                <View style={styles.plantNetInfoRow}>
                  <Text style={styles.infoLabel}>🪴 Boden:</Text>
                  <Text style={styles.infoValue}>{plant.perenual_data.soil.join(', ')}</Text>
                </View>
              )}
              {plant.perenual_data.hardiness && (
                <View style={styles.plantNetInfoRow}>
                  <Text style={styles.infoLabel}>❄️ Winterhärte:</Text>
                  <Text style={styles.infoValue}>Zone {plant.perenual_data.hardiness.min} - {plant.perenual_data.hardiness.max}</Text>
                </View>
              )}
              {plant.perenual_data.maintenance && (
                <View style={styles.plantNetInfoRow}>
                  <Text style={styles.infoLabel}>🔧 Pflegeaufwand:</Text>
                  <Text style={styles.infoValue}>{plant.perenual_data.maintenance}</Text>
                </View>
              )}
              {plant.perenual_data.description && (
                <View style={[styles.plantNetInfoRow, { marginTop: Spacing2026.md }]}>
                  <Text style={styles.infoLabel}>📝 Beschreibung:</Text>
                  <Text style={styles.infoValue}>{plant.perenual_data.description}</Text>
                </View>
              )}
             </GlassCard>
           </View>
         )}

         {/* Growth Characteristics Section */}
         {plant.perenual_data && (
           <View style={styles.section}>
             <SectionHeader
               title="Wachstum"
               icon={<Settings />}
               animated={true}
               delay={80}
             />
             <GlassCard variant="light">
               {plant.perenual_data.growth_rate && (
                 <View style={styles.plantNetInfoRow}>
                   <Text style={styles.infoLabel}>Wachstumsrate:</Text>
                   <Text style={styles.infoValue}>{plant.perenual_data.growth_rate}</Text>
                 </View>
               )}
               {plant.perenual_data.cycle && (
                 <View style={styles.plantNetInfoRow}>
                   <Text style={styles.infoLabel}>Lebenszyklus:</Text>
                   <Text style={styles.infoValue}>{plant.perenual_data.cycle}</Text>
                 </View>
               )}
               {plant.perenual_data.max_height && (
                 <View style={styles.plantNetInfoRow}>
                   <Text style={styles.infoLabel}>Max. Höhe:</Text>
                   <Text style={styles.infoValue}>{plant.perenual_data.max_height} cm</Text>
                 </View>
               )}
               {plant.perenual_data.max_spread && (
                 <View style={styles.plantNetInfoRow}>
                   <Text style={styles.infoLabel}>Max. Breite:</Text>
                   <Text style={styles.infoValue}>{plant.perenual_data.max_spread} cm</Text>
                 </View>
               )}
             </GlassCard>
           </View>
         )}

         {/* Environmental Requirements Section */}
         {plant.perenual_data && (
           <View style={styles.section}>
             <SectionHeader
               title="Umwelt"
               icon={<Sun size={20} color={Colors2026.status.success} />}
               animated={true}
               delay={90}
             />
             <GlassCard variant="light">
               {plant.perenual_data.sunlight && plant.perenual_data.sunlight.length > 0 && (
                 <View style={styles.plantNetInfoRow}>
                   <Text style={styles.infoLabel}>Lichtbedarf:</Text>
                   <Text style={styles.infoValue}>{plant.perenual_data.sunlight.join(', ')}</Text>
                 </View>
               )}
               {plant.perenual_data.watering && (
                 <View style={styles.plantNetInfoRow}>
                   <Text style={styles.infoLabel}>Wasserbedarf:</Text>
                   <Text style={styles.infoValue}>{plant.perenual_data.watering}</Text>
                 </View>
               )}
               {plant.perenual_data.soil && plant.perenual_data.soil.length > 0 && (
                 <View style={styles.plantNetInfoRow}>
                   <Text style={styles.infoLabel}>Boden-pH:</Text>
                   <Text style={styles.infoValue}>{plant.perenual_data.soil.join(', ')}</Text>
                 </View>
               )}
               {plant.perenual_data.hardiness && (
                 <View style={styles.plantNetInfoRow}>
                   <Text style={styles.infoLabel}>Kältezone:</Text>
                   <Text style={styles.infoValue}>Zone {plant.perenual_data.hardiness.min} - {plant.perenual_data.hardiness.max}</Text>
                 </View>
               )}
             </GlassCard>
           </View>
         )}

         {/* Plant Anatomy & Features Section */}
         {plant.perenual_data && (
           <View style={styles.section}>
             <SectionHeader
               title="Anatomie"
               icon={<Cloud size={20} color={Colors2026.status.info} />}
               animated={true}
               delay={100}
             />
             <GlassCard variant="light">
               {plant.perenual_data.edible_parts && plant.perenual_data.edible_parts.length > 0 && (
                 <View style={styles.plantNetInfoRow}>
                   <Text style={styles.infoLabel}>Essbare Teile:</Text>
                   <Text style={styles.infoValue}>{plant.perenual_data.edible_parts.join(', ')}</Text>
                 </View>
               )}
               {plant.perenual_data.poisonous_to_animals !== undefined && (
                 <View style={styles.plantNetInfoRow}>
                   <Text style={styles.infoLabel}>Giftig für Tiere:</Text>
                   <Text style={styles.infoValue}>{plant.perenual_data.poisonous_to_animals ? 'Ja' : 'Nein'}</Text>
                 </View>
               )}
               {plant.perenual_data.poisonous_to_humans !== undefined && (
                 <View style={styles.plantNetInfoRow}>
                   <Text style={styles.infoLabel}>Giftig für Menschen:</Text>
                   <Text style={styles.infoValue}>{plant.perenual_data.poisonous_to_humans ? 'Ja' : 'Nein'}</Text>
                 </View>
               )}
               {plant.perenual_data.invasive && (
                 <View style={styles.plantNetInfoRow}>
                   <Text style={styles.infoLabel}>Invasiv:</Text>
                   <Text style={styles.infoValue}>{plant.perenual_data.invasive ? 'Ja' : 'Nein'}</Text>
                 </View>
               )}
             </GlassCard>
           </View>
         )}

         {/* Description Section */}
         {plant.perenual_data && plant.perenual_data.description && (
           <View style={styles.section}>
             <SectionHeader
               title="Beschreibung"
               icon={<Book size={20} color={Colors2026.primary} />}
               animated={true}
               delay={110}
             />
             <GlassCard variant="light">
               <Text style={styles.infoValue}>{plant.perenual_data.description}</Text>
             </GlassCard>
           </View>
         )}

         {/* Images Section */}
         {plant.perenual_data && plant.perenual_data.images && plant.perenual_data.images.length > 0 && (
           <View style={styles.section}>
             <SectionHeader
               title="Bilder"
               icon={<LucideImage />}
               animated={true}
               delay={120}
             />
             <GlassCard variant="light">
               <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                  {plant.perenual_data.images.map((img: any, index: number) => (
                     <View style={styles.imageContainer} key={index}>
                       <RNImage
                         source={{ uri: img.url }}
                         style={styles.plantImage}
                         resizeMode="cover"
                       />
                       {img.license && (
                         <Text style={styles.imageLicense}>{img.license}</Text>
                       )}
                     </View>
                   ))}
               </ScrollView>
             </GlassCard>
           </View>
         )}

         {/* Permapeople Info Section */}
        {plant.permapeople_data && (
          <View style={styles.section}>
            <SectionHeader
              title="Permakultur"
              subtitle="Permapeople"
              icon={<Sparkles size={20} color={Colors2026.status.success} />}
              animated={true}
              delay={70}
            />
            <GlassCard variant="light">
              {plant.permapeople_data.layers && plant.permapeople_data.layers.length > 0 && (
                <View style={styles.plantNetInfoRow}>
                  <Text style={styles.infoLabel}>🏗️ Permakultur-Layer:</Text>
                  <Text style={styles.infoValue}>{plant.permapeople_data.layers.join(', ')}</Text>
                </View>
              )}
              {plant.permapeople_data.edible_parts && plant.permapeople_data.edible_parts.length > 0 && (
                <View style={styles.plantNetInfoRow}>
                  <Text style={styles.infoLabel}>🍴 Essbare Teile:</Text>
                  <Text style={styles.infoValue}>{plant.permapeople_data.edible_parts.join(', ')}</Text>
                </View>
              )}
              {plant.permapeople_data.water_requirement && (
                <View style={styles.plantNetInfoRow}>
                  <Text style={styles.infoLabel}>💧 Wasserbedarf:</Text>
                  <Text style={styles.infoValue}>{plant.permapeople_data.water_requirement}</Text>
                </View>
              )}
              {plant.permapeople_data.light_requirement && (
                <View style={styles.plantNetInfoRow}>
                  <Text style={styles.infoLabel}>☀️ Lichtbedarf:</Text>
                  <Text style={styles.infoValue}>{plant.permapeople_data.light_requirement}</Text>
                </View>
              )}
              {plant.permapeople_data.usda_hardiness_zone && (
                <View style={styles.plantNetInfoRow}>
                  <Text style={styles.infoLabel}>🌡️ USDA Zone:</Text>
                  <Text style={styles.infoValue}>{plant.permapeople_data.usda_hardiness_zone}</Text>
                </View>
              )}
              {plant.permapeople_data.soil_type && plant.permapeople_data.soil_type.length > 0 && (
                <View style={styles.plantNetInfoRow}>
                  <Text style={styles.infoLabel}>🪨 Bodentyp:</Text>
                  <Text style={styles.infoValue}>{plant.permapeople_data.soil_type.join(', ')}</Text>
                </View>
              )}
            </GlassCard>
          </View>
        )}

        {/* AI Generated Badge */}
        {(plant.perenual_data || plant.permapeople_data) && (
          <View style={styles.section}>
            <View style={styles.aiBadge}>
              <Sparkles size={14} color={Colors2026.status.info} />
              <Text style={styles.aiBadgeText}>KI-generiert (Perenual / Permapeople)</Text>
            </View>
          </View>
        )}

        {/* Health Check Section */}
        {plant.disease_data && (
          <View style={styles.section}>
            <SectionHeader
              title="Gesundheitscheck"
              subtitle={plant.last_health_check ? new Date(plant.last_health_check).toLocaleDateString('de-DE') : ''}
              icon={<Heart size={20} color={Colors2026.status.success} />}
              animated={true}
              delay={150}
            />
            <GlassCard variant="light">
                 {plant.disease_data.results?.slice(0, 3).map((disease: any, index: number) => (
                    <View style={styles.diseaseRow} key={index}>
                      <View style={styles.diseaseInfo}>
                        <Text style={styles.diseaseLabel}>{disease.label}</Text>
                        <Text style={styles.diseaseScore}>
                          {Math.round(disease.score * 100)}% {disease.description && `- ${disease.description}`}
                        </Text>
                      </View>
                    </View>
                 ))}
              {plant.disease_data.results?.length === 0 && (
                <Text style={styles.infoValue}>Keine Krankheiten identifiziert</Text>
              )}
            </GlassCard>
          </View>
        )}

        {/* Photos Section */}
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
                   onPress={() => navigation.navigate('PhotoGallery', { plantId: plant.id })}
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

        {/* Notes Section */}
        {plant.notes && (
          <View style={styles.section}>
            <SectionHeader
              title="Notizen"
              icon={<Droplets size={20} color={Colors2026.primary} />}
              animated={true}
              delay={100}
            />

            <GlassCard variant="light">
              <Text style={styles.notesText}>{plant.notes}</Text>
            </GlassCard>
          </View>
        )}

        {/* Harvests Section */}
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
                      <Text style={styles.harvestName}>{plant.name}</Text>
                      <Text style={styles.harvestValue}>{total.quantity.toFixed(1)} {total.unit}</Text>
                    </View>
                  ))}
              </GlassCard>
          </View>
        )}

        <View style={styles.spacer} />
      </ScrollView>

      {/* FAB */}
      <FloatingAction
        onPress={() => navigation.navigate('AddHarvest', { plantId: plant.id })}
        icon={<Sprout size={24} color="#fff" />}
        accessibilityLabel="Ernte hinzufügen"
      />
    </View>
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
  errorText: {
    fontSize: Typography2026.body.fontSize,
    color: Colors2026.textMuted,
  },
  glassHeader: {
    paddingTop: 60,
    paddingBottom: Spacing2026.xl,
    paddingHorizontal: Spacing2026.xl,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.3)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing2026.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors2026.glass.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  plantName: {
    fontSize: Typography2026.headline.fontSize,
    fontWeight: '800',
    color: Colors2026.text,
    letterSpacing: -0.8,
  },
  plantLatin: {
    fontSize: Typography2026.caption.fontSize,
    color: Colors2026.textMuted,
    fontStyle: 'italic',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors2026.glass.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  quickInfo: {
    paddingHorizontal: Spacing2026.xl,
    paddingVertical: Spacing2026.lg,
  },
  infoRow: {
    flexDirection: 'row',
    gap: Spacing2026.sm,
    marginTop: Spacing2026.md,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing2026.sm,
    paddingVertical: Spacing2026.xs,
    borderRadius: Radius2026.round,
    backgroundColor: Colors2026.bg,
  },
  infoText: {
    fontSize: Typography2026.small.fontSize,
    color: Colors2026.textMuted,
  },
  section: {
    marginBottom: Spacing2026.xl,
    paddingHorizontal: Spacing2026.xl,
  },
  detailsGrid: {
    gap: Spacing2026.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing2026.md,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: Typography2026.small.fontSize,
    color: Colors2026.textMuted,
  },
  detailValue: {
    fontSize: Typography2026.body.fontSize,
    fontWeight: '600',
    color: Colors2026.text,
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
  spacer: {
    height: 100,
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
   plantNetInfoRow: {
     marginBottom: 8,
   },
   infoLabel: {
     fontSize: 12,
     color: Colors2026.textSecondary,
     marginBottom: 2,
   },
   infoValue: {
     fontSize: 14,
     color: Colors2026.text,
   },
   italic: {
     fontStyle: 'italic',
   },
   notFoundBadge: {
     backgroundColor: Colors2026.status.warning + '20',
     borderRadius: 8,
     padding: 12,
   },
   notFoundText: {
     fontSize: 14,
     color: Colors2026.status.warning,
   },
   aiBadge: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'center',
     gap: 6,
     backgroundColor: Colors2026.status.info + '15',
     borderRadius: 8,
     padding: 10,
   },
   aiBadgeText: {
     fontSize: 12,
     color: Colors2026.status.info,
     fontWeight: '500',
   },
   diseaseRow: {
     paddingVertical: Spacing2026.sm,
     borderBottomWidth: 1,
     borderBottomColor: Colors2026.border,
   },
   diseaseInfo: {
     flex: 1,
   },
   diseaseLabel: {
     fontSize: Typography2026.body.fontSize,
     fontWeight: '600',
     color: Colors2026.text,
   },
   diseaseScore: {
     fontSize: Typography2026.small.fontSize,
     color: Colors2026.textMuted,
     marginTop: 2,
   },
   imageScroll: {
     marginTop: Spacing2026.sm,
   },
   imageContainer: {
     marginRight: Spacing2026.sm,
   },
   plantImage: {
     width: 120,
     height: 90,
     borderRadius: Radius2026.md,
     backgroundColor: Colors2026.glass.tint,
   },
   imageLicense: {
     fontSize: Typography2026.caption.fontSize,
     color: Colors2026.textMuted,
     textAlign: 'center',
     marginTop: 4,
   },
});
