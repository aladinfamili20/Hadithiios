/* eslint-disable react-native/no-inline-styles */
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { auth, firestore } from '../../data/Firebase';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useUser } from '../../data/Collections/FetchUserData';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DarkMode from '../Theme/DarkMode';
import Divider from '../Divider';
import RNModal from 'react-native-modal';

const VideoInteractionScreen = ({ post }) => {
  // State hooks
  const user = auth().currentUser;
  const uid = user?.uid;
  const theme = DarkMode();
  const navigation = useNavigation();
  const { userData } = useUser();
  const [comment, setComment] = useState('');
  const [userInfoProfileFetch, setUserProfileFetch] = useState(null);
  const [openCommentModal, setOpenCommentModal] = useState(false);
  const [getComments, setGetComments] = useState([]);
  const openModal = () => setOpenCommentModal(true);
  const closeModal = () => setOpenCommentModal(false);
  const [reportModal, setReportModal] = useState(false);
  const [getUserInfo, setGetUserInfo] = useState(null);
  const [reportPostText, setReportPostText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [getError, setGetError] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes_by_user || []);
  const [isSaved, setIsSaved] = useState(false);
  const [replies, setReplies] = useState({}); // Track replies for each comment
  const [replyingToCommentId, setReplyingToCommentId] = useState(null); // Track the comment being replied to

  // useEffects
  useEffect(() => {
    setLikes(post.likes_by_user || []);
    setIsLiked(uid && post.likes_by_user?.includes(uid));
  }, [post, uid]);

  useEffect(() => {
    setGetUserInfo(userData);
    setIsSaved(uid && post.saved_by_user?.includes(uid));
  }, [userData, post, uid]);

  useEffect(() => {
    setGetUserInfo(userData);
  }, [userData]);

  useEffect(() => {
    setUserProfileFetch(userData);
  }, [userData]);

  const handleLike = async () => {
    if (!uid) {
      setGetError('You need to be logged in to like a post.');
      return;
    }

    const postRef = firestore().collection('videos').doc(post.id);
    const { displayName, lastName, profileImage } = userInfoProfileFetch;

    try {
      const alreadyLiked = likes.includes(uid);
      const updatedLikes = alreadyLiked
        ? likes.filter(userId => userId !== uid)
        : [...likes, uid];

      // Optimistic update
      setLikes(updatedLikes);
      setIsLiked(!alreadyLiked);

      // Firestore update
      await postRef.update({
        likes_by_user: alreadyLiked
          ? firestore.FieldValue.arrayRemove(uid)
          : firestore.FieldValue.arrayUnion(uid),
      });

      await firestore()
        .collection('notifications')
        .add({
          lickerDisplayName: `${displayName} ${lastName}`,
          lickerProfileImage: profileImage,
          postImage: post.image,
          timestamp: firestore.Timestamp.now(),
          uid: uid,
          recipientId: post.uid,
          postID: post.id,
          read: false,
        });
    } catch (error) {
      console.error('Error updating likes:', error);
      setGetError('There was an error liking the post. Please try again.');
    }
  };

  const addReplyToFirebase = async commentId => {
    if (!post || !userInfoProfileFetch || !replies[commentId]?.trim()) {
      console.error('Post details, user profile fetch, or reply is undefined');
      return;
    }

    try {
      const { displayName, lastName, profileImage, uid } = userInfoProfileFetch;
      const today = new Date();
      const date = today.toDateString();
      const hourPosted = today.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      const newReply = {
        uploadedDate: date,
        HourPostes: hourPosted,
        displayName,
        profileImage,
        lastName,
        uid,
        reply: replies[commentId],
      };

      // Update comment with new reply
      const updatedComments = post.comments.map(comment => {
        if (comment.id === commentId) {
          const existingReplies = comment.replies || [];
          return {
            ...comment,
            replies: [...existingReplies, newReply],
          };
        }
        return comment;
      });

      // Update Firestore
      await firestore().collection('videos').doc(post.id).update({
        comments: updatedComments,
      });

      // Clear reply input
      setReplies(prev => ({
        ...prev,
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
        params: { uid: userId },
      }),
    );
  };

  // Saving video
  const handleSavePost = async () => {
    if (!uid) {
      setGetError('You need to be logged in to save a post.');
      return;
    }

    const postRef = firestore().collection('videos').doc(post.id);

    try {
      const willUnsave = isSaved;

      // Optimistic update
      setIsSaved(!willUnsave);

      // Firestore update
      await postRef.update({
        saved_by_user: willUnsave
          ? firestore.FieldValue.arrayRemove(uid)
          : firestore.FieldValue.arrayUnion(uid),
      });

      console.log('Post saved/unsaved successfully!');
    } catch (error) {
      console.error('Error saving/unsaving post:', error);
      setGetError('Error saving post. Please try again.');
    }
  };

  // Upload comment to Firestore
  const CommentsToFirebase = async () => {
    if (!post || !post.id || !userInfoProfileFetch) {
      console.error('Post ID or user profile data is undefined');
      return;
    }

    try {
      const postRef = firestore().collection('videos').doc(post.id);
      const postSnapshot = await postRef.get();

      if (!postSnapshot.exists) {
        // console.error('Post document not found');
        return;
      }

      const { displayName, lastName, profileImage } = userInfoProfileFetch;
      const today = new Date();
      const date = today.toDateString();
      const time = today.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      await postRef.update({
        comments: firestore.FieldValue.arrayUnion({
          id: new Date().getTime().toString(),
          uploadedDate: date,
          uploadedTime: time,
          displayName,
          profileImage,
          lastName,
          uid: user.uid,
          comment,
        }),
      });

      setComment('');
      //   setCommentLoading(true);
      console.log('Comment added successfully!');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Fetch comments for the current post
  useEffect(() => {
    const fetchComments = async () => {
      if (!post || !post.id) {
        console.error('Post ID is undefined');
        return;
      }
      try {
        const postRef = firestore().collection('videos').doc(post.id);
        const postSnapshot = await postRef.get();
        if (postSnapshot.exists) {
          const postData = postSnapshot.data();
          setGetComments(postData.comments || []);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };
    fetchComments();
  }, [post]);

  // Repoting a video.

  function handleReportCategoryPress(category) {
    setSelectedCategory(category);
  }

  const generateReportPostUniqueId = () => {
    return `id_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
  };

  const handleReportVideo = async () => {
    try {
      const { displayName, lastName, profileImage } = getUserInfo;
      const today = new Date();
      const date = today.toDateString();
      const hour = today.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const time = today.toLocaleDateString();
      const uid = user.uid;
      const reportPostId = generateReportPostUniqueId();
      const reportPostRef = firestore().collection('reportVideos').doc(post.id);
      await reportPostRef.set(
        {
          postReport: firestore.FieldValue.arrayUnion({
            date,
            hour,
            time,
            selectedCategory: selectedCategory,
            reportingUserDisplayName: displayName,
            reportingUserLastName: lastName,
            reportingUserProfileImage: profileImage,
            reportedUserDisplayName: post.displayName,
            reportedUserLastName: post.lastName,
            reportPostId,
            reportPostText,
            reportedAccountUID: post.uid,
            currentUserUID: uid,
            actualPostVideo: post.video,
          }),
        },
        { merge: true },
      );
      console.log('Post reported successfully');
      setGetError('Post reported successfully');
    } catch (error) {
      console.log('Error reporting post');
      Alert.alert('Error reporting video', error.message);
      setGetError(
        'There was an error while trying to report this post, please try again or report this bug',
      );
    }
  };

  const toggleCommentLike = async commentId => {
    if (!post || !userData) return;

    const updatedComments = post.comments.map(comment => {
      if (comment.id === commentId) {
        const existingLikes = comment.likes || [];
        const userHasLiked = existingLikes.includes(userData.uid);

        return {
          ...comment,
          likes: userHasLiked
            ? existingLikes.filter(uid => uid !== userData.uid)
            : [...existingLikes, userData.uid],
        };
      }
      return comment;
    });

    try {
      await firestore()
        .collection('videos')
        .doc(post.id)
        .update({ comments: updatedComments });

      // setGetComments(prev => ({
      //   ...prev,
      //   comments: updatedComments,
      // }));
      setGetComments(updatedComments);
    } catch (error) {
      console.error('Failed to toggle like: ', error);
    }
  };

  const toggleReplyLike = async (commentId, replyIndex) => {
    if (!post || !userData) return;

    const updatedComments = post.comments.map(comment => {
      if (comment.id === commentId) {
        const updatedReplies = comment.replies.map((reply, idx) => {
          if (idx === replyIndex) {
            const existingLikes = reply.likes || [];
            const userHasLiked = existingLikes.includes(userData.uid);

            return {
              ...reply,
              likes: userHasLiked
                ? existingLikes.filter(uid => uid !== userData.uid)
                : [...existingLikes, userData.uid],
            };
          }
          return reply;
        });

        return {
          ...comment,
          replies: updatedReplies,
        };
      }
      return comment;
    });

    try {
      await firestore()
        .collection('videos')
        .doc(post.id)
        .update({ comments: updatedComments });

      // setGetComments(prev => ({
      //   ...prev,
      //   comments: updatedComments,
      // }));
      setGetComments(updatedComments);
    } catch (error) {
      console.error('Failed to toggle reply like: ', error);
    }
  };

  return (
    <View>
      {/* Interaction Buttons: Like, Comment, Save */}
      <View style={styles(theme).interactions}>
        {/* Like Button */}
        <TouchableOpacity
          onPress={handleLike}
          style={styles(theme).buttonRow}
          accessibilityLabel="Like Button"
          accessibilityRole="button"
        >
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={24}
            color={isLiked ? '#ff6347' : theme === 'dark' ? '#fff' : '#5b5b5b'}
          />
          <Text style={styles(theme).buttonText}>
            {likes.length.toLocaleString('en')}{' '}
            {likes.length === 1 ? 'like' : 'likes'}
          </Text>
        </TouchableOpacity>

        {/* Comment Button */}
        <TouchableOpacity
          onPress={openModal}
          style={styles(theme).buttonRow}
          accessibilityLabel="Comments Button"
          accessibilityRole="button"
        >
          <Ionicons
            name="chatbubble-outline"
            size={24}
            color={theme === 'dark' ? '#fff' : '#121212'}
          />
          <Text style={styles(theme).buttonText}>
            {post.comments?.length || 0}{' '}
            {post.comments?.length === 1 ? 'comment' : 'comments'}
          </Text>
        </TouchableOpacity>

        {/* Save Button */}
        {/* Save Post Button */}
        <TouchableOpacity
          onPress={handleSavePost}
          accessibilityLabel="Save Post Button"
          accessibilityRole="button"
        >
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color={isSaved ? '#ff6347' : theme === 'dark' ? '#fff' : '#5b5b5b'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setReportModal(true)}
          accessibilityLabel="Save Post Button"
          accessibilityRole="button"
        >
          <Ionicons
            name={'flag-outline'}
            size={24}
            color={theme === 'dark' ? '#fff' : '#5b5b5b'}
          />
        </TouchableOpacity>
      </View>

      {/* Modal for reporting videos */}

      <RNModal
        isVisible={reportModal}
        onBackdropPress={() => setReportModal(false)}
        style={styles(theme).modal}
      >
        <View style={styles(theme).ReportmodalContent}>
          <Text style={styles(theme).ReportmodalTitle}>Report post</Text>
          <Text style={styles(theme).modalTitleH2}>
            Why are you reporting this post?
          </Text>

          <ScrollView>
            <View style={styles(theme).categoryConatiner}>
              {[
                'Suicide',
                'Self-injury',
                'Violence or hate',
                'Promoting drugs or restricted items',
                'Nudity or sexual activity',
                'Scam or fraud',
              ].map((category, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleReportCategoryPress(category)}
                  style={[
                    styles(theme).categoryButton,
                    {
                      backgroundColor:
                        selectedCategory === category
                          ? 'tomato'
                          : theme === 'light'
                          ? '#f0f0f0'
                          : '#2a2a2a',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles(theme).categoryText,
                      {
                        color:
                          selectedCategory === category
                            ? '#fff'
                            : theme === 'light'
                            ? '#000'
                            : '#fff',
                      },
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity
            onPress={handleReportVideo}
            style={styles(theme).closeModalButton}
          >
            <Text style={styles(theme).closeModalButtonText}>Report</Text>
          </TouchableOpacity>

          <Text style={styles(theme).getError}>{getError}</Text>
        </View>
      </RNModal>
      <Divider />

      {/* Comments sections modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={openCommentModal}
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles(theme).modalOverlay}>
              <View style={styles(theme).modalContent}>
                <TouchableOpacity
                  onPress={closeModal}
                  style={styles(theme).closeModal}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={theme === 'dark' ? '#fff' : '#121212'}
                  />
                </TouchableOpacity>

                <Text style={styles(theme).modalTitle}>Comments</Text>

                <ScrollView style={{ marginBottom: 10 }}>
                  {getComments.length > 0 ? (
                    getComments.map((comment, index) => (
                      <View
                        key={comment.id}
                        style={styles(theme).commenterContainer}
                      >
                        <TouchableOpacity
                          onPress={() => navigateToProfile(comment.uid)}
                        >
                          <Image
                            source={
                              comment.profileImage
                                ? { uri: comment.profileImage }
                                : require('../../assets/thumblogo.png')
                            }
                            style={styles(theme).commentProfileImage}
                          />
                        </TouchableOpacity>

                        <View style={styles(theme).commentProfileInfo}>
                          <TouchableOpacity
                            onPress={() => navigateToProfile(comment.uid)}
                          >
                            <Text style={styles(theme).CommentDisplayName}>
                              {comment.displayName} {comment.lastName}
                            </Text>
                          </TouchableOpacity>

                          {/* lIKE  */}

                          <View
                            style={styles.apply(theme).commentsLikeContents}
                          >
                            <Text style={styles(theme).commentText}>
                              {comment.comment}
                            </Text>

                            <View style={styles(theme).commentLike}>
                              <TouchableOpacity
                                onPress={() => toggleCommentLike(comment.id)}
                              >
                                <Ionicons
                                  name={
                                    comment.likes?.includes(userData.uid)
                                      ? 'heart'
                                      : 'heart-outline'
                                  }
                                  size={20}
                                  color={
                                    comment.likes?.includes(userData.uid)
                                      ? '#FF4500'
                                      : '#888'
                                  }
                                />
                              </TouchableOpacity>
                              <Text style={styles(theme).likeCountText}>
                                {comment.likes?.length}
                              </Text>
                            </View>
                          </View>

                          {/* Replies */}
                          {comment.replies?.length > 0 && (
                            <View style={styles(theme).replyList}>
                              {comment.replies.map((reply, replyIndex) => (
                                <View
                                  key={comment.id}
                                  style={styles(theme).ReplyCommenterContainer}
                                >
                                  <TouchableOpacity
                                    onPress={() => navigateToProfile(reply.uid)}
                                  >
                                    <Image
                                      source={
                                        reply.profileImage
                                          ? { uri: reply.profileImage }
                                          : require('../../assets/thumblogo.png')
                                      }
                                      style={
                                        styles(theme).ReplyCommentProfileImage
                                      }
                                    />
                                  </TouchableOpacity>
                                  <View
                                    style={
                                      styles(theme).ReplycommentProfileInfo
                                    }
                                  >
                                    <TouchableOpacity
                                      onPress={() =>
                                        navigateToProfile(reply.uid)
                                      }
                                    >
                                      <Text style={styles(theme).replyUserName}>
                                        {reply.displayName} {reply.lastName}
                                      </Text>
                                    </TouchableOpacity>

                                    <View
                                      style={
                                        styles.apply(theme).commentsLikeContents
                                      }
                                    >
                                      <Text style={styles(theme).commentText}>
                                        {reply.reply}
                                      </Text>

                                      <View style={styles(theme).commentLike}>
                                        <TouchableOpacity
                                          onPress={() =>
                                            toggleReplyLike(
                                              comment.id,
                                              replyIndex,
                                            )
                                          }
                                        >
                                          <Ionicons
                                            name={
                                              reply.likes?.includes(
                                                userData.uid,
                                              )
                                                ? 'heart'
                                                : 'heart-outline'
                                            }
                                            size={18}
                                            color={
                                              reply.likes?.includes(
                                                userData.uid,
                                              )
                                                ? '#FF4500'
                                                : '#888'
                                            }
                                          />
                                        </TouchableOpacity>
                                        <Text
                                          style={styles(theme).likeCountText}
                                        >
                                          {reply.likes?.length}
                                        </Text>
                                      </View>
                                    </View>
                                  </View>
                                </View>
                              ))}
                            </View>
                          )}

                          {/* Reply Input */}
                          <TouchableOpacity
                            onPress={() => setReplyingToCommentId(comment.id)}
                          >
                            <Text style={styles(theme).replyButton}>Reply</Text>
                          </TouchableOpacity>

                          {replyingToCommentId === comment.id && (
                            <View style={styles(theme).replyInputContainer}>
                              <TextInput
                                style={styles(theme).replyInput}
                                placeholder="Write a reply..."
                                placeholderTextColor={
                                  theme === 'dark' ? '#bbb' : '#888'
                                }
                                value={replies[comment.id] || ''}
                                onChangeText={text =>
                                  setReplies(prev => ({
                                    ...prev,
                                    [comment.id]: text,
                                  }))
                                }
                              />
                              <TouchableOpacity
                                onPress={() => addReplyToFirebase(comment.id)}
                              >
                                <Ionicons
                                  name="send"
                                  size={20}
                                  color="#FF4500"
                                />
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text
                      style={{ color: theme === 'dark' ? '#fff' : '#121212' }}
                    >
                      No comments yet.
                    </Text>
                  )}
                </ScrollView>

                {/* Sticky Comment Input */}
                <View style={styles(theme).commentSectionSticky}>
                  <TextInput
                    style={styles(theme).commentInput}
                    placeholder="Add a comment..."
                    placeholderTextColor={theme === 'dark' ? '#ccc' : '#666'}
                    onChangeText={setComment}
                    value={comment}
                    maxLength={1500}
                  />
                  <TouchableOpacity onPress={CommentsToFirebase}>
                    <Ionicons name="send" size={24} color="#ff6347" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* </>
      )} */}
    </View>
  );
};

export default VideoInteractionScreen;

const styles = theme =>
  StyleSheet.create({
    // Interactions
    interactions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 10,
      margin: 10,
    },
    buttonRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    buttonText: {
      marginLeft: 6,
      color: theme === 'dark' ? '#fff' : '#121212',
      fontSize: 14,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme === 'dark' ? '#1c1c1c' : '#fff',
      padding: 16,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      maxHeight: '85%',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme === 'dark' ? '#fff' : '#121212',
      marginBottom: 10,
    },
    closeModal: {
      alignSelf: 'flex-end',
      marginBottom: 10,
    },
    commenterContainer: {
      flexDirection: 'row',
      marginBottom: 15,
    },
    commentProfileImage: {
      width: 35,
      height: 35,
      borderRadius: 20,
    },
    commentProfileInfo: {
      marginLeft: 10,
      flex: 1,
    },
    CommentDisplayName: {
      fontWeight: 'bold',
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    commentText: {
      color: theme === 'dark' ? '#ccc' : '#444',
    },
    commentsLikeContents: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    commentLike: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    // replyList: {
    //   marginTop: 5,
    //   marginLeft: 20,
    // },
    replyList: {
      marginTop: 8,
      paddingLeft: 12,
      borderLeftWidth: 1,
      borderColor: theme === 'dark' ? '#333' : '#ccc',
    },
    ReplyCommenterContainer: {
      flexDirection: 'row',
      marginTop: 8,
    },
    ReplyCommentProfileImage: {
      width: 30,
      height: 30,
      borderRadius: 15,
    },
    ReplycommentProfileInfo: {
      marginLeft: 8,
      flex: 1,
    },
    replyUserName: {
      fontWeight: 'bold',
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    replyButton: {
      marginTop: 4,
      color: '#FF4500',
    },
    replyText: {
      color: theme === 'dark' ? '#ccc' : '#444',
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
    commentSection: {
      flexDirection: 'row',
      alignItems: 'center',
      borderTopWidth: 1,
      borderColor: '#ccc',
      paddingTop: 10,
    },
    // commentInput: {
    //   flex: 1,
    //   borderBottomWidth: 1,
    //   borderColor: '#ccc',
    //   marginRight: 10,
    //   color: theme === 'dark' ? '#fff' : '#121212',
    // },

    commentInput: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderRadius: 20,
      borderColor: '#ddd',
      backgroundColor: '#f9f9f9',
      marginRight: 10,
      color: '#000',
      maxHeight: 120,
    },

    // Modal Styles
    modal: {
      justifyContent: 'flex-end',
      margin: 0,
    },
    ReportmodalContent: {
      backgroundColor: theme === 'light' ? '#fff' : '#1c1c1c',
      padding: 20,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '80%',
    },
    ReportmodalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme === 'light' ? '#000' : '#fff',
      marginBottom: 12,
    },
    modalTitleH2: {
      fontSize: 15,
      fontWeight: 'normal',
      color: theme === 'light' ? '#000' : '#fff',
      marginBottom: 12,
    },
    categoryConatiner: {
      padding: 5,
      backgroundColor: theme === 'light' ? '#f0f0f0' : '#2a2a2a',
      borderRadius: 10,
    },
    categories: {
      marginTop: 10,
      marginBottom: 10,
    },
    categoryButton: {
      borderRadius: 10,
    },
    categoryText: {
      padding: 10,
      color: theme === 'light' ? '#000' : '#fff',
      borderRadius: 10,
    },
    searchContent: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme === 'light' ? '#f0f0f0' : '#2a2a2a',
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 8,
      marginTop: 10,
    },
    searchBar: {
      flex: 1,
      color: theme === 'light' ? '#000' : '#fff',
    },
    searchResultItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme === 'light' ? '#eee' : '#333',
    },
    profileImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
    },
    searchResultText: {
      color: theme === 'light' ? '#000' : '#fff',
      fontSize: 16,
    },
    closeModalButton: {
      marginTop: 20,
      backgroundColor: 'tomato',
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    closeModalButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },

    getError: {
      textAlign: 'center',
    },

    commentSectionSticky: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderTopWidth: 1,
      borderColor: '#ccc',
      backgroundColor: '#fff',
    },
  });
