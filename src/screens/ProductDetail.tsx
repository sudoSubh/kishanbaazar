import React from "react";
import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useCart } from '../CartContext';

const { width } = Dimensions.get('window');

const ProductDetail = (props: { route: any; navigation: any }) => {
  const { route, navigation } = props;
  const { addToCart, updatePriceAndQuantity } = useCart();
  
  const products = [
    {
      id: 1,
      name: "Fresh Tomatoes",
      price: 35,
      quantity: 500,
      description: "Fresh, juicy tomatoes sourced from the local farms of Maharashtra.",
      image: require("../../assets/products/tomatoes.jpg"),
      seller: {
        id: 123,
        name: "Kashmir Valley Farms",
        location: "Bengaluru, Karnataka",
        rating: 4.5,
        reviews: 50,
      },
    },
    {
      id: 2,
      name: "Sweet Corn",
      price: 25,
      quantity: 700,
      description:
        "Fresh corn, directly sourced from Mumbai farms, perfect for a healthy snack.",
      image: require("../../assets/products/corn.jpg"),
      seller: {
        id: 124,
        name: "Green Field Farms",
        location: "Mumbai, Maharashtra",
        rating: 4.2,
        reviews: 35,
      },
    },
    {
      id: 3,
      name: "Organic Apples",
      price: 150,
      quantity: 100,
      description:
        "Fresh organic apples from the orchards of Himachal Pradesh, perfect for a healthy snack.",
      image: require("../../assets/products/apples.jpg"),
      seller: {
        id: 125,
        name: "Urban Greens",
        location: "Shimla, Himachal Pradesh",
        rating: 4.8,
        reviews: 45,
      },
    },
    {
      id: 4,
      name: "Carrots",
      price: 40,
      quantity: 400,
      description: "Sweet, organic carrots from the fields of Punjab.",
      image: require("../../assets/products/carrots.jpg"),
      seller: {
        id: 126,
        name: "Pure Veggie Farms",
        location: "Delhi, Delhi",
        rating: 4.1,
        reviews: 60,
      },
    },
    {
      id: 5,
      name: "Potatoes",
      price: 20,
      quantity: 500,
      description: "Locally grown potatoes from the heartland of Uttar Pradesh.",
      image: require("../../assets/products/potatoes.jpg"),
      seller: {
        id: 127,
        name: "AgriWorld Farms",
        location: "Pune, Maharashtra",
        rating: 4.0,
        reviews: 30,
      },
    },
    {
      id: 6,
      name: "Basmati Rice",
      price: 90,
      quantity: 350,
      description: "Fresh basmati rice from the cool highlands of Ooty.",
      image: require("../../assets/products/rice.jpg"),
      seller: {
        id: 128,
        name: "Ooty Organic Farms",
        location: "Amritsar, Punjab",
        rating: 4.9,
        reviews: 40,
      },
    },
    {
      id: 7,
      name: "Fresh Mangoes",
      price: 200,
      quantity: 450,
      description: "Fresh mangoes sourced from the farms of Ratnagiri, Maharashtra.",
      image: require("../../assets/products/mangoes.jpg"),
      seller: {
        id: 129,
        name: "Fresh Harvest",
        location: "Ratnagiri, Maharashtra",
        rating: 5.0,
        reviews: 55,
      },
    },
  ];

  const { id } = route.params;
  const product = products.find((item) => item.id === id);

  if (!product) {
    return <Text>Product not found!</Text>;
  }

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: 1,
    });
    navigation.navigate('Cart');
  };

  const handleNegotiate = () => {
    navigation.navigate('Chat', {
      productId: product.id,
      productName: product.name,
      currentPrice: product.price,
      sellerId: product.seller.id,
      sellerName: product.seller.name
    });
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={product.image} style={styles.image} resizeMode="cover" />
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.name}>{product.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{product.price}/kg</Text>
          <Text style={styles.quantity}>Available: {product.quantity} kg</Text>
        </View>
        <Text style={styles.description}>{product.description}</Text>

        <View style={styles.sellerContainer}>
          <Text style={styles.sectionTitle}>Seller Information</Text>
          <View style={styles.sellerInfo}>
            <MaterialIcons name="store" size={20} color="#4CAF50" style={styles.icon} />
            <View>
              <Text style={styles.sellerName}>{product.seller.name}</Text>
              <Text style={styles.sellerLocation}>{product.seller.location}</Text>
            </View>
          </View>
          <View style={styles.ratingContainer}>
            <MaterialIcons name="star" size={20} color="#f39c12" style={styles.icon} />
            <Text style={styles.ratingValue}>{product.seller.rating} ({product.seller.reviews} reviews)</Text>
          </View>
        </View>

        <View style={styles.buttonsRow}>
          <TouchableOpacity style={[styles.button, styles.addToCartButton]} onPress={handleAddToCart}>
            <LinearGradient colors={['#4CAF50', '#45a049']} style={styles.gradientButton}>
              <Text style={styles.buttonText}>Add to Cart</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.negotiateButton]} onPress={handleNegotiate}>
            <LinearGradient colors={['#3498db', '#2980b9']} style={styles.gradientButton}>
              <Text style={styles.buttonText}>Negotiate</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  imageContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  contentContainer: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  quantity: {
    fontSize: 16,
    color: "#666",
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    color: "#555",
    lineHeight: 24,
  },
  sellerContainer: {
    marginBottom: 20,
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    marginRight: 10,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  sellerLocation: {
    fontSize: 14,
    color: "#666",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingValue: {
    fontSize: 16,
    color: "#f39c12",
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  addToCartButton: {
    marginRight: 10,
  },
  negotiateButton: {
    marginLeft: 10,
  },
  gradientButton: {
    paddingVertical: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProductDetail;
