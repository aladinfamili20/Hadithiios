/* eslint-disable react-native/no-inline-styles */
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { auth, firestore } from '../../data/Firebase';
import { useNavigation } from '@react-navigation/native';
import DarkMode from '../Theme/DarkMode';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useUser } from '../../data/Collections/FetchUserData';
import RNModal from 'react-native-modal';

const PostInteranctionsScreen = ({ post }) => {
  const theme = DarkMode();
  const user = auth().currentUser;
  const uid = user?.uid;
  const { userData } = useUser();
  const [reportModal, setReportModal] = useState(false);
  const [getUserInfo, setGetUserInfo] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [getError, setGetError] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes_by_user || []);
  const [isSaved, setIsSaved] = useState(false);

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

  const handleLike = async () => {
    if (!uid) {
      setGetError('You need to be logged in to like a post.');
      return;
    }

    const postRef = firestore().collection('posts').doc(post.id);

    try {
      const alreadyLiked = likes.includes(uid);
      const { displayName, lastName, profileImage } = getUserInfo;
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
          // read: false,
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

  const navigation = useNavigation();

  const handleSavePost = async () => {
    if (!uid) {
      setGetError('You need to be logged in to save a post.');
      return;
    }

    const postRef = firestore().collection('posts').doc(post.id);

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

  const generateReportPostUniqueId = () => {
    return `id_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
  };

  const handleReportPost = async () => {
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
      const reportPostRef = firestore().collection('reportPost').doc(post.id);
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
            // reportPostText,
            reportedAccountUID: post.uid,
            currentUserUID: uid,
            actualPostImage: post.image,
          }),
        },
        { merge: true },
      );
      console.log('Post reported successfully');
      setGetError('Post reported successfully');
    } catch (error) {
      console.log('Error reporting post');
      setGetError(
        'There was an error while trying to report this post. Please try again or report this bug',
      );
    }
  };

  function handleReportCategoryPress(category) {
    setSelectedCategory(category);
  }

  return (
    <View>
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

        {/* Comments Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('postDetail', { id: post.id })}
          style={styles(theme).buttonRow}
          accessibilityLabel="Comments Button"
          accessibilityRole="button"
        >
          <Ionicons
            name="chatbubble-outline"
            size={24}
            color={theme === 'dark' ? '#fff' : '#5b5b5b'}
          />
          <Text style={[styles(theme).buttonText, { marginLeft: 10 }]}>
            {post.comments?.length || 0}{' '}
            {post.comments?.length === 1 ? 'comment' : 'comments'}
          </Text>
        </TouchableOpacity>

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
          accessibilityLabel="Flag Post Button"
          accessibilityRole="button"
        >
          <Ionicons
            name={'flag-outline'}
            size={24}
            color={theme === 'dark' ? '#fff' : '#5b5b5b'}
          />
        </TouchableOpacity>
      </View>

      {/* Report modal */}

      <RNModal
        isVisible={reportModal}
        onBackdropPress={() => setReportModal(false)}
        style={styles(theme).modal}
      >
        <View style={styles(theme).modalContent}>
          <Text style={styles(theme).modalTitle}>Report post</Text>
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
            {/* <View style={styles(theme).searchContent}>
      <TextInput
        placeholder="Others"
        value={reportPostText}
        onChangeText={setReportPostText}
        style={styles(theme).searchBar}
        placeholderTextColor={theme === 'light' ? '#888' : '#ccc'}
      />
    </View> */}
          </ScrollView>

          <TouchableOpacity
            onPress={handleReportPost}
            style={styles(theme).closeModalButton}
          >
            <Text style={styles(theme).closeModalButtonText}>Report</Text>
          </TouchableOpacity>

          <Text style={styles(theme).getError}>{getError}</Text>
        </View>
      </RNModal>
    </View>
  );
};

export default PostInteranctionsScreen;

const styles = theme =>
  StyleSheet.create({
    // Interactions
    interactions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 10,
    },
    buttonRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    buttonText: {
      color: theme === 'dark' ? '#fff' : '#5b5b5b',
    },

    // Modal Styles
    modal: {
      justifyContent: 'flex-end',
      margin: 0,
    },
    modalContent: {
      backgroundColor: theme === 'light' ? '#fff' : '#1c1c1c',
      padding: 20,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '80%',
    },
    modalTitle: {
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
  });
