import { Colors } from '@/constants/Colors';
import { ProductType } from '@/types/type';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import ProductItem from './ProductItem';


type Props = {
    products: ProductType[]
}

const FlashSale = ({products}: Props) => {

    const saleEndDate = new Date();
    saleEndDate.setDate(saleEndDate.getDate() + 7);
    saleEndDate.setHours(23, 59, 59);

    const [timeUnits, setTimeUnits] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    })

    useEffect(() => {
        const calculateTimeUnits = (timeDiffrence: number) => {
            const seconds = Math.floor(timeDiffrence / 1000);
            setTimeUnits({
                days: Math.floor(seconds / (3600 * 24)),
                hours: Math.floor(seconds % (3600 * 24) / 3600),
                minutes: Math.floor(seconds % 3600 / 60),
                seconds: Math.floor(seconds % 60),
            })
        }

        const updateCountdown= () => {
            const currentDate = new Date().getTime();
            const expiryTime = saleEndDate.getTime();
            const TimeDifference = expiryTime - currentDate;

            if(TimeDifference <= 0) {
                calculateTimeUnits(0);
            } else{
                calculateTimeUnits(TimeDifference);
            }
        }
        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, [])

    const fomatTime = (time:number) => {
        return time.toString().padStart(2, '0');
    }
    return (
        <View style={styles.container}>
            <View style={styles.titleWrapper}>
                <View style={styles.timerWrapper}>
                <Text style={styles.title}>Flash Sale</Text>
                <View style={styles.timer}>
                <Ionicons name='time-outline' size={16} color={Colors.black} /> 
                <Text style={styles.timerTxt}>{fomatTime(timeUnits.days)}:{fomatTime(timeUnits.hours)}:{fomatTime(timeUnits.minutes)}:{fomatTime(timeUnits.seconds)}</Text>
                </View>
                </View>
                <TouchableOpacity>
                    <Text style={styles.titleBtn}>See All</Text>
                </TouchableOpacity>
            </View>
                <FlatList keyExtractor={(item) => item.id.toString()} 
                data={products}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{marginLeft: 20}}
                horizontal
                renderItem={({item, index}) => (
                    <View style={{marginRight: 20}}>

                    <ProductItem index={index} item={item}/>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    titleWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 20,
        marginBottom: 20,
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
    timerWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    timer: {
        flexDirection: 'row',
        gap: 5,
        backgroundColor: Colors.highlight,
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 12, 
    },
    timerTxt:{
        color: Colors.black,
        fontWeight: '500',
    },
});

export default FlashSale;