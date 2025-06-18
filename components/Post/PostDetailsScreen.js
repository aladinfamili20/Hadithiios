/* eslint-disable react-native/no-inline-styles */
import { Modal, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import DarkMode from '../Theme/DarkMode';
import {useNavigation} from '@react-navigation/native';
import {ScrollView} from 'react-native-gesture-handler';
import {truncateString} from '../TextShortner';
 import Image from 'react-native-image-progress';

const PostDetailsScreen = ({post}) => {
  const theme = DarkMode();
  const navigation = useNavigation();

  const [captionModal, setCaptionModal] = useState(false);

  const openCaption = () => setCaptionModal(true);
  const closeCaption = () => setCaptionModal(false);

  const navigateToProfile = userId => {
    navigation.navigate('UserProfileScreen', {uid: userId});
  };
  return (
    <View style={styles(theme).container}>
      <View style={styles(theme).displayNameTagging}>
  {post?.taggedUsers?.length > 0 && (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {post.taggedUsers.map((tag, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => navigateToProfile(tag.uid)}>
          <Text style={styles(theme).taggedUsers}>
            @{tag.displayName} {tag.lastName}{' '}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )}

  {post?.caption?.trim().length > 0 && (
    <TouchableOpacity onPress={openCaption}>
      <Text style={styles(theme).captionText}>
        {truncateString(post?.caption, 200)}
      </Text>
    </TouchableOpacity>
  )}
</View>


      <Modal
        animationType="slide"
        transparent={true}
        visible={captionModal}
        onRequestClose={closeCaption}>
        <View>
          <View style={styles(theme).CaptionModalContainer}>
            <View style={styles(theme).CaptionModalContent}>
              <Text style={styles(theme).accountReportText}>Caption</Text>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles(theme).caption}>{post?.caption}</Text>
              </ScrollView>
              <View style={styles(theme).CaptionModalButtons}>
                <TouchableOpacity onPress={closeCaption}>
                  <Text style={styles(theme).close}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {post?.image && (
        <TouchableOpacity
          onPress={() => navigation.navigate('postDetail', {id: post.id})}
          style={styles(theme).imageContainer}
          >
          <Image source={{uri: post?.image}}
          // style={styles(theme).image}
          style={{
                    width: '100%',
                    borderRadius: 20,
                    aspectRatio: 4 / 5,
                    // overflow: 'hidden',
                  }}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default PostDetailsScreen;

const styles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    displayNameTagging: {},
    taggedUsers: {
      color: theme === 'dark' ? '#fff' : '#0000FF',
      fontWeight: '500',
    },
    captionText: {
      color: theme === 'dark' ? '#fff' : '#121212',
      //  marginTop: 5,
    },
    CaptionModalContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 200,
    },
    CaptionModalContent: {
      width: 320,
      padding: 20,
      borderRadius: 10,
      alignItems: 'center',
      elevation: 10,
      backgroundColor: theme === 'light' ? '#fff' : '#5b5b5b',
    },
    CaptionModalButtons: {
      flexDirection: 'row',
      marginTop: 20,
      justifyContent: 'space-between',
      gap: 10,
      width: '100%',
      textAlign: 'center',
    },
    caprionReportInput: {
      borderWidth: 1,
      borderColor: '#5b5b5b',
      padding: 10,
      width: '100%',
    },
    accountReportText: {
      fontWeight: 'bold',
      color: theme === 'dark' ? '#fff' : '#000',
    },
    close: {
      color: theme === 'dark' ? '#fff' : '#5b5b5b',
      textAlign: 'center',
      borderWidth: 1,
      borderColor: theme === 'dark' ? '#fff' : '#5b5b5b',
      padding: 6,
      borderRadius: 10,
    },
    image: {
      borderRadius: 20,
      aspectRatio: 4 / 5,
      width: '100%',
      marginTop: 10,
    },
      imageContainer: {
    borderRadius: 20,
    overflow: 'hidden', // critical!
    marginTop:10
  },
  });