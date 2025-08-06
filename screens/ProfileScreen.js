/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CommonActions, useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import DarkMode from '../components/Theme/DarkMode';
import ProfileAudience from '../components/Profile/ProfileAudience';
import ProfileBio from '../components/Profile/ProfileBio';
import ProfileHeaderInfo from '../components/Profile/ProfileHeaderInfo';
import ProfileBackground from '../components/Profile/ProfileBackground';
import Video from 'react-native-video';
import { SwipeListView } from 'react-native-swipe-list-view';

const ProfileScreen = () => {
  const user = auth().currentUser;
  const uid = user.uid;
  const theme = DarkMode();
  const navigation = useNavigation();
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteVideoModalVisible, setDeleteVideoModalVisible] = useState(false);
  const [deleteThreadModalVisible, setDeleteThreadVisible] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('photos'); // or 'videos'
  const [userVideos, setUserVideos] = useState([]);
  const [userprofileImages, setUserProfileImages] = useState([]);
  const [threads, setThreads] = useState([]);

  const screenWidth = Dimensions.get('window').width;
  const imageSize = (screenWidth - 16) / 3;
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth().currentUser;
        if (!currentUser) {
          return;
        }
        const userDoc = await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .get();

        if (userDoc.exists) {
          const data = userDoc.data();
          setFollowers(data.followers || []);
          setFollowing(data.following || []);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  // fetching post and videos from firebase firestore

  useEffect(() => {
    const user = auth().currentUser;
    if (!user) {
      return;
    }

    const unsubscribe = firestore()
      .collection('posts')
      .where('uid', '==', user.uid)
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        snapshot => {
          const posts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setUserPosts(posts);
          setThreads(posts);
          setUserProfileImages(posts);
          setLoading(false);
        },
        error => {
          console.error('Error fetching posts:', error);
          setLoading(false);
        },
      );

    return () => unsubscribe();
  }, []);

  // Get Threads
  useEffect(() => {
    const getThreads = async () => {
      const postsSnap = await firestore()
        .collection('posts')
        .where('uid', '==', uid)
        .get();
      const threadsDocs = postsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setThreads(threadsDocs);
      setLoading(false);
    };
    getThreads();
  }, [uid]);

  // fetch videos from firebase firestore

  useEffect(() => {
    const user = auth().currentUser;
    if (!user) {
      return;
    }

    const unsubscribe = firestore()
      .collection('videos')
      .where('uid', '==', user.uid)
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        snapshot => {
          const videos = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setUserVideos(videos);
        },
        error => {
          console.error('Error fetching videos:', error);
          console.log('Error fetching videos:', error);
        },
      );

    return () => unsubscribe();
  }, []);
  // delete posts from firebase
  const deletePost = async postId => {
    try {
      await firestore().collection('posts').doc(postId).delete();
      setUserPosts(prev => prev.filter(post => post.id !== postId));
      closeDeleteModal();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  // Delete thread from firebase
  const deleteThread = async postId => {
    try {
      await firestore().collection('posts').doc(postId).delete();
      setUserPosts(prev => prev.filter(post => post.id !== postId));
      closeDeleteModal();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  // Deleting videos
  const deleteVideo = async postId => {
    try {
      await firestore().collection('videos').doc(postId).delete();
      setUserPosts(prev => prev.filter(post => post.id !== postId));
      closeDeleteVideoModal();
    } catch (error) {
      console.error('Error deleting post:', error);
      console.log('Error deleting post:', error);
    }
  };

  const closeDeleteModal = () => {
    setPostIdToDelete(null);
    setDeleteModalVisible(false);
  };

  const closeDeleteVideoModal = () => {
    setPostIdToDelete(null);
    setDeleteVideoModalVisible(false);
  };

  const closeDeleteThreadModal = () => {
    setPostIdToDelete(null);
    setDeleteThreadVisible(false);
  };

  const photoPosts = userprofileImages.filter(p => p.image && !p.video);
  const videoPosts = userVideos.filter(p => p.video);
  const captionOnlyPosts = threads.filter(
    post => post.caption && !post.image && !post.video,
  );

  const renderAudienceProfile = () => {
    return (
      <View style={styles(theme, imageSize).profileContainer}>
        <ProfileBackground />
        <View style={styles(theme, imageSize).profileContents}>
          <ProfileHeaderInfo />
          <ProfileBio />
          <ProfileAudience
            theme={theme}
            followers={followers}
            following={following}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginVertical: 10,
            }}
          >
            <TouchableOpacity
              onPress={() => setSelectedTab('photos')}
              style={{
                padding: 10,
                backgroundColor: selectedTab === 'photos' ? 'tomato' : 'gray',
                borderTopLeftRadius: 8,
                borderBottomLeftRadius: 8,
              }}
            >
              <Text style={{ color: 'white' }}>Photos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedTab('threads')}
              style={{
                padding: 10,
                backgroundColor: selectedTab === 'threads' ? 'tomato' : 'gray',
              }}
            >
              <Text style={{ color: 'white' }}>Threads</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedTab('videos')}
              style={{
                padding: 10,
                backgroundColor: selectedTab === 'videos' ? 'tomato' : 'gray',
                borderTopRightRadius: 8,
                borderBottomRightRadius: 8,
              }}
            >
              <Text style={{ color: 'white' }}>Videos</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles(theme, imageSize).userPhotosLenghts}>
          <Text style={styles(theme, imageSize).photosLenghts}>
            <Text style={styles(theme, imageSize).photosLenghts}>
              {(selectedTab === 'photos' && photoPosts?.length) ||
                (selectedTab === 'threads' && captionOnlyPosts?.length) ||
                (selectedTab === 'videos' && videoPosts?.length) ||
                0}
            </Text>
          </Text>
          <Text style={styles(theme, imageSize).photosText}> Posts</Text>
        </View>
      </View>
    );
  };

  const handleRenderPosts = ({ item }) => {
    const hasImage = !!item.image;
    return (
      // <SwipeListView
      // >

      <View key={item.id} style={styles(theme, imageSize).imageContainer}>
        {hasImage ? (
          // onPress={() => navigation.navigate('postDetail', { id: item.id })}
          <View>
            <TouchableOpacity
              style={styles(theme, imageSize).EditIconButton}
              onPress={() =>
                navigation.navigate('editphoto', {
                  image: item.image,
                  caption: item.caption,
                  id: item.id,
                  taggedUsers: item.taggedUser,
                })
              }
            >
              <Ionicons
                name="create-outline"
                size={15}
                style={styles(theme, imageSize).EditIcon}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles(theme).imageContainer}
              onPress={() => navigation.navigate('postDetail', { id: item.id })}
            >
              <Image
                source={{ uri: item.image }}
                style={{
                  width: imageSize,
                  height: imageSize,
                  borderRadius: 8,
                  backgroundColor: theme === 'dark' ? '#333' : '#eee',
                  aspectRatio: 1,
                }}
              />
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles(theme).missingPostText}>Post unavailable</Text>
        )}
      </View>
      // </SwipeListView>
    );
  };

  const renderVideoPost = ({ item }) => {
    const hasVideo = !!item.video;
    return (
      <View key={item.id} style={styles(theme, imageSize).imageContainer}>
        {hasVideo ? (
          <View>
            <TouchableOpacity
              style={styles(theme, imageSize).EditIconButton}
              onPress={() =>
                navigation.navigate('editvideos', {
                  video: item.video,
                  caption: item.caption,
                  id: item.id,
                  taggedUsers: item.taggedUser,
                })
              }
            >
              <Ionicons
                name="create-outline"
                size={20}
                style={styles(theme, imageSize).EditIcon}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate('videodetails', { id: item.id })
              }
            >
              <Video
                source={{ uri: item.video }}
                style={styles(theme, imageSize).userPhotos}
                resizeMode="cover"
                muted
                repeat
                paused
              />
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles(theme).missingPostText}>Post unavailable</Text>
        )}
      </View>
    );
  };

  const renderCaptionOnlyPost = ({ item }) => {
    const navigateToProfile = userId => {
      navigation.dispatch(
        CommonActions.navigate({
          name: 'UserProfileScreen',
          params: { uid: userId },
        }),
      );
    };
    const hasCaption = !!item.caption;
    return (
      <View key={item.id} style={styles(theme, imageSize).captionMainContainer}>
        {hasCaption ? (
          <>
            {/* Profile Header */}

            <TouchableOpacity
              style={styles(theme, imageSize).CaptionEditIconButton}
              onPress={() =>
                navigation.navigate('editphoto', {
                  caption: item.caption,
                  id: item.id,
                  taggedUsers: item.taggedUser,
                })
              }
            >
              <Ionicons
                name="create-outline"
                size={15}
                style={styles(theme, imageSize).CaptionEditIcon}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigateToProfile(item.uid)}
              accessible={true}
              accessibilityLabel={`Go to ${item.displayName} ${item.lastName}'s profile`}
              style={styles(theme).captionProfileContainer}
            >
              <Image
                source={{ uri: item.profileImage }}
                style={styles(theme).profileImage}
              />
              <View style={styles(theme).profileDetails}>
                <Text style={styles(theme).displayName}>
                  {item.displayName} {item.lastName}
                </Text>
                <Text style={styles(theme).timestamp}>{item.time}</Text>
              </View>
            </TouchableOpacity>

            {/* Caption Content */}
            <TouchableOpacity
              onPress={() => navigation.navigate('postDetail', { id: item.id })}
              style={styles(theme).captionBody}
            >
              <Text style={styles(theme).captionText}>{item.caption}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles(theme).missingPostText}>Post unavailable</Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles(theme, imageSize).container,
          styles(theme, imageSize).horizontal,
        ]}
      >
        <ActivityIndicator size="large" color="tomato" />
      </View>
    );
  }

  return (
    <View style={styles(theme, imageSize).ProfileContainer}>
      <SwipeListView
        key={selectedTab}
        data={
          selectedTab === 'photos'
            ? photoPosts
            : selectedTab === 'threads'
            ? captionOnlyPosts
            : videoPosts
        }
        renderItem={
          selectedTab === 'photos'
            ? handleRenderPosts
            : selectedTab === 'threads'
            ? renderCaptionOnlyPost
            : renderVideoPost
        }
        numColumns={selectedTab === 'threads' ? 1 : 3} // 1 column for caption posts
        keyExtractor={item => item.id}
        ListHeaderComponent={renderAudienceProfile}
        columnWrapperStyle={
          selectedTab === 'threads' ? null : { justifyContent: 'space-between' }
        }
        removeClippedSubviews={false}
        initialNumToRender={12}
        maxToRenderPerBatch={15}
        windowSize={10}
        rightOpenValue={-75}
        disableRightSwipe
        contentContainerStyle={{ paddingBottom: 50 }}
        style={styles(theme).flatList}
        renderHiddenItem={({ item }) => (
          <View style={styles(theme).rowBack}>
            <TouchableOpacity
              style={styles(theme).backRightBtn}
              onPress={() => {
                setPostIdToDelete(item.id);
                if (selectedTab === 'photos') {
                  setDeleteModalVisible(true);
                } else if (selectedTab === 'threads') {
                  setDeleteThreadVisible(true);
                } else {
                  setDeleteVideoModalVisible(true);
                }
              }}
            >
              <Ionicons name="trash-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Modal for deleting posts */}
      <Modal
        animationType="slide"
        transparent
        visible={deleteModalVisible}
        onRequestClose={closeDeleteModal}
      >
        <View style={styles(theme, imageSize).modalContainer}>
          <View style={styles(theme, imageSize).modalContent}>
            <Text style={styles(theme, imageSize).modalText}>
              Are you sure you want to delete this post?
            </Text>
            <View style={styles(theme, imageSize).modalButtons}>
              <TouchableOpacity
                style={styles(theme, imageSize).modalButton}
                onPress={closeDeleteModal}
              >
                <Text style={styles(theme, imageSize).modalButtonText}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles(theme, imageSize).modalButtonRed}
                onPress={() => deletePost(postIdToDelete)}
              >
                <Text style={styles(theme, imageSize).modalButtonTextBold}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal for deliting threads */}

      <Modal
        animationType="slide"
        transparent
        visible={deleteThreadModalVisible}
        onRequestClose={closeDeleteThreadModal}
      >
        <View style={styles(theme, imageSize).modalContainer}>
          <View style={styles(theme, imageSize).modalContent}>
            <Text style={styles(theme, imageSize).modalText}>
              Are you sure you want to delete this thread?
            </Text>
            <View style={styles(theme, imageSize).modalButtons}>
              <TouchableOpacity
                style={styles(theme, imageSize).modalButton}
                onPress={closeDeleteThreadModal}
              >
                <Text style={styles(theme, imageSize).modalButtonText}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles(theme, imageSize).modalButtonRed}
                onPress={() => deleteThread(postIdToDelete)}
              >
                <Text style={styles(theme, imageSize).modalButtonTextBold}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal for deleting videos */}
      <Modal
        animationType="slide"
        transparent
        visible={deleteVideoModalVisible}
        onRequestClose={closeDeleteVideoModal}
      >
        <View style={styles(theme, imageSize).modalContainer}>
          <View style={styles(theme, imageSize).modalContent}>
            <Text style={styles(theme, imageSize).modalText}>
              Are you sure you want to delete this video?
            </Text>
            <View style={styles(theme, imageSize).modalButtons}>
              <TouchableOpacity
                style={styles(theme, imageSize).modalButton}
                onPress={closeDeleteVideoModal}
              >
                <Text style={styles(theme, imageSize).modalButtonText}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles(theme, imageSize).modalButtonRed}
                onPress={() => deleteVideo(postIdToDelete)}
              >
                <Text style={styles(theme, imageSize).modalButtonTextBold}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProfileScreen;

