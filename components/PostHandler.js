import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Appearance,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import {firestore} from '../data/Firebase';
import Divider from './Divider';
import PostHeaderScreen from './Post/PostHeaderScreen';
import PostDetailsScreen from './Post/PostDetailsScreen';
import PostInteranctionsScreen from './Post/PostInteranctionsScreen';
import DarkMode from './Theme/DarkMode';
 
const PostHandler = ({post}) => {
  const user = auth().currentUser;
  const uid = user?.uid;
  const theme = DarkMode();

  const handleLike = async () => {
    if (!user) return;

    const postRef = firestore().collection('posts').doc(post.id);
    const currentLikeStatus = !post.likes_by_user || !post.likes_by_user.includes(uid);

    try {
      await postRef.update({
        likes_by_user: currentLikeStatus
          ? firestore.FieldValue.arrayUnion(uid)
          : firestore.FieldValue.arrayRemove(uid),
      });
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };



  return (
    <View style={styles(theme).postmainheader}>
      <View style={styles(theme).postmainheaderContent}>
        <PostHeaderScreen post={post} />
        <PostDetailsScreen post={post} />
        <PostInteranctionsScreen post={post} />
        <Divider />
      </View>
    </View>
  );
};

export default PostHandler;

const styles = theme =>
  StyleSheet.create({
    postmainheader: {
      flex: 1,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    },
    postmainheaderContent: {
      flex: 1,
      margin: 10,
      borderRadius: 20,
    },
  });