import { Colors } from '@/constants/Colors';
import { icon } from '@/constants/Icons';
import React from 'react';
import { Text, StyleSheet, Pressable, View } from 'react-native';

type Props = {
    onPress: Function;
    onLongPress: Function;
    isFocused: boolean;
    label: string;
    routeName: string;
};

const TabBarButton = (props: Props) => {
    const { onPress, onLongPress, isFocused, label, routeName } = props;

    // Fallback to 'index' if routeName is not found
    const IconComponent = icon[routeName] || icon['index'];

    return (
        <Pressable
            onPress={onPress}
            onLongPress={onLongPress}
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
            {routeName == 'cart' && (
            <View style={styles.badgeWrapper}>
                <Text style={styles.badgeText}>3</Text>
            </View>
            )}

            <IconComponent color={isFocused ? Colors.primary : Colors.black} />
            <Text style={styles.tabbarBtn}>{label}</Text>
        </Pressable>
    );
};

export default TabBarButton;

const styles = StyleSheet.create({
    tabbarBtn: {
        textAlign: 'center',
        color: Colors.black,
        fontSize: 12,
        marginTop: 5,
    },
    badgeWrapper: {
        position: 'absolute',
        backgroundColor: Colors.highlight,
        top: -5,
        right: 20,
        paddingHorizontal: 6,
        paddingVertical:2,
        borderRadius: 10,
        zIndex:10,
    },
    badgeText: {
        color:Colors.black,
        fontSize: 12,

    }
});