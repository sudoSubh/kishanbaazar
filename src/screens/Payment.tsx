import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { Ionicons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';

const PaymentScreen = () => {
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [upi, setUPI] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePayment = () => {
    if (paymentMethod === "card") {
      if (!validateCardDetails()) return;
    } else if (paymentMethod === "upi") {
      if (!upi) {
        setError("UPI ID is required.");
        return;
      }
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert("Payment Successful", "Your payment has been processed.");
    }, 2000);
  };

  const validateCardDetails = () => {
    if (cardNumber.length < 16) {
      setError("Card number must be 16 digits.");
      return false;
    }
    if (!expiryDate.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
      setError("Expiry date must be in MM/YY format.");
      return false;
    }
    if (cvv.length < 3) {
      setError("CVV must be 3 digits.");
      return false;
    }
    setError("");
    return true;
  };

  const renderPaymentMethod = (method: React.SetStateAction<string>, icon: string | number | boolean | React.JSX.Element | Iterable<React.ReactNode> | null | undefined, text: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined) => (
    <TouchableOpacity
      style={[styles.paymentMethodButton, paymentMethod === method && styles.selectedMethod]}
      onPress={() => setPaymentMethod(method)}
    >
      {icon}
      <Text style={styles.methodText}>{text}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select a payment method</Text>
        <Image
          source={{ uri: 'https://example.com/secure-payment-icon.png' }}
          style={styles.secureIcon}
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.paymentMethodContainer}>
        {renderPaymentMethod("card", <FontAwesome name="credit-card" size={24} color="#232F3E" />, "Credit/Debit Card")}
        {renderPaymentMethod("upi", <MaterialCommunityIcons name="bank-transfer" size={24} color="#232F3E" />, "UPI")}
        {renderPaymentMethod("netbanking", <MaterialCommunityIcons name="bank" size={24} color="#232F3E" />, "Net Banking")}
      </View>

      <View style={styles.form}>
        {paymentMethod === "card" && (
          <>
            <Text style={styles.inputLabel}>Card Number</Text>
            <TextInput
              style={styles.input}
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChangeText={setCardNumber}
              keyboardType="numeric"
              maxLength={16}
            />
            <View style={styles.row}>
              <View style={styles.halfInputContainer}>
                <Text style={styles.inputLabel}>Expiry Date</Text>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChangeText={setExpiryDate}
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
              <View style={styles.halfInputContainer}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="123"
                  value={cvv}
                  onChangeText={setCvv}
                  secureTextEntry={true}
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>
            </View>
          </>
        )}

        {paymentMethod === "upi" && (
          <>
            <Text style={styles.inputLabel}>UPI ID</Text>
            <TextInput
              style={styles.input}
              placeholder="yourname@upi"
              value={upi}
              onChangeText={setUPI}
            />
          </>
        )}

        {paymentMethod === "netbanking" && (
          <Text style={styles.netbankingText}>Choose your bank from the next screen</Text>
        )}

        <TouchableOpacity style={styles.button} onPress={handlePayment} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {paymentMethod === "netbanking" ? "Continue" : "Pay Now"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Image
          source={{ uri: 'https://example.com/payment-partners.png' }}
          style={styles.paymentPartnersImage}
        />
        <Text style={styles.footerText}>
          Your payment is secured by Amazon Pay
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#232F3E",
  },
  secureIcon: {
    width: 30,
    height: 30,
  },
  form: {
    paddingHorizontal: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: "#232F3E",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D5D9D9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#FFD814",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: "#232F3E",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  paymentMethodContainer: {
    flexDirection: "column",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  paymentMethodButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderWidth: 1,
    borderColor: "#D5D9D9",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  selectedMethod: {
    borderColor: "#FF9900",
    backgroundColor: "#FEF8F0",
  },
  methodText: {
    marginLeft: 15,
    fontSize: 16,
    color: "#232F3E",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInputContainer: {
    flex: 0.48,
  },
  halfInput: {
    flex: 1,
  },
  errorText: {
    color: "#B12704",
    marginBottom: 10,
    textAlign: "center",
    fontSize: 14,
  },
  netbankingText: {
    fontSize: 16,
    color: "#232F3E",
    marginBottom: 15,
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
    paddingBottom: 20,
  },
  paymentPartnersImage: {
    width: '90%',
    height: 40,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  footerText: {
    fontSize: 12,
    color: "#565959",
  },
});

export default PaymentScreen;