import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, Alert, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { db, storage } from '../../firebaseConfig';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const AddProduct: React.FC<{ onAddProduct: (product: any) => void }> = ({ onAddProduct }) => {
  const [category, setCategory] = useState<string>('');
  const [productName, setProductName] = useState<string>('');
  const [productPrice, setProductPrice] = useState<string>('');
  const [priceUnit, setPriceUnit] = useState<string>('/kg');
  const [productQuantity, setProductQuantity] = useState<string>('');
  const [productDescription, setProductDescription] = useState<string>('');
  const [productLocation, setProductLocation] = useState<string>('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const querySnapshot = await getDocs(collection(db, "products"));
    const loadedProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProducts(loadedProducts);
  };

  const handleAddProduct = async () => {
    if (!productName.trim() || !productPrice.trim() || !productQuantity.trim() || !productLocation.trim() || !imageUri) {
      Alert.alert('Error', 'Please fill out all fields and add an image');
      return;
    }

    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const imageName = `products/${Date.now()}_${productName}`;
      const imageRef = ref(storage, imageName);
      await uploadBytes(imageRef, blob);
      const downloadURL = await getDownloadURL(imageRef);

      const newProduct = {
        name: productName,
        price: parseFloat(productPrice),
        priceUnit,
        quantity: parseInt(productQuantity),
        description: productDescription,
        location: productLocation,
        image: downloadURL,
        category,
        expiryDate: expiryDate.toISOString(),
        postedOn: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "products"), newProduct);
      
      const productWithId = { ...newProduct, id: docRef.id };
      setProducts((prevProducts) => [...prevProducts, productWithId]);
      onAddProduct(productWithId);

      Alert.alert('Success', `${productName} has been added.`);

      // Clear input fields
      setCategory('');
      setProductName('');
      setProductPrice('');
      setPriceUnit('/kg');
      setProductQuantity('');
      setProductDescription('');
      setProductLocation('');
      setImageUri(null);
      setExpiryDate(new Date());
    } catch (error) {
      console.error("Error adding product: ", error);
      Alert.alert('Error', 'Failed to add product. Please try again.');
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleRemoveProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, "products", id));
      setProducts((prevProducts) => prevProducts.filter(product => product.id !== id));
      Alert.alert('Success', 'Product removed.');
    } catch (error) {
      console.error("Error removing product: ", error);
      Alert.alert('Error', 'Failed to remove product. Please try again.');
    }
  };

  const renderProduct = ({ item }: { item: any }) => (
    <View style={styles.productCard}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productDetails}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>₹{item.price}{item.priceUnit}</Text>
        <Text style={styles.productQuantity}>Qty: {item.quantity}</Text>
        <Text style={styles.productCategory}>Category: {item.category}</Text>
        <Text style={styles.productDescription} numberOfLines={2}>{item.description}</Text>
        <Text style={styles.productLocation}>{item.location}</Text>
      </View>
      <TouchableOpacity onPress={() => handleRemoveProduct(item.id)} style={styles.removeButton}>
        <Ionicons name="trash-outline" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.formContainer}>
        <Picker
          selectedValue={category}
          onValueChange={(itemValue) => setCategory(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select Category" value="" />
          <Picker.Item label="Fruit" value="fruit" />
          <Picker.Item label="Vegetable" value="vegetable" />
          <Picker.Item label="Grains" value="grains" />
          <Picker.Item label="Dairy" value="dairy" />
        </Picker>

        <TextInput
          style={styles.input}
          placeholder="Product Name"
          value={productName}
          onChangeText={setProductName}
        />

        <View style={styles.priceContainer}>
          <TextInput
            style={[styles.input, styles.priceInput]}
            placeholder="Price"
            value={productPrice}
            onChangeText={setProductPrice}
            keyboardType="numeric"
          />
          <Picker
            selectedValue={priceUnit}
            onValueChange={(itemValue) => setPriceUnit(itemValue)}
            style={styles.unitPicker}
          >
            <Picker.Item label="/kg" value="/kg" />
            <Picker.Item label="/litre" value="/litre" />
            <Picker.Item label="/dozen" value="/dozen" />
          </Picker>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Quantity"
          value={productQuantity}
          onChangeText={setProductQuantity}
          keyboardType="numeric"
        />

        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="Description"
          value={productDescription}
          onChangeText={setProductDescription}
          multiline
          numberOfLines={4}
        />

        <TextInput
          style={styles.input}
          placeholder="Location"
          value={productLocation}
          onChangeText={setProductLocation}
        />

        <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dateButtonText}>Set Expiry Date: {expiryDate.toDateString()}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={expiryDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setExpiryDate(selectedDate);
            }}
          />
        )}

        <TouchableOpacity style={styles.addPictureButton} onPress={pickImage}>
          <MaterialIcons name="add-a-photo" size={24} color="white" />
          <Text style={styles.addPictureText}>Add Picture</Text>
        </TouchableOpacity>

        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.image} />
        )}

        <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
          <Text style={styles.addButtonText}>Add Product</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.productListHeader}>
        <Text style={styles.sectionHeader}>Your Products</Text>
        <TouchableOpacity onPress={() => setShowFilterModal(true)}>
          <FontAwesome5 name="filter" size={24} color="#00b894" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={products.filter(product => !filterCategory || product.category === filterCategory)}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.productList}
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Picker
              selectedValue={filterCategory}
              onValueChange={(itemValue) => setFilterCategory(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="All Categories" value="" />
              <Picker.Item label="Fruit" value="fruit" />
              <Picker.Item label="Vegetable" value="vegetable" />
              <Picker.Item label="Grains" value="grains" />
              <Picker.Item label="Dairy" value="dairy" />
            </Picker>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowFilterModal(false)}>
              <Text style={styles.closeButtonText}>Apply Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f0f3f5',
    paddingTop: 20,
  },
  formContainer: {
    padding: 20,
  },
  input: {
    height: 50,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    elevation: 2,
    fontSize: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  priceInput: {
    flex: 1,
    marginRight: 10,
  },
  unitPicker: {
    flex: 1,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderColor: '#e0e0e0',
    borderWidth: 1,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
    alignSelf: 'center',
  },
  addPictureButton: {
    flexDirection: 'row',
    backgroundColor: '#fd9644',
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
  },
  addPictureText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
    marginLeft: 10,
  },
  addButton: {
    backgroundColor: '#00b894',
    paddingVertical: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
    elevation: 3,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  productList: {
    padding: 20,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 5,
    position: 'relative',
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 15,
  },
  productDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  productPrice: {
    fontSize: 16,
    color: '#00b894',
    marginTop: 5,
  },
  productQuantity: {
    fontSize: 14,
    color: '#636e72',
    marginTop: 3,
  },
  productCategory: {
    fontSize: 14,
    color: '#636e72',
    marginTop: 3,
  },
  productDescription: {
    fontSize: 14,
    color: '#636e72',
    marginTop: 3,
  },
  productLocation: {
    fontSize: 14,
    color: '#636e72',
    marginTop: 3,
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ff7675',
    borderRadius: 20,
    padding: 8,
    elevation: 4,
  },
  dateButton: {
    backgroundColor: '#81ecec',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#2d3436',
    textAlign: 'center',
  },
  productListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 10,
  },
  picker: {
    height: 50,
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderColor: '#e0e0e0',
    borderWidth: 1,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    width: '80%',
  },
  closeButton: {
    backgroundColor: '#00b894',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AddProduct;
