/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-unused-vars */
/* eslint-disable no-dupe-keys */
import React, {useState, useEffect} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
import {CommonActions, useNavigation, useRoute} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {StatusBar} from 'react-native';
import DarkMode from '../../components/Theme/DarkMode';
import UserCollectionFech from '../../components/UserCollectionFech';
import { useUser } from '../../data/Collections/FetchUserData';
import ProfileInfo from '../../components/Video/ProfileInfo';
import VideoInfo from '../../components/Video/VideoInfo';
import VideoCommentSection from '../../components/Video/VideoCommentSection';
import VideoInteractionScreen from '../../components/Video/VideoInteractionScreen';
// import Divider from "../components/Divider";

const VideoDetails = () => {
  const theme = DarkMode();
  const route = useRoute();
  const {id} = route.params;
  const user = auth().currentUser;
  const uid = user?.uid;
  // eslint-disable-next-line no-unused-vars
  const {document, loading} = UserCollectionFech('videos', id);
  const [postDetails, setPostDetails] = useState(null);
  const navigation = useNavigation();
  // eslint-disable-next-line no-unused-vars
  const [comment, setComments] = useState('');
  const {userData} = useUser();
  const [userInfoProfileFetch, setUserProfileFetch] = useState(null);
  const [replies, setReplies] = useState({}); // Track replies for each comment
  const [replyingToCommentId, setReplyingToCommentId] = useState(null); // Track the comment being replied to

  // Function to add a reply to a specific comment



  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    setPostDetails(document);
  }, [document]);

  useEffect(() => {
    if (!user) {
      // navigation.navigate("login");
      console.log('Current logged in user not found');
    }
  }, [user, navigation]);

  useEffect(() => {
    const fetchPostDetails = async () => {
      setIsLoading(true);
      try {
        const docSnapshot = await firestore().collection('videos').doc(id).get();
        if (docSnapshot.exists) {
          setPostDetails({id: docSnapshot.id, ...docSnapshot.data()});
        } else {
          console.error('Post not found');
        }
      } catch (error) {
        console.error('Error fetching post details: ', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostDetails();
  }, [id]);

  

  const CommentsToFirebase = async () => {
    if (!postDetails || !userData) {
      console.error('Post details or user profile fetch is undefined');
      return;
    }
    if (!comment.trim()) return;

    try {
      const {displayName, lastName, profileImage} = userData;

      const today = new Date();
      const date = today.toDateString();
      const Hours = today.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      await firestore()
        .collection('videos')
        .doc(postDetails.id)
        .update({
          comments: firestore.FieldValue.arrayUnion({
            id: new Date().getTime().toString(),
            uploadedDate: date,
            HourPostes: Hours,
            displayName,
            profileImage,
            lastName,
            uid: user.uid,
            comment,
          }),
        });
      setComments('');
      console.log('Comment added successfully!');
    } catch (error) {
      console.error('Error adding comment: ', error);
    }
  };

  const navigateToProfile = userId => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'UserProfileScreen',
        params: {uid: userId},
      }),
    );
  };

  const [imageDimensions, setImageDimensions] = useState({
    width: 1,
    height: 1,
  });

  useEffect(() => {
    if (postDetails?.image) {
      Image.getSize(
        postDetails.image,
        (width, height) => {
          setImageDimensions({width, height});
        },
        error => {
          console.error('Error getting image size:', error);
        },
      );
    }
  }, [postDetails?.image]);

  // Shorting the caption
  function truncateString(str, maxLength) {
    if (str.length > maxLength) {
      return str.substring(0, maxLength) + '...';
    }
    return str;
  }


 

  return (
    <View style={styles(theme).CommentSectionContainer}>
    <StatusBar backgroundColor="orangered" />

    <ScrollView contentContainerStyle={styles(theme).scrollContainer}>
       <ProfileInfo/>

      {isLoading ? (
        <View style={[styles(theme).container, styles(theme).horizontal]}>
          <ActivityIndicator size="large" color="tomato" />
        </View>
      ) : (
        postDetails && (
          <>
          {/* Posted video and caption*/}
          <VideoInfo/>
                         <VideoInteractionScreen post={postDetails}/>

          <VideoCommentSection/>
          </>
        )
      )}

      {/* Comment Input */}
      <View style={styles(theme).commetnSection}>
        <TextInput
          style={styles(theme).commentInput}
          placeholder="Add a comment"
          placeholderTextColor={theme === 'dark' ? '#bbb' : '#888'}
          onChangeText={setComments}
          value={comment}
          maxLength={1500}
        />
        <TouchableOpacity
          onPress={CommentsToFirebase}
          accessible={true}
          accessibilityLabel="Post comment">
          <Ionicons name="send" size={24} color="#FF4500" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  </View>
  );
};