const styles = (theme, imageSize) =>
  StyleSheet.create({
    ProfileContainer: {
      flex: 1,
      backgroundColor: theme === 'dark' ? '#121212' : '#eee',
    },
    profileContents: {
      margin: 10,
    },
    userPhotos: {
      width: imageSize,
      height: imageSize,
      borderRadius: 8,
      backgroundColor: theme === 'dark' ? '#333' : '#eee',
      aspectRatio: 1,
      flexShrink: 0,
    },
    imageContainer: {
      width: imageSize,

      borderRadius: 20,
      overflow: 'hidden', // critical!
      margin: 2,
      position: 'relative',
    },
    // imageContainer: {
    // },
    iconButton: {
      position: 'absolute',
      top: 6,
      right: 6,
      zIndex: 2,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: 20,
      padding: 4,
    },
    icon: {
      color: '#fff',
    },
    // Edit photo icon
    EditIconButton: {
      position: 'absolute',
      top: 6,
      left: 6,
      zIndex: 2,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: 20,
      padding: 4,
    },
    EditIcon: {
      color: '#fff',
    },

    CaptionEditIconButton: {
      position: 'absolute',
      top: 6,
      right: 6,
      zIndex: 2,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: 20,
      padding: 4,
    },
    CaptionEditIcon: {
      color: '#fff',
    },

    photoIcon: {
      alignSelf: 'center',
      textAlign: 'center',
      alignContent: 'center',
      alignItems: 'center',
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    userPhotosLenghts: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 2,
    },
    photosLenghts: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    photosText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    container2: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 50,
    },
    emptyText: {
      fontSize: 16,
      color: theme === 'dark' ? '#aaa' : '#555',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
      paddingHorizontal: 20,
    },
    modalContent: {
      backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
      padding: 25,
      borderRadius: 12,
      width: '100%',
      maxWidth: 320,
      elevation: 5,
    },
    modalText: {
      fontSize: 16,
      color: theme === 'dark' ? '#fff' : '#000',
      textAlign: 'center',
      marginBottom: 20,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 10,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 10,
      backgroundColor: theme === 'dark' ? '#333' : '#eee',
      borderRadius: 8,
    },
    modalButtonRed: {
      flex: 1,
      paddingVertical: 10,
      backgroundColor: 'red',
      borderRadius: 8,
    },
    modalButtonText: {
      textAlign: 'center',
      color: theme === 'dark' ? '#fff' : '#000',
      fontSize: 15,
    },
    modalButtonTextBold: {
      textAlign: 'center',
      color: '#ffffff',
      fontWeight: 'bold',
      fontSize: 15,
    },

    rowBack: {
      alignItems: 'center',
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingRight: 15,
      marginVertical: 8,
      borderRadius: 8,
    },
    backRightBtn: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 75,
      height: '100%',
      backgroundColor: 'red',
      borderTopRightRadius: 8,
      borderBottomRightRadius: 8,
    },

    // Caption styles

    captionMainContainer: {
      backgroundColor: theme === 'dark' ? '#1c1c1e' : '#f9f9f9',
      borderRadius: 12,
      padding: 12,
      marginVertical: 8,
      marginHorizontal: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },

    captionProfileContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },

    profileImage: {
      width: 40,
      height: 40,
      borderRadius: 50,
      marginRight: 10,
    },

    profileDetails: {
      flex: 1,
    },

    displayName: {
      fontWeight: '600',
      fontSize: 16,
      color: theme === 'dark' ? '#fff' : '#111',
    },

    timestamp: {
      fontSize: 12,
      color: theme === 'dark' ? '#aaa' : '#555',
    },

    captionBody: {
      paddingTop: 4,
      paddingBottom: 6,
    },

    captionText: {
      fontSize: 15,
      color: theme === 'dark' ? '#eaeaea' : '#333',
      lineHeight: 22,
    },

    missingPostText: {
      color: 'gray',
      textAlign: 'center',
      padding: 12,
      fontStyle: 'italic',
    },
  });
