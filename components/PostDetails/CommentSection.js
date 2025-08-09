/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */

import {
  FlatList,
  Image,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DarkMode from '../Theme/DarkMode';
import {
  CommonActions,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { firestore } from '../../data/Firebase';
import { useUser } from '../../data/Collections/FetchUserData';
import PostInteranctionsScreen from '../Post/PostInteranctionsScreen';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const CommentSection = () => {
  const theme = DarkMode();
  const route = useRoute();
  const { userData } = useUser();
  const { id } = route.params;

  const [postDetails, setPostDetails] = useState(null);
  const [comments, setComments] = useState([]);
  const [replies, setReplies] = useState({});
  const [expandedComments, setExpandedComments] = useState([]);
  const [replyInput, setReplyInput] = useState({});

  const replyListenersRef = useRef({}); // store reply listeners

  // 🔁 Listen to post details
  useEffect(() => {
    if (!id) return;
    const unsubPost = firestore()
      .collection('posts')
      .doc(id)
      .onSnapshot(doc => {
        if (doc.exists) {
          setPostDetails({ id: doc.id, ...doc.data() });
        }
      });

    return () => unsubPost();
  }, [id]);

  // 🔁 Listen to top-level comments only
  useEffect(() => {
    if (!postDetails?.id) return;

    const unsubComments = firestore()
      .collection('posts')
      .doc(postDetails.id)
      .collection('comments')
      .orderBy('uploadedDate', 'desc')
      .onSnapshot(snapshot => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setComments(data);
      });

    return () => unsubComments();
  }, [postDetails?.id]);

  // 📥 Load replies lazily when expanding
  const loadReplies = commentId => {
    if (replyListenersRef.current[commentId]) return; // already listening

    const unsub = firestore()
      .collection('posts')
      .doc(postDetails.id)
      .collection('comments')
      .doc(commentId)
      .collection('replies')
      .orderBy('uploadedDate', 'desc')
      .onSnapshot(snapshot => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReplies(prev => ({ ...prev, [commentId]: data }));
      });

    replyListenersRef.current[commentId] = unsub;
  };

  const unloadReplies = commentId => {
    if (replyListenersRef.current[commentId]) {
      replyListenersRef.current[commentId]();
      delete replyListenersRef.current[commentId];
      setReplies(prev => ({ ...prev, [commentId]: [] }));
    }
  };

  const toggleReplies = commentId => {
    if (expandedComments.includes(commentId)) {
      setExpandedComments(prev => prev.filter(id => id !== commentId));
      unloadReplies(commentId);
    } else {
      setExpandedComments(prev => [...prev, commentId]);
      loadReplies(commentId);
    }
  };

  // ➕ Add reply
  const addReply = async commentId => {
    const text = replyInput[commentId]?.trim();
    if (!text || !userData?.uid) return;

    const { displayName, lastName, profileImage, uid } = userData;
    const newReply = {
      uploadedDate: firestore.Timestamp.now(),
      hourPosted: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      displayName,
      lastName,
      profileImage,
      uid,
      reply: text,
      likes: [],
    };

    await firestore()
      .collection('posts')
      .doc(postDetails.id)
      .collection('comments')
      .doc(commentId)
      .collection('replies')
      .add(newReply);

    setReplyInput(prev => ({ ...prev, [commentId]: '' }));
  };

  // ❤️ Toggle likes for comments/replies
  const toggleLike = async (type, commentId, replyId) => {
    const ref =
      type === 'comment'
        ? firestore()
            .collection('posts')
            .doc(postDetails.id)
            .collection('comments')
            .doc(commentId)
        : firestore()
            .collection('posts')
            .doc(postDetails.id)
            .collection('comments')
            .doc(commentId)
            .collection('replies')
            .doc(replyId);

    const docSnap = await ref.get();
    if (!docSnap.exists) return;

    const likes = docSnap.data().likes || [];
    const hasLiked = likes.includes(userData.uid);

    await ref.update({
      likes: hasLiked
        ? firestore.FieldValue.arrayRemove(userData.uid)
        : firestore.FieldValue.arrayUnion(userData.uid),
    });
  };

  // Cleanup listeners
  useEffect(() => {
    return () => {
      Object.values(replyListenersRef.current).forEach(unsub => unsub());
    };
  }, []);

  // Render a comment item
  const renderComment = ({ item }) => (
    // <KeyboardAwareScrollView
    //   style={styles(theme).container}
    //   contentContainerStyle={{ paddingBottom: 60 }}
    //   enableOnAndroid
    //   extraScrollHeight={Platform.OS === 'ios' ? 100 : 20}
    //   keyboardShouldPersistTaps="handled"
    // >

    <View style={styles(theme).commenterContainer}>
      <Image
        source={
          item.profileImage
            ? { uri: item.profileImage }
            : require('../../assets/thumblogo.png')
        }
        style={styles(theme).commentProfileImage}
      />

      <View style={styles(theme).commentContent}>
        <Text style={styles(theme).commentDisplayName}>
          {item.displayName} {item.lastName}
        </Text>

        <View style={styles.apply(theme).commentsLikeContents}>
          <Text style={styles(theme).commentText}>{item.comment}</Text>

          <View style={styles(theme).commentLike}>
            <TouchableOpacity onPress={() => toggleLike('comment', item.id)}>
              <Ionicons
                name={
                  item.likes?.includes(userData?.uid)
                    ? 'heart'
                    : 'heart-outline'
                }
                size={18}
                color={item.likes?.includes(userData?.uid) ? '#FF4500' : '#888'}
              />
            </TouchableOpacity>
            <Text style={styles(theme).likeCountText}>
              {' '}
              {item.likes?.length || 0}
            </Text>
          </View>
        </View>

        {/* Toggle Replies */}
        <TouchableOpacity onPress={() => toggleReplies(item.id)}>
          <Text style={styles(theme).replyButtonText}>
            {expandedComments.includes(item.id)
              ? 'Hide Replies'
              : `View Replies`}
          </Text>
        </TouchableOpacity>

        {/* <TouchableOpacity onPress={() => toggleReplies(item.id)}>
          <Text style={styles(theme).replyButtonText}>
            {expandedComments.includes(item.id)
              ? 'Hide Replies'
              : `View Replies (${item.replyCount || 0})`}
          </Text>
        </TouchableOpacity> */}

        {/* Render replies if expanded */}
        {expandedComments.includes(item.id) && (
          <View style={styles(theme).repliesContainer}>
            {(replies[item.id] || []).map(reply => (
              <View key={reply.id} style={styles(theme).replyContainer}>
                <Image
                  source={
                    reply.profileImage
                      ? { uri: reply.profileImage }
                      : require('../../assets/thumblogo.png')
                  }
                  style={styles(theme).replyProfileImage}
                />
                <View style={styles(theme).replyContent}>
                  <Text style={styles(theme).replyDisplayName}>
                    {reply.displayName} {reply.lastName}
                  </Text>

                  {/* Like Button for Reply */}

                  <View style={styles.apply(theme).commentsLikeContents}>
                    <Text style={styles(theme).commentText}>{reply.reply}</Text>
                    <View style={styles(theme).commentLike}>
                      <TouchableOpacity
                        onPress={() => toggleLike('reply', item.id, reply.id)}
                      >
                        <Ionicons
                          name={
                            reply.likes?.includes(userData?.uid)
                              ? 'heart'
                              : 'heart-outline'
                          }
                          size={16}
                          color={
                            reply.likes?.includes(userData?.uid)
                              ? '#FF4500'
                              : '#888'
                          }
                        />
                      </TouchableOpacity>
                      <Text style={styles(theme).likeCountText}>
                        {' '}
                        {reply.likes?.length || 0}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}

            {/* Reply Input */}
            <View style={styles(theme).replyInputContainer}>
              <TextInput
                style={styles(theme).replyInput}
                placeholder="Write a reply..."
                placeholderTextColor={theme === 'dark' ? '#bbb' : '#888'}
                value={replyInput[item.id] || ''}
                onChangeText={text =>
                  setReplyInput(prev => ({ ...prev, [item.id]: text }))
                }
              />
              <TouchableOpacity onPress={() => addReply(item.id)}>
                <Ionicons name="send" size={20} color="#FF4500" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View>
      {postDetails && <PostInteranctionsScreen post={postDetails} />}

      {postDetails && (
        <Text style={{ fontWeight: 'bold' }}>{postDetails.title}</Text>
      )}

      <KeyboardAwareScrollView
        style={styles(theme).container}
        contentContainerStyle={{ paddingBottom: 60 }}
        enableOnAndroid
        extraScrollHeight={Platform.OS === 'ios' ? 100 : 20}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <FlatList
            data={comments}
            keyExtractor={comment => comment.id}
            renderItem={renderComment}
            contentContainerStyle={{ paddingBottom: 50 }}
          />
        </TouchableWithoutFeedback>
      </KeyboardAwareScrollView>
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
      margin: 10,
    },

    commentProfileImage: {
      width: 30,
      height: 30,
      borderRadius: 20,
      marginRight: 12,
    },

    commentContent: {
      flex: 1,
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
      width: 25,
      height: 25,
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
    likeCountText:{
      color: theme === 'dark' ? '#fff' : '#000',

    },
    noComment: {
      textAlign: 'center',
      color: theme === 'dark' ? '#bbb' : '#444',
      fontSize: 14,
    },

  });
