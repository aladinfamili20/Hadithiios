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
import DarkMode from '../components/Theme/DarkMode';
import { useUser } from '../data/Collections/FetchUserData';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const EditVideos = () => {
  const theme = DarkMode();
  const { userData } = useUser();
  const { video, id } = useRoute().params;
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
  const [getError, setGetError] = useState('');
  useEffect(() => {
    setProfileData(userData);
  }, [userData]);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const postDoc = await firestore().collection('videos').doc(id).get();
        if (postDoc.exists) {
          const data = postDoc.data();
          setCaption(data.caption || '');
          setTaggedUsers(data.taggedUsers || []);
        } else {
          setGetError('Post not found.');
        }
      } catch (error) {
        console.error('Error fetching post data:', error);
        setGetError('Failed to load post. Try again.');
      }
    };

    if (id) fetchPostData();
  }, [id]);

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

  // Create a new post
  const updatePost = async () => {
    if (!profileData) {
      setGetError('Profile data not available. Please try again later.');
      return;
    }

    setIsLoading(true);
    try {
      const { displayName, profileImage, lastName } = profileData;

      if (!displayName || !profileImage || !lastName) {
        setGetError('Incomplete profile. Update your profile before posting.');
        return;
      }
      const now = firestore.Timestamp.now();
      const today = new Date();
      const date = today.toDateString();
      const Hours = today.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const time = today.toLocaleDateString();
      const dateEdited = today.toLocaleDateString();

      const postData = {
        caption,
        displayName,
        lastName,
        profileImage,
        uid,
        taggedUsers: taggedUsers.map(user => ({
          displayName: user.displayName,
          lastName: user.lastName,
          uid: user.uid,
          taggedAt: firestore.Timestamp.now(),
        })),
        uploadedDate: date,
        HourPostes: Hours,
        createdAt: firestore.Timestamp.now(),
        dateEdited,
      };

      if (caption) postData.caption = caption;
      if (displayName) postData.displayName = displayName;
      if (lastName) postData.lastName = lastName;
      if (profileImage) postData.profileImage = profileImage;
      if (taggedUsers) postData.taggedUsers = taggedUsers;

      await firestore()
        .collection('videos')
        .doc(id)
        .set(postData, { merge: true });
      setGetError('Post created successfully!');
      navigation.navigate('feed');
    } catch (error) {
      console.error('Error creating post:', error);
      if (error.code === 'permission-denied') {
        setGetError('Permission denied. You do not have access.');
      } else if (error.code === 'unavailable') {
        setGetError('Service unavailable. Check your internet connection.');
      } else {
        setGetError('Failed to create post. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // tagging user

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

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
        onPress={Keyboard.dismiss}
        contentContainerStyle={styles(theme).scrollViewContainer}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={Platform.OS === 'ios' ? 100 : 20}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        <View style={styles(theme).container}>
          <ScrollView contentContainerStyle={styles(theme).scrollViewContainer}>
            <View style={styles(theme).header}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons
                  name="chevron-back-outline"
                  color={theme === 'dark' ? '#fff' : '#121212'}
                  size={25}
                />
              </TouchableOpacity>
              <Text style={styles(theme).title}>Upload Photo</Text>
            </View>

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

            {/* {videoSizeMB && (
          <Text style={{textAlign: 'center', marginTop: 4, color: 'gray'}}>
            Compressed Size: {videoSizeMB} MB
          </Text>
        )} */}

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
                  <Text style={styles(theme).taggedUserName}>
                    {user.displayName} {user.lastName}
                  </Text>
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
              <>
                <TouchableOpacity
                  onPress={updatePost}
                  style={styles(theme).createPostButton}
                >
                  <Text style={styles(theme).createPostButtonText}>Update</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>

          {/* Tag Users Modal */}
          <RNModal
            isVisible={isTagModalVisible}
            onBackdropPress={() => setIsTagModalVisible(false)}
            style={styles(theme).modal}
          >
            <View style={styles(theme).modalContent}>
              <Text style={styles(theme).modalTitle}>Tag Users</Text>

              <View style={styles(theme).searchContent}>
                <TextInput
                  placeholder="Search users..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  // onSubmitEditing={handleSearch}
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
              <Text style={styles(theme).getError}>{getError}</Text>

              <TouchableOpacity
                onPress={() => setIsTagModalVisible(false)}
                style={styles(theme).closeModalButton}
              >
                <Text style={styles(theme).closeModalButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </RNModal>
        </View>
      </KeyboardAwareScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = theme => ({
  container: {
    flex: 1,
    backgroundColor: theme === 'light' ? '#fff' : '#121212',
  },
  scrollViewContainer: {
    margin: 10,
  },
  uploadMode: {
    marginBottom: 16,
    alignItems: 'center',
  },
  uploadVideo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'tomato',
    padding: 10,
    borderRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 10,
    color: theme === 'dark' ? '#fff' : '#121212',
  },
  texth2: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: theme === 'light' ? '#fff' : '#121212',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginVertical: 16,
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
  captionInput: {
    borderWidth: 1,
    borderColor: theme === 'light' ? '#ccc' : '#444',
    backgroundColor: theme === 'light' ? '#f9f9f9' : '#1e1e1e',
    color: theme === 'light' ? '#000' : '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  openTagModalButton: {
    backgroundColor: '#444',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  openTagModalText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  taggedUsersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  taggedUser: {
    backgroundColor: theme === 'light' ? '#eee' : '#1e1e1e',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  taggedUserName: {
    color: theme === 'light' ? '#000' : '#fff',
    marginRight: 8,
  },
  removeTagButton: {
    color: 'red',
    fontWeight: 'bold',
  },
  pickImageButton: {
    backgroundColor: 'tomato',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  createPostButton: {
    backgroundColor: 'tomato',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  createPostButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Modal Styles
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: theme === 'light' ? '#fff' : '#1c1c1c',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme === 'light' ? '#000' : '#fff',
    marginBottom: 12,
  },
  searchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme === 'light' ? '#f0f0f0' : '#2a2a2a',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  searchBar: {
    flex: 1,
    color: theme === 'light' ? '#000' : '#fff',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme === 'light' ? '#eee' : '#333',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  searchResultText: {
    color: theme === 'light' ? '#000' : '#fff',
    fontSize: 16,
  },
  closeModalButton: {
    marginTop: 20,
    backgroundColor: 'tomato',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeModalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  getError: {
    textAlign: 'center',
    alignItems: 'center',
    color: theme === 'light' ? '#000' : '#fff',
  },
});

export default EditVideos;
