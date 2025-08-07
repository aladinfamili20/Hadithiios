/* eslint-disable react-native/no-inline-styles */
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import DarkMode from '../Theme/DarkMode';
import {
  CommonActions,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import FecthUserProfile from '../FetchUserProfile';

const AudienceProfileInfo = () => {
  const route = useRoute();
  const theme = DarkMode();
  const { uid } = route.params;
  const { userprofile } = FecthUserProfile('profileUpdate', uid);
  const [publicProfile, setPublicProfile] = useState(null);
  const navigation = useNavigation();
  useEffect(() => {
    setPublicProfile(userprofile);
  }, [userprofile]);

  const navigateToProfile = userId => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'UserProfileScreen',
        params: { uid: userId },
      }),
    );
  };

  const openUserLink = useCallback(() => {
    if (publicProfile?.link) Linking.openURL(publicProfile.link);
  }, [publicProfile?.link]);

  return (
    <View>
      <View style={styles(theme).profileNames}>
        <View>
          <Text style={styles(theme).displayName}>
            {/* user's displayName */}
            {publicProfile?.displayName} {publicProfile?.lastName}
          </Text>
          {/* bio */}
          <Text style={styles(theme).username}>{publicProfile?.userName}</Text>

          {publicProfile?.link ? (
            <TouchableOpacity onPress={openUserLink}>
              <Text style={styles(theme).link}>{publicProfile.link}</Text>
            </TouchableOpacity>
          ) : null}

          {publicProfile?.taggedUsers?.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {publicProfile.taggedUsers.map((tag, index) => (
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
    </View>
  );
};

export default AudienceProfileInfo;

const styles = theme =>
  StyleSheet.create({
    profileNames: {
      marginTop: 20,
      color: theme === 'dark' ? '#121212' : '#fff',
    },
    displayName: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme === 'dark' ? '#fff' : '#121212',
      marginTop: 10,
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
    taggedUsers: {
      color: theme === 'dark' ? '#fff' : '#0000FF',
      lineHeight: 20,
      // color: '#0000FF',
      fontWeight: '500',
      // backgroundColor: '#0000FF',
    },
  });
