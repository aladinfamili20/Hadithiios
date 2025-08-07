/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  // Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { CommonActions, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Divider from '../components/Divider';
import DarkMode from '../components/Theme/DarkMode';
import Image from 'react-native-image-progress';
// import ProgressBar from 'react-native-progress/Bar';

const PAGE_SIZE = 15;

const SearchScreen = () => {
  const theme = DarkMode();
  const [loading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [postData, setPostData] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [lastPostDoc, setLastPostDoc] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation();

  const navigateToProfile = userId => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'UserProfileScreen',
        params: { uid: userId },
      }),
    );
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return;
    }

    try {
      setIsLoadingUsers(true);
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
      setIsLoadingUsers(false);
    } catch (error) {
      console.error('Error searching users:', error);
      setIsLoadingUsers(false);
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
  }, [searchQuery]);

  const fetchPosts = async (loadMore = false) => {
    if (fetchingMore || !hasMorePosts) return;
    setFetchingMore(true);
    const postRef = firestore()
      .collection('posts')
      .orderBy('createdAt', 'desc');

    try {
      const snapshot = loadMore
        ? await postRef.startAfter(lastPostDoc).limit(PAGE_SIZE).get()
        : await postRef.limit(PAGE_SIZE).get();

      const newDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setPostData(prev => (loadMore ? [...prev, ...newDocs] : newDocs));
      setLastPostDoc(snapshot.docs[snapshot.docs.length - 1]);

      if (snapshot.docs.length < PAGE_SIZE) setHasMorePosts(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setFetchingMore(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setHasMorePosts(true);
    setLastPostDoc(null);
    await fetchPosts(false); // re-fetch from beginning
    setRefreshing(false);
  };

  const renderImage = ({ item }) => {
    if (!item?.image || !item?.id) return null;
    return (
      <View style={styles(theme).imageContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('postDetail', { id: item.id })}
           accessible={true}
        accessibilityLabel="Open post details"
        >
          <Image
            source={{ uri: item.image }}
            style={{
              width: '100%',
              height: 130,
              borderRadius: 10,
            }}
          />
        </TouchableOpacity>
      </View>
    );
  };

 

  return (
    <View style={styles(theme).searchContainer}>
      <View style={styles(theme).topHeader}>
        <View style={styles(theme).topHeaderIcons}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons
              name="chevron-back-outline"
              color={theme === 'dark' ? '#fff' : '#121212'}
              size={24}
              style={styles(theme).leftArrowIcon}
            />
          </TouchableOpacity>
          <View style={styles(theme).searchContentInfos}>
            <View style={styles(theme).searchContent}>
              <TextInput
                placeholder="Search users..."
                value={searchQuery}
                onChangeText={text => setSearchQuery(text)}
                style={styles(theme).searchBar}
                placeholderTextColor="#888"
              />
              <TouchableOpacity onPress={handleSearch}>
                <Ionicons
                  name="search-outline"
                  color={theme === 'dark' ? '#fff' : '#121212'}
                  size={24}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {loading || isLoadingUsers ? (
        <View style={[styles(theme).container1, styles(theme).horizontal]}>
          <ActivityIndicator size="large" color="tomato" />
        </View>
      ) : searchQuery.trim().length === 0 ? (
        <FlatList
          // data={postData}
          data={postData.filter(post => !!post.image)}

          initialNumToRender={9}
          maxToRenderPerBatch={15}
          windowSize={10}
          keyExtractor={(item, index) =>
            item.id ? item.id.toString() : index.toString()
          }
          numColumns={3}
          key={'threeColumns'}
          renderItem={renderImage}
          onEndReached={() => fetchPosts(true)}
          onEndReachedThreshold={0.1}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListFooterComponent={
            fetchingMore && (
              <View style={{ padding: 10 }}>
                <ActivityIndicator size="small" color="tomato" />
              </View>
            )
          }
        />
      ) : isLoadingUsers ? (
        <View style={[styles(theme).container1, styles(theme).horizontal]}>
          <ActivityIndicator size="large" color="tomato" />
        </View>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item, index) =>
            item.id ? item.id.toString() : index.toString()
          }
          initialNumToRender={9}
          maxToRenderPerBatch={15}
          windowSize={10}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigateToProfile(item.id)}
              style={styles(theme).searchItem}
            >
              <View style={styles(theme).searchInfo}>
                <View style={styles(theme).SearchPhotoContainer}>
                  <Image
                    source={{ uri: item.profileImage }}
                    // style={styles(theme).profileImage}
                    style={{ width: 35, height: 35, borderRadius: 20 }}
                  />
                </View>
                <View style={styles(theme).textContainer}>
                  <Text style={styles(theme).displayName}>
                    {item.displayName} {item.lastName}
                  </Text>
                  <Text style={styles(theme).username}>@{item.userName}</Text>
                </View>
              </View>
              <Divider />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

export default SearchScreen;

const styles = theme =>
  StyleSheet.create({
    searchContainer: {
      flex: 1,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    },
    topHeader: {
      // paddingHorizontal: 10,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
      height: 70,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    topHeaderIcons: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    leftArrowIcon: {
      marginRight: 10,
    },
    searchContentInfos: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: 10,
    },
    searchContent: {
      flexDirection: 'row',
      backgroundColor: theme === 'dark' ? '#2C2C2C' : '#F2F2F2',
      borderRadius: 25,
      paddingHorizontal: 10,
      height: 45,
      alignItems: 'center',
      flex: 1,
    },
    searchBar: {
      flex: 1,
      color: theme === 'dark' ? '#fff' : '#121212',
      fontSize: 16,
      paddingVertical: 0,
    },
    searchItem: {
      marginVertical: 10,
      paddingHorizontal: 15,
    },
    searchInfo: {
      flexDirection: 'row',
      // alignItems: 'center',

    },
    SearchPhotoContainer: {
      // width: '100%',
      // padding: 5,
      marginBottom: 10,
      borderRadius: 20,
      overflow: 'hidden',
    },
    // profileImage: {
    //   width: 30,
    //   height: 30,
    //   borderRadius: 50,
    // },

    textContainer: {
      marginLeft: 10,
      // marginBottom: 5
    },
    displayName: {
      // fontSize: 18,
      fontWeight: 'bold',
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    username: {
      color: theme === 'dark' ? '#fff' : '#888',
    },
    container1: {
      flex: 1,
      justifyContent: 'center',
    },
    horizontal: {
      flexDirection: 'row',
      justifyContent: 'center',
      padding: 10,
    },
    container: {
      flex: 1, // Take up all the available space
      flexDirection: 'row', // Row direction for images
      flexWrap: 'wrap', // Allow wrapping to the next line
      justifyContent: 'space-between', // Ensure the items are spaced evenly
    },

    imageContainer: {
      width: '33%', // Take up 1/3 of the screen width for each image container
      padding: 5, // Add some padding between the images
      marginBottom: 10, // Add some space at the bottom
      borderRadius: 20,
      overflow: 'hidden',
    },

    PhotoContainer: {
      width: '33%',
      padding: 5,
      marginBottom: 10,
      borderRadius: 20,
      overflow: 'hidden',
    },
    // userPhotos: {
    //   width: '100%',  // Ensure the image takes up the full width of the container
    //   height: 130,    // Adjust the height of the image as needed
    //   borderRadius: 10,  // Optional: give rounded corners to the images
    // },
  });
