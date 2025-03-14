import AsyncStorage from '@react-native-async-storage/async-storage';

const CartID = async () => {
  const generateRandomString = () => {
    const length = 30;
    const characters = "ABDEFGHIJKLMNOPQR";
    let randomString = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }

    return randomString;
  };

  // Check if a cart ID already exists in AsyncStorage
  const existingCartID = await AsyncStorage.getItem("cartID");

  if (!existingCartID) {
    // Generate a new cart ID and store it
    const newCartID = generateRandomString();
    await AsyncStorage.setItem("cartID", newCartID);
    return newCartID;
  } else {
    // Return the existing cart ID
    return existingCartID;
  }
};

export default CartID;