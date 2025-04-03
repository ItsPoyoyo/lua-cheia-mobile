import { FlatList,Image, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import apiInstance from '../Plugins/api';
import { CategoryType } from '@/types/type';
import { Stack } from 'expo-router';
import  { useHeaderHeight } from '@react-navigation/elements';
import { Colors } from '@/constants/Colors';
import Animated, { FadeInDown } from 'react-native-reanimated';

type Props = {}



const ExploreScreen = (props: Props) => {
    const [categories, setCategories] = useState<CategoryType[]>([]);
    const [isLoading, setIsLoading] = useState(true);


    
    const getCategories = async () => {
      try {
        const response = await apiInstance.get('category/');
        setCategories(response.data);
      } catch (error) {
        // console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    useEffect(() => {
      getCategories();
    }, []);

  return (
    <>
    <Stack.Screen options={{headerShown: true, headerTransparent: true}} />
    <View style={styles.container, {marginTop: useHeaderHeight()}}>
      <FlatList 
      data={categories} 
      keyExtractor={(item) => item.id.toString()}
      showsVerticalScrollIndicator={false}
      renderItem={({item, index}) => (
        <Animated.View entering={FadeInDown.delay(300 + index * 100).duration(500)} style={styles.itemWrapper}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Image source={{ uri: item.image }} style={{width: 100, height: 100, borderRadius: 10,}} />
          </Animated.View>
      ) }/>
  
    </View>
    </>
  )
}

export default ExploreScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  itemWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  itemTitle: {
    fontSize:16,
    fontWeight: '500',
    color: Colors.black,
  }
})