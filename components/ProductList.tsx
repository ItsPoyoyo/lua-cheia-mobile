import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import ProductItem from './ProductItem';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { ProductType } from '@/types/type';

type Props = {
    products: ProductType[];
    flatlist: boolean;

}

const ProductList = ({products, flatlist = true}: Props) => {
    return (
    <View style={styles.container}>
      <View style={styles.titleWrapper}>
      <Text style={styles.title}>For You</Text>
      <TouchableOpacity>
        <Text style={styles.titleBtn}>See All</Text>
      </TouchableOpacity>
      </View>

      {flatlist ? (
      <FlatList
        data={products}
        numColumns={2}
        columnWrapperStyle={{justifyContent: 'space-between', marginBottom: 20}}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({index, item }) => (
          <ProductItem item={item}
          index={index}
          />
        )}
      />
    ):(
      <View style={styles.itemsWrapper}>
          {products.map((item, index) =>(
              <View key={index} style={styles.productWrapper}>
                  <ProductItem item={item} index={index}/>
              </View>
          ))}
      </View>
  )}

</View>

    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
    },
    titleWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: 0.6,
        color: Colors.black,
    },
    titleBtn: {
        fontSize: 14,
        fontWeight: '500',
        letterSpacing: 0.6,
        color: Colors.black,
    },
    itemsWrapper:{
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'stretch',
    },
    productWrapper: {
        width: '50%',
        paddingLeft: 5,
        marginBottom: 20,
    }
});

export default ProductList;