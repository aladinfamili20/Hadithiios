 
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import DarkMode from '../Theme/DarkMode';
import { useRoute } from '@react-navigation/native';
import { auth, firestore } from '../../data/Firebase';
import FetchFriendsCollection from '../FetchFriendsCollection';
import FecthUserProfile from '../FetchUserProfile';
import { useUser } from '../../data/Collections/FetchUserData';
import { currentLoggedInUserData } from '../FetchFollowingData';

const AudienceFriends = () => {
  const route = useRoute();
  const { uid } = route.params;
  const user = auth().currentUser;
  const { getCurrentLoggedIn } = currentLoggedInUserData();
  const { userData } = useUser();
  const theme = DarkMode();
  const { userprofile } = FecthUserProfile('profileUpdate', uid);
  const { friends } = FetchFriendsCollection('users', uid);
  const [publicProfile, setPublicProfile] = useState(null);
  const [fetchFriends, setFetchFriends] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [getProfInfo, setGetProfInfo] = useState(null);
  const [getError, setGetError] = useState('');

  console.log('Profile info', getProfInfo);

  useEffect(() => {
    setGetProfInfo(userData);
  }, [userData]);

  useEffect(() => {
    setPublicProfile(userprofile);
  }, [userprofile]);

  useEffect(() => {
    setFetchFriends(friends);
  }, [friends]);


const handleFollow = async () => {
  const currentUserId = user?.uid;
  const targetUserId = publicProfile?.uid;
  if (!currentUserId || !targetUserId) return;

  const currentUserRef = firestore().collection('users').doc(currentUserId);
  const targetUserRef = firestore().collection('users').doc(targetUserId);

  const { displayName, lastName, profileImage } = getProfInfo || {};

  try {
    const currentUserDoc = await currentUserRef.get();
    const currentUserData = currentUserDoc.data();

    if (isFollowing) {
      const updatedFollowing = (currentUserData.following || []).filter(
        f => f !== targetUserId
      );

      await currentUserRef.update({
        following: updatedFollowing,
      });

      await targetUserRef.update({
        followers: firestore.FieldValue.arrayRemove(currentUserId),
      });

      setIsFollowing(false);
      Alert.alert('Unfollowed');
    } else {
      await currentUserRef.update({
        following: firestore.FieldValue.arrayUnion(targetUserId), // ✅ fixed
      });

      await targetUserRef.update({
        followers: firestore.FieldValue.arrayUnion(currentUserId),
      });

      setIsFollowing(true);
      Alert.alert('Followed');

      await firestore().collection('notifications').add({
        recipientId: targetUserId,
        type: 'new_follower',
        uid: currentUserId,
        displayName: `${displayName} ${lastName}`,
        profileImage,
        timestamp: firestore.Timestamp.now(),
        read: false,
      });
    }
  } catch (error) {
    console.error('Error updating follow state:', error);
    setGetError('Follow/unfollow failed. Please try again.');
  }
};

  useEffect(() => {
    if (
      getCurrentLoggedIn?.following &&
      Array.isArray(getCurrentLoggedIn.following) &&
      publicProfile?.uid
    ) {
 
      const isAlreadyFollowing = getCurrentLoggedIn.following.includes(publicProfile.uid);

      setIsFollowing(isAlreadyFollowing);
    }
  }, [getCurrentLoggedIn, publicProfile]);

  return (
    <View style={styles(theme).container}>
      <View style={styles(theme).userAudience}>
        <View style={styles(theme).followerContainer}>
          <View style={styles(theme).followerContent}>
            <Text style={styles(theme).follower}>
              {fetchFriends?.followers?.length || 0}
            </Text>
            <Text style={styles(theme).followerLabel}>Followers</Text>
          </View>
        </View>

        <View style={styles(theme).followerContainer}>
          <View style={styles(theme).followerContent}>
            <Text style={styles(theme).follower}>
              {fetchFriends?.following?.length || 0}
            </Text>
            <Text style={styles(theme).followerLabel}>Following</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        onPress={handleFollow}
        style={styles(theme).followButton}
      >
        <Text style={styles(theme).followButtonText}>
          {isFollowing ? 'Unfollow' : 'Follow'}
        </Text>
      </TouchableOpacity>

      <Text style={styles(theme).error}>{getError}</Text>
    </View>
  );
};

export default AudienceFriends;

const styles = theme =>
  StyleSheet.create({
    container: {
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
      flex: 1,
    },
    userAudience: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 20,
      borderWidth: 1,
      borderColor: theme === 'dark' ? '#fff' : '#ccc',
      borderRadius: 20,
      padding: 15,
      backgroundColor: theme === 'dark' ? '#1e1e1e' : '#f9f9f9',
    },
    followerContainer: {
      alignItems: 'center',
    },
    followerContent: {
      alignItems: 'center',
    },
    follower: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    followerLabel: {
      fontSize: 14,
      color: theme === 'dark' ? '#ccc' : '#555',
    },
    followButton: {
      width: '100%',
      marginTop: 30,
      borderRadius: 20,
      backgroundColor: 'tomato',
      paddingVertical: 12,
      paddingHorizontal: 25,
      alignSelf: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 4,
    },
    followButtonText: {
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: 18,
      color: 'white',
    },

    error: {
      color: theme === 'dark' ? '#fff' : '#121212',
      textAlign: 'center',
      alignItems: 'center',
    },
  });
