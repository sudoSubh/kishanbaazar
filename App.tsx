import "react-native-gesture-handler";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, Image, StatusBar } from "react-native";
import {
  NavigationContainer,
  DefaultTheme,
  Theme,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

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
import AddProduct from "./src/screens/AddProduct"; 
import Settings from './src/screens/Settings'; 
import PurchaseHistory from "./src/screens/PurchaseHistory";

import Language from "./src/screens/Language";
import ChatScreen from './src/screens/Chat';
import PaymentHistory from "./src/screens/PaymentHistory";
import { CartProvider } from './src/CartContext';

const Stack = createStackNavigator();


type Product = {
  id: string;
  name: string;
  price: number;
 
};

export default function App() {
  const MyTheme: Theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: "#ffffff",
    },
  };

  const [newlyAddedProducts, setNewlyAddedProducts] = useState<Product[]>([]);

  const handleAddProduct = (product: Product) => {
    
    console.log('Product added:', product);
    setNewlyAddedProducts(prevProducts => [...prevProducts, product]);
  };

  return (
    <CartProvider>
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
            component={ChatScreen as React.ComponentType<any>}
            options={{ title: "Chat" }}
          />

          {/* Other Screens */}
          <Stack.Screen name="Products" options={{ title: "Products" }}>
            {(props) => <Products {...props} />}
          </Stack.Screen>
          <Stack.Screen name="ProductDetail" component={ProductDetail} options={{ title: "Product Detail" }} />
          <Stack.Screen name="Cart" component={Cart} options={{ title: "Cart" }} />
          <Stack.Screen name="Payment" component={Payment} options={{ title: "Payment" }} />
          <Stack.Screen name="Contact" component={Contact} />

          {/* Add Product Screen */}
          <Stack.Screen
            name="AddProduct"
            options={{ title: "Add Product" }}
          >
            {(props) => <AddProduct onAddProduct={(product) => {}} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
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
