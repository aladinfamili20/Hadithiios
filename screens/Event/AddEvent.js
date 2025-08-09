import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-modern-datepicker';
import ImageCropPicker from 'react-native-image-crop-picker';
import { useNavigation } from '@react-navigation/native';
import { getApp } from '@react-native-firebase/app';
import {
  addDoc,
  collection,
  getFirestore,
  Timestamp,
} from '@react-native-firebase/firestore';
import { auth, storage } from '../../data/Firebase';
import DarkMode from '../../components/Theme/DarkMode';
import { useUser } from '../../data/Collections/FetchUserData';

const AddEvent = () => {
  const user = auth().currentUser;
  const uid = user?.uid;
  const theme = DarkMode();
  const [eventName, setEventName] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [openInPersonModal, setOpenInPersonModal] = useState(false);
  const [openVirtualModal, setOpenVirtualModal] = useState(false);
  const [eventDescription, setEventDescription] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventVirtualLink, setEventVirtualLink] = useState('');
  const [eventWebsite, setEventWebsite] = useState('');
  const [eventImage, setEventImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [getError, setGetError] = useState('');
  const { userData } = useUser();
  const navigation = useNavigation();

  const handleDateChange = profDate => {
    setEventDate(profDate); // profDate should be the selected date string.
    // console.log("Selected Date: ", profDate);
  };

  const eventThumbnail =
    'https://images.unsplash.com/photo-1605302977593-fe0329b1effd?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

  // pick image from device to upload
  const uploadEventImage = async () => {
    try {
      const image = await ImageCropPicker.openPicker({
        width: 300,
        height: 400,
        cropping: false,
      });
      console.log('Selected Image Path:', image.path); // Debugging
      setEventImage(image.path);
    } catch (error) {
      console.error('Error picking background image:', error);
      Alert.alert('Error picking background image:', error);
    }
  };
 
  // Upload the post image
  const uploadImage = async () => {
    if (!eventImage) {
      return null;
    }

    const uniqueName = `eventImage/${Date.now()}_${uid}.jpg`;
    const storageRef = storage().ref(uniqueName);

    try {
      await storageRef.putFile(eventImage); // more reliable with file paths
      const url = await storageRef.getDownloadURL();
      return url;
    } catch (error) {
      console.error('Error uploading image:', error);
      //         Alert.alert('Upload Error', error.message || 'Failed to upload the image.')
      setGetError('Error uploading image:');
      return null;
    }
  };

  // Upload event to firebase
  const db = getFirestore(getApp());

  const handleUploadEvent = async () => {
    if (!user) {
      // Alert.alert('Error', 'User is not authenticated.');
      setGetError('Error', 'User is not authenticated.');
      return;
    }

    if (!eventImage) {
      // Alert.alert('Missing Image', 'Please select an image for your event.');
      setGetError('Missing Image', 'Please select an image for your event.');
      return;
    }

    if (!eventDate) {
      // Alert.alert('Missing Date', 'Please select a date for your event.');
      setGetError('Missing Date', 'Please select a date for your event.');
      return;
    }

    setLoading(true);

    try {
      const uploadEventImg = await uploadImage();
      if (!uploadEventImg) {
        setLoading(false);
        return;
      }

      const { displayName, profileImage, lastName } = userData || {};
      if (!userData || !displayName || !profileImage || !lastName) {
        // Alert.alert('Profile Incomplete', 'Please complete your profile to create an event.');
        setGetError(
          'Profile Incomplete',
          'Please complete your profile to create an event.',
        );
        setLoading(false);
        return;
      }

      if (!eventName || !eventTime || !eventDate || !eventDescription) {
        // Alert.alert('Incomplete Form', 'Please fill out all the required fields.');
        setGetError(
          'Incomplete Form',
          'Please fill out all the required fields.',
        );
        setLoading(false);
        return;
      }

      const today = new Date();
      const date = today.toDateString();
      const time = today.toLocaleTimeString();

      const eventRef = {
        eventImage: uploadEventImg,
        eventDate,
        eventDescription,
        eventName,
        eventTime,
        eventVirtualLink,
        eventLocation,
        eventWebsite,
        displayName,
        lastName,
        profileImage,
        uid,
        uploadedDate: date,
        time,
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, 'events'), eventRef);

      // Alert.alert('Success', 'Event created successfully!');
      setGetError('Success', 'Event created successfully!');
      console.log('Success', 'Event created successfully!');
      navigation.navigate('feed');
    } catch (error) {
      console.error('Error uploading event:', error);
      // Alert.alert('Error', 'Failed to create the event. Please try again.');
      setGetError('Error', 'Failed to create the event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (openInPersonModal && openVirtualModal) {
    Alert.alert('Error', 'Cannot select both in-person and virtual options.');
    setGetError('Error', 'Cannot select both in-person and virtual options.');
    return;
  }

  return (
    <View style={styles(theme).AddEventContainer}>
      <ScrollView style={styles(theme).AddEventContents}>
        <View style={styles(theme).topHeader}>
          <View style={styles(theme).topHeaderIcons}>
            <TouchableOpacity onPress={() => navigation.navigate('event')}>
              <Ionicons
                name="chevron-back-outline"
                color={theme === 'dark' ? '#fff' : '#121212'}
                size={25}
                style={styles(theme).leftArrowIcon}
              />
            </TouchableOpacity>

            <Text style={styles(theme).createEvent}>Create event</Text>
          </View>
        </View>
        <View style={styles(theme).imageContainer}>
          <ImageBackground
            source={{ uri: eventImage || eventThumbnail }}
            style={styles(theme).eventThumbnail}
          >
            <TouchableOpacity onPress={() => uploadEventImage()}>
              <Ionicons
                name="add"
                color={'#fff'}
                size={30}
                style={styles(theme).addIcon}
              />
            </TouchableOpacity>
          </ImageBackground>
        </View>

        <View style={styles(theme).eventInputsContainer}>
          <TextInput
            placeholder="Event name"
            onChangeText={text => setEventName(text)}
            value={eventName}
            style={styles(theme).eventInput}
            placeholderTextColor="#888"
          />

          <TextInput
            placeholder="Event time | ex (12:09 AM)"
            onChangeText={text => setEventTime(text)}
            value={eventTime}
            style={styles(theme).eventInput}
            placeholderTextColor="#888"
            //   keyboardType="numaric"
          />
          <TextInput
            placeholder="https://www.example.com"
            onChangeText={text => setEventWebsite(text)}
            value={eventWebsite}
            style={styles(theme).eventInput}
            placeholderTextColor="#888"
            autoCapitalize="none"

          />

          <TextInput
            placeholder="Event description"
            onChangeText={text => setEventDescription(text)}
            value={eventDescription}
            style={styles(theme).eventInput}
            placeholderTextColor="#888"
            multiline
            maxLength={500}
          />

          <TouchableOpacity onPress={() => setOpenInPersonModal(true)}>
            <Text style={styles(theme).button}>In Person</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setOpenVirtualModal(true)}>
            <Text style={styles(theme).button}>Virtual</Text>
          </TouchableOpacity>

          {/* In-Person Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={openInPersonModal}
          >
            <View style={styles(theme).modalContainer}>
              <Text style={styles(theme).modalHeader}>Enter Location</Text>
              <TextInput
                placeholder="Event Location"
                onChangeText={text => setEventLocation(text)}
                value={eventLocation}
                style={styles(theme).eventInput}
                placeholderTextColor="#888"
                // multiline
              />
              <TouchableOpacity onPress={() => setOpenInPersonModal(false)}>
                <Text style={styles(theme).closeButton}>Close</Text>
              </TouchableOpacity>
            </View>
          </Modal>

          {/* Virtual Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={openVirtualModal}
          >
            <View style={styles(theme).modalContainer}>
              <Text style={styles(theme).modalHeader}>Enter Virtual Link</Text>
              <TextInput
                placeholder="Event Link"
                onChangeText={text => setEventVirtualLink(text)}
                value={eventVirtualLink}
                style={styles(theme).eventInput}
                placeholderTextColor="#888"
                autoCapitalize='none'
                // multiline
              />
              <TouchableOpacity onPress={() => setOpenVirtualModal(false)}>
                <Text style={styles(theme).closeButton}>Close</Text>
              </TouchableOpacity>
            </View>
          </Modal>

          <Text style={styles(theme).label}>Pick a Date</Text>
          <DatePicker
            // mode="datepicker"
            modal="calendar"
            locale="en"
            reverse={false}
            isGregorian={true}
            selected={eventDate}
            onSelectedChange={date => handleDateChange(date)}
            style={styles(theme).calendar}
            onDateChange={() => {}}
          />
          {/* <DatePicker
              modal="calendar"
              selected={eventDate.toString()}
              onDateChange={handleDateChange}
              style={styles(theme).calendar}
              value={eventDate}
            /> */}
        </View>

        {loading ? (
          <>
            <View style={styles(theme).loadingContainer}>
              <ActivityIndicator size="large" color="#FF4500" />
              <Text style={styles(theme).uploadingLoadin}>Uploading...</Text>
            </View>
          </>
        ) : (
          <TouchableOpacity onPress={handleUploadEvent} style={styles(theme).submitButton}>
            <Text style={styles(theme).submitButtonText}>Create event</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Text style={styles(theme).getError}>{getError}</Text>
    </View>
  );
};

export default AddEvent;

const styles = theme =>
  StyleSheet.create({
    AddEventContainer: {
      flex: 1,
      backgroundColor: theme === 'dark' ? '#121212' : '#ffff',
     },
     AddEventContents:{
      margin: 10
     },
    imageContainer: {
      position: 'relative',
      width: '100%',
      height: 200,
    },
    createEvent: {
      color: theme === 'dark' ? '#fff' : '#121212',
      fontSize: 20,
      fontWeight: 'bold',
      marginLeft: 20,
    },
    topHeader: {
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
      height: 50,
     },
    topHeaderIcons: {
      // margin: 10,
      flexDirection: 'row',
      alignItems: 'center',
    },
    eventThumbnail: {
      width: '100%',
      height: '100%',
      borderRadius: 10,
      overflow: 'hidden',
      objectFit: 'cover',
    },
    addIcon: {
      width: 40,
      height: 40,
      backgroundColor: '#FF4500',
      justifyContent: 'center',
      alignItems: 'center',
      margin: 20,
      bottom: 10,
      right: 10,
      borderRadius: 20,
      padding: 5,
    },
    eventInputsContainer: {
      marginTop: 20,
     },
    eventInput: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 10,
      height: 50,
      paddingHorizontal: 15,
      fontSize: 16,
      backgroundColor: '#fff',
      marginVertical: 10,
    },
    button: {
      textAlign: 'center',
      backgroundColor: '#007BFF',
      color: theme === 'dark' ? '#fff' : '#121212',
      paddingVertical: 12,
      borderRadius: 10,
      marginVertical: 10,
      fontSize: 16,
    },
    calendar: {
      marginTop: 20,
      alignSelf: 'center',
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
      // color: theme === 'dark' ? '#fff' : '#121212',
      color: '#fff'
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      marginTop: 20,
      marginBottom: 10,
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalHeader: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      color: '#fff',
    },
    closeButton: {
      textAlign: 'center',
      backgroundColor: '#FF4500',
      color: '#fff',
      paddingVertical: 10,
      borderRadius: 10,
      marginTop: 20,
      fontSize: 16,
      width: 100,
    },
    submitButton: {
      backgroundColor: '#FF4500',       
      marginTop: 20,
      marginBottom: 40,
      borderRadius: 10
    },

    submitButtonText:{
      color: '#fff',
      textAlign: 'center',
      fontWeight: 'bold',
      padding: 15,
    },
    getError: {
      textAlign: 'center',
    },
    uploadingLoadin:{
      textAlign: 'center',
      alignItems:'center',
    }
  });
