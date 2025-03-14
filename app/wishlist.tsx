import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { Stack } from 'expo-router';

const WishlistScreen = () => {
  return (
    <>
      <Stack.Screen options={{ title: 'Your Wishlist' }} />
      <View style={styles.container}>
        <Text style={styles.text}>Saved Items</Text>
      </View>
    </>
  );
};

export default WishlistScreen;

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
