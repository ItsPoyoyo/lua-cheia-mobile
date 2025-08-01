import { ImageBackground, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Href, Link, Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import Google from '@/assets/images/google-logo.svg';
import Animated, { FadeIn, FadeInDown, FadeInRight } from "react-native-reanimated";


type Props = {
    emailHref: Href
};

const SocialLoginButtons = (props: Props) => {

    const {emailHref} = props;
    return (
        <View style={styles.socialLoginWrapper}>
            <Animated.View entering={FadeInDown.delay(700).duration(500)}>
            <Link href={emailHref} asChild>
            <TouchableOpacity style={styles.button}>
                <Google width={20} height={20}/>
                <Text style={styles.btnTxt}>Continue with Google</Text>
            </TouchableOpacity>
            </Link>
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(1100).duration(500)}>
            <Link href={"/"} asChild>
            <TouchableOpacity style={styles.button}>
                <Ionicons 
                name="logo-apple"
                size={20}
                color={Colors.black}
                />
                <Text style={styles.btnTxt}>Continue with Apple</Text>
            </TouchableOpacity>
            </Link>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        margin: 10,
    },
    
    socialLoginWrapper: {
        alignSelf: 'stretch',
    },
    button: {
        flexDirection:"row",
        padding: 10,
        borderColor: Colors.gray,
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: "center",
        gap: 5,
        marginBottom: 15,
    },
    btnTxt: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.black,
  },
});

export default SocialLoginButtons;