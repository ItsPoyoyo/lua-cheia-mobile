import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { Stack } from 'expo-router';

const NotificationsScreen = () => {
  return (
    <>
      <Stack.Screen options={{ title: 'Notifications' }} />
      <View style={styles.container}>
        <Text style={styles.text}>Your Notifications</Text>
      </View>
    </>
  );
};

export default NotificationsScreen;

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
