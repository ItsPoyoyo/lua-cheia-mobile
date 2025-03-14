import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useHeaderHeight } from '@react-navigation/elements';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import apiInstance from '../api'; // Adjust the path as needed
import { getUserId } from '@/components/getUserId';

const ProfileScreen = () => {
  const headerHeight = useHeaderHeight();
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = await getUserId(); // Get the user ID from the token
        if (!userId) {
          throw new Error('User ID not found in token');
        }

        console.log('Fetching profile for user ID:', userId); // Debugging

        const response = await apiInstance.get(`user/profile/${userId}/`);
        console.log('API Response:', response.data); // Debugging

        if (response.data) {
          setProfile(response.data);
        } else {
          throw new Error('No profile data returned from the server');
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        Alert.alert('Error', 'Failed to fetch profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle logout
  const handleLogout = () => {
    // Implement logout logic (e.g., clear tokens, redirect to login)
    router.replace('/login'); // Redirect to login screen
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: true, headerTransparent: true }} />
      <View style={[styles.container, { marginTop: headerHeight }]}>
        <View style={{ alignItems: 'center' }}>
          {profile?.image && (
            <Image
              source={{ uri: profile.image }}
              style={{ width: 100, height: 100, borderRadius: 50 }}
            />
          )}
          <Text style={styles.userName}>{profile?.full_name || 'Guest'}</Text>
        </View>

        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/account')} // Navigate to account screen
          >
            <Ionicons name="person-outline" size={20} color={Colors.black} />
            <Text style={styles.buttonText}>Your Account</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/orders')} // Navigate to orders screen
          >
            <Ionicons name="cart-outline" size={20} color={Colors.black} />
            <Text style={styles.buttonText}>Your Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/wishlist')} // Navigate to wishlist screen
          >
            <Ionicons name="heart-outline" size={20} color={Colors.black} />
            <Text style={styles.buttonText}>Your Wishlist</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/notifications')} // Navigate to notifications screen
          >
            <Ionicons name="notifications-outline" size={20} color={Colors.black} />
            <Text style={styles.buttonText}>Notifications</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/settings')} // Navigate to settings screen
          >
            <Ionicons name="settings-outline" size={20} color={Colors.black} />
            <Text style={styles.buttonText}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={Colors.black} />
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: '500',
    color: Colors.black,
    marginTop: 10,
  },
  buttonWrapper: {
    marginTop: 20,
    gap: 10,
  },
  button: {
    padding: 10,
    borderColor: Colors.lightGray,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.black,
  },
});