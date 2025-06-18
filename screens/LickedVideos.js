/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import VideoHandler from '../components/VideoHandler';
import DarkMode from '../components/Theme/DarkMode';

const LickedVideos = () => {
  const theme = DarkMode();
  const user = auth().currentUser;
  const uid = user?.uid;
  const [savedPosts, setSavedPosts] = useState([]);
  const navigation = useNavigation();
  const [loadPosts, setLoadPosts] = useState(true); // Start loading until data is fetched

  useEffect(() => {
    const retrieveSavedPosts = async () => {
      try {
        if (user) {
          const userSavedPostsRef = firestore().collection('videos');
          const querySnapshot = await userSavedPostsRef
            .where('likes_by_user', 'array-contains', user.uid)
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

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="orangered" />

      <View style={styles(theme).topHeader}>
        <View style={styles(theme).topHeaderIcons}>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Ionicons
              name="chevron-back-outline"
              color={theme === 'dark' ? '#fff' : '#121212'}
              size={24}
              style={styles(theme).leftArrowIcon}
            />
          </TouchableOpacity>
          <Text style={styles(theme).uploadTopText}>Licked videos</Text>
        </View>
      </View>
      {loadPosts ? (
        <View style={[styles.ActivityIndicator, styles.horizontal]}>
          <ActivityIndicator size="large" color="tomato" />
        </View>
      ) : (
        <>
          {savedPosts.length === 0 ? (
            <Text style={styles(theme).noVideo}>No licked videos yet.</Text>
          ) : (
            <FlatList
              data={savedPosts}
              keyExtractor={item => item.id}
              renderItem={({item}) => <VideoHandler post={item} />}
            />
          )}
        </>
      )}
    </View>
  );
};

export default LickedVideos;

const styles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    },
    topHeader: {
      backgroundColor: theme === 'dark' ? '#121212' : '#ffffff',
      height: 50,
    },

    topHeaderIcons: {
      margin: 10,
      flexDirection: 'row',
      alignItems: 'center',
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    uploadTopText: {
      fontWeight: 'bold',
      textAlign: 'center',
      marginLeft: 50,
      fontSize: 18,
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    ActivityIndicator: {
      justifyContent: 'center',
      color: 'tomato',
    },
    noVideo:{
      textAlign: 'center',
      justifyContent: 'center',
      color: theme === 'dark' ? '#fff' : '#121212',
    },
  });