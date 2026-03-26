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
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors2026, Spacing2026, Radius2026, Typography2026, Shadows2026 } from '../theme/designSystemV2';
import { ShoppingItem, SHOPPING_CATEGORIES, SHOPPING_PRIORITIES } from '../types/shopping_item';
import {
  fetchShoppingItems,
  deleteShoppingItem,
  markAsPurchased,
  ShoppingItemFilters,
} from '../services/shoppingService';
import EmptyState from './ui/EmptyState';
import GlassCard from './ui/GlassCard';
import AnimatedButton from './ui/AnimatedButton';

interface ShoppingListContentProps {
  navigation?: any;
  onAddItem?: () => void;
  showHeader?: boolean;
  embedded?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  saatgut: Colors2026.primary,
  werkzeug: Colors2026.status.warning,
  dünger: Colors2026.accent,
  erde: Colors2026.textSecondary,
  töpfe: Colors2026.primaryLight,
};

const PRIORITY_ICONS: Record<string, any> = {
  dringend: 'priority-high',
  hoch: 'arrow-upward',
  mittel: 'drag-handle',
  niedrig: 'arrow-downward',
};

export default function ShoppingListContent({ 
  navigation, 
  onAddItem,
  showHeader = true,
  embedded = false 
}: ShoppingListContentProps) {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | undefined>();
  const [filterPriority, setFilterPriority] = useState<string | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const searchDebounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const loadItems = useCallback(async () => {
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
  }, [searchQuery, filterCategory, filterPriority]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

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
  }, [searchQuery, filterCategory, filterPriority, loadItems]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadItems();
  };

  const handleAddItem = () => {
    if (onAddItem) {
      onAddItem();
    } else if (navigation) {
      navigation.navigate('AddShoppingItem');
    }
  };

  const handleEditItem = (itemId: string) => {
    if (navigation) {
      navigation.navigate('EditShoppingItem', { itemId });
    }
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
    return CATEGORY_COLORS[category || ''] || Colors2026.textMuted;
  };

  const renderItem = ({ item, index }: { item: ShoppingItem; index: number }) => {
    const categoryColor = getCategoryColor(item.category);
    return (
      <Animated.View entering={FadeInDown.duration(300).delay(index * 50)}>
        <GlassCard style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.item_name}</Text>
              {item.category && (
                <View style={[styles.categoryBadge, { backgroundColor: `${categoryColor}20` }]}>
                  <MaterialIcons name="folder" size={12} color={categoryColor} />
                  <Text style={[styles.categoryBadgeText, { color: categoryColor }]}>
                    {item.category}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.itemActions}>
              <TouchableOpacity 
                onPress={() => handleEditItem(item.id)}
                style={styles.actionButton}
                accessibilityLabel={`${item.item_name} bearbeiten`}
              >
                <MaterialIcons name="edit" size={20} color={Colors2026.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteItem(item.id, item.item_name)}
                style={styles.actionButton}
                accessibilityLabel={`${item.item_name} löschen`}
              >
                <MaterialIcons name="delete" size={20} color={Colors2026.status.error} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.itemDetails}>
            {item.quantity && (
              <View style={styles.detailRow}>
                <MaterialIcons name="shopping-bag" size={16} color={Colors2026.textMuted} />
                <Text style={styles.detailText}>{item.quantity}</Text>
              </View>
            )}

            {item.estimated_price && (
              <View style={styles.detailRow}>
                <MaterialIcons name="euro-symbol" size={16} color={Colors2026.textMuted} />
                <Text style={styles.detailText}>€ {item.estimated_price.toFixed(2)}</Text>
              </View>
            )}

            {item.priority && (
              <View style={styles.detailRow}>
                <MaterialIcons 
                  name={PRIORITY_ICONS[item.priority] || 'arrow-downward'} 
                  size={16} 
                  color={Colors2026.textMuted} 
                />
                <Text style={styles.detailText}>{item.priority}</Text>
              </View>
            )}

            {item.where_to_buy && (
              <View style={styles.detailRow}>
                <MaterialIcons name="store" size={16} color={Colors2026.textMuted} />
                <Text style={styles.detailText}>{item.where_to_buy}</Text>
              </View>
            )}
          </View>

          {item.notes && (
            <View style={styles.notesContainer}>
              <MaterialIcons name="notes" size={14} color={Colors2026.textMuted} />
              <Text style={styles.notesText}>{item.notes}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.markPurchasedButton}
            onPress={() => handleMarkPurchased(item.id)}
            accessibilityLabel={`${item.item_name} als gekauft markieren`}
          >
            <MaterialIcons name="check-circle-outline" size={18} color="#fff" />
            <Text style={styles.markPurchasedButtonText}>Gekauft</Text>
          </TouchableOpacity>
        </GlassCard>
      </Animated.View>
    );
  };

  if (loading && items.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors2026.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, embedded && styles.containerEmbedded]}>
      {showHeader && (
        <Animated.View style={styles.header} entering={FadeInDown.duration(400).delay(100)}>
          <View>
            <Text style={styles.headerTitle}>Einkaufsliste</Text>
            <Text style={styles.headerSubtitle}>
              {items.length === 1 ? '1 Artikel' : `${items.length} Artikel`}
            </Text>
          </View>
          {items.length > 0 && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddItem}
              accessibilityLabel="Neuen Artikel hinzufügen"
            >
              <MaterialIcons name="add" size={28} color="#fff" />
            </TouchableOpacity>
          )}
        </Animated.View>
      )}

      <Animated.View style={styles.searchContainer} entering={FadeInDown.duration(400).delay(200)}>
        <MaterialIcons name="search" size={20} color={Colors2026.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Artikel suchen..."
          placeholderTextColor={Colors2026.textDisabled}
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessibilityLabel="Artikelsuche"
        />
        <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
          <MaterialIcons 
            name="filter-list" 
            size={20} 
            color={hasActiveFilters ? Colors2026.primary : Colors2026.textMuted} 
          />
        </TouchableOpacity>
      </Animated.View>

      {showFilters && (
        <Animated.View style={styles.filterPanel} entering={FadeInDown.duration(300)}>
          <View style={styles.filterContent}>
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Kategorie</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterOptions}>
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

            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Priorität</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterOptions}>
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
        </Animated.View>
      )}

      {items.length === 0 ? (
        <EmptyState
          icon={<MaterialIcons name="shopping-cart" size={48} color={Colors2026.primary} />}
          title={hasActiveFilters ? 'Keine Artikel gefunden' : 'Einkaufsliste leer'}
          subtitle={
            hasActiveFilters
              ? 'Passen Sie Ihre Filter an.'
              : 'Fügen Sie einen Artikel hinzu, um zu beginnen'
          }
          action={
            <AnimatedButton
              title={hasActiveFilters ? 'Filter löschen' : 'Artikel hinzufügen'}
              onPress={hasActiveFilters ? clearAllFilters : handleAddItem}
              size="md"
            />
          }
          containerStyle={styles.emptyContainer}
        />
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={handleRefresh}
              tintColor={Colors2026.primary}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors2026.background,
  },
  containerEmbedded: {
    paddingTop: 0,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors2026.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing2026.lg,
    paddingTop: Spacing2026.xl,
    paddingBottom: Spacing2026.md,
  },
  headerTitle: {
    ...Typography2026.headline,
    color: Colors2026.text,
  },
  headerSubtitle: {
    ...Typography2026.caption,
    color: Colors2026.textMuted,
    marginTop: Spacing2026.xs,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: Radius2026.round,
    backgroundColor: Colors2026.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows2026.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors2026.glass.medium,
    marginHorizontal: Spacing2026.lg,
    marginBottom: Spacing2026.md,
    paddingHorizontal: Spacing2026.md,
    borderRadius: Radius2026.md,
    ...Shadows2026.sm,
  },
  searchInput: {
    flex: 1,
    height: 44,
    marginHorizontal: Spacing2026.sm,
    fontSize: Typography2026.body.fontSize,
    color: Colors2026.text,
  },
  filterPanel: {
    backgroundColor: Colors2026.glass.light,
    marginHorizontal: Spacing2026.lg,
    marginBottom: Spacing2026.md,
    borderRadius: Radius2026.md,
    ...Shadows2026.soft,
  },
  filterContent: {
    padding: Spacing2026.md,
  },
  filterGroup: {
    marginBottom: Spacing2026.sm,
  },
  filterLabel: {
    ...Typography2026.caption,
    fontWeight: '600',
    color: Colors2026.textSecondary,
    marginBottom: Spacing2026.xs,
  },
  filterOptions: {
    flexDirection: 'row',
  },
  filterOption: {
    paddingHorizontal: Spacing2026.md,
    paddingVertical: Spacing2026.xs,
    borderRadius: Radius2026.round,
    borderWidth: 1,
    borderColor: Colors2026.border,
    marginRight: Spacing2026.xs,
    backgroundColor: Colors2026.surface,
  },
  filterOptionActive: {
    backgroundColor: Colors2026.primary,
    borderColor: Colors2026.primary,
  },
  filterOptionText: {
    ...Typography2026.caption,
    color: Colors2026.text,
  },
  filterOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors2026.status.error,
    paddingHorizontal: Spacing2026.md,
    paddingVertical: Spacing2026.xs,
    borderRadius: Radius2026.md,
    alignSelf: 'flex-start',
    marginTop: Spacing2026.xs,
    gap: Spacing2026.xs,
  },
  clearButtonText: {
    color: '#fff',
    ...Typography2026.caption,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: Spacing2026.lg,
    paddingBottom: Spacing2026.xxxl,
  },
  emptyContainer: {
    flex: 1,
  },
  itemCard: {
    padding: Spacing2026.lg,
    marginBottom: Spacing2026.md,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing2026.md,
  },
  itemInfo: {
    flex: 1,
    marginRight: Spacing2026.md,
  },
  itemName: {
    ...Typography2026.title,
    color: Colors2026.text,
    marginBottom: Spacing2026.xs,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing2026.sm,
    paddingVertical: Spacing2026.xs,
    borderRadius: Radius2026.round,
    gap: Spacing2026.xs,
  },
  categoryBadgeText: {
    ...Typography2026.small,
    fontWeight: '600',
  },
  itemActions: {
    flexDirection: 'row',
    gap: Spacing2026.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: Radius2026.md,
    backgroundColor: Colors2026.glass.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetails: {
    marginBottom: Spacing2026.md,
    gap: Spacing2026.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing2026.sm,
  },
  detailText: {
    ...Typography2026.body,
    color: Colors2026.textSecondary,
    textTransform: 'capitalize',
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors2026.glass.tint,
    padding: Spacing2026.sm,
    borderRadius: Radius2026.md,
    marginBottom: Spacing2026.md,
    gap: Spacing2026.sm,
  },
  notesText: {
    ...Typography2026.caption,
    color: Colors2026.textSecondary,
    fontStyle: 'italic',
    flex: 1,
  },
  markPurchasedButton: {
    backgroundColor: Colors2026.status.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing2026.sm,
    paddingHorizontal: Spacing2026.md,
    borderRadius: Radius2026.md,
    gap: Spacing2026.xs,
  },
  markPurchasedButtonText: {
    color: '#fff',
    ...Typography2026.caption,
    fontWeight: '600',
  },
});
