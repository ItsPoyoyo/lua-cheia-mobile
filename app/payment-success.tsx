import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const PaymentSuccessScreen = () => {
  const router = useRouter();
  const { order_oid } = useLocalSearchParams();

  useEffect(() => {
    // You can add any post-payment logic here
    // For example, clear the cart, send confirmation email, etc.
  }, []);

  const handleContinueShopping = () => {
    router.replace('/(tabs)/');
  };

  const handleViewOrders = () => {
    router.push('/orders');
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Payment Successful',
          headerBackVisible: false,
          gestureEnabled: false
        }} 
      />
      
      <View style={styles.container}>
        <Animated.View 
          style={styles.successContainer}
          entering={FadeInUp.delay(300).duration(800)}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-circle" size={80} color={Colors.green} />
          </View>
          
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successMessage}>
            Thank you for your purchase. Your order has been confirmed.
          </Text>
          
          {order_oid && (
            <Text style={styles.orderInfo}>
              Order ID: {order_oid}
            </Text>
          )}
        </Animated.View>

        <Animated.View 
          style={styles.buttonContainer}
          entering={FadeInDown.delay(600).duration(800)}
        >
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]} 
            onPress={handleContinueShopping}
          >
            <Ionicons name="storefront-outline" size={20} color={Colors.white} />
            <Text style={styles.primaryButtonText}>Continue Shopping</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={handleViewOrders}
          >
            <Ionicons name="receipt-outline" size={20} color={Colors.primary} />
            <Text style={styles.secondaryButtonText}>View Orders</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  iconContainer: {
    marginBottom: 30,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.darkText,
    marginBottom: 15,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  orderInfo: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    backgroundColor: Colors.lightGray,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 10,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentSuccessScreen;

