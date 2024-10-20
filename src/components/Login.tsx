import React, { useState } from "react";
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"; 
import { auth } from '../../firebaseConfig'; 

const { width } = Dimensions.get("window");

export default function Login({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const isEmail = (input: string) => {
    // Simple email validation pattern
    const emailPattern = /\S+@\S+\.\S+/;
    return emailPattern.test(input);
  };

  const handleLogin = async () => {
    if (isEmail(email) && password) {
      try {
        // Email login
        await signInWithEmailAndPassword(auth, email, password);
        navigation.navigate("Home");
      } catch (err) {
        setError("Failed to log in. Please check your credentials.");
      }
    } else {
      setError("Please enter a valid email and password.");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, styles.shadow]}
        placeholder="Email Address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#888"
      />

      <TextInput
        style={[styles.input, styles.shadow]}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholderTextColor="#888"
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={[styles.loginButton, styles.shadow]} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 19,
    backgroundColor: "#f9f9f9",
    borderRadius: 15,
  },
  input: {
    height: 50,
    borderColor: "#00796b",
    borderWidth: 1,
    borderRadius: 12,
    paddingLeft: 15,
    marginBottom: 15,
    backgroundColor: "#fff",
    fontSize: 16,
    width: width * 0.8,
    maxWidth: 400,
  },
  loginButton: {
    backgroundColor: "#00796b",
    padding: 15,
    borderRadius: 12,
    width: width * 0.8,
    maxWidth: 400,
    marginTop: 10,
  },
  loginButtonText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  errorText: {
    color: "#d32f2f",
    marginBottom: 12,
    textAlign: "center",
  },
  shadow: {
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});
