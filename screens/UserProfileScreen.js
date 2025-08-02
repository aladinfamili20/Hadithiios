/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  FlatList,
  Dimensions,
  Image
} from 'react-native';

import {
  CommonActions,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import DarkMode from '../components/Theme/DarkMode';
import ProfileHeader from '../components/AudienceScreen/ProfileHeader';
import AudienceProfileInfo from '../components/AudienceScreen/AudienceProfileInfo';
import AudienceBio from '../components/AudienceScreen/AudienceBio';
import Video from 'react-native-video';
 import AudienceFriends from '../components/AudienceScreen/AudeinceFriends';
import { useUser } from '../data/Collections/FetchUserData';

const screenWidth = Dimensions.get('window').width;
const imageSize = (screenWidth - 16) / 3;
const UserProfileScreen = () => {
  const theme = DarkMode();
  const { userData } = useUser();
  const [selectedTab, setSelectedTab] = useState('photos'); // or 'videos'
  const [userVideos, setUserVideos] = useState([]);
   const route = useRoute();
  const { uid } = route.params;
  const navigation = useNavigation();
  const [userprofileImages, setUserProfileImages] = useState([]);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    const fetchImages = async () => {
      const postsSnap = await firestore()
        .collection('posts')
        .where('uid', '==', uid)
        .get();
      const images = postsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const getThreads = postsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUserProfileImages(images);
      setThreads(getThreads);
      setLoading(false);
    };
    fetchImages();
  }, [uid]);

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

  useEffect(() => {
    const fetchImages = async () => {
      const postsSnap = await firestore()
        .collection('videos')
        .where('uid', '==', uid)
        .get();
      const images = postsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserVideos(images);
      setLoading(false);
    };
    fetchImages();
  }, [uid]);
 

  const photoPosts = userprofileImages.filter(p => p.image && !p.video);
  const videoPosts = userVideos.filter(p => p.video);
  const captionOnlyPosts = threads.filter(
    post => post.caption && !post.image && !post.video,
  );

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="tomato"
        style={{ marginTop: 50 }}
      />
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
          {/* Video post counter */}
        </View>
      </View>
    );
  };

  const handleRenderPosts = ({ item }) => {
    const hasImage = !!item.image;

    return (
      <View key={item.id} style={styles(theme, imageSize).imageContainer}>
        {hasImage ? (
          <TouchableOpacity
            onPress={() => navigation.navigate('postDetail', { id: item.id })}
            style={styles(theme).imageTouchable}
          >
            <Image
              source={{ uri: item.image }}
              style={styles(theme, imageSize).userPhotos}
            />
          </TouchableOpacity>
        ) : (
          <Text style={styles(theme).missingPostText}>Post unavailable</Text>
        )}
      </View>
    );
  };

  const renderVideoPost = ({ item }) => {
    const hasVideo = !!item.video;
    return (
      <View key={item.id} style={styles(theme, imageSize).imageContainer}>
        {hasVideo ? (
          <TouchableOpacity
            onPress={() => navigation.navigate('videodetails', { id: item.id })}
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
            params: {uid: userId},
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

  return (
    <View>
      <FlatList
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
        style={styles(theme).flatList}
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
    flatList: {
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

export default UserProfileScreen;
