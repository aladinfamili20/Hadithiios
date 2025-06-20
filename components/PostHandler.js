import React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import Divider from './Divider';
import PostHeaderScreen from './Post/PostHeaderScreen';
import PostDetailsScreen from './Post/PostDetailsScreen';
import PostInteranctionsScreen from './Post/PostInteranctionsScreen';
import DarkMode from './Theme/DarkMode';
 
const PostHandler = ({post}) => {
  const user = auth().currentUser;
  const uid = user?.uid;
  const theme = DarkMode();




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