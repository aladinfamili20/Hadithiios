/* eslint-disable react-native/no-inline-styles */
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import DarkMode from '../Theme/DarkMode';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FecthUserProfile from '../FetchUserProfile';
import { auth, firestore } from '../../data/Firebase';
import RNModal from 'react-native-modal';
import { useUser } from '../../data/Collections/FetchUserData';

const ProfileHeader = ({ post }) => {
  const route = useRoute();
  const { uid } = route.params;
  const theme = DarkMode();
  const navigation = useNavigation();
  const { userData } = useUser();
  const { userprofile, loading } = FecthUserProfile('profileUpdate', uid);
  const [publicProfile, setPublicProfile] = useState(null);
  const [reportAccount, setReportAccount] = useState(false);
  const [getUserInfo, setGetUserInfo] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [getError, setGetError] = useState('');
  const currentUser = auth().currentUser;

  useEffect(() => {
    setPublicProfile(userData);
  }, [userData]);

  useEffect(() => {
    setGetUserInfo(userprofile);
  }, [userprofile]);

  // ✅ Block User Function
  const handleBlockUser = async () => {
    try {
      const today = new Date();
      const date = today.toDateString();
      const hours = today.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const blockedDate = today.toLocaleDateString();

      await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .collection('blockedUsers')
        .doc(uid)
        .set({
          blockedAt: new Date().toISOString(),
          blockedUid: uid,
          displayName: publicProfile?.displayName,
          lastName: publicProfile?.lastName,
          profileimage: publicProfile?.profileImage,
          date,
          hours,
          blockedDate,
        });

      Alert.alert('User Blocked');
      setReportAccount(false);
      navigation.goBack();
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  // Report account

  const generateReportPostUniqueId = () => {
    return `id_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
  };

  const handleReportAccount = async () => {
    try {
      const reporter = auth().currentUser;
      const today = new Date();
      const date = today.toDateString();
      const hour = today.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const time = today.toLocaleDateString();
      const reportId = generateReportPostUniqueId();

      const { displayName, lastName, profileImage } = userData; // current user
      const {
        displayName: reportedName,
        lastName: reportedLastName,
        profileImage: reportedImage,
      } = getUserInfo || {};

      const reportRef = firestore().collection('reportAccounts').doc(uid); // uid of the user being reported

      await reportRef.set(
        {
          accountReports: firestore.FieldValue.arrayUnion({
            reportId,
            date,
            hour,
            time,
            selectedCategory,
            reportedAccountUID: uid,
            reportedUserDisplayName: reportedName,
            reportedUserLastName: reportedLastName,
            reportedUserProfileImage: reportedImage,
            reportingUserUID: reporter?.uid,
            reportingUserDisplayName: displayName,
            reportingUserLastName: lastName,
            reportingUserProfileImage: profileImage,
          }),
        },
        { merge: true },
      );

      console.log('Account reported successfully');
      Alert.alert('Reported', 'The account has been reported.');
      setReportAccount(false);
      setSelectedCategory('');
    } catch (error) {
      console.error('Error reporting account:', error);
      setGetError(
        'There was an error while trying to report this account. Please try again later.',
      );
    }
  };

  function handleReportCategoryPress(category) {
    setSelectedCategory(category);
  }

  return (
    <View>
      {loading ? (
        <ActivityIndicator
          size={25}
          color={'tomato'}
          style={styles(theme).ActivityIndicator}
        />
      ) : (
        <>
          <ImageBackground
            source={{ uri: publicProfile?.backgroundImage }}
            style={styles(theme).backimage}
          >
            <View style={styles(theme).headerIcons}>
              <TouchableOpacity
                style={styles(theme).arrowBackIcon}
                onPress={() => navigation.goBack()}
              >
                <Ionicons
                  name="chevron-back-outline"
                  size={24}
                  color={theme === 'dark' ? '#fff' : '#121212'}
                  style={styles(theme).icon}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles(theme).arrowBackIcon}
                onPress={() => setReportAccount(true)}
              >
                <Ionicons
                  name="ellipsis-vertical-outline"
                  size={24}
                  color={theme === 'dark' ? '#fff' : '#121212'}
                  style={styles(theme).icon}
                />
              </TouchableOpacity>
            </View>

            <Image
              source={{ uri: publicProfile?.profileImage }}
              style={styles(theme).profileimage}
            />
          </ImageBackground>

          {/* Block Modal */}
          <RNModal
            isVisible={reportAccount}
            onBackdropPress={() => setReportAccount(false)}
            style={styles(theme).modal}
          >
            <View style={styles(theme).modalContent}>
              <Text style={styles(theme).modalTitle}>Report or Account</Text>
              <Text style={styles(theme).modalTitleH2}>
                Below are two options, you can either report this account or
                block it.
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

              <View style={styles(theme).buttons}>
                <TouchableOpacity
                  onPress={handleReportAccount}
                  style={styles(theme).closeModalButton}
                >
                  <Text style={styles(theme).closeModalButtonText}>Report Account</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles(theme).blockUserButton}
                  onPress={handleBlockUser}
                >
                  <Text style={styles(theme).blockUserText}>Block Account</Text>
                </TouchableOpacity>

              </View>

              <TouchableOpacity
                onPress={() => setReportAccount(false)}
                style={[
                  styles(theme).cancelButton,
                  { backgroundColor: 'gray' },
                ]}
              >
                <Text style={styles(theme).cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <Text>{getError}</Text>
            </View>
          </RNModal>
        </>
      )}
    </View>
  );
};

export default ProfileHeader;

const styles = theme =>
  StyleSheet.create({
    profileContainer: {
      // marginTop: Platform.OS === "ios" ? -9 : 25,
      flex: 1,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    },
    headerIcons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    profileContents: {
      margin: 10,
    },
    backimage: {
      width: '100%',
      height: 150,
    },
    profileimage: {
      width: 100,
      height: 100,
      borderRadius: 100,
      position: 'absolute',
      borderWidth: 3,
      borderColor: theme === 'dark' ? '#fff' : '#fff',
      left: '35%',
      top: '60%',
    },
    profileimageCont: {
      width: 100,
      height: 100,
      borderRadius: 100,
      position: 'absolute',
      left: '35%',
      top: '55%',
      borderColor: theme === 'dark' ? '#fff' : '#fff',
    },
    profImgBac: {
      position: 'absolute',
    },
    editProfileIcon: {
      position: 'absolute',
      left: '46%',
      top: '107%',
      backgroundColor: 'tomato',
      borderRadius: 20,
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    arrowBackIcon: {
      backgroundColor: theme === 'dark' ? '#121212' : '#ffff',
      borderRadius: 50,
      color: theme === 'dark' ? '#fff' : '#121212',
      width: 30,
      height: 30,
      margin: 10,
    },
    icon: {
      marginTop: 2,
    },
    ActivityIndicator: {
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 50,
    },
    modalProfileImg: {
      width: 250,
      height: 250,
      borderRadius: 20,
      justifyContent: 'center',
      alignSelf: 'center',
      marginTop: 50,
      resizeMode: 'contain',
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
      width: 150,
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
    blockUserButton: {
      width: 150,
      marginTop: 20,
      backgroundColor: 'red',
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    blockUserText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
    cancelButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
    buttons: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    cancelButton: {
      marginTop: 20,
      backgroundColor: 'red',
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    getError: {
      textAlign: 'center',
    },
  });
