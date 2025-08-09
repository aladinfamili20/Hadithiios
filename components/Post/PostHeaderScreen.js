/* eslint-disable react-native/no-inline-styles */

import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {auth, firestore} from '../../data/Firebase';
import {CommonActions, useNavigation} from '@react-navigation/native';
import {useUser} from '../../data/Collections/FetchUserData';
import DarkMode from '../Theme/DarkMode';
import {TextInput} from 'react-native-gesture-handler';
import {truncateString} from '../TextShortner';
 const PostHeaderScreen = ({post}) => {
  const theme = DarkMode();

  const user = auth().currentUser;
  const navigation = useNavigation();
  const {userData} = useUser();
  const [profileData, setProfileData] = useState(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [report, setReport] = useState('');

  useEffect(() => {
    setProfileData(userData);
  }, [userData]);

  const navigateToProfile = userId => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'UserProfileScreen',
        params: {uid: userId},
      }),
    );
  };

  const openReportModal = () => {
    setReportModalVisible(true);
  };

  const closeReportModal = () => {
    setReportModalVisible(false);
  };

  const generateUniqueId = () => {
    return `id_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
  };

  const HandleAccountReport = async () => {
    if (!report.trim()) {
      Alert.alert('Error', 'Please provide a reason for reporting.');
      return;
    }

    try {
      if (!profileData) {
        Alert.alert('Error', 'User profile information is missing.');
        return;
      }

      const {displayName, lastName, profileImage} = profileData;
      const today = new Date();
      const date = today.toDateString();
      const hours = today.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const time = today.toLocaleDateString();
      const uid = user.uid;
      const reportId = generateUniqueId();

      const reportRef = firestore().collection('reportAccount').doc(post.uid);

      await reportRef.set(
        {
          accountReports: firestore.FieldValue.arrayUnion({
            date,
            hours,
            time,
            report,
            reportedAccountUid: post.uid,
            displayName,
            lastName,
            profileImage,
            currentUserUid: uid,
            reportId,
          }),
        },
        {merge: true},
      );
      // navigation.navigate('Homes');
      console.log('Account reported successfully!');
    } catch (error) {
      console.error('Error reporting account: ', error);
      Alert.alert('Error', 'Failed to report the account.');
    }
  };
  return (
    <View>
      {!post ? (
        // <PostHeaderSkeleton/>
        <></>
      ) : (
        <>
          <View style={styles(theme).postContainer}>
            <View style={{flexDirection: 'row'}}>
              <TouchableOpacity onPress={() => navigateToProfile(post?.uid)}>
                <Image
                  source={post?.profileImage ? {uri: post?.profileImage}   : require('../../assets/thumblogo.png')}
                  style={styles(theme).profileImage}
                />
              </TouchableOpacity>
              <View style={styles(theme).profileDetails}>
                <TouchableOpacity onPress={() => navigateToProfile(post?.uid)}>
                  <Text style={styles(theme).displayName}>
                    {post?.displayName} {truncateString(post?.lastName, 15)}
                  </Text>
                </TouchableOpacity>
                {/* <Text style={styles(theme).timetemp}>@{post?.userName}</Text> */}
                <Text style={styles(theme).timetemp}>Posted on: {post?.time}</Text>

              </View>
            </View>
            <TouchableOpacity onPress={() => openReportModal(post?.id)}>
              <Ionicons
                name="ellipsis-vertical-outline"
                color={theme === 'dark' ? '#fff' : '#5b5b5b'}
                size={24}
                style={styles(theme).reportIcon}
              />
            </TouchableOpacity>
          </View>

          <Modal
            animationType="slide"
            transparent={true}
            visible={reportModalVisible}
            onRequestClose={closeReportModal}>
            <View style={styles(theme).modalContainer}>
              <View style={styles(theme).modalContent}>
                <Text style={styles(theme).accountReportText}>
                  Report account
                </Text>
                <TextInput
                  placeholder="Issue a reason"
                  value={report}
                  multiline
                  editable
                  onChangeText={text => setReport(text)}
                  style={styles(theme).reportInput}
                  placeholderTextColor={theme === 'dark' ? '#bbb' : '#888'}
                />
                <View style={styles(theme).modalButtons}>
                  <TouchableOpacity
                    style={styles(theme).cancelButton}
                    onPress={closeReportModal}>
                    <Text
                      style={{
                        color: theme === 'dark' ? '#fff' : '#5b5b5b',
                        textAlign: 'center',
                      }}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles(theme).reportButton}
                    onPress={() => HandleAccountReport(post, report)}>
                    <Text
                      style={{
                        color: '#fff',
                        fontWeight: 'bold',
                        textAlign: 'center',
                      }}>
                      Report
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
};

export default PostHeaderScreen;

const styles = theme =>
  StyleSheet.create({
    postContainer: {
      flex: 1,
      borderRadius: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    },
    profileImage: {
      width: 35,
      height: 35,
      borderRadius: 50,
    },
    postmainheader: {
      flex: 1,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    },
    postmainheaderContent: {
      flex: 1,
      margin: 10,
      borderRadius: 20,
    },
    profileDetails: {
      marginLeft: 10,
    },
    displayName: {
      fontWeight: 'bold',
      color: theme === 'dark' ? '#fff' : '#000',
    },
    timetemp: {
      fontSize: 12,
      color: theme === 'dark' ? '#bbb' : '#5b5b5b',
    },
    reportIcon: {
      marginRight: 10,
    },
    accountReportText: {
      marginBottom: 10,
      fontWeight: 'bold',
      color: theme === 'dark' ? '#fff' : '#000',
    },
    modalContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 250,
    },
    modalContent: {
      width: 320,
      padding: 20,
      backgroundColor: theme === 'dark' ? '#444' : '#fff',
      borderRadius: 10,
      alignItems: 'center',
    },
    modalButtons: {
      flexDirection: 'row',
      marginTop: 20,
      justifyContent: 'space-between',
      gap: 10,
    },
    reportInput: {
      borderWidth: 1,
      borderColor: theme === 'dark' ? '#bbb' : '#5b5b5b',
      padding: 10,
      width: '100%',
      color: theme === 'dark' ? '#fff' : '#000',
      borderRadius: 20
    },
    cancelButton: {
      padding: 7,
      borderRadius: 7,
      width: 100,
      borderWidth: 1,
      borderColor: theme === 'dark' ? '#bbb' : '#5b5b5b',
    },
    reportButton: {
      backgroundColor: 'red',
      padding: 7,
      borderRadius: 7,
      width: 100,
    },
  });