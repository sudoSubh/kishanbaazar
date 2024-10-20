// screens/ChatScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, TextInput } from 'react-native';
import { useCart } from '../CartContext';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Chat: { 
    productId: number; 
    productName: string; 
    currentPrice: number;
    sellerId: number;
    sellerName: string;
  };
  Cart: undefined;
  // Add other screens as needed
};

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;
type ChatScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Chat'>;

type Props = {
  route: ChatScreenRouteProp;
  navigation: ChatScreenNavigationProp;
};

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'seller';
  showOptions?: boolean;
};

const ChatScreen: React.FC<Props> = ({ route, navigation }) => {
  const { productId, productName, currentPrice, sellerId, sellerName } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [quantity, setQuantity] = useState('');
  const [negotiatedPrice, setNegotiatedPrice] = useState(currentPrice);
  const { cartItems, updatePriceAndQuantity, addToCart } = useCart();

  useEffect(() => {
    setMessages([
      {
        id: '1',
        text: `Hello! I'm interested in buying ${productName} in bulk. What's your best price for large quantities?`,
        sender: 'user'
      },
      {
        id: '2',
        text: `Hi there! I'd be happy to discuss bulk pricing for ${productName}. How many units are you looking to purchase?`,
        sender: 'seller'
      }
    ]);
  }, [productName]);

  const calculateDiscount = (qty: number) => {
    const maxDiscount = 0.15;
    const discountFactor = Math.min(qty / 100, maxDiscount);
    return Math.round((1 - discountFactor) * currentPrice);
  };

  const handleSendMessage = () => {
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 10) {
      Alert.alert("Bulk Order", "Please enter a valid quantity of 10 or more for bulk pricing.");
      return;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      text: `I'm interested in purchasing ${qty} units. Can you offer a discount?`,
      sender: 'user'
    };
    setMessages(prev => [...prev, newMessage]);

    // Simulate seller's response
    setTimeout(() => {
      const discountedPrice = calculateDiscount(qty);
      setNegotiatedPrice(discountedPrice);
      const sellerResponse: Message = {
        id: Date.now().toString(),
        text: `For an order of ${qty} units, I can offer a price of ₹${discountedPrice} per unit. Would you like to proceed with this offer?`,
        sender: 'seller',
        showOptions: true
      };
      setMessages(prev => [...prev, sellerResponse]);
    }, 1000);
  };

  const handleAcceptOffer = () => {
    const qty = parseInt(quantity);
    const existingItem = cartItems.find(item => item.id === productId);
    
    if (existingItem) {
      // Update both price and quantity
      updatePriceAndQuantity(productId, negotiatedPrice, qty);
      Alert.alert(
        "Offer Accepted",
        `The price and quantity for ${productName} have been updated to ${qty} units at ₹${negotiatedPrice} per unit in your cart.`,
        [{ text: "Go to Cart", onPress: () => navigation.navigate('Cart') }]
      );
    } else {
      // Add as a new item
      addToCart({
        id: productId,
        name: productName,
        price: negotiatedPrice,
        quantity: qty,
        image: '' // Add appropriate image here
      });
      Alert.alert(
        "Offer Accepted",
        `A new bulk order of ${qty} units of ${productName} at ₹${negotiatedPrice} per unit has been added to your cart.`,
        [{ text: "Go to Cart", onPress: () => navigation.navigate('Cart') }]
      );
    }
  };

  const handleRejectOffer = () => {
    const rejectMessage: Message = {
      id: Date.now().toString(),
      text: "I'm sorry, but I'll have to decline this offer. Thank you for your time.",
      sender: 'user'
    };
    setMessages(prev => [...prev, rejectMessage]);
  };

  const handleQuantityChange = (newQuantity: string) => {
    setQuantity(newQuantity);
    const qty = parseInt(newQuantity);
    if (!isNaN(qty) && qty >= 10) {
      const newPrice = calculateDiscount(qty);
      setNegotiatedPrice(newPrice);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.sender === 'user' ? styles.userMessage : styles.sellerMessage]}>
      <Text style={styles.messageText}>{item.text}</Text>
      {item.showOptions && (
        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptOffer}>
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rejectButton} onPress={handleRejectOffer}>
            <Text style={styles.buttonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.quantityInput}
          placeholder="Enter quantity (min 10)"
          keyboardType="numeric"
          value={quantity}
          onChangeText={handleQuantityChange}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  messageList: {
    flex: 1,
    padding: 10,
  },
  messageContainer: {
    maxWidth: '80%',
    borderRadius: 20,
    padding: 12,
    marginBottom: 10,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
  },
  sellerMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#FFFFFF',
  },
  quantityInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#075E54',
    padding: 10,
    borderRadius: 20,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  acceptButton: {
    backgroundColor: '#075E54',
    padding: 8,
    borderRadius: 15,
    marginRight: 10,
  },
  rejectButton: {
    backgroundColor: '#FF0000',
    padding: 8,
    borderRadius: 15,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default ChatScreen;
