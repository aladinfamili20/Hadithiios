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
  const navigation = useNavigation();

  const user = auth().currentUser;
  const uid = user?.uid;
  const { userData } = useUser();

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [playingVideoId, setPlayingVideoId] = useState(null);

  useEffect(() => {
    setProfileData(userData);
  }, [userData]);

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
            key: `${doc.data().type || 'unknown'}-${doc.id}`,
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

      const currentUserDoc = await currentUserRef.get();
      const currentUserFollowing = currentUserDoc.data()?.following || [];

      if (currentUserFollowing.includes(targetUserId)) {
        Alert.alert('You are already following this user');
        return;
      }

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
              setNotifications(prev => prev.filter(n => n.id !== id));
            } catch (err) {
              console.error('Error deleting notification:', err);
            }
          },
        },
      ],
    );
  };

  // Sort notifications newest first
  const combinedNotifications = Array.isArray(notifications)
    ? [...notifications].sort(
        (a, b) => b.timestamp.toMillis() - a.timestamp.toMillis(),
      )
    : [];

  const renderItem = ({ item }) => {
    if (item.type === 'new_follower') {
      return (
        <View style={styles.notificationContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => navigateToProfile(item.uid)}>
              <Image
                source={
                  item.profileImage
                    ? { uri: item.profileImage }
                    : require('../assets/thumblogo.png')
                }
                style={styles.profileImage}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigateToProfile(item.uid)}
              style={{ marginLeft: 10 }}
            >
              <Text style={styles.displayName}>{item.displayName}</Text>
              <Text style={styles.alertText}>New follower</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.followBackButton}
            onPress={() => followUser(uid, item.uid)}
          >
            <Text style={styles.followBackText}>Follow back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item.id)}
          >
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (item.type === 'like') {
      const isPlaying = playingVideoId === item.id;

      return (
        <View style={styles.notificationContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => navigateToProfile(item.uid)}>
              <Image
                source={
                  item.lickerProfileImage
                    ? { uri: item.lickerProfileImage }
                    : require('../assets/thumblogo.png')
                }
                style={styles.profileImage}
              />
            </TouchableOpacity>
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.displayName}>{item.lickerDisplayName}</Text>
              <Text style={styles.alertText}>Liked your video</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setPlayingVideoId(isPlaying ? null : item.id)}
            style={{ marginTop: 10 }}
          >
            {isPlaying ? (
              <Video
                source={{ uri: item.postImage }}
                style={styles.videoPlayer}
                resizeMode="cover"
                controls
                paused={false}
                onEnd={() => setPlayingVideoId(null)}
              />
            ) : (
              <Image
                source={{ uri: item.postImage }}
                style={styles.videoThumbnail}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item.id)}
          >
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null; // handle other notification types if needed
  };

  const renderHiddenItem = data => {
    if (!data || !data.item) return null;

    return (
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
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="tomato" />
      </View>
    );
  }

  if (combinedNotifications.length === 0) {
    return (
      <View style={styles.centered}>
        <Text
          style={{
            color: theme === 'dark' ? '#fff' : '#121212',
            fontSize: 16,
          }}
        >
          You have no notifications.
        </Text>
      </View>
    );
  }

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

      <SwipeListView
        data={combinedNotifications}
        renderItem={renderItem}
        renderHiddenItem={renderHiddenItem}
        rightOpenValue={-75}
        keyExtractor={item => item.key}
        disableRightSwipe
        showsVerticalScrollIndicator={false}
      />
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

    videoThumbnail: {
      width: '100%',
      height: 200,
      borderRadius: 10,
    },
    videoPlayer: {
      width: '100%',
      height: 200,
      borderRadius: 10,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
