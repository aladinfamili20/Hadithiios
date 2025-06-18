/* eslint-disable react-native/no-inline-styles */
import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import { truncateString } from '../../components/TextShortner';
import Divider from '../../components/Divider';
import DarkMode from '../../components/Theme/DarkMode';
import { auth, firestore } from '../../data/Firebase';
 const BATCH_SIZE = 10; // Number of posts to fetch per batch

const Event = () => {
  const theme = DarkMode();
  const user = auth().currentUser;
  const uid = user?.uid;
  const navigation = useNavigation();
  const [postData, setPostData] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const [fetchingMore, setFetchingMore] = useState(false);

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

  const fetchFollowedPosts = useCallback(
    async (isInitialLoad = false) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userDoc = await firestore().collection('users').doc(uid).get();
        const userData = userDoc.data();
        const following = userData?.following || [];

        if (following.length === 0) {
          setPostData([]);
          setLoading(false);
          return;
        }

        let query = firestore()
          .collection('events')
          .where('uid', 'in', following)
          .orderBy('createdAt', 'desc')
          .limit(BATCH_SIZE);

        if (!isInitialLoad && lastVisible) {
          query = query.startAfter(lastVisible);
        }

        const snapshot = await query.get();
        const posts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (isInitialLoad) {
          setPostData(posts);
        } else {
          setPostData(prevPosts => [...prevPosts, ...posts]);
        }

        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        setLoading(false);
        setFetchingMore(false);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setLoading(false);
      }
    },
    [user, uid, lastVisible],
  );

  useEffect(() => {
    fetchFollowedPosts(true);
  }, [fetchFollowedPosts]);

  const handleLoadMore = () => {
    if (fetchingMore || !lastVisible) {
      return;
    }
    setFetchingMore(true);
    fetchFollowedPosts(false);
  };

  const handleInterestedClick = async eventId => {
    if (!profileData) {
      console.error('Profile data not available.');
      return;
    }

    const today = new Date();
    const date = today.toDateString();
    const time = today.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    try {
      const {displayName, lastName, profileImage} = profileData;
      const postRef = firestore().collection('events').doc(eventId);
      await postRef.update({
        eventInterestedUsers: firestore.FieldValue.arrayUnion({
          date,
          time,
          displayName,
          profileImage,
          lastName,
          uid,
        }),
      });
      console.log('Marked as interested successfully.');
    } catch (error) {
      console.error('Error updating interested user:', error);
    }
  };

  // rendering events
  const renderEvent = ({item: event}) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('eventdetails', {id: event.id})}
      style={styles(theme).eventCard}>
      <View style={styles(theme).eventDetails}>
        <Image
          source={{uri: event.eventImage}}
          style={styles(theme).eventImage}
        />
        <View>
          <Text style={styles(theme).eventTitle}>{truncateString(event.eventName,20)}</Text>
          <Text style={styles(theme).eventDate}>
            {event.eventDate} at {event.eventTime}
          </Text>
        </View>
      </View>
      <Text style={styles(theme).eventDescription}>
        {truncateString(event.eventDescription, 300)}
      </Text>
      <Divider style={styles.divider} />
      <View style={styles(theme).peopleJoined}>
        <View style={styles(theme).peopleContainer}>
          {event.eventInterestedUsers?.length > 0 ? (
            <>
              <View style={styles(theme).joinedImages}>
                {event.eventInterestedUsers
                  .slice(0, 3)
                  .map((userInfo, index) => (
                    <Image
                      key={index}
                      source={{
                        uri:
                          userInfo.profileImage ||
                          'https://via.placeholder.com/50',
                      }}
                      style={styles(theme).userImage}
                    />
                  ))}
              </View>
              {event.eventInterestedUsers.length > 3 && (
                <Text style={styles.moreJoined}>
                  +{event.eventInterestedUsers.length - 3}
                </Text>
              )}
            </>
          ) : (
            <Text style={{color: theme === 'dark' ? '#fff' : '#5b5b5b'}}>
              No one has joined yet.{' '}
            </Text>
          )}
          <Text style={{color: theme === 'dark' ? '#fff' : '#5b5b5b'}}>
            {event.eventInterestedUsers?.length || 0} Joined
          </Text>
        </View>
        <TouchableOpacity
          style={styles(theme).interestedButton}
          onPress={() => handleInterestedClick(event.id)}>
          <Ionicons name="star" size={15} color={'#ff6347'} />
          <Text style={styles(theme).interestedText}>Interested</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles(theme).loadingContainer}>
        <ActivityIndicator size="large" color="#ff0330" />
        <Text style={{color: theme === 'dark' ? '#fff' : '#121212', textAlign: 'center'}}>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={styles(theme).eventContainer}>
      <View style={styles(theme).eventContent}>
        <View style={styles(theme).header}>
          <TouchableOpacity onPress={() => navigation.navigate('feed')}>
            <Ionicons
              name="chevron-back-outline"
              color={theme === 'dark' ? '#fff' : '#121212'}
              size={25}
            />
          </TouchableOpacity>

          <Text style={styles(theme).texth1}>Events</Text>

          <View style={styles(theme).headerIcons}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Searchevents')}>
              <Ionicons
                name="search-outline"
                color={theme === 'dark' ? '#fff' : '#121212'}
                size={25}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Upload event')}>
              <Ionicons
                name="add-circle-outline"
                color={theme === 'dark' ? '#fff' : '#121212'}
                size={25}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Your events')}>
              <Ionicons
                name="calendar-outline"
                color={theme === 'dark' ? '#fff' : '#121212'}
                size={25}
              />
            </TouchableOpacity>
          </View>
        </View>
        {/* <Divider /> */}

        {postData.length === 0 ? (
          // eslint-disable-next-line react-native/no-inline-styles
          <Text style={styles(theme).noJoined}>
            No event(s) yet.
          </Text>
        ) : (
          <FlatList
            data={postData}
            renderItem={renderEvent}
            keyExtractor={item => item.id.toString()}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            style={styles(theme).FlatList}
          />
        )}
      </View>
    </View>
  );
};

