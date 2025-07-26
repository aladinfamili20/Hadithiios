/* eslint-disable react-native/no-inline-styles */
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { auth, firestore } from '../../data/Firebase';
import DarkMode from '../../components/Theme/DarkMode';
import Ionicons from 'react-native-vector-icons/Ionicons';

const About = ({ AboutCloseModal }) => {
  const [updateData, setUpdateData] = useState([]);
  const [loading, setLoading] = useState(null);
  const [getUserDate, setGetUserDate] = useState([]);
  const theme = DarkMode();
  useEffect(() => {
    const fetchUserData = () => {
      const user = auth().currentUser;

      if (user) {
        // console.log('User is already logged in:', user.email);
        // console.log('User UID:', user.uid);

        const unsubscribe = firestore()
          .collection('profileUpdate')
          .doc(user.uid)
          .onSnapshot(
            doc => {
              if (doc.exists) {
                setUpdateData(doc.data());
                setLoading(false);
              } else {
                console.log('No user data found in Firestore.');
              }
            },
            error => {
              console.error('Error fetching user data in real-time:', error);
            },
          );
        return () => unsubscribe(); // Cleanup on unmount
      }
    };

    fetchUserData();
  }, []);

  // Get user signed up date.

  useEffect(() => {
    const getUserSignedUpData = () => {
      const user = auth().currentUser;

      if (user) {
        // console.log('User is already logged in:', user.email);
        // console.log('User UID:', user.uid);

        const unsubscribe = firestore()
          .collection('users')
          .doc(user.uid)
          .onSnapshot(
            doc => {
              if (doc.exists) {
                setGetUserDate(doc.data());
                setLoading(false);
              } else {
                console.log('No user data found in Firestore.');
              }
            },
            error => {
              console.error('Error fetching user data in real-time:', error);
            },
          );
        return () => unsubscribe(); // Cleanup on unmount
      }
    };

    getUserSignedUpData();
  }, []);

  return (
    <View style={styles(theme).container}>
      <View style={styles(theme).contents}>
 
        <TouchableOpacity onPress={AboutCloseModal}>
          <Text style={styles(theme).topLine} />
        </TouchableOpacity>
        {updateData && (
          <View style={{ flexDirection: 'row' }}>
            <Image
              source={updateData.profileImage ? {uri: updateData.profileImage}   : require('../../assets/thumblogo.png')}

              style={styles(theme).profImage}
            />
            <View>
              <Text style={styles(theme).displayName}>
                {updateData.displayName} {updateData.lastName}
              </Text>
              {getUserDate && (
                <Text style={styles(theme).dateJoined}>
                  User since: {getUserDate.dateSignedUp}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* <Text style={styles(theme).abouttexth1}>About</Text> */}
        <View style={styles(theme).aboutContentCont}>
          {/* <Text style={styles(theme).abouttexth2}>Thlorall</Text> */}
          <Image
            source={require('../../assets/Logo+name2.png')}
            style={styles(theme).logo}
          />

          {/* <Text style={styles(theme).abouttexth3}>From ClearDesign</Text> */}
          <View style={{ marginTop: 20 }}>
            <Text style={styles(theme).abouttexth3}>Version: 1.0.6</Text>
            {/* <Text style={styles(theme).abouttexth3}>12.8.23</Text> */}
          </View>
        </View>
      </View>
    </View>
  );
};

export default About;

const styles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'flex-end',
      margin: 0,
    },
    contents: {
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
      padding: 16,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      elevation: 10,
    },
    abouttexth1: {
      fontWeight: 'bold',
      fontSize: 20,
      textAlign: 'center',
    },
    topLine: {
      borderTopWidth: 5,
      width: 70,
      height:7,
      // borderColor: theme === 'dark' ? '#fff' : '#121212',
      alignSelf: 'center',
      borderRadius: 10,
      marginBottom: 10,
      backgroundColor: theme === 'dark' ? '#fff' : '#121212',
    },
    abouttexth2: {
      textAlign: 'center',
      fontSize: 30,
      fontWeight: 'bold',
      // color: '#5b5b5b',
      color: '#ff6347',
    },
    abouttexth3: {
      textAlign: 'center',
      fontWeight: 'normal',
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    profImage: {
      width: 70,
      height: 70,
      borderRadius: 70,
    },
    displayName: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme === 'dark' ? '#fff' : '#121212',
      marginLeft: 10,
    },
    dateJoined: {
      color: theme === 'dark' ? '#fff' : '#121212',
      marginLeft: 10,
    },
    logo: {
      width: '40%',
      height: 40,
      alignSelf: 'center',
    },
  });
