/* eslint-disable no-shadow */
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
import {auth, firestore} from '../../data/Firebase';
import UserCollectionFech from '../UserCollectionFech';
import {useUser} from '../../data/Collections/FetchUserData';
import PostInteranctionsScreen from '../Post/PostInteranctionsScreen';

const CommentSection = () => {
  const theme = DarkMode();
  const route = useRoute();
  const {userData} = useUser();
  const {id} = route.params;
  const user = auth().currentUser;
   const navigation = useNavigation();
  const {document, loading} = UserCollectionFech('posts', id);
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
      .collection('posts')
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
      await firestore().collection('posts').doc(postDetails.id).update({
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
{postDetails && <PostInteranctionsScreen post={postDetails} />}

  {postDetails && (
    <View style={styles(theme).commenterMainContainer}>
      {postDetails.comments?.length > 0 ? (
        postDetails.comments.map((comment, index) => (
          <View key={index} style={styles(theme).commenterContainer}>
            <TouchableOpacity onPress={() => navigateToProfile(comment.uid)}>
              <Image
              source={comment.profileImage ? {uri: comment.profileImage}   : require('../../assets/thumblogo.png')}

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
                            source={reply.profileImage ? {uri: reply.profileImage}   : require('../../assets/thumblogo.png')}

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

  );
};

export default CommentSection;

const styles = theme =>
  StyleSheet.create({
  commenterMainContainer: {
  padding: 16,
},

commenterContainer: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  marginBottom: 16,
},

commentProfileImage: {
  width: 40,
  height: 40,
  borderRadius: 20,
  marginRight: 12,
},

commentContent: {
  flex: 1,
},

commentDisplayName: {
  fontWeight: '600',
  fontSize: 14,
  color: theme === 'dark' ? '#fff' : '#121212',
},

commentText: {
  fontSize: 14,
  color: theme === 'dark' ? '#ddd' : '#333',
  marginTop: 2,
},

repliesContainer: {
  marginTop: 8,
  paddingLeft: 12,
  borderLeftWidth: 1,
  borderColor: theme === 'dark' ? '#333' : '#ccc',
},

replyContainer: {
  flexDirection: 'row',
  marginTop: 8,
},

replyProfileImage: {
  width: 30,
  height: 30,
  borderRadius: 15,
  marginRight: 10,
},

replyContent: {
  flex: 1,
},

replyDisplayName: {
  fontWeight: '600',
  fontSize: 13,
  color: theme === 'dark' ? '#fff' : '#121212',
},

replyButton: {
  marginTop: 6,
},

replyButtonText: {
  color: '#FF4500',
  fontSize: 13,
  fontWeight: '500',
},

replyInputContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 8,
},

replyInput: {
  flex: 1,
  borderWidth: 1,
  borderColor: theme === 'dark' ? '#444' : '#ccc',
  borderRadius: 20,
  paddingHorizontal: 12,
  paddingVertical: 6,
  marginRight: 8,
  fontSize: 14,
  color: theme === 'dark' ? '#fff' : '#000',
},

noComment: {
  textAlign: 'center',
  color: theme === 'dark' ? '#bbb' : '#444',
  fontSize: 14,
 },

  });