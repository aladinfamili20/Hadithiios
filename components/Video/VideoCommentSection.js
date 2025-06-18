/* eslint-disable react-native/no-inline-styles */
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DarkMode from '../Theme/DarkMode';
import {CommonActions, useNavigation, useRoute} from '@react-navigation/native';
import { useUser } from '../../data/Collections/FetchUserData';
import { auth, firestore } from '../../data/Firebase';
import UserCollectionFech from '../UserCollectionFech';

const VideoCommentSection = () => {
  const theme = DarkMode();
  const route = useRoute();
  const {userData} = useUser();
  const {id} = route.params;
  const user = auth().currentUser;
   const navigation = useNavigation();
  const {document, loading} = UserCollectionFech('videos', id);
  const [postDetails, setPostDetails] = useState(null);
  const [replies, setReplies] = useState({}); // Track replies for each comment
  const [replyingToCommentId, setReplyingToCommentId] = useState(null); // Track the comment being replied to
  const [comment, setComments] = useState('');

  useEffect(() => {
    setPostDetails(document);
  }, [document]);

  // Use Firestore onSnapshot to listen for real-time updates on comments
  useEffect(() => {
    const unsubscribe = firestore()
      .collection('videos')
      .doc(id)
      .onSnapshot(docSnapshot => {
        if (docSnapshot.exists) {
          const data = docSnapshot.data();
          setPostDetails({id: docSnapshot.id, ...data});
          setComments(data.comments || []);
        }
      });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, [id]);

  const addReplyToFirebase = async commentId => {
    if (!postDetails || !userData || !replies[commentId]?.trim()) {
      console.error('Post details, user profile fetch, or reply is undefined');
      return;
    }

    try {
      const {displayName, lastName, profileImage} = userData;
      const today = new Date();
      const date = today.toDateString();
      const Hours = today.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      // Find the comment being replied to and add the reply
      const updatedComments = postDetails.comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: [
              ...(comment.replies || []),
              {
                uploadedDate: date,
                HourPostes: Hours,
                displayName,
                profileImage,
                lastName,
                uid: user.uid,
                reply: replies[commentId], // Use specific reply text
              },
            ],
          };
        }
        return comment;
      });

      // Update Firestore
      await firestore().collection('videos').doc(postDetails.id).update({
        comments: updatedComments,
      });

      // Clear the reply for this comment
      setReplies(prevReplies => ({
        ...prevReplies,
        [commentId]: '',
      }));

      console.log('Reply added successfully!');
    } catch (error) {
      console.error('Error adding reply: ', error);
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
  return (
 <View>
   {/* Comment Section */}
   {postDetails && (
     <View style={styles(theme).commenterMainContainer}>
       {postDetails.comments?.length > 0 ? (
         postDetails.comments.map((comment, index) => (
           <View key={index} style={styles(theme).commenterContainer}>
             <TouchableOpacity onPress={() => navigateToProfile(comment.uid)}>
               <Image
                 source={{ uri: comment.profileImage }}
                 style={styles(theme).commentProfileImage}
               />
             </TouchableOpacity>
 
             <View style={styles(theme).commentContent}>
               <TouchableOpacity onPress={() => navigateToProfile(comment.uid)}>
                 <Text style={styles(theme).commentDisplayName}>
                   {comment.displayName} {comment.lastName}
                 </Text>
               </TouchableOpacity>
               <Text style={styles(theme).commentText}>{comment.comment}</Text>
 
               {/* Replies */}
               {comment.replies?.length > 0 && (
                 <View style={styles(theme).repliesContainer}>
                   {comment.replies.map((reply, replyIndex) => (
                     <View key={replyIndex} style={styles(theme).replyContainer}>
                       <TouchableOpacity onPress={() => navigateToProfile(reply.uid)}>
                         <Image
                           source={{ uri: reply.profileImage }}
                           style={styles(theme).replyProfileImage}
                         />
                       </TouchableOpacity>
                       <View style={styles(theme).replyContent}>
                         <TouchableOpacity onPress={() => navigateToProfile(reply.uid)}>
                           <Text style={styles(theme).replyDisplayName}>
                             {reply.displayName} {reply.lastName}
                           </Text>
                         </TouchableOpacity>
                         <Text style={styles(theme).commentText}>{reply.reply}</Text>
                       </View>
                     </View>
                   ))}
                 </View>
               )}
 
               {/* Reply Button */}
               <TouchableOpacity
                 onPress={() => setReplyingToCommentId(comment.id)}
                 style={styles(theme).replyButton}>
                 <Text style={styles(theme).replyButtonText}>Reply</Text>
               </TouchableOpacity>
 
               {/* Reply Input */}
               {replyingToCommentId === comment.id && (
                 <View style={styles(theme).replyInputContainer}>
                   <TextInput
                     style={styles(theme).replyInput}
                     placeholder="Write a reply..."
                     placeholderTextColor={theme === 'dark' ? '#bbb' : '#888'}
                     value={replies[comment.id] || ''}
                     onChangeText={text =>
                       setReplies(prev => ({
                         ...prev,
                         [comment.id]: text,
                       }))
                     }
                   />
                   <TouchableOpacity onPress={() => addReplyToFirebase(comment.id)}>
                     <Ionicons name="send" size={20} color="#FF4500" />
                   </TouchableOpacity>
                 </View>
               )}
             </View>
           </View>
         ))
       ) : (
         <Text style={styles(theme).noComment}>No comments yet, be the first!</Text>
       )}
     </View>
   )}
 </View>
  )
}

export default VideoCommentSection

const styles = theme =>
  StyleSheet.create({
    CommentSectionContainer: {
      flex: 1,
      justifyContent: 'space-between',
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
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
    noComment:{
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    commentSecionContainer: {
      margin: 10,
    },
    commentContant: {
      flexDirection: 'row',
    },

    commenterContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      marginLeft: 10,
    },
    commenterMainContainer: {
      flex: 1, // Ensures this section takes up available space
      marginLeft: 10,
      width: Dimensions.get('window').width * 0.8,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    },

    // commenterContainer: {
    //   flexDirection: 'row',
    // },


  });