import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import Colors from '../theme/colors';
import { ShoppingItemFormData, SHOPPING_CATEGORIES, SHOPPING_PRIORITIES } from '../types/shopping_item';
import { createShoppingItem } from '../services/shoppingService';

type Props = NativeStackScreenProps<RootStackParamList, 'AddShoppingItem'>;

export default function AddShoppingItemScreen({ navigation }: Props) {
  const [formData, setFormData] = useState<ShoppingItemFormData>({
    item_name: '',
    category: 'sonstiges',
    quantity: '',
    priority: 'mittel',
    estimated_price: undefined,
    purchased: false,
    where_to_buy: '',
    link: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);

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

    setLoading(true);
    try {
      // Clean up form data - remove empty strings
      const cleanData: any = { ...formData };
      Object.keys(cleanData).forEach((key) => {
        if (cleanData[key] === '' || (typeof cleanData[key] === 'string' && !cleanData[key].trim())) {
          cleanData[key] = undefined;
        }
      });

      await createShoppingItem(cleanData);
      // Directly go back instead of showing alert - triggers useFocusEffect on ShoppingList
      navigation.goBack();
    } catch (error) {
      console.error('Error creating shopping item:', error);
      Alert.alert('Fehler', 'Artikel konnte nicht gespeichert werden.');
    } finally {
      setLoading(false);
    }
  };

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
              placeholderTextColor={Colors.textDisabled}
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
              placeholderTextColor={Colors.textDisabled}
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
              placeholderTextColor={Colors.textDisabled}
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
              placeholderTextColor={Colors.textDisabled}
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
              placeholderTextColor={Colors.textDisabled}
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
              placeholderTextColor={Colors.textDisabled}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialIcons name="save" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Speichern</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    color: Colors.text,
    marginBottom: 8,
  },
  required: {
    color: Colors.error,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.surface,
  },
  inputError: {
    borderColor: Colors.error,
  },
  inputMultiline: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: Colors.error,
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
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryButtonText: {
    fontSize: 12,
    color: Colors.text,
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
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  priorityButtonActive: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  priorityButtonText: {
    fontSize: 12,
    color: Colors.text,
  },
  priorityButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
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
});
