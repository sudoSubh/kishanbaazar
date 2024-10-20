import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator, Image, SafeAreaView } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import Nav from "../components/Nav";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { app } from '../../firebaseConfig';
import * as ImagePicker from 'expo-image-picker';

const auth = getAuth(app);
const db = getFirestore(app);

export default function Profile({ navigation }: { navigation: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [userType, setUserType] = useState("buyer");
  const [farmName, setFarmName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = auth.currentUser?.uid;
      if (userId) {
        try {
          const userDoc = await getDoc(doc(db, "users", userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setName(userData.name || "");
            setEmail(userData.email || "");
            setLocation(userData.location || "");
            setPhone(userData.phone || "");
            setUserType(userData.userType || "buyer");
            setAadharNumber(userData.aadharNumber || "");
            setFarmName(userData.farmName || "");
            setProfileImage(userData.profileImage || null);
          } else {
            setError("User data not found.");
          }
        } catch (err) {
          setError("Error fetching user data.");
          console.error(err);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleEditPress = async () => {
    if (isEditing) {
      
      if (userType === "seller" && !aadharNumber) {
        Alert.alert("Validation Error", "Aadhar number is required for sellers.");
        return;
      }

      
      const userId = auth.currentUser?.uid;
      if (userId) {
        try {
          await setDoc(doc(db, "users", userId), {
            name,
            email,
            location,
            phone,
            userType,
            aadharNumber: userType === "seller" ? aadharNumber : "",
            farmName: userType === "seller" ? farmName : "",
            profileImage,
          }, { merge: true });
          Alert.alert("Success", "Profile updated successfully!");
        } catch (err) {
          Alert.alert("Error", "Failed to update profile. Please try again.");
          console.error(err);
        }
      }
    }
    setIsEditing(!isEditing);
  };

  const handleLogoutPress = () => {
    auth.signOut()
      .then(() => {
        Alert.alert("Logout", "You have been logged out successfully.");
        navigation.navigate("Login");
      })
      .catch((error) => {
        Alert.alert("Error", "Failed to log out. Please try again.");
        console.error(error);
      });
  };

  const handleDeleteAccount = async () => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      Alert.alert(
        "Delete Account",
        "Are you sure you want to delete your account? This action cannot be undone.",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Delete",
            onPress: async () => {
              try {
                await setDoc(doc(db, "users", userId), { deleted: true }, { merge: true });
                await auth.currentUser?.delete();
                Alert.alert("Account Deleted", "Your account has been deleted.");
                navigation.navigate("Login");
              } catch (err) {
                Alert.alert("Error", "Failed to delete account. Please try again.");
                console.error(err);
              }
            },
            style: "destructive"
          }
        ]
      );
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
            <Ionicons name="settings-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileContainer}>
          <TouchableOpacity onPress={pickImage} style={styles.profileImageContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <MaterialIcons name="person" size={60} color="#fff" />
              </View>
            )}
            <View style={styles.editPhotoButton}>
              <MaterialIcons name="edit" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
          {isEditing ? (
            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
            />
          ) : (
            <Text style={styles.profileName}>{name}</Text>
          )}
          <Text style={styles.userType}>{userType === 'buyer' ? 'Buyer' : 'Seller'}</Text>
        </View>

        <View style={styles.userTypeContainer}>
          <TouchableOpacity
            style={[styles.userTypeButton, userType === "buyer" && styles.selectedUserType]}
            onPress={() => setUserType("buyer")}
          >
            <Text style={styles.userTypeText}>Buyer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.userTypeButton, userType === "seller" && styles.selectedUserType]}
            onPress={() => setUserType("seller")}
          >
            <Text style={styles.userTypeText}>Seller</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.detailsContainer}>
          <DetailItem
            icon="email"
            label="Email"
            value={email}
            isEditing={isEditing}
            onChangeText={setEmail}
          />
          <DetailItem
            icon="location-on"
            label="Location"
            value={location}
            isEditing={isEditing}
            onChangeText={setLocation}
          />
          <DetailItem
            icon="phone"
            label="Phone"
            value={phone}
            isEditing={isEditing}
            onChangeText={setPhone}
          />
          {userType === 'seller' && (
            <>
              <DetailItem
                icon="business"
                label="Farm Name"
                value={farmName}
                isEditing={isEditing}
                onChangeText={setFarmName}
              />
              <DetailItem
                icon="credit-card"
                label="Aadhar Number"
                value={aadharNumber}
                isEditing={isEditing}
                onChangeText={setAadharNumber}
                required={true}
              />
            </>
          )}
        </View>

        <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
          <Text style={styles.editButtonText}>
            {isEditing ? "Save Profile" : "Edit Profile"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogoutPress}>
          <Text style={styles.logoutButtonText}>Log out</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteAccountButton} onPress={handleDeleteAccount}>
          <Text style={styles.deleteAccountButtonText}>Delete Account</Text>
        </TouchableOpacity>
      </ScrollView>
      <Nav navigation={navigation} isLoggedIn={true} />
    </SafeAreaView>
  );
}

const DetailItem = ({ icon, label, value, isEditing, onChangeText, required = false }: { 
  icon: React.ComponentProps<typeof MaterialIcons>['name'], 
  label: string, 
  value: string, 
  isEditing: boolean, 
  onChangeText: (text: string) => void, 
  required?: boolean 
}) => (
  <View style={styles.detailItem}>
    <MaterialIcons name={icon} size={24} color="#555" style={styles.detailIcon} />
    <View style={styles.detailContent}>
      <Text style={styles.detailLabel}>
        {label} {required && <Text style={styles.requiredField}>*</Text>}
      </Text>
      {isEditing ? (
        <TextInput
          style={styles.detailInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      ) : (
        <Text style={styles.detailValue}>{value}</Text>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  profileContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#33c37d',
    borderRadius: 15,
    padding: 5,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  nameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#33c37d',
    paddingBottom: 5,
  },
  userType: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  detailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailIcon: {
    marginRight: 15,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
  },
  detailInput: {
    fontSize: 16,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#33c37d',
    paddingBottom: 2,
  },
  editButton: {
    backgroundColor: '#33c37d',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginHorizontal: 20,
    marginBottom: 15,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginHorizontal: 20,
    marginBottom: 15,
  },
  logoutButtonText: {
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  deleteAccountButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 30,
  },
  deleteAccountButtonText: {
    color: '#ff3b30',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  userTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  userTypeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#33c37d',
    marginHorizontal: 5,
  },
  selectedUserType: {
    backgroundColor: '#33c37d',
  },
  userTypeText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#333',
  },
  requiredField: {
    color: 'red',
  },
});
