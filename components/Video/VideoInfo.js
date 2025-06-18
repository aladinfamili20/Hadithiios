/* eslint-disable react-native/no-inline-styles */
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
  } from 'react-native';
  import React, {useEffect, useRef, useState} from 'react';
  import DarkMode from '../Theme/DarkMode';
  import {CommonActions, useNavigation, useRoute} from '@react-navigation/native';
  import Video from 'react-native-video';
import { auth } from '../../data/Firebase';
import UserCollectionFech from '../UserCollectionFech';
import { truncateString } from '../TextShortner';

const VideoInfo = () => {
    const theme = DarkMode();
    const route = useRoute();
    const {id} = route.params;
    const user = auth().currentUser;
    const uid = user?.uid;
    const navigation = useNavigation();

    const {document, loading} = UserCollectionFech('videos', id);
    const [postDetails, setPostDetails] = useState(null);
    const [captionbModal, setCaptionModal] = useState(null);
    useEffect(() => {
        setPostDetails(document);
      }, [document]);

    const [isPaused, setIsPaused] = useState(true);
      const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
      const aspectRatio = videoDimensions.width && videoDimensions.height
      ? videoDimensions.width / videoDimensions.height
      : 1; // fallback
      const togglePlayPause = () => {
        setIsPaused(prev => !prev);
      };
      const onVideoEnd = () => {
        videoRef.current?.seek(0); // Seek to the beginning
        setIsPaused(true); // Show play button again
      };
      const onLoad = (data) => {
        const { width, height } = data.naturalSize;
        if (width && height) {
          setVideoDimensions({ width, height });
        }
      };

      useEffect(() => {
        return () => {
          setIsPaused(true); // Pause video when screen unmounts
        };
      }, []);

      const videoRef = useRef(null);
      if (typeof postDetails?.video !== 'string' || !Video) {
        return null;
      }


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
              <Text>
                {postDetails?.taggedUsers?.length > 0 ? (
                  postDetails.taggedUsers.map((tag, index) => (
                    <View key={index}>
                      <TouchableOpacity
                        onPress={() => navigateToProfile(tag.uid)}>
                        <Text style={styles(theme).taggedUsers}>
                          @{tag.displayName} {tag.lastName}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <></>
                )}
              </Text>

              {/* Caption */}
              <TouchableOpacity onPress={openCaption}>
                <Text style={styles(theme).captionText}>
                  {truncateString(postDetails.caption, 200)}
                </Text>
              </TouchableOpacity>
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

            {postDetails.video && (
               <View
                 style={[
                   styles(theme).videoContainer,
                   {
                     aspectRatio,
                     maxHeight: 500, // LIMIT HEIGHT to avoid super tall videos
                     alignSelf: 'center',
                    },
                 ]}>
                 <TouchableOpacity onPress={togglePlayPause} activeOpacity={0.9}>
                   <Video
                     ref={videoRef}
                     source={{ uri: postDetails.video }}
                     onError={(e) => console.error('Video error:', e)}
                     onLoad={onLoad}
                     resizeMode="contain"
                     paused={isPaused}
                     repeat={true}
                     style={{ width: '100%', height: '100%' }}
                     onEnd={onVideoEnd}
                   />
                 </TouchableOpacity>

                 {/* {isPaused && (
                   <TouchableOpacity
                     onPress={togglePlayPause}
                     style={styles(theme).playButtonOverlay}>
                     <Ionicons name="play-circle" size={60} color="#fff" />
                   </TouchableOpacity>
                 )} */}
               </View>
            )}
          </View>
        </>
      )
    )}
  </View>
  );
};

export default VideoInfo;

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

      image: {
        width: '100%',
        height: 300,
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

      videoContainer: {
        width: '100%',
         overflow: 'hidden',
        backgroundColor: '#000',
      },
      video: {
        width: '100%',
        height: '100%',
      },
    playButtonOverlay: {
      position: 'absolute',
      top: '45%',
      left: '45%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderRadius: 30,
    },
    });