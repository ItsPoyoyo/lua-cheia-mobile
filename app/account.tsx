import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import apiInstance from './Plugins/api';
import { getUserId } from '../components/getUserId';

const AccountScreen = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    image: null,
  });
  const [initialData, setInitialData] = useState({
    email: '',
    phone: '',
    image: null,
  });
  const [errors, setErrors] = useState({ email: null, phone: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const userId = await getUserId();
      const response = await apiInstance.get(`user/profile/${userId}/`);
      
      const data = {
        full_name: response.data.full_name || '',
        email: response.data.user?.email || '',
        phone: response.data.user?.phone || '',
        image: response.data.image || null,
      };

      setFormData(data);
      setInitialData({
        email: response.data.user?.email || '',
        phone: response.data.user?.phone || '',
        image: response.data.image || null,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch profile');
      console.error('Fetch error:', error);
    }
  };

  const handleImagePick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please allow access to your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setFormData(prev => ({
          ...prev,
          image: result.assets[0].uri,
        }));
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };
  const handleSubmit = async () => {
    setLoading(true);
    setErrors({ email: null, phone: null });
  
    const userId = await getUserId();
    
    const userData = {};
    if (formData.email !== initialData.email) userData.email = formData.email;
    if (formData.phone !== initialData.phone) userData.phone = formData.phone;
  
    // Prepare request payload
    const payload = {
      full_name: formData.full_name,
      user: userData,  // Send `user` as an object, NOT a JSON string
    };
  
    if (formData.image && formData.image !== initialData.image && !formData.image.startsWith('http')) {
      const form = new FormData();
      form.append('full_name', formData.full_name);
      form.append('user', JSON.stringify(userData));  // Ensure this is sent as JSON
  
      form.append('image', {
        uri: formData.image,
        name: `profile_${userId}.jpg`,
        type: 'image/jpeg',
      });
  
      try {
        const response = await apiInstance.patch(`user/profile/${userId}/`, form, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
  
        if (response.status === 200) {
          Alert.alert('Success', 'Profile updated successfully');
          fetchProfile();
        }
      } catch (error) {
        console.error('Update error:', error.response?.data);
        handleErrors(error.response?.data);
      }
    } else {
      try {
        const response = await apiInstance.patch(`user/profile/${userId}/`, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        if (response.status === 200) {
          Alert.alert('Success', 'Profile updated successfully');
          fetchProfile();
        }
      } catch (error) {
        console.error('Update error:', error.response?.data);
        handleErrors(error.response?.data);
      }
    }
  
    setLoading(false);
  };
  
  const handleErrors = (data) => {
    if (data?.user) {
      setErrors({
        email: data.user.email?.[0] || data.user.email || null,
        phone: data.user.phone?.[0] || data.user.phone || null,
      });
    } else {
      Alert.alert('Error', data?.message || 'Update failed');
    }
  };
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Account Settings</Text>

      <TouchableOpacity onPress={handleImagePick} style={styles.imageContainer}>
        <Image
          source={{ uri: formData.image || 'https://via.placeholder.com/150' }}
          style={styles.profileImage}
        />
        <Text style={styles.changePhotoText}>Change Photo</Text>
      </TouchableOpacity>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={formData.full_name}
          onChangeText={(text) => setFormData(prev => ({ ...prev, full_name: text }))}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, errors.email && styles.errorInput]}
          value={formData.email}
          onChangeText={(text) => {
            setFormData(prev => ({ ...prev, email: text }));
            if (errors.email) setErrors(prev => ({ ...prev, email: null }));
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={[styles.input, errors.phone && styles.errorInput]}
          value={formData.phone}
          onChangeText={(text) => {
            setFormData(prev => ({ ...prev, phone: text }));
            if (errors.phone) setErrors(prev => ({ ...prev, phone: null }));
          }}
          keyboardType="phone-pad"
        />
        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
container: {
  flexGrow: 1,
  padding: 20,
  backgroundColor: '#fff',
},
heading: {
  fontSize: 24,
  fontWeight: 'bold',
  marginBottom: 20,
  textAlign: 'center',
  color: '#333',
},
imageContainer: {
  alignItems: 'center',
  marginBottom: 20,
},
profileImage: {
  width: 120,
  height: 120,
  borderRadius: 60,
  borderWidth: 2,
  borderColor: '#ddd',
},
changePhotoText: {
  marginTop: 8,
  color: '#007AFF',
  fontSize: 16,
},
formGroup: {
  marginBottom: 15,
  width: '100%',
},
label: {
  fontSize: 16,
  marginBottom: 5,
  color: '#555',
  fontWeight: '500',
},
input: {
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 8,
  padding: 12,
  fontSize: 16,
  backgroundColor: '#f9f9f9',
},
errorInput: {
  borderColor: 'red',
},
errorText: {
  color: 'red',
  fontSize: 14,
  marginTop: 5,
},
button: {
  backgroundColor: '#007AFF',
  padding: 15,
  borderRadius: 8,
  alignItems: 'center',
  marginTop: 20,
},
buttonDisabled: {
  opacity: 0.7,
},
buttonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
},
});

export default AccountScreen;