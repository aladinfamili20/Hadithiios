/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  Text,
   FlatList,
} from 'react-native';
import {StatusBar} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import firestore, {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  increment,
  limit,
  orderBy,
  query,
  startAfter,
  updateDoc,
  where,
} from '@react-native-firebase/firestore';
import {auth} from '../../data/Firebase';
import VideoHandler from '../../components/VideoHandler';
import DarkMode from '../../components/Theme/DarkMode';
import {getApp} from '@react-native-firebase/app';
import {debounce, chunk} from 'lodash';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import VideosAds from './VideosAds';
const liveAdUnit = 'ca-app-pub-9427314859640201/5919265806';

const BATCH_SIZE = 10; // Number of posts to fetch per batch

const db = getFirestore(getApp());

export const getFollowingUsers = async uid => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data().following || [] : [];
};

export const fetchPostsByFollowing = async (
  following,
  lastVisible = null,
  batchSize = BATCH_SIZE,
) => {
  if (!following.length) {
    return {posts: [], newLastVisible: null};
  }

  const postsRef = collection(db, 'videos');
    const uidsOnly = following.map(f => f.uid); // extract uid from objects

  const chunks = chunk(uidsOnly, 10);
  const allPosts = [];

  for (const group of chunks) {
    let q = query(
      postsRef,
      where('uid', 'in', group),
      orderBy('createdAt', 'desc'),
      ...(lastVisible ? [startAfter(lastVisible.createdAt)] : []),
      limit(batchSize),
    );

    const snapshot = await getDocs(q);
    snapshot.forEach(doc => {
      allPosts.push({id: doc.id, ...doc.data()});
    });
  }

  const newLastVisible =
    allPosts.length > 0 ? allPosts[allPosts.length - 1] : null;
  return {posts: allPosts, newLastVisible};
};

const VideoScreen = () => {
  const theme = DarkMode();
  const [postData, setPostData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);

  const navigation = useNavigation();
  const user = auth().currentUser;
  const uid = user?.uid;

  useEffect(() => {
    if (!user) {
      navigation.navigate('login');
    }
  }, [user, navigation]);

  const fetchFollowedPosts = useCallback(
    async (isInitialLoad = false) => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const following = await getFollowingUsers(uid);
        if (following.length === 0) {
          setPostData([]);
          setLoading(false);
          return;
        }

        const {posts, newLastVisible} = await fetchPostsByFollowing(
          following,
          isInitialLoad ? null : lastVisible,
          BATCH_SIZE,
        );

        setPostData(prevPosts => {
          const combined = isInitialLoad ? posts : [...prevPosts, ...posts];
          const uniquePosts = Array.from(
            new Map(combined.map(p => [p.id, p])).values(),
          );
          return uniquePosts;
        });

        setLastVisible(newLastVisible);
        setLoading(false);
        setFetchingMore(false);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setLoading(false);
      }
    },
    [user, uid, lastVisible],
  );

  useEffect(() => {
    fetchFollowedPosts(true);
  }, []);

  const handleLoadMore = () => {
    if (fetchingMore || !lastVisible) {
      return;
    }
    setFetchingMore(true);
    fetchFollowedPosts(false);
  };

  const incrementViewCount = async (videoId) => {
  try {
    const videoRef = doc(db, 'videos', videoId);
    await updateDoc(videoRef, {
      views: increment(1),
    });
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
};
 
  const renderVideos = useCallback(({item, index}) => (

    <View>
      <VideoHandler post={item} />
      {index > 0 && index % 6 === 0 && (
        <View style={{marginVertical: 10, alignItems: 'center'}}>
          <BannerAd
            unitId={liveAdUnit}
            // unitId={adUnitId}
            size={BannerAdSize.ADAPTIVE_BANNER}
            // size={BannerAdSize.SMART_BANNER}
            // onAdFailedToLoad={(error) => console.error('Ad failed to load: ', error)}
            // onAdLoaded={() => console.log('Ad loaded')}
            requestOptions={{requestNonPersonalizedAdsOnly: true}}
          />
        </View>
      )}
    </View>
  ), []);



  const ListFooterComponent = () =>
    fetchingMore ? (
      <View style={styles(theme).loadingMoreContainer}>
        <ActivityIndicator size="small" color="tomato" />
      </View>
    ) : null;

  return (
    <View style={styles(theme).HomeContainer}>
      <StatusBar backgroundColor="orangered" />
      {loading ? (
        <View style={styles(theme).loadingContainer}>
          <ActivityIndicator size="large" color="tomato" />
          <Text
            style={{
              color: theme === 'dark' ? '#fff' : '#121212',
              textAlign: 'center',
            }}>
            Loading videos
          </Text>
        </View>
      ) : (
        <FlatList
          data={postData}
          renderItem={renderVideos}
          keyExtractor={item => item.id}
          onEndReached={handleLoadMore}
          ListHeaderComponent={VideosAds}
          onEndReachedThreshold={0.5}
          ListFooterComponent={ListFooterComponent}
          ListEmptyComponent={
            <View style={styles(theme).noPostsContainer}>
              <Text style={styles(theme).noPostsText}>
                No videos available.
              </Text>
            </View>
          }
          
        />
      )}
    </View>
  );
};

export default VideoScreen;

const styles = theme =>
  StyleSheet.create({
    HomeContainer: {
      flex: 1,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    },
    homeHeader: {
      // marginTop: Platform.OS === 'ios' ? -9 : 10,
      backgroundColor: '#ffffff',
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    logo: {
      width: '40%',
      height: 40,
      alignSelf: 'flex-start',
    },

    horizontal: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: 10,
    },
    homeStoryCom: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    addButton: {
      width: 100,
      height: 150,
      borderRadius: 10,
      textAlign: 'center',
      marginLeft: 10,
      backgroundColor: '#f0f0f0',
      marginBottom: 5,
      marginTop: 10,
    },
    UserStoryProfName: {
      fontSize: 15,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 5,
      color: '#5b5b5b',
    },
    addIcon: {
      marginRight: 20,
      position: 'absolute',
      top: '40%',
      left: '35%',
    },
    noPostsContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    noPostsText: {
      fontSize: 16,
      color: '#555555',
      textAlign: 'center',
      marginBottom: 20,
    },
    followUsersButton: {
      padding: 10,
      width: Dimensions.get('window').width * 0.85,
      fontSize: 15,
      fontWeight: 'bold',
      textAlign: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      borderRadius: 10,
      backgroundColor: '#ff0303',
    },
    notificationBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: '#ff0303',
      borderRadius: 10,
      padding: 2,
      width: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    notificationBadgeText: {
      color: 'white',
      fontSize: 12,
      fontWeight: 'bold',
    },
    topRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    },
  });

// import { StyleSheet, Text, View } from 'react-native'
// import React from 'react'

// const Video = () => {
//   return (
//     <View>
//       <Text>Video</Text>
//     </View>
//   )
// }

// export default Video

// const styles = StyleSheet.create({})