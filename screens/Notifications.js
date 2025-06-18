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
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Timestamp } from '@react-native-firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DarkMode from '../components/Theme/DarkMode';

const Notifications = () => {
    const theme = DarkMode();
  const user = auth().currentUser;
  const uid = user?.uid;
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  const navigation = useNavigation();

  // Fetch the user's profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (uid) {
        try {
          const profileSnapshot = await firestore()
            .collection('profileUpdate')
            .doc(uid)
            .get();

          if (profileSnapshot.exists) {
            setProfileData(profileSnapshot.data());
          }
        } catch (error) {
          console.error('Error fetching profile data:', error);
        }
      }
    };

    fetchProfileData();
  }, [uid]);

  const navigateToProfile = (userId) => {
    if (!userId) {
      console.error('User ID is undefined');
      return;
    }
    navigation.dispatch(
      CommonActions.navigate({
        name: 'UserProfileScreen',
        params: { uid: userId },
      })
    );
  };

  // Fetch followers data
  useEffect(() => {
    const fetchFollowers = async (userId) => {
      try {
        const userRef = firestore().collection('users').doc(userId);
        const userDoc = await userRef.get();
        return userDoc.exists ? userDoc.data().followers || [] : [];
       } catch (error) {
        console.error('Error fetching followers:', error);
        return [];
      }
    };

    const fetchAndSetFollowers = async () => {
      if (uid) {
        const followersList = await fetchFollowers(uid);
        setFollowers(followersList);
        setLoading(false);
        setIsFollowing(true);

      }
    };

    fetchAndSetFollowers();
  }, [uid]);

  // Follow user back functionality
  const followUser = async (currentUserId, targetUserId) => {
    if (!currentUserId || !targetUserId) return;
    try {
      const batch = firestore().batch();
      const currentUserRef = firestore().collection('users').doc(currentUserId);
      const targetUserRef = firestore().collection('users').doc(targetUserId);

      const { displayName, lastName, profileImage } = profileData;
      batch.update(currentUserRef, {
        following: firestore.FieldValue.arrayUnion(targetUserId),
      });

      batch.update(targetUserRef, {
        followers: firestore.FieldValue.arrayUnion({
          displayName: displayName,
          lastName: lastName,
          profileImage: profileImage,
          uid: currentUserId,
          timestamp: Timestamp.now(),
        }),
      });

      await batch.commit();
      Alert.alert('User followed back successfully!');
     } catch (error) {
      console.error('Error following back:', error);
    }
  };

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
      ) : followers.length > 0 ? (
        <FlatList
          data={followers}
          keyExtractor={(item, index) => `${item.uid}-${index}`}
          renderItem={({ item }) => (
            <View style={styles(theme).NotificationContainer}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => navigateToProfile(item.uid)}>
                  <Image
                    source={{ uri: item.profileImage}}
                    style={styles(theme).image}
                  />
                </TouchableOpacity>
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles(theme).displayName}>
                    {item.displayName} {item.lastName}
                  </Text>
                  <Text style={styles(theme).alert}>New follower</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => followUser(uid, item.uid)}>
                <Text style={styles(theme).followback}>
                  {/* Follow back */}

                {item.isFollowing ? 'Unfollow' : 'Follow'}
                  </Text>

              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <Text style={styles(theme).noFollowing}>No followers yet</Text>
      )}
    </View>
  );
};

export default Notifications;

const styles = theme => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    padding: 10,
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
    fontWeight: 'bold',
    fontSize: 16,
    color: theme === 'dark' ? '#fff' : '#121212',
  },
  alert: {
    color: theme === 'dark' ? '#f5f5f5' : '#121212',
  },
  followback: {
    backgroundColor: 'orangered',
    padding: 10,
    borderRadius: 5,
    color: theme === 'dark' ? '#fff' : '#fff',
    fontWeight: 'bold',
  },
  noFollowing: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
  header: {
    // marginTop: Platform.OS === 'ios' ? -9 : 10,
    backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    marginLeft: 1,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  texth1: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme === 'dark' ? '#fff' : '#121212',
    marginLeft: 50,
  },
});