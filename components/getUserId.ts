import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from "jwt-decode";

export const getUserId = async () => {
  try {
    const accessToken = await SecureStore.getItemAsync('access_token');

    if (accessToken) {
      const decodedToken = jwtDecode(accessToken) as { user_id?: number }; // Adjust the type based on your token structure
      return decodedToken.user_id; // Return the user ID from the decoded token
    }

    return null; // Return null if no token is found
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};