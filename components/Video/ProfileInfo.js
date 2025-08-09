import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import DarkMode from '../Theme/DarkMode';
import {CommonActions, useNavigation, useRoute} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import UserCollectionFech from '../UserCollectionFech';


const ProfileInfo = () => {
    const theme = DarkMode();
    const route = useRoute();
    const {id} = route.params;
      const navigation = useNavigation();
    const {document} = UserCollectionFech('videos', id);
    const [postDetails, setPostDetails] = useState(null);

    useEffect(() => {
      setPostDetails(document);
    }, [document]);

    const navigateToProfile = userId => {
      navigation.dispatch(
        CommonActions.navigate({
          name: 'UserProfileScreen',
          params: {uid: userId},
        }),
      );
    };
  return (
    <View>
    <View style={styles(theme).topHeader}>
      <View style={styles(theme).topHeaderIcons}>
        <TouchableOpacity
          onPress={() => navigation.navigate('feed')}
          accessible={true}
          accessibilityLabel="Back to feed">
          <Ionicons
            name="chevron-back-outline"
            color={theme === 'dark' ? '#fff' : '#121212'}
            size={25}
            style={styles(theme).leftArrowIcon}
          />
        </TouchableOpacity>
      </View>

      {postDetails && (
        <>
          <TouchableOpacity
            onPress={() => navigateToProfile(postDetails.uid)}
            accessible={true}
            accessibilityLabel="Go to profile">
            <View style={styles(theme).profileContainer}>
              <Image
                source={postDetails.profileImage ? {uri: postDetails.profileImage}   : require('../../assets/thumblogo.png')}
                style={styles(theme).profileImage}
              />
              <View style={styles(theme).profileDetails}>
                <Text style={styles(theme).displayName}>
                  {postDetails.displayName} {postDetails.lastName}
                </Text>
                <Text style={styles(theme).timetemp}>{postDetails.time}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </>
      )}
    </View>
  </View>
  );
};

export default ProfileInfo;

const styles = theme =>
    StyleSheet.create({

      profileImage: {
        width: 30,
        height: 30,
        borderRadius: 50,
      },
      profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      profileDetails: {
        marginLeft: 10,
      },
      image: {
        width: '100%',
        height: 300,
        objectFit: 'contain',
      },
      topHeader: {
        backgroundColor: theme === 'dark' ? '#121212' : '#fff',
        height: 50,
        flexDirection: 'row',
        gap: 10,
        marginTop: 10,
        alignItems: 'center',
        alignContent: 'center',
      },

      topHeaderIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        // marginTop: 15,
       },
      timetemp: {
        fontSize: 10,
      },
      displayName: {
        fontWeight: 'bold',
        color: theme === 'dark' ? '#fff' : '#121212',
        fontSize: 14
      },
    });