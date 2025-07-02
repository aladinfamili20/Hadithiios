import {
  ActivityIndicator,
  Image,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import DarkMode from '../Theme/DarkMode';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../data/Collections/FetchUserData';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ProfileBackground = () => {
  const theme = DarkMode();
  const navigation = useNavigation();
  const { userData, isLoading } = useUser();

  return (
    <View>
      {isLoading ? (
        <View style={styles(theme).loadingContainer}>
          <ActivityIndicator size="large" color="tomato" />
        </View>
      ) : (
        <View>
          {userData && (
            <ImageBackground
              // source={{uri: userData.backgroundImage}}
              source={
                userData.backgroundImage
                  ? { uri: userData.backgroundImage }
                  : require('../../assets/thumbpng.png')
              }
              //  source={require('../../assets/thumbpng.png')}

              style={styles(theme).backimage}
            >
              <View style={styles(theme).headerIcons}>
                <TouchableOpacity
                  style={styles(theme).arrowBackIcon}
                  // onPress={() => navigation.navigate('Home')}
                >
                  {/* <Ionicons
                name="chevron-back-outline"
                size={24}
                color={theme === 'dark' ? '#fff' : '#121212'}
              /> */}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles(theme).dotsIcon}
                  onPress={() => navigation.navigate('Settings')}
                >
                  <Ionicons
                    name="settings-outline"
                    size={24}
                    color={theme === 'dark' ? '#fff' : '#121212'}
                  />
                </TouchableOpacity>
              </View>
              <Image
                source={
                  userData.profileImage
                    ? { uri: userData.profileImage }
                    : require('../../assets/thumblogo.png')
                }
                style={styles(theme).profileimage}
              />
            </ImageBackground>
          )}
        </View>
      )}
    </View>
  );
};

export default ProfileBackground;

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
    loadingContainer:{
      justifyContent: 'center',
      alignItems: 'center',
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
      borderColor: theme === 'dark' ? '#121212' : '#fff',
    },
    profImgBac: {
      position: 'absolute',
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
      width: 25,
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
