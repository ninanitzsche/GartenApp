import React, { useState } from 'react';
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
import Animated, { FadeInDown } from 'react-native-reanimated';
import { RootStackParamList } from '../types/navigation';
import { Colors2026, Spacing2026, Radius2026, Typography2026, Shadows2026 } from '../theme/designSystemV2';
import { PlantFormData, PLANT_STATUSES, PLANT_TYPES } from '../types/plant';
import { createPlant } from '../services/plantService';
import GlassInput from '../components/ui/GlassInput';
import GlassCard from '../components/ui/GlassCard';
import AnimatedButton from '../components/ui/AnimatedButton';

type Props = NativeStackScreenProps<RootStackParamList, 'AddPlant'>;

export default function AddPlantScreen({ navigation, route }: Props) {
  const { prefillName, prefillLatinName, identificationSource } = route.params || {};
  
  const [formData, setFormData] = useState<PlantFormData>({
    name: prefillName || '',
    latin_name: prefillLatinName || '',
    location: '',
    type: '',
    status: 'geplant',
    winterhart: false,
    essbar: false,
    quantity: undefined,
    planted_date: '',
    harvest_date: '',
    notes: identificationSource === 'ai' ? 'Via KI identifiziert' : '',
    tags: [],
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

    setLoading(true);
    try {
      const cleanData: any = { ...formData };
      Object.keys(cleanData).forEach((key) => {
        if (cleanData[key] === '') {
          cleanData[key] = undefined;
        }
      });

      await createPlant(cleanData);
      Alert.alert('Erfolg', 'Pflanze wurde hinzugefügt.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error creating plant:', error);
      Alert.alert('Fehler', 'Pflanze konnte nicht gespeichert werden.');
    } finally {
      setLoading(false);
    }
  };

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
          <Text style={styles.headerTitle}>Neue Pflanze</Text>
          <Text style={styles.headerSubtitle}>Füge deiner Sammlung eine neue Pflanze hinzu</Text>
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
              {PLANT_TYPES.map((type, index) => (
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

        <Animated.View style={styles.buttonContainer} entering={FadeInDown.duration(400).delay(550)}>
          <AnimatedButton
            title={loading ? '' : 'Speichern'}
            onPress={handleSave}
            disabled={loading}
            fullWidth
            size="lg"
            icon={!loading && <MaterialIcons name="save" size={22} color="#fff" />}
          />
          {loading && <ActivityIndicator color="#fff" />}
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const typeIcons: Record<string, React.ComponentProps<typeof MaterialIcons>['name']> = {
  'gemüse': 'grass',
  'obst': 'restaurant',
  'kräuter': 'spa',
  'blumen': 'local-florist',
  'sonstiges': 'category',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors2026.background,
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
  bottomSpacer: {
    height: Spacing2026.xxxl,
  },
});
