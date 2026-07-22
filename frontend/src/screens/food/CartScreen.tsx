// ============================================================
// SCREEN: Cart / Checkout (Realistic UI)
// ============================================================
// Cart items, delivery details, payment method, order summary
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@hooks/useTheme';
import { typography, spacing, borderRadius, shadows } from '@theme/index';
import { Icon, Button, type IconSet } from '@components/index';
import { useUserStore } from '@store/userStore';
import { API_BASE_URL, fetchWithAuth } from '@services/apiConfig';

// Mock cart items (in a real app, this comes from cart state)
const CART_ITEMS = [
  { id: 'm1', name: 'Jollof Rice & Chicken', description: 'Smoky jollof rice with grilled chicken', price: 35, qty: 2, gradient: ['#FFF3E0', '#FFE0B2'] },
  { id: 'm6', name: 'Plantain (3 pcs)', description: 'Golden fried plantain', price: 12, qty: 1, gradient: ['#FFFDE7', '#FFF9C4'] },
  { id: 'm8', name: 'Shito (Pepper Sauce)', description: 'Spicy Ghanaian black pepper sauce', price: 5, qty: 2, gradient: ['#EFEBE9', '#D7CCC8'] },
];

const DELIVERY_FEE = 5;
const SERVICE_FEE = 2;

interface CartScreenProps {
  navigation: any;
  route: any;
}

const INITIAL_ADDRESSES = [
  { id: '1', label: 'Home', address: 'Hse No. 12, Oxford Street', area: 'East Legon, Accra', icon: 'home' },
  { id: '2', label: 'Office', address: 'Block 4C, Liberation Rd', area: 'Airport Residential Area, Accra', icon: 'briefcase' },
  { id: '3', label: 'University', address: 'Sarbah Hall, Annex B', area: 'University of Ghana, Legon', icon: 'book' },
];

