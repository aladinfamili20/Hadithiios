/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import firestore, { collection, Timestamp, where } from '@react-native-firebase/firestore';
import { CommonActions, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Divider from '../components/Divider';
import DarkMode from '../components/Theme/DarkMode';
import { useUser } from '../data/Collections/FetchUserData';
import { auth } from '../data/Firebase';
import { currentLoggedInUserData } from '../components/FetchFollowingData';
import { getDocs, getFirestore, query } from 'firebase/firestore';
// import ProgressBar from 'react-native-progress/Bar';

const PAGE_SIZE = 15;

const FollowingScreen = () => {
  const theme = DarkMode();
  const { userData } = useUser();
  const user = auth().currentUser;
  const uid = user?.uid;

  const [loading, setLoading] = useState(false);
  const { getCurrentLoggedIn } = currentLoggedInUserData();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [postData, setPostData] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [lastPostDoc, setLastPostDoc] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentLoggedInUser, setCurrentLoggedInUser] = useState(null);
  const [publicProfile, setPublicProfile] = useState(null);

  const navigation = useNavigation();

  useEffect(() => {
    setProfileData(userData);
  }, [userData]);

  useEffect(() => {
    setCurrentLoggedInUser(getCurrentLoggedIn);
  }, [getCurrentLoggedIn]);

  const navigateToProfile = userId => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'UserProfileScreen',
        params: { uid: userId },
      }),
    );
  };

  // handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setIsLoadingUsers(true);
      const results = [];

      const nameSnapshot = await firestore()
        .collection('notifications')
        .where('recipientId', '==', uid)
        .where('displayName', '>=', searchQuery)
        .where('displayName', '<=', searchQuery + '\uf8ff')
        .get();

      nameSnapshot.forEach(doc => {
        results.push({ id: doc.id, ...doc.data() });
      });

      setSearchResults(results);
    } catch (error) {
      console.error('Error searching notifications:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const debounceRef = useRef(null);

  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      handleSearch();
    }, 400); // debounce time in ms
  }, [searchQuery]);

  //   fetch posts
  const fetchPosts = async (loadMore = false) => {
    if (fetchingMore || !hasMorePosts) return;

    setFetchingMore(true);
    const postRef = firestore()
      .collection('posts')
      .orderBy('createdAt', 'desc');

    try {
      const snapshot = loadMore
        ? await postRef.startAfter(lastPostDoc).limit(PAGE_SIZE).get()
        : await postRef.limit(PAGE_SIZE).get();

      const newDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setPostData(prev => (loadMore ? [...prev, ...newDocs] : newDocs));
      setLastPostDoc(snapshot.docs[snapshot.docs.length - 1]);

      if (snapshot.docs.length < PAGE_SIZE) setHasMorePosts(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setFetchingMore(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setHasMorePosts(true);
    setLastPostDoc(null);
    setRefreshing(false);
  };
 
  // fetched followers
  useEffect(() => {
    const getFollewerNotification = async () => {
      if (!uid) return;
      try {
        const snapshot = await firestore()
          .collection('notifications')
          .where('recipientId', '==', uid)
      .where('type', '==', 'new_follower')
          .get();

        const documents = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // type: 'new_follower',
          // key: `new_follower-${doc.id}`,
          timestamp: doc.data().timestamp || Timestamp.now(),
        }));
        setFollowers(documents);
          setIsFollowing(true);
      } catch (error) {
        console.error('Error fetching follower notifications:', error);
      } finally {
        setLoading(false); // ✅ move here
      }
    };
    getFollewerNotification();
  }, [uid]);






 
 // Helper: chunk array into pieces of 10
// const chunk = (array, size = 10) => {
//   const result = [];
//   for (let i = 0; i < array.length; i += size) {
//     result.push(array.slice(i, i + size));
//   }
//   return result;
// };

// const fetchFollowedUsersFromNotifications = async (currentUserId) => {
//   try {
//     // Get the user's "following" list
//     const userDoc = await firestore().collection('users').doc(currentUserId).get();
//     const following = userDoc.exists ? userDoc.data().following || [] : [];
//     if (!following.length) return [];

//     // Fetch notifications where this user followed someone
//     const snapshot = await firestore()
//       .collection('notifications')
//       .where('uid', '==', currentUserId)
//       .where('type', '==', 'new_follower')
//       .get();

//     if (snapshot.empty) return [];

//     // Get recipientIds from notifications
//     const recipientIds = snapshot.docs.map(doc => doc.data().recipientId);

