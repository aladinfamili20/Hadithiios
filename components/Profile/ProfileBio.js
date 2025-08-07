/* eslint-disable react-native/no-inline-styles */
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { truncateString } from '../TextShortner';
import { useUser } from '../../data/Collections/FetchUserData';
import DarkMode from '../Theme/DarkMode';

const ProfileBio = () => {
  const {userData} = useUser();
  const theme = DarkMode();
    const [bioModal, setBioModal] = useState(false);


    const openBio = () => {
    setBioModal(true);
   };

  const closeBioModal = () => {
    setBioModal(false);
   };

  return (
    <View>
      <View style={styles(theme).bioContainer}>
        {userData && userData.bio && (
          <Text style={styles(theme).bio} onPress={openBio}>
            {truncateString(userData.bio, 150)}
          </Text>
        )}
      </View>
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={bioModal}
        onRequestClose={closeBioModal}>
        <View>
          {/* <Text>Report account</Text> */}

           {userData && userData.bio && (
            <View>

              <View style={styles(theme).modalContainer}>
            <View style={styles(theme).ReportModalContent}>
              <Text style={styles(theme).modalBioh1}>Bio</Text>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles(theme).modalBioText}>{userData.bio}</Text>
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
                      fontWeight: 'bold',
                      // whiteSpace: 'pre-wrap',
                    }}>
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
            </View>
           )}
        </View>
      </Modal>
    </View>
  );
};

export default ProfileBio;

const styles = theme =>
    StyleSheet.create({
      bioContainer: {
        fontSize: 19,
        fontWeight: 'normal',
        color: '#000',
        // margin:10
      },
      bio: {
        color: theme === 'dark' ? '#fff' : '#121212',
      },
      modalBioh1:{
        color: theme === 'dark' ? '#fff' : '#121212',
        fontWeight: 'bold',
        marginBottom: 10,
      },
      modalBioText:{
        color: theme === 'dark' ? '#fff' : '#121212',

      },
      modalContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 200,
        // backgroundColor : theme === 'dark' ? '#121212' : '#fff',
      },
      ReportModalContent: {
        width: 320,
        padding: 20,
        backgroundColor: theme === 'dark' ? '#121212' : '#fff',
        borderRadius: 10,
        alignItems: 'center',
        // borderWidth:1,
        elevation: 10,
        height: 350,
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
        borderColor: theme === 'dark' ? '#121212' : '#fff',
        padding: 10,
        width: '100%',
      },

      navBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        // backgroundColor: theme === 'dark' ? '#f5f5f5' : '#5f5f5f',
        paddingVertical: 10,
        borderBottomWidth: 1,
        marginBottom: 10,
        borderColor: theme === 'dark' ? '#f5f5f5' : '#f5f5f5',
      },
      navButton: {
        padding: 10,
      },
      navButtonText: {
        color: theme === 'dark' ? '#fff' : '#121212',
        fontSize: 16,
      },
      activeButton: {
        borderBottomWidth: 2,
        borderBottomColor: '#fff',
      },
      activeButtonText: {
        fontWeight: 'bold',
      },
      content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      screen: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
      },
    });