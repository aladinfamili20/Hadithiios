/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-trailing-spaces */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
// import Video from 'react-native-video';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import { useNavigation, useRoute } from '@react-navigation/native';
import RNModal from 'react-native-modal';
import { Video as VideoCompressor } from 'react-native-compressor';
import RNFS from 'react-native-fs'; // For file size checking
import Video from 'react-native-video';
import DarkMode from '../../components/Theme/DarkMode';
import { useUser } from '../../data/Collections/FetchUserData';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const VideoCustomize = () => {
  const theme = DarkMode();
  const { userData } = useUser();
  const { video } = useRoute().params;
  const user = auth().currentUser;
  const uid = user?.uid;
  const [caption, setCaption] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [taggedUsers, setTaggedUsers] = useState([]);
  const navigation = useNavigation();
  const [isTagModalVisible, setIsTagModalVisible] = useState(false);
  const [compressedVideoUri, setCompressedVideoUri] = useState(null);
  const [videoSizeMB, setVideoSizeMB] = useState(null);
  const [loadingCompression, setLoadingComppression] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [getError, setGetError] = useState('');
  useEffect(() => {
    setProfileData(userData);
  }, [userData]);

  useEffect(() => {
    if (!video) return;

    const compressAndSetVideo = async () => {
      try {
        const compressedUri = await VideoCompressor.compress(video, {
          compressionMethod: 'auto',
        });

        const stat = await RNFS.stat(compressedUri);
        const sizeInMB = stat.size / (1024 * 1024);

        setCompressedVideoUri(compressedUri);
        setVideoSizeMB(sizeInMB.toFixed(2));
        setLoadingComppression(false);
        if (sizeInMB > 50) {
          Alert.alert('Warning', 'Compressed video exceeds 50MB limit');
        }

        console.log('Compressed video:', compressedUri, sizeInMB + 'MB');
      } catch (error) {
        console.error('Compression error:', error);
        Alert.alert('Error', 'Failed to compress video');
      }
    };

    compressAndSetVideo();
  }, [video]);

  // Upload video to Firebase
  const uploadVideo = async () => {
    if (!compressedVideoUri) {
      Alert.alert('Error', 'Compressed video not ready or failed');
      return null;
    }

    try {
      const stat = await RNFS.stat(compressedVideoUri);
      const sizeInMB = stat.size / (1024 * 1024);

      if (sizeInMB > 50) {
        Alert.alert('Error', 'Compressed video exceeds 50MB');
        return null;
      }

      const filename = compressedVideoUri.substring(
        compressedVideoUri.lastIndexOf('/') + 1,
      );
      const storageRef = storage().ref(`videos/${Date.now()}_${filename}`);
      await storageRef.putFile(compressedVideoUri);

      return await storageRef.getDownloadURL();
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload video');
      return null;
    }
  };

  // Create a new post
  const createPost = async () => {
    if (!profileData) {
      Alert.alert('Error', 'Profile data is not available');
      return;
    }

    if (!video) {
      Alert.alert('Error', 'Please select a video before submitting');
      return;
    }

    setIsLoading(true);
    try {
      const { displayName, profileImage, lastName } = profileData;

      if (!displayName || !profileImage || !lastName) {
        Alert.alert('Error', 'Incomplete profile data');
        return;
      }

      const today = new Date();
      const videoUrl = await uploadVideo();
      const time = today.toLocaleDateString();
      const date = today.toDateString();
      const Hours = today.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      if (!videoUrl) {
        // If uploadVideo failed, we exit early
        return;
      }

      const postData = {
        caption,
        video: videoUrl, // Use the download URL from upload
        displayName,
        lastName,
        profileImage,
        uid,
        taggedUsers: taggedUsers.map(user => ({
          // id: user.id,
          displayName: user.displayName,
          lastName: user.lastName,
          uid: user.uid,
          taggedAt: firestore.Timestamp.now(),
        })),
        uploadedDate: today.toDateString(),
        HourPosted: today.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        datePosted: time,
        createdAt: firestore.Timestamp.now(),
      };

      await firestore().collection('videos').add(postData);

   const notifications = taggedUsers.map(user => {
  const taggedUserID = user.id || user.uid;
  return firestore()
    .collection('notifications')
    .add({
      taggedUserID,
      taggingUserID: uid,
      uploadedDate: date,
      date: time,
      taggedTime: Hours,
      taggingDisplayName: `${displayName} ${lastName}`,
      taggingProfileImage: profileImage,
      timestamp: firestore.Timestamp.now(),
      read: false,
    });
});

await Promise.all(notifications);

      console.log('Post created successfully:', postData);
      setGetError('Success', 'Video uploaded successfully');
      navigation.navigate('feed');
    } catch (error) {
      console.error('Error creating post:', error);
      getError('Error', 'Failed to create post', 'Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  // tagging user

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
      setIsLoading(false);
    }
  };

  // auto fill for search input

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles(theme).container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <KeyboardAwareScrollView
        contentContainerStyle={styles(theme).scrollViewContainer}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={Platform.OS === 'ios' ? 100 : 20}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles(theme).header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons
              name="chevron-back-outline"
              color={theme === 'dark' ? '#fff' : '#121212'}
              size={24}
            />
          </TouchableOpacity>
          <Text style={styles(theme).title}>Upload video</Text>
        </View>

        {/* Image Preview */}
        {loadingCompression ? (
          <>
            <Text style={styles(theme).compressionTitle}>
              Laoding compression version, Please wait.
            </Text>
          </>
        ) : (
          <>
            {compressedVideoUri && (
              <Video
                source={{ uri: compressedVideoUri }}
                resizeMode="cover"
                paused={!isPlaying}
                repeat={false}
                style={styles(theme).video}
              />
            )}
          </>
        )}
        {/* Caption Input */}
        <TextInput
          placeholder="Write a caption..."
          style={styles(theme).captionInput}
          value={caption}
          onChangeText={setCaption}
          multiline
          placeholderTextColor={theme === 'light' ? '#888' : '#ccc'}
        />

        {/* Open Modal for Tagging */}
        <TouchableOpacity
          onPress={() => setIsTagModalVisible(true)}
          style={styles(theme).openTagModalButton}
        >
          <Text style={styles(theme).openTagModalText}>Tag Users</Text>
        </TouchableOpacity>

        {/* Display Tagged Users */}
        <View style={styles(theme).taggedUsersContainer}>
          {taggedUsers.map((user, index) => (
            <View key={index} style={styles(theme).taggedUser}>
              <View style={styles(theme).taggedDisplayInfo}>
                <Image
                  source={{ uri: user.profileImage }}
                  style={styles(theme).TaggedProfileImage}
                />
                <Text style={styles(theme).taggedUserName}>
                  {user.displayName} {user.lastName}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  setTaggedUsers(taggedUsers.filter(u => u.id !== user.id))
                }
              >
                <Text style={styles(theme).removeTagButton}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Submit Button */}
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color="tomato"
            style={{ marginTop: 16 }}
          />
        ) : (
          <TouchableOpacity
            onPress={createPost}
            style={styles(theme).createPostButton}
          >
            <Text style={styles(theme).createPostButtonText}>Post</Text>
          </TouchableOpacity>
        )}

        {/* Error Message */}
        <Text style={styles(theme).getError}>{getError}</Text>

        {/* Tag Users Modal */}

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
              data={searchResults}
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
                    style={styles(theme).profileImage}
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
      </KeyboardAwareScrollView>
    </KeyboardAvoidingView>
  );
};

