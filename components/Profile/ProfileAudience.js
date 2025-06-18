import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const ProfileAudience = ({theme, followers, following}) => {
  return (
    <View>
      {/* <View style={styles(theme).userAudience}>
        <View style={styles(theme).followerContainer}>
          <View style={styles(theme).followerConent}>
            <Text style={styles(theme).follower}>{followers.length}</Text>
            <Text style={styles(theme).followerNunber}>Followers</Text>
          </View>
        </View>
        <View style={styles(theme).followerContainer}>
          <View style={styles(theme).followerConent}>
            <Text style={styles(theme).follower}>{following.length}</Text>
            <Text style={styles(theme).followerNunber}>Following</Text>
          </View>
        </View>
      </View> */}

      <View style={styles(theme).userAudience}>
              <View style={styles(theme).followerContainer}>
                <View style={styles(theme).followerContent}>
                  <Text style={styles(theme).follower}>
                    {followers.length || 0}
                  </Text>
                  <Text style={styles(theme).followerLabel}>Followers</Text>
                </View>
              </View>
      
              <View style={styles(theme).followerContainer}>
                <View style={styles(theme).followerContent}>
                  <Text style={styles(theme).follower}>
                    {following.length || 0}
                  </Text>
                  <Text style={styles(theme).followerLabel}>Following</Text>
                </View>
              </View>
            </View>
    </View>
  );
};

export default ProfileAudience

const styles = theme =>
  StyleSheet.create({
     container: {
      padding: 20,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
      flex: 1,
    },
    userAudience: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 20,
      borderWidth: 1,
      borderColor: theme === 'dark' ? '#fff' : '#ccc',
      borderRadius: 20,
      padding: 15,
      backgroundColor: theme === 'dark' ? '#1e1e1e' : '#f9f9f9',
    },
    followerContainer: {
      alignItems: 'center',
    },
    followerContent: {
      alignItems: 'center',
    },
    follower: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    followerLabel: {
      fontSize: 14,
      color: theme === 'dark' ? '#ccc' : '#555',
    },
    followButton: {
      width: '100%',
      marginTop: 30,
      borderRadius: 20,
      backgroundColor: 'tomato',
      paddingVertical: 12,
      paddingHorizontal: 25,
      alignSelf: 'center',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 4,
    },
    followButtonText: {
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: 18,
      color: 'white',
    },
  });