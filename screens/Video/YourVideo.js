/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Modal, Appearance } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Video from 'react-native-video';

const YourVideos = () => {
  const [theme, setTheme] = useState(Appearance.getColorScheme());
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState(null);
  const [isPaused, setIsPaused] = useState(true);

  const navigation = useNavigation();

  // Theme listener
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme);
    });

    return () => subscription?.remove(); // Cleanup
  }, []);

  // Fetch user's posts
  useEffect(() => {
    const fetchUserPosts = () => {
      const user = auth().currentUser;
      if (user) {
        const unsubscribe = firestore()
          .collection('videos')
          .where('uid', '==', user.uid)
          .orderBy('createdAt', 'desc')
          .onSnapshot(
            (snapshot) => {
              const posts = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));
              setUserData(posts);
              setLoading(false);
            },
            (error) => {
              console.error('Error fetching user posts', error);
              setLoading(false);
            }
          );

        return () => unsubscribe();
      }
    };

    fetchUserPosts();
  }, []);

  const deletePost = async (postId) => {
    try {
      await firestore().collection('videos').doc(postId).delete();
      setUserData((prevData) => prevData.filter((post) => post.id !== postId));
      setDeleteModalVisible(false);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const openDeleteModal = (postId) => {
    setPostIdToDelete(postId);
    setDeleteModalVisible(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalVisible(false);
    setPostIdToDelete(null);
  };

  const togglePlayPause = () => setIsPaused(!isPaused);

  return (
    <>
      {loading ? (
        <View style={styles(theme).container2}>
          <ActivityIndicator size="large" color="tomato" />
        </View>
      ) : userData.length === 0 ? (
        <View style={styles(theme).container2}>
          <Text style={{ color: theme === 'dark' ? '#fff' : '#000' }}>No posts available</Text>
        </View>
      ) : (
        <View style={styles(theme).container}>
          {userData.map((data, index) => {
            const videoUri = data.video || ''; // Ensure video URI is valid
            return (
              <View key={index} style={styles(theme).imageContainer}>
                <TouchableOpacity style={styles(theme).iconButton} onPress={() => openDeleteModal(data.id)}>
                  <Ionicons name="ellipsis-vertical-outline" size={24} style={styles(theme).icon} />
                </TouchableOpacity>
                {videoUri ? (
                  <TouchableOpacity onPress={togglePlayPause}>
                    <Video
                      source={{ uri: videoUri }}
                      rate={1.0}
                      volume={1.0}
                      muted={false}
                      resizeMode="cover"
                      paused={isPaused}
                      repeat={false}
                      style={styles(theme).video}
                    />
                  </TouchableOpacity>
                ) : (
                  <Text style={{ color: 'red', textAlign: 'center' }}>Invalid video URL</Text>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Delete Post Modal */}
      <Modal animationType="slide" transparent visible={deleteModalVisible} onRequestClose={closeDeleteModal}>
        <View style={styles(theme).modalContainer}>
          <View style={styles(theme).modalContent}>
            <Text style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Are you sure you want to delete this post?</Text>
            <View style={styles(theme).modalButtons}>
              <TouchableOpacity style={styles(theme).modalButton} onPress={closeDeleteModal}>
                <Text style={{ color: theme === 'dark' ? '#fff' : '#000', textAlign: 'center' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles(theme).modalButtonRed} onPress={() => deletePost(postIdToDelete)}>
                <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = (theme) =>
  StyleSheet.create({
    container: { flexDirection: 'row', flexWrap: 'wrap', width: '100%' },
    imageContainer: { width: '80%', marginBottom: 10, marginLeft: '3.3%', position: 'relative', marginRight: 10 },
    video: { width: '100%', height: 400 },
    iconButton: { position: 'absolute', top: 5, right: 1, zIndex: 10, padding: 5 },
    icon: { color: '#ff6347' },
    container2: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { width: 300, padding: 20, backgroundColor: theme === 'dark' ? '#121212' : '#fff', borderRadius: 10, alignItems: 'center' },
    modalButtons: { flexDirection: 'row', marginTop: 20, justifyContent: 'space-between', gap: 10 },
    modalButton: { padding: 7, borderRadius: 7, width: 100, borderWidth: 1, borderColor: theme === 'dark' ? '#fff' : '#000' },
    modalButtonRed: { backgroundColor: 'red', padding: 7, borderRadius: 7, width: 100 },
  });

export default YourVideos;