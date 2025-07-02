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
import PostHandler from '../components/PostHandler';

const SavedPhotos = () => {
  const [theme, setTheme] = useState(Appearance.getColorScheme());

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({colorScheme}) => {
      setTheme(colorScheme);
    });

    return () => {
      subscription.remove();
    };
  }, []);
  const user = auth().currentUser;
  const uid = user?.uid;
  const [savedPosts, setSavedPosts] = useState([]);
  const navigation = useNavigation();
  const [loadPosts, setLoadPosts] = useState(true); // Start loading until data is fetched

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

        <Text style={styles(theme).texth1}>Saved photos</Text>
      </View>
      {loadPosts ? (
        <View style={[theme.ActivityIndicator, theme.horizontal]}>
          <ActivityIndicator size="large" color="tomato" />
        </View>
      ) : (
        <>
          {savedPosts.length === 0 ? (
            <Text style={styles(theme).noPhoto}>No saved photo(s) yet.</Text>
          ) : (
            <FlatList
              data={savedPosts}
              keyExtractor={item => item.id}
              renderItem={({item}) => <PostHandler post={item} />}
            />
          )}
        </>
      )}
    </View>
  );
};

export default SavedPhotos;

const styles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    },

    ActivityIndicator: {
      justifyContent: 'center',
      color: 'tomato',
    },
    topHeaderIcons: {
      backgroundColor: theme === 'dark' ? '#fff' : '#fff',
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
    noPhoto:{
      textAlign: 'center',
      justifyContent:'center',
      color: theme === 'dark' ? '#fff' : '#121212',
    },
  });