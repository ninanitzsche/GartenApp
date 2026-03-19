import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import Colors from '../theme/colors';
import { ShoppingItem, SHOPPING_CATEGORIES, SHOPPING_PRIORITIES } from '../types/shopping_item';
import {
  fetchShoppingItems,
  deleteShoppingItem,
  markAsPurchased,
  markAsNotPurchased,
  ShoppingItemFilters,
} from '../services/shoppingService';
import EmptyState from '../components/EmptyState';

type Props = NativeStackScreenProps<RootStackParamList, 'ShoppingList'>;

export default function ShoppingListScreen({ navigation }: Props) {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | undefined>();
  const [filterPriority, setFilterPriority] = useState<string | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const searchDebounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useFocusEffect(
    useCallback(() => {
      console.log('ShoppingList focused, loading items');
      loadItems();
    }, [])
  );

  // Fallback: Also load on mount
  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      loadItems();
    }, 300);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchQuery, filterCategory, filterPriority]);

  const loadItems = async () => {
    try {
      const filters: ShoppingItemFilters = {
        searchQuery: searchQuery || undefined,
        category: filterCategory,
        priority: filterPriority,
        purchased: false,
      };
      const data = await fetchShoppingItems(filters);
      setItems(data);
    } catch (error) {
      console.error('Error loading shopping items:', error);
      Alert.alert('Fehler', 'Artikel konnten nicht geladen werden.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadItems();
  };

  const handleAddItem = () => {
    navigation.navigate('AddShoppingItem');
  };

  const handleEditItem = (itemId: string) => {
    navigation.navigate('EditShoppingItem', { itemId });
  };

  const handleDeleteItem = (itemId: string, itemName: string) => {
    Alert.alert(
      'Artikel löschen',
      `Möchten Sie "${itemName}" wirklich löschen?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteShoppingItem(itemId);
              loadItems();
              Alert.alert('Erfolg', 'Artikel wurde gelöscht.');
            } catch (error) {
              console.error('Error deleting item:', error);
              Alert.alert('Fehler', 'Artikel konnte nicht gelöscht werden.');
            }
          },
        },
      ]
    );
  };

  const handleMarkPurchased = async (itemId: string, actualPrice?: number) => {
    try {
      await markAsPurchased(itemId, actualPrice);
      loadItems();
    } catch (error) {
      console.error('Error marking as purchased:', error);
      Alert.alert('Fehler', 'Status konnte nicht aktualisiert werden.');
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setFilterCategory(undefined);
    setFilterPriority(undefined);
  };

  const hasActiveFilters = searchQuery || filterCategory || filterPriority;

  const getCategoryColor = (category?: string): string => {
    switch (category) {
      case 'saatgut':
        return Colors.primary;
      case 'werkzeug':
        return Colors.statusGeerntet;
      case 'dünger':
        return Colors.secondaryDark;
      case 'erde':
        return Colors.secondary;
      case 'töpfe':
        return Colors.secondaryLight;
      default:
        return Colors.textLight;
    }
  };

  const getPriorityIcon = (priority?: string): string => {
    switch (priority) {
      case 'dringend':
        return 'priority-high';
      case 'hoch':
        return 'arrow-upward';
      case 'mittel':
        return 'drag-handle';
      default:
        return 'arrow-downward';
    }
  };

  const renderItem = ({ item }: { item: ShoppingItem }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.item_name}</Text>
          {item.category && (
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
              <Text style={styles.categoryBadgeText}>{item.category}</Text>
            </View>
          )}
        </View>
        <View style={styles.itemActions}>
          <TouchableOpacity onPress={() => handleEditItem(item.id)}>
            <MaterialIcons name="edit" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteItem(item.id, item.item_name)}
            style={{ marginLeft: 12 }}
          >
            <MaterialIcons name="delete" size={24} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Item Details */}
      <View style={styles.itemDetails}>
        {item.quantity && (
          <View style={styles.detailRow}>
            <MaterialIcons name="shopping-bag" size={16} color={Colors.textLight} />
            <Text style={styles.detailText}>{item.quantity}</Text>
          </View>
        )}

        {item.estimated_price && (
          <View style={styles.detailRow}>
            <MaterialIcons name="euro-symbol" size={16} color={Colors.textLight} />
            <Text style={styles.detailText}>€ {item.estimated_price.toFixed(2)}</Text>
          </View>
        )}

        {item.priority && (
          <View style={styles.detailRow}>
            <MaterialIcons name={getPriorityIcon(item.priority)} size={16} color={Colors.textLight} />
            <Text style={styles.detailText}>{item.priority}</Text>
          </View>
        )}

        {item.where_to_buy && (
          <View style={styles.detailRow}>
            <MaterialIcons name="store" size={16} color={Colors.textLight} />
            <Text style={styles.detailText}>{item.where_to_buy}</Text>
          </View>
        )}
      </View>

      {/* Notes */}
      {item.notes && <Text style={styles.notesText}>{item.notes}</Text>}

      {/* Mark as Purchased Button */}
      <TouchableOpacity
        style={styles.markPurchasedButton}
        onPress={() => handleMarkPurchased(item.id)}
      >
        <MaterialIcons name="check-circle-outline" size={18} color="#fff" />
        <Text style={styles.markPurchasedButtonText}>Gekauft</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color={Colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Artikel suchen..."
          placeholderTextColor={Colors.textDisabled}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
          <MaterialIcons name="filter-list" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Filter Panel */}
      {showFilters && (
        <ScrollView style={styles.filterPanel} horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterContent}>
            {/* Category Filter */}
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Kategorie</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterOptions}
              >
                {SHOPPING_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[
                      styles.filterOption,
                      filterCategory === cat.value && styles.filterOptionActive,
                    ]}
                    onPress={() =>
                      setFilterCategory(filterCategory === cat.value ? undefined : cat.value)
                    }
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        filterCategory === cat.value && styles.filterOptionTextActive,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Priority Filter */}
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Priorität</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterOptions}
              >
                {SHOPPING_PRIORITIES.map((prio) => (
                  <TouchableOpacity
                    key={prio.value}
                    style={[
                      styles.filterOption,
                      filterPriority === prio.value && styles.filterOptionActive,
                    ]}
                    onPress={() =>
                      setFilterPriority(filterPriority === prio.value ? undefined : prio.value)
                    }
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        filterPriority === prio.value && styles.filterOptionTextActive,
                      ]}
                    >
                      {prio.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {hasActiveFilters && (
              <TouchableOpacity style={styles.clearButton} onPress={clearAllFilters}>
                <MaterialIcons name="clear-all" size={18} color="#fff" />
                <Text style={styles.clearButtonText}>Filter löschen</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      )}

      {/* Items List */}
      {items.length === 0 ? (
        <EmptyState
          icon="shopping-cart"
          title="Einkaufsliste leer"
          message="Fügen Sie einen Artikel hinzu, um zu beginnen"
          action={{
            label: 'Artikel hinzufügen',
            onPress: handleAddItem,
          }}
          containerStyle={styles.emptyContainer}
        />
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        />
      )}

      {/* Add Button */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={handleAddItem}
        accessibilityLabel="Neuen Artikel hinzufügen"
        accessibilityRole="button"
      >
        <MaterialIcons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginHorizontal: 8,
    fontSize: 14,
    color: Colors.text,
  },
  filterPanel: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterContent: {
    padding: 12,
  },
  filterGroup: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
    backgroundColor: Colors.background,
  },
  filterOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterOptionText: {
    fontSize: 12,
    color: Colors.text,
  },
  filterOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 8,
  },
  itemCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
  itemActions: {
    flexDirection: 'row',
  },
  itemDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 13,
    color: Colors.textLight,
    marginLeft: 8,
    textTransform: 'capitalize',
  },
  notesText: {
    fontSize: 12,
    color: Colors.textLight,
    fontStyle: 'italic',
    marginBottom: 12,
    padding: 8,
    backgroundColor: Colors.background,
    borderRadius: 6,
  },
  markPurchasedButton: {
    backgroundColor: Colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  markPurchasedButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
