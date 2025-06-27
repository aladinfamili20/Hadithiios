/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  FlatList,
  Dimensions,
} from 'react-native';

import {useNavigation, useRoute} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import DarkMode from '../components/Theme/DarkMode';
import ProfileHeader from '../components/AudienceScreen/ProfileHeader';
import AudienceProfileInfo from '../components/AudienceScreen/AudienceProfileInfo';
import AudienceBio from '../components/AudienceScreen/AudienceBio';
import Video from 'react-native-video';
import Image from 'react-native-image-progress';
import AudienceFriends from '../components/AudienceScreen/AudeinceFriends';
import { useUser } from '../data/Collections/FetchUserData';

const screenWidth = Dimensions.get('window').width;
const imageSize = (screenWidth - 16) / 3;
const UserProfileScreen = () => {
  const theme = DarkMode();
  const {userData} = useUser();
  const [selectedTab, setSelectedTab] = useState('photos'); // or 'videos'
  const [userVideos, setUserVideos] = useState([]);
  const [videoCounter, setVideoCounter] = useState([]);
  const route = useRoute();
  const {uid} = route.params;
  const navigation = useNavigation();

  const [userprofileImages, setUserProfileImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [userPostsCount, setUserPostsCount] = useState(0);
  const renderPosts = selectedTab === 'photos' ? userprofileImages : userVideos;
  let post = userPostsCount + videoCounter;
  useEffect(() => {
    const fetchImages = async () => {
      const postsSnap = await firestore()
        .collection('posts')
        .where('uid', '==', uid)
        .get();
      const images = postsSnap.docs.map(doc => ({id: doc.id, ...doc.data()}));
      setUserProfileImages(images);
      setLoading(false);
    };
    fetchImages();
  }, [uid]);

  useEffect(() => {
    const fetchImages = async () => {
      const postsSnap = await firestore()
        .collection('videos')
        .where('uid', '==', uid)
        .get();
      const images = postsSnap.docs.map(doc => ({id: doc.id, ...doc.data()}));
      setUserVideos(images);
      setLoading(false);
    };
    fetchImages();
  }, [uid]);

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

  if (loading) {
    return (
      <ActivityIndicator size="large" color="tomato" style={{marginTop: 50}} />
    );
  }

  const renderAudienceProfile = () => {
    return (
      <View style={styles(theme, imageSize).profileContainer}>
        <StatusBar style="auto" />
        <ProfileHeader userData={userData} />
        <View style={styles(theme, imageSize).profileContents}>
          <AudienceProfileInfo />

          {/* Bio */}
          <AudienceBio />

          <AudienceFriends />

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginVertical: 10,
            }}>
            <TouchableOpacity
              onPress={() => setSelectedTab('photos')}
              style={{
                padding: 10,
                backgroundColor: selectedTab === 'photos' ? 'tomato' : 'gray',
                borderTopLeftRadius: 8,
                borderBottomLeftRadius: 8,
              }}>
              <Text style={{color: 'white'}}>Photos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedTab('videos')}
              style={{
                padding: 10,
                backgroundColor: selectedTab === 'videos' ? 'tomato' : 'gray',
                borderTopRightRadius: 8,
                borderBottomRightRadius: 8,
              }}>
              <Text style={{color: 'white'}}>Videos</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles(theme, imageSize).userPhotosLenghts}>
          <Text style={styles(theme, imageSize).photosLenghts}>{post}</Text>
          <Text style={styles(theme, imageSize).photosText}> Posts</Text>
          {/* Video post counter */}
        </View>
      </View>
    );
  };

  return (
    <View>
      <FlatList
        data={renderPosts}
        numColumns={3}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderAudienceProfile}
        columnWrapperStyle={{justifyContent: 'space-between'}}
        removeClippedSubviews={false}
        initialNumToRender={12}
        maxToRenderPerBatch={15}
        style={styles(theme).flatList}
        windowSize={10}
        renderItem={({item}) => (
          <View key={item} style={styles(theme, imageSize).imageContainer}>
            {selectedTab === 'photos' ? (
              <>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('postDetail', {id: item.id})
                  }
                  style={styles(theme).imageTouchable}>
                  <Image
                    source={{uri: item.image}}
                    style={styles(theme, imageSize).userPhotos}
                    // resizeMode={FastImage.resizeMode.cover}
                  />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('videodetails', {id: item.id})
                  }>
                  <Video
                    source={{uri: item.video}}
                    style={styles(theme, imageSize).userPhotos}
                    resizeMode="cover"
                    muted
                    repeat
                    paused
                  />
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      />
    </View>
  );
};

const styles = (theme, imageSize) =>
  StyleSheet.create({
    profileContainer: {
      // marginTop: Platform.OS === "ios" ? -9 : 25,
      flex: 1,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    },
    flatList:{
            backgroundColor: theme === 'dark' ? '#121212' : '#fff',

    },
    profileContents: {
      margin: 10,
    },
    editProfileIcon: {
      position: 'absolute',
      left: '46%',
      top: '107%',
      backgroundColor: 'tomato',
      borderRadius: 20,
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    photosLenghts: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
      marginTop: 20,
      color: theme === 'dark' ? '#fff' : '#121212',
    },
     photosText: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
      marginTop: 20,
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    headerIcons: {
      margin: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    arrowBackIcon: {
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
      borderRadius: 50,
      // color: theme === 'dark' ? '#fff' : '#121212',
    },
    dotsIcon: {
      backgroundColor: theme === 'dark' ? '#fff' : '#121212',
      borderRadius: 50,
    },
    topHeaderIcons: {
      margin: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    imageContainer: {
      margin: 2,
      position: 'relative',
      width: imageSize,
      // backgroundColor: theme === 'dark' ? '#fff' : '#121212',
    },

    userPhotos: {
      width: imageSize,
      height: imageSize,
      borderRadius: 8,
      backgroundColor: theme === 'dark' ? '#333' : '#eee',
      aspectRatio: 1,
      flexShrink: 0,
    },
    userPhotosLenghts: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });

export default UserProfileScreen;