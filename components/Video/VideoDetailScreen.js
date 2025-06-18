/* eslint-disable react-native/no-inline-styles */
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {CommonActions, useNavigation} from '@react-navigation/native';
// import {truncateString} from '../TextShortner';
import Video from 'react-native-video';
import {useRef} from 'react';
import DarkMode from '../Theme/DarkMode';
import { truncateString } from '../TextShortner';

const VideoDetailScreen = ({post}) => {
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
        params: {uid: userId},
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

const TaggedUsers = ({post, theme, navigateToProfile}) => {
  if (!Array.isArray(post?.taggedUsers) || post.taggedUsers.length === 0) {
    return null;
  }

  return (
    <View style={styles(theme).taggedUsersContainer}>
      {post.taggedUsers.map((tag, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => navigateToProfile(tag.uid)}>
          <Text style={styles(theme).taggedUserText}>
            @{tag.displayName}
            {tag.lastName ? ` ${tag.lastName}` : ''}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const PostCaption = ({post, theme}) => {
  const [captionModal, setCaptionModal] = useState(false);
  const openCaption = () => setCaptionModal(true);
  const closeCaption = () => setCaptionModal(false);

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
        onRequestClose={closeCaption}>
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

const PostVideo = ({post, theme, Video}) => {
  const [isPaused, setIsPaused] = useState(true);
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
  const aspectRatio = videoDimensions.width && videoDimensions.height
  ? videoDimensions.width / videoDimensions.height
  : 1; // fallback
  const togglePlayPause = () => {
    setIsPaused(prev => !prev);
  };
  const onVideoEnd = () => {
    videoRef.current?.seek(0); // Seek to the beginning
    setIsPaused(true); // Show play button again
  };
  const onLoad = (data) => {
    const { width, height } = data.naturalSize;
    if (width && height) {
      setVideoDimensions({ width, height });
    }
  };

  useEffect(() => {
    return () => {
      setIsPaused(true); // Pause video when screen unmounts
    };
  }, []);

  const videoRef = useRef(null);
  if (typeof post?.video !== 'string' || !Video) {
    return null;
  }

  return (
    <View
  style={[
    styles(theme).videoContainer,
    {
      aspectRatio,
      maxHeight: 500, // LIMIT HEIGHT to avoid super tall videos
      alignSelf: 'center',
     },
  ]}>
  <TouchableOpacity onPress={togglePlayPause} activeOpacity={0.9}>
    <Video
      ref={videoRef}
      source={{ uri: post.video }}
      onError={(e) => console.error('Video error:', e)}
      onLoad={onLoad}
      resizeMode="contain"
      paused={isPaused}
      repeat={true}
      style={{ width: '100%', height: '100%' }}
      onEnd={onVideoEnd}
    />
  </TouchableOpacity>

  {/* {isPaused && (
    <TouchableOpacity
      onPress={togglePlayPause}
      style={styles(theme).playButtonOverlay}>
      <Ionicons name="play-circle" size={60} color="#fff" />
    </TouchableOpacity>
  )} */}
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

    videoContainer: {
        width: '100%',
        marginTop: 10,
        overflow: 'hidden',
        backgroundColor: '#000',
      },
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
  });