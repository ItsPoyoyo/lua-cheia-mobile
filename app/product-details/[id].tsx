import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState, useRef } from 'react';
import { View, Platform, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import apiInstance from '../api';
import ImageSlider from '@/components/ImageSlider';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useHeaderHeight } from '@react-navigation/elements';
import Animated, { FadeInDown, SlideInDown } from 'react-native-reanimated';
import { getUserId } from '../../components/getUserId'; // Utility to get user ID from token
import CartID from '../CartID'; // Import the CartID utility

type Props = {};

const ProductDetails = (props: Props) => {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<any>({});
  const [selectedColor, setSelectedColor] = useState<{ code: string; name: string } | null>(null); // Track both color code and name
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [colorGallery, setColorGallery] = useState<any[]>([]); // State for color-specific gallery
  const [cartId, setCartId] = useState<string | null>(null); // State for cart ID
  const imageSliderRef = useRef<any>(null); // Ref to control the ImageSlider

  useEffect(() => {
    getProductDetails();
    fetchCartId(); // Fetch cart ID when the component mounts
  }, []);

  const getProductDetails = async () => {
    const response = await apiInstance.get(`/products/${id}`);
    let productData = response.data;

    // Calculate discount percentage
    if (productData.old_price && productData.price) {
      productData.discount = Math.round(
        ((productData.old_price - productData.price) / productData.old_price) * 100
      );
    } else {
      productData.discount = 0;
    }

    setProduct(productData);
  };

  const fetchCartId = async () => {
    try {
      const cartID = await CartID(); // Get or generate the cart ID
      setCartId(cartID);
    } catch (error) {
      console.error('Error fetching cart ID:', error);
    }
  };

  const handleColorSelection = (colorCode: string, colorName: string, galleries: any[]) => {
    setSelectedColor({ code: colorCode, name: colorName }); // Set the selected color code and name
    setColorGallery(galleries); // Set the color-specific gallery

    // Reset the ImageSlider to the first image
    if (imageSliderRef.current) {
      imageSliderRef.current.resetToFirstImage();
    }
  };

  const handleAddToCart = async () => {
    if (!selectedColor || !selectedSize) {
      Alert.alert('Error', 'Please select a color and size');
      return;
    }
    if (product.stock_qty <= 0) {
      Alert.alert('Error', 'This product is currently out of stock.');
      return;
    }

    try {
      const userId = await getUserId(); // Get the user ID from the token

      const formData = new FormData();
      formData.append('product_id', product.id);
      formData.append('user_id', userId || 0);
      formData.append('qty', 1); // Default quantity is 1
      formData.append('price', product.price);
      formData.append('color', selectedColor.name); // Send the color name instead of the code
      formData.append('size', selectedSize);

      // Append the cart ID if it exists
      if (cartId) {
        formData.append('cart_id', cartId);
      }

      const response = await apiInstance.post('cart-view/', formData);

      // Update the cart ID if it was created by the backend
      if (response.data.cart_id) {
        setCartId(response.data.cart_id);
      }

      Alert.alert('Success', 'Product added to cart');
    } catch (error) {
      Alert.alert('Error', 'Failed to add product to cart');
      console.error('Error adding to cart:', error.response?.data || error.message);
    }
  };

  const headerHeight = useHeaderHeight();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Product Details',
          headerTransparent: true,
          headerLeft: () =>
            Platform.OS === 'ios' ? ( // Show the close button only on iOS
              <TouchableOpacity onPress={() => router.back()} style={{ padding: 10 }}>
                <Ionicons name="arrow-back" size={24} color={Colors.black} />
              </TouchableOpacity>
            ) : null, // Don't show anything on Android

          headerRight: () => (
            <TouchableOpacity>
              <Ionicons name="cart-outline" size={24} color={Colors.black} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={{ marginTop: headerHeight, marginBottom: 90 }}>
        {/* ImageSlider: Show color-specific gallery or default gallery */}
        {product && (
          <Animated.View entering={FadeInDown.delay(300).duration(500)}>
            <ImageSlider
              ref={imageSliderRef} // Pass the ref to ImageSlider
              imageList={
                selectedColor && colorGallery.length > 0
                  ? colorGallery.map((item) => item.image) // Show color-specific gallery
                  : product.gallery
                  ? product.gallery.slice(0, 3).map((item) => item.image) // Show first 3 default gallery images
                  : []
              }
            />
          </Animated.View>
        )}

        {product && (
          <View style={styles.container}>
            <Animated.View style={styles.ratingWrapper} entering={FadeInDown.delay(500).duration(500)}>
              <View style={styles.ratingWrapper}>
                <Ionicons name="star" size={18} color={'#D4AF37'} />
                <Text style={styles.rating}>{product.rating}</Text>
              </View>
              <TouchableOpacity>
                <Ionicons name="heart-outline" size={20} color={Colors.black} />
              </TouchableOpacity>
            </Animated.View>

            <Animated.Text style={styles.title} entering={FadeInDown.delay(700).duration(500)}>
              {product.title}
            </Animated.Text>

            <Animated.View style={styles.priceWrapper} entering={FadeInDown.delay(900).duration(500)}>
              <Text style={styles.price}>${product.price}</Text>
              {product.discount > 0 && (
                <View style={styles.priceDiscount}>
                  <Text style={styles.priceDiscountText}>{product.discount}% Off</Text>
                </View>
              )}
              <Text style={styles.oldPrice}>${product.old_price}</Text>
            </Animated.View>

            <Animated.Text style={styles.description} entering={FadeInDown.delay(1100).duration(500)}>
              {product.description}
            </Animated.Text>

            <Animated.View style={styles.productVariationWrapper} entering={FadeInDown.delay(1300).duration(500)}>
              {/* Dynamic Color Variations */}
              <View style={styles.productVariationType}>
                <Text style={styles.productVariationTitle}>Color</Text>
                <View style={styles.productVariationValueWrapper}>
                  {product.color && product.color.length > 0 ? (
                    product.color.map((color, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleColorSelection(color.color_code, color.name, color.galleries)} // Pass both color code and name
                        style={[
                          styles.productVariationColorValue,
                          { backgroundColor: color.color_code },
                          selectedColor?.code === color.color_code && styles.selectedColorBorder, // Highlight selected color
                        ]}
                      />
                    ))
                  ) : (
                    <Text style={styles.noColorText}>No colors available</Text>
                  )}
                </View>
              </View>

              {/* Size Variations */}
              <View style={styles.productVariationType}>
                <Text style={styles.productVariationTitle}>Size</Text>
                <View style={styles.productVariationValueWrapper}>
                  {product.size && Array.isArray(product.size) && product.size.length > 0 ? (
                    product.size.map((size, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => setSelectedSize(size.name)} // Store selected size
                        style={[
                          styles.productVariationSizeValue,
                          selectedSize === size.name && styles.selectedSizeBorder, // Highlight if selected
                        ]}
                      >
                        <Text style={styles.productVariationSizeValueText}>{size.name}</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.noColorText}>No sizes available</Text>
                  )}
                </View>
              </View>
            </Animated.View>
          </View>
        )}
      </ScrollView>

      <Animated.View style={styles.buttonWrapper} entering={SlideInDown.delay(300).duration(500)}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: Colors.white, borderColor: Colors.primary, borderWidth: 1 }]}
          onPress={handleAddToCart} // Handle "Add to Cart" button press
        >
          <Ionicons name="cart-outline" size={20} color={Colors.primary} />
          <Text style={[styles.buttonText, { color: Colors.primary }]}>Add to Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Buy Now</Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  ratingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  rating: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '400',
    color: Colors.gray,
  },
  title: {
    fontSize: 20,
    fontWeight: '400',
    color: Colors.black,
    letterSpacing: 0.6,
    lineHeight: 32,
  },
  priceWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 5,
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
  },
  priceDiscount: {
    backgroundColor: Colors.extraLightGray,
    padding: 5,
    borderRadius: 5,
  },
  priceDiscountText: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.greenDiscount,
  },
  oldPrice: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.gray,
    textDecorationLine: 'line-through',
  },
  description: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '400',
    color: Colors.black,
    letterSpacing: 0.6,
    lineHeight: 24,
  },
  productVariationWrapper: {
    flexDirection: 'row',
    marginTop: 20,
    flexWrap: 'wrap',
  },
  productVariationType: {
    width: '50%',
    gap: 5,
    marginBottom: 10,
  },
  productVariationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.black,
  },
  productVariationValueWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexWrap: 'wrap',
  },
  productVariationColorValue: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedColorBorder: {
    borderColor: Colors.primary,
    borderRadius: 100,
    borderWidth: 1,
    padding: 2,
  },
  noColorText: {
    fontSize: 14,
    color: Colors.gray,
    fontStyle: 'italic',
  },
  productVariationSizeValue: {
    width: 50,
    height: 30,
    borderRadius: 5,
    backgroundColor: Colors.extraLightGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: Colors.lightGray,
    borderWidth: 1,
  },
  productVariationSizeValueText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.black,
  },
  selectedSizeBorder: {
    borderColor: Colors.primary,
    borderWidth: 1,
    padding: 2,
  },
  buttonWrapper: {
    position: 'absolute',
    height: 90,
    padding: 30,
    bottom: 0,
    width: '100%',
    backgroundColor: Colors.white,
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    borderRadius: 5,
    elevation: 5,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.white,
  },
});

export default ProductDetails;