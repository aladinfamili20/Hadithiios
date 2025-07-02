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
  Alert,
} from 'react-native';
import firestore, { Timestamp } from '@react-native-firebase/firestore';
import { CommonActions, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Divider from '../components/Divider';
import DarkMode from '../components/Theme/DarkMode';
import { useUser } from '../data/Collections/FetchUserData';
import { auth } from '../data/Firebase';

const FollowersScreen = () => {
  const theme = DarkMode();
  const { userData } = useUser();
  const user = auth().currentUser;
  const uid = user?.uid;

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
const [followStatus, setFollowStatus] = useState({});

  const navigation = useNavigation();

  useEffect(() => {
    setProfileData(userData);
  }, [userData]);

 


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
        .where('followerName', '>=', searchQuery)
        .where('followerName', '<=', searchQuery + '\uf8ff')
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

  //   Fetch followers

  useEffect(() => {
    const fetchFollowers = async () => {
      if (!uid) return;
      try {
        const userRef = firestore().collection('users').doc(uid);
        const userDoc = await userRef.get();
        const followersList = userDoc.exists
          ? userDoc.data().followers || []
          : [];
        setFollowers(followersList);
        setIsFollowing(true);
      } catch (error) {
        console.error('Error fetching followers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
  }, [uid]);

  //   handle follow back
const followUser = async (currentUserId, targetUserId) => {
  if (!currentUserId || !targetUserId || !profileData) return;

  try {
    const batch = firestore().batch();
    const currentUserRef = firestore().collection('users').doc(currentUserId);
    const targetUserRef = firestore().collection('users').doc(targetUserId);

    const { displayName, lastName, profileImage } = profileData;

    // If already following — unfollow
    if (isFollowing) {
      // Get current user's document
      const currentUserDoc = await currentUserRef.get();
      const currentUserData = currentUserDoc.data();
      const updatedFollowing = (currentUserData.following || []).filter(
        u => u.uid !== targetUserId
      );
      batch.update(currentUserRef, { following: updatedFollowing });

      // Get target user's followers and filter
      const targetUserDoc = await targetUserRef.get();
      const targetUserData = targetUserDoc.data();
      const updatedFollowers = (targetUserData.followers || []).filter(
        u => u.uid !== currentUserId
      );
      batch.update(targetUserRef, { followers: updatedFollowers });

      setIsFollowing(false);
      Alert.alert('Unfollowed');
    } else {
      // FOLLOW

      // 1. Get info of the user you're following
      const targetUserDoc = await targetUserRef.get();
      const targetData = targetUserDoc.data();

      const targetDisplayName = targetData?.displayName || '';
      const targetLastName = targetData?.lastName || '';
      const targetProfileImage = targetData?.profileImage || '';

      // 2. Add to "following" array of current user
      batch.update(currentUserRef, {
        following: firestore.FieldValue.arrayUnion({
          uid: targetUserId,
          displayName: targetDisplayName,
          lastName: targetLastName,
          profileImage: targetProfileImage,
          timestamp: Timestamp.now(),
        }),
      });

      // 3. Add to "followers" array of target user
      batch.update(targetUserRef, {
        followers: firestore.FieldValue.arrayUnion({
          uid: currentUserId,
          displayName,
          lastName,
          profileImage,
          timestamp: Timestamp.now(),
        }),
      });

        await firestore().collection('notifications').add({
        recipientId: targetUserId,
        type: 'new_follower',
        followerId: currentUserId,
        followerName: `${displayName} ${lastName}`,
        followerImage: profileImage,
        timestamp: firestore.Timestamp.now(),
        read: false,
      });
    

      setIsFollowing(true);
      Alert.alert('Followed');
    }

    await batch.commit();
  } catch (error) {
    console.error('Error following/unfollowing:', error);
  }
};






  const renderFollower = ({ item }) => {
      const isFollowingUser = followStatus[item.uid] || false;

    return (
    <View style={styles(theme).NotificationContainer}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigateToProfile(item.uid)}>
          <Image
            style={styles(theme).image}
            source={
              item.profileImage
                ? { uri: item.profileImage }
                : require('../assets/thumblogo.png')
            }
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigateToProfile(item.uid)}
          style={{ marginLeft: 10 }}
        >
          <Text style={styles(theme).displayName}>
            {item.displayName} {item.lastName}
          </Text>
          <Text style={styles(theme).alert}>New follower</Text>
        </TouchableOpacity>
      </View>
        <TouchableOpacity onPress={() => followUser(uid, item.uid)}>
      <Text style={styles(theme).followback}>
        {isFollowingUser ? 'Unfollow' : 'Follow back'}
      </Text>
    </TouchableOpacity>
    </View>

    )
  }
 
 

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
          data={followers}
          keyExtractor={(item, index) => `${item.uid}-${index}`}
          renderItem={renderFollower}
          onEndReachedThreshold={0.1}
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
                      {item.followerName}
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

export default FollowersScreen;

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