export const CartScreen: React.FC<CartScreenProps> = ({ navigation, route }) => {
  const { colors, isDark } = useTheme();
  const routeCartItems = route.params?.cartItems;
  const routeRestaurantId = route.params?.restaurantId;
  const routeRestaurantName = route.params?.restaurantName;
  const routeDeliveryFee = route.params?.deliveryFee;

  const [items, setItems] = useState<any[]>(routeCartItems ?? CART_ITEMS);
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [savedAddresses, setSavedAddresses] = useState<any[]>(INITIAL_ADDRESSES);
  const [selectedAddressId, setSelectedAddressId] = useState('1');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [loading, setLoading] = useState(false);

  const payBtnScale = useRef(new Animated.Value(1)).current;

  const handlePayPressIn = () => {
    Animated.spring(payBtnScale, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 100,
      friction: 6,
    }).start();
  };

  const handlePayPressOut = () => {
    Animated.spring(payBtnScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 6,
    }).start();
  };

  // Add new location states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newArea, setNewArea] = useState('');

  const { balance, fetchWallet } = useUserStore();

  const updateQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryFee = orderType === 'pickup' ? 0 : (routeDeliveryFee !== undefined ? routeDeliveryFee : DELIVERY_FEE);
  const total = subtotal + deliveryFee + SERVICE_FEE;

  const formatPrice = (amount: number) => `GH₵${amount.toFixed(2)}`;

  const handleSaveAddress = () => {
    if (!newLabel.trim() || !newAddress.trim() || !newArea.trim()) {
      Alert.alert("Missing Fields", "Please enter a label, street address, and area.");
      return;
    }

    const newId = Date.now().toString();
    const newAddrObj = {
      id: newId,
      label: newLabel.trim(),
      address: newAddress.trim(),
      area: newArea.trim(),
      icon: 'map-pin',
    };

    setSavedAddresses(prev => [...prev, newAddrObj]);
    setSelectedAddressId(newId);
    setShowAddForm(false);
    
    setNewLabel('');
    setNewAddress('');
    setNewArea('');
  };

  const isAddressValid = () => {
    if (orderType !== 'delivery') return true;
    return selectedAddressId !== '';
  };

  const executePlaceOrder = async (finalOrderType: 'DELIVERY' | 'PICKUP') => {
    setLoading(true);

    let finalAddress = "Home - East Legon, Accra";
    if (orderType === 'pickup') {
      finalAddress = "Self-Pickup at Restaurant";
    } else {
      const selectedObj = savedAddresses.find(a => a.id === selectedAddressId);
      if (selectedObj) {
        finalAddress = `${selectedObj.label}: ${selectedObj.address}, ${selectedObj.area}`;
      }
    }
      
    const finalInstructions = deliveryInstructions.trim();

    const orderItems = items.map((item) => {
      const numericId = parseInt(String(item.id).replace('m', '')) || 1;
      return {
        menuItemId: numericId,
        quantity: item.qty,
        price: item.price,
      };
    });

    const bodyPayload = {
      restaurantId: parseInt(String(routeRestaurantId)) || 1,
      orderType: finalOrderType,
      subtotal: subtotal,
      deliveryFee: finalOrderType === 'PICKUP' ? 0.0 : deliveryFee,
      serviceFee: SERVICE_FEE,
      total: finalOrderType === 'PICKUP' ? (subtotal + SERVICE_FEE) : total,
      deliveryAddress: finalAddress,
      deliveryInstructions: finalInstructions,
      items: orderItems,
    };

    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
      });

      const json = await response.json();
      
      if (!response.ok || !json.success) {
        throw new Error(json.message || 'Failed to place order.');
      }

      await fetchWallet();

      navigation.navigate('OrderTracking', {
        orderId: json.data.id,
        orderType: finalOrderType,
        restaurantName: routeRestaurantName || 'Papaye Fast Foods',
        totalPrice: bodyPayload.total,
      });

    } catch (error: any) {
      console.warn('Backend order placement failed (offline mode):', error);
      
      // Update local wallet balance & transaction history when offline
      const newBalance = balance - bodyPayload.total;
      useUserStore.getState().setBalance(newBalance);
      useUserStore.getState().addTransaction({
        id: 't_' + Date.now(),
        type: 'debit',
        category: 'food',
        amount: bodyPayload.total,
        description: `Order from ${routeRestaurantName || 'GoBite Restaurant'}`,
        date: new Date().toISOString(),
        status: 'completed',
      });

      const simulatedOrderId = 'ORD' + Math.floor(1000 + Math.random() * 9000);
      navigation.navigate('OrderTracking', {
        orderId: simulatedOrderId,
        orderType: finalOrderType,
        restaurantName: routeRestaurantName || 'Papaye Fast Foods',
        totalPrice: bodyPayload.total,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = () => {
    if (balance < total) {
      Alert.alert('Insufficient Balance', 'Your SuperWallet balance is insufficient. Please top up before checking out.');
      return;
    }

    if (!isAddressValid()) {
      Alert.alert('Address Required', 'Please select a delivery address.');
      return;
    }

    Alert.alert(
      "Confirm Payment",
      `Authorize payment of ${formatPrice(total)} from your SuperWallet for this order?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Confirm & Pay",
          onPress: () => executePlaceOrder(orderType === 'pickup' ? 'PICKUP' : 'DELIVERY')
        }
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ===== Header ===== */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Icon name="chevron-left" set="feather" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Your Cart</Text>
        <View style={styles.headerBtn} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ===== Restaurant name ===== */}
        <View style={[styles.restaurantRow, { backgroundColor: colors.surface }, shadows.small]}>
          <View style={[styles.restaurantThumb, { backgroundColor: '#FDF0E0' }]}>
            <Icon name="silverware-fork-knife" set="material" size={20} color={colors.foodOrange} />
          </View>
          <View>
            <Text style={[styles.restaurantName, { color: colors.textPrimary }]}>{routeRestaurantName || 'Papaye Fast Foods'}</Text>
            <Text style={[styles.restaurantMeta, { color: colors.textTertiary }]}>25-30 min delivery</Text>
          </View>
        </View>

        {/* ===== Order Type Tabs ===== */}
        <View style={[styles.orderTypeTabs, { backgroundColor: colors.surfaceAlt }]}>
          <TouchableOpacity
            style={[styles.orderTypeTab, orderType === 'delivery' && { backgroundColor: colors.primary }]}
            onPress={() => setOrderType('delivery')}
            activeOpacity={0.7}
          >
            <Icon name="motorbike" set="material" size={16} color={orderType === 'delivery' ? '#FFFFFF' : colors.textSecondary} />
            <Text style={[styles.orderTypeText, { color: orderType === 'delivery' ? '#FFFFFF' : colors.textSecondary }]}>
              Delivery
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.orderTypeTab, orderType === 'pickup' && { backgroundColor: colors.primary }]}
            onPress={() => setOrderType('pickup')}
            activeOpacity={0.7}
          >
            <Icon name="shopping-bag" set="feather" size={16} color={orderType === 'pickup' ? '#FFFFFF' : colors.textSecondary} />
            <Text style={[styles.orderTypeText, { color: orderType === 'pickup' ? '#FFFFFF' : colors.textSecondary }]}>
              Pickup
            </Text>
          </TouchableOpacity>
        </View>

        {/* ===== Cart Items ===== */}
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>ITEMS ({items.length})</Text>
        {items.map((item) => (
          <View key={item.id} style={[styles.cartItem, { backgroundColor: colors.surface }]}>
            <View style={[styles.cartItemImage, { backgroundColor: item.gradient[0] }]}>
              <View style={[styles.cartImageOverlay, { backgroundColor: item.gradient[1] }]} />
            </View>
            <View style={styles.cartItemInfo}>
              <Text style={[styles.cartItemName, { color: colors.textPrimary }]}>{item.name}</Text>
              <Text style={[styles.cartItemDesc, { color: colors.textTertiary }]} numberOfLines={1}>
                {item.description}
              </Text>
              <Text style={[styles.cartItemPrice, { color: colors.textPrimary }]}>{formatPrice(item.price)}</Text>
            </View>
            {/* Qty control */}
            <View style={[styles.qtyControl, { borderColor: colors.border }]}>
              <TouchableOpacity onPress={() => updateQty(item.id, -1)}>
                <Icon name="minus" set="feather" size={14} color={colors.textSecondary} />
              </TouchableOpacity>
              <Text style={[styles.qtyText, { color: colors.textPrimary }]}>{item.qty}</Text>
              <TouchableOpacity onPress={() => updateQty(item.id, 1)}>
                <Icon name="plus" set="feather" size={14} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* ===== Delivery Details ===== */}
        {orderType === 'delivery' && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>DELIVER TO</Text>
            
            {/* Saved Addresses List */}
            {savedAddresses.map((addr) => {
              const isSelected = selectedAddressId === addr.id;
              return (
                <TouchableOpacity
                  key={addr.id}
                  style={[
                    styles.addressItemCard,
                    { 
                      backgroundColor: colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderWidth: isSelected ? 1.5 : 1,
                    }
                  ]}
                  onPress={() => setSelectedAddressId(addr.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.addressItemIcon, { backgroundColor: isSelected ? colors.primaryLight : colors.surfaceAlt }]}>
                    <Icon name={addr.icon || 'map-pin'} set="feather" size={16} color={isSelected ? colors.primary : colors.textSecondary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.addressItemLabel, { color: colors.textPrimary }]}>{addr.label}</Text>
                    <Text style={[styles.addressItemText, { color: colors.textTertiary }]} numberOfLines={1}>
                      {addr.address}, {addr.area}
                    </Text>
                  </View>
                  <View style={[styles.radioButton, { borderColor: isSelected ? colors.primary : colors.border }]}>
                    {isSelected && <View style={[styles.radioButtonFill, { backgroundColor: colors.primary }]} />}
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Add New Address Form / Button */}
            {!showAddForm ? (
              <TouchableOpacity
                style={[styles.addAddressBtn, { borderColor: colors.primary, backgroundColor: colors.surface }]}
                onPress={() => setShowAddForm(true)}
                activeOpacity={0.7}
              >
                <Icon name="plus" set="feather" size={16} color={colors.primary} />
                <Text style={[styles.addAddressBtnText, { color: colors.primary }]}>Add New Location</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.addAddressForm, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.formTitle, { color: colors.textPrimary }]}>Add New Location</Text>
                
                <TextInput
                  style={[styles.formInput, { color: colors.textPrimary, borderColor: colors.border }]}
                  placeholder="Address Label (e.g. Gym, Aunt's House)"
                  placeholderTextColor={colors.textTertiary}
                  value={newLabel}
                  onChangeText={setNewLabel}
                />
                
                <TextInput
                  style={[styles.formInput, { color: colors.textPrimary, borderColor: colors.border }]}
                  placeholder="Street / Hse No. (e.g. Hse 15, Ring Road)"
                  placeholderTextColor={colors.textTertiary}
                  value={newAddress}
                  onChangeText={setNewAddress}
                />
                
                <TextInput
                  style={[styles.formInput, { color: colors.textPrimary, borderColor: colors.border }]}
                  placeholder="Area / Suburb (e.g. Cantonments, Accra)"
                  placeholderTextColor={colors.textTertiary}
                  value={newArea}
                  onChangeText={setNewArea}
                />

                <View style={styles.formActions}>
                  <TouchableOpacity
                    style={[styles.formBtn, { backgroundColor: colors.surfaceAlt }]}
                    onPress={() => {
                      setShowAddForm(false);
                      setNewLabel('');
                      setNewAddress('');
                      setNewArea('');
                    }}
                  >
                    <Text style={[styles.formBtnText, { color: colors.textSecondary }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.formBtn, { backgroundColor: colors.primary }]}
                    onPress={handleSaveAddress}
                  >
                    <Text style={[styles.formBtnText, { color: '#FFFFFF' }]}>Save Location</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Delivery instructions */}
            <Text style={[styles.sectionLabel, { color: colors.textTertiary, marginTop: spacing.md }]}>DELIVERY INSTRUCTIONS</Text>
            <View style={[styles.instructionsInputRow, { backgroundColor: colors.surface }]}>
              <Icon name="message-square" set="feather" size={16} color={colors.textSecondary} style={{ marginTop: 4 }} />
              <TextInput
                style={[styles.instructionsInput, { color: colors.textPrimary }]}
                placeholder="Add delivery instructions (e.g. Ring bell, leave at reception)"
                placeholderTextColor={colors.textTertiary}
                value={deliveryInstructions}
                onChangeText={setDeliveryInstructions}
                multiline
              />
            </View>
          </>
        )}

        {/* ===== Payment Method ===== */}
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>PAYMENT METHOD</Text>
        <TouchableOpacity style={[styles.paymentCard, { backgroundColor: colors.surface }]} activeOpacity={0.7}>
          <View style={[styles.paymentIcon, { backgroundColor: colors.primaryLight }]}>
            <Icon name="credit-card" set="feather" size={18} color={colors.primary} />
          </View>
          <View style={styles.paymentInfo}>
            <Text style={[styles.paymentMethod, { color: colors.textPrimary }]}>SuperWallet</Text>
            <Text style={[styles.paymentBalance, { color: colors.textTertiary }]}>Balance: GH₵{balance.toFixed(2)}</Text>
          </View>
          <View style={[styles.radioButton, { borderColor: colors.primary }]}>
            <View style={[styles.radioButtonFill, { backgroundColor: colors.primary }]} />
          </View>
        </TouchableOpacity>

        {/* ===== Order Summary ===== */}
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>ORDER SUMMARY</Text>
        <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Subtotal</Text>
            <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{formatPrice(subtotal)}</Text>
          </View>
          {orderType !== 'pickup' && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Delivery fee</Text>
              <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{formatPrice(deliveryFee)}</Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Service fee</Text>
            <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{formatPrice(SERVICE_FEE)}</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryTotalLabel, { color: colors.textPrimary }]}>Total</Text>
            <Text style={[styles.summaryTotalValue, { color: colors.textPrimary }]}>{formatPrice(total)}</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ===== Place Order Button ===== */}
      <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity
          onPressIn={handlePayPressIn}
          onPressOut={handlePayPressOut}
          onPress={handlePlaceOrder}
          disabled={loading || !isAddressValid()}
          activeOpacity={0.95}
        >
          <Animated.View style={[
            styles.customPayBtn,
            { 
              backgroundColor: colors.primary,
              opacity: (loading || !isAddressValid()) ? 0.6 : 1,
              transform: [{ scale: payBtnScale }]
            }
          ]}>
            <Text style={styles.customPayBtnText}>
              Place Order • {formatPrice(total)}
            </Text>
            <Icon name="arrow-right" set="feather" size={16} color="#FFFFFF" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.base, paddingVertical: 8, borderBottomWidth: 1,
  },
  headerBtn: { width: 40, alignItems: 'center' },
  headerTitle: { fontSize: typography.size.lg, fontWeight: '700' },
  scrollContent: { padding: spacing.base, paddingBottom: 20 },

  // Restaurant row
  restaurantRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: spacing.md, borderRadius: borderRadius.lg, marginBottom: spacing.lg,
  },
  restaurantThumb: { width: 44, height: 44, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  restaurantName: { fontSize: typography.size.md, fontWeight: '700' },
  restaurantMeta: { fontSize: typography.size.sm, marginTop: 2 },

  // Order type tabs
  orderTypeTabs: { flexDirection: 'row', padding: 4, borderRadius: borderRadius.md, marginBottom: spacing.lg, gap: 4 },
  orderTypeTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: borderRadius.sm },
  orderTypeText: { fontSize: typography.size.sm, fontWeight: '600' },

  // Section label
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: spacing.md },

  // Cart item
  cartItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: spacing.md, borderRadius: borderRadius.lg, marginBottom: spacing.md },
  cartItemImage: { width: 60, height: 60, borderRadius: borderRadius.md, overflow: 'hidden' },
  cartImageOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', opacity: 0.4 },
  cartItemInfo: { flex: 1 },
  cartItemName: { fontSize: typography.size.md, fontWeight: '600' },
  cartItemDesc: { fontSize: typography.size.sm, marginTop: 2 },
  cartItemPrice: { fontSize: typography.size.sm, fontWeight: '700', marginTop: 6 },
  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: borderRadius.md, paddingHorizontal: 8, paddingVertical: 6 },

  qtyText: { fontSize: typography.size.sm, fontWeight: '700' },

  // Address
  addressCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: spacing.md, borderRadius: borderRadius.lg },
  addressIcon: { width: 40, height: 40, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  addressInfo: { flex: 1 },
  addressLabel: { fontSize: 10, letterSpacing: 0.8, fontWeight: '600' },
  addressText: { fontSize: typography.size.md, fontWeight: '600', marginTop: 2 },
  addressMeta: { fontSize: typography.size.sm, marginTop: 2 },

  instructionsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: spacing.md, borderRadius: borderRadius.lg, marginTop: spacing.sm, marginBottom: spacing.lg },
  instructionsText: { fontSize: typography.size.sm },

  // Payment
  paymentCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: spacing.md, borderRadius: borderRadius.lg, marginBottom: spacing.lg },
  paymentIcon: { width: 40, height: 40, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  paymentInfo: { flex: 1 },
  paymentMethod: { fontSize: typography.size.md, fontWeight: '600' },
  paymentBalance: { fontSize: typography.size.sm, marginTop: 2 },
  radioButton: { width: 22, height: 22, borderRadius: 9999, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioButtonFill: { width: 12, height: 12, borderRadius: 9999 },

  // Summary
  summaryCard: { borderRadius: borderRadius.lg, padding: spacing.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  summaryLabel: { fontSize: typography.size.sm },
  summaryValue: { fontSize: typography.size.sm, fontWeight: '500' },
  summaryDivider: { height: 1, marginVertical: 6 },
  summaryTotalLabel: { fontSize: typography.size.md, fontWeight: '700' },
  summaryTotalValue: { fontSize: typography.size.md, fontWeight: '800' },

  // Bottom bar
  bottomBar: { paddingHorizontal: spacing.base, paddingVertical: spacing.md, borderTopWidth: 1 },

  addressItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  addressItemIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressItemLabel: {
    fontSize: typography.size.sm,
    fontWeight: '700',
  },
  addressItemText: {
    fontSize: typography.size.xs,
    marginTop: 2,
  },
  addAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  addAddressBtnText: {
    fontSize: typography.size.sm,
    fontWeight: '700',
  },
  addAddressForm: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  formTitle: {
    fontSize: typography.size.md,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  formInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.size.sm,
    marginBottom: spacing.sm,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: spacing.sm,
  },
  formBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formBtnText: {
    fontSize: typography.size.sm,
    fontWeight: '700',
  },
  instructionsInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  instructionsInput: {
    flex: 1,
    fontSize: typography.size.sm,
    minHeight: 40,
    padding: 0,
    textAlignVertical: 'top',
  },
  customPayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
    width: '100%',
  },
  customPayBtnText: {
    color: '#FFFFFF',
    fontSize: typography.size.md,
    fontWeight: '800',
  },
});
