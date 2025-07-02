/* eslint-disable react-native/no-inline-styles */
/* eslint-disable curly */
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
import firestore, { Timestamp } from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import DarkMode from '../components/Theme/DarkMode';
import { useUser } from '../data/Collections/FetchUserData';

const FollowUsers = () => {
  const theme = DarkMode();
  const user = auth().currentUser;
  const { userData, isLoading } = useUser();
  const uid = user?.uid;

  const [loading, setLoading] = useState(true);
  const [getError, setGetError] = useState('');
  const [userList, setUserList] = useState([]);
  const [followingUserId, setFollowingUserId] = useState(null);

  const navigation = useNavigation();

  const navigateToProfile = userId => {
    if (!userId) {
      setGetError('User ID is undefined');
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
  following: firestore.FieldValue.arrayUnion({
    uid: targetUserId,
    displayName: targetUser.displayName || '',
    lastName: targetUser.lastName || '',
    profileImage: targetUser.profileImage || '',
    timestamp: firestore.Timestamp.now(),
  }),
});

    batch.update(targetUserRef, {
      followers: firestore.FieldValue.arrayUnion({
        uid: currentUserId,
        displayName,
        lastName,
        profileImage,
        timestamp: firestore.Timestamp.now(),
      }),
    });

    await batch.commit();
    await firestore().collection('notifications').add({
      recipientId: targetUserId,
      type: 'new_follower',
      followerId: currentUserId,
      displayName,
      lastName,
      profileImage,
      timestamp: firestore.Timestamp.now(),
      read: false,
    });

    Alert.alert('Success', 'User followed successfully!');
    setGetError('Followed! Relaunch the app to see new content.');
    navigation.navigate('UserProfileScreen', { uid: targetUserId });
  } catch (error) {
    console.error('Error following user:', error);
    Alert.alert('Error', 'Could not follow user.');
    setGetError('Error following user.');
  } finally {
    setFollowingUserId(null);
  }
};


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const snapshot = await firestore()
          .collection('profileUpdate')
          .orderBy('updatedAt', 'desc')
          .limit(50)
          .get();

        const users = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUserList(users);
      } catch (error) {
        console.error('Error fetching users:', error);
        setGetError('Error fetching user list.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

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
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={themedStyles.NotificationContainer}>
              {/* same follow user view */}
              <TouchableOpacity
                onPress={() => navigateToProfile(item.uid)}
                style={{ flexDirection: 'row', alignItems: 'center' }}
              >
                <Image
                  // source={{uri: item.profileImage || 'https://placehold.co/50'}}
                  source={
                    item.profileImage
                      ? { uri: item.profileImage }
                      : require('../assets/thumblogo.png')
                  }
                  style={themedStyles.image}
                />
                <Text style={themedStyles.displayName}>
                  {item.displayName || ''}{' '}
                  {truncateString(item.lastName || '', 15)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => followUser(uid, item)}
                disabled={followingUserId === item.uid}
                style={themedStyles.followbackBtn}
              >
                <Text style={themedStyles.followbackText}>
                  {followingUserId === item.uid ? 'Following...' : 'Follow'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
      {!!getError && (
        <View style={{ backgroundColor: '#fee', padding: 10, borderRadius: 5 }}>
          <Text style={{ color: 'red' }}>{getError}</Text>
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
      width: 50,
      height: 50,
      borderRadius: 25,
    },
    displayName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme === 'dark' ? '#fff' : '#121212',
      marginLeft: 10,
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
