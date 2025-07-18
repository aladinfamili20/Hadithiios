/* eslint-disable no-trailing-spaces */
/* eslint-disable react-native/no-inline-styles */
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  FlatList,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation, useRoute} from '@react-navigation/native';
import RNModal from 'react-native-modal';
import { auth } from '../../data/Firebase';
import { useUser } from '../../data/Collections/FetchUserData';
import DarkMode from '../../components/Theme/DarkMode';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
const PostCustomize = () => {
  const {image} = useRoute().params;

  const user = auth().currentUser;
  const uid = user?.uid;
  const [caption, setCaption] = useState('');
  const {userData, isLoading} = useUser();
  const [loading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const navigation = useNavigation();
  const theme = DarkMode();
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [isTagModalVisible, setIsTagModalVisible] = useState(false);
  const [getError, setGetError] = useState('')
  useEffect(() => {
    setProfileData(userData);
  }, [userData]);

  // Upload the post image
  const uploadImage = async () => {
    if (!image) {
      return null;
    }

    const uniqueName = `posts/${Date.now()}_${uid}.jpg`;
    const storageRef = storage().ref(uniqueName);

    try {
      await storageRef.putFile(image); // more reliable with file paths
      const url = await storageRef.getDownloadURL();
      return url;
    } catch (error) {
      console.error('Error uploading image:', error);
      setGetError('Error uploading image:');
      return null;
    }
  };

  // Create the post
  const createPost = async () => {
    if (!profileData) {
      console.log('Profile data is not available.');
      setGetError('Profile data is not available.');
      return;
    }

    setIsLoading(true);
    try {
      const {displayName, profileImage, lastName} = profileData;

      // if (!displayName || !profileImage || !lastName) {
      //   console.log('User profile data is incomplete.');
      //   setGetError('User profile data is incomplete.');
      //   return;
      // }
      const today = new Date();
      const date = today.toDateString();
      const Hours = today.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const time = today.toLocaleDateString();
      const imageUrl = await uploadImage();
      const postData = {
        caption,
        image: imageUrl,
        displayName,
        lastName,
        profileImage,
        uid,
        taggedUsers: taggedUsers.map(user => ({
          // id: user.id,
          displayName: user.displayName,
          lastName: user.lastName,
          uid: user.uid,
          taggedAt: firestore.Timestamp.now(),
        })),
        uploadedDate: date,
        HourPostes: Hours,
        time: time,
        createdAt: firestore.Timestamp.now(),
      };

      navigation.navigate('feed');
      await firestore().collection('posts').add(postData);
      console.log('Post created successfully with data: ', postData);
      // setGetError('Post created successfully with data');
      setGetError('Image uploaded successfully');
    } catch (error) {
      console.error('Error creating post:', error);
      setGetError('Error creating post');
    } finally {
      setIsLoading(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async () => {
    try {
      setIsLoading(true);

      const results = [];
      const displayNameSnapshot = await firestore()
        .collection('profileUpdate')
        .where('displayName', '>=', searchQuery)
        .where('displayName', '<=', searchQuery + '\uf8ff')
        .get();

      const lastNameSnapshot = await firestore()
        .collection('profileUpdate')
        .where('lastName', '>=', searchQuery)
        .where('lastName', '<=', searchQuery + '\uf8ff')
        .get();

      displayNameSnapshot.forEach(doc => {
        results.push({id: doc.id, ...doc.data()});
      });

      lastNameSnapshot.forEach(doc => {
        const user = {id: doc.id, ...doc.data()};
        if (!results.find(u => u.id === user.id)) {
          results.push(user);
        }
      });

      setSearchResults(results);
      setIsLoading(false);
    } catch (error) {
      console.error('Error searching users:', error);
      setGetError('Error searching users');
      setIsLoading(false);
    }
  };

  const debounceRef = useRef(null);

  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      handleSearch();
    }, 400); // debounce time in ms
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);




 
   if (isLoading || !userData) {
     return (
       <View style={styles(theme).container}>
         <ActivityIndicator size="large" color="tomato" />
         <Text
           style={{
             marginTop: 15,
             fontSize: 16,
             color: '#555',
             textAlign: 'center',
             paddingHorizontal: 20,
             fontStyle: 'italic',
           }}
         >
           If the profile is loading slowly, please close and reopen the app to
           refresh.
         </Text>
       </View>
     );
   }


  return (
    
    <KeyboardAvoidingView
 style={styles(theme).container}
  behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <KeyboardAwareScrollView
      onPress={Keyboard.dismiss}
      contentContainerStyle={styles(theme).scrollViewContainer}
  keyboardShouldPersistTaps="handled"
  enableOnAndroid={true}
  extraScrollHeight={Platform.OS === 'ios' ? 100 : 20}
  showsVerticalScrollIndicator={false}
  style={{ flex: 1 }}
      >
        <View style={styles(theme).container}>
      <ScrollView contentContainerStyle={styles(theme).scrollViewContainer}>
        <View style={styles(theme).header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons
              name="chevron-back-outline"
              color={theme === 'dark' ? '#fff' : '#121212'}
              size={24}
            />
          </TouchableOpacity>
          <Text style={styles(theme).title}>Upload Image</Text>
        </View>

        <Image source={{uri: image}} style={styles(theme).imagePreview} />

        {/* Caption Input */}
        <TextInput
          placeholder="Write a caption..."
          style={styles(theme).captionInput}
          value={caption}
          onChangeText={setCaption}
          multiline
          placeholderTextColor={theme === 'light' ? '#888' : '#ccc'}
        />

        {/* Open Modal for Tagging */}
        <TouchableOpacity
          onPress={() => setIsTagModalVisible(true)}
          style={styles(theme).openTagModalButton}>
          <Text style={styles(theme).openTagModalText}>Tag Users</Text>
        </TouchableOpacity>

        {/* Display Tagged Users */}
        <View style={styles(theme).taggedUsersContainer}>
          {taggedUsers.map((user, index) => (
            <View key={index} style={styles(theme).taggedUser}>
              <Text style={styles(theme).taggedUserName}>
                {user.displayName} {user.lastName}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setTaggedUsers(taggedUsers.filter(u => u.id !== user.id))
                }>
                <Text style={styles(theme).removeTagButton}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Submit Button */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color="tomato"
            style={{marginTop: 16}}
          />
        ) : (
          <TouchableOpacity
            onPress={createPost}
            style={styles(theme).createPostButton}>
            <Text style={styles(theme).createPostButtonText}>Post</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Tag Users Modal */}
      <RNModal
        isVisible={isTagModalVisible}
        onBackdropPress={() => setIsTagModalVisible(false)}
        style={styles(theme).modal}>
        <View style={styles(theme).modalContent}>
          <Text style={styles(theme).modalTitle}>Tag Users</Text>

          <View style={styles(theme).searchContent}>
            <TextInput
              placeholder="Search users..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              // onSubmitEditing={handleSearch}
              style={styles(theme).searchBar}
              placeholderTextColor={theme === 'light' ? '#888' : '#ccc'}
            />
            <TouchableOpacity onPress={handleSearch} style={{marginLeft: 8}}>
              <Ionicons
                name="search-outline"
                size={24}
                color={theme === 'light' ? '#000' : '#fff'}
              />
            </TouchableOpacity>
          </View>

          <FlatList
            data={searchResults}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles(theme).searchResultItem}
                onPress={() => {
                  if (!taggedUsers.find(u => u.id === item.id)) {
                    setTaggedUsers([...taggedUsers, item]);
                  }
                }}>
                <Image
                  source={{uri: item.profileImage}}
                  style={styles(theme).profileImage}
                />
                <Text style={styles(theme).searchResultText}>
                  {item.displayName} {item.lastName}
                </Text>
              </TouchableOpacity>
            )}
            style={{marginTop: 10}}
          />

          <TouchableOpacity
            onPress={() => setIsTagModalVisible(false)}
            style={styles(theme).closeModalButton}>
            <Text style={styles(theme).closeModalButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </RNModal>

      <Text style={styles(theme).getError}>{getError}</Text>
    </View>
      </KeyboardAwareScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = theme => ({
  container: {
    flex: 1,
    backgroundColor: theme === 'light' ? '#fff' : '#121212',
  },
  scrollViewContainer: {
    margin: 5,
  },
  uploadMode: {
    marginBottom: 16,
    alignItems: 'center',
  },
  uploadVideo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'tomato',
    padding: 10,
    borderRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 10,
    color: theme === 'dark' ? '#fff' : '#121212',
  },
  texth2: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: theme === 'light' ? '#fff' : '#121212',
  },
  imagePreview: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginVertical: 16,
    ResizeMode: 'contain',
  },
  captionInput: {
    borderWidth: 1,
    borderColor: theme === 'light' ? '#ccc' : '#444',
    backgroundColor: theme === 'light' ? '#f9f9f9' : '#1e1e1e',
    color: theme === 'light' ? '#000' : '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  openTagModalButton: {
    backgroundColor: '#444',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  openTagModalText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  taggedUsersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  taggedUser: {
    backgroundColor: theme === 'light' ? '#eee' : '#1e1e1e',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  taggedUserName: {
    color: theme === 'light' ? '#000' : '#fff',
    marginRight: 8,
  },
  removeTagButton: {
    color: 'red',
    fontWeight: 'bold',
  },
  pickImageButton: {
    backgroundColor: 'tomato',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  createPostButton: {
    backgroundColor: 'tomato',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  createPostButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
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
  searchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme === 'light' ? '#f0f0f0' : '#2a2a2a',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
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
  getError:{
    textAlign:'center',
  }
});

export default PostCustomize;