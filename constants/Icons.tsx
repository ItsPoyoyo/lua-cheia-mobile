import Ionicons from "@expo/vector-icons/build/Ionicons";
import React from "react";
import { StyleSheet } from "react-native";

export const icon = {
    index: ({color}: { color: string }) => (
          <Ionicons name='home-outline' size={22} color={color} />
    ),
    explore: ({color}: { color: string }) => (
        <Ionicons name='search-outline' size={22} color={color} />
    ),
    notifications: ({color}: { color: string }) => (
        <Ionicons name='notifications-outline' size={22} color={color} />
    ),
    cart: ({color}: { color: string }) => (
        <Ionicons name='cart-outline' size={22} color={color} />
    ),
    profile: ({color}: { color: string }) => (
        <Ionicons name='person-outline' size={22} color={color} />
    // <Image source={{uri: ''}} style={styles.userImage}/>
    ),

}

const styles = StyleSheet.create({
    userImg: {
        height: 24,
        width: 24,
        borderRadius: 20,
    },

})