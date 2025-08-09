/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ImageBackground,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RNModal from 'react-native-modal';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import DarkMode from '../Theme/DarkMode';
import FecthUserProfile from '../FetchUserProfile';

const REPORT_CATEGORIES = [
  'Impersonation',
  'Fake account',
  'Harassment or bullying',
  'Threats or intimidation',
  'Hate speech or symbols',
  'Scam or fraud',
  'Sharing private information',
  'Sexual exploitation',
  'Child exploitation',
];

const ProfileHeader = ({ userData }) => {
  const route = useRoute();
  const { uid } = route.params;

  const theme = DarkMode();
  const navigation = useNavigation();
  const themedStyles = useMemo(() => styles(theme), [theme]);

  const { userprofile, loading } = FecthUserProfile('profileUpdate', uid);

  const [reportAccount, setReportAccount] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [getError, setGetError] = useState('');

  const getUserInfo = userprofile;
  const publicProfile = userprofile;

  // Block User Handler
  const handleBlockUser = async () => {
    try {
      const now = new Date();
      const currentUser = auth().currentUser;

      await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .collection('blockedUsers')
        .doc(uid)
        .set({
          blockedAt: now.toISOString(),
          blockedUid: uid,
          displayName: publicProfile?.displayName,
          lastName: publicProfile?.lastName,
          profileimage: publicProfile?.profileImage,
          date: now.toDateString(),
          hours: now.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          blockedDate: now.toLocaleDateString(),
        });

      Alert.alert('User Blocked');
      setReportAccount(false);
      navigation.goBack();
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  // Report Handler
  const generateReportPostUniqueId = () => {
    return `id_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
  };

  const handleReportAccount = async () => {
    try {
      const reporter = auth().currentUser;
      const now = new Date();
      const reportId = generateReportPostUniqueId();

      const { displayName, lastName, profileImage } = userData;
      const {
        displayName: reportedName,
        lastName: reportedLastName,
        profileImage: reportedImage,
      } = getUserInfo || {};

      await firestore()
        .collection('reportAccounts')
        .doc(uid)
        .set(
          {
            accountReports: firestore.FieldValue.arrayUnion({
              reportId,
              date: now.toDateString(),
              hour: now.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
              time: now.toLocaleDateString(),
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

  const handleReportCategoryPress = useCallback(category => {
    setSelectedCategory(category);
  }, []);

  return (
    <View>
      {loading ? (
        <ActivityIndicator
          size={25}
          color="tomato"
          style={themedStyles.ActivityIndicator}
        />
      ) : (
        <>
          <ImageBackground
            source={
              publicProfile?.backgroundImage
                ? { uri: publicProfile.backgroundImage }
                : require('../../assets/thumbpng.png')
            }
            // source={require('../../assets/thumbpng.png')}
            style={themedStyles.backimage}
          >
            <View style={themedStyles.headerIcons}>
              <TouchableOpacity
                style={themedStyles.arrowBackIcon}
                onPress={() => navigation.goBack()}
              >
                <Ionicons
                  name="chevron-back-outline"
                  size={24}
                  color={theme === 'dark' ? '#fff' : '#121212'}
                  style={themedStyles.icon}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={themedStyles.arrowBackIcon}
                onPress={() => setReportAccount(true)}
              >
                <Ionicons
                  name="ellipsis-vertical-outline"
                  size={24}
                  color={theme === 'dark' ? '#fff' : '#121212'}
                  style={themedStyles.icon}
                />
              </TouchableOpacity>
            </View>

            <Image
              // source={{ uri: publicProfile?.profileImage }}
              source={
                publicProfile.profileImage
                  ? { uri: publicProfile.profileImage }
                  : require('../../assets/thumblogo.png')
              }
              style={themedStyles.profileimage}
            />
          </ImageBackground>

          {/* Report Modal */}
          <RNModal
            isVisible={reportAccount}
            onBackdropPress={() => setReportAccount(false)}
            style={themedStyles.modal}
          >
            <View style={themedStyles.modalContent}>
              <Text style={themedStyles.modalTitle}>Report or Account</Text>
              <Text style={themedStyles.modalTitleH2}>
                Below are two options, you can either report this account or
                block it.
              </Text>

              <ScrollView>
                <View style={themedStyles.categoryConatiner}>
                  {REPORT_CATEGORIES.map((category, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleReportCategoryPress(category)}
                      style={[
                        themedStyles.categoryButton,
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
                          themedStyles.categoryText,
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

              <View style={themedStyles.buttons}>
                <TouchableOpacity
                  onPress={handleReportAccount}
                  style={themedStyles.closeModalButton}
                >
                  <Text style={themedStyles.closeModalButtonText}>
                    Report Account
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleBlockUser}
                  style={themedStyles.blockUserButton}
                >
                  <Text style={themedStyles.blockUserText}>Block Account</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => setReportAccount(false)}
                style={[themedStyles.cancelButton, { backgroundColor: 'gray' }]}
              >
                <Text style={themedStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              {getError ? (
                <Text style={{ color: 'red' }}>{getError}</Text>
              ) : null}
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
      textAlign: 'center'
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
