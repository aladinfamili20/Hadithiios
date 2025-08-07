import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import Video from 'react-native-video';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import { createThumbnail } from 'react-native-create-thumbnail';
import RNFS from 'react-native-fs';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useUser } from '../../data/Collections/FetchUserData';
import DarkMode from '../../components/Theme/DarkMode';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import RNModal from 'react-native-modal';
import { Video as VideoCompressor } from 'react-native-compressor';

const UploadPost = () => {
  const user = auth().currentUser;
  const uid = user?.uid;
  const [caption, setCaption] = useState('');
  const { userData } = useUser();
  const [loading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const navigation = useNavigation();
  const theme = DarkMode();
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [isTagModalVisible, setIsTagModalVisible] = useState(false);
  const [getError, setGetError] = useState('');
  const [media, setMedia] = useState(null);
  const [compressedVideoUri, setCompressedVideoUri] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [loadingCompression, setLoadingCompression] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setProfileData(userData);
  }, [userData]);

  const handleMediaPick = type => {
    const options = { mediaType: type, quality: 1 };

    launchImageLibrary(options, async response => {
      if (response.didCancel || response.errorCode) {
        Alert.alert(
          'Error',
          response.errorMessage || 'User cancelled media picker',
        );
        return;
      }

      const selectedAsset = response.assets[0];
      setMedia(selectedAsset);

      if (selectedAsset.type.startsWith('video')) {
        const fileSizeMB = selectedAsset.fileSize / (1024 * 1024);
        if (fileSizeMB > 100) {
          Alert.alert('Error', 'Video file is too large. Max 100MB.');
          return;
        }

        try {
          const { path } = await createThumbnail({ url: selectedAsset.uri });
          setThumbnail(path);

          setLoadingCompression(true);
          const result = await VideoCompressor.compress(selectedAsset.uri, {
            compressionMethod: 'auto', // or your preferred settings
          });
          setCompressedVideoUri(result);
          setLoadingCompression(false);
        } catch (err) {
          console.error('Compression error:', err);
          setLoadingCompression(false);
        }
      }
    });
  };

  const handleCameraCapture = () => {
    const options = { mediaType: 'photo', quality: 1, cameraType: 'back' };

    launchCamera(options, response => {
      if (response.didCancel || response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'User cancelled camera');
      } else {
        setMedia(response.assets[0]);
      }
    });
  };

  // Tag User

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
      setGetError('Error searching users');
      setIsLoading(false);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Compress video when media is a video
  useEffect(() => {
    const compressVideo = async () => {
      if (!media?.type?.startsWith('video')) return;

      try {
        const compressedUri = media.uri; // optionally compress here with VideoCompressor
        const stat = await RNFS.stat(compressedUri);
        const sizeMB = stat.size / (1024 * 1024);
        setCompressedVideoUri(compressedUri);
        setLoadingCompression(false);

        if (sizeMB > 50) {
          Alert.alert('Warning', 'Compressed video exceeds 50MB limit');
        }
      } catch (err) {
        console.error('Compression error:', err);
        Alert.alert('Error', 'Failed to process video');
        setLoadingCompression(false);
      }
    };

    compressVideo();
  }, [media]);

  const uploadImage = async () => {
    if (!media?.uri) return null;
    // const ref = storage().ref(`photos/${Date.now()}_${uid}.jpg`);
    const ref = storage().ref(`photos/${uid}/${Date.now()}.jpg`);

    try {
      await ref.putFile(media.uri);
      return await ref.getDownloadURL();
    } catch (err) {
      console.error('Image upload failed:', err);
      return null;
    }
  };

  const uploadVideo = async () => {
    if (!compressedVideoUri) return null;
    const stat = await RNFS.stat(compressedVideoUri);
    if (stat.size / (1024 * 1024) > 50) {
      Alert.alert('Error', 'Compressed video exceeds 50MB');
      return null;
    }

    const ref = storage().ref(`videos/${Date.now()}_${uid}.mp4`);
    try {
      await ref.putFile(compressedVideoUri);
      return await ref.getDownloadURL();
    } catch (err) {
      console.error('Video upload failed:', err);
      return null;
    }
  };

  const handlePost = async () => {
    if (!profileData) return;

    setIsLoading(true);
    try {
      const { displayName, profileImage, lastName } = profileData;
      const now = new Date();
      const date = now.toDateString();
      const hour = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const formattedDate = now.toLocaleDateString();

      let imageUrl = null;
      let videoUrl = null;

      if (media?.type?.startsWith('image')) {
        imageUrl = await uploadImage();
      }

      if (media?.type?.startsWith('video')) {
        videoUrl = await uploadVideo();
      }

      const postData = {
        caption,
        displayName,
        lastName,
        profileImage,
        uid,
        image: imageUrl,
        video: videoUrl,
        thumbnail: thumbnail || null,
        taggedUsers: taggedUsers.map(user => ({
          displayName: user.displayName,
          lastName: user.lastName,
          uid: user.uid,
          taggedAt: firestore.Timestamp.now(),
        })),
        uploadedDate: date,
        HourPosted: hour,
        time: formattedDate,
        createdAt: firestore.Timestamp.now(),
      };

      // Save notifications
      await Promise.all(
        taggedUsers.map(user =>
          firestore()
            .collection('notifications')
            .add({
              taggedUserID: user.uid,
              taggingUserID: uid,
              uploadedDate: date,
              date: formattedDate,
              taggedTime: hour,
              taggingDisplayName: `${displayName} ${lastName}`,
              taggingProfileImage: profileImage,
              timestamp: firestore.Timestamp.now(),
              read: false,
            }),
        ),
      );

      // Save post to correct collection
      //  if (imageUrl && !videoUrl) {
      //         await firestore().collection('posts').add(postData);
      //         setGetError('Photo post created.');
      //       } else if(videoUrl && !imageUrl) {
      //         await firestore().collection('videos').add(postData);
      //         setGetError('Video post created.');
      //       } else if (videoUrl && imageUrl) {
      //         await firestore().collection('mixed_posts').add(postData);
      //         setGetError('Image & video post created.');
      //       } else {
      //         await firestore().collection('text_posts').add(postData);
      //         setGetError('Text-only post created.');
      //       }

      if (imageUrl && !videoUrl) {
        await firestore().collection('posts').add(postData);
        setGetError('Photo post created.');
      } else if (videoUrl && !imageUrl) {
        await firestore().collection('videos').add(postData);
        setGetError('Video post created.');
      } else {
        await firestore().collection('posts').add(postData);
        setGetError('Caption post created');
      }

      navigation.navigate('feed');
    } catch (err) {
      console.error('Error posting:', err);
      setGetError('Post failed.');
    } finally {
      setIsLoading(false);
    }
  };

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
        <View style={styles(theme).container}>
          <Text style={styles(theme).header}>Create Post</Text>

          <TextInput
            style={styles(theme).input}
            placeholder="Write a caption..."
            value={caption}
            onChangeText={setCaption}
            multiline
            placeholderTextColor={theme === 'light' ? '#888' : '#ccc'}
            maxLength={250}
          />

          {media && (
            <View style={styles(theme).previewContainer}>
              {media.type?.startsWith('video') ? (
                loadingCompression ? (
                  <Text style={styles(theme).compressionTitle}>
                    Loading compressed video...
                  </Text>
                ) : compressedVideoUri ? (
                  <>
                    <Text style={styles(theme).compressionTitle}>
                      Compression complete
                    </Text>
                    <Video
                      source={{ uri: compressedVideoUri }}
                      style={styles(theme).video}
                      resizeMode="cover"
                      paused={!isPlaying}
                    />
                  </>
                ) : (
                  <Text style={styles(theme).compressionTitle}>
                    Failed to load compressed video.
                  </Text>
                )
              ) : (
                <Image
                  source={{ uri: media.uri }}
                  style={styles(theme).previewImage}
                />
              )}
            </View>
          )}

          <View style={styles(theme).buttonRow}>
            <TouchableOpacity
              style={styles(theme).button}
              onPress={() => handleMediaPick('photo')}
            >
              <Text style={styles(theme).buttonText}>Upload Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles(theme).button}
              onPress={() => handleMediaPick('video')}
            >
              <Text style={styles(theme).buttonText}>Upload Video</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles(theme).takePhotoButton}
            onPress={handleCameraCapture}
          >
            <Text style={styles(theme).takePhotoButtonText}>Take Photo</Text>
          </TouchableOpacity>

          {/* Tagging users */}
          <TouchableOpacity
            onPress={() => setIsTagModalVisible(true)}
            style={styles(theme).openTagModalButton}
          >
            <Text style={styles(theme).openTagModalText}>Tag Users</Text>
          </TouchableOpacity>

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

          {/* Modal for tagging users */}

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

          <TouchableOpacity
            style={styles(theme).postButton}
            onPress={handlePost}
            disabled={loading}
          >
            <Text style={styles(theme).postButtonText}>
              {loading ? 'Posting...' : 'Post'}
            </Text>
          </TouchableOpacity>

          {getError ? (
            <Text style={styles(theme).error}>{getError}</Text>
          ) : null}
        </View>
      </KeyboardAwareScrollView>
    </KeyboardAvoidingView>
  );
};

