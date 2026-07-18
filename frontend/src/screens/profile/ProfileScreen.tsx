// ============================================================
// SCREEN: Profile (Fully Operational Refined UI)
// ============================================================
// Kwame Mensah's active account details, editable details,
// saved locations, payment management, promo vouchers, histories,
// and system preferences with active dynamic components.
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Image,
  Animated,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@hooks/useTheme';
import { typography, spacing, borderRadius, shadows } from '@theme/index';
import { Icon, Button, type IconSet } from '@components/index';
import { useUserStore } from '@store/index';

const ProfileMenuItem = ({
  item,
  isLast,
  colors,
  onPress
}: {
  item: any;
  isLast: boolean;
  colors: any;
  onPress: () => void;
}) => {
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
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Animated.View style={[
        styles.menuItem,
        !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border },
        { transform: [{ scale }] }
      ]}>
        <View style={[styles.menuIconWrap, { backgroundColor: colors.surfaceAlt }]}>
          <Icon name={item.icon} set={item.iconSet} size={16} color={colors.textSecondary} />
        </View>
        <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>{item.label}</Text>
        <Icon name="chevron-right" set="feather" size={16} color={colors.textTertiary} />
      </Animated.View>
    </TouchableOpacity>
  );
};

const ModalCloseButton = ({ onPress, colors }: { onPress: () => void; colors: any }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.85,
      useNativeDriver: true,
      tension: 140,
      friction: 5,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 140,
      friction: 5,
    }).start();
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      activeOpacity={0.9}
      hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
      style={styles.modalCloseBtn}
    >
      <Animated.View style={[
        styles.closeBtnCircle, 
        { 
          backgroundColor: colors.surfaceAlt, 
          borderColor: colors.border,
          borderWidth: 1,
          transform: [{ scale }] 
        }
      ]}>
        <Icon name="x" set="feather" size={20} color={colors.textPrimary} />
      </Animated.View>
    </TouchableOpacity>
  );
};
import type { RootScreenProps } from '@navigation/types';

interface MenuItem {
  icon: string;
  iconSet: IconSet;
  label: string;
}

const MENU_SECTIONS: { title: string; items: MenuItem[] }[] = [
  {
    title: 'Account',
    items: [
      { icon: 'user', iconSet: 'feather', label: 'Personal Information' },
      { icon: 'map-pin', iconSet: 'feather', label: 'Saved Addresses' },
      { icon: 'credit-card', iconSet: 'feather', label: 'Payment Methods' },
      { icon: 'gift', iconSet: 'feather', label: 'Promotions & Rewards' },
    ],
  },
  {
    title: 'Activity',
    items: [
      { icon: 'car-side', iconSet: 'material', label: 'Ride History' },
      { icon: 'shopping-bag', iconSet: 'feather', label: 'Order History' },
      { icon: 'star', iconSet: 'feather', label: 'My Reviews' },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: 'help-circle', iconSet: 'feather', label: 'Help Center' },
      { icon: 'shield', iconSet: 'feather', label: 'Terms & Privacy' },
      { icon: 'info', iconSet: 'feather', label: 'About GoZone' },
    ],
  },
];

