import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import apiInstance from './api';
import { getUserId } from '../components/getUserId';
import * as ImagePicker from 'expo-image-picker';

const AccountScreen = () => {
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: '',
    about: '',
    country: '',
    city: '',
    state: '',
    address: '',
    p_image: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const userId = await getUserId();
      if (!userId) return;

      const response = await apiInstance.get(`user/profile/${userId}/`);
      setProfileData({
        full_name: response.data?.full_name,
        email: response.data.user.email,
        phone: response.data.user.phone,
        about: response.data.about,
        country: response.data.country,
        city: response.data.city,
        state: response.data.state,
        address: response.data.address,
        p_image: response.data.image,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch profile data');
      console.error('Error fetching profile data:', error);
    }
  };

  const handleInputChange = (name, value) => {
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileData({
        ...profileData,
        p_image: result.assets[0].uri,
      });
    }
  };

  const handleFormSubmit = async () => {
    setLoading(true);
    const userId = await getUserId();
    if (!userId) return;

    const formData = new FormData();
    if (profileData.p_image) {
      const response = await fetch(profileData.p_image);
      const blob = await response.blob();
      formData.append('image', {
        uri: profileData.p_image,
        name: `profile_${userId}.jpg`,
        type: 'image/jpeg',
      } as any);
    }
    formData.append('full_name', profileData.full_name);
    formData.append('about', profileData.about);
    formData.append('country', profileData.country);
    formData.append('city', profileData.city);
    formData.append('state', profileData.state);
    formData.append('address', profileData.address);
    formData.append('email', profileData.email);
    formData.append('phone', profileData.phone);

    try {
      await apiInstance.patch(`user/profile/${userId}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Your Account' }} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Account Information</Text>

        <TouchableOpacity onPress={handlePickImage}>
          <Image source={{ uri: profileData.p_image || 'https://via.placeholder.com/100' }} style={styles.profileImage} />
          <Text style={styles.uploadText}>Change Profile Picture</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={profileData.full_name}
          onChangeText={(text) => handleInputChange('full_name', text)}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={profileData.email}
          onChangeText={(text) => handleInputChange('email', text)}
        />

        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          value={profileData.phone}
          onChangeText={(text) => handleInputChange('phone', text)}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>About</Text>
        <TextInput
          style={styles.input}
          value={profileData.about}
          onChangeText={(text) => handleInputChange('about', text)}
        />

        <Text style={styles.label}>Address</Text>
        <TextInput
          style={styles.input}
          value={profileData.address}
          onChangeText={(text) => handleInputChange('address', text)}
        />

        <Text style={styles.label}>City</Text>
        <TextInput
          style={styles.input}
          value={profileData.city}
          onChangeText={(text) => handleInputChange('city', text)}
        />

        <Text style={styles.label}>State</Text>
        <TextInput
          style={styles.input}
          value={profileData.state}
          onChangeText={(text) => handleInputChange('state', text)}
        />

        <Text style={styles.label}>Country</Text>
        <TextInput
          style={styles.input}
          value={profileData.country}
          onChangeText={(text) => handleInputChange('country', text)}
        />

        <TouchableOpacity style={styles.updateButton} onPress={handleFormSubmit} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
};

export default AccountScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
  },
  uploadText: {
    fontSize: 14,
    color: 'blue',
    marginTop: 5,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
    marginBottom: 10,
  },
  updateButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});