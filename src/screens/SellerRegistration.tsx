import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { db, auth } from '../../firebaseConfig';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';

const SellerRegistration: React.FC = () => {
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [taxId, setTaxId] = useState('');
  const [productDescription, setProductDescription] = useState('');

  const handleSubmit = async () => {
    if (!businessName || !businessAddress || !taxId || !productDescription) {
      Alert.alert('Error', 'Please fill out all fields');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'You must be logged in to apply');
        return;
      }

      await addDoc(collection(db, 'sellerApplications'), {
        userId: user.uid,
        businessName,
        businessAddress,
        taxId,
        productDescription,
        status: 'pending',
        createdAt: new Date()
      });

      Alert.alert('Success', 'Your application has been submitted for review');
      // Reset form or navigate
    } catch (error) {
      console.error('Error submitting application:', error);
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Seller Registration</Text>
      <TextInput
        style={styles.input}
        placeholder="Business Name"
        value={businessName}
        onChangeText={setBusinessName}
      />
      <TextInput
        style={styles.input}
        placeholder="Business Address"
        value={businessAddress}
        onChangeText={setBusinessAddress}
      />
      <TextInput
        style={styles.input}
        placeholder="Tax ID"
        value={taxId}
        onChangeText={setTaxId}
      />
      <TextInput
        style={[styles.input, styles.multilineInput]}
        placeholder="Description of products you intend to sell"
        value={productDescription}
        onChangeText={setProductDescription}
        multiline
      />
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Application</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
  },
  input: {
    height: 50,
    borderColor: '#bdc3c7',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default SellerRegistration;

