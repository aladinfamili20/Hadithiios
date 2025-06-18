/* eslint-disable react-native/no-inline-styles */
import {
  ActivityIndicator,
  // Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView
} from 'react-native';
import React, {useEffect, useState} from 'react';
import DarkMode from '../Theme/DarkMode';
import {CommonActions, useNavigation, useRoute} from '@react-navigation/native';
import {auth} from '../../data/Firebase';
import UserCollectionFech from '../UserCollectionFech';
import {truncateString} from '../TextShortner';
 import Image from 'react-native-image-progress';

const ImageInfo = () => {
  const theme = DarkMode();
  const route = useRoute();
  const {id} = route.params;
  const user = auth().currentUser;
  const uid = user?.uid;
  const navigation = useNavigation();

  const {document, loading} = UserCollectionFech('posts', id);
  const [postDetails, setPostDetails] = useState(null);
  const [captionbModal, setCaptionModal] = useState(null);
   useEffect(() => {
    setPostDetails(document);
  }, [document]);
  const openCaption = () => {
    setCaptionModal(true);
  };

  const closeCaption = () => {
    setCaptionModal(false);
  };

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
      {loading ? (
        <View style={[styles(theme).container, styles(theme).horizontal]}>
          <ActivityIndicator size="large" color="tomato" />
        </View>
      ) : (
        postDetails && (
          <>
            <View style={styles(theme).postContainer}>
              {/* Tagged Users */}
              <View style={styles(theme).displayNameTagging}>
                {postDetails?.taggedUsers?.length > 0 && (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {postDetails.taggedUsers.map((tag, index) => (
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

                {postDetails?.caption?.trim().length > 0 && (
                  <TouchableOpacity onPress={openCaption}>
                    <Text style={styles(theme).captionText}>
                      {truncateString(postDetails?.caption, 200)}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Caption Modal */}
              <Modal
                animationType="slide"
                transparent={true}
                visible={captionbModal}
                onRequestClose={closeCaption}>
                <View style={styles(theme).CaptionModalContainer}>
                  <View style={styles(theme).CaptionModalContent}>
                    <Text
                      style={{
                        color: theme === 'dark' ? '#fff' : '#121212',
                        marginBottom: 10,
                        fontWeight: 'bold',
                      }}>
                      Caption
                    </Text>
                    <ScrollView showsVerticalScrollIndicator={false}>
                      <Text
                        style={{
                          color: theme === 'dark' ? '#fff' : '#121212',
                          lineHeight: 20,
                        }}>
                        {postDetails?.caption}
                      </Text>
                    </ScrollView>
                    <View style={styles(theme).CaptionModalButtons}>
                      <TouchableOpacity
                        style={{
                          padding: 7,
                          borderRadius: 7,
                          width: 100,
                          borderWidth: 1,
                          borderColor: '#5b5b5b',
                        }}
                        onPress={closeCaption}>
                        <Text
                          style={{
                            color: theme === 'dark' ? '#fff' : '#121212',
                            textAlign: 'center',
                          }}>
                          Close
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>

              {postDetails.image && (
                <View style={styles(theme).imageContainer}>
                   <Image
                  source={{uri: postDetails?.image}}
                  style={{
                    width: '100%',
                    borderRadius: 20,
                    aspectRatio: 4 / 5,
                    // overflow: 'hidden',
                  }}
                  alt="postimage"
 
                />
                 </View>
              )}
            </View>
          </>
        )
      )}
    </View>
  );
};

export default ImageInfo;

const styles = theme =>
  StyleSheet.create({
    CommentSectionContainer: {
      flex: 1,
      justifyContent: 'space-between',
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    },
    postContainer: {
      margin: 10,
    },

    profileDetails: {
      marginLeft: 10,
    },
    caption: {
      // marginTop: 10,
      // marginBottom: 10,
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    taggedUsers: {
      color: theme === 'dark' ? '#fff' : '#0000FF',
      lineHeight: 20,
      // color: '#0000FF',
      fontWeight: '500',
      // backgroundColor: '#0000FF',
    },
    captionText: {
      marginBottom: 10,
      // marginTop:5,
      color: theme === 'dark' ? '#fff' : '#121212',
    },

    // image: {
    //   width: '100%',
    //   height: 300,
    //   objectFit: 'contain',
    // },
 imageContainer: {

  borderRadius: 20,
  overflow: 'hidden',
},
image: {
  width: '100%',
  height: 300,
  borderRadius: 20, // for internal image
  objectFit: 'contain',

},

    horizontal: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: 10,
    },

    // Caption text modal
    CaptionModalContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 200,
    },
    CaptionModalContent: {
      width: 320,
      padding: 20,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
      borderRadius: 10,
      alignItems: 'center',
      elevation: 10,
      height: 'auto',
    },
    CommentModalContent: {
      width: 320,
      padding: 20,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
      borderRadius: 10,
      alignItems: 'center',
      elevation: 10,
      height: 400,
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
  });
