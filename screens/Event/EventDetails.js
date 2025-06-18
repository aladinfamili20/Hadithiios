/* eslint-disable curly */
/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-dupe-keys */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
  Appearance,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
 import DarkMode from '../../components/Theme/DarkMode';
import { useUser } from '../../data/Collections/FetchUserData';
import { truncateString } from '../../components/TextShortner';
 const EventDetails = () => {
  const theme = DarkMode();
  const route = useRoute();
  const navigation = useNavigation();
  const {id} = route.params; // Event ID passed through navigation
  const user = auth().currentUser;
  const uid = user?.uid;

  const [eventDetails, setEventDetails] = useState(null);
  const {userData} = useUser();
  const [loading, setLoading] = useState(true);

  // Fetch event details
  useEffect(() => {
    const unsubscribe = firestore()
      .collection('events')
      .doc(id)
      .onSnapshot(doc => {
        if (doc.exists) {
          // console.log('Event Details Updated:', doc.data());
          setEventDetails(doc.data());
          setLoading(false);
        }
      });

    return () => unsubscribe();
  }, [id]);

  const renderInterestedUsers = () => {
    const users = eventDetails?.eventInterestedUsers || [];
    if (!users.length) return <Text>No one has joined yet.</Text>;
    return (
      <View style={styles(theme).peopleContainer}>
        <View style={styles(theme).joinedImages}>
          {users.slice(0, 3).map((user, index) => (
            <Image
              key={index}
              source={{uri: user.profileImage || 'https://via.placeholder.com/50'}}
              style={styles(theme).userImage}
            />
          ))}
        </View>
        {users.length > 3 && (
          <Text style={styles(theme).moreJoined}>+{users.length - 3}</Text>
        )}
      </View>
    );
  };


  const InterestedHandler = async eventId => {
    if (!userData) {
      Alert.alert('Error', 'User profile not available.');
      return;
    }

    const {displayName, lastName, profileImage} = userData;
    const today = new Date();
    const date = today.toDateString();
    const time = today.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    try {
      await firestore()
        .collection('events')
        .doc(eventId)
        .update({
          eventInterestedUsers: firestore.FieldValue.arrayUnion({
            date,
            time,
            displayName,
            lastName,
            profileImage,
            uid,
          }),
        });
      Alert.alert('Success', 'Marked as interested successfully!');

      // Refetch event details to update state
      const eventDoc = await firestore()
        .collection('events')
        .doc(eventId)
        .get();
      if (eventDoc.exists) {
        setEventDetails(eventDoc.data());
      }
    } catch (error) {
      console.error('Error adding interested user:', error);
      Alert.alert('Error', 'Failed to mark as interested.');
    }
  };

  // console.log('Event Details:', eventDetails);
  // console.log('Interested Users:', eventDetails.eventInterestedUsers);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff0330" />
        <Text style={styles(theme).loading}>Loading event details...</Text>
      </View>
    );
  }

  if (!eventDetails) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Event not found.</Text>
      </View>
    );
  }

  const {
    eventImage,
    eventName,
    eventDate,
    eventTime,
    displayName,
    lastName,
    eventWebsite,
    eventDescription,
  } = eventDetails;

  // if (eventDetails.eventInterestedUsers?.some(u => u.uid === uid)) {
  //   Alert.alert('Info', 'You are already marked as interested.');
  //   return;
  // }

  return (
   <ScrollView style={styles(theme).container}>
  <ImageBackground
    source={{uri: eventImage}}
    style={styles(theme).eventImage}
    resizeMode="cover">
    <TouchableOpacity
      style={styles(theme).backButton}
      onPress={() => navigation.navigate('event')}>
      <Ionicons
        name="chevron-back-outline"
        size={25}
        color={theme === 'dark' ? '#121212' : '#fff'}
      />
    </TouchableOpacity>
  </ImageBackground>

  <View style={styles(theme).eventDetsCon}>
    <Text style={styles(theme).title}>{truncateString(eventName)}</Text>

    <View style={styles(theme).detailRow}>
      <Ionicons
        name="calendar-outline"
        size={22}
        color={theme === 'dark' ? '#fff' : '#5b5b5b'}
      />
      <Text style={styles(theme).detailText}>{eventDate}</Text>
    </View>

    <View style={styles(theme).detailRow}>
      <Ionicons
        name="time-outline"
        size={22}
        color={theme === 'dark' ? '#fff' : '#5b5b5b'}
      />
      <Text style={styles(theme).detailText}>{eventTime}</Text>
    </View>

    <View style={styles(theme).detailRow}>
      <Ionicons
        name="person-outline"
        size={22}
        color={theme === 'dark' ? '#fff' : '#5b5b5b'}
      />
      <Text style={styles(theme).detailText}>Event by: {displayName} {lastName}</Text>
    </View>

    <View style={styles(theme).detailRow}>
      <Ionicons
        name="earth-outline"
        size={22}
        color={theme === 'dark' ? '#fff' : '#5b5b5b'}
      />
      <TouchableOpacity onPress={() => Linking.openURL(eventWebsite)}>
        <Text style={styles(theme).link}>{eventWebsite}</Text>
      </TouchableOpacity>
    </View>

    <View style={styles(theme).detailRow}>
      <Ionicons
        name="people-outline"
        size={22}
        color={theme === 'dark' ? '#fff' : '#5b5b5b'}
      />
      {eventDetails.eventInterestedUsers?.length > 0 ? (
        <View style={styles(theme).interestedWrapper}>
          <View style={styles(theme).joinedImages}>
            {eventDetails.eventInterestedUsers.slice(0, 3).map((user, index) => (
              <Image
                key={index}
                source={{uri: user.profileImage}}
                style={styles(theme).userImage}
              />
            ))}
          </View>
          {eventDetails.eventInterestedUsers.length > 3 && (
            <Text style={styles(theme).moreJoined}>
              +{eventDetails.eventInterestedUsers.length - 3}
            </Text>
          )}
        </View>
      ) : (
        <Text style={styles(theme).detailText}>No one has joined yet.</Text>
      )}
    </View>

    <Text style={styles(theme).sectionTitle}>What to expect</Text>
    <Text style={styles(theme).description}>{eventDescription}</Text>

    <TouchableOpacity
      style={styles(theme).button}
      onPress={() => InterestedHandler(id)}>
      <Text style={styles(theme).buttonText}>Mark as Interested</Text>
    </TouchableOpacity>
  </View>
</ScrollView>

  );
};

export default EventDetails;


export const styles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    },
    eventImage: {
      width: '100%',
      height: 220,
      justifyContent: 'flex-start',
    },
    backButton: {
      padding: 12,
    },
    eventDetsCon: {
      padding: 20,
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme === 'dark' ? '#fff' : '#121212',
      marginBottom: 16,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 12,
    },
    detailText: {
      fontSize: 15,
      color: theme === 'dark' ? '#ccc' : '#5b5b5b',
    },
    link: {
      color: 'tomato',
      textDecorationLine: 'underline',
      fontSize: 15,
    },
    joinedImages: {
      flexDirection: 'row',
      gap: -10,
    },
    userImage: {
      width: 30,
      height: 30,
      borderRadius: 15,
      marginRight: -10,
      borderWidth: 1,
      borderColor: '#fff',
    },
    moreJoined: {
      marginLeft: 10,
      fontSize: 14,
      color: theme === 'dark' ? '#ccc' : '#5b5b5b',
    },
    interestedWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginTop: 20,
      marginBottom: 8,
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    description: {
      fontSize: 15,
      lineHeight: 22,
      color: theme === 'dark' ? '#ccc' : '#444',
      marginBottom: 20,
    },
    button: {
      backgroundColor: 'tomato',
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 10,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
