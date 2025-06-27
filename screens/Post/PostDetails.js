/* eslint-disable no-trailing-spaces */
/* eslint-disable curly */
/* eslint-disable no-unused-vars */
/* eslint-disable no-dupe-keys */
/* eslint-disable no-shadow */
/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
  TextInput,
  Dimensions,
  Text,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {CommonActions, useNavigation, useRoute} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {StatusBar} from 'react-native';
// import Divider from "../components/Divider";
import Image from 'react-native-image-progress';
import DarkMode from '../../components/Theme/DarkMode';
import { auth } from '../../data/Firebase';
import UserCollectionFech from '../../components/UserCollectionFech';
import { useUser } from '../../data/Collections/FetchUserData';
import ProfileInfo from '../../components/PostDetails/ProfileInfo';
import ImageInfo from '../../components/PostDetails/ImageInfo';
import CommentSection from '../../components/PostDetails/CommentSection';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ScrollView } from 'react-native-gesture-handler';

const PostDetails = () => {
  const theme = DarkMode();
  const route = useRoute();
  const {id} = route.params;
  const user = auth().currentUser;
  const uid = user?.uid;
  // eslint-disable-next-line no-unused-vars
  const {document} = UserCollectionFech('posts', id);
  const [postDetails, setPostDetails] = useState(null);
  const navigation = useNavigation();
  // eslint-disable-next-line no-unused-vars
  const [comment, setComments] = useState('');
  const {userData} = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [getError, setGetError] = useState('');
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
        const docSnapshot = await firestore().collection('posts').doc(id).get();
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
      setGetError('Error commenting, please try updating your profile informations.')
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
        .collection('posts')
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

   
  return (
 
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles(theme).screen}>
          <StatusBar backgroundColor="orangered" />

          {/* Scrollable content */}
          <ScrollView
            contentContainerStyle={styles(theme).scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <ProfileInfo />

            {isLoading ? (
              <View style={styles(theme).loaderContainer}>
                <ActivityIndicator size="large" color="tomato" />
              </View>
            ) : (
              postDetails && (
                <>
                  <ImageInfo />
                  <CommentSection />
                </>
              )
            )}

            {getError ? (
              <Text style={styles(theme).errorText}>{getError}</Text>
            ) : null}
          </ScrollView>

          {/* Sticky comment input */}
          <View style={styles(theme).commentBar}>
            <TextInput
              style={styles(theme).commentInput}
              placeholder="Add a comment..."
              placeholderTextColor={theme === 'dark' ? '#aaa' : '#666'}
              value={comment}
              onChangeText={setComments}
              multiline
              maxLength={1500}
            />
            <TouchableOpacity onPress={CommentsToFirebase}>
              <Ionicons name="send" size={24} color="#FF4500" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>

  );
};

export default PostDetails;

const styles = (theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme === 'dark' ? '#000' : '#fff',
  },
  scrollContainer: {
     paddingBottom: 100, // leave space for sticky input
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
  },
  commentBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 30,
    borderTopWidth: 1,
    borderColor: theme === 'dark' ? '#333' : '#ddd',
    backgroundColor: theme === 'dark' ? '#121212' : '#f9f9f9',
  },
  commentInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme === 'dark' ? '#333' : '#ccc',
    color: theme === 'dark' ? '#eee' : '#111',
    maxHeight: 120,
    marginRight: 8,
  },
});
