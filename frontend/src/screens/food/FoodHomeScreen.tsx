// ============================================================
// SCREEN: GoBite Home (Theme Uniform Refined UI)
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@hooks/useTheme';
import { typography, spacing, borderRadius, shadows } from '@theme/index';
import { Icon, type IconSet } from '@components/index';
import { RESTAURANTS, RESTAURANT_DETAILS } from '@services/mockData';
import type { TabScreenProps } from '@navigation/types';
import { useUserStore } from '@store/index';
import { API_BASE_URL } from '@services/apiConfig';

const CategoryItem = ({ item, isActive, colors, onPress }: { item: any; isActive: boolean; colors: any; onPress: () => void }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.92,
      useNativeDriver: true,
      tension: 120,
      friction: 6,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 120,
      friction: 6,
    }).start();
  };

  return (
    <TouchableOpacity 
      style={styles.category} 
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <Animated.View style={[
        styles.categoryIcon,
        {
          backgroundColor: isActive ? colors.primary : colors.surface,
          borderColor: isActive ? colors.primary : colors.border,
          borderWidth: 1,
          transform: [{ scale }]
        },
        shadows.small
      ]}>
        <Icon name={item.icon} set={item.set} size={18} color={isActive ? '#FFFFFF' : colors.foodOrange} />
      </Animated.View>
      <Text style={[
        styles.categoryName,
        {
          color: isActive ? colors.textPrimary : colors.textSecondary,
          fontWeight: isActive ? '700' : '500',
        }
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );
};

const RestaurantCardItem = ({ restaurant, colors, navigation }: { restaurant: any; colors: any; navigation: any }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      tension: 120,
      friction: 6,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 120,
      friction: 6,
    }).start();
  };

  return (
    <TouchableOpacity
      style={{ width: '100%' }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.955}
      onPress={() => navigation.navigate('RestaurantDetail' as any, { restaurantId: restaurant.id })}
    >
      <Animated.View style={[
        styles.restaurantCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1.2,
          transform: [{ scale }]
        },
        shadows.small,
      ]}>
        <View style={styles.cardContentRow}>
          {/* Left Side Info */}
          <View style={styles.cardLeftCol}>
            <Text style={[styles.restaurantNameText, { color: colors.textPrimary }]} numberOfLines={2}>
              {restaurant.name.includes(' ') 
                ? restaurant.name.replace(' ', '\n') 
                : restaurant.name}
            </Text>
            
            <View style={styles.cardMetaRow}>
              <View style={[styles.cardMetaPill, { backgroundColor: colors.surfaceAlt }]}>
                <Icon name="star" set="material" size={11} color="#FFD700" />
                <Text style={[styles.cardMetaText, { color: colors.textPrimary }]}>{restaurant.rating}</Text>
              </View>
              <View style={[styles.cardMetaPill, { backgroundColor: colors.surfaceAlt }]}>
                <Icon name="clock-time-four" set="material" size={11} color={colors.textSecondary} />
                <Text style={[styles.cardMetaText, { color: colors.textSecondary }]}>{restaurant.deliveryTimeMin}-{restaurant.deliveryTimeMax}m</Text>
              </View>
            </View>

            <View style={styles.cardBottomRow}>
              <Text style={[styles.cardPriceText, { color: colors.textSecondary }]}>
                {restaurant.isFreeDelivery ? 'Free Delivery' : `GH₵${restaurant.deliveryFee.toFixed(2)}`}
              </Text>
              <View style={[styles.cardAddButton, { backgroundColor: colors.primary }]}>
                <Icon name="plus" set="feather" size={15} color="#FFFFFF" />
              </View>
            </View>
          </View>

          {/* Right Side Visual Block */}
          <View style={styles.cardRightCol}>
            <LinearGradient
              colors={restaurant.gradient as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardVisualGradient}
            >
              <Icon 
                name={restaurant.id === '1' ? 'food-drumstick' : restaurant.id === '2' ? 'pizza' : 'hamburger'} 
                set="material" 
                size={38} 
                color="rgba(0,0,0,0.15)" 
              />
            </LinearGradient>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const CATEGORIES: { id: string; name: string; icon: string; set: IconSet }[] = [
  { id: '1', name: 'Popular', icon: 'fire', set: 'material' },
  { id: '2', name: 'Chicken', icon: 'food-drumstick', set: 'material' },
  { id: '3', name: 'Pizza', icon: 'pizza', set: 'material' },
  { id: '4', name: 'Burgers', icon: 'hamburger', set: 'material' },
  { id: '5', name: 'Local', icon: 'bowl-mix', set: 'material' },
  { id: '6', name: 'Drinks', icon: 'cup', set: 'material' },
  { id: '7', name: 'Dessert', icon: 'cake-variant', set: 'material' },
];