export default UploadPost;

const styles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 10,
      backgroundColor: theme === 'dark' ? '#121212' : '#f5f5f5',
    },
    header: {
      fontSize: 22,
      fontWeight: '600',
      marginBottom: 16,
      color: theme === 'dark' ? '#fff' : '#000',
    },
    input: {
      borderWidth: 1,
      borderColor: '#ddd',
      padding: 12,
      borderRadius: 8,
      height: 100,
      textAlignVertical: 'top',
      marginBottom: 16,
      color: theme === 'dark' ? '#fff' : '#000',
    },
    previewContainer: {
      marginBottom: 16,
    },
    previewImage: {
      width: '100%',
      height: 200,
      borderRadius: 8,
    },
    previewText: {
      fontSize: 16,
      color: theme === 'dark' ? '#fff' : '#000',
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    button: {
      backgroundColor: '#eee',
      padding: 12,
      borderRadius: 8,
      flex: 0.48,
      alignItems: 'center',
    },
    takePhotoButton: {
      backgroundColor: '#eee',
      padding: 12,
      borderRadius: 8,
      flex: 0.48,
      alignItems: 'center',
      marginBottom: 10,
    },
    buttonText: {
      color: '#000',
    },
    takePhotoButtonText: {
      color: '#000',
    },
    postButton: {
      marginTop: 16,
      backgroundColor: '#FF4500',
      padding: 14,
      borderRadius: 8,
      alignItems: 'center',
    },
    postButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    compressionTitle: {
      color: theme === 'dark' ? '#fff' : '#000',
      alignItems: 'center',
      textAlign: 'center',
    },

    error: {
      color: theme === 'dark' ? '#fff' : '#000',
      alignItems: 'center',
      textAlign: 'center',
    },

    // Tagging user styles.

    openTagModalButton: {
      backgroundColor: theme === 'dark' ? '#333' : '#e0e0e0',
      padding: 12,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 30,
    },
    openTagModalText: {
      color: theme === 'dark' ? '#fff' : '#000',
      fontWeight: '500',
    },
    taggedUsersContainer: {
      marginBottom: 16,
      marginTop: 10,
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
      marginBottom: 40,
    },
    closeModalButtonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 16,
    },
  });
