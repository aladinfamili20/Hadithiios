/* eslint-disable react-native/no-inline-styles */
import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import DarkMode from '../Theme/DarkMode';
import { useUser } from '../../data/Collections/FetchUserData';

const ProfileHeaderInfo = () => {
  const theme = DarkMode();
  const navigation = useNavigation();
  const { userData, isLoading } = useUser();

  const themedStyles = useMemo(() => styles(theme), [theme]);

  const handleEditPress = useCallback(() => {
    navigation.navigate('profilesetup');
  }, [navigation]);

  const openUserLink = useCallback(() => {
    if (userData?.link) Linking.openURL(userData.link);
  }, [userData?.link]);

  const navigateToProfile = userId => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'UserProfileScreen',
        params: { uid: userId },
      }),
    );
  };

  if (isLoading) {
    return (
      <SkeletonPlaceholder>
        <SkeletonPlaceholder.Item width={120} height={20} borderRadius={4} />
        <SkeletonPlaceholder.Item
          marginTop={6}
          width={80}
          height={20}
          borderRadius={4}
        />
      </SkeletonPlaceholder>
    );
  }

  return (
    <View>
      <View style={themedStyles.profileNames}>
        <TouchableOpacity
          onPress={handleEditPress}
          style={themedStyles.editProfileButton}
        >
          <Text style={themedStyles.editProfile}>Edit Profile</Text>
        </TouchableOpacity>

        {userData && (
          <View>
            <Text style={themedStyles.displayName}>
              {userData.displayName} {userData.lastName}
            </Text>
            <Text style={themedStyles.username}>{userData.userName}</Text>

            {userData?.link ? (
              <TouchableOpacity onPress={openUserLink}>
                <Text style={themedStyles.link}>{userData.link}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}

        {userData?.taggedUsers?.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {userData.taggedUsers.map((tag, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => navigateToProfile(tag.uid)}
              >
                <Text style={styles(theme).taggedUsers}>
                  @{tag.displayName} {tag.lastName}{' '}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

export default React.memo(ProfileHeaderInfo);

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

    taggedUsers: {
      color: theme === 'dark' ? '#fff' : '#0000FF',
      lineHeight: 20,
      // color: '#0000FF',
      fontWeight: '500',
      // backgroundColor: '#0000FF',
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
