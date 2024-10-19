import "react-native-gesture-handler";
import React from "react";
import { StyleSheet, TouchableOpacity, Image, StatusBar } from "react-native";
import {
  NavigationContainer,
  DefaultTheme,
  Theme,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

// Import your screens
import Welcome from "./src/screens/Welcome";
import Home from "./src/screens/Home";
import Splash from "./src/screens/Splash";
import ProductDetail from "./src/screens/ProductDetail";
import FarmerProfile from "./src/screens/FarmerProfile";
import Cart from "./src/screens/Cart";
import Payment from "./src/screens/Payment";
import Contact from "./src/screens/Contact";
import Products from "./src/screens/Products";
import Profile from "./src/screens/Profile";
import AddProduct from "./src/screens/AddProduct"; // AddProduct screen
import Settings from './src/screens/Settings'; // Import Settings screen
import PurchaseHistory from "./src/screens/PurchaseHistory";

import Language from "./src/screens/Language";
import ChatScreen from "./src/screens/Chat";
import PaymentHistory from "./src/screens/PaymentHistory";
const Stack = createStackNavigator();

export default function App() {
  const MyTheme: Theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: "#ffffff",
    },
  };

  return (
    <NavigationContainer theme={MyTheme}>
      <StatusBar
        backgroundColor="transparent"
        translucent
        barStyle="dark-content"
      />

      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerStyle: {
            height: 90,
            },
          headerBackground: () => (
            <LinearGradient
              colors={["#2874F0", "#2874F0", "#2874F0"]}
              style={styles.headerGradient}
              start={[0, 0]}
              end={[1, 1]}
              
            />
          ),
          headerTintColor: "#fff",
          headerTitleAlign: "center",
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 20,
          },
        }}
      >
        {/* Splash Screen */}
        <Stack.Screen
          name="Splash"
          component={Splash}
          options={{ headerShown: false }}
        />
         
         

        {/* Welcome Screen */}
        <Stack.Screen
          name="Welcome"
          component={Welcome}
          options={{ headerShown: false }}
        />

        {/* Home Screen */}
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ title: "Home" }}

           
              
            
          
        />

        {/* Profile Screen */}
        <Stack.Screen
          name="Profile"
          component={Profile}
          options={({ navigation }) => ({
            title: "My Profile",
            /** Added the headerRight here to navigate to the Contact screen **/
            headerRight: () => (
              <TouchableOpacity onPress={() => navigation.navigate("Contact")}>
                <MaterialIcons
                  name="support-agent"
                  size={24}
                  color="#fff"
                  style={styles.contact}
                />
              </TouchableOpacity>
            ),
          })}
        />

        {/* Settings Screen */}
        <Stack.Screen
          name="Settings"
          component={Settings}
          options={{ title: "Settings" }}
        />
          {/* History Screen */}
          <Stack.Screen
          name="PurchaseHistory"
          component={PurchaseHistory}
          options={{ title: "PurchaseHistory" }}
        />
         {/* History Screen */}
         <Stack.Screen
          name="PaymentHistory"
          component={PaymentHistory}
          options={{ title: "PaymentHistory" }}
        />
          {/* Language Screen */}
          <Stack.Screen
          name="Language"
          component={Language}
          options={{ title: "Language" }}
        />
          {/* chat Screen */}
          <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{ title: "Chat" }}
        />
        

        {/* Other Screens */}
        <Stack.Screen name="Products" component={Products} />
        <Stack.Screen name="ProductDetail" component={ProductDetail} />
        <Stack.Screen name="Cart" component={Cart} />
        <Stack.Screen name="Payment" component={Payment} />
        <Stack.Screen name="Contact" component={Contact} />

        {/* Add Product Screen */}
        <Stack.Screen
          name="AddProduct"
          component={AddProduct}
          options={({ navigation }) => ({
            title: "Add Product",
            headerRight: () => (
              <TouchableOpacity
                onPress={() => navigation.navigate("AddProduct")}
              >
                <MaterialIcons
                  name="add-circle-outline"
                  size={24}
                  color="#fff"
                  style={styles.contact}
                />
              </TouchableOpacity>
            ),
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  headerGradient: {
    flex: 1,
    
  },
  logo: {
    width: 120,
    height: 40,
  },
  contact: {
    marginRight: 10,
  },
});
