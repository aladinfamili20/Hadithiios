/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import DarkMode from '../components/Theme/DarkMode';
import { useUser } from '../data/Collections/FetchUserData';
import ProfileAudience from '../components/Profile/ProfileAudience';
import ProfileBio from '../components/Profile/ProfileBio';
import ProfileHeaderInfo from '../components/Profile/ProfileHeaderInfo';
import ProfileBackground from '../components/Profile/ProfileBackground';
import Video from 'react-native-video';
import Image from 'react-native-image-progress';

const ProfileScreen = () => {
  const user = auth().currentUser;
  const uid = user.uid;
  const theme = DarkMode();
  const navigation = useNavigation();
  const { userData } = useUser();
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteVideoModalVisible, setDeleteVideoModalVisible] = useState(false);
  const [editPhotoModal, setEditPhotoModal] = useState(false);
  const [postIdToEdit, setPostIdToEdit] = useState(null);
  const [postIdToDelete, setPostIdToDelete] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPostsCount, setUserPostsCount] = useState(0);
  const [selectedTab, setSelectedTab] = useState('photos'); // or 'videos'
  const [userVideos, setUserVideos] = useState([]);
  const [videoConter, setVideoCounter] = useState(0);
  const screenWidth = Dimensions.get('window').width;
  const imageSize = (screenWidth - 16) / 3;
  let totalPost = videoConter + userPostsCount;
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
          setLoading(false);
        },
        error => {
          console.error('Error fetching posts:', error);
          setLoading(false);
        },
      );

    return () => unsubscribe();
  }, []);

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

  const renderPosts = selectedTab === 'photos' ? userPosts : userVideos;

  const deletePost = async postId => {
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

  const openDeleteModal = postId => {
    setPostIdToDelete(postId);
    setDeleteModalVisible(true);
  };

  const closeDeleteModal = () => {
    setPostIdToDelete(null);
    setDeleteModalVisible(false);
  };

  const openDeleteVideoModal = postId => {
    setPostIdToDelete(postId);
    setDeleteVideoModalVisible(true);
  };

  const closeDeleteVideoModal = () => {
    setPostIdToDelete(null);
    setDeleteVideoModalVisible(false);
  };

  const openEditPhotoModal = postId => {
    setPostIdToEdit(postId);
    setEditPhotoModal(true);
  };
  const closeEditPhotoModal = () => {
    setEditPhotoModal(false);
  };

  const fetchUserPostsCount = async () => {
    try {
      const snapshot = await firestore()
        .collection('posts')
        .where('uid', '==', uid)
        .get();
      setUserPostsCount(snapshot.size);
    } catch (error) {
      console.error('Error fetching user posts count:', error);
    }
  };

  useEffect(() => {
    fetchUserPostsCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const videoCounterHandler = async () => {
    try {
      const snapshot = await firestore()
        .collection('videos')
        .where('uid', '==', uid)
        .get();
      setVideoCounter(snapshot.size);
    } catch (error) {
      console.error('Error fetching user posts count:', error);
    }
  };

  useEffect(() => {
    videoCounterHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const renderHeader = () => (
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
              alignSelf: 'center',
              alignContent: 'center',
            }}
          >
            {/* <Ionicons name="image-outline" size={24} color={'white'} style={styles(theme.photoIcon)}/> */}
            <Text style={{ color: 'white' }}>Photos</Text>
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
            {/* <Ionicons name="camera-outline" size={24} color={'white'}/> */}

            <Text style={{ color: 'white' }}>Videos</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles(theme, imageSize).userPhotosLenghts}>
        <Text style={styles(theme, imageSize).photosLenghts}>{totalPost}</Text>
        <Text style={styles(theme, imageSize).photosText}> Posts</Text>
      </View>
    </View>
  );

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
      <FlatList
        data={renderPosts}
        keyExtractor={item => item.id}
        numColumns={3}
        ListHeaderComponent={renderHeader}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        removeClippedSubviews={false}
        initialNumToRender={12}
        maxToRenderPerBatch={15}
        windowSize={10}
        renderItem={({ item }) => (
          <View style={styles(theme, imageSize).imageContainer}>
            <View>
              {selectedTab === 'photos' ? (
                <View>
                  <TouchableOpacity
                    style={styles(theme, imageSize).iconButton}
                    onPress={() => openDeleteModal(item.id)}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      style={styles(theme, imageSize).icon}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles(theme, imageSize).EditIconButton}
                    // onPress={() => navigation.navigate('editphoto', {id: item.id})}

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
                      size={20}
                      style={styles(theme, imageSize).EditIcon}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles(theme).imageContainer}
                    onPress={() =>
                      navigation.navigate('postDetail', { id: item.id })
                    }
                  >
                    <Image
                      // style={styles(theme, imageSize).userPhotos}
                      style={{
                        width: imageSize,
                        height: imageSize,
                        borderRadius: 8,
                        backgroundColor: theme === 'dark' ? '#333' : '#eee',
                        aspectRatio: 1,
                        flexShrink: 0,
                        // overflow: 'hidden',
                      }}
                      source={{ uri: item.image }}
                      // resizeMode={FastImage.resizeMode.cover}
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <TouchableOpacity
                    style={styles(theme, imageSize).EditIconButton}
                    // onPress={() => navigation.navigate('editphoto', {id: item.id})}

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
                    style={styles(theme, imageSize).iconButton}
                    onPress={() => openDeleteVideoModal(item.id)}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      style={styles(theme, imageSize).icon}
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
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles(theme, imageSize).container2}>
            <Text style={styles(theme, imageSize).emptyText}>
              No {selectedTab} available
            </Text>
          </View>
        }
      />

      {/* Delete Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={deleteModalVisible}
        onRequestClose={closeDeleteVideoModal}
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
      {/* Video modal */}
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
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 15,
    },
  });
