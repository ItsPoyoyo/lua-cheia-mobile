import React, { useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { Link, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import InputField from '@/components/InputField';
import SocialLoginButtons from '@/components/SocialLoginButtons';
import apiInstance from './api';

const SignUpScreen = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      const response = await apiInstance.post('user/register/', {
        full_name: fullName,
        email,
        phone,
        password,
        password2: confirmPassword,
      });

      if (response.data) {
        Alert.alert('Success', 'Registration successful');
        router.push('/signin');
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: 'Sign Up',
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
          keyboardShouldPersistTaps="handled" // Ensures taps outside the keyboard dismiss it
        >
          <Text style={styles.title}>Create an account</Text>

          {/* Full Name Field */}
          <InputField
            placeholder="Full Name"
            placeholderTextColor={Colors.gray}
            autoCapitalize="words"
            value={fullName}
            onChangeText={setFullName}
          />

          {/* Email Field */}
          <InputField
            placeholder="Email Address"
            placeholderTextColor={Colors.gray}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          {/* Phone Number Field */}
          <InputField
            placeholder="Phone Number"
            placeholderTextColor={Colors.gray}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          {/* Password Field */}
          <InputField
            placeholder="Password"
            placeholderTextColor={Colors.gray}
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />

          {/* Confirm Password Field */}
          <InputField
            placeholder="Confirm Password"
            placeholderTextColor={Colors.gray}
            secureTextEntry={true}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          {/* Sign Up Button */}
          <TouchableOpacity style={styles.btn} onPress={handleSignUp}>
            <Text style={styles.btnTxt}>Create an Account</Text>
          </TouchableOpacity>

          {/* Already have an account? Sign In */}
          <Text style={styles.loginTxt}>
            Already have an account?{' '}
            <Link href={'/signin'} asChild>
              <Text style={styles.loginTxtSpan}>Sign In</Text>
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

export default SignUpScreen;

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