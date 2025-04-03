import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { useHeaderHeight } from '@react-navigation/elements';
import apiInstance from '../Plugins/api';
import moment from 'moment';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { getUserId } from '../../components/getUserId'; // Utility to get user ID from token

type NotificationType = {
  id: number;
  date: string;
  message: string;
  seen: boolean;
};

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const userId = await getUserId(); // Dynamically fetch the user ID

        if (userId) {
          const response = await apiInstance.get(`customer/notification/${userId}/`);
          setNotifications(response.data);
        } else {
          Alert.alert('Error', 'User ID not found');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch notifications');
        console.error('Error fetching notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markNotificationAsSeen = async (notificationId: number) => {
    try {
      const userId = await getUserId();

      if (userId) {
        await apiInstance.get(`customer/notification/${userId}/${notificationId}/`);
        // Update the notification's "seen" status locally
        setNotifications((prevNotifications) =>
          prevNotifications.map((n) =>
            n.id === notificationId ? { ...n, seen: true } : n
          )
        );
        Alert.alert('Success', 'Notification marked as seen');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to mark notification as seen');
      console.error('Error marking notification as seen:', error);
    }
  };

  const headerHeight = useHeaderHeight();

  return (
    <>
      <Stack.Screen options={{ headerShown: true, headerTransparent: true }} />
      <View style={[styles.container, { marginTop: headerHeight }]}>
        {isLoading ? (
          <Text>Loading...</Text>
        ) : notifications.length > 0 ? (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item, index }) => (
              <Animated.View
                entering={FadeInDown.delay(300 + index * 100).duration(500)}
                style={[
                  styles.notificationWrapper,
                  item.seen ? styles.seenNotification : styles.unseenNotification,
                ]}
              >
                <View style={styles.notificationIcon}>
                  <Ionicons name="notifications-outline" size={24} color={Colors.black} />
                </View>
                <View style={styles.notificationInfo}>
                  <View style={styles.notificationHeader}>
                    <Text style={styles.notificationTitle}>Order Confirmed!</Text>
                    <Text style={styles.notificationDate}>
                      {moment(item.date).format('MMM, D, YYYY')}
                    </Text>
                  </View>
                  <Text style={styles.notificationMessage}>Your order has been confirmed.</Text>
                  {!item.seen && (
                    <TouchableOpacity
                      style={styles.markAsSeenButton}
                      onPress={() => markNotificationAsSeen(item.id)}
                    >
                      <Text style={styles.markAsSeenButtonText}>Mark as seen</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Animated.View>
            )}
          />
        ) : (
          <Text style={styles.noNotificationsText}>You currently have no notifications</Text>
        )}
      </View>
    </>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  notificationWrapper: {
    flexDirection: 'row',
    padding: 10,
    marginBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.lightGray,
    backgroundColor: Colors.extraLightGray,
    borderRadius: 5,
  },
  seenNotification: {
    opacity: 0.6, // Dim the notification if it's seen
  },
  unseenNotification: {
    opacity: 1,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationInfo: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.black,
  },
  notificationDate: {
    fontSize: 14,
    color: Colors.gray,
  },
  notificationMessage: {
    fontSize: 14,
    color: Colors.black,
    marginTop: 5,
    lineHeight: 20,
  },
  markAsSeenButton: {
    marginTop: 10,
    padding: 5,
    backgroundColor: Colors.primary,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  markAsSeenButtonText: {
    color: Colors.white,
    fontSize: 14,
  },
  noNotificationsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: Colors.gray,
  },
});