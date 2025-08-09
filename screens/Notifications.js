/* eslint-disable react-native/no-inline-styles */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
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
import Video from 'react-native-video';

const Notifications = () => {
  const theme = DarkMode();
  const user = auth().currentUser;
  const uid = user?.uid;

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [likeNotifications, setLikeNotifications] = useState([]);
  const { userData } = useUser();
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [playingVideoId, setPlayingVideoId] = useState(null); // which video is playing

  useEffect(() => {
    setProfileData(userData);
  }, [userData]);

  // useEffect(() => {
  //   const getFollewerNotification = async () => {
  //     if (!uid) return;
  //      try {
  //       const snapshot = await firestore()
  //         .collection('notifications')
  //         .where('recipientId', '==', uid)
  //         .get();

  //       const documents = snapshot.docs.map(doc => ({
  //         id: doc.id,
  //         ...doc.data(),
  //         // type: 'new_follower',
  //         key: `new_follower-${doc.id}`,
  //         timestamp: doc.data().timestamp || Timestamp.now(),
  //       }));
  //       setFollwedNotifications(documents);
  //     } catch (error) {
  //       console.error('Error fetching follower notifications:', error);
  //     } finally {
  //       setLoading(false); // ✅ move here
  //     }
  //   };
  //   getFollewerNotification();
  // }, [uid]);

  // fetched liked photos
  // useEffect(() => {
  //   const getLikedNotifications = async () => {
  //     if (!uid) return;
  //     try {
  //       const snapshot = await firestore()
  //         .collection('notifications')
  //         .where('recipientId', '==', uid)
  //         .get();

  //       const documents = snapshot.docs.map(doc => ({
  //         id: doc.id,
  //         ...doc.data(),
  //         type: 'like',
  //         key: `like-${doc.id}`,
  //         timestamp: doc.timestamp || Timestamp.now(),
  //       }));
  //       setLikeNotifications(documents);
  //     } catch (error) {
  //       console.error('Error fetching liked notifications:', error);
  //     }
  //   };
  //   getLikedNotifications();
  // }, [uid]);

  useEffect(() => {
    if (!uid) return;

    const unsubscribe = firestore()
      .collection('notifications')
      .where('recipientId', '==', uid)
      .orderBy('timestamp', 'desc')
      .onSnapshot(
        snapshot => {
          const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            key: `${doc.data().type}-${doc.id}`,
            timestamp: doc.data().timestamp || firestore.Timestamp.now(),
          }));
          setNotifications(data);
          setLoading(false);
        },
        error => {
          console.error('Error fetching notifications:', error);
          setLoading(false);
        },
      );

    return () => unsubscribe();
  }, [uid]);

  const navigateToProfile = userId => {
    if (!userId) return;
    navigation.dispatch(
      CommonActions.navigate({
        name: 'UserProfileScreen',
        params: { uid: userId },
      }),
    );
  };

  const followUser = async (currentUserId, targetUserId) => {
    if (!currentUserId || !targetUserId || !profileData) return;

    try {
      const currentUserRef = firestore().collection('users').doc(currentUserId);
      const targetUserRef = firestore().collection('users').doc(targetUserId);

      // Check if already following to avoid duplicates
      const currentUserDoc = await currentUserRef.get();
      const currentUserFollowing = currentUserDoc.data()?.following || [];

      if (currentUserFollowing.includes(targetUserId)) {
        Alert.alert('You are already following this user');
        return;
      }

      // Batch update to add follower/following
      const batch = firestore().batch();

      batch.update(currentUserRef, {
        following: firestore.FieldValue.arrayUnion(targetUserId),
      });

      batch.update(targetUserRef, {
        followers: firestore.FieldValue.arrayUnion(currentUserId),
      });

      await batch.commit();

      // Add follower notification only if doesn't exist
      const existingNotification = await firestore()
        .collection('notifications')
        .where('recipientId', '==', targetUserId)
        .where('type', '==', 'new_follower')
        .where('uid', '==', currentUserId)
        .limit(1)
        .get();

      if (existingNotification.empty) {
        await firestore()
          .collection('notifications')
          .add({
            recipientId: targetUserId,
            type: 'new_follower',
            uid: currentUserId,
            displayName:
              `${profileData.displayName} ${profileData.lastName}`.trim(),
            profileImage: profileData.profileImage,
            timestamp: firestore.Timestamp.now(),
            read: false,
          });
      }

      Alert.alert('Followed back successfully!');
    } catch (error) {
      console.error('Error following user:', error);
      Alert.alert('Error', 'Could not follow user.');
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
              await firestore().collection('notifications').doc(id).delete();
              setLikeNotifications(prev => prev.filter(n => n.id !== id));
            } catch (err) {
              console.error('Error deleting notification:', err);
            }
          },
        },
      ],
    );
  };

  // const combinedNotifications = [
  //   // ...followers.map((item, index) => ({
  //   //   ...item,
  //   //   type: 'follower',
  //   //   // key: `follower-${item.uid}`,
  //   //   key: `follower-${item.uid}-${index}`, // Ensures uniqueness

  //   //   timestamp: item.timestamp || Timestamp.now(), // fallback if missing
  //   // })),
  //   ...likeNotifications.map(item => ({
  //     ...item,
  //     type: 'like',
  //     key: `like-${item.id}`,
  //     timestamp: item.timestamp || Timestamp.now(), // ensure it's present
  //   })),
  //   ...follwedNotifications.map(item => ({
  //     ...item,
  //     type: 'new_follower',
  //     key: `new_follower-${item.id}`,
  //     timestamp: item.timestamp || Timestamp.now(), // ensure it's present
  //   })),
  // ].sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis()); // newest first

  const combinedNotifications = Array.isArray(notifications)
    ? notifications.sort(
        (a, b) => b.timestamp.toMillis() - a.timestamp.toMillis(),
      )
    : [];

  const renderItemm = ({ item }) => (
    <View style={styles(theme).NotificationContainer}>
      {item.type === 'new_follower' ? (
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
              <Text style={styles(theme).displayName}>{item.displayName}</Text>
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
              <Text style={styles(theme).alert}>Liked your post</Text>

              {/* <Text style={styles(theme).timestamp}>
  {item.timestamp.toDate().toLocaleString()}
</Text> */}
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

  const renderItem = ({ item }) => {
    if (item.type === 'new_follower') {
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
              <Text style={styles(theme).displayName}>{item.displayName}</Text>
              <Text style={styles(theme).alert}>New follower</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => followUser(uid, item.uid)}>
            <Text style={styles(theme).followback}>Follow back</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (item.type === 'like') {
      return (
        <View style={styles(theme).NotificationContainer}>
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
              <Text style={styles(theme).alert}>Liked your post</Text>

              {/* <Text style={styles(theme).timestamp}>
  {item.timestamp.toDate().toLocaleString()}
</Text> */}
            </View>
            
          </View>

          <Image
            source={{ uri: item.postImage }}
            style={styles(theme).lickedPostImage}
          />
        </View>
      );
    }

    if (item.type === 'likevideo') {
      return (
        <View style={styles(theme).NotificationContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => navigateToProfile(item.uid)}>
              <Image
                source={
                  item.lickerProfileImage
                    ? { uri: item.lickerProfileImage }
                    : require('../assets/thumblogo.png')
                }
                style={styles(theme).image}
              />
            </TouchableOpacity>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles(theme).displayName}>
                {item.lickerDisplayName}
              </Text>
              <Text style={styles(theme).alert}>Liked your video</Text>
            </View>
          </View>

          <Video
            source={{ uri: item.postImage }}
            style={styles(theme).lickedPostVideo}
            resizeMode="cover"
            controls
            paused={true} // Start paused, user can play it
          />
        </View>
      );
    }

    return <View style={{ height: 0 }} />;
  };

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
      ) : combinedNotifications.length === 0 ? (
        <View style={{ alignItems: 'center', marginTop: 50 }}>
          <Text
            style={{
              color: theme === 'dark' ? '#fff' : '#121212',
              fontSize: 16,
            }}
          >
            You have no notifications.
          </Text>
        </View>
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

    lickedPostVideo: {
      width: 60,
      height: 60,
      borderRadius: 10,
      marginTop: 10,
    },
  });