export default VideoDetails;

const styles = theme =>
  StyleSheet.create({
    CommentSectionContainer: {
      flex: 1,
      justifyContent: 'space-between',
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    },
    postContainer: {
      margin: 10,
    },
    profileImage: {
      width: 50,
      height: 50,
      borderRadius: 50,
    },
    profileContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    profileDetails: {
      marginLeft: 10,
    },
    caption: {
      // marginTop: 10,
      // marginBottom: 10,
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    taggedUsers: {
      color: theme === 'dark' ? '#fff' : '#0000FF',
      lineHeight: 20,
      // color: '#0000FF',
      fontWeight: '500',
      // backgroundColor: '#0000FF',
    },
    captionText: {
      marginBottom: 10,
      // marginTop:5,
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    Interactions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      margin: 10,
    },
    image: {
      width: '100%',
      height: 300,
      objectFit: 'contain',
    },
    topHeader: {
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
      height: 50,
      flexDirection: 'row',
      gap: 10,
      marginTop: 10,
      alignItems: 'center',
      alignContent: 'center',
    },

    topHeaderIcons: {
      flexDirection: 'row',
      alignItems: 'center',
      // marginTop: 15,
      marginLeft: 10,
    },

    container: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    uploadTopText: {
      color: theme === 'dark' ? '#121212' : '#fff',
      fontWeight: 'bold',
      marginLeft: 10,
    },
    container2: {
      flex: 1,
      justifyContent: 'center',
    },
    horizontal: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: 10,
    },
    ReplyCommenterContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme === 'dark' ? '#5f5f5f' : '#f5f5f5',
      marginTop: 10,
    },
    ReplyCommentProfileImage: {
      width: 30,
      height: 30,
      borderRadius: 50,
    },
    ReplyCommentProfileInfo: {
      marginLeft: 5,
    },
    CommentProfileImage: {
      width: 40,
      height: 40,
      borderRadius: 50,
    },
    commenterContainer: {
      marginLeft: 10,
      flexDirection: 'row',
    },
    replyInput: {
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    commentProfileInfo: {
      marginLeft: 10,
      marginBottom: 10,
      backgroundColor: theme === 'dark' ? '#5f5f5f' : '#f5f5f5',
      borderRadius: 10,
      padding: 5,
    },
    commentH2: {
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    timetemp: {
      fontSize: 12,
    },
    commentSecionContainer: {
      margin: 10,
    },
    commentContant: {
      flexDirection: 'row',
    },
    displayName: {
      fontWeight: 'bold',
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    commenterContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    commenterMainContainer: {
      flex: 1, // Ensures this section takes up available space
      marginLeft: 10,
      width: Dimensions.get('window').width * 0.8,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    },

    commenterContainer: {
      flexDirection: 'row',
    },

    commetnSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      margin: 10,
      borderWidth: 1,
      borderColor: theme === 'dark' ? '#fff' : '#ccc',
      padding: 7,
      // backgroundColor: theme === 'dark' ? '#121212' : '#fff',
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: 40
    },
    commentInput: {
      width: Dimensions.get('window').width * 0.7,
      marginLeft: 7,
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    commentSectionComment: {
      flex: 1,
      padding: 8,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
      borderRadius: 20,
    },
    sent: {
      marginLeft: 8,
      marginTop: 3,
    },
    // Caption text modal
    CaptionModalContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 200,
    },
    CaptionModalContent: {
      width: 320,
      padding: 20,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
      borderRadius: 10,
      alignItems: 'center',
      elevation: 10,
      height: 'auto',
    },
    CommentModalContent: {
      width: 320,
      padding: 20,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
      borderRadius: 10,
      alignItems: 'center',
      elevation: 10,
      height: 400,
    },
    CaptionModalButtons: {
      flexDirection: 'row',
      marginTop: 20,
      justifyContent: 'space-between',
      gap: 10,
      width: '100%',
      textAlign: 'center',
    },
    caprionReportInput: {
      borderWidth: 1,
      borderColor: '#5b5b5b',
      padding: 10,
      width: '100%',
    },
  });


