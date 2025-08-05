/* eslint-disable no-trailing-spaces */
/* eslint-disable react-native/no-inline-styles */
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import firestore from '@react-native-firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import RNModal from 'react-native-modal';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
const SearchUsers = () => {
  const user = auth().currentUser;
  const uid = user?.uid;
  const [caption, setCaption] = useState('');
  const { userData, isLoading } = useUser();
  const [loading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const navigation = useNavigation();
  const theme = DarkMode();
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [isTagModalVisible, setIsTagModalVisible] = useState(false);
  const [getError, setGetError] = useState('');

  useEffect(() => {
    setProfileData(userData);
  }, [userData]);

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
        results.push({ id: doc.id, ...doc.data() });
      });

      lastNameSnapshot.forEach(doc => {
        const user = { id: doc.id, ...doc.data() };
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
        contentContainerStyle={styles(theme).scrollViewContainer}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={Platform.OS === 'ios' ? 100 : 20}
        showsVerticalScrollIndicator={false}
      >
        {/* Open Modal for Tagging */}
        <TouchableOpacity
          onPress={() => setIsTagModalVisible(true)}
          style={styles(theme).openTagModalButton}
        >
          <Text style={styles(theme).openTagModalText}>Tag Users</Text>
        </TouchableOpacity>

        {/* Display Tagged Users */}
        <View style={styles(theme).taggedUsersContainer}>
          {taggedUsers.map((user, index) => (
            <View key={index} style={styles(theme).taggedUser}>
              <View style={styles(theme).taggedDisplayInfo}>
                <Image
                  source={{ uri: user.profileImage }}
                  style={styles(theme).TaggedProfileImage}
                />
                <Text style={styles(theme).taggedUserName}>
                  {user.displayName} {user.lastName}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  setTaggedUsers(taggedUsers.filter(u => u.id !== user.id))
                }
              >
                <Text style={styles(theme).removeTagButton}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Tag Users Modal */}

        <RNModal
          isVisible={isTagModalVisible}
          onBackdropPress={() => setIsTagModalVisible(false)}
          style={styles(theme).modal}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
            style={styles(theme).modalContent}
          >
            <Text style={styles(theme).modalTitle}>Tag Users</Text>

            <View style={styles(theme).searchContent}>
              <TextInput
                placeholder="Search users..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles(theme).searchBar}
                placeholderTextColor={theme === 'light' ? '#888' : '#ccc'}
              />
              <TouchableOpacity
                onPress={handleSearch}
                style={{ marginLeft: 8 }}
              >
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
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles(theme).searchResultItem}
                  onPress={() => {
                    if (!taggedUsers.find(u => u.id === item.id)) {
                      setTaggedUsers([...taggedUsers, item]);
                    }
                  }}
                >
                  <Image
                    source={{ uri: item.profileImage }}
                    style={styles(theme).profileImage}
                  />
                  <Text style={styles(theme).searchResultText}>
                    {item.displayName} {item.lastName}
                  </Text>
                </TouchableOpacity>
              )}
              style={{ marginTop: 10 }}
            />

            <TouchableOpacity
              onPress={() => setIsTagModalVisible(false)}
              style={styles(theme).closeModalButton}
            >
              <Text style={styles(theme).closeModalButtonText}>Done</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </RNModal>
      </KeyboardAwareScrollView>
    </KeyboardAvoidingView>
  );
};

import { StyleSheet } from 'react-native';
import DarkMode from './Theme/DarkMode';
import { auth } from '../data/Firebase';
import { useUser } from '../data/Collections/FetchUserData';

export const styles = theme =>
  StyleSheet.create({
    openTagModalButton: {
      backgroundColor: theme === 'dark' ? '#333' : '#e0e0e0',
      padding: 12,
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: 16,
    },
    openTagModalText: {
      color: theme === 'dark' ? '#fff' : '#000',
      fontWeight: '500',
    },
    taggedUsersContainer: {
      marginBottom: 16,
    },
    taggedUser: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: theme === 'dark' ? '#1f1f1f' : '#f0f0f0',
      padding: 12,
      borderRadius: 10,
      marginBottom: 8,
    },
    taggedUserName: {
      color: theme === 'dark' ? '#fff' : '#000',
      fontSize: 16,
    },
    removeTagButton: {
      color: 'tomato',
      fontWeight: '500',
    },

    modal: {
      justifyContent: 'flex-end',
      margin: 0,
      // marginBottom: 20
    },
    modalContent: {
      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fff',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      // marginBottom: 20,
      maxHeight: '85%',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '600',
      marginBottom: 16,
      color: theme === 'dark' ? '#fff' : '#000',
    },
    searchContent: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f0f0f0',
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    searchBar: {
      flex: 1,
      color: theme === 'dark' ? '#fff' : '#000',
      fontSize: 16,
    },
    searchResultItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 8,
      borderBottomWidth: 0.5,
      borderBottomColor: theme === 'dark' ? '#333' : '#ccc',
    },
    taggedDisplayInfo: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignContent: 'center',
      alignItems: 'center',
    },
    profileImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
    },
    TaggedProfileImage: {
      width: 20,
      height: 20,
      borderRadius: 20,
      marginRight: 12,
    },
    searchResultText: {
      color: theme === 'dark' ? '#fff' : '#000',
      fontSize: 16,
    },
    closeModalButton: {
      backgroundColor: 'tomato',
      padding: 14,
      borderRadius: 12,
      marginTop: 20,
      alignItems: 'center',
      marginBottom: 40,
    },
    closeModalButtonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 16,
    },
  });

export default SearchUsers;
