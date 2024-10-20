import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, SafeAreaView, Switch, TextInput, Modal, Alert, Dimensions } from 'react-native';
import { useCart } from '../CartContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: any;
}

const { width } = Dimensions.get('window');
const cardWidth = width * 0.92; 

export default function Cart({ navigation }: { navigation: any }) {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);
  const [isExpressDelivery, setIsExpressDelivery] = useState(false);
  const [savedForLater, setSavedForLater] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<CartItem[]>([]);

  useEffect(() => {
    loadSavedForLater();
    loadWishlist();
  }, []);

  const loadSavedForLater = async () => {
    try {
      const savedItems = await AsyncStorage.getItem('savedForLater');
      if (savedItems !== null) {
        setSavedForLater(JSON.parse(savedItems));
      }
    } catch (error) {
      console.error('Error loading saved for later items:', error);
    }
  };

  const loadWishlist = async () => {
    try {
      const wishlistItems = await AsyncStorage.getItem('wishlist');
      if (wishlistItems !== null) {
        setWishlist(JSON.parse(wishlistItems));
      }
    } catch (error) {
      console.error('Error loading wishlist items:', error);
    }
  };

  const handleRemoveItem = (id: number) => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this item from your cart?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", onPress: () => removeFromCart(id), style: "destructive" }
      ]
    );
  };

  const handleQuantityChange = (id: number, value: number) => {
    const item = cartItems.find(item => item.id === id);
    if (item) {
      const newQuantity = item.quantity + value;
      if (newQuantity > 0) {
        updateQuantity(id, newQuantity);
      }
    }
  };

  const applyCoupon = () => {
    Alert.alert("Coupon Applied", `Coupon ${couponCode} has been applied to your order.`);
    setCouponCode('');
  };

  const toggleModal = (item: CartItem) => {
    setSelectedItem(item);
    setModalVisible(!isModalVisible);
  };

  const saveForLater = async (item: CartItem) => {
    const updatedSavedForLater = [...savedForLater, item];
    setSavedForLater(updatedSavedForLater);
    await AsyncStorage.setItem('savedForLater', JSON.stringify(updatedSavedForLater));
    removeFromCart(item.id);
    Alert.alert("Saved", `${item.name} has been saved for later.`);
    setModalVisible(false);
  };

  const addToWishlist = async (item: CartItem) => {
    const updatedWishlist = [...wishlist, item];
    setWishlist(updatedWishlist);
    await AsyncStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    removeFromCart(item.id);
    Alert.alert("Added to Wishlist", `${item.name} has been added to your wishlist.`);
    setModalVisible(false);
  };

  const renderCartItem = (item: CartItem) => {
    return (
      <View key={item.id} style={styles.cartItem}>
        <Image source={item.image} style={styles.itemImage} />
        <View style={styles.itemDetails}>
          <Text style={styles.itemName} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
          <Text style={styles.itemPrice}>₹{item.price.toFixed(2)}</Text>
          <View style={styles.quantityControl}>
            <TouchableOpacity 
              style={[styles.quantityButton, item.quantity <= 1 && { opacity: 0.5 }]} 
              onPress={() => handleQuantityChange(item.id, -1)}
              disabled={item.quantity <= 1}
            >
              <Ionicons name="remove" size={18} color={item.quantity <= 1 ? "#ccc" : "#000"} />
            </TouchableOpacity>
            <Text style={styles.quantity}>{item.quantity}</Text>
            <TouchableOpacity style={styles.quantityButton} onPress={() => handleQuantityChange(item.id, 1)}>
              <Ionicons name="add" size={18} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.itemActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => toggleModal(item)}>
            <MaterialIcons name="more-vert" size={24} color="#888" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveItem(item.id)}>
            <Ionicons name="trash-outline" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderWishlistItem = (item: CartItem) => {
    return (
      <View key={item.id} style={styles.wishlistItem}>
        <Image source={item.image} style={styles.wishlistItemImage} />
        <View style={styles.wishlistItemDetails}>
          <Text style={styles.wishlistItemName} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
          <Text style={styles.wishlistItemPrice}>₹{item.price.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.moveToCartButton} onPress={() => moveToCart(item)}>
          <Text style={styles.moveToCartButtonText}>Move to Cart</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const moveToCart = (item: CartItem) => {
    // Add item to cart
    // Remove item from wishlist
    const updatedWishlist = wishlist.filter(wishlistItem => wishlistItem.id !== item.id);
    setWishlist(updatedWishlist);
    AsyncStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    Alert.alert("Moved to Cart", `${item.name} has been moved to your cart.`);
  };

  const renderEmptyCart = () => {
    return (
      <View style={styles.emptyCart}>
        <Ionicons name="cart-outline" size={80} color="#ccc" />
        <Text style={styles.emptyCartText}>Your cart is empty</Text>
        <TouchableOpacity style={styles.shopNowButton} onPress={() => navigation.navigate("Products")}>
          <Text style={styles.shopNowButtonText}>Shop Now</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const expressDeliveryCost = isExpressDelivery ? 100 : 0;
  const total = subtotal + expressDeliveryCost;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#4CAF50', '#45a049']} style={styles.header}>
        <Text style={styles.headerText}>My Cart ({cartItems.length})</Text>
      </LinearGradient>
      <ScrollView style={styles.cartList}>
        {cartItems.length > 0 ? cartItems.map(renderCartItem) : renderEmptyCart()}
        
        {cartItems.length > 0 && (
          <View style={styles.cartExtras}>
            <View style={styles.extraOption}>
              <Text style={styles.extraOptionText}>Express Delivery</Text>
              <Switch
                value={isExpressDelivery}
                onValueChange={setIsExpressDelivery}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={isExpressDelivery ? "#f5dd4b" : "#f4f3f4"}
              />
            </View>
            <View style={styles.couponSection}>
              <TextInput
                style={styles.couponInput}
                placeholder="Enter Coupon Code"
                value={couponCode}
                onChangeText={setCouponCode}
              />
              <TouchableOpacity style={styles.applyCouponButton} onPress={applyCoupon}>
                <Text style={styles.applyCouponText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {wishlist.length > 0 && (
          <View style={styles.wishlistSection}>
            <Text style={styles.sectionTitle}>Wishlist</Text>
            {wishlist.map(renderWishlistItem)}
          </View>
        )}
      </ScrollView>
      
      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalSection}>
            <Text style={styles.totalText}>Subtotal:</Text>
            <Text style={styles.totalAmount}>₹{subtotal.toFixed(2)}</Text>
          </View>
          {isExpressDelivery && (
            <View style={styles.totalSection}>
              <Text style={styles.totalText}>Express Delivery:</Text>
              <Text style={styles.totalAmount}>₹{expressDeliveryCost.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalText}>Total:</Text>
            <Text style={styles.grandTotalAmount}>₹{total.toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutButton} onPress={() => navigation.navigate("Payment")}>
            <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedItem?.name}</Text>
            <TouchableOpacity style={styles.modalOption} onPress={() => selectedItem && saveForLater(selectedItem)}>
              <FontAwesome5 name="bookmark" size={20} color="#4CAF50" />
              <Text style={styles.modalOptionText}>Save for Later</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={() => selectedItem && addToWishlist(selectedItem)}>
              <FontAwesome5 name="heart" size={20} color="#4CAF50" />
              <Text style={styles.modalOptionText}>Add to Wishlist</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
  },
  headerText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
  },
  cartList: {
    flex: 1,
    padding: 10,
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: cardWidth,
    alignSelf: 'center',
  },
  itemImage: {
    width: 70,
    height: 70,
    resizeMode: 'cover',
    marginRight: 12,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 8,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    padding: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
  },
  quantity: {
    paddingHorizontal: 12,
    fontSize: 16,
  },
  itemActions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 6,
  },
  removeButton: {
    padding: 6,
  },
  emptyCart: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 50,
  },
  emptyCartText: {
    fontSize: 18,
    color: "#888",
    marginTop: 20,
    marginBottom: 20,
  },
  shopNowButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  shopNowButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  cartExtras: {
    backgroundColor: "#fff",
    padding: 15,
    marginTop: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  extraOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  extraOptionText: {
    fontSize: 16,
  },
  couponSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  applyCouponButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
  },
  applyCouponText: {
    color: "#fff",
    fontWeight: "bold",
  },
  footer: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  totalSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  totalText: {
    fontSize: 16,
    color: "#666",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  grandTotal: {
    marginTop: 10,
    marginBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },
  grandTotalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  grandTotalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  checkoutButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 5,
    paddingVertical: 15,
    alignItems: "center",
  },
  checkoutButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalOptionText: {
    fontSize: 16,
    marginLeft: 10,
  },
  modalCloseButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  wishlistSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    width: cardWidth,
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#4CAF50",
  },
  wishlistItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    padding: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  wishlistItemImage: {
    width: 50,
    height: 50,
    resizeMode: 'cover',
    marginRight: 8,
    borderRadius: 4,
  },
  wishlistItemDetails: {
    flex: 1,
  },
  wishlistItemName: {
    fontSize: 14,
    fontWeight: "600",
  },
  wishlistItemPrice: {
    fontSize: 14,
    color: "#4CAF50",
  },
  moveToCartButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  moveToCartButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
