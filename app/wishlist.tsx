import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  Dimensions,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { Stack, useNavigation } from 'expo-router';
import apiInstance from './Plugins/api';
import { getUserId } from '../components/getUserId';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

const WishlistScreen = () => {
  const navigation = useNavigation();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);

  const fetchWishlist = async (userId) => {
    try {
      setLoading(true);
      const response = await apiInstance.get(`customer/wishlist/${userId}/`);
      setWishlist(response.data || []);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      Alert.alert("Error", "Failed to load wishlist");
      setWishlist([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (userId) {
      await fetchWishlist(userId);
    }
  };

  useEffect(() => {
    navigation.setOptions({ 
      title: 'Your Wishlist',
      headerBackTitle: 'Back'
    });
    
    const initialize = async () => {
      try {
        const id = await getUserId();
        setUserId(id);
        if (id) {
          await fetchWishlist(id);
        }
      } catch (error) {
        console.error("Error initializing:", error);
        setLoading(false);
      }
    };

    initialize();

    return () => {
      // Cleanup if needed
    };
  }, []);

  const removeFromWishlist = async (productId) => {
    try {
      const formData = new FormData();
      formData.append("product_id", productId);
      formData.append("user_id", userId);
      
      const response = await apiInstance.post(
        `customer/wishlist/${userId}/`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Optimistic UI update
      setWishlist(prev => prev.filter(item => item.product.id !== productId));
      
      Alert.alert("Success", "Item removed from wishlist", [
        { text: "OK", onPress: () => {} }
      ]);
    } catch (error) {
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Revert optimistic update if failed
      fetchWishlist(userId);
      
      Alert.alert(
        "Error", 
        error.response?.data?.message || "Failed to remove item",
        [{ text: "OK", onPress: () => {} }]
      );
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.productCard}>
      <TouchableOpacity>
        <Image
          source={{ uri: item.product.image }}
          style={styles.productImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
      
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={1}>{item.product.title}</Text>
        <Text style={styles.productCategory}>{item.product.category?.title}</Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>${item.product.price}</Text>
          {item.product.old_price && (
            <Text style={styles.oldPrice}>${item.product.old_price}</Text>
          )}
        </View>
        
        <TouchableOpacity
          onPress={() => removeFromWishlist(item.product.id)}
          style={styles.wishlistButton}
          activeOpacity={0.7}
        >
          <Ionicons name="heart" size={20} color={Colors.red} />
          <Text style={styles.wishlistButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Your Wishlist',
        headerBackTitle: 'Back'
      }} />
      
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : wishlist.length > 0 ? (
        <FlatList
          data={wishlist}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={48} color={Colors.gray} />
          <Text style={styles.emptyText}>Your wishlist is empty</Text>
          <Text style={styles.emptySubtext}>Add products to see them here</Text>
          
          <TouchableOpacity
            style={styles.continueShoppingButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.continueShoppingText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: Colors.lightGray,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  listContent: {
    paddingBottom: 20,
  },
  productCard: {
    width: (width - 40) / 2,
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 15,
  },
  productImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.darkText,
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: Colors.gray,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  oldPrice: {
    fontSize: 12,
    color: Colors.gray,
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  wishlistButton: {
    flexDirection: 'row',
    backgroundColor: Colors.lightRed,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  wishlistButtonText: {
    color: Colors.red,
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.darkGray,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 4,
  },
  continueShoppingButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  continueShoppingText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default WishlistScreen;