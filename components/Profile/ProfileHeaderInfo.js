import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import React from 'react';
import DarkMode from '../Theme/DarkMode';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../data/Collections/FetchUserData';

const ProfileHeaderInfo = () => {
  const theme = DarkMode();
  const navigation = useNavigation();
  const { userData, isLoading } = useUser();

  return (
    <View>
      {isLoading ? (
        <>
          <Text style={styles(theme).loadingProfile}>Loading profile</Text>
        </>
      ) : (
        <>
          <View style={styles(theme).profileNames}>
            <TouchableOpacity
              onPress={() => navigation.navigate('profilesetup')}
              style={styles(theme).editProfileButton}
            >
              <Text style={styles(theme).editProfile}>Edit Profile</Text>
            </TouchableOpacity>
            {userData && (
              <View>
                <Text style={styles(theme).displayName}>
                  {userData.displayName} {userData.lastName}
                </Text>
                <Text style={styles(theme).username}>{userData.userName}</Text>

                 <TouchableOpacity
                  onPress={() => Linking.openURL(userData?.link)}>
                  <Text style={styles(theme).link}>{userData?.link}</Text>
                </TouchableOpacity>
          
              </View>
            )}
          </View>
        </>
      )}
    </View>
  );
};

export default ProfileHeaderInfo;

const styles = theme =>
  StyleSheet.create({
    profileContainer: {
      // marginTop: Platform.OS === 'ios' ? -9 :25,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
      flex: 1,
    },
    profileContents: {
      margin: 10,
    },
    backimage: {
      width: '100%',
      height: 150,
    },
    loadingProfile: {
      color: theme === 'dark' ? '#121212' : '#fff',
    },
    profileimage: {
      width: 100,
      height: 100,
      borderRadius: 100,
      position: 'absolute',
      left: '35%',
      top: '55%',
      borderWidth: 3,
      borderColor: theme === 'dark' ? '#121212' : '#fff',
    },
    profImgBac: {
      position: 'absolute',
    },

    profileNames: {
      marginTop: 30,
      color: theme === 'dark' ? '#121212' : '#fff',
      // margin: 10,
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

    editProfile: {
      fontWeight: 'normal',
      color: theme === 'dark' ? '#fff' : '#121212',
      textAlign: 'center',
    },
    editProfileButton: {
      borderWidth: 1,
      borderColor: 'tomato',
      width: 100,
      alignSelf: 'center',
      borderRadius: 10,
      marginTop: 10,
    },

    headerIcons: {
      margin: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    arrowBackIcon: {
      backgroundColor: theme === 'dark' ? '#121212' : '#ffff',
      borderRadius: 50,
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    dotsIcon: {
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
      borderRadius: 50,
      padding: 5,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  });
