/* eslint-disable react-native/no-inline-styles */
import {Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useRoute} from '@react-navigation/native';
 import DarkMode from '../Theme/DarkMode';
import FecthUserProfile from '../FetchUserProfile';

const AudienceBio = () => {
  const theme = DarkMode();
  const route = useRoute();
  const {uid} = route.params;
  const {userprofile} = FecthUserProfile('profileUpdate', uid);
  const [publicProfile, setPublicProfile] = useState(null);

  const [biobModal, setBioModal] = useState(null);
  const openBio = () => {
    setBioModal(true);
  };

  const closeBioModal = () => {
    setBioModal(false);
  };
  useEffect(() => {
    setPublicProfile(userprofile);
  }, [userprofile]);

  const truncateString = (str, maxLength) => {
    return str?.length > maxLength ? str.substring(0, maxLength) + '...' : str;
  };

  return (
    <View>
      <View style={styles(theme).bioContainer}>
        {/* <Text style={styles(theme).bio}>Bio</Text> */}

        <Text style={styles(theme).username} onPress={openBio}>
          {truncateString(publicProfile?.bio, 150)}
        </Text>
      </View>


      <Modal
        animationType="slide"
        transparent={true}
        visible={biobModal}
        onRequestClose={closeBioModal}>
        <View>
          {/* <Text>Report account</Text> */}

          <View style={styles(theme).modalContainer}>
            <View style={styles(theme).ReportModalContent}>
              <Text
                style={{
                  color: theme === 'dark' ? '#fff' : '#121212',
                  marginBottom: 10,
                  fontWeight: 'bold',
                }}>
                {publicProfile?.displayName} {publicProfile?.lastName}'s Bio
              </Text>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text
                  style={{
                    color: theme === 'dark' ? '#fff' : '#121212',
                    lineHeight: 20,
                  }}>
                  {publicProfile?.bio}
                </Text>
              </ScrollView>

              <View style={styles(theme).modalButtons}>
                <TouchableOpacity
                  style={{
                    // backgroundColor: '#5b5b5b',
                    padding: 7,
                    borderRadius: 7,
                    width: 100,
                    borderWidth: 1,
                    borderColor: '#5b5b5b',
                  }}
                  onPress={closeBioModal}>
                  <Text
                    style={{
                      color: theme === 'dark' ? '#fff' : '#121212',
                      textAlign: 'center',
                    }}>
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AudienceBio;

const styles = theme=> StyleSheet.create({
  profileContainer: {
    // marginTop: Platform.OS === "ios" ? -9 : 25,
    flex:1,
    backgroundColor: theme === 'dark' ? '#121212' : '#fff',
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
    left: '35%',
    top: '55%',
    borderWidth: 3,
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
  profileNames: {
    marginTop: 20,
    color: theme === 'dark' ? '#121212' : '#fff',
  },
  displayName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme === 'dark' ? '#fff' : '#121212',
  },
  username: {
    fontSize: 15,
    fontWeight: 'normal',
    color: theme === 'dark' ? '#fff' : '#121212',
  },
  link: {
    fontSize: 15,
    fontWeight: 'normal',
    color: theme === 'dark' ? '#fff' : '#121212',
    textDecorationLine: 'underline',
  },
  followerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  followerConent: {
    marginLeft: 10,
  },
  follower: {
    fontSize: 19,
    fontWeight: 'bold',
    color: theme === 'dark' ? '#fff' : '#121212',
    textAlign: 'center',
  },
  followerNunber: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme === 'dark' ? '#fff' : '#121212',
  },
  userAudience: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    borderWidth: 1,
    borderColor: theme === 'dark' ? '#fff' : '#121212',
    borderRadius: 20,
    padding: 10,
  },

  bio: {
    fontSize: 19,
    fontWeight: 'bold',
    color: theme === 'dark' ? '#fff' : '#121212',
  },

  photosLenghts: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
    color: theme === 'dark' ? '#fff' : '#121212',
  },
  headerIcons: {
    margin: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  arrowBackIcon: {
    backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    borderRadius: 50,
    // color: theme === 'dark' ? '#fff' : '#121212',
  },
  dotsIcon: {
    backgroundColor: theme === 'dark' ? '#fff' : '#121212',
    borderRadius: 50,
  },
  topHeaderIcons: {
    margin: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  imageContainer: {
    width: '30%', // Three images per row
    marginBottom: 10,
    marginLeft: 10,
  },
  userPhotos: {
    width: '100%',
    height: 130,
    // borderRadius: 20,
  },
  userPhotosLenghts: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  photosText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
    color: theme === 'dark' ? '#fff' : '#121212',
  },

  // Caption modal

  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 200,
  },
  ReportModalContent: {
    width: 320,
    padding: 20,
    backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    borderRadius: 10,
    alignItems: 'center',
    // borderWidth:1,
    elevation: 10,
    height: 400,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
    gap: 10,
    width: '100%',
    textAlign: 'center',
  },
  reportInput: {
    borderWidth: 1,
    borderColor: '#5b5b5b',
    padding: 10,
    width: '100%',
  },
});