export default Event;

const styles = theme =>
  StyleSheet.create({
    eventContainer: {
      flex: 1,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    },
    eventContent: {
      margin: 10,
    },
    header: {
      // marginTop: Platform.OS === 'ios' ? -9 : 10,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 50,
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
    },

    // Event Card
    eventCard: {
      margin: 10,
      padding: 15,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
      borderRadius: 10,
      shadowColor: theme === 'dark' ? '#fff' : '#121212',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },
    eventDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    eventImage: {
      width: 60,
      height: 60,
      borderRadius: 30,
      marginRight: 15,
    },
    eventTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme === 'dark' ? '#fff' : '#121212',
      marginBottom: 5,
      width: '100%',
    },
    eventDate: {
      fontSize: 14,
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    eventDescription: {
      fontSize: 14,
      color: theme === 'dark' ? '#fff' : '#121212',
      marginVertical: 10,
    },
    divider: {
      height: 1,
      backgroundColor: '#ddd',
      marginVertical: 10,
    },
    peopleJoined: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    peopleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    joinedImages: {
      flexDirection: 'row',
      marginRight: 10,
    },
    userImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginLeft: -10, // Overlapping effect
      borderWidth: 2,
      borderColor: theme === 'dark' ? '#121212' : '#fff',
    },
    moreJoined: {
      fontSize: 14,
      color: theme === 'dark' ? '#fff' : '#121212',
      marginLeft: 5,
    },
    interestedButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
      borderRadius: 20,
      marginTop: 5,
      marginLeft: 5,
    },
    interestedText: {
      marginLeft: 5,
      fontSize: 15,
      color: '#ff6347',
    },
    FlatList: {
      marginBottom: 10,
    },
    noJoined: {
      color: theme === 'dark' ? '#fff' : '#121212',
      textAlign: 'center',
    },
    loadingContainer:{
    flex:1,
    justifyContent: 'center',
    backgroundColor:  theme === 'dark' ? '#121212' : '#fff',
    },
  });