/* eslint-disable react-native/no-inline-styles */
/* eslint-disable curly */
/* eslint-disable no-catch-shadow */
/* eslint-disable no-shadow */
/* eslint-disable no-trailing-spaces */
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import ImagePicker from 'react-native-image-crop-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DarkMode from '../components/Theme/DarkMode';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const ProfileSetup = () => {
  const theme = DarkMode();
  const user = auth().currentUser;
  const uid = user?.uid;
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const themedStyles = styles(theme, width); // responsive width passed in
  const safeWidth = typeof width === 'number' && !isNaN(width) ? width : 360;

  const [userName, setUserName] = useState('');
  const [backgroundImageBanner, setBackgroundImageBanner] = useState('');
  const [profileEditImage, setProfileEditImage] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const defaultBannerImage =
    'https://images.unsplash.com/photo-1487260211189-670c54da558d?q=80&w=1587';

  const defaultProfileImage =
    'https://images.unsplash.com/photo-1487260211189-670c54da558d?q=80&w=1587';

  const uploadBackImg = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 400,
        cropping: false,
      });
      setBackgroundImageBanner(image.path);
    } catch (error) {
      console.error('Error picking background image:', error);
    }
  };

  const uploadProfImg = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 400,
        cropping: false,
      });
      setProfileEditImage(image.path);
    } catch (error) {
      console.error('Error picking profile image:', error);
    }
  };

  const uploadImage = async (imagePath, folder) => {
    if (!imagePath || !folder) {
      console.error('Missing imagePath or folder.');
      return null;
    }

    const fileName = imagePath.substring(imagePath.lastIndexOf('/') + 1);
    const timestamp = Date.now();
    const storagePath = `${folder}/${timestamp}_${fileName}`;
    const storageRef = storage().ref(storagePath);

    try {
      const response = await fetch(imagePath);
      if (!response.ok) throw new Error('Failed to fetch the image.');

      const blob = await response.blob();
      await storageRef.put(blob);

      const downloadURL = await storageRef.getDownloadURL();
      return downloadURL;
    } catch (error) {
      console.error(`Error uploading image to ${folder}:`, error);
      return null;
    }
  };

  // fetching existing profile data

  useEffect(() => {
    const fetchProfile = async () => {
      if (!uid) return;
      try {
        const docSnap = await firestore()
          .collection('profileUpdate')
          .doc(uid)
          .get();
        const data = docSnap.data();
        if (data) {
          setUserName(data.userName || '');
          setDisplayName(data.displayName || '');
          setLastName(data.lastName || '');
          setBio(data.bio || '');
          setLink(data.link || '');
          setProfileEditImage(data.profileImage || '');
          setBackgroundImageBanner(data.backgroundImage || '');
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      }
    };

    fetchProfile();
  }, [uid]);

  // Save profile

  const handleSaveProfile = async () => {
    if (!uid) return Alert.alert('Error', 'User is not authenticated');

    setLoading(true);
    setError('');

    try {
      const now = firestore.Timestamp.now();
      const today = new Date();
      const date = today.toDateString();
      const Hours = today.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
 
      const dateSignedUp = today.toLocaleDateString();
      const uploadedBannerImage =
        backgroundImageBanner !== defaultBannerImage
          ? await uploadImage(backgroundImageBanner, 'profileBackgrounds')
          : null;

      const uploadedProfileImage =
        profileEditImage !== defaultProfileImage
          ? await uploadImage(profileEditImage, 'profilePictures')
          : null;

      // Dynamically create update data
      const updateData = {
      updatedAt: now,
      date: date,
      Hours: Hours,
      dateSignedUp: dateSignedUp,
      uid: uid,
    };
    

      if (userName) updateData.userName = userName;
      if (displayName) updateData.displayName = displayName;
      if (lastName) updateData.lastName = lastName;
      if (bio) updateData.bio = bio;
      if (link) updateData.link = link;
      if (uploadedBannerImage) updateData.backgroundImage = uploadedBannerImage;
      if (uploadedProfileImage) updateData.profileImage = uploadedProfileImage;

      await firestore()
        .collection('profileUpdate')
        .doc(uid)
        .set(updateData, { merge: true });
 
      setError('Profile updated successfully!');
      navigation.navigate('feed');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
 
  <KeyboardAwareScrollView
   style={styles(theme).container}
    contentContainerStyle={{ paddingBottom: 60 }}
    enableOnAndroid={true}
    extraScrollHeight={Platform.OS === 'ios' ? 100 : 20}
    keyboardShouldPersistTaps="handled"
  >
      
        <ImageBackground
          source={{ uri: backgroundImageBanner || defaultBannerImage }}
          style={themedStyles.bannerImage}
        >
          <View style={themedStyles.headerIcons}>
            <TouchableOpacity
              style={themedStyles.iconButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back-outline" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity onPress={uploadBackImg}>
              <Ionicons name="add" size={24} color="#121212" />
            </TouchableOpacity>
          </View>

          <Image
            source={{ uri: profileEditImage || defaultProfileImage }}
            style={themedStyles.profileImage}
          />
          <TouchableOpacity
            style={themedStyles.editProfileIcon}
            onPress={uploadProfImg}
          >
            <Ionicons name="add" size={24} color="#121212" />
          </TouchableOpacity>
        </ImageBackground>

        <View style={themedStyles.formContainer}>
          <TextInput
            style={themedStyles.input}
            placeholder="First Name"
            value={displayName}
            onChangeText={setDisplayName}
            placeholderTextColor={theme === 'dark' ? '#bbb' : '#888'}
          />
          <TextInput
            style={themedStyles.input}
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
            placeholderTextColor={theme === 'dark' ? '#bbb' : '#888'}
          />
          <TextInput
            style={themedStyles.input}
            placeholder="Username"
            value={userName}
            onChangeText={setUserName}
            placeholderTextColor={theme === 'dark' ? '#bbb' : '#888'}
            autoCapitalize="none"
          />
          <TextInput
            style={themedStyles.input}
            placeholder="Link"
            value={link}
            onChangeText={setLink}
            placeholderTextColor={theme === 'dark' ? '#bbb' : '#888'}
            autoCapitalize="none"
          />
          <TextInput
            style={themedStyles.textArea}
            placeholder="Bio"
            multiline
            value={bio}
            onChangeText={setBio}
            placeholderTextColor={theme === 'dark' ? '#bbb' : '#888'}
          />

          {loading ? (
            <ActivityIndicator size="large" color="tomato" />
          ) : (
            <TouchableOpacity
              style={themedStyles.saveButton}
              onPress={handleSaveProfile}
            >
              <Text style={themedStyles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          )}

          {error && <Text style={themedStyles.errorText}>{error}</Text>}
        </View>
   </KeyboardAwareScrollView>
  );
};

export const styles = (theme, width) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === 'dark' ? '#121212' : '#f8f8f8',
    },
    bannerImage: {
      width: '100%',
      height: 200,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerIcons: {
      position: 'absolute',
      top: 40,
      left: 20,
      right: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      zIndex: 2,
    },
    iconButton: {
      backgroundColor: theme === 'dark' ? '#fff2' : '#0002',
      padding: 8,
      borderRadius: 30,
    },
    profileImage: {
      width: 110,
      height: 110,
      borderRadius: 55,
      borderWidth: 3,
      borderColor: theme === 'dark' ? '#444' : '#fff',
      marginTop: 130,
      alignSelf: 'center',
    },
    editProfileIcon: {
      position: 'absolute',
      right: width / 2 - 55 - 10, // <-- 🔴 Potential NaN
      bottom: -10,
      backgroundColor: '#fff',
      padding: 5,
      borderRadius: 15,
      zIndex: 3,
    },

    formContainer: {
      padding: 20,
      marginTop: 20,
    },
    input: {
      backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
      borderColor: theme === 'dark' ? '#333' : '#ccc',
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      marginBottom: 16,
      color: theme === 'dark' ? '#eee' : '#000',
    },
    textArea: {
      backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
      borderColor: theme === 'dark' ? '#333' : '#ccc',
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      height: 100,
      textAlignVertical: 'top',
      color: theme === 'dark' ? '#eee' : '#000',
      marginBottom: 20,
    },
    saveButton: {
      backgroundColor: '#ff6347',
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    saveButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
    errorText: {
      // color: 'red',
      textAlign: 'center',
      marginTop: 10,
    },
  });
export default ProfileSetup;
