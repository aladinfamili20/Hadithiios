/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-trailing-spaces */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Appearance,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import VideoHandler from '../components/VideoHandler';
import Divider from '../components/Divider';
import DarkMode from '../components/Theme/DarkMode';

const SavedVideos = () => {
  const theme = DarkMode();
  const user = auth().currentUser;
  const uid = user?.uid;
  const [savedPosts, setSavedPosts] = useState([]);
  const [saveVideos, setSavedVideos] = useState([]);
  const navigation = useNavigation();
  const [loadPosts, setLoadPosts] = useState(true); // Start loading until data is fetched
  const [loadVideos, setLoadVideos] = useState(true); // Start loading until data is fetched

  useEffect(() => {
    const retrieveSavedPosts = async () => {
      try {
        if (user) {
          const userSavedPostsRef = firestore().collection('posts');
          const querySnapshot = await userSavedPostsRef
            .where('saved_by_user', 'array-contains', user.uid)
            .get();

          const userSavedPosts = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));

          setSavedPosts(userSavedPosts);
          setLoadPosts(false);
        }
      } catch (error) {
        console.error('Error retrieving saved posts:', error);
      }
    };

    retrieveSavedPosts();
  }, [user]);

  useEffect(() => {
    const retrieveSavedPosts = async () => {
      try {
        if (user) {
          const userSavedPostsRef = firestore().collection('videos');
          const querySnapshot = await userSavedPostsRef
            .where('saved_by_user', 'array-contains', user.uid)
            .get();

          const userSavedPosts = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));

          setSavedVideos(userSavedPosts);
          setLoadVideos(false);
        }
      } catch (error) {
        console.error('Error retrieving saved posts:', error);
      }
    };

    retrieveSavedPosts();
  }, [user]);

  return (
    <View style={styles(theme).container}>
      <StatusBar backgroundColor="orangered" />

      <View style={styles(theme).header}>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Ionicons
            name="chevron-back-outline"
            color={theme === 'dark' ? '#fff' : '#121212'}
            size={24}
          />
        </TouchableOpacity>

        <Text style={styles(theme).texth1}>Saved vidoes</Text>
      </View>
      {loadVideos ? (
        <View style={[theme.ActivityIndicator, theme.horizontal]}>
          <ActivityIndicator size="large" color="tomato" />
        </View>
      ) : (
        <>
          {saveVideos.length === 0 ? (
            <Text style={{textAlign: 'center'}}>No saved video(s) yet.</Text>
          ) : (
            <FlatList
              data={saveVideos}
              keyExtractor={item => item.id}
              renderItem={({item}) => <VideoHandler post={item} />}
            />
          )}
        </>
      )}
    </View>
  );
};

export default SavedVideos;

const styles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    },
    topHeader: {
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
      height: 50,
    },

    topHeaderIcons: {
      margin: 10,
      flexDirection: 'row',
      alignItems: 'center',
    },
    uploadTopText: {
      color: theme === 'dark' ? '#fff' : '#121212',
      fontWeight: 'bold',
      textAlign: 'center',
      marginLeft: 50,
      fontSize: 20,
    },
    ActivityIndicator: {
      justifyContent: 'center',
      color: 'tomato',
    },
    header: {
      // marginTop: Platform.OS === 'ios' ? -9 : 10,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
      flexDirection: 'row',
      alignItems: 'center',
      height: 50,
      marginLeft: 10,
    },
    headerIcons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    texth1: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme === 'dark' ? '#fff' : '#121212',
      marginLeft: 50,
    },
  });