/* eslint-disable react-native/no-inline-styles */
/* eslint-disable curly */
import React, {useEffect, useState} from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import {CommonActions, useNavigation} from '@react-navigation/native';
import firestore, {Timestamp} from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import DarkMode from '../components/Theme/DarkMode';
import {useUser} from '../data/Collections/FetchUserData';

const FollowUsers = () => {
  const theme = DarkMode();
  const user = auth().currentUser;
  const {userData} = useUser();
  const uid = user?.uid;

  const [loading, setLoading] = useState(true);
   const [postData, setPostData] = useState([]);
  const [getError, setGetError] = useState('');

  const navigation = useNavigation();
 

  const navigateToProfile = userId => {
    if (!userId) {
      setGetError('User ID is undefined');
      return;
    }

    navigation.dispatch(
      CommonActions.navigate({
        name: 'UserProfileScreen',
        params: {uid: userId},
      }),
    );
  };

  const followUser = async (currentUserId, targetUserId) => {
    if (!currentUserId || !targetUserId) return;

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
          displayName,
          lastName,
          profileImage,
           timestamp: Timestamp.now(),
        }),
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

      await firestore().collection('notifications').add({
        recipientId: targetUserId,
        type: 'new_follower',
        followerId: currentUserId,
        displayName,
        lastName,
        profileImage,
        timestamp: Timestamp.now(),
        read: false,
      });

      Alert.alert('Success', 'User followed successfully!');
      setGetError('Followed! Relaunch the app to see new content.');
      navigation.navigate('profile');
    } catch (error) {
      console.error('Error following user:', error);
      Alert.alert('Error', 'Could not follow user.');
      setGetError('Error following user.');
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const snapshot = await firestore()
          .collection('profileUpdate')
          .orderBy('updatedAt', 'desc')
          .get();

        const users = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPostData(users);
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

  return (
    <View style={themedStyles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="tomato" />
      ) : (
        postData.map(follow => (
          <View style={themedStyles.NotificationContainer} key={follow.id}>
            <TouchableOpacity
              onPress={() => navigateToProfile(follow.uid)}
              style={{flexDirection: 'row', alignItems: 'center'}}>
              <Image
                // source={{uri: follow.profileImage || 'https://placehold.co/50'}}
                source={follow.profileImage ? {uri: follow.profileImage}   : require('../assets/thumblogo.png')}

                style={themedStyles.image}
              />
              <Text style={themedStyles.displayName}>
                {follow.displayName || ''}{' '}
                {truncateString(follow.lastName || '', 15)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => followUser(uid, follow.uid)}
              style={themedStyles.followbackBtn}>
              <Text style={themedStyles.followbackText}>Follow</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
      {!!getError && <Text style={{color: 'red', marginTop: 10}}>{getError}</Text>}
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
