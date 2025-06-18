import {
  ActivityIndicator,
  Image,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import DarkMode from '../Theme/DarkMode';
import {useNavigation, useRoute} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FecthUserProfile from '../FetchUserProfile';

const ProfileHeader = () => {
  const route = useRoute();
  const {uid} = route.params;
  const theme = DarkMode();
  const navigation = useNavigation();
  const {userprofile, loading} = FecthUserProfile('profileUpdate', uid);
  const [publicProfile, setPublicProfile] = useState(null);
  const [openProfileImgModal, setOpenProfileImgModal] = useState(false);

  const openModal = () => {
    setOpenProfileImgModal(true);
  };

  const closeModal = () => {
    setOpenProfileImgModal(false);
  };

  useEffect(() => {
    setPublicProfile(userprofile);
  }, [userprofile]);

  return (
    <View>
      {loading ? (
        <>
          <View>
            <ActivityIndicator
              size={25}
              color={'tomato'}
              style={styles(theme).ActivityIndicator}
            />
          </View>
        </>
      ) : (
        <>
          <ImageBackground
            source={{uri: publicProfile?.backgroundImage}}
            alt="backimage"
            style={styles(theme).backimage}>
            <View style={styles(theme).headerIcons}>
              <TouchableOpacity
                style={styles(theme).arrowBackIcon}
                onPress={() => navigation.goBack()}>
                <Ionicons
                  name="chevron-back-outline"
                  size={24}
                  color={theme === 'dark' ? '#fff' : '#121212'}
                  style={styles(theme).icon}
                />
              </TouchableOpacity>
            </View>
            {/* <TouchableOpacity style={styles(theme).profileimageCont}> */}
            <Image
              source={{uri: publicProfile?.profileImage}}
              alt="profileimage"
              style={styles(theme).profileimage}
            />
            {/* </TouchableOpacity> */}
          </ImageBackground>
        </>
      )}

      {/* <Modal
      animationType="slide"
            transparent={true}
            visible={openProfileImgModal}
            onRequestClose={closeModal}
      >
         <Image
                source={{uri: publicProfile?.profileImage}}
                alt="profileimage"
                style={styles(theme).modalProfileImg}
              />
      </Modal> */}
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
  });