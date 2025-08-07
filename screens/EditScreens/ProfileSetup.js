/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-catch-shadow */
/* eslint-disable no-shadow */
 
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
  Platform,
  KeyboardAvoidingView,
  FlatList,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { CommonActions, useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import ImagePicker from 'react-native-image-crop-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import RNModal from 'react-native-modal';
import DarkMode from '../../components/Theme/DarkMode';
import { useUser } from '../../data/Collections/FetchUserData';
import TaggedUsersList from '../../components/TaggedUsersList';

const ProfileSetup = () => {
  const theme = DarkMode();
  const user = auth().currentUser;
  const uid = user?.uid;
  const { userData } = useUser();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const themedStyles = styles(theme, width); // responsive width passed in
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [userName, setUserName] = useState('');
  const [backgroundImageBanner, setBackgroundImageBanner] = useState('');
  const [profileEditImage, setProfileEditImage] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isTagModalVisible, setIsTagModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [getTagUser, setGetTagUser] = useState(null);
  const [tagUser, setTagUser] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [originalUserName, setOriginalUserName] = useState('');

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
    // const task = storageRef.putFile(storagePath); // This handles local files

    // await task;
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

  useEffect(() => {
    setGetTagUser(userData);
  }, [userData]);

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
          // setUserName(data.userName || '');
          setOriginalUserName(data.userName || ''); // <-- save original
          setUserName(data.userName || ''); // <-- save original
          setDisplayName(data.displayName || '');
          setLastName(data.lastName || '');
          setBio(data.bio || '');
          setLink(data.link || '');
          setProfileEditImage(data.profileImage || '');
          setBackgroundImageBanner(data.backgroundImage || '');
          setTagUser(data.taggedUsers || []);
          setTaggedUsers(data.taggedUsers || []); // needed for saving
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      }
    };

    fetchProfile();
  }, [uid]);



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
        // This fills both:
        setTagUser(data.taggedUsers || []);      // for display
        setTaggedUsers(data.taggedUsers || []);  // for saving/editing
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    }
  };

  fetchProfile();
}, [uid]);




  // Search users for tagging
  const handleSearch = async () => {
    try {
      setIsLoading(true);

      const results = [];
      const displayNameSnapshot = await firestore()
        .collection('profileUpdate')
        .where('displayName', '>=', searchQuery)
        .where('displayName', '<=', searchQuery + '\uf8ff')
        .get();

      const lastNameSnapshot = await firestore()
        .collection('profileUpdate')
        .where('lastName', '>=', searchQuery)
        .where('lastName', '<=', searchQuery + '\uf8ff')
        .get();

      displayNameSnapshot.forEach(doc => {
        results.push({ id: doc.id, ...doc.data() });
      });

      lastNameSnapshot.forEach(doc => {
        const user = { id: doc.id, ...doc.data() };
        if (!results.find(u => u.id === user.id)) {
          results.push(user);
        }
      });

      setSearchResults(results);
      setIsLoading(false);
    } catch (error) {
      console.error('Error searching users:', error);
      setError('Error searching users')
      setIsLoading(false);
    }
  };

  // Utility: Generate a short random ID for username uniqueness
  const generateUniqueId = () => {
    return `_${Math.random().toString(36).substr(2, 6)}`;
  };

 const handleSaveProfile = async () => {
  if (!uid) return Alert.alert('Error', 'User is not authenticated');

  setLoading(true);
  setError('');

  try {
    const now = firestore.Timestamp.now();
    const today = new Date();
    const date = today.toDateString();
    const hours = today.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    const dateSignedUp = today.toLocaleDateString();

    const updateData = {
      updatedAt: now,
      date,
      hours,
      dateSignedUp,
      uid,
    };

    // ✅ Only update username if it changed
    if (userName && userName !== originalUserName) {
      const uniqueUserName = userName + generateUniqueId();
      updateData.userName = uniqueUserName;

        setUserName(uniqueUserName);
  setOriginalUserName(uniqueUserName);
    }
    // if(userName) updateData.userName = uniqueUserName;
    if (displayName) updateData.displayName = displayName;
    if (lastName) updateData.lastName = lastName;
    if (bio) updateData.bio = bio;
    if (link) updateData.link = link;

    const uploadedBannerImage =
      backgroundImageBanner && backgroundImageBanner !== defaultBannerImage
        ? await uploadImage(backgroundImageBanner, 'profileBackgrounds')
        : null;

    const uploadedProfileImage =
      profileEditImage && profileEditImage !== defaultProfileImage
        ? await uploadImage(profileEditImage, 'profilePictures')
        : null;

    if (uploadedBannerImage) updateData.backgroundImage = uploadedBannerImage;
    if (uploadedProfileImage) updateData.profileImage = uploadedProfileImage;

    // if (taggedUsers.length > 0) {
    //   updateData.taggedUsers = taggedUsers.map(user => ({
    //     displayName: user.displayName,
    //     lastName: user.lastName,
    //     uid: user.uid,
    //     taggedAt: firestore.Timestamp.now(),
    //   }));
    // }

    if (taggedUsers.length > 0) {
  updateData.taggedUsers = taggedUsers.map(user => ({
    displayName: user.displayName,
    lastName: user.lastName,
    uid: user.uid,
    profileImage:user.profileImage,
    taggedAt: firestore.Timestamp.now(),
  }));
} else {
  updateData.taggedUsers = []; // <-- include this to fully remove all if cleared
}

    await firestore()
      .collection('profileUpdate')
      .doc(uid)
      .set(updateData, { merge: true });

    setError('');
    navigation.navigate('feed');
  } catch (err) {
    console.error('Error updating profile:', err);
    setError(`Failed to update profile: ${err.message}`);
  } finally {
    setLoading(false);
  }
};

  const debounceRef = useRef(null);

  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      handleSearch();
    }, 400); // debounce time in ms
     
  }, [searchQuery]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const navigateToProfile = userId => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'UserProfileScreen',
        params: { uid: userId },
      }),
    );
  };

  return (
    <KeyboardAwareScrollView
      style={styles(theme).container}
      contentContainerStyle={{ paddingBottom: 60 }}
      enableOnAndroid
      extraScrollHeight={Platform.OS === 'ios' ? 100 : 20}
      keyboardShouldPersistTaps="handled"
    >
      <ImageBackground
        source={
          backgroundImageBanner
            ? { uri: backgroundImageBanner }
            : require('../../assets/thumbpng.png')
        }
        style={themedStyles.bannerImage}
      >
        <View style={themedStyles.headerIcons}>
          <TouchableOpacity
            style={themedStyles.iconButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back-outline" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={uploadBackImg}
            style={themedStyles.iconButton}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <Image
          source={
            profileEditImage
              ? { uri: profileEditImage }
              : require('../../assets/thumblogo.png')
          }
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
          autoCapitalize="none"
          placeholderTextColor={theme === 'dark' ? '#bbb' : '#888'}
        />

        <TextInput
          style={themedStyles.input}
          placeholder="Link"
          value={link}
          onChangeText={setLink}
          autoCapitalize="none"
          placeholderTextColor={theme === 'dark' ? '#bbb' : '#888'}
        />
        <TextInput
          style={themedStyles.textArea}
          placeholder="Bio"
          multiline
          value={bio}
          onChangeText={setBio}
          placeholderTextColor={theme === 'dark' ? '#bbb' : '#888'}
        />

        <Text style={styles(theme).taggedAccountH2}>Tagged accounts</Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {tagUser.map((tag, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => navigateToProfile(tag.uid)}
            >
              <Text style={styles(theme).userTaggedDisplayName}>
                @{tag.displayName}
                {tag.lastName}{' '}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => setIsTagModalVisible(true)}
          style={styles(theme).openTagModalButton}
        >
          <Text style={styles(theme).openTagModalText}>Tag Users</Text>
        </TouchableOpacity>

        {/* Display Tagged Users */}
        <TaggedUsersList
          taggedUsers={taggedUsers}
          setTaggedUsers={setTaggedUsers}
          theme={theme}
          styles={styles}
        />

        {/* Tagging Modal */}
        <RNModal
          isVisible={isTagModalVisible}
          onBackdropPress={() => setIsTagModalVisible(false)}
          style={styles(theme).modal}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
            style={styles(theme).modalContent}
          >
            <Text style={styles(theme).modalTitle}>Tag Users</Text>

            <View style={styles(theme).searchContent}>
              <TextInput
                placeholder="Search users..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles(theme).searchBar}
                placeholderTextColor={theme === 'light' ? '#888' : '#ccc'}
              />
              <TouchableOpacity
                onPress={handleSearch}
                style={{ marginLeft: 8 }}
              >
                <Ionicons
                  name="search-outline"
                  size={24}
                  color={theme === 'light' ? '#000' : '#fff'}
                />
              </TouchableOpacity>
            </View>

            <FlatList
              data={searchResults.slice(0, 10)}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles(theme).searchResultItem}
                  onPress={() => {
                    if (!taggedUsers.find(u => u.id === item.id)) {
                      setTaggedUsers([...taggedUsers, item]);
                    }
                  }}
                >
                  <Image
                    source={{ uri: item.profileImage }}
                    style={styles(theme).tagProfileImage}
                  />
                  <Text style={styles(theme).searchResultText}>
                    {item.displayName} {item.lastName}
                  </Text>
                </TouchableOpacity>
              )}
              style={{ marginTop: 10 }}
            />

            <TouchableOpacity
              onPress={() => setIsTagModalVisible(false)}
              style={styles(theme).closeModalButton}
            >
              <Text style={styles(theme).closeModalButtonText}>Done</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </RNModal>

        {loading ? (
          <ActivityIndicator size="large" color="tomato" />
        ) : (
          <TouchableOpacity
            style={themedStyles.saveButton}
            onPress={handleSaveProfile}>
            <Text style={themedStyles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        )}

        {!!error && <Text style={themedStyles.errorText}>{error}</Text>}
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
    openTagModalButton: {
      backgroundColor: theme === 'dark' ? '#333' : '#e0e0e0',
      padding: 12,
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: 16,
      marginTop: 10,
    },
    openTagModalText: {
      color: theme === 'dark' ? '#fff' : '#000',
      fontWeight: '500',
    },
    taggedUsersContainer: {
      marginBottom: 16,
    },
    taggedUser: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: theme === 'dark' ? '#1f1f1f' : '#f0f0f0',
      padding: 12,
      borderRadius: 10,
      marginBottom: 8,
    },
    taggedUserName: {
      color: theme === 'dark' ? '#fff' : '#000',
      fontSize: 16,
    },
    taggedAccountH2: {
      color: theme === 'dark' ? '#fff' : '#000',
    },
    userTaggedDisplayName: {
      color: theme === 'dark' ? '#fff' : '#0000FF',
      fontSize: 12,
      lineHeight: 20,
      fontWeight: '500',
      marginBottom: 10,
    },
    removeTagButton: {
      color: 'tomato',
      fontWeight: '500',
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

    // Tag users modal;

    modal: {
      justifyContent: 'flex-end',
      margin: 0,
      // marginBottom: 20
    },
    modalContent: {
      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fff',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      // marginBottom: 20,
      maxHeight: '85%',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '600',
      marginBottom: 16,
      color: theme === 'dark' ? '#fff' : '#000',
    },
    searchContent: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f0f0f0',
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    searchBar: {
      flex: 1,
      color: theme === 'dark' ? '#fff' : '#000',
      fontSize: 16,
    },
    searchResultItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 8,
      borderBottomWidth: 0.5,
      borderBottomColor: theme === 'dark' ? '#333' : '#ccc',
    },
    taggedDisplayInfo: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignContent: 'center',
      alignItems: 'center',
    },
    tagProfileImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
    },
    TaggedProfileImage: {
      width: 20,
      height: 20,
      borderRadius: 20,
      marginRight: 12,
    },
    searchResultText: {
      color: theme === 'dark' ? '#fff' : '#000',
      fontSize: 16,
    },
    closeModalButton: {
      backgroundColor: 'tomato',
      padding: 14,
      borderRadius: 12,
      marginTop: 20,
      alignItems: 'center',
      marginBottom: 40,
    },
    closeModalButtonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 16,
    },
  });
export default ProfileSetup;
