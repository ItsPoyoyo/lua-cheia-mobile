import { StyleSheet, Image, Text, FlatList, View, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import apiInstance from '../api';
import { CartItemType } from '@/types/type';
import { Stack } from 'expo-router';
import { useHeaderHeight } from '@react-navigation/elements';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { getUserId } from '../../components/getUserId'; // Utility to get user ID from token
import CartID from '../CartID'; // Utility to get cart ID

type Props = {};

const CartScreen = (props: Props) => {
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [cartTotal, setCartTotal] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [cartId, setCartId] = useState<string | null>(null); // State for cart ID
  const headerHeight = useHeaderHeight();

  useEffect(() => {
    getCartData();
  }, []);

  const getCartData = async () => {
    try {
      const userId = await getUserId(); // Dynamically fetch the user ID
      const cartId = await CartID(); // Get or generate the cart ID

      if (cartId) {
        setCartId(cartId);

        // Fetch cart items
        const cartResponse = await apiInstance.get(
          userId ? `cart-list/${cartId}/${userId}/` : `cart-list/${cartId}/`
        );
        console.log('Cart Response:', cartResponse.data); // Log the response
        setCart(cartResponse.data);

        // Fetch cart totals
        const cartTotalResponse = await apiInstance.get(
          userId ? `cart-detail/${cartId}/${userId}/` : `cart-detail/${cartId}/`
        );
        console.log('Cart Total Response:', cartTotalResponse.data); // Log the response
        setCartTotal(cartTotalResponse.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch cart data');
      console.error('Error fetching cart data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCart = async (productId: number, qty: number, price: number, color: string, size: string) => {
    try {
      const userId = await getUserId();
  
      if (!cartId) {
        Alert.alert('Error', 'Cart ID not found');
        return;
      }
  
      // Check if the item already exists in the cart with the same color and size
      const existingItem = cart.find(
        (item) => item.product.id === productId && item.color === color && item.size === size
      );
  
      const formData = new FormData();
      formData.append('product_id', productId);
      formData.append('user_id', userId || 0);
      formData.append('qty', qty);
      formData.append('price', price);
      formData.append('color', color);
      formData.append('size', size);
      formData.append('cart_id', cartId);
  
      if (existingItem) {
        // Update existing item
        formData.append('item_id', existingItem.id);
      }
  
      await apiInstance.post('cart-view/', formData);
      getCartData(); // Refresh cart data
  
    } catch (error) {
      Alert.alert('Error', 'Failed to update cart');
      console.error('Error updating cart:', error);
    }
  };

  const handleDeleteCartItem = async (itemId: number) => {
    try {
      const userId = await getUserId();

      if (!cartId) {
        Alert.alert('Error', 'Cart ID not found');
        return;
      }

      const url = userId
        ? `cart-delete/${cartId}/${itemId}/${userId}/`
        : `cart-delete/${cartId}/${itemId}/`;

      await apiInstance.delete(url);
      getCartData(); // Refresh cart data
    } catch (error) {
      Alert.alert('Error', 'Failed to delete item');
      console.error('Error deleting item:', error);
    }
  };

  const handleCheckout = async () => {
    // Implement checkout logic here
    Alert.alert('Success', 'Checkout functionality will be implemented here');
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: true, headerTransparent: true }} />
      <View style={[styles.container, { marginTop: headerHeight }]}>
        {isLoading ? (
          <Text>Loading...</Text>
        ) : cart.length > 0 ? (
          <FlatList
            data={cart}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeInDown.delay(300 + index * 100).duration(500)}>
                <CartItem
                  item={item}
                  onUpdateCart={updateCart}
                  onDeleteItem={handleDeleteCartItem}
                />
              </Animated.View>
            )}
          />
        ) : (
          <Text>Your cart is empty</Text>
        )}
      </View>
      {cart.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.priceInforWrapper}>
            <Text style={styles.totalText}>
              Total: ${cartTotal.total}
            </Text>
          </View>
          <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
            <Text style={styles.checkoutBtnText}>Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};

const CartItem = ({
  item,
  onUpdateCart,
  onDeleteItem,
}: {
  item: CartItemType;
  onUpdateCart: (productId: number, qty: number, price: number, color: string, size: string) => void;
  onDeleteItem: (itemId: number) => void;
}) => {
  const [quantity, setQuantity] = useState(item.qty);

  const handleQuantityChange = (newQty: number) => {
    if (newQty > 0 && newQty <= item.product.max_cart_limit) {
      setQuantity(newQty);
      onUpdateCart(item.product.id, newQty, item.product.price, item.color, item.size);
    }
  };

  return (
    <View style={styles.itemWrapper}>
      <Image source={{ uri: item.product.image }} style={styles.itemImg} />
      <View style={styles.itemInfoWrapper}>
        <Text style={styles.itemText}>{item.product.title}</Text>
        <Text style={styles.itemText}>
          ${item.price ? item.price : '0.00'} {/* Safely format the price */}
        </Text>
        <Text style={styles.itemText}>Size: {item.size}</Text>
        <Text style={styles.itemText}>Color: {item.color}</Text> {/* Use color field directly */}

        <View style={styles.itemControlWrapper}>
          <TouchableOpacity onPress={() => onDeleteItem(item.id)}>
            <Ionicons name="trash-outline" size={20} color={'red'} />
          </TouchableOpacity>

          <View style={styles.quantityControlWrapper}>
            <TouchableOpacity
              style={styles.quantityControl}
              onPress={() => handleQuantityChange(quantity - 1)}
            >
              <Ionicons name="remove-outline" size={20} color={Colors.black} />
            </TouchableOpacity>
            <Text>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityControl}
              onPress={() => handleQuantityChange(quantity + 1)}
            >
              <Ionicons name="add-outline" size={20} color={Colors.black} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity>
            <Ionicons name="heart-outline" size={20} color={Colors.black} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  itemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.lightGray,
    borderRadius: 5,
  },
  itemImg: {
    width: 100,
    height: 100,
    borderRadius: 5,
    marginRight: 10,
  },
  itemInfoWrapper: {
    flex: 1,
    alignSelf: 'flex-start',
    gap: 10,
  },
  itemText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.black,
  },
  itemControlWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityControlWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  quantityControl: {
    padding: 5,
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: Colors.white,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopColor: Colors.white,
  },
  priceInforWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  totalText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.black,
  },
  checkoutBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  checkoutBtnText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.white,
  },
});