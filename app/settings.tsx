import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import apiInstance from './Plugins/api';
import { getUserId } from '../components/getUserId';
import * as ImagePicker from 'expo-image-picker';

const SettingsScreen = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const userId = await getUserId();
      if (!userId) return;

      const response = await apiInstance.get(`user/profile/${userId}/`);
      setProfile(response.data);
      setFullName(response.data.full_name);
      setEmail(response.data.user.email);
      setPhone(response.data.user.phone);
      setAddress(response.data.address);
      setCity(response.data.city);
      setState(response.data.state);
      setCountry(response.data.country);
      setProfileImage(response.data.image);
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile');
      console.error('Profile fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const userId = await getUserId();
      if (!userId) return;

      const formData = new FormData();
      formData.append('full_name', fullName);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('address', address);
      formData.append('city', city);
      formData.append('state', state);
      formData.append('country', country);

      if (profileImage) {
        const response = await fetch(profileImage);
        const blob = await response.blob();
        formData.append('image', {
          uri: profileImage,
          name: `profile_${userId}.jpg`,
          type: 'image/jpeg',
        } as any);
      }

      const updateResponse = await apiInstance.patch(`user/profile/${userId}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('Update Response:', updateResponse.data);
      Alert.alert('Success', 'Profile updated successfully');
      fetchProfile(); // Refresh profile after update
    } catch (error) {
      console.error('Full Error:', error);
      if (error.response) {
        console.error('Error Response Data:', error.response.data);
        console.error('Error Status:', error.response.status);
        console.error('Error Headers:', error.response.headers);
      } else if (error.request) {
        console.error('Error Request:', error.request);
      } else {
        console.error('Error Message:', error.message);
      }
      Alert.alert('Error', 'Failed to update profile. Please check your network connection and try again.');
    }
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Settings' }} />
      <View style={styles.container}>
        <Text style={styles.heading}>Account Settings</Text>

        <TouchableOpacity onPress={handlePickImage}>
          <Image source={{ uri: profileImage || 'https://via.placeholder.com/100' }} style={styles.profileImage} />
          <Text style={styles.uploadText}>Change Profile Picture</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} />

        <Text style={styles.label}>Phone</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} />

        <Text style={styles.label}>Address</Text>
        <TextInput style={styles.input} value={address} onChangeText={setAddress} />

        <Text style={styles.label}>City</Text>
        <TextInput style={styles.input} value={city} onChangeText={setCity} />

        <Text style={styles.label}>State</Text>
        <TextInput style={styles.input} value={state} onChangeText={setState} />

        <Text style={styles.label}>Country</Text>
        <TextInput style={styles.input} value={country} onChangeText={setCountry} />

        <TouchableOpacity style={styles.updateButton} onPress={handleUpdateProfile}>
          <Text style={styles.buttonText}>Update Profile</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
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