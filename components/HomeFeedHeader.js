/* eslint-disable react-native/no-inline-styles */
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { auth, firestore } from '../data/Firebase';
import { useNavigation } from '@react-navigation/native';
import DarkMode from './Theme/DarkMode';
import Ionicons from 'react-native-vector-icons/Ionicons';
import mobileAds, {
  BannerAd,
  TestIds,
  BannerAdSize,
} from 'react-native-google-mobile-ads';
import {
  collection,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  where,
} from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';

// Test Ads

const testAdUnit = __DEV__
  ? TestIds.BANNER
  : 'ca-app-pub-xxxxxxxxxxxxxxxx/zzzzzzzzzz';

//   Live ads
const liveAdUnit = 'ca-app-pub-9427314859640201/5919265806';

const HomeFeedHeader = () => {
  const theme = DarkMode();
  const user = auth().currentUser;
  const uid = user?.uid;
  const navigation = useNavigation();
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const db = getFirestore(getApp());

useEffect(() => {
  if (!uid) return;

  const notificationsRef = collection(db, 'notifications');
  const notificationsQuery = query(
    notificationsRef,
    where('recipientId', '==', uid),
    where('read', '==', false)
  );

  const unsubscribe = onSnapshot(notificationsQuery, snapshot => {
    setUnreadNotifications(snapshot.size);
  });

  return () => unsubscribe();
}, [db, uid]);


  useEffect(() => {
    mobileAds()
      .initialize()
      .then(adapterStatuses => {
        console.log('AdMob initialized');
      });
  }, []);

  return (
    <View>
      <View style={{ marginTop: 10, alignItems: 'center' }}>
        <BannerAd
          unitId={liveAdUnit}
          size={BannerAdSize.ADAPTIVE_BANNER}
          requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        />

        {/* <BannerAd
          unitId={liveAdUnit}
          size={BannerAdSize.ADAPTIVE_BANNER}
          // size={BannerAdSize.BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
          onAdLoaded={() => {
            console.log('Ad loaded');
          }}
          onAdFailedToLoad={error => {
            console.error('Ad failed to load: ', error);
          }}
        /> */}
      </View>
      <View style={styles(theme).homeHeader}>
        <Image
          source={require('../assets/hadthilogo.png')}
          style={styles(theme).logo}
        />
        <View style={styles(theme).topRight}>
          <TouchableOpacity onPress={() => navigation.navigate('event')}>
            <Ionicons
              name="calendar-outline"
              size={25}
              color={theme === 'dark' ? '#fff' : '#121212'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginRight: 10 }}
            onPress={async () => {
              try {
                // Update unread notifications to read
                const notificationsRef =
                  firestore().collection('notifications');
                const snapshot = await notificationsRef
                  .where('recipientId', '==', uid)
                  .where('read', '==', false)
                  .get();

                const batch = firestore().batch();
                snapshot.forEach(doc => {
                  batch.update(doc.ref, { read: true });
                });
                await batch.commit();

                // Reset local counter
                setUnreadNotifications(0);

                // Navigate to Notifications screen
                navigation.navigate('Notifications');
              } catch (error) {
                console.error('Error marking notifications as read:', error);
              }
            }}
          >
            <Ionicons
              name="notifications-outline"
              size={25}
              color={theme === 'dark' ? '#fff' : '#121212'}
            />
            {unreadNotifications > 0 && (
              <View style={styles(theme).notificationBadge}>
                <Text style={styles(theme).notificationBadgeText}>
                  {unreadNotifications}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default HomeFeedHeader;

const styles = theme =>
  StyleSheet.create({
    HomeContainer: {
      flex: 1,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    },
    homeHeader: {
      marginTop: Platform.OS === 'ios' ? -9 : 10,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      // marginTop:20,
    },
    notificationBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: '#FF4500',
      borderRadius: 10,
      padding: 2,
      width: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    notificationBadgeText: {
      color: theme === 'dark' ? '#fff' : '#fff',
      fontSize: 12,
      fontWeight: 'bold',
    },
    topRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    logo: {
      width: '40%',
      height: 40,
      alignSelf: 'flex-start',
    },
  });
