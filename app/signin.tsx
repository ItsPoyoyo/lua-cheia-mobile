import React, { useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { Link, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import InputField from '@/components/InputField';
import SocialLoginButtons from '@/components/SocialLoginButtons';
import apiInstance from './Plugins/api'; // Adjust the import path to your apiInstance
import * as SecureStore from 'expo-secure-store';

const SignInScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
  
    setIsLoading(true);
  
    try {
      // Make a POST request to the login endpoint
      const response = await apiInstance.post('user/token/', {
        email,
        password,
      });
  
      console.log('Login response:', response); // Log the response
  
      // Store tokens securely
      await SecureStore.setItemAsync('access_token', response.data.access);
      await SecureStore.setItemAsync('refresh_token', response.data.refresh);
  
      // Navigate to the home screen
      router.replace('/(tabs)'); // Replace with your home screen route
    } catch (error) {
      console.log('Login error:', error); // Log the full error object
      Alert.alert('Error', error.response?.data?.detail || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: 'Sign In',
          headerLeft: () =>
            Platform.OS === 'ios' ? (
              <TouchableOpacity onPress={() => router.back()} style={{ padding: 10 }}>
                <Ionicons name="arrow-back" size={24} color={Colors.black} />
              </TouchableOpacity>
            ) : null,
        }}
      />

      {/* Wrap the content in KeyboardAvoidingView and ScrollView */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Login to your account</Text>

          {/* Email Field */}
          <InputField
            placeholder="Email Address"
            placeholderTextColor={Colors.gray}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          {/* Password Field */}
          <InputField
            placeholder="Password"
            placeholderTextColor={Colors.gray}
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />

          {/* Login Button */}
          <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={isLoading}>
            <Text style={styles.btnTxt}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>

          {/* Don't have an account? Sign Up */}
          <Text style={styles.loginTxt}>
            Don't have an account?{' '}
            <Link href={'/signup'} asChild>
              <Text style={styles.loginTxtSpan}>Sign Up</Text>
            </Link>
          </Text>

          {/* Forgot Password */}
          <Text style={styles.loginTxt}>
            <Link href={'/forgot-password'} asChild>
              <Text style={[styles.loginTxtSpan, { color: Colors.danger }]}>
                Forgot Password?
              </Text>
            </Link>
          </Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Social Login Buttons */}
          <SocialLoginButtons emailHref="/signin" />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default SignInScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    letterSpacing: 1.2,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 50,
  },
  btn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignSelf: 'stretch',
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 10,
  },
  btnTxt: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  loginTxt: {
    marginBottom: 30,
    fontSize: 14,
    color: Colors.black,
    lineHeight: 24,
  },
  loginTxtSpan: {
    color: Colors.primary,
    fontWeight: '600',
  },
  divider: {
    borderTopColor: Colors.gray,
    borderTopWidth: StyleSheet.hairlineWidth,
    width: '30%',
    marginBottom: 30,
  },
});