export const FoodHomeScreen: React.FC<TabScreenProps<'Food'>> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { name, initials, balance, orders, avatarUrl } = useUserStore();
  const [activeCategory, setActiveCategory] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [restaurants, setRestaurants] = useState<any[]>(RESTAURANTS);

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/restaurants`);
        if (!response.ok) throw new Error('Failed to load restaurants');
        const json = await response.json();
        if (json.success && Array.isArray(json.data)) {
          const gradients: Record<string, string[]> = {
            '1': ['#FDF0E0', '#FBD9B0'],
            '2': ['#E8F5E9', '#C8E6C9'],
            '3': ['#FFFDE7', '#FFF9C4'],
          };
          const mapped = json.data.map((r: any) => ({
            id: String(r.id),
            name: r.name,
            tagline: r.tagline || r.cuisineType || 'Food • Dining',
            gradient: gradients[String(r.id)] || ['#F5F5F5', '#E0E0E0'],
            rating: r.rating || 4.0,
            deliveryTimeMin: r.deliveryTimeMin || 30,
            deliveryTimeMax: r.deliveryTimeMax || 45,
            deliveryFee: r.deliveryFee || 5.0,
            isOpen: r.isOpen !== undefined ? r.isOpen : true,
            isFreeDelivery: r.deliveryFee === 0,
            isFavorite: String(r.id) === '2',
          }));
          setRestaurants(mapped);
        }
      } catch (error) {
        console.warn('Backend restaurants fetch failed (offline fallback):', error);
      }
    };
    loadRestaurants();
  }, []);

  const filteredRestaurants = restaurants.filter((restaurant) => {
    // 1. Filter by category
    const category = CATEGORIES.find(c => c.id === activeCategory);
    if (category && category.name !== 'Popular') {
      const catName = category.name.toLowerCase();
      const matchesCategory = restaurant.tagline.toLowerCase().includes(catName) || 
        (catName === 'burgers' && restaurant.tagline.toLowerCase().includes('burger')) ||
        (catName === 'local' && restaurant.tagline.toLowerCase().includes('local')) ||
        (catName === 'drinks' && restaurant.tagline.toLowerCase().includes('drink'));
      
      if (!matchesCategory) return false;
    }

    // 2. Filter by search query
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    // Match name
    if (restaurant.name.toLowerCase().includes(query)) return true;

    // Match tagline
    if (restaurant.tagline.toLowerCase().includes(query)) return true;

    // Match dishes/menu items
    const detail = RESTAURANT_DETAILS[restaurant.id];
    if (detail && detail.menuSections) {
      const matchesDish = detail.menuSections.some((section) =>
        section.items.some((item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
        )
      );
      if (matchesDish) return true;
    }

    return false;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* ===== Curved Brand Gradient Header (Theme Uniform) ===== */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.curvedHeader}
      >
        <View style={styles.headerTopRow}>
          {/* Profile details */}
          <TouchableOpacity
            style={styles.profileRow}
            onPress={() => navigation.navigate('Profile' as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.avatar, { backgroundColor: 'rgba(255,255,255,0.2)', overflow: 'hidden' }]}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={{ width: '100%', height: '100%' }} />
              ) : (
                <Text style={[styles.avatarText, { color: '#FFFFFF' }]}>{initials()}</Text>
              )}
            </View>
            <View>
              <Text style={[styles.profileName, { color: '#FFFFFF' }]}>{name}</Text>
              <Text style={[styles.profileSub, { color: 'rgba(255,255,255,0.7)' }]}>gozone.vip/{name.toLowerCase().replace(/\s+/g, '')}</Text>
            </View>
          </TouchableOpacity>
          
          {/* SuperWallet Balance display */}
          <View style={styles.walletHeaderBlock}>
            <Text style={[styles.walletHeaderLabel, { color: 'rgba(255,255,255,0.6)' }]}>SUPERWALLET</Text>
            <Text style={[styles.walletHeaderValue, { color: '#FFFFFF' }]}>GH₵ {balance.toFixed(2)}</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#FFFFFF' }]}>{orders ? orders.length : 0}</Text>
            <Text style={[styles.statLabel, { color: 'rgba(255,255,255,0.7)' }]}>Orders</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#FFFFFF' }]}>56</Text>
            <Text style={[styles.statLabel, { color: 'rgba(255,255,255,0.7)' }]}>Reviews</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#FFFFFF' }]}>17</Text>
            <Text style={[styles.statLabel, { color: 'rgba(255,255,255,0.7)' }]}>Vouchers</Text>
          </View>
        </View>
      </LinearGradient>

      {/* ===== Overlapping Search Bar ===== */}
      <View style={styles.searchWrapper}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface }, shadows.medium]}>
          <Icon name="search" set="feather" size={16} color={colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search restaurants or dishes"
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
              <Icon name="x" set="feather" size={14} color={colors.textTertiary} />
            </TouchableOpacity>
          ) : (
            <>
              <View style={[styles.searchDivider, { backgroundColor: colors.border }]} />
              <Icon name="sliders" set="feather" size={15} color={colors.textSecondary} />
            </>
          )}
        </View>
      </View>

      {/* ===== Scrollable Content ===== */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Promo Banner */}
        <View style={[styles.promoBanner, shadows.small]}>
          <View style={styles.promoOverlay} />
          <View style={styles.promoContent}>
            <View style={styles.promoBadge}>
              <Text style={styles.promoBadgeText}>SPECIAL OFFER</Text>
            </View>
            <Text style={styles.promoTitle}>Get 20% OFF</Text>
            <Text style={styles.promoSub}>on your first order. Code: GOZONE20</Text>
          </View>
        </View>

        {/* Categories Grid (Template-Inspired rounded squares) */}
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>CATEGORIES</Text>
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.categoriesList}
          renderItem={({ item }) => (
            <CategoryItem
              item={item}
              isActive={item.id === activeCategory}
              colors={colors}
              onPress={() => setActiveCategory(item.id)}
            />
          )}
        />

        {/* Restaurant Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Popular Near You</Text>
          <TouchableOpacity>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>See all</Text>
          </TouchableOpacity>
        </View>

        {filteredRestaurants.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Icon name="search" set="feather" size={40} color={colors.textTertiary} style={{ marginBottom: spacing.md }} />
            <Text style={[styles.emptyStateTitle, { color: colors.textPrimary }]}>No Results Found</Text>
            <Text style={[styles.emptyStateSub, { color: colors.textSecondary }]}>
              We couldn't find any restaurants or dishes matching "{searchQuery}".
            </Text>
          </View>
        ) : (
          filteredRestaurants.map((restaurant) => (
            <RestaurantCardItem
              key={restaurant.id}
              restaurant={restaurant}
              colors={colors}
              navigation={navigation}
            />
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },

  // Curved Header Block
  curvedHeader: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.base,
    paddingBottom: 42,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontWeight: '700',
    fontSize: 15,
  },
  profileName: {
    fontSize: typography.size.md,
    fontWeight: '700',
  },
  profileSub: {
    fontSize: 11,
    marginTop: 2,
  },
  walletHeaderBlock: {
    alignItems: 'flex-end',
  },
  walletHeaderLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  walletHeaderValue: {
    fontSize: typography.size.md,
    fontWeight: '800',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.size.lg,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  // Overlapping Search
  searchWrapper: {
    marginTop: -26,
    zIndex: 10,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.base,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing.base,
    paddingVertical: 14,
    borderRadius: 16,
  },
  searchPlaceholder: { flex: 1, fontSize: typography.size.md },
  searchInput: { flex: 1, fontSize: typography.size.md, padding: 0 },
  searchDivider: { width: 1, height: 18 },
  clearSearchBtn: { padding: 4 },

  // Sections
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, marginBottom: spacing.md, marginTop: spacing.sm },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: { fontSize: typography.size.lg, fontWeight: '700' },
  seeAllText: { fontSize: typography.size.sm, fontWeight: '600' },

  // Categories
  categoriesList: { gap: spacing.md, marginBottom: spacing.xl },
  category: { alignItems: 'center', gap: 6, width: 64 },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: { fontSize: 11 },

  // Promo Banner
  promoBanner: {
    height: 120,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.xl,
    overflow: 'hidden',
    backgroundColor: '#1E1E2F',
  },
  promoOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#FF6B35',
    opacity: 0.9,
  },
  promoContent: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  promoBadge: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: borderRadius.full, alignSelf: 'flex-start', marginBottom: 6,
  },
  promoBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '700', letterSpacing: 0.8 },
  promoTitle: { color: '#FFF', fontSize: typography.size.xl, fontWeight: '800' },
  promoSub: { color: 'rgba(255,255,255,0.85)', fontSize: typography.size.sm, marginTop: 2 },

  // Restaurant Cards (Template 1 Inspired Grid Layout)
  restaurantCard: {
    borderRadius: 24,
    marginBottom: spacing.md,
    overflow: 'hidden',
    padding: spacing.md,
  },
  cardContentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  cardLeftCol: {
    flex: 1.2,
    justifyContent: 'space-between',
    paddingRight: spacing.sm,
  },
  restaurantNameText: {
    fontSize: typography.size.lg,
    fontWeight: '800',
    lineHeight: 24,
  },
  cardMetaRow: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: spacing.md,
  },
  cardMetaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cardMetaText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  cardPriceText: {
    fontSize: typography.size.sm,
    fontWeight: '700',
  },
  cardAddButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardRightCol: {
    flex: 0.8,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  cardVisualGradient: {
    width: 100,
    height: 100,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
  },
  emptyStateTitle: {
    fontSize: typography.size.md,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyStateSub: {
    fontSize: typography.size.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
});
