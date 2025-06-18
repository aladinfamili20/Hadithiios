/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  FlatList,
  Appearance,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const UserPhotos = ({reanderHeader}) => {
  const [theme, setTheme] = useState(Appearance.getColorScheme());
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme);
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const fetchUserPosts = () => {
      const user = auth().currentUser;
      if (user) {
        const unsubscribe = firestore()
          .collection('posts')
          .where('uid', '==', user.uid)
          .orderBy('createdAt', 'desc')
          .onSnapshot(
            (snapshot) => {
              if (snapshot.empty) {
                setUserData([]);
              } else {
                const posts = snapshot.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
                }));
                setUserData(posts);
              }
              setLoading(false);
            },
            (error) => {
              console.error('Error fetching posts: ', error);
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
      await firestore().collection('posts').doc(postId).delete();
      setUserData((prev) => prev.filter((post) => post.id !== postId));
      setDeleteModalVisible(false);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles(theme).imageContainer}>
      <TouchableOpacity style={styles(theme).iconButton} onPress={() => openDeleteModal(item.id)}>
        <Ionicons name="ellipsis-vertical-outline" size={24} style={styles(theme).icon} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('postDetail', { id: item.id })}>
        <Image source={{ uri: item.image }} style={styles(theme).userPhotos} />
      </TouchableOpacity>
    </View>
  );

  const openDeleteModal = (postId) => {
    setPostIdToDelete(postId);
    setDeleteModalVisible(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalVisible(false);
    setPostIdToDelete(null);
  };

  if (loading) {
    return (
      <View style={[styles(theme).container2, styles(theme).horizontal]}>
        <ActivityIndicator size="large" color="tomato" />
      </View>
    );
  }

  if (userData.length === 0) {
    return (
      <View style={styles(theme).container2}>
        <Text>No posts available</Text>
      </View>
    );
  }

  return (
    <>
       <FlatList
      ListHeaderComponent={reanderHeader}
      data={userData}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      numColumns={3}
    />

      {/* Delete Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={deleteModalVisible}
        onRequestClose={closeDeleteModal}
      >
        <View style={styles(theme).modalContainer}>
          <View style={styles(theme).modalContent}>
            <Text style={{ color: theme === 'dark' ? '#fff' : '#121212' }}>
              Are you sure you want to delete this post?
            </Text>
            <View style={styles(theme).modalButtons}>
              <TouchableOpacity style={styles(theme).modalButton} onPress={closeDeleteModal}>
                <Text style={{ color: theme === 'dark' ? '#fff' : '#121212', textAlign: 'center' }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles(theme).modalButtonRed}
                onPress={() => deletePost(postIdToDelete)}
              >
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
    container: {
      paddingTop: 10,
      paddingHorizontal: 5,
    },
    imageContainer: {
      flex: 1 / 3,
      margin: 5,
      position: 'relative',
    },
    userPhotos: {
      width: '100%',
      height: 130,
    },
    iconButton: {
      position: 'absolute',
      top: 5,
      right: 1,
      zIndex: 10,
      padding: 5,
    },
    icon: {
      color: '#ff6347',
    },
    container2: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    horizontal: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: 10,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
      width: 300,
      padding: 20,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
      borderRadius: 10,
      alignItems: 'center',
    },
    modalButtons: {
      flexDirection: 'row',
      marginTop: 20,
      justifyContent: 'space-between',
      gap: 10,
    },
    modalButton: {
      padding: 7,
      borderRadius: 7,
      width: 100,
      borderWidth: 1,
      borderColor: theme === 'dark' ? '#fff' : '#121212',
    },
    modalButtonRed: {
      backgroundColor: 'red',
      padding: 7,
      borderRadius: 7,
      width: 100,
    },
  });

export default UserPhotos;