import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { Colors2026, Spacing2026, Radius2026, Typography2026, Shadows2026 } from '../theme/designSystemV2';
import Animated, { FadeInDown } from 'react-native-reanimated';
import GlassCard from '../components/ui/GlassCard';
import GlassInput from '../components/ui/GlassInput';
import AnimatedButton from '../components/ui/AnimatedButton';
import { ShoppingItemFormData, SHOPPING_CATEGORIES, SHOPPING_PRIORITIES } from '../types/shopping_item';
import { fetchShoppingItem, updateShoppingItem, deleteShoppingItem } from '../services/shoppingService';

type Props = NativeStackScreenProps<RootStackParamList, 'EditShoppingItem'>;

export default function EditShoppingItemScreen({ navigation, route }: Props) {
  const { itemId } = route.params;
  const [formData, setFormData] = useState<ShoppingItemFormData>({
    item_name: '',
    category: 'sonstiges',
    quantity: '',
    priority: 'mittel',
    estimated_price: undefined,
    where_to_buy: '',
    link: '',
    notes: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadItem();
  }, [itemId]);

  const loadItem = async () => {
    try {
      const item = await fetchShoppingItem(itemId);
      if (item) {
        setFormData({
          item_name: item.item_name || '',
          category: item.category || 'sonstiges',
          quantity: item.quantity || '',
          priority: item.priority || 'mittel',
          estimated_price: item.estimated_price,
          where_to_buy: item.where_to_buy || '',
          link: item.link || '',
          notes: item.notes || '',
        });
      }
    } catch (error) {
      console.error('Error loading shopping item:', error);
      Alert.alert('Fehler', 'Artikel konnte nicht geladen werden.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.item_name.trim()) {
      newErrors.item_name = 'Name des Artikels ist erforderlich';
    }

    if (formData.estimated_price !== undefined && formData.estimated_price < 0) {
      newErrors.estimated_price = 'Preis muss positiv sein';
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
        if (cleanData[key] === '' || (typeof cleanData[key] === 'string' && !cleanData[key].trim())) {
          cleanData[key] = undefined;
        }
      });

      await updateShoppingItem(itemId, cleanData);
      Alert.alert('Erfolg', 'Artikel wurde aktualisiert.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error updating shopping item:', error);
      Alert.alert('Fehler', 'Artikel konnte nicht gespeichert werden.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Artikel löschen',
      `Möchten Sie "${formData.item_name}" wirklich löschen?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteShoppingItem(itemId);
              Alert.alert('Erfolg', 'Artikel wurde gelöscht.', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              console.error('Error deleting item:', error);
              Alert.alert('Fehler', 'Artikel konnte nicht gelöscht werden.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors2026.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          {/* Item Name - Required */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Artikel-Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.item_name && styles.inputError]}
              value={formData.item_name}
              onChangeText={(text) => setFormData({ ...formData, item_name: text })}
              placeholder="z.B. Tomatensamen"
              placeholderTextColor={Colors2026.textDisabled}
            />
            {errors.item_name && <Text style={styles.errorText}>{errors.item_name}</Text>}
          </View>

          {/* Category */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Kategorie</Text>
            <View style={styles.categoryContainer}>
              {SHOPPING_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryButton,
                    formData.category === cat.value && styles.categoryButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, category: cat.value })}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      formData.category === cat.value && styles.categoryButtonTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quantity */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Menge</Text>
            <TextInput
              style={styles.input}
              value={formData.quantity}
              onChangeText={(text) => setFormData({ ...formData, quantity: text })}
              placeholder="z.B. 2kg oder 1 Pack"
              placeholderTextColor={Colors2026.textDisabled}
            />
          </View>

          {/* Priority */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Priorität</Text>
            <View style={styles.priorityContainer}>
              {SHOPPING_PRIORITIES.map((prio) => (
                <TouchableOpacity
                  key={prio.value}
                  style={[
                    styles.priorityButton,
                    formData.priority === prio.value && styles.priorityButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, priority: prio.value })}
                >
                  <Text
                    style={[
                      styles.priorityButtonText,
                      formData.priority === prio.value && styles.priorityButtonTextActive,
                    ]}
                  >
                    {prio.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Estimated Price */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Geschätzter Preis (€)</Text>
            <TextInput
              style={[styles.input, errors.estimated_price && styles.inputError]}
              value={formData.estimated_price?.toString()}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  estimated_price: text ? parseFloat(text) : undefined,
                })
              }
              placeholder="z.B. 12.99"
              placeholderTextColor={Colors2026.textDisabled}
              keyboardType="decimal-pad"
            />
            {errors.estimated_price && <Text style={styles.errorText}>{errors.estimated_price}</Text>}
          </View>

          {/* Where to Buy */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Wo kaufen?</Text>
            <TextInput
              style={styles.input}
              value={formData.where_to_buy}
              onChangeText={(text) => setFormData({ ...formData, where_to_buy: text })}
              placeholder="z.B. Baumarkt XY"
              placeholderTextColor={Colors2026.textDisabled}
            />
          </View>

          {/* Link */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Link</Text>
            <TextInput
              style={styles.input}
              value={formData.link}
              onChangeText={(text) => setFormData({ ...formData, link: text })}
              placeholder="Produktlink (optional)"
              placeholderTextColor={Colors2026.textDisabled}
            />
          </View>

          {/* Notes */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Notizen</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              placeholder="Zusätzliche Informationen"
              placeholderTextColor={Colors2026.textDisabled}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialIcons name="save" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>Speichern</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <MaterialIcons name="delete" size={20} color="#fff" />
              <Text style={styles.deleteButtonText}>Löschen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors2026.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors2026.text,
    marginBottom: 8,
  },
  required: {
    color: Colors2026.status.error,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors2026.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Colors2026.text,
    backgroundColor: Colors2026.surface,
  },
  inputError: {
    borderColor: Colors2026.status.error,
  },
  inputMultiline: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: Colors2026.status.error,
    fontSize: 12,
    marginTop: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors2026.border,
    backgroundColor: Colors2026.surface,
  },
  categoryButtonActive: {
    backgroundColor: Colors2026.primary,
    borderColor: Colors2026.primary,
  },
  categoryButtonText: {
    fontSize: 12,
    color: Colors2026.text,
  },
  categoryButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  priorityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priorityButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors2026.border,
    backgroundColor: Colors2026.surface,
  },
  priorityButtonActive: {
    backgroundColor: Colors2026.status.success,
    borderColor: Colors2026.status.success,
  },
  priorityButtonText: {
    fontSize: 12,
    color: Colors2026.text,
  },
  priorityButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors2026.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: Colors2026.status.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
