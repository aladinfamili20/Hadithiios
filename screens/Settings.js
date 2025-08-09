/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-shadow */
/* eslint-disable no-dupe-keys */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  StatusBar,
  SectionList,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import { useNavigation } from '@react-navigation/native';
import About from './InfoSupport/About';
import { firebase } from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/firestore';
import { auth } from '../data/Firebase';
import DarkMode from '../components/Theme/DarkMode';
import RNModal from 'react-native-modal';

const Settings = () => {
  const theme = DarkMode();
  const user = auth().currentUser;
  const navigation = useNavigation();
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  const [reportModal, setReportModal] = useState(false);

  const AboutOpenModule = () => {
    setAboutModalVisible(true);
  };

  const AboutCloseModal = () => {
    setAboutModalVisible(false);
  };

  const loggOff = () => {
    const auth = firebase.auth();
    auth
      .signOut()
      .then(() => {
        console.log('User logged out successfully');
        navigation.navigate('login');
      })
      .catch(error => {
        console.log(error, 'User logged out unsuccessful');
      });
  };

  return (
    <ScrollView style={styles(theme).settingContainer}>
      <StatusBar backgroundColor="orangered" />
      <View>
        <View style={styles(theme).topHeader}>
          <View style={styles(theme).topHeaderIcons}>
            <TouchableOpacity onPress={() => navigation.navigate('profile')}>
              <Ionicons
                name="chevron-back-outline"
                color={theme === 'dark' ? '#fff' : '#121212'}
                size={24}
                style={styles(theme).leftArrowIcon}
              />
            </TouchableOpacity>
            <Text style={styles(theme).uploadTopText}>Settings</Text>
          </View>
        </View>
        <View style={{ padding: 16 }}>
          <View style={styles(theme).settingsAttributes}>
            <Text style={styles(theme).text}>Interactions</Text>
            <TouchableOpacity
              style={styles(theme).settingsButtons}
              onPress={() => navigation.navigate('savedposts')}
            >
              <Ionicons
                name="image-outline"
                color={theme === 'dark' ? '#fff' : '#121212'}
                size={24}
              />
              <Text style={styles(theme).settingsLinksText}>Saved photos</Text>
            </TouchableOpacity>
            {/* Saved videos */}
            <TouchableOpacity
              style={styles(theme).settingsButtons}
              onPress={() => navigation.navigate('savedvideos')}
            >
              <Ionicons
                name="play-outline"
                color={theme === 'dark' ? '#fff' : '#121212'}
                size={24}
              />
              <Text style={styles(theme).settingsLinksText}>Saved videos</Text>
            </TouchableOpacity>
            {/* Licked posts */}
            <TouchableOpacity
              style={styles(theme).settingsButtons}
              onPress={() => navigation.navigate('lickedposts')}
            >
              <Ionicons
                name="image-outline"
                color={theme === 'dark' ? '#fff' : '#121212'}
                size={24}
              />
              <Text style={styles(theme).settingsLinksText}>Liked photos</Text>
            </TouchableOpacity>
            {/* Licked videos */}
            <TouchableOpacity
              style={styles(theme).settingsButtons}
              onPress={() => navigation.navigate('lickedvideos')}
            >
              <Ionicons
                name="play-outline"
                color={theme === 'dark' ? '#fff' : '#121212'}
                size={24}
              />
              <Text style={styles(theme).settingsLinksText}>Liked video</Text>
            </TouchableOpacity>
            <Text style={styles(theme).text}>Access</Text>
            <TouchableOpacity
              style={styles(theme).settingsButtons}
              onPress={() => navigation.navigate('manageblockedusers')}
            >
              <Ionicons
                name="ban-outline"
                color={theme === 'dark' ? '#fff' : '#121212'}
                size={24}
              />
              <Text style={styles(theme).settingsLinksText}>
                Manage Blocked Users
              </Text>
            </TouchableOpacity>
            <Text style={styles(theme).text}>Legal Policies</Text>
            <TouchableOpacity
              style={styles(theme).settingsButtons}
              onPress={() => navigation.navigate('Terms of Service')}
            >
              <Entypo
                name="book"
                color={theme === 'dark' ? '#fff' : '#121212'}
                size={24}
              />
              <Text style={styles(theme).settingsLinksText}>
                Terms of Service
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles(theme).settingsButtons}
              onPress={() => navigation.navigate('Privacy Policy')}
            >
              <Ionicons
                name="shield-outline"
                color={theme === 'dark' ? '#fff' : '#121212'}
                size={24}
              />
              <Text style={styles(theme).settingsLinksText}>
                Privacy Policy
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles(theme).settingsButtons}
              onPress={() => navigation.navigate('Community Guidelines')}
            >
              <Ionicons
                name="people-outline"
                color={theme === 'dark' ? '#fff' : '#121212'}
                size={24}
              />
              <Text style={styles(theme).settingsLinksText}>
                Community Guidelines
              </Text>
            </TouchableOpacity>
            <Text style={styles(theme).text}>Info & Support</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Help')}
              style={styles(theme).settingsButtons}
            >
              <Ionicons
                name="help-buoy-outline"
                color={theme === 'dark' ? '#fff' : '#121212'}
                size={24}
              />
              <Text style={styles(theme).settingsLinksText}>Help</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles(theme).settingsButtons}
              // onPress={AboutOpenModule}
              onPress={() => setReportModal(true)}
            >
              <Ionicons
                name="information-circle-outline"
                color={theme === 'dark' ? '#fff' : '#121212'}
                size={24}
              />
              <Text style={styles(theme).settingsLinksText}>About</Text>

              <RNModal
                isVisible={reportModal}
                onBackdropPress={() => setReportModal(false)}
                style={styles(theme).modal}
              >
                <View style={styles(theme).modalContent}>
                  <Text style={styles(theme).modalTitle}>About your account</Text>
                  {/* <Text style={styles(theme).modalTitleH2}>
                    Why are you reporting this post?
                  </Text> */}

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
                          backgroundColor:
                            theme === 'light' ? '#fff' : '#1c1c1c',
                          borderTopLeftRadius: 20,
                          borderTopRightRadius: 20,
                          paddingTop: 10,
                          maxHeight: '100%',
                        }}
                      >
                        {/* Drag handle */}
                        <View
                          style={{
                            width: 40,
                            height: 5,
                            borderRadius: 3,
                            backgroundColor:
                              theme === 'light' ? '#ccc' : '#555',
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
                          About yout account
                        </Text>
                        {/* <Text
                          style={{
                            fontSize: 14,
                            color: theme === 'light' ? '#555' : '#bbb',
                            textAlign: 'center',
                            marginBottom: 15,
                          }}
                        >
                          Why are you reporting this post?
                        </Text> */}

                        <About />
                      </View>
                    </RNModal>
                  </ScrollView>
                </View>
              </RNModal>
            </TouchableOpacity>
            <Text style={styles(theme).text}>Account</Text>
            <TouchableOpacity
              style={styles(theme).settingsButtons}
              onPress={() => navigation.navigate('signup')}
            >
              <Ionicons
                name="add"
                color={theme === 'dark' ? '#fff' : '#121212'}
                size={24}
              />
              <Text style={styles(theme).settingsLinksText}>Add account</Text>
            </TouchableOpacity>
            <Text style={styles(theme).text}>Danger zone</Text>

            <View>
              <TouchableOpacity
                style={[styles(theme).settingsButtons, styles(theme).loggout]}
                onPress={() => navigation.navigate('DeleteAccount')}
              >
                <Ionicons name="trash-outline" color={'white'} size={24} />
                <Text
                  style={[
                    styles(theme).settingsLinksText,
                    styles(theme).loggoutText,
                  ]}
                >
                  Delete account
                </Text>
              </TouchableOpacity>
            </View>

            <View>
              <TouchableOpacity
                style={[styles(theme).settingsButtons, styles(theme).loggout]}
                onPress={loggOff}
              >
                <Ionicons name="log-out-outline" color={'white'} size={24} />
                <Text
                  style={[
                    styles(theme).settingsLinksText,
                    styles(theme).loggoutText,
                  ]}
                >
                  Log out as: {user.email}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default Settings;

const styles = theme =>
  StyleSheet.create({
    settingContainer: {
      flex: 1,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    },
    settingsText: {
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    topLine: {
      borderTopWidth: 5,
      width: 50,
      alignSelf: 'center',
      borderColor: theme === 'dark' ? '#121212' : '#fff',
    },
    settingsButtons: {
      marginTop: 10,
      backgroundColor: theme === 'dark' ? '#5f5f5f' : '#f5f5f5',
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
    },
    settingsLinksText: {
      marginLeft: 10,
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    },
    darkContainer: {
      backgroundColor: theme === 'dark' ? '#fff' : '#121212',
    },
    text: {
      fontSize: 24,
      color: theme === 'dark' ? '#fff' : '#121212',
      marginTop: 10,
    },
    darkText: {
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    text: {
      marginTop: 10,
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    loggout: {
      backgroundColor: 'red',
    },
    loggoutText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    topHeader: {
      // marginTop: Platform.OS === 'ios' ? -9 : 20,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
      height: 50,
    },

    topHeaderIcons: {
      margin: 10,
      flexDirection: 'row',
      alignItems: 'center',
    },
    uploadTopText: {
      color: theme === 'dark' ? '#fff' : '#121212',
      fontWeight: 'bold',
      textAlign: 'center',
      marginLeft: 50,
      fontSize: 20,
    },
  });