export const styles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === 'dark' ? '#121212' : '#f5f5f5',
    },
    scrollViewContainer: {
      padding: 20,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 22,
      fontWeight: '600',
      color: theme === 'dark' ? '#fff' : '#000',
      marginLeft: 12,
    },
    imagePreview: {
      width: '100%',
      height: 250,
      borderRadius: 16,
      resizeMode: 'cover',
      marginBottom: 20,
    },
    captionInput: {
      minHeight: 80,
      borderRadius: 12,
      backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
      padding: 16,
      fontSize: 16,
      color: theme === 'dark' ? '#fff' : '#000',
      textAlignVertical: 'top',
      marginBottom: 16,
    },
    openTagModalButton: {
      backgroundColor: theme === 'dark' ? '#333' : '#e0e0e0',
      padding: 12,
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: 16,
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
    removeTagButton: {
      color: 'tomato',
      fontWeight: '500',
    },
    createPostButton: {
      backgroundColor: 'tomato',
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 10,
    },
    createPostButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
    getError: {
      color: 'red',
      marginTop: 12,
      textAlign: 'center',
    },
    modal: {
      justifyContent: 'flex-end',
      margin: 0,
    },
    modalContent: {
      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fff',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      marginBottom: 40,
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
    profileImage: {
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
      marginBottom: 40
    },
    closeModalButtonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 16,

    },

    texth2: {
      marginLeft: 10,
      fontSize: 16,
      fontWeight: 'bold',
      color: theme === 'light' ? '#fff' : '#121212',
    },

    video: {
      width: '100%',
      height: 300,
      backgroundColor: '#000',
      marginBottom: 20,
      borderRadius: 10,
    },
    compressionTitle: {
      margin: 5,
      color: theme === 'light' ? '#000' : '#fff',
    },
  });

export default VideoCustomize;