//     // Only keep those the user is still following
//     const validIds = recipientIds.filter(id => following.includes(id));

//     // Remove duplicates
//     const uniqueValidIds = [...new Set(validIds)];

//     // Chunk for Firestore "in" queries
//     const chunks = chunk(uniqueValidIds, 10);
//     const followedUsers = [];

//     for (const group of chunks) {
//       const userSnapshot = await firestore()
//         .collection('users')
//         .where(firestore.FieldPath.documentId(), 'in', group)
//         .get();

//       userSnapshot.forEach(doc => {
//         followedUsers.push({ id: doc.id, ...doc.data() });
//       });
//     }

//     return followedUsers;
//   } catch (error) {
//     console.error('Error fetching currently followed users:', error);
//     return [];
//   }
// }; 




// useEffect(() => {
//   const loadFollowedUsers = async () => {
//     const users = await fetchFollowedUsersFromNotifications(user?.uid);
//     setFollowers(users);
//   };

//   if (user?.uid) loadFollowedUsers();
// }, [user?.uid]);




 


  //   handle follow back

  const followUser = async (currentUserId, targetUserId) => {
    if (!currentUserId || !targetUserId || !profileData) return;

    try {
      const batch = firestore().batch();
      const currentUserRef = firestore().collection('users').doc(currentUserId);
      const targetUserRef = firestore().collection('users').doc(targetUserId);

      const { displayName, lastName, profileImage } = profileData;

      const currentUserDoc = await currentUserRef.get();
      const currentUserData = currentUserDoc.data();
      const updatedFollowing = (currentUserData.following || []).filter(
        f => f.uid !== targetUserId,
      );

      if (isFollowing) {
        // UNFOLLOW
        batch.update(currentUserRef, {
          following: updatedFollowing,
        });

        //       await currentUserRef.update({
        //   following: updatedFollowing,
        // });

        // followers is an array of objects, so manual filter is better than arrayRemove
        const targetDoc = await targetUserRef.get();
        const targetData = targetDoc.data();
        const updatedFollowers = (targetData.followers || []).filter(
          f => f.uid !== currentUserId,
        );

        batch.update(targetUserRef, {
          followers: updatedFollowers,
        });

        setIsFollowing(false);
        Alert.alert('Unfollowed');
      } else {
        // FOLLOW
        batch.update(currentUserRef, {
          following: firestore.FieldValue.arrayUnion(targetUserId),
        });

        batch.update(targetUserRef, {
          followers: firestore.FieldValue.arrayUnion(currentUserId
          //   {
          //   displayName,
          //   lastName,
          //   profileImage,
          //   uid: currentUserId,
          //   timestamp: Timestamp.now(),
          // }
        ),
        });

        await firestore().collection('notifications').add({
        recipientId: targetUserId,
        type: 'new_follower',
        uid: currentUserId,
        displayName: `${displayName} ${lastName}`,
        followerImage: profileImage,
        timestamp: firestore.Timestamp.now(),
        read: false,
      });

        setIsFollowing(true);
        Alert.alert('Followed');
      }

      await batch.commit();
    } catch (error) {
      console.error('Error updating follow state:', error);
    }
  };

  useEffect(() => {
    if (
      getCurrentLoggedIn?.following &&
      Array.isArray(getCurrentLoggedIn.following) &&
      publicProfile?.uid
    ) {
      const isAlreadyFollowing = getCurrentLoggedIn.following.includes(
        publicProfile.uid,
      );
      setIsFollowing(isAlreadyFollowing);
    }
  }, [getCurrentLoggedIn, publicProfile]);

  const renderFollower = ({ item }) => {
    // Skip rendering if essential data is missing
    if (!item?.displayName || !item?.profileImage) return null;

    return (
      <View style={styles(theme).NotificationContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigateToProfile(item.uid)}>
            <Image
              style={styles(theme).image}
              source={
                item.profileImage
                  ? { uri: item.profileImage }
                  : require('../assets/thumblogo.png') // Fallback won't be used here because we skip items with no image
              }
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigateToProfile(item.uid)}
            style={{ marginLeft: 10 }}
          >
            <Text style={styles(theme).displayName}>
              {item.displayName} {item.lastName || ''}
            </Text>
            <Text style={styles(theme).alert}>Following</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => followUser(uid, item.uid)}>
          <Text style={styles(theme).followback}>Unfollow</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles(theme).searchContainer}>
      <View style={styles(theme).topHeader}>
        <View style={styles(theme).topHeaderIcons}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons
              name="chevron-back-outline"
              color={theme === 'dark' ? '#fff' : '#121212'}
              size={24}
              style={styles(theme).leftArrowIcon}
            />
          </TouchableOpacity>
          <View style={styles(theme).searchContentInfos}>
            <View style={styles(theme).searchContent}>
              <TextInput
                placeholder="Search users..."
                value={searchQuery}
                onChangeText={text => setSearchQuery(text)}
                style={styles(theme).searchBar}
                placeholderTextColor="#888"
              />
              <TouchableOpacity onPress={handleSearch}>
                <Ionicons
                  name="search-outline"
                  color={theme === 'dark' ? '#fff' : '#121212'}
                  size={24}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {loading || isLoadingUsers ? (
        <View style={[styles(theme).container1, styles(theme).horizontal]}>
          <ActivityIndicator size="large" color="tomato" />
        </View>
      ) : searchQuery.trim().length === 0 ? (
        <FlatList
          //   data={postData}
          data={followers}
          keyExtractor={(item, index) => `${item.uid}-${index}`}
          renderItem={renderFollower}
          onEndReached={() => fetchPosts(true)}
          onEndReachedThreshold={0.1}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListFooterComponent={
            fetchingMore && (
              <View style={{ padding: 10 }}>
                <ActivityIndicator size="small" color="tomato" />
              </View>
            )
          }
        />
      ) : isLoadingUsers ? (
        <View style={[styles(theme).container1, styles(theme).horizontal]}>
          <ActivityIndicator size="large" color="tomato" />
        </View>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item, index) =>
            item.id ? item.id.toString() : index.toString()
          }
          initialNumToRender={9}
          maxToRenderPerBatch={15}
          windowSize={10}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigateToProfile(item.id)}
              style={styles(theme).searchItem}
            >
              <View style={styles(theme).NotificationContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity onPress={() => navigateToProfile(item.uid)}>
                    <Image
                      style={styles(theme).image}
                      source={
                        item.followerImage
                          ? { uri: item.followerImage }
                          : require('../assets/thumblogo.png')
                      }
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => navigateToProfile(item.uid)}
                    style={{ marginLeft: 10 }}
                  >
                    <Text style={styles(theme).displayName}>
                      {item.displayName}
                    </Text>
                    <Text style={styles(theme).alert}>New follower</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => followUser(uid, item.uid)}>
                  <Text style={styles(theme).followback}>
                    Follow
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Divider />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

