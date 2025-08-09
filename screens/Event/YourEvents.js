/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-unused-vars */
import {
  Appearance,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import Divider from '../../components/Divider';
import { truncateString } from '../../components/TextShortner';
import { auth, firestore } from '../../data/Firebase';
const YourEvents = () => {
  const [theme, setTheme] = useState(Appearance.getColorScheme());

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme);
    });

    return () => {
      subscription.remove();
    };
  }, []);
  const user = auth().currentUser;
  const uid = user?.uid;
  const navigation = useNavigation();
  const [getUserEvents, setGetUserEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState([]);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState(null);
  // Get user's events

  useEffect(() => {
    const HandleGetUserEvents = () => {
      //  const user = auth().currentUser;

      if (user) {
        const unsubscribe = firestore()
          .collection('events')
          .where('uid', '==', user.uid)
          .onSnapshot(snapshot => {
            if (snapshot.empty) {
              setGetUserEvents([]);
              setLoading(false);
              return;
            }
            const events = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            }));
            setGetUserEvents(events);
            setLoading(false);
          });
        return () => unsubscribe();
      }
    };
    HandleGetUserEvents();
  }, [user]);

  const deletePost = async postId => {
    try {
      await firestore().collection('events').doc(postId).delete();
      setUserData(prevData => prevData.filter(post => post.id !== postId));
      setDeleteModalVisible(false);
    } catch (error) {
      console.error('Error deleting post: ', error);
    }
  };

  const openDeleteModal = postId => {
    setPostIdToDelete(postId);
    setDeleteModalVisible(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalVisible(false);
    setPostIdToDelete(null);
  };

  const renderEvent = ({ item: event }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('eventdetails', { id: event.id })}
      style={styles(theme).eventCard}
    >
      <View style={styles(theme).eventDetails}>
        <View style={{ flexDirection: 'row' }}>
          <Image
            source={{ uri: event.eventImage }}
            style={styles(theme).eventImage}
          />
          <View>
            <Text style={styles(theme).eventTitle}>
              {truncateString(event.eventName, 23)}
            </Text>
            <Text style={styles(theme).eventDate}>
              {event.eventDate} at {event.eventTime}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => openDeleteModal(event.id)}>
          <Ionicons
            name="ellipsis-vertical-outline"
            color={theme === 'dark' ? '#fff' : '#121212'}
            size={25}
          />
        </TouchableOpacity>
      </View>
      <Text style={styles(theme).eventDescription}>
        {truncateString(event.eventDescription, 300)}
      </Text>
      <Divider style={styles(theme).divider} />
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
                      source={
                        userInfo.profileImage
                          ? { uri: userInfo.profileImage }
                          : require('../../assets/thumblogo.png')
                      }
                      style={styles(theme).userImage}
                    />
                  ))}
              </View>
              {event.eventInterestedUsers.length > 3 && (
                <Text style={styles(theme).moreJoined}>
                  +{event.eventInterestedUsers.length - 3}
                </Text>
              )}
            </>
          ) : (
            <Text>No one has joined yet.</Text>
          )}
          <Text style={{ color: theme === 'dark' ? '#fff' : '#121212' }}>
            {event.eventInterestedUsers?.length || 0} Joined
          </Text>
        </View>
        {/* <TouchableOpacity
          style={styles.interestedButton}
          onPress={() => handleInterestedClick(event.id)}
          >
          <Ionicons name="star" size={15} color={'#ff6347'} />
          <Text style={styles.interestedText}>Interested</Text>
        </TouchableOpacity> */}
      </View>

      {/* Delete event */}

      <Modal
        animationType="slide"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={closeDeleteModal}
      >
        <View style={styles(theme).modalContainer}>
          <View style={styles(theme).modalContent}>
            <Text style={{ color: theme === 'dark' ? '#fff' : '#000' }}>
              Are you sure you want to delete this event?
            </Text>
            <View style={styles(theme).modalButtons}>
              <TouchableOpacity
                style={styles(theme).modalButton}
                onPress={closeDeleteModal}
              >
                <Text
                  style={{
                    color: theme === 'dark' ? '#fff' : '#5b5b5b',
                    textAlign: 'center',
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles(theme).modalButtonRed}
                onPress={() => deletePost(postIdToDelete)}
              >
                <Text
                  style={{
                    color: '#fff',
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                >
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </TouchableOpacity>
  );

  return (
    <View style={styles(theme).youreventsContainer}>
      <View style={styles(theme).arrowBack}>
        <View style={styles(theme).header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons
              name="chevron-back-outline"
              color={theme === 'dark' ? '#fff' : '#121212'}
              size={25}
            />
          </TouchableOpacity>

          <Text style={styles(theme).texth1}>Your events</Text>
        </View>
        {/* <Divider/> */}
      </View>
      <FlatList
        data={getUserEvents}
        renderItem={renderEvent}
        keyExtractor={item => item.id.toString()}
        //  onEndReached={handleLoadMore}
        //  onEndReachedThreshold={0.5}
        style={styles(theme).FlatList}
      />
    </View>
  );
};

export default YourEvents;

const styles = theme =>
  StyleSheet.create({
    youreventsContainer: {
      flex: 1,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    },
    arrowBack: {
      margin: 10,
    },
    header: {
      // marginTop: Platform.OS === 'ios' ? -9 : 10,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      // height: 50,
    },
    texth1: {
      fontSize: 18,
      fontWeight: 'bold',
      marginLeft: 10,
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    // Event card

    eventCard: {
      margin: 10,
      padding: 15,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
      borderRadius: 10,
      shadowColor: theme === 'dark' ? '#fff' : '#121212',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },
    eventDetails: {
      flexDirection: 'row',
      // alignItems: 'center',
      // marginBottom: 10,
      justifyContent: 'space-between',
    },
    eventImage: {
      width: 40,
      height: 40,
      borderRadius: 30,
      marginRight: 15,
    },
    eventTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme === 'dark' ? '#fff' : '#121212',
      // width: '50%',
      // marginBottom: 5,
    },
    eventDate: {
      fontSize: 12,
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
      color: theme === 'dark' ? '#fff' : '#121212',
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
      width: 30,
      height: 30,
      borderRadius: 20,
      marginLeft: -10, // Overlapping effect
      borderWidth: 2,
      borderColor: '#fff',
      marginTop: 10,
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
      backgroundColor: '#ffefeb',
      borderRadius: 20,
      marginTop: 5,
      marginLeft: 5,
    },
    interestedText: {
      marginLeft: 5,
      fontSize: 16,
      color: '#ff6347',
    },
    FlatList: {
      marginBottom: 10,
    },

    // Modal

    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)',
    },
    modalContent: {
      width: 300,
      padding: 20,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
      borderRadius: 10,
      alignItems: 'center',
    },
    modalButtons: {
      flexDirection: 'row',
      marginTop: 20,
      justifyContent: 'space-between',
      gap: 10,
    },
    modalButton: {
      padding: 7,
      borderRadius: 7,
      width: 100,
      borderWidth: 1,
      borderColor: theme === 'dark' ? '#ccc' : '#5b5b5b',
    },
    modalButtonRed: {
      backgroundColor: 'red',
      padding: 7,
      borderRadius: 7,
      width: 100,
    },
  });
