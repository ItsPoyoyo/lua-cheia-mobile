import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import apiInstance from '../Plugins/api';
import { Stack } from 'expo-router';
import Header from '@/components/Header';
import ProductItem from '@/components/ProductItem';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import ProductList from '@/components/ProductList';
import Categories from '@/components/Categories';
import { CategoryType } from '@/types/type';
import FlashSale from '@/components/FlashSale';

interface Product {
  id: number;
  title: string;
}

interface Banner {
  id: number;
  title: string;
  image: string;
  link: string;
  is_active: boolean;
  date: string;
}

const HomeScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getProducts = async () => {
    try {
      const response = await apiInstance.get('products/');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', 'Failed to load products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCategories = async () => {
    try {
      const response = await apiInstance.get('category/');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      Alert.alert('Error', 'Failed to load categories. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getSaleProducts = async () => {
    try {
      const response = await apiInstance.get('offers-carousel/');

  
      const ofertasDoDia = response.data.find(item => item.id === 1);
   
      setSaleProducts(ofertasDoDia ? ofertasDoDia.products : []);
    } catch (error) {
      console.error('Error fetching sale products:', error);
      Alert.alert('Error', 'Failed to load sale products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getBanners = async () => {
    try {
      const response = await apiInstance.get('banners/');
      setBanners(response.data);
    } catch (error) {
      console.error('Error fetching banners:', error);
      Alert.alert('Error', 'Failed to load banners. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
    getCategories();
    getSaleProducts();
    getBanners();
  }, []);

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{
          headerShown: true,
          header: () => <Header />
        }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{
        headerShown: true,
        header: () => <Header />
      }} />
      <ScrollView>
      <Categories categories={categories} />
      <FlashSale products={saleProducts} />
      <View style={{marginHorizontal: 20, marginBottom: 10}}>
        {banners.map(banner => (
          <Image key={banner.id} source={{ uri: banner.image }} style={{ width: '100%', height: 150, borderRadius: 15 }} />
        ))}
      </View>
      <ProductList products={products} flatlist={false} />
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.gray,
  },
});

export default HomeScreen;