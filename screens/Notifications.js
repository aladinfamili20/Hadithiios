/* eslint-disable react-native/no-inline-styles */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import firestore, { Timestamp } from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import DarkMode from '../components/Theme/DarkMode';
import { useUser } from '../data/Collections/FetchUserData';
import { SwipeListView } from 'react-native-swipe-list-view';

const Notifications = () => {
  const theme = DarkMode();
  const user = auth().currentUser;
  const uid = user?.uid;

  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [likeNotifications, setLikeNotifications] = useState([]);
  const { userData } = useUser();
  const navigation = useNavigation();

  useEffect(() => {
    setProfileData(userData);
  }, [userData]);

  const navigateToProfile = userId => {
    if (!userId) return;
    navigation.dispatch(
      CommonActions.navigate({
        name: 'UserProfileScreen',
        params: { uid: userId },
      }),
    );
  };

  useEffect(() => {
    const fetchFollowers = async () => {
      if (!uid) return;
      try {
        const userDoc = await firestore().collection('users').doc(uid).get();
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

  useEffect(() => {
    const getLikedNotifications = async () => {
      if (!uid) return;
      try {
        const snapshot = await firestore()
          .collection('notifications')
          .where('postUserUid', '==', uid)
          .get();

        const documents = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: 'like',
          key: `like-${doc.id}`,
          timestamp: doc.timestamp || Timestamp.now(),
        }));
        setLikeNotifications(documents);
      } catch (error) {
        console.error('Error fetching liked notifications:', error);
      }
    };
    getLikedNotifications();
  }, [uid]);

  const followUser = async (currentUserId, targetUserId) => {
    if (!currentUserId || !targetUserId || !profileData) return;

    try {
      const batch = firestore().batch();
      const currentUserRef = firestore().collection('users').doc(currentUserId);
      const targetUserRef = firestore().collection('users').doc(targetUserId);
      const { displayName, lastName, profileImage } = profileData;

      batch.update(currentUserRef, {
        following: firestore.FieldValue.arrayRemove(targetUserId),
      });
      batch.update(targetUserRef, {
        followers: firestore.FieldValue.arrayRemove({
          displayName,
          lastName,
          profileImage,
          uid: currentUserId,
          timestamp: Timestamp.now(),
        }),
      });

      batch.update(currentUserRef, {
        following: firestore.FieldValue.arrayUnion(targetUserId),
      });
      batch.update(targetUserRef, {
        followers: firestore.FieldValue.arrayUnion({
          displayName,
          lastName,
          profileImage,
          uid: currentUserId,
          timestamp: Timestamp.now(),
        }),
      });

      await batch.commit();
      Alert.alert('Follow back');
    } catch (error) {
      console.error('Error following back:', error);
    }
  };

  const handleDelete = async id => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await firestore()
                .collection('notifications')
                .doc(id, uid)
                .delete();
              setLikeNotifications(prev => prev.filter(n => n.id !== id, uid));
            } catch (err) {
              console.error('Error deleting notification:', err);
            }
          },
        },
      ],
    );
  };
  

  const combinedNotifications = [
    ...followers.map((item, index) => ({
      ...item,
      type: 'follower',
      // key: `follower-${item.uid}`,
      key: `follower-${item.uid}-${index}`, // Ensures uniqueness

      timestamp: item.timestamp || Timestamp.now(), // fallback if missing
    })),
    ...likeNotifications.map(item => ({
      ...item,
      type: 'like',
      key: `like-${item.id}`,
      timestamp: item.timestamp || Timestamp.now(), // ensure it's present
    })),
  ].sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis()); // newest first

  const renderItem = ({ item }) => (
    <View style={styles(theme).NotificationContainer}>
      {item.type === 'follower' ? (
        <>
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
            <Text style={styles(theme).followback}>Follow back</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => navigateToProfile(item.uid)}>
              <Image
                source={{ uri: item.lickerProfileImage }}
                style={styles(theme).image}
              />
            </TouchableOpacity>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles(theme).displayName}>
                {item.lickerDisplayName}
              </Text>
              <Text style={styles(theme).alert}>Liked your photo</Text>
            </View>
          </View>

          <Image
            source={{ uri: item.postImage }}
            style={styles(theme).lickedPostImage}
          />
        </>
      )}
    </View>
  );

  const renderHiddenItem = data => (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingRight: 20,
        height: '100%',
      }}
    >
      <TouchableOpacity onPress={() => handleDelete(data.item.id)}>
        <Text style={{ color: '#000', fontWeight: 'bold' }}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles(theme).container}>
      <View style={styles(theme).header}>
        <TouchableOpacity onPress={() => navigation.navigate('feed')}>
          <Ionicons
            name="chevron-back-outline"
            color={theme === 'dark' ? '#fff' : '#121212'}
            size={24}
          />
        </TouchableOpacity>
        <Text style={styles(theme).texth1}>Notifications</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="tomato" />
      ) : (
        <SwipeListView
          data={combinedNotifications}
          renderItem={renderItem}
          renderHiddenItem={renderHiddenItem}
          rightOpenValue={-75}
          keyExtractor={item => item.key}
          disableRightSwipe
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default Notifications;

const styles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === 'dark' ? '#121212' : '#ffffff',
      paddingHorizontal: 10,
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      marginBottom: 20,
    },

    texth1: {
      fontSize: 22,
      fontWeight: '700',
      color: theme === 'dark' ? '#fff' : '#121212',
      marginLeft: 12,
    },

    headerIcons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
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

    displayName: {
      fontWeight: '600',
      fontSize: 16,
      color: theme === 'dark' ? '#ffffff' : '#121212',
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

    lickedPostImg: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
  });
