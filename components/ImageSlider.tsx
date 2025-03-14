import React, { useImperativeHandle, useRef, useState } from 'react';
import { View, Image, FlatList, Dimensions, ViewToken, StyleSheet } from 'react-native';
import Pagination from './Pagination';

type Props = {
    imageList: string[];
};

const { width } = Dimensions.get('screen');

const ImageSlider = React.forwardRef(({ imageList }, ref) => {
    const [paginationIndex, setPaginationIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null); // Ref to control the FlatList

    const onViewableItemsChanged = ({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0 && viewableItems[0]?.index !== undefined) {
            setPaginationIndex(viewableItems[0]?.index ?? 0 % (imageList?.length || 1));
        }
    };

    const viewabilityConfig = {
        itemVisiblePercentThreshold: 50,
    };

    // Expose the resetToFirstImage method via ref
    useImperativeHandle(ref, () => ({
        resetToFirstImage: () => {
            if (flatListRef.current) {
                flatListRef.current.scrollToIndex({ index: 0, animated: true }); // Scroll to the first image
            }
        },
    }));

    const viewabilityConfigCallbackPairs = useRef([{ viewabilityConfig, onViewableItemsChanged }]);

    return (
        <View style={styles.sliderContainer}>
            <FlatList
                ref={flatListRef} // Pass the ref to FlatList
                data={imageList}
                renderItem={({ item }) => (
                    <View style={styles.imageWrapper}>
                        <Image source={{ uri: item }} style={styles.image} />
                    </View>
                )}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
                viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
                keyExtractor={(item, index) => index.toString()}
                onScrollToIndexFailed={() => {
                    // Fallback in case scrollToIndex fails
                    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
                }}
            />
            <Pagination items={imageList} paginationIndex={paginationIndex} />
        </View>
    );
});

const styles = StyleSheet.create({
    sliderContainer: {
        width: width,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageWrapper: {
        width: width, // Make sure each item takes up the full screen width
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: 300,
        height: 300,
        borderRadius: 10,
    },
});

export default ImageSlider;