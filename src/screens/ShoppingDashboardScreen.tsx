import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  ScrollView,
  SectionList,
  SectionListData,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { Colors2026, Spacing2026, Radius2026, Typography2026, Shadows2026 } from '../theme/designSystemV2';
import { ShoppingItem, SHOPPING_CATEGORIES } from '../types/shopping_item';
import { fetchShoppingItems, markAsPurchased, markAsNotPurchased } from '../services/shoppingService';

interface ShoppingItemsGrouped {
  category: string;
  categoryLabel: string;
  data: ShoppingItem[];
  totalQuantity: number;
  estimatedTotal: number;
}

type Props = NativeStackScreenProps<RootStackParamList, 'ShoppingDashboard'>;

export default function ShoppingDashboardScreen({ navigation }: Props) {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [groupedItems, setGroupedItems] = useState<ShoppingItemsGrouped[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [unpurchasedCount, setUnpurchasedCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadShoppingItems();
    }, [])
  );

  useEffect(() => {
    groupAndCalculateItems(items);
  }, [items]);

  const loadShoppingItems = async () => {
    try {
      // Fetch only unpurchased items for the dashboard
      const data = await fetchShoppingItems({ purchased: false });
      setItems(data);
    } catch (error) {
      console.error('Error loading shopping items:', error);
      Alert.alert('Fehler', 'Einkaufsliste konnte nicht geladen werden.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const groupAndCalculateItems = (itemsToGroup: ShoppingItem[]) => {
    const grouped: { [key: string]: ShoppingItem[] } = {};

    // Initialize all categories
    SHOPPING_CATEGORIES.forEach((cat) => {
      grouped[cat.value] = [];
    });

    // Group items by category
    itemsToGroup.forEach((item) => {
      const category = item.category || 'sonstiges';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });

    // Convert to array format and calculate totals
    const groupedArray: ShoppingItemsGrouped[] = SHOPPING_CATEGORIES.map((cat) => {
      const categoryItems = grouped[cat.value];
      const estimatedTotal = categoryItems.reduce((sum, item) => {
        return sum + (item.estimated_price || 0);
      }, 0);

      return {
        category: cat.value,
        categoryLabel: cat.label,
        data: categoryItems,
        totalQuantity: categoryItems.length,
        estimatedTotal,
      };
    }).filter((group) => group.data.length > 0); // Only show categories with items

    // Calculate overall total
    const total = groupedArray.reduce((sum, group) => sum + group.estimatedTotal, 0);
    const unpurchased = itemsToGroup.length;

    setGroupedItems(groupedArray);
    setTotalCost(total);
    setUnpurchasedCount(unpurchased);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadShoppingItems();
  };

  const handleBuyItem = async (item: ShoppingItem) => {
    try {
      await markAsPurchased(item.id);
      // Remove from list
      const updated = items.filter((i) => i.id !== item.id);
      setItems(updated);
    } catch (error) {
      console.error('Error marking item as purchased:', error);
      Alert.alert('Fehler', 'Artikel konnte nicht als gekauft markiert werden.');
    }
  };

  const handleClearPurchased = async () => {
    Alert.alert(
      'Gekaufte Artikel löschen',
      'Möchten Sie alle gekauften Artikel aus der Einkaufsliste entfernen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            try {
              // Fetch all items including purchased
              const allItems = await fetchShoppingItems();
              const purchasedItems = allItems.filter((item) => item.purchased);

              // Mark all as not purchased (to remove from dashboard)
              // In a real app, you might want to delete them entirely
              for (const item of purchasedItems) {
                await markAsNotPurchased(item.id);
              }

              loadShoppingItems();
              Alert.alert('Erfolg', 'Gekaufte Artikel wurden entfernt.');
            } catch (error) {
              console.error('Error clearing purchased items:', error);
              Alert.alert('Fehler', 'Gekaufte Artikel konnten nicht entfernt werden.');
            }
          },
        },
      ]
    );
  };

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'saatgut':
        return 'grain';
      case 'dünger':
        return 'local-florist';
      case 'werkzeug':
        return 'build';
      case 'erde':
        return 'terrain';
      case 'töpfe':
        return 'local-florist';
      case 'sonstiges':
      default:
        return 'more-horiz';
    }
  };

  const renderCategoryHeader = (
    category: ShoppingItemsGrouped,
    index: number
  ) => (
    <View style={styles.categoryHeader}>
      <View style={styles.categoryTitleSection}>
        <MaterialIcons name={getCategoryIcon(category.category) as any} size={24} color={Colors2026.primary} />
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryTitle}>{category.categoryLabel}</Text>
          <Text style={styles.categoryMeta}>
            {category.totalQuantity} Artikel
          </Text>
        </View>
      </View>
      <View style={styles.categoryPrice}>
        <Text style={styles.categoryPriceAmount}>
          {category.estimatedTotal.toFixed(2)} €
        </Text>
      </View>
    </View>
  );

  const renderShoppingItem = (item: ShoppingItem) => (
    <View style={styles.shoppingItemContainer}>
      <View style={styles.shoppingItemContent}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.item_name}</Text>
          {item.quantity && (
            <Text style={styles.itemMeta}>Menge: {item.quantity}</Text>
          )}
          {item.where_to_buy && (
            <View style={styles.itemLocation}>
              <MaterialIcons name="place" size={14} color={Colors2026.textSecondary} />
              <Text style={styles.itemLocationText}>{item.where_to_buy}</Text>
            </View>
          )}
        </View>
        <View style={styles.itemPriceSection}>
          {item.estimated_price ? (
            <Text style={styles.itemPrice}>{item.estimated_price.toFixed(2)} €</Text>
          ) : (
            <Text style={styles.itemPriceUnset}>Preis nicht angegeben</Text>
          )}
        </View>
      </View>
      <TouchableOpacity
        style={styles.buyButton}
        onPress={() => handleBuyItem(item)}
        activeOpacity={0.7}
      >
        <MaterialIcons name="check-circle" size={24} color={Colors2026.status.success} />
        <Text style={styles.buyButtonText}>Gekauft</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="shopping-cart" size={80} color={Colors2026.border} />
      <Text style={styles.emptyTitle}>Einkaufsliste ist leer</Text>
      <Text style={styles.emptyText}>
        Alle Artikel wurden bereits gekauft oder es wurden noch keine Artikel hinzugefügt.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors2026.primary} />
        <Text style={styles.loadingText}>Lade Einkaufsliste...</Text>
      </View>
    );
  }

  if (groupedItems.length === 0) {
    return (
      <View style={styles.container}>
        {renderEmptyState()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={groupedItems}
        renderItem={({ item, index }) => (
          <View key={item.category}>
            {renderCategoryHeader(item, index)}
            {item.data.map((shoppingItem) => (
              <View key={shoppingItem.id}>
                {renderShoppingItem(shoppingItem)}
              </View>
            ))}
          </View>
        )}
        keyExtractor={(item) => item.category}
        contentContainerStyle={styles.listContent}
        scrollEnabled={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors2026.primary}
            colors={[Colors2026.primary]}
          />
        }
      />

      {/* Summary Footer */}
      {unpurchasedCount > 0 && (
        <View style={styles.summaryFooter}>
          <View style={styles.summaryContent}>
            <View>
              <Text style={styles.summaryLabel}>Gesamt zu kaufen:</Text>
              <Text style={styles.summaryTotal}>{totalCost.toFixed(2)} €</Text>
            </View>
            <View style={styles.summaryStats}>
              <Text style={styles.summaryCount}>{unpurchasedCount} Artikel</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearPurchased}
            activeOpacity={0.7}
          >
            <MaterialIcons name="delete-sweep" size={20} color="#fff" />
            <Text style={styles.clearButtonText}>Gekaufte löschen</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
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
    marginTop: 12,
    fontSize: 16,
    color: Colors2026.textSecondary,
  },
  listContent: {
    padding: 16,
    paddingBottom: 140, // Space for footer
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors2026.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    marginTop: 8,
  },
  categoryTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryInfo: {
    marginLeft: 12,
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  categoryMeta: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  categoryPrice: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  categoryPriceAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  shoppingItemContainer: {
    backgroundColor: Colors2026.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  shoppingItemContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors2026.text,
    marginBottom: 4,
  },
  itemMeta: {
    fontSize: 13,
    color: Colors2026.textSecondary,
    marginBottom: 2,
  },
  itemLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  itemLocationText: {
    fontSize: 12,
    color: Colors2026.textSecondary,
    marginLeft: 4,
  },
  itemPriceSection: {
    marginLeft: 12,
    minWidth: 80,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors2026.primary,
    textAlign: 'right',
  },
  itemPriceUnset: {
    fontSize: 12,
    color: Colors2026.textSecondary,
    textAlign: 'right',
  },
  buyButton: {
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  buyButtonText: {
    fontSize: 11,
    color: Colors2026.status.success,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors2026.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors2026.textSecondary,
    textAlign: 'center',
  },
  summaryFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors2026.surface,
    borderTopColor: Colors2026.border,
    borderTopWidth: 1,
    padding: 16,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors2026.textSecondary,
    marginBottom: 2,
  },
  summaryTotal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors2026.primary,
  },
  summaryStats: {
    alignItems: 'flex-end',
  },
  summaryCount: {
    fontSize: 14,
    color: Colors2026.text,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: Colors2026.status.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
