// ============================================================
// SCREEN: Restaurant Detail (Realistic UI)
// ============================================================
// Shows restaurant header + scrollable menu sections + cart bar
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@hooks/useTheme';
import { typography, spacing, borderRadius, shadows } from '@theme/index';
import { Icon, type IconSet } from '@components/index';
import { RESTAURANT_DETAILS, type MenuItem } from '@services/mockData';
import { API_BASE_URL } from '@services/apiConfig';

interface RestaurantDetailScreenProps {
  route: any;
  navigation: any;
}

export const RestaurantDetailScreen: React.FC<RestaurantDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { colors, isDark } = useTheme();
  const restaurantId = route.params?.restaurantId ?? '1';
  const [restaurant, setRestaurant] = useState<any>(RESTAURANT_DETAILS[restaurantId] ?? RESTAURANT_DETAILS['1']);

  // Cart state: itemId -> quantity
  const [cart, setCart] = useState<Record<string, number>>({});

  const backBtnScale = useRef(new Animated.Value(1)).current;
  const favBtnScale = useRef(new Animated.Value(1)).current;
  const cartBtnScale = useRef(new Animated.Value(1)).current;

  const animateScale = (val: Animated.Value, toVal: number) => {
    Animated.spring(val, {
      toValue: toVal,
      useNativeDriver: true,
      tension: 100,
      friction: 6,
    }).start();
  };

  useEffect(() => {
    const loadRestaurantDetails = async () => {
      try {
        const detailResponse = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}`);
        if (!detailResponse.ok) throw new Error('Failed to load restaurant details');
        const detailJson = await detailResponse.json();
        
        const menuResponse = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}/menu`);
        if (!menuResponse.ok) throw new Error('Failed to load restaurant menu');
        const menuJson = await menuResponse.json();

        if (detailJson.success && menuJson.success) {
          const restData = detailJson.data;
          const menuData = menuJson.data;

          const gradients: Record<string, string[]> = {
            '1': ['#FDF0E0', '#FBD9B0'],
            '2': ['#E8F5E9', '#C8E6C9'],
            '3': ['#FFFDE7', '#FFF9C4'],
          };

          const categoryGroups: Record<string, any[]> = {};
          menuData.forEach((item: any) => {
            const cat = item.category || 'Popular';
            if (!categoryGroups[cat]) categoryGroups[cat] = [];
            
            const catGradients: Record<string, string[]> = {
              'Popular': ['#FFF3E0', '#FFE0B2'],
              'Grills': ['#FBE9E7', '#FFCCBC'],
              'Sides': ['#FFFDE7', '#FFF9C4'],
            };

            categoryGroups[cat].push({
              id: String(item.id),
              name: item.name,
              description: item.description || '',
              price: item.price,
              category: cat,
              isPopular: item.isPopular || false,
              gradient: catGradients[cat] || ['#EFEBE9', '#D7CCC8'],
            });
          });

          const menuSections = Object.entries(categoryGroups).map(([title, items]) => ({
            title,
            items,
          }));

          setRestaurant({
            id: String(restData.id),
            name: restData.name,
            tagline: restData.tagline || restData.cuisineType || 'Chicken • Fast Food',
            rating: restData.rating || 4.5,
            deliveryTimeMin: restData.deliveryTimeMin || 25,
            deliveryTimeMax: restData.deliveryTimeMax || 30,
            deliveryFee: restData.deliveryFee || 5.0,
            gradient: gradients[String(restData.id)] || ['#F5F5F5', '#E0E0E0'],
            isOpen: restData.isOpen !== undefined ? restData.isOpen : true,
            isFreeDelivery: restData.deliveryFee === 0,
            menuSections,
          });
        }
      } catch (error) {
        console.warn('Backend restaurant details fetch failed (offline fallback):', error);
      }
    };
    loadRestaurantDetails();
  }, [restaurantId]);

  // Cart state helper actions
  const addToCart = (itemId: string) => {
    setCart((prev) => ({ ...prev, [itemId]: (prev[itemId] ?? 0) + 1 }));
  };
  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const current = prev[itemId] ?? 0;
      if (current <= 1) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: current - 1 };
    });
  };

  // Calculate cart totals
  const cartItems = Object.entries(cart);
  const totalItems = cartItems.reduce((sum, [, qty]) => sum + qty, 0);
  const totalPrice = cartItems.reduce((sum, [itemId, qty]) => {
    const item = restaurant.menuSections
      .flatMap((s: any) => s.items)
      .find((i: any) => i.id === itemId);
    return sum + (item?.price ?? 0) * qty;
  }, 0);

  const formatPrice = (amount: number) =>
    `GH₵${amount.toFixed(2)}`;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ===== Restaurant Header (Gradient Banner) ===== */}
        <View style={styles.headerBanner}>
          <LinearGradient
            colors={restaurant.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBanner}
          >
            {/* Back button */}
            <TouchableOpacity
              onPressIn={() => animateScale(backBtnScale, 0.9)}
              onPressOut={() => animateScale(backBtnScale, 1)}
              onPress={() => navigation.goBack()}
              activeOpacity={0.9}
            >
              <Animated.View style={[
                styles.backButton, 
                { 
                  backgroundColor: colors.surface,
                  transform: [{ scale: backBtnScale }] 
                }
              ]}>
                <Icon name="chevron-left" set="feather" size={22} color={colors.textPrimary} />
              </Animated.View>
            </TouchableOpacity>

            {/* Favorite button */}
            <TouchableOpacity
              onPressIn={() => animateScale(favBtnScale, 0.9)}
              onPressOut={() => animateScale(favBtnScale, 1)}
              onPress={() => {}}
              activeOpacity={0.9}
            >
              <Animated.View style={[
                styles.favButton, 
                { 
                  backgroundColor: colors.surface,
                  transform: [{ scale: favBtnScale }] 
                }
              ]}>
                <Icon name="heart" set="feather" size={18} color={colors.foodOrange} />
              </Animated.View>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* ===== Restaurant Info ===== */}
        <View style={[
          styles.infoSection, 
          { 
            backgroundColor: colors.surface,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            borderWidth: 1.5,
          }
        ]}>
          <Text style={[styles.restaurantName, { color: colors.textPrimary }]}>
            {restaurant.name}
          </Text>
          <Text style={[styles.restaurantTagline, { color: colors.textTertiary }]}>
            {restaurant.tagline}
          </Text>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { backgroundColor: colors.surfaceAlt }]}>
              <Icon name="star" set="material" size={13} color={colors.foodOrange} />
              <Text style={[styles.statText, { color: colors.textPrimary }]}>
                {restaurant.rating}
              </Text>
            </View>
            <View style={[styles.statPill, { backgroundColor: colors.surfaceAlt }]}>
              <Icon name="clock-time-four" set="material" size={13} color={colors.textSecondary} />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>
                {restaurant.deliveryTimeMin}-{restaurant.deliveryTimeMax} min
              </Text>
            </View>
            <View style={[styles.statPill, { backgroundColor: colors.surfaceAlt }]}>
              <Icon name="motorbike" set="material" size={13} color={colors.textSecondary} />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>
                {restaurant.isFreeDelivery ? 'Free Delivery' : `${formatPrice(restaurant.deliveryFee)}`}
              </Text>
            </View>
          </View>

          {/* Promo banner */}
          <View style={[styles.restaurantPromo, { backgroundColor: colors.primaryLight }]}>
            <Icon name="ticket-percent" set="material" size={18} color={colors.primary} />
            <Text style={[styles.restaurantPromoText, { color: colors.primary }]}>
              20% off on orders above GH₵50
            </Text>
          </View>
        </View>

        {/* ===== Menu Sections ===== */}
        {restaurant.menuSections.map((section: any) => (
          <View key={section.title} style={styles.menuSection}>
            <Text style={[styles.menuSectionTitle, { color: colors.textPrimary }]}>
              {section.title}
            </Text>
            <Text style={[styles.menuSectionCount, { color: colors.textTertiary }]}>
              {section.items.length} items
            </Text>

            {section.items.map((item: MenuItem) => {
              const qty = cart[item.id] ?? 0;
              return (
                <View
                  key={item.id}
                  style={[styles.menuItem, { backgroundColor: colors.surface }]}
                >
                  {/* Text area */}
                  <View style={styles.menuItemInfo}>
                    {item.isPopular && (
                      <View style={styles.popularTag}>
                        <Icon name="fire" set="material" size={9} color="#FFFFFF" />
                        <Text style={styles.popularTagText}>Popular</Text>
                      </View>
                    )}
                    <Text style={[styles.menuItemName, { color: colors.textPrimary }]}>
                      {item.name}
                    </Text>
                    <Text
                      style={[styles.menuItemDesc, { color: colors.textTertiary }]}
                      numberOfLines={2}
                    >
                      {item.description}
                    </Text>
                    <Text style={[styles.menuItemPrice, { color: colors.textPrimary }]}>
                      {formatPrice(item.price)}
                    </Text>
                  </View>

                  {/* Image + Add button */}
                  <View style={styles.menuItemRight}>
                    <View style={[styles.menuItemImage, { backgroundColor: item.gradient[0] }]}>
                      <View style={[styles.menuImageOverlay, { backgroundColor: item.gradient[1] }]} />
                    </View>
                    {qty === 0 ? (
                      <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: colors.primary }]}
                        onPress={() => addToCart(item.id)}
                        activeOpacity={0.7}
                      >
                        <Icon name="plus" set="feather" size={16} color="#FFFFFF" />
                        <Text style={styles.addButtonText}>Add</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={[styles.qtyControl, { backgroundColor: colors.primary }]}>
                        <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                          <Icon name="minus" set="feather" size={14} color="#FFFFFF" />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{qty}</Text>
                        <TouchableOpacity onPress={() => addToCart(item.id)}>
                          <Icon name="plus" set="feather" size={14} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        ))}

        {/* Bottom spacer for cart bar */}
        <View style={{ height: totalItems > 0 ? 100 : 40 }} />
      </ScrollView>

      {/* ===== Floating Cart Bar ===== */}
      {totalItems > 0 && (
        <View style={styles.cartBarContainer}>
          <TouchableOpacity
            onPressIn={() => animateScale(cartBtnScale, 0.96)}
            onPressOut={() => animateScale(cartBtnScale, 1)}
            activeOpacity={0.95}
            onPress={() => {
              const selectedCartItems = cartItems.map(([itemId, qty]) => {
                const menuItem = restaurant.menuSections
                  .flatMap((s: any) => s.items)
                  .find((i: any) => i.id === itemId);
                return {
                  ...menuItem,
                  qty,
                };
              }).filter(Boolean);

              navigation.navigate('Cart', {
                cartItems: selectedCartItems,
                restaurantId: restaurant.id,
                restaurantName: restaurant.name,
                deliveryFee: restaurant.deliveryFee,
              });
            }}
          >
            <Animated.View style={{ transform: [{ scale: cartBtnScale }] }}>
              <LinearGradient
                colors={[colors.primary, colors.primaryDark || colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.cartBar, 
                  { 
                    borderColor: 'rgba(255, 255, 255, 0.22)',
                    borderWidth: 1.5,
                  }
                ]}
              >
                <View style={styles.cartBarLeft}>
                  <View style={styles.cartBarBadge}>
                    <Text style={styles.cartBarBadgeText}>{totalItems}</Text>
                  </View>
                  <Text style={styles.cartBarText}>View Cart</Text>
                </View>
                <Text style={styles.cartBarPrice}>{formatPrice(totalPrice)}</Text>
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header banner
  headerBanner: { height: 180 },
  gradientBanner: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  backButton: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    ...shadows.small,
  },
  favButton: {
    width: 40, height: 40, borderRadius: 9999,
    alignItems: 'center', justifyContent: 'center',
    ...shadows.small,
  },

  // Info section
  infoSection: {
    marginHorizontal: spacing.base,
    marginTop: -24,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.medium,
  },
  restaurantName: { fontSize: typography.size.xl, fontWeight: '700' },
  restaurantTagline: { fontSize: typography.size.sm, marginTop: 3 },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  statPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: borderRadius.sm,
  },
  statText: { fontSize: 12, fontWeight: '600' },
  restaurantPromo: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 14, padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  restaurantPromoText: { fontSize: typography.size.sm, fontWeight: '600' },

  // Menu sections
  menuSection: { paddingHorizontal: spacing.base, marginTop: spacing.xl },
  menuSectionTitle: { fontSize: typography.size.lg, fontWeight: '700' },
  menuSectionCount: { fontSize: typography.size.sm, marginTop: 2, marginBottom: spacing.md },

  // Menu item
  menuItem: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  menuItemInfo: { flex: 1 },
  popularTag: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  popularTagText: { color: '#FFFFFF', fontSize: 9, fontWeight: '700' },
  menuItemName: { fontSize: typography.size.md, fontWeight: '600' },
  menuItemDesc: { fontSize: typography.size.sm, marginTop: 3, lineHeight: 18 },
  menuItemPrice: { fontSize: typography.size.md, fontWeight: '700', marginTop: 8 },

  // Right side (image + add button)
  menuItemRight: { alignItems: 'center', gap: 8 },
  menuItemImage: {
    width: 80, height: 80, borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  menuImageOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: '50%', opacity: 0.4,
  },
  addButton: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: borderRadius.sm,
  },
  addButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

  // Quantity control
  qtyControl: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: borderRadius.sm,
  },
  qtyText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },

  // Cart bar
  cartBarContainer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: spacing.base, paddingBottom: spacing.base,
  },
  cartBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: 14,
    borderRadius: borderRadius.md,
    ...shadows.large,
  },
  cartBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cartBarBadge: {
    width: 28, height: 28, borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  cartBarBadgeText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  cartBarText: { color: '#FFFFFF', fontSize: typography.size.md, fontWeight: '600' },
  cartBarPrice: { color: '#FFFFFF', fontSize: typography.size.md, fontWeight: '800' },
});
