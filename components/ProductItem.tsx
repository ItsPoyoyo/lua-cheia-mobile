import { 
    StyleSheet, 
    Image, 
    Text, 
    View, 
    Dimensions, 
    TouchableOpacity, 
    Alert,
    ActivityIndicator  // Add this import
  } from 'react-native';
  import React, { useState, useEffect } from 'react';
  import { ProductType } from '@/types/type';
  import { Ionicons } from '@expo/vector-icons';
  import { Colors } from '@/constants/Colors';
  import Animated, { FadeInDown } from 'react-native-reanimated';
  import { Link } from 'expo-router';
  import apiInstance from '../app/Plugins/api';
  import { getUserId } from '@/components/getUserId';
  
  type Props = {
      item: ProductType;
      index: number;
      onWishlistUpdate?: () => void;
      isInWishlist?: boolean;
  };
  
  const width = Dimensions.get('window').width - 40;
  
  const ProductItem = ({ item, index, onWishlistUpdate, isInWishlist: propIsInWishlist }: Props) => {
      const [isInWishlist, setIsInWishlist] = useState(propIsInWishlist || false);
      const [loading, setLoading] = useState(false);
      const [userId, setUserId] = useState<string | null>(null);
      const [showWishlistFeedback, setShowWishlistFeedback] = useState(false);
  
      // Sync with parent component's wishlist state
      useEffect(() => {
          if (propIsInWishlist !== undefined) {
              setIsInWishlist(propIsInWishlist);
          }
      }, [propIsInWishlist]);
  
      const handleWishlistAction = async (e: any) => {
          e.preventDefault();
          e.stopPropagation();
  
          if (!userId) {
              const id = await getUserId();
              if (!id) {
                  Alert.alert(
                      "Sign In Required", 
                      "Please sign in to manage your wishlist",
                      [{ text: "OK", onPress: () => {} }]
                  );
                  return;
              }
              setUserId(id);
          }
  
          setLoading(true);
          try {
              const formData = new FormData();
              formData.append("product_id", item.id);
              formData.append("user_id", userId);
  
              if (isInWishlist) {
                  await removeFromWishlist(formData);
              } else {
                  await addToWishlist(formData);
              }
              
              // Show visual feedback
              setShowWishlistFeedback(true);
              setTimeout(() => setShowWishlistFeedback(false), 1000);
              
          } catch (error) {
              console.error("Wishlist error:", error);
              Alert.alert(
                  "Error", 
                  "Failed to update wishlist",
                  [{ text: "OK", onPress: () => {} }]
              );
          } finally {
              setLoading(false);
          }
      };
  
      const addToWishlist = async (formData: FormData) => {
          if (!userId) return;
          
          await apiInstance.post(`customer/wishlist/${userId}/`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });
          setIsInWishlist(true);
          onWishlistUpdate?.();
      };
  
      const removeFromWishlist = async (formData: FormData) => {
          if (!userId) return;
          
          await apiInstance.post(`customer/wishlist/${userId}/`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });
          setIsInWishlist(false);
          onWishlistUpdate?.();
      };
  
      return (
          <Link href={`/product-details/${item.slug}`} asChild>
              <TouchableOpacity activeOpacity={0.8}>
                  <Animated.View 
                      style={styles.container} 
                      entering={FadeInDown.delay(300 + index * 100).duration(500)}
                  >
                      {/* Product Image */}
                      <Image 
                          source={{ uri: item.image }} 
                          style={styles.productImg} 
                          resizeMode="cover"
                      />
                      
                      {/* Wishlist Button */}
                      <TouchableOpacity 
                          style={[
                              styles.wishlistButton,
                              showWishlistFeedback && styles.wishlistButtonActive
                          ]}
                          onPress={handleWishlistAction}
                          disabled={loading}
                      >
                          {loading ? (
                              <ActivityIndicator size="small" color={isInWishlist ? Colors.red : Colors.darkGray} />
                          ) : (
                              <Ionicons 
                                  name={isInWishlist ? "heart" : "heart-outline"} 
                                  size={22} 
                                  color={isInWishlist ? Colors.red : Colors.darkGray} 
                              />
                          )}
                      </TouchableOpacity>
                      
                      {/* Price and Rating */}
                      <View style={styles.productInfo}>
                          <Text style={styles.price}>${item.price}</Text>
                          {item.old_price && (
                              <Text style={styles.oldPrice}>${item.old_price}</Text>
                          )}
                          {item.rating && (
                              <View style={styles.ratingWrapper}>
                                  <Ionicons name="star" size={16} color={Colors.gold} />
                                  <Text style={styles.rating}>{item.rating}</Text>
                              </View>
                          )}
                      </View>
                      
                      {/* Product Title */}
                      <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                      
                      {/* Product Category */}
                      {item.category?.title && (
                          <Text style={styles.category}>{item.category.title}</Text>
                      )}
                  </Animated.View>
              </TouchableOpacity>
          </Link>
      );
  };
  
  const styles = StyleSheet.create({
      container: {
          width: width / 2 - 10,
          marginBottom: 20,
      },
      productImg: {
          width: '100%',
          height: 180,
          borderRadius: 12,
          marginBottom: 12,
          backgroundColor: Colors.lightGray,
      },
      wishlistButton: {
          position: 'absolute',
          right: 12,
          top: 12,
          width: 36,
          height: 36,
          borderRadius: 18,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(255,255,255,0.9)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
      },
      wishlistButtonActive: {
          transform: [{ scale: 1.2 }],
      },
      title: {
          fontSize: 14,
          fontWeight: '500',
          color: Colors.darkText,
          marginTop: 4,
          lineHeight: 18,
      },
      productInfo: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 6,
      },
      price: {
          fontSize: 15,
          fontWeight: '600',
          color: Colors.primary,
      },
      oldPrice: {
          fontSize: 12,
          color: Colors.gray,
          textDecorationLine: 'line-through',
          marginRight: 4,
      },
      ratingWrapper: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
      },
      rating: {
          fontSize: 13,
          color: Colors.gray,
      },
      category: {
          fontSize: 12,
          color: Colors.gray,
          marginTop: 2,
      },
  });
  
  export default ProductItem;