export default FollowingScreen;

const styles = theme =>
  StyleSheet.create({
    searchContainer: {
      flex: 1,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    },
    topHeader: {
      // paddingHorizontal: 10,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
      height: 70,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    topHeaderIcons: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    leftArrowIcon: {
      marginRight: 10,
    },
    searchContentInfos: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: 10,
    },
    searchContent: {
      flexDirection: 'row',
      backgroundColor: theme === 'dark' ? '#2C2C2C' : '#F2F2F2',
      borderRadius: 25,
      paddingHorizontal: 10,
      height: 45,
      alignItems: 'center',
      flex: 1,
    },
    searchBar: {
      flex: 1,
      color: theme === 'dark' ? '#fff' : '#121212',
      fontSize: 16,
      paddingVertical: 0,
    },
    searchItem: {
      marginVertical: 10,
      paddingHorizontal: 15,
    },
    searchInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    SearchPhotoContainer: {
      marginBottom: 10,
      borderRadius: 20,
      overflow: 'hidden',
    },

    textContainer: {
      marginLeft: 15,
    },
    displayName: {
      // fontSize: 18,
      fontWeight: 'bold',
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    username: {
      color: theme === 'dark' ? '#fff' : '#888',
    },
    container1: {
      flex: 1,
      justifyContent: 'center',
    },

    NotificationContainer: {
      backgroundColor: theme === 'dark' ? '#1e1e1e' : '#f9f9f9',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      borderRadius: 12,
      marginVertical: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },

    image: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: '#ccc',
    },

    lickedPostImage: {
      width: 60,
      height: 60,
      borderRadius: 8,
      marginTop: 8,
      backgroundColor: '#e0e0e0',
    },

    alert: {
      fontSize: 13,
      marginTop: 2,
      color: theme === 'dark' ? '#cccccc' : '#555555',
    },

    followback: {
      backgroundColor: 'orangered',
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderRadius: 10,
      color: '#fff',
      fontWeight: '600',
      fontSize: 14,
      overflow: 'hidden',
    },

    noFollowing: {
      textAlign: 'center',
      fontSize: 16,
      color: '#888888',
      marginTop: 40,
    },
  });
