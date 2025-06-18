/* eslint-disable no-trailing-spaces */
/* eslint-disable react-native/no-inline-styles */
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import React, {useState} from 'react';

import ImagePicker from 'react-native-image-crop-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import Video from 'react-native-video';
import {createThumbnail} from 'react-native-create-thumbnail';
import DarkMode from '../../components/Theme/DarkMode';

const UploadVideo = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const navigation = useNavigation();
  const theme = DarkMode();
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const timeLimit = 120; // 2 minutes

  const pickVideo = async () => {
    try {
      const result = await ImagePicker.openPicker({mediaType: 'video'});
      const getVideoPath = result.path;
      const fileSizeInMB = result.size / (1024 * 1024); // size is in bytes
      if (fileSizeInMB > 100) {
        Alert.alert('Error', 'Video file is too large. Max 100MB.');
        return;
      }

      // Generate thumbnail
      const {path} = await createThumbnail({url: getVideoPath});
      setThumbnail(path);
      setSelectedVideo(getVideoPath);
      setVideoDuration(0);
    } catch (error) {
      if (error.code === 'E_PICKER_CANCELLED') {
        console.log('User cancelled the picker');
      } else {
        console.error('Error picking video:', error);
        Alert.alert('Error', 'Failed to pick a video');
      }
    }
  };

  const onVideoLoad = data => {
    const duration = data.duration;
    if (duration > timeLimit) {
      Alert.alert('Error', 'Video is too long. Maximum duration is 2 minutes.');
      setSelectedVideo(null);
      setThumbnail(null); // <-- add this line
    } else {
      setVideoDuration(duration.toFixed(2));
    }
  };

  return (
    <View style={styles(theme).container}>
      <View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles(theme).chevronIcon}>
          <Ionicons
            name="chevron-back-outline"
            size={24}
            color={theme === 'dark' ? '#fff' : '#121212'}
          />
        </TouchableOpacity>
      </View>
      <View style={styles(theme).content}>
        {thumbnail ? (
          <>
            {/* <Image source={{uri: thumbnail}} style={styles(theme).thumbnail} /> */}
            <Video
              source={{uri: selectedVideo}}
              resizeMode="cover"
              paused={false}
              repeat={false}
              onLoad={onVideoLoad}
              style={styles(theme).video}
              controls={true}
            />
          </>
        ) : (
          <Text style={styles(theme).placeholderText}>No video selected</Text>
        )}

        <TouchableOpacity onPress={pickVideo} style={styles(theme).pickButton}>
          <Ionicons
            name="videocam"
            color={theme === 'light' ? '#fff' : '#121212'}
            size={28}
          />
        </TouchableOpacity>

        {selectedVideo && (
          <View>
            <TouchableOpacity
              onPress={() => {
                setSelectedVideo(null);
                setThumbnail(null);
                setVideoDuration(0);
              }}
              style={styles(theme).removeButton}>
              <Text style={styles(theme).removeButtonText}>Change Video</Text>
            </TouchableOpacity>

            <Text style={styles(theme).videoDuration}>
              Video Duration: {videoDuration} sec
            </Text>
          </View>
        )}

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color="tomato"
            style={{marginTop: 16}}
          />
        ) : (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('VideoCustomize', {video: selectedVideo})
            }
            disabled={!selectedVideo}
            style={[
              styles(theme).submitButton,
              {opacity: selectedVideo ? 1 : 0.5},
            ]}>
            <Text style={styles(theme).submitButtonText}>Next</Text>
          </TouchableOpacity>
        )}

        {isLoading && (
          <View style={{marginTop: 10}}>
            <Text style={{color: 'gray'}}>
              Uploading: {uploadProgress.toFixed(0)}%
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === 'light' ? '#fff' : '#121212',
      // padding: 10,
    },
    chevronIcon: {
      margin: 10,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      margin: 10,
    },
    placeholderText: {
      textAlign: 'center',
      fontSize: 16,
      marginBottom: 20,
      color: theme === 'light' ? '#888' : '#ccc',
    },
    pickButton: {
      backgroundColor: 'tomato',
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      marginVertical: 20,
    },
    video: {
      width: '100%',
      height: 200,
      borderRadius: 10,
      marginBottom: 12,
    },
    submitButton: {
      backgroundColor: 'tomato',
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: 12,
    },
    submitButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
    videoDuration: {
      textAlign: 'center',
      fontSize: 14,
      color: theme === 'light' ? '#333' : '#ccc',
      margin: 10,
    },
    thumbnail: {
      width: '100%',
      height: 200,
      borderRadius: 10,
      marginBottom: 12,
    },
    removeButton: {
      marginTop: 10,
      padding: 10,
      // backgroundColor: '#121212',
      borderRadius: 8,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme === 'dark' ? '#fff' : '#121212',
    },
    removeButtonText: {
      color: theme === 'light' ? '#121212' : '#ccc',
      fontWeight: '600',
    },
  });

export default UploadVideo;