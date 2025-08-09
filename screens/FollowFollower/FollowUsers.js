/* eslint-disable no-catch-shadow */
/* eslint-disable no-shadow */
/* eslint-disable react-native/no-inline-styles */

import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import DarkMode from '../../components/Theme/DarkMode';
import { useUser } from '../../data/Collections/FetchUserData';

 

const FollowUsers = () => {
  const theme = DarkMode();
  const user = auth().currentUser;
  const { userData, isLoading } = useUser();
  const uid = user?.uid;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [userList, setUserList] = useState([]);
  const [followingUserId, setFollowingUserId] = useState(null);

  const navigation = useNavigation();

  const navigateToProfile = userId => {
    if (!userId) {
      setError('User ID is undefined');
      return;
    }

    navigation.dispatch(
      CommonActions.navigate({
        name: 'UserProfileScreen',
        params: { uid: userId },
      }),
    );
  };

  const followUser = async (currentUserId, targetUser) => {
    const targetUserId = targetUser?.uid;
    if (!currentUserId || !targetUserId) return;

    setFollowingUserId(targetUserId);
    setError('');
    setSuccessMessage('');

    try {
      const batch = firestore().batch();
      const currentUserRef = firestore().collection('users').doc(currentUserId);
      const targetUserRef = firestore().collection('users').doc(targetUserId);

      const {
        displayName = '',
        lastName = '',
        profileImage = '',
      } = userData || {};

      batch.update(currentUserRef, {
        following: firestore.FieldValue.arrayUnion(targetUserId),
      });

      batch.update(targetUserRef, {
        followers: firestore.FieldValue.arrayUnion(currentUserId),
      });

      await batch.commit();
 
// Before adding a new notification
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
      displayName: `${displayName} ${lastName}`.trim(),
      profileImage,
      timestamp: firestore.Timestamp.now(),
      read: false,
    });
}






      setSuccessMessage('User followed successfully!');

      // Optimistic UI update: Update userList locally to reflect new following
      setUserList(prevList =>
        prevList.map(user =>
          user.uid === targetUserId
            ? { ...user, isFollowed: true }
            : user,
        ),
      );

      // Optionally navigate to profile after success
      navigation.navigate('UserProfileScreen', { uid: targetUserId });
    } catch (error) {
      console.error('Error following user:', error);
      Alert.alert('Error', 'Could not follow user.');
      setError('Error following user.');
    } finally {
      setFollowingUserId(null);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError('');
        const snapshot = await firestore()
          .collection('profileUpdate')
          .orderBy('updatedAt', 'desc')
          .limit(50)
          .get();

        const users = snapshot.docs
          .map(doc => ({ uid: doc.id, ...doc.data() }))
          .filter(userDoc => userDoc.uid !== uid);

        setUserList(users);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Error fetching user list.');
      } finally {
        setLoading(false);
      }
    };

    if (uid) fetchUsers();
  }, [uid]);

  const truncateString = (str, maxLength) =>
    typeof str === 'string' && str.length > maxLength
      ? str.substring(0, maxLength) + '...'
      : str;

  const themedStyles = styles(theme);

  if (isLoading || !userData) {
    return (
      <View style={themedStyles.container}>
        <ActivityIndicator size="large" color="tomato" />
        <Text
          style={{
            marginTop: 15,
            fontSize: 16,
            color: '#555',
            textAlign: 'center',
            paddingHorizontal: 20,
            fontStyle: 'italic',
          }}
        >
          If the profile is loading slowly, please close and reopen the app to
          refresh.
        </Text>
      </View>
    );
  }

  return (
    <View style={themedStyles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="tomato" />
      ) : (
        <FlatList
          data={userList}
          keyExtractor={item => item.uid}
          renderItem={({ item }) => (
            <View style={themedStyles.NotificationContainer}>
              <TouchableOpacity
                onPress={() => navigateToProfile(item.uid)}
                style={{ flexDirection: 'row', alignItems: 'center' }}
              >
                <Image
                  source={
                    item.profileImage
                      ? { uri: item.profileImage }
                      : require('../../assets/thumblogo.png')
                  }
                  style={themedStyles.image}
                />
                <View>
                  <Text style={themedStyles.displayName}>
                    {item.displayName || ''}{' '}
                    {truncateString(item.lastName || '', 15)}
                  </Text>
                  <Text style={themedStyles.userName}>
                    {truncateString(item.userName || '', 15)}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => followUser(uid, item)}
                disabled={followingUserId === item.uid || item.isFollowed}
                style={themedStyles.followbackBtn}
              >
                <Text style={themedStyles.followbackText}>
                  {followingUserId === item.uid
                    ? 'Following...'
                    : item.isFollowed
                    ? 'Followed'
                    : 'Follow'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {!!error && (
        <View style={{ backgroundColor: '#fee', padding: 10, borderRadius: 5 }}>
          <Text style={{ color: 'red' }}>{error}</Text>
        </View>
      )}

      {!!successMessage && (
        <View
          style={{
            backgroundColor: '#efe',
            padding: 10,
            borderRadius: 5,
            marginTop: 10,
            alignItems: 'center',
            textAlign: 'center'
          }}
        >
          <Text style={{ color: 'green' }}>{successMessage}</Text>
        </View>
      )}
    </View>
  );
};


export default FollowUsers;

const styles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
      padding: 10,
      width: '100%',
    },
    NotificationContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
      paddingBottom: 10,
    },
    image: {
      width: 30,
      height: 30,
      borderRadius: 25,
    },
    displayName: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme === 'dark' ? '#fff' : '#121212',
      marginLeft: 10,
    },
    userName: {
      marginLeft: 10,
      fontSize: 10,
    },
    followbackBtn: {
      backgroundColor: '#FF4500',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 5,
    },
    followbackText: {
      color: '#fff',
      fontWeight: 'bold',
      textAlign: 'center',
    },
  });
