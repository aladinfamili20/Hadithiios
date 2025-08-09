/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  FlatList,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from '@react-native-firebase/firestore';
import { auth, firestore } from '../data/Firebase';
import { debounce, chunk } from 'lodash';
import HomeFeedHeader from '../components/HomeFeedHeader';
import DarkMode from '../components/Theme/DarkMode';
import PostHandler from '../components/PostHandler';
import {
  BannerAd,
  TestIds,
  BannerAdSize,
} from 'react-native-google-mobile-ads';
import { getApp } from '@react-native-firebase/app';
import FollowUsers from './FollowFollower/FollowUsers';

// const testAdUnit = __DEV__ ? TestIds.BANNER : 'ca-app-pub-3940256099942544/2435281174';

const liveAdUnit = 'ca-app-pub-9427314859640201/5919265806';

const BATCH_SIZE = 10;
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
  if (!following.length) return { posts: [], newLastVisible: null };
  const blockedUids = await fetchBlockedUids();

  const postsRef = collection(db, 'posts');
  const uidsOnly = following.filter(
    uid => typeof uid === 'string' && uid.trim() !== '',
  );

  const chunks = chunk(uidsOnly, 10);
  const allPosts = [];

  for (const group of chunks) {
    if (!group.length) continue;
    let q = query(
      postsRef,
      where('uid', 'in', group),
      orderBy('createdAt', 'desc'),
      ...(lastVisible ? [startAfter(lastVisible.createdAt)] : []),
      limit(batchSize),
    );

    const snapshot = await getDocs(q);
    snapshot.forEach(doc => {
      const post = { id: doc.id, ...doc.data() };
      if (!blockedUids.includes(post.uid)) {
        allPosts.push(post);
      }
    });
  }

  const newLastVisible =
    allPosts.length > 0 ? allPosts[allPosts.length - 1] : null;
  return { posts: allPosts, newLastVisible };
};

export const fetchBlockedUids = async () => {
  const currentUserUid = auth().currentUser?.uid;
  const snapshot = await firestore()
    .collection('users')
    .doc(currentUserUid)
    .collection('blockedUsers')
    .get();

  return snapshot.docs.map(doc => doc.id); // array of blocked user UIDs
};

const HomeScreen = () => {
  const theme = DarkMode();
  const user = auth().currentUser;
  const uid = user?.uid;
  const [postData, setPostData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const [fetchingMore, setFetchingMore] = useState(false);
  const navigation = useNavigation();

  const renderPost = useCallback(
    ({ item, index }) => (
      <View>
        <PostHandler post={item} />
        {index > 0 && index % 4 === 0 && (
          <View style={{ marginVertical: 10, alignItems: 'center' }}>
            <BannerAd
              unitId={liveAdUnit}
              // unitId={adUnitId}
              size={BannerAdSize.ADAPTIVE_BANNER}
              // size={BannerAdSize.SMART_BANNER}
              // onAdFailedToLoad={(error) => console.error('Ad failed to load: ', error)}
              // onAdLoaded={() => console.log('Ad loaded')}
              requestOptions={{ requestNonPersonalizedAdsOnly: true }}
            />
          </View>
        )}
      </View>
    ),
    [],
  );

  if (!user) {
    navigation.navigate('login');
  }

  const fetchFollowedPosts = useCallback(
    async (isInitialLoad = false) => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const following = await getFollowingUsers(user.uid);

        if (following.length === 0) {
          setPostData([]);
          setLastVisible(null);
          setLoading(false);
          return;
        }

        const { posts, newLastVisible } = await fetchPostsByFollowing(
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
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
        setFetchingMore(false);
      }
    },
    [user?.uid, lastVisible],
  );

  useEffect(() => {
    fetchFollowedPosts(true);
  }, []);

  const handleLoadMore = useCallback(
    debounce(() => {
      if (fetchingMore || !lastVisible) return;
      setFetchingMore(true);
      fetchFollowedPosts(false);
    }, 300),
    [fetchingMore, lastVisible],
  );

  return (
    <View style={styles(theme).HomeContainer}>
      <StatusBar backgroundColor="orangered" />
      {loading ? (
        <View style={styles(theme).loadingContainer}>
          <ActivityIndicator size="large" color="tomato" />
        </View>
      ) : (
        <FlatList
          data={postData}
          keyExtractor={(item, index) =>
            item.id?.toString() || index.toString()
          }
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item, index }) => renderPost({ item, index })}
          ListHeaderComponent={HomeFeedHeader}
          ListEmptyComponent={
            <View style={styles(theme).noPostsContainer}>
              <Text style={styles(theme).noPostsText}>
                No posts available. Follow users to see their posts here.
              </Text>
              <FollowUsers />
            </View>
          }
          ListFooterComponent={
            fetchingMore ? (
              <View style={styles(theme).loadingMoreContainer}>
                <ActivityIndicator size="small" color="#FF4500" />
              </View>
            ) : null
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.2}
        />
      )}
    </View>
  );
};

export default HomeScreen;

const styles = theme =>
  StyleSheet.create({
    HomeContainer: {
      flex: 1,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
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
    loadingMoreContainer: {
      padding: 10,
      alignItems: 'center',
    },
  });
