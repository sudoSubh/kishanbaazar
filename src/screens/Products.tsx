import React, { useState, useRef } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  Animated,
  Switch,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import categoriesData from "../data/categoriesData";
import productsData from "../data/productsData";
import Nav from "../components/Nav";
import { LinearGradient } from "expo-linear-gradient";
import { db } from '../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

// Product type definition
type Product = {
  id: number;
  name: string;
  image: any;
  price: number;
  location: string;
  category: string;
  rating: number;
  postedOn: string;
  availability?: 'inStock' | 'outOfStock';
  brand?: string;
};

const typedProductsData = productsData as Product[];

export default function Products({ navigation }: { navigation: any }) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [likedProducts, setLikedProducts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<'lowToHigh' | 'highToLow'>('lowToHigh');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [products, setProducts] = useState<Product[]>([]);
  
  // New filter states
  // const [showDiscountedOnly, setShowDiscountedOnly] = useState(false);
  // const [showNewArrivalsOnly, setShowNewArrivalsOnly] = useState(false);
  // const [showFreeShippingOnly, setShowFreeShippingOnly] = useState(false);
  // const [showTopRatedOnly, setShowTopRatedOnly] = useState(false);
  // const [showLimitedEditionOnly, setShowLimitedEditionOnly] = useState(false);

  // New state for animation
  const scrollY = useRef(new Animated.Value(0)).current;
  const topSectionHeight = 250; // Adjust this value based on your top section's height

  const handleCategoryPress = (category: string) => {
    setSelectedCategory(category);
  };

  const handleLikePress = (id: string) => {
    setLikedProducts((prevLiked) =>
      prevLiked.includes(id)
        ? prevLiked.filter((productId) => productId !== id)
        : [...prevLiked, id]
    );
  };

  const toggleSortOrder = () => {
    setSortOrder(prevOrder => prevOrder === 'lowToHigh' ? 'highToLow' : 'lowToHigh');
  };

  const handleResetFilters = () => {
    setMinPrice(0);
    setMaxPrice(1000);
    setRatingFilter(0);
   
    // setShowDiscountedOnly(false);
    // setShowNewArrivalsOnly(false);
    // setShowFreeShippingOnly(false);
    // setShowTopRatedOnly(false);
    // setShowLimitedEditionOnly(false);
  };

  const filteredProducts = typedProductsData
    .filter((product: Product) => {
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = product.price >= minPrice && product.price <= maxPrice;
      const matchesRating = product.rating >= ratingFilter;
      
      // const matchesDiscounted = !showDiscountedOnly || (product as any).discounted;
      // const matchesNewArrivals = !showNewArrivalsOnly || (product as any).isNewArrival;
      // const matchesFreeShipping = !showFreeShippingOnly || (product as any).freeShipping;
      // const matchesTopRated = !showTopRatedOnly || product.rating >= 4.5;
      // const matchesLimitedEdition = !showLimitedEditionOnly || (product as any).limitedEdition;
      return matchesCategory && matchesSearch && matchesPrice && matchesRating;
    })
    .sort((a, b) => {
      return sortOrder === 'lowToHigh' ? a.price - b.price : b.price - a.price;
    });

  const renderProductItem = ({ item }: { item: any }) => {
    const isLiked = likedProducts.includes(item.id);

    return (
      <TouchableOpacity
        style={styles.productItemContainer}
        onPress={() => navigation.navigate("ProductDetail", { id: item.id })}
      >
        <Image style={styles.productItemImage} source={item.image} />
        <View style={styles.productItemDetails}>
          <View style={styles.productItemHeader}>
            <Text style={styles.productItemName} numberOfLines={1}>
              {item.name}
            </Text>
            <TouchableOpacity onPress={() => handleLikePress(item.id)}>
              <FontAwesome
                name={isLiked ? "heart" : "heart-o"}
                size={24}
                color={isLiked ? "red" : "gray"}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.productItemPrice}>₹{item.price.toFixed(2)}</Text>
          <View style={styles.ratingContainer}>
            {Array.from({ length: 5 }).map((_, index) => (
              <FontAwesome
                key={index}
                name={index < Math.floor(item.rating || 0) ? "star" : "star-o"}
                size={18}
                color="#FFD700"
              />
            ))}
            <Text style={styles.ratingText}>
              {item.rating ? item.rating.toFixed(1) : "N/A"}
            </Text>
          </View>
          <Text style={styles.productLocation}>{item.location}</Text>
          <Text style={styles.productCategory}>{item.category}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const openFilterModal = () => {
    setModalVisible(true);
  };

  const closeFilterModal = () => {
    setModalVisible(false);
  };

  const topSectionTranslateY = scrollY.interpolate({
    inputRange: [0, topSectionHeight],
    outputRange: [0, -topSectionHeight],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[
        styles.topSection,
        {
          transform: [{ translateY: topSectionTranslateY }],
          zIndex: 1,
        }
      ]}>
        {/* Search Box */}
        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={35} color={"gray"} />
          <TextInput 
            style={styles.input} 
            placeholder="Search for Products..." 
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter and Sort Options */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={openFilterModal}
          >
            <MaterialIcons name="filter-list" size={20} color="white" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Filter</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={toggleSortOrder}
          >
            <MaterialIcons name="sort" size={20} color="white" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>
              Sort: {sortOrder === 'lowToHigh' ? 'Low to High' : 'High to Low'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Categories Section */}
        <View style={styles.wrapper}>
          {categoriesData.map((data) => (
            <TouchableOpacity
              key={data.id}
              style={styles.circleWrapper}
              onPress={() => handleCategoryPress(data.name)}
            >
              <LinearGradient
                colors={["#FFDEE9", "#B5FFFC"]}
                style={styles.gradientCircle}
              >
                <Image source={data.image} style={styles.img} />
              </LinearGradient>
              <Text style={styles.textCat}>{data.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Products List */}
      <Animated.FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.productListContainer,
          { paddingTop: topSectionHeight, paddingBottom: 50 } // Add padding to the bottom of the list
        ]}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeFilterModal}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Filter Options</Text>
            
            <Text style={styles.filterLabel}>Price Range</Text>
            <View style={styles.priceRangeContainer}>
              <Text style={styles.priceText}>₹{minPrice}</Text>
              <Text style={styles.priceText}>₹{maxPrice}</Text>
            </View>
            <View style={styles.sliderContainer}>
              <TextInput
                style={styles.priceInput}
                value={minPrice.toString()}
                onChangeText={(text) => setMinPrice(Number(text))}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.priceInput}
                value={maxPrice.toString()}
                onChangeText={(text) => setMaxPrice(Number(text))}
                keyboardType="numeric"
              />
            </View>

            <Text style={styles.filterLabel}>Minimum Rating</Text>
            <View style={styles.sliderContainer}>
              <TextInput
                style={styles.ratingInput}
                value={ratingFilter.toString()}
                onChangeText={(text) => setRatingFilter(Number(text))}
                keyboardType="numeric"
              />
              <Text style={styles.ratingText}> Stars</Text>
            </View>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                onPress={handleResetFilters}
                style={[styles.modalButton, styles.resetButton]}
              >
                <Text style={styles.modalButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={closeFilterModal}
                style={[styles.modalButton, styles.applyButton]}
              >
                <Text style={styles.modalButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Nav navigation={navigation} isLoggedIn={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  topSection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 1,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "90%",
    alignSelf: "center",
    paddingHorizontal: 10,
    marginVertical: 10,
    height: 50,
    backgroundColor: "#FFF",
    borderRadius: 10,
    borderWidth: 4,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    width: "90%",
    height: 40,
    paddingHorizontal: 10,
    fontSize: 15,
    color: "#000",
  },
  wrapper: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    paddingHorizontal: 10,
  },
  circleWrapper: {
    alignItems: "center",
    marginBottom: 20,
    width: "25%",
  },
  gradientCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  img: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  textCat: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginTop: 5,
    textAlign: "center",
  },
  productListContainer: {
    paddingHorizontal: 20,
  },
  productItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#E8E8E8",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: "#696969",
    shadowOffset: {
      width: 4,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 7,
  },
  productItemImage: {
    width: 90,
    height: 90,
    borderRadius: 20,
  },
  productItemDetails: {
    marginLeft: 20,
    flex: 1,
  },
  productItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productItemName: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#333",
    textTransform: "capitalize",
  },
  productItemPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#35C759",
    marginTop: 5,
  },
  productCategory: {
    fontSize: 14,
    color: "#777",
    marginTop: 5,
  },
  productLocation: {
    fontSize: 14,
    color: "#555",
    marginTop: 3,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  ratingText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 5,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
    width: '90%',
    alignSelf: 'center',
  },
  filterButton: {
    backgroundColor: "#2874F0",
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  sortButton: {
    backgroundColor: "#FF9F00",
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 5,
  },
  buttonIcon: {
    marginRight: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#2874F0",
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  priceRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  priceText: {
    fontSize: 14,
    color: "#666",
  },
  sliderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 5,
    width: '45%',
    textAlign: 'center',
  },
  ratingInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 5,
    width: '30%',
    textAlign: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 30,
  },
  modalButton: {
    width: '45%',
    borderRadius: 25,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#2874F0',
  },
  resetButton: {
    backgroundColor: '#95a5a6',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  switchLabel: {
    fontSize: 14,
    color: '#333',
  },
});
