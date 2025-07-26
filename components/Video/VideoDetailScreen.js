/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { CommonActions, useNavigation } from '@react-navigation/native';
import Video from 'react-native-video';
import { useRef } from 'react';
import DarkMode from '../Theme/DarkMode';
// import { truncateString } from '../TextShortner';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FieldValue } from '@react-native-firebase/firestore';
import { auth, firestore } from '../../data/Firebase';

const VideoDetailScreen = ({ post }) => {
  // console.log(post);
  const theme = DarkMode();
  const navigation = useNavigation();
  const [isPaused, setIsPaused] = useState(true); // Track whether video is
  const togglePlayPause = () => {
    setIsPaused(prev => !prev);
  };
  const navigateToProfile = userId => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'UserProfileScreen',
        params: { uid: userId },
      }),
    );
  };

  useEffect(() => {
    return () => {
      setIsPaused(true); // Pause video when screen unmounts
    };
  }, []);

  if (!post) {
    return null;
  } // or a loading indicator

  return (
    <View style={styles(theme).postDetails}>
      <View style={styles(theme).postDetails}>
        <TaggedUsers
          post={post}
          theme={theme}
          navigateToProfile={navigateToProfile}
        />
        <PostCaption post={post} theme={theme} />
        <PostVideo
          post={post}
          theme={theme}
          isPaused={isPaused}
          togglePlayPause={togglePlayPause}
          Video={Video}
        />
      </View>
    </View>
  );
};

const TaggedUsers = ({ post, theme, navigateToProfile }) => {
  if (!Array.isArray(post?.taggedUsers) || post.taggedUsers.length === 0) {
    return null;
  }

  return (
    <View style={styles(theme).taggedUsersContainer}>
      {post.taggedUsers.map((tag, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => navigateToProfile(tag.uid)}
        >
          <Text style={styles(theme).taggedUserText}>
            @{tag.displayName}
            {tag.lastName ? ` ${tag.lastName}` : ''}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const PostCaption = ({ post, theme }) => {
  const [captionModal, setCaptionModal] = useState(false);
  const openCaption = () => setCaptionModal(true);
  const closeCaption = () => setCaptionModal(false);
  const truncateString = (str, maxLength) => {
    return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
  };
  return (
    <>
      <TouchableOpacity onPress={openCaption}>
        <Text style={styles(theme).captionText}>
          {truncateString(post?.caption, 200)}
        </Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={captionModal}
        onRequestClose={closeCaption}
      >
        <View style={styles(theme).modalOverlay}>
          <View style={styles(theme).modalContainer}>
            <View style={styles(theme).ReportModalContent}>
              <Text style={styles(theme).modalTitle}>Caption</Text>
              <ScrollView>
                <Text style={styles(theme).captionModal}>{post?.caption}</Text>
              </ScrollView>
              <View style={styles(theme).modalButtons}>
                <TouchableOpacity onPress={closeCaption}>
                  <Text style={styles(theme).close}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const PostVideo = ({ post, theme, Video }) => {
  const [isPaused, setIsPaused] = useState(true);
  const [videoDimensions, setVideoDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [liveViewCount, setLiveViewCount] = useState(post.views || 0);
  const [hasViewed, setHasViewed] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const unsub = firestore()
      .collection('videos')
      .doc(post.id)
      .onSnapshot(docSnap => {
        if (docSnap.exists) {
          const data = docSnap.data();
          setLiveViewCount(data.views || 0);
        }
      });

    return () => unsub();
  }, [post.id]);

  // useEffect(() => {
  //   trackView();
  // }, []);

  const trackView = async () => {
    try {
      const userId = auth().currentUser?.uid;
      const videoDocRef = firestore().collection('videos').doc(post.id);

      if (userId) {
        await videoDocRef.update({
          views: FieldValue.increment(1), // ✅
        });
      }
    } catch (error) {
      console.error('[trackView] Error incrementing views:', error);
    }
  };

  const handleProgress = ({ currentTime }) => {
    if (!hasViewed && currentTime >= 1) {
      setHasViewed(true);
      trackView();
    }
  };

  const aspectRatio =
    videoDimensions.width && videoDimensions.height
      ? videoDimensions.width / videoDimensions.height
      : 1;

  const togglePlayPause = () => {
    setIsPaused(prev => !prev);
  };

  const onVideoEnd = () => {
    videoRef.current?.seek(0);
    setIsPaused(true);
  };

  const onLoad = data => {
    const { width, height } = data.naturalSize;
    if (width && height) {
      setVideoDimensions({ width, height });
    }
  };

  useEffect(() => {
    return () => {
      setIsPaused(true);
    };
  }, []);

  if (typeof post?.video !== 'string' || !Video) return null;

  return (
    <View
      style={[
        styles(theme).videoContainer,
        {
          aspectRatio,
          maxHeight: 600,
          alignSelf: 'center',
          overflow: 'hidden',
          borderRadius: 16,
        },
      ]}
    >
      <TouchableOpacity onPress={togglePlayPause} activeOpacity={0.9}>
        <Video
          ref={videoRef}
          source={{ uri: post.video }}
          onError={e => console.error('Video error:', e)}
          onLoad={onLoad}
          onProgress={handleProgress}
          resizeMode="contain"
          paused={isPaused}
          repeat
          style={{ width: '100%', height: '100%' }}
          onEnd={onVideoEnd}
        />
      </TouchableOpacity>

      {/* View Counter */}
      <View style={styles(theme).viewCounter}>
        <Ionicons name="eye-outline" size={16} color="#fff" />
        {/* <Text style={styles(theme).viewText}>{post.views || 0} views</Text> */}
        <Text style={styles(theme).viewText}>{liveViewCount} views</Text>
      </View>
    </View>
  );
};

export default VideoDetailScreen;

const styles = theme =>
  StyleSheet.create({
    taggedUsersContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginLeft: 10,
    },
    taggedUserText: {
      color: 'tomato',
      fontWeight: '600',
      fontSize: 14,
    },
    captionText: {
      fontSize: 14,
      color: theme === 'dark' ? '#ccc' : '#333',
      marginLeft: 10,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: theme === 'dark' ? '#222' : '#fff',
      padding: 20,
      borderRadius: 10,
      width: '85%',
      maxHeight: '70%',
    },
    ReportModalContent: {
      alignItems: 'flex-start',
    },
    modalTitle: {
      color: theme === 'dark' ? '#fff' : '#121212',
      fontWeight: 'bold',
      fontSize: 16,
      marginBottom: 10,
    },
    captionModal: {
      fontSize: 14,
      color: theme === 'dark' ? '#ccc' : '#333',
      marginBottom: 10,
    },
    modalButtons: {
      marginTop: 10,
      alignSelf: 'flex-end',
    },
    close: {
      color: 'tomato',
      fontWeight: 'bold',
      fontSize: 14,
    },

    // videoContainer: {
    //     width: '100%',
    //      marginTop: 10,
    //     overflow: 'hidden',
    //     backgroundColor: '#000',
    //   },
    video: {
      width: '100%',
      height: '100%',
    },
    playButtonOverlay: {
      position: 'absolute',
      top: '45%',
      left: '45%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderRadius: 30,
    },
    videoContainer: {
      width: '100%',
      backgroundColor: '#000', // fallback in case video fails
      position: 'relative',
      marginTop: 10,
    },
    viewCounter: {
      position: 'absolute',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 12,
      bottom: 10,
      right: 10,
    },
    viewText: {
      color: '#fff',
      fontSize: 14,
      marginLeft: 4,
    },
  });
