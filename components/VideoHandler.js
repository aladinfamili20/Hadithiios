/* eslint-disable curly */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-unused-vars */
/* eslint-disable no-dupe-keys */
/* eslint-disable no-shadow */
/* eslint-disable no-self-compare */
/* eslint-disable react-native/no-inline-styles */
import {StyleSheet, View} from 'react-native';
import React from 'react';
import {firestore} from '../data/Firebase';
import auth from '@react-native-firebase/auth';
import DarkMode from './Theme/DarkMode';
import VideoHeader from './Video/VideoHeader';
import VideoInteractionScreen from './Video/VideoInteractionScreen';
import VideoDetailScreen from './Video/VideoDetailScreen';
import VideosAds from '../screens/Video/VideosAds';

const VideoHandler = ({post}) => {
  const theme = DarkMode();
  const user = auth().currentUser;

  if (!post || !post.id) {
    console.warn('Invalid post data in VideoHandler');
    return null;
  }

  const handleLike = async () => {
    if (!user) return;

    const uid = user.uid;
    const postRef = firestore().collection('videos').doc(post.id);
    const currentLikeStatus =
      !post.likes_by_user || !post.likes_by_user.includes(uid);

    try {
      await postRef.update({
        likes_by_user: currentLikeStatus
          ? firestore.FieldValue.arrayUnion(uid)
          : firestore.FieldValue.arrayRemove(uid),
      });
      console.log('Post liked/unliked successfully.');
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };

  return (
    <View style={styles(theme).container}>
      <View style={styles(theme).postHeader}>
        <VideoHeader post={post} theme={theme} user={user} />
      </View>
      <VideoDetailScreen post={post} />
      <VideoInteractionScreen
        post={post}
        theme={theme}
        handleLike={handleLike}
      />
    </View>
  );
};

export default VideoHandler;

const styles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    },
  });