import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { Stack } from 'expo-router';

const OrdersScreen = () => {
  return (
    <>
      <Stack.Screen options={{ title: 'Your Orders' }} />
      <View style={styles.container}>
        <Text style={styles.text}>Order History</Text>
      </View>
    </>
  );
};

export default OrdersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
