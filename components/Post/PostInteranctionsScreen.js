/* eslint-disable no-undef */
/* eslint-disable react-native/no-inline-styles */
import {
  Platform,
  ScrollView,
  SectionList,
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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const reportCategories = [
  {
    title: 'Self-Harm & Safety',
    data: [
      { label: 'Suicide', icon: 'heart-broken' },
      { label: 'Self-injury', icon: 'bandage' },
      { label: 'Harassment or bullying', icon: 'account-alert' },
      { label: 'Threats or intimidation', icon: 'shield-alert' },
    ],
  },
  {
    title: 'Violence & Exploitation',
    data: [
      { label: 'Violence or hate', icon: 'account-cancel' },
      {
        label: 'Dangerous organizations or individuals',
        icon: 'alert-octagon',
      },
      { label: 'Child exploitation or abuse', icon: 'account-child' },
      { label: 'Animal abuse or cruelty', icon: 'paw' },
    ],
  },
  {
    title: 'Illegal or Restricted',
    data: [
      { label: 'Promoting drugs or restricted items', icon: 'pill' },
      { label: 'Scam or fraud', icon: 'alert-circle' },
      { label: 'Copyright infringement', icon: 'file-document' },
    ],
  },
  {
    title: 'Sexual Content',
    data: [
      { label: 'Nudity or sexual activity', icon: 'account-heart' },
      { label: 'Sexual exploitation', icon: 'account-off' },
    ],
  },
  {
    title: 'Other',
    data: [
      { label: 'Impersonation', icon: 'account-switch' },
      { label: 'Privacy violation', icon: 'lock' },
      { label: 'Misinformation or false information', icon: 'alert-decagram' },
      { label: 'Spam or irrelevant content', icon: 'email-alert' },
      { label: 'Disturbing or graphic content', icon: 'image-off' },
    ],
  },
];

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
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setIsLoading] = useState(true);
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
    const unsubscribe = firestore()
      .collection('posts')
      .doc(post.id)
      .collection('comments')
      .onSnapshot(snapshot => {
        setCommentCount(snapshot.size); // snapshot.size gives number of docs
      });

    return () => unsubscribe();
  }, [post.id]);

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

      if (post.uid !== uid && !alreadyLiked) {
        const existingLikeNotification = await firestore()
          .collection('notifications')
          .where('recipientId', '==', post.uid)
          .where('type', '==', 'like')
          .where('uid', '==', uid)
          .where('postID', '==', post.id)
          .limit(1)
          .get();

        if (existingLikeNotification.empty) {
          await firestore()
            .collection('notifications')
            .add({
              type: 'like',
              lickerDisplayName: `${displayName} ${lastName}`,
              lickerProfileImage: profileImage,
              postImage: post.image,
              timestamp: firestore.Timestamp.now(),
              uid: uid,
              recipientId: post.uid,
              postID: post.id,
              read: false,
            });
        }
      }

      //         if (post.uid !== uid && !alreadyLiked) {
      //   await firestore().collection('notifications').add({ ... });
      // }
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
  // const generateReportPostUniqueId = () => {
  //   return `report_${crypto.randomUUID?.() || Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
  //  };

  const generateReportPostUniqueId = () => {
    return `report_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
  };

  const handleReportPost = async () => {
    if (!selectedCategory) {
      setGetError('Please select a reason before reporting.');
      return;
    }

    try {
      setIsLoading(true); // optional loading state

      const { displayName, lastName, profileImage } = getUserInfo;
      const now = new Date();

      const reportData = {
        date: now.toDateString(),
        hour: now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        time: now.toLocaleDateString(),
        selectedCategory,
        reportingUserDisplayName: displayName,
        reportingUserLastName: lastName,
        reportingUserProfileImage: profileImage,
        reportedUserDisplayName: post.displayName,
        reportedUserLastName: post.lastName,
        reportPostId: generateReportPostUniqueId(),
        reportedAccountUID: post.uid,
        currentUserUID: user.uid,
        actualPostImage: post.image,
      };

      await firestore()
        .collection('reportPost')
        .doc(post.id)
        .set(
          { postReport: firestore.FieldValue.arrayUnion(reportData) },
          { merge: true },
        );

      console.log('✅ Post reported successfully');
      setGetError('Post reported successfully');

      // Optional: auto-close modal after short delay
      setTimeout(() => {
        setReportModal(false);
        setGetError('');
        setSelectedCategory(null);
      }, 1500);
    } catch (error) {
      console.error('❌ Error reporting post:', error);
      setGetError(
        'There was an error reporting this post. Please try again later.',
      );
    } finally {
      setIsLoading(false); // end loading
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
          {/* <Text style={[styles(theme).buttonText, { marginLeft: 10 }]}>
            {post.comments?.length || 0}{' '}
            {post.comments?.length === 1 ? 'comment' : 'comments'}
          </Text> */}

          <Text style={[styles(theme).buttonText, { marginLeft: 10 }]}>
            {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
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
            <RNModal
              isVisible={reportModal}
              onBackdropPress={() => setReportModal(false)}
              style={{
                justifyContent: 'flex-end',
                margin: 0,
              }}
              swipeDirection="down"
              onSwipeComplete={() => setReportModal(false)}
              propagateSwipe
            >
              <View
                style={{
                  backgroundColor: theme === 'light' ? '#fff' : '#1c1c1c',
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  paddingTop: 10,
                  maxHeight: '80%',
                }}
              >
                {/* Drag handle */}
                <View
                  style={{
                    width: 40,
                    height: 5,
                    borderRadius: 3,
                    backgroundColor: theme === 'light' ? '#ccc' : '#555',
                    alignSelf: 'center',
                    marginBottom: 10,
                  }}
                />

                {/* Header */}
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: theme === 'light' ? '#000' : '#fff',
                    textAlign: 'center',
                    marginBottom: 5,
                  }}
                >
                  Report post
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: theme === 'light' ? '#555' : '#bbb',
                    textAlign: 'center',
                    marginBottom: 15,
                  }}
                >
                  Why are you reporting this post?
                </Text>

                {/* Sectioned list */}
                <SectionList
                  sections={reportCategories}
                  keyExtractor={(item, index) => item.label + index}
                  renderSectionHeader={({ section: { title } }) => (
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: 'bold',
                        color: theme === 'light' ? '#444' : '#ccc',
                        marginTop: 15,
                        marginBottom: 5,
                        marginLeft: 15,
                      }}
                    >
                      {title}
                    </Text>
                  )}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => handleReportCategoryPress(item.label)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 12,
                        backgroundColor:
                          selectedCategory === item.label
                            ? 'tomato'
                            : theme === 'light'
                            ? '#f8f8f8'
                            : '#2a2a2a',
                        marginHorizontal: 10,
                        marginVertical: 4,
                        borderRadius: 8,
                      }}
                      activeOpacity={0.7}
                    >
                      {/* <Icon
                        name={item.icon}
                        size={20}
                        color={
                          selectedCategory === item.label
                            ? '#fff'
                            : theme === 'light'
                            ? '#000'
                            : '#fff'
                        }
                        style={{ marginRight: 10 }}
                      /> */}
                      <Text
                        style={{
                          color:
                            selectedCategory === item.label
                              ? '#fff'
                              : theme === 'light'
                              ? '#000'
                              : '#fff',
                        }}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={false}
                />

                {/* Report button */}
                <TouchableOpacity
                  onPress={handleReportPost}
                  style={{
                    backgroundColor: 'tomato',
                    padding: 15,
                    margin: 15,
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      color: '#fff',
                      textAlign: 'center',
                      fontWeight: 'bold',
                    }}
                  >
                    Report
                  </Text>
                </TouchableOpacity>

                {/* Error message */}
                {getError ? (
                  <Text
                    style={{
                      color: 'red',
                      textAlign: 'center',
                      marginBottom: Platform.OS === 'ios' ? 25 : 15,
                    }}
                  >
                    {getError}
                  </Text>
                ) : null}
              </View>
            </RNModal>
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
      marginBottom: 40,
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