interface ProfileScreenProps extends RootScreenProps<'Profile'> {
  onLogout?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation, onLogout }) => {
  const { colors, theme, isDark } = useTheme();

  const backBtnScale = useRef(new Animated.Value(1)).current;
  const settingsBtnScale = useRef(new Animated.Value(1)).current;
  const avatarBtnScale = useRef(new Animated.Value(1)).current;
  const statsCardScale = useRef(new Animated.Value(1)).current;
  const themeCardScale = useRef(new Animated.Value(1)).current;
  const logoutBtnScale = useRef(new Animated.Value(1)).current;

  const animateScale = (val: Animated.Value, toVal: number) => {
    Animated.spring(val, {
      toValue: toVal,
      useNativeDriver: true,
      tension: 100,
      friction: 6,
    }).start();
  };

  // Global user store
  const { name, email, phone, setProfile, initials, rides, orders, fetchHistory, balance, avatarUrl, setAvatarUrl } = useUserStore();

  useEffect(() => {
    fetchHistory();
  }, []);

  // Modal toggle state
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Temporary edit states (local copy for the edit modal)
  const [tempName, setTempName] = useState(name);
  const [tempEmail, setTempEmail] = useState(email);
  const [tempPhone, setTempPhone] = useState(phone);
  const [tempAvatarUrl, setTempAvatarUrl] = useState(avatarUrl);

  // Saved Addresses state
  const [addresses, setAddresses] = useState([
    { id: '1', label: 'Home', address: 'East Legon, Oxford Street, Accra' },
    { id: '2', label: 'Work', address: 'Liberation Road, Airport Residential Area' }
  ]);
  const [newLabel, setNewLabel] = useState('');
  const [newAddress, setNewAddress] = useState('');

  // Payment Methods state
  const [payments, setPayments] = useState([
    { id: '1', type: 'SuperWallet', detail: `Balance: GH₵ ${balance.toFixed(2)}`, isDefault: true, icon: 'credit-card', set: 'feather' as const },
    { id: '2', type: 'Visa Card', detail: '**** 4890', isDefault: false, icon: 'credit-card', set: 'feather' as const },
    { id: '3', type: 'MTN Mobile Money', detail: phone, isDefault: false, icon: 'phone', set: 'feather' as const }
  ]);
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newMomoPhone, setNewMomoPhone] = useState('');

  // Promotions & Rewards state
  const [vouchers, setVouchers] = useState([
    { id: '1', code: 'GOZONE20', value: '20% OFF', desc: 'On first food order' },
    { id: '2', code: 'RIDEGHS15', value: 'GH₵15.00 OFF', desc: 'On standard rides' }
  ]);
  const [promoInput, setPromoInput] = useState('');
  const [rewardPoints] = useState(125);

  // FAQs open state
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);

  // Sync edit states on modal open
  const handleMenuPress = (label: string) => {
    switch (label) {
      case 'Personal Information':
        setTempName(name);
        setTempEmail(email);
        setTempPhone(phone);
        setTempAvatarUrl(avatarUrl);
        setActiveModal('personal');
        break;
      case 'Saved Addresses':
        setNewLabel('');
        setNewAddress('');
        setActiveModal('addresses');
        break;
      case 'Payment Methods':
        setNewCardNumber('');
        setNewMomoPhone('');
        setActiveModal('payments');
        break;
      case 'Promotions & Rewards':
        setPromoInput('');
        setActiveModal('promotions');
        break;
      case 'Ride History': setActiveModal('rides'); break;
      case 'Order History': setActiveModal('orders'); break;
      case 'My Reviews': setActiveModal('reviews'); break;
      case 'Help Center':
        setOpenFaqId(null);
        setActiveModal('help');
        break;
      case 'Terms & Privacy': setActiveModal('terms'); break;
      case 'About GoZone': setActiveModal('about'); break;
      default: break;
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to upload a profile picture.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setTempAvatarUrl(result.assets[0].uri);
    }
  };

  // Save profile information → pushes to global store
  const handleSaveProfile = () => {
    if (!tempName.trim()) {
      Alert.alert("Error", "Name cannot be empty.");
      return;
    }
    setProfile(tempName.trim(), tempEmail.trim(), tempPhone.trim());
    setAvatarUrl(tempAvatarUrl);
    setActiveModal(null);
    Alert.alert("Profile Updated", "Your information has been saved successfully.");
  };

  // Add Address
  const handleAddAddress = () => {
    if (!newLabel.trim() || !newAddress.trim()) {
      Alert.alert("Error", "Please fill in both the label and address.");
      return;
    }
    setAddresses(prev => [
      ...prev,
      { id: Date.now().toString(), label: newLabel, address: newAddress }
    ]);
    setNewLabel('');
    setNewAddress('');
    Alert.alert("Success", "Address added successfully!");
  };

  // Delete Address
  const handleDeleteAddress = (id: string) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id));
  };

  // Add Payment Method (Card)
  const handleAddCard = () => {
    if (newCardNumber.length < 16) {
      Alert.alert("Error", "Please enter a valid 16-digit card number.");
      return;
    }
    const masked = `**** **** **** ${newCardNumber.slice(-4)}`;
    setPayments(prev => [
      ...prev,
      { id: Date.now().toString(), type: 'Visa Card', detail: masked, isDefault: false, icon: 'credit-card', set: 'feather' }
    ]);
    setNewCardNumber('');
    Alert.alert("Success", "Card added successfully!");
  };

  // Add Payment Method (Momo)
  const handleAddMomo = () => {
    if (newMomoPhone.length < 9) {
      Alert.alert("Error", "Please enter a valid phone number.");
      return;
    }
    setPayments(prev => [
      ...prev,
      { id: Date.now().toString(), type: 'MTN Mobile Money', detail: newMomoPhone, isDefault: false, icon: 'phone', set: 'feather' }
    ]);
    setNewMomoPhone('');
    Alert.alert("Success", "MoMo number linked successfully!");
  };

  // Set Default Payment
  const handleSetDefaultPayment = (id: string) => {
    setPayments(prev => prev.map(p => ({
      ...p,
      isDefault: p.id === id
    })));
  };

  // Redeem Promo
  const handleRedeemPromo = () => {
    if (!promoInput.trim()) return;
    const code = promoInput.trim().toUpperCase();

    if (vouchers.some(v => v.code === code)) {
      Alert.alert("Already Added", "This coupon has already been redeemed.");
      return;
    }

    let discount = '10% OFF';
    let desc = 'On your next transaction';
    if (code === 'GOZONE50') {
      discount = '50% OFF';
      desc = 'Special promotional discount';
    } else if (code.startsWith('GIFT')) {
      discount = 'GH₵20.00 OFF';
      desc = 'Free gift code applied';
    }

    setVouchers(prev => [
      ...prev,
      { id: Date.now().toString(), code, value: discount, desc }
    ]);
    setPromoInput('');
    Alert.alert("Coupon Redeemed", `Voucher "${code}" has been added to your rewards list.`);
  };

  const getInitials = () => initials();

  // Helper renders for modal screens
  const renderPersonalModal = () => (
    <View style={styles.modalForm}>
      {/* Current info display */}
      <View style={[styles.currentInfoCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.currentInfoAvatar, { backgroundColor: colors.primaryLight, overflow: 'hidden' }]}
          onPress={pickImage}
          activeOpacity={0.8}
        >
          {tempAvatarUrl ? (
            <Image source={{ uri: tempAvatarUrl }} style={{ width: '100%', height: '100%' }} />
          ) : (
            <Text style={[styles.currentInfoInitials, { color: colors.primary }]}>{getInitials()}</Text>
          )}
          <View style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            paddingVertical: 2,
            alignItems: 'center',
          }}>
            <Icon name="camera" set="feather" size={10} color="#FFF" />
          </View>
        </TouchableOpacity>
        <View style={styles.currentInfoText}>
          <Text style={[styles.currentInfoName, { color: colors.textPrimary }]}>{name}</Text>
          <Text style={[styles.currentInfoSub, { color: colors.textTertiary }]}>{email}</Text>
          <Text style={[styles.currentInfoSub, { color: colors.textTertiary }]}>{phone}</Text>
          <TouchableOpacity onPress={pickImage} style={{ marginTop: 6 }}>
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>Change Photo</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={[styles.modalSubheading, { color: colors.textSecondary }]}>EDIT YOUR DETAILS</Text>

      <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Full Name</Text>
      <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}>
        <Icon name="user" set="feather" size={16} color={colors.textTertiary} />
        <TextInput
          style={[styles.inputField, { color: colors.textPrimary }]}
          value={tempName}
          onChangeText={setTempName}
          placeholder="Enter your full name"
          placeholderTextColor={colors.textTertiary}
        />
      </View>

      <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email Address</Text>
      <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}>
        <Icon name="mail" set="feather" size={16} color={colors.textTertiary} />
        <TextInput
          style={[styles.inputField, { color: colors.textPrimary }]}
          value={tempEmail}
          onChangeText={setTempEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={colors.textTertiary}
        />
      </View>

      <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Phone Number</Text>
      <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}>
        <Icon name="phone" set="feather" size={16} color={colors.textTertiary} />
        <TextInput
          style={[styles.inputField, { color: colors.textPrimary }]}
          value={tempPhone}
          onChangeText={setTempPhone}
          placeholder="+233 24 123 4567"
          keyboardType="phone-pad"
          placeholderTextColor={colors.textTertiary}
        />
      </View>

      <Button
        title="Save Changes"
        onPress={handleSaveProfile}
        fullWidth
        style={{ marginTop: spacing.lg }}
      />
    </View>
  );

  const renderAddressesModal = () => (
    <View style={styles.modalForm}>
      <Text style={[styles.modalSubheading, { color: colors.textSecondary }]}>YOUR SAVED ADDRESSES</Text>
      {addresses.map(addr => (
        <View key={addr.id} style={[styles.addressItem, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          <View style={styles.addressItemLeft}>
            <View style={[styles.smallIconWrap, { backgroundColor: colors.primaryLight }]}>
              <Icon name="map-pin" set="feather" size={14} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.addressItemLabel, { color: colors.textPrimary }]}>{addr.label}</Text>
              <Text style={[styles.addressItemText, { color: colors.textTertiary }]} numberOfLines={1}>{addr.address}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => handleDeleteAddress(addr.id)} style={styles.deleteBtn}>
            <Icon name="trash-2" set="feather" size={16} color={colors.error} />
          </TouchableOpacity>
        </View>
      ))}

      <View style={[styles.addAddressForm, { borderTopColor: colors.border }]}>
        <Text style={[styles.modalSubheading, { color: colors.textSecondary }]}>ADD NEW ADDRESS</Text>
        <TextInput
          style={[styles.modalInput, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}
          value={newLabel}
          onChangeText={setNewLabel}
          placeholder="Label (e.g. Home, Work, Gym)"
          placeholderTextColor={colors.textTertiary}
        />
        <TextInput
          style={[styles.modalInput, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}
          value={newAddress}
          onChangeText={setNewAddress}
          placeholder="Full address details"
          placeholderTextColor={colors.textTertiary}
        />
        <Button
          title="Add Address"
          onPress={handleAddAddress}
          fullWidth
          style={{ marginTop: spacing.md }}
        />
      </View>
    </View>
  );

  const renderPaymentsModal = () => (
    <View style={styles.modalForm}>
      <Text style={[styles.modalSubheading, { color: colors.textSecondary }]}>CHOOSE DEFAULT METHOD</Text>
      {payments.map(method => (
        <TouchableOpacity
          key={method.id}
          style={[
            styles.paymentItem,
            { backgroundColor: colors.surfaceAlt, borderColor: method.isDefault ? colors.primary : colors.border }
          ]}
          onPress={() => handleSetDefaultPayment(method.id)}
          activeOpacity={0.7}
        >
          <View style={styles.paymentItemLeft}>
            <View style={[styles.smallIconWrap, { backgroundColor: colors.primaryLight }]}>
              <Icon name={method.icon} set={method.set} size={14} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.paymentItemType, { color: colors.textPrimary }]}>{method.type}</Text>
              <Text style={[styles.paymentItemDetail, { color: colors.textSecondary }]}>{method.detail}</Text>
            </View>
          </View>
          <View style={[styles.radioDot, { borderColor: colors.border }]}>
            {method.isDefault && <View style={[styles.radioDotFill, { backgroundColor: colors.primary }]} />}
          </View>
        </TouchableOpacity>
      ))}

      <View style={[styles.addCardForm, { borderTopColor: colors.border }]}>
        <Text style={[styles.modalSubheading, { color: colors.textSecondary }]}>LINK DEBIT/CREDIT CARD</Text>
        <TextInput
          style={[styles.modalInput, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}
          value={newCardNumber}
          onChangeText={setNewCardNumber}
          placeholder="Card Number (16 digits)"
          keyboardType="numeric"
          maxLength={16}
          placeholderTextColor={colors.textTertiary}
        />
        <Button
          title="Add Card"
          onPress={handleAddCard}
          fullWidth
          style={{ marginTop: spacing.sm }}
        />
      </View>

      <View style={[styles.addCardForm, { borderTopColor: colors.border }]}>
        <Text style={[styles.modalSubheading, { color: colors.textSecondary }]}>ADD MOBILE MONEY ACCOUNT</Text>
        <TextInput
          style={[styles.modalInput, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}
          value={newMomoPhone}
          onChangeText={setNewMomoPhone}
          placeholder="Momo Phone Number (e.g. 0241234567)"
          keyboardType="phone-pad"
          maxLength={10}
          placeholderTextColor={colors.textTertiary}
        />
        <Button
          title="Link Momo Account"
          onPress={handleAddMomo}
          fullWidth
          style={{ marginTop: spacing.sm }}
        />
      </View>
    </View>
  );

  const renderPromotionsModal = () => (
    <View style={styles.modalForm}>
      <View style={[styles.rewardsBanner, { backgroundColor: colors.primaryLight, borderRadius: borderRadius.lg }]}>
        <View style={styles.rewardsTextWrap}>
          <Text style={[styles.rewardsLabel, { color: colors.primary }]}>REWARD POINTS</Text>
          <Text style={[styles.rewardsValue, { color: colors.textPrimary }]}>{rewardPoints} Points</Text>
          <Text style={[styles.rewardsSub, { color: colors.textSecondary }]}>Earn points on food and rides. Reach 200 points for a free meal!</Text>
        </View>
        <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
          <View style={[styles.progressBarFill, { backgroundColor: colors.primary, width: `${(rewardPoints / 200) * 100}%` }]} />
        </View>
      </View>

      <Text style={[styles.modalSubheading, { color: colors.textSecondary }]}>REDEEM PROMO CODE</Text>
      <View style={styles.promoInputRow}>
        <TextInput
          style={[styles.promoInput, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}
          value={promoInput}
          onChangeText={setPromoInput}
          placeholder="Enter code (e.g. GOZONE50)"
          autoCapitalize="characters"
          placeholderTextColor={colors.textTertiary}
        />
        <TouchableOpacity style={[styles.promoBtn, { backgroundColor: colors.primary }]} onPress={handleRedeemPromo}>
          <Text style={styles.promoBtnText}>Redeem</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.modalSubheading, { color: colors.textSecondary }]}>YOUR AVAILABLE COUPONS</Text>
      {vouchers.map(v => (
        <View key={v.id} style={[styles.voucherCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          <View style={styles.voucherLeft}>
            <Text style={[styles.voucherValueText, { color: colors.primary }]}>{v.value}</Text>
            <Text style={[styles.voucherCodeText, { color: colors.textPrimary }]}>{v.code}</Text>
            <Text style={[styles.voucherDescText, { color: colors.textTertiary }]}>{v.desc}</Text>
          </View>
          <View style={[styles.voucherRight, { borderLeftColor: colors.border }]}>
            <Text style={[styles.voucherUseText, { color: colors.textSecondary }]}>ACTIVE</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderRidesModal = () => (
    <View style={styles.modalForm}>
      <Text style={[styles.modalSubheading, { color: colors.textSecondary }]}>PAST TRIPS</Text>
      {(!rides || rides.length === 0) ? (
        <Text style={{ color: colors.textTertiary }}>No past rides found.</Text>
      ) : (
        rides.map((ride, index) => (
          <View key={index} style={[styles.historyCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
            <View style={styles.historyRow}>
              <View style={styles.historyTextWrap}>
                <Text style={[styles.historyTitleText, { color: colors.textPrimary }]} numberOfLines={1}>
                  {ride.pickupAddress} to {ride.destinationAddress}
                </Text>
                <Text style={[styles.historyDateText, { color: colors.textTertiary }]}>
                  {new Date(ride.createdAt || Date.now()).toLocaleDateString()}
                </Text>
                <Text style={[styles.historyMetaText, { color: colors.textSecondary }]}>
                  {ride.rideType} • Distance: {ride.distanceKm}km
                </Text>
              </View>
              <Text style={[styles.historyPrice, { color: colors.error }]}>
                -GH₵{(ride.fare || 0).toFixed(2)}
              </Text>
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderOrdersModal = () => (
    <View style={styles.modalForm}>
      <Text style={[styles.modalSubheading, { color: colors.textSecondary }]}>PAST FOOD ORDERS</Text>
      {(!orders || orders.length === 0) ? (
        <Text style={{ color: colors.textTertiary }}>No past orders found.</Text>
      ) : (
        orders.map((order, index) => (
          <View key={index} style={[styles.historyCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
            <View style={styles.historyRow}>
              <View style={styles.historyTextWrap}>
                <Text style={[styles.historyTitleText, { color: colors.textPrimary }]} numberOfLines={1}>
                  {order.restaurantName}
                </Text>
                <Text style={[styles.historyDateText, { color: colors.textTertiary }]}>
                  {new Date(order.createdAt || Date.now()).toLocaleDateString()}
                </Text>
                <Text style={[styles.historyMetaText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {order.items?.map((item: any) => `${item.quantity}x ${item.menuItemName}`).join(', ') || 'Items'}
                </Text>
              </View>
              <Text style={[styles.historyPrice, { color: colors.error }]}>
                -GH₵{(order.totalAmount || 0).toFixed(2)}
              </Text>
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderReviewsModal = () => (
    <View style={styles.modalForm}>
      <Text style={[styles.modalSubheading, { color: colors.textSecondary }]}>YOUR REVIEWS</Text>

      <View style={[styles.historyCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
        <View style={styles.reviewHeaderRow}>
          <Text style={[styles.historyTitleText, { color: colors.textPrimary }]}>KFC Osu</Text>
          <View style={styles.ratingStars}>
            {[1, 2, 3, 4, 5].map(star => (
              <Icon key={star} name="star" set="material" size={12} color={colors.foodOrange} />
            ))}
          </View>
        </View>
        <Text style={[styles.historyDateText, { color: colors.textTertiary }]}>Reviewed on June 22, 2026</Text>
        <Text style={[styles.reviewBodyText, { color: colors.textSecondary }]}>"Crispy chicken delivered very hot and fresh! Delivery rider was extremely polite."</Text>
      </View>

      <View style={[styles.historyCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
        <View style={styles.reviewHeaderRow}>
          <Text style={[styles.historyTitleText, { color: colors.textPrimary }]}>Standard Ride (Driver: K. Osei)</Text>
          <View style={styles.ratingStars}>
            {[1, 2, 3, 4].map(star => (
              <Icon key={star} name="star" set="material" size={12} color={colors.foodOrange} />
            ))}
            <Icon name="star-outline" set="material" size={12} color={colors.border} />
          </View>
        </View>
        <Text style={[styles.historyDateText, { color: colors.textTertiary }]}>Reviewed on June 19, 2026</Text>
        <Text style={[styles.reviewBodyText, { color: colors.textSecondary }]}>"Smooth driving and clean car, although he arrived a few minutes later than expected."</Text>
      </View>
    </View>
  );

  const renderHelpModal = () => (
    <View style={styles.modalForm}>
      <Text style={[styles.modalSubheading, { color: colors.textSecondary }]}>FREQUENTLY ASKED QUESTIONS</Text>

      {[
        { id: 1, q: "How do I top up my SuperWallet?", a: "Go to the Wallet tab, press 'Top Up', choose your card or mobile money reference, and confirm your payment gateway verification." },
        { id: 2, q: "Can I cancel a ride after booking?", a: "Yes, you can cancel your ride before driver arrival. If the driver is already in progress, standard cancellation rates may apply." },
        { id: 3, q: "How are refunds handled on GoZone?", a: "If you cancel a food order before preparation begins, the full total is automatically credited back directly to your SuperWallet balance." }
      ].map(faq => {
        const isOpen = openFaqId === faq.id;
        return (
          <TouchableOpacity
            key={faq.id}
            style={[styles.faqCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
            onPress={() => setOpenFaqId(isOpen ? null : faq.id)}
            activeOpacity={0.7}
          >
            <View style={styles.faqHeader}>
              <Text style={[styles.faqQuestion, { color: colors.textPrimary }]}>{faq.q}</Text>
              <Icon name={isOpen ? "chevron-up" : "chevron-down"} set="feather" size={16} color={colors.textSecondary} />
            </View>
            {isOpen && (
              <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>{faq.a}</Text>
            )}
          </TouchableOpacity>
        );
      })}

      <View style={{ marginTop: spacing.xl }}>
        <Button
          title="💬 Chat with Live Support"
          onPress={() => Alert.alert("Support Desk", "Our support agents are currently offline. Please try again later.")}
          fullWidth
        />
      </View>
    </View>
  );

  const renderTermsModal = () => (
    <View style={styles.modalForm}>
      <Text style={[styles.policyText, { color: colors.textSecondary }]}>
        Welcome to GoZone. By accessing our application and ordering food, booking rides, or topping up wallets, you agree to comply with our Terms of Service.
      </Text>
      <Text style={[styles.policyText, { color: colors.textSecondary, marginTop: 12 }]}>
        1. Wallet Balances: Wallet funds are non-transferable to outside channels unless through verified bank/momo withdrawals. Transactions are verified securely via Paystack.
      </Text>
      <Text style={[styles.policyText, { color: colors.textSecondary, marginTop: 12 }]}>
        2. Cancellation Policies: Food orders cancelled after restaurant acceptance are subject to payment processing and food item preparation costs. Rides cancelled in progress incur partial fare.
      </Text>
      <Text style={[styles.policyText, { color: colors.textSecondary, marginTop: 12 }]}>
        Please use the platform responsibly. GoZone reserves the right to suspend accounts displaying fraudulent wallet topup attempts.
      </Text>
    </View>
  );

  const renderAboutModal = () => (
    <View style={[styles.modalForm, { alignItems: 'center' }]}>
      <View style={[styles.avatarLarge, { backgroundColor: colors.primaryLight }]}>
        <Text style={[styles.avatarText, { color: colors.primary }]}>GZ</Text>
      </View>
      <Text style={[styles.userName, { color: colors.textPrimary }]}>GoZone SuperApp</Text>
      <Text style={[styles.versionText, { color: colors.textTertiary, marginTop: 4 }]}>Version 1.0.0 (Production Build)</Text>
      <Text style={[styles.policyText, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.lg }]}>
        GoZone is the unified super-app for ride booking, food delivery, and mobile wallet payments across Ghana. Designed with premium HSL thematic adaptability.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ===== Header Bar ===== */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPressIn={() => animateScale(backBtnScale, 0.9)}
            onPressOut={() => animateScale(backBtnScale, 1)}
            style={[styles.iconBtn, { backgroundColor: colors.surface }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.9}
          >
            <Animated.View style={{ transform: [{ scale: backBtnScale }] }}>
              <Icon name="chevron-left" set="feather" size={20} color={colors.textPrimary} />
            </Animated.View>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Profile</Text>
          <TouchableOpacity
            onPressIn={() => animateScale(settingsBtnScale, 0.9)}
            onPressOut={() => animateScale(settingsBtnScale, 1)}
            style={[styles.iconBtn, { backgroundColor: colors.surface }]}
            onPress={() => handleMenuPress('Personal Information')}
            activeOpacity={0.9}
          >
            <Animated.View style={{ transform: [{ scale: settingsBtnScale }] }}>
              <Icon name="settings" set="feather" size={18} color={colors.textPrimary} />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* ===== Profile Header ===== */}
        <View style={styles.profileHeader}>
          <TouchableOpacity
            onPressIn={() => animateScale(avatarBtnScale, 0.92)}
            onPressOut={() => animateScale(avatarBtnScale, 1)}
            style={[styles.avatarLarge, { backgroundColor: colors.primaryLight, overflow: 'hidden' }]}
            onPress={() => handleMenuPress('Personal Information')}
            activeOpacity={0.9}
          >
            <Animated.View style={{ width: '100%', height: '100%', transform: [{ scale: avatarBtnScale }] }}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={{ width: '100%', height: '100%' }} />
              ) : (
                <Text style={[styles.avatarText, { color: colors.primary, textAlign: 'center', marginTop: 18 }]}>{getInitials()}</Text>
              )}
            </Animated.View>
          </TouchableOpacity>
          <Text style={[styles.userName, { color: colors.textPrimary }]}>{name}</Text>
          <View style={[styles.phoneRow, { backgroundColor: colors.surfaceAlt }]}>
            <Icon name="phone" set="feather" size={12} color={colors.textTertiary} />
            <Text style={[styles.userPhone, { color: colors.textSecondary }]}>{phone}</Text>
          </View>

          {/* Stats */}
          <TouchableOpacity
            onPressIn={() => animateScale(statsCardScale, 0.98)}
            onPressOut={() => animateScale(statsCardScale, 1)}
            activeOpacity={0.9}
            style={{ width: '100%' }}
          >
            <Animated.View style={[
              styles.statsRow, 
              { 
                backgroundColor: colors.surface,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                borderWidth: 1.5,
                transform: [{ scale: statsCardScale }]
              }, 
              shadows.small
            ]}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>{rides ? rides.length : 0}</Text>
                <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Rides</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>{orders ? orders.length : 0}</Text>
                <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Orders</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <View style={styles.ratingRow}>
                  <Text style={[styles.statValue, { color: colors.textPrimary }]}>4.9</Text>
                  <Icon name="star" set="material" size={14} color={colors.foodOrange} />
                </View>
                <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Rating</Text>
              </View>
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* ===== Theme Switcher Card ===== */}
        <TouchableOpacity
          onPressIn={() => animateScale(themeCardScale, 0.98)}
          onPressOut={() => animateScale(themeCardScale, 1)}
          style={{ width: '100%' }}
          onPress={() => navigation.navigate('ThemeSettings' as any)}
          activeOpacity={0.9}
        >
          <Animated.View style={[
            styles.themeCard, 
            { 
              backgroundColor: colors.surface,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
              borderWidth: 1.5,
              transform: [{ scale: themeCardScale }]
            }, 
            shadows.small
          ]}>
            <View style={[styles.themeIconWrap, { backgroundColor: colors.primaryLight }]}>
              <Icon name="palette" set="material" size={20} color={colors.primary} />
            </View>
            <View style={styles.themeInfo}>
              <Text style={[styles.themeCardTitle, { color: colors.textPrimary }]}>Appearance</Text>
              <Text style={[styles.themeCardSub, { color: colors.textTertiary }]}>
                {theme.displayName} {isDark ? '· Dark' : '· Light'} mode
              </Text>
            </View>
            <View style={styles.themePreview}>
              <View style={[styles.previewSwatch, { backgroundColor: theme.previewColors.bg, borderColor: colors.border }]} />
              <View style={[styles.previewSwatch, { backgroundColor: theme.previewColors.surface, borderColor: colors.border }]} />
              <View style={[styles.previewSwatch, { backgroundColor: theme.previewColors.accent }]} />
            </View>
            <Icon name="chevron-right" set="feather" size={18} color={colors.textTertiary} />
          </Animated.View>
        </TouchableOpacity>

        {/* ===== Menu Sections ===== */}
        {MENU_SECTIONS.map((section) => (
          <View key={section.title} style={styles.menuSection}>
            <Text style={[styles.menuSectionTitle, { color: colors.textTertiary }]}>{section.title}</Text>
            <View style={[styles.menuCard, { backgroundColor: colors.surface }, shadows.small]}>
              {section.items.map((item, index) => (
                <ProfileMenuItem
                  key={item.label}
                  item={item}
                  isLast={index === section.items.length - 1}
                  colors={colors}
                  onPress={() => handleMenuPress(item.label)}
                />
              ))}
            </View>
          </View>
        ))}

        {/* ===== Logout ===== */}
        <TouchableOpacity
          onPressIn={() => animateScale(logoutBtnScale, 0.96)}
          onPressOut={() => animateScale(logoutBtnScale, 1)}
          onPress={() => {
            Alert.alert(
              "Log Out",
              "Are you sure you want to log out of GoZone?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Log Out",
                  style: "destructive",
                  onPress: () => {
                    if (onLogout) {
                      onLogout();
                    } else {
                      navigation.navigate('Auth' as any);
                    }
                  }
                }
              ]
            );
          }}
          activeOpacity={0.95}
        >
          <Animated.View style={[
            styles.logoutButton, 
            { 
              backgroundColor: colors.surface,
              transform: [{ scale: logoutBtnScale }] 
            }, 
            shadows.small
          ]}>
            <Icon name="log-out" set="feather" size={18} color={colors.error} />
            <Text style={[styles.logoutText, { color: colors.error }]}>Log Out</Text>
          </Animated.View>
        </TouchableOpacity>

        <Text style={[styles.versionText, { color: colors.textTertiary }]}>GoZone v1.0.0</Text>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ===== Interactive Modals Container ===== */}
      <Modal
        visible={activeModal !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setActiveModal(null)}
      >
        <SafeAreaView style={[styles.modalOverlay, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
            <ModalCloseButton onPress={() => setActiveModal(null)} colors={colors} />
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {activeModal === 'personal' && 'Personal Information'}
              {activeModal === 'addresses' && 'Saved Addresses'}
              {activeModal === 'payments' && 'Payment Methods'}
              {activeModal === 'promotions' && 'Promotions & Rewards'}
              {activeModal === 'rides' && 'Ride History'}
              {activeModal === 'orders' && 'Order History'}
              {activeModal === 'reviews' && 'My Reviews'}
              {activeModal === 'help' && 'Help Center'}
              {activeModal === 'terms' && 'Terms & Privacy'}
              {activeModal === 'about' && 'About GoZone'}
            </Text>
            <View style={styles.modalCloseBtn} />
          </View>

          {/* Modal Content */}
          <ScrollView contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
            {activeModal === 'personal' && renderPersonalModal()}
            {activeModal === 'addresses' && renderAddressesModal()}
            {activeModal === 'payments' && renderPaymentsModal()}
            {activeModal === 'promotions' && renderPromotionsModal()}
            {activeModal === 'rides' && renderRidesModal()}
            {activeModal === 'orders' && renderOrdersModal()}
            {activeModal === 'reviews' && renderReviewsModal()}
            {activeModal === 'help' && renderHelpModal()}
            {activeModal === 'terms' && renderTermsModal()}
            {activeModal === 'about' && renderAboutModal()}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: spacing.xl },

  // Top bar
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerTitle: { fontSize: typography.size['2xl'], fontWeight: '700' },
  iconBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  // Profile header
  profileHeader: { alignItems: 'center', marginBottom: spacing.xl },
  avatarLarge: {
    width: 80, height: 80, borderRadius: 9999,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
  },
  avatarText: { fontSize: typography.size['3xl'], fontWeight: '700' },
  userName: { fontSize: typography.size.xl, fontWeight: '700' },
  phoneRow: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: borderRadius.full, marginTop: 6,
  },
  userPhone: { fontSize: typography.size.sm },
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: spacing.lg, borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg, paddingHorizontal: spacing.xl,
    width: '100%',
  },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: typography.size.xl, fontWeight: '800' },
  statLabel: { fontSize: 11, marginTop: 3 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  statDivider: { width: 1, height: 32 },

  // Theme card
  themeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: borderRadius.lg, padding: spacing.base, marginBottom: spacing.xl,
  },
  themeIconWrap: { width: 40, height: 40, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  themeInfo: { flex: 1 },
  themeCardTitle: { fontSize: typography.size.md, fontWeight: '600' },
  themeCardSub: { fontSize: typography.size.sm, marginTop: 2 },
  themePreview: { flexDirection: 'row', gap: 4 },
  previewSwatch: { width: 18, height: 18, borderRadius: 5, borderWidth: 1 },

  // Menu
  menuSection: { marginBottom: spacing.xl },
  menuSectionTitle: {
    fontSize: 11, fontWeight: '700', letterSpacing: 0.8,
    marginBottom: spacing.sm, marginLeft: 4,
  },
  menuCard: { borderRadius: borderRadius.lg, overflow: 'hidden' },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, paddingHorizontal: spacing.base,
  },
  menuIconWrap: {
    width: 32, height: 32, borderRadius: borderRadius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: typography.size.md, fontWeight: '500' },

  // Logout
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: borderRadius.lg, paddingVertical: spacing.base, marginBottom: spacing.md,
  },
  logoutText: { fontSize: typography.size.base, fontWeight: '600' },
  versionText: { textAlign: 'center', fontSize: 11 },

  // Modal styles
  modalOverlay: { flex: 1 },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingVertical: 14, borderBottomWidth: 1,
  },
  modalCloseBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  closeBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: { fontSize: typography.size.md, fontWeight: '700', textAlign: 'center', flex: 1 },
  modalScrollContent: { padding: spacing.xl, paddingBottom: 60 },
  modalForm: { width: '100%' },
  modalSubheading: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, marginBottom: spacing.md, marginTop: spacing.sm },
  inputLabel: { fontSize: typography.size.sm, fontWeight: '600', marginBottom: 6, marginTop: spacing.md },
  modalInput: {
    borderWidth: 1, borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md, paddingVertical: 12,
    fontSize: typography.size.md, marginBottom: spacing.md,
  },
  currentInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    marginBottom: spacing.xl,
    gap: 16,
  },
  currentInfoAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentInfoInitials: {
    fontSize: typography.size.xl,
    fontWeight: '700',
  },
  currentInfoText: {
    flex: 1,
    gap: 4,
  },
  currentInfoName: {
    fontSize: typography.size.lg,
    fontWeight: '700',
  },
  currentInfoSub: {
    fontSize: typography.size.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    gap: 10,
    height: 48,
    marginBottom: spacing.md,
  },
  inputField: {
    flex: 1,
    fontSize: typography.size.md,
    padding: 0,
    height: '100%',
  },

  // Address Modal components
  addressItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, marginBottom: spacing.sm,
  },
  addressItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 0.9 },
  smallIconWrap: { width: 28, height: 28, borderRadius: borderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  addressItemLabel: { fontSize: typography.size.sm, fontWeight: '700' },
  addressItemText: { fontSize: 12, marginTop: 1 },
  deleteBtn: { padding: 4 },
  addAddressForm: { marginTop: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1 },

  // Payment Modal components
  paymentItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1.5, marginBottom: spacing.md,
  },
  paymentItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  paymentItemType: { fontSize: typography.size.sm, fontWeight: '700' },
  paymentItemDetail: { fontSize: 12, marginTop: 1 },
  radioDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  radioDotFill: { width: 10, height: 10, borderRadius: 5 },
  addCardForm: { marginTop: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1 },

  // Promotions & Rewards Modal components
  rewardsBanner: { padding: spacing.lg, marginBottom: spacing.lg, gap: 10 },
  rewardsTextWrap: { gap: 3 },
  rewardsLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.8 },
  rewardsValue: { fontSize: typography.size.xl, fontWeight: '800' },
  rewardsSub: { fontSize: 11 },
  progressBarBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  promoInputRow: { flexDirection: 'row', gap: 8, marginBottom: spacing.lg },
  promoInput: {
    flex: 1, borderWidth: 1, borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md, paddingVertical: 12, fontSize: typography.size.md,
  },
  promoBtn: { borderRadius: borderRadius.md, paddingHorizontal: spacing.lg, justifyContent: 'center' },
  promoBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: typography.size.sm },
  voucherCard: {
    flexDirection: 'row', borderRadius: borderRadius.md, borderWidth: 1,
    overflow: 'hidden', marginBottom: spacing.sm, height: 74,
  },
  voucherLeft: { flex: 1.3, padding: spacing.md, justifyContent: 'center' },
  voucherValueText: { fontSize: typography.size.md, fontWeight: '800' },
  voucherCodeText: { fontSize: 11, fontWeight: '700', marginTop: 1 },
  voucherDescText: { fontSize: 10, marginTop: 1 },
  voucherRight: { flex: 0.5, borderLeftWidth: 1, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  voucherUseText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  // History lists components
  historyCard: { borderRadius: borderRadius.md, borderWidth: 1, padding: spacing.md, marginBottom: spacing.sm },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyTextWrap: { flex: 0.8, gap: 2 },
  historyTitleText: { fontSize: typography.size.sm, fontWeight: '700' },
  historyDateText: { fontSize: 10 },
  historyMetaText: { fontSize: 11 },
  historyPrice: { fontSize: typography.size.md, fontWeight: '800' },

  // Reviews components
  reviewHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  ratingStars: { flexDirection: 'row', gap: 1 },
  reviewBodyText: { fontSize: 12, fontStyle: 'italic', marginTop: 6 },

  // Help FAQ components
  faqCard: { borderRadius: borderRadius.md, borderWidth: 1, padding: spacing.md, marginBottom: spacing.sm },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { fontSize: typography.size.sm, fontWeight: '700', flex: 0.9 },
  faqAnswer: { fontSize: 12, marginTop: spacing.md, lineHeight: 18 },

  // Terms components
  policyText: { fontSize: typography.size.sm, lineHeight: 20 },
});
