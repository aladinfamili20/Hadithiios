/* eslint-disable no-trailing-spaces */
/* eslint-disable react-native/no-inline-styles */
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import React, {useState} from 'react';
import ImagePicker from 'react-native-image-crop-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import DarkMode from '../../components/Theme/DarkMode';

const UploadImage = () => {
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation();
  const theme = DarkMode();

  const [selectedImage, setSelectedImage] = useState(null);

  // Pick an image for the post
  const pickImage = async () => {
    try {
      const result = await ImagePicker.openPicker({
        width: 300,
        height: 400,
        cropping: false,
      });
      setSelectedImage(result.path);
    } catch (error) {
      console.error('Error picking image:', error);
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
        {selectedImage ? (
          <Image
            source={{uri: selectedImage}}
            style={styles(theme).imagePreview}
          />
        ) : (
          <Text style={styles(theme).placeholderText}>No photo selected</Text>
        )}

        <TouchableOpacity onPress={pickImage} style={styles(theme).pickButton}>
          <Ionicons
            name="add"
            color={theme === 'light' ? '#fff' : '#121212'}
            size={28}
          />
        </TouchableOpacity>

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color="tomato"
            style={{marginTop: 16}}
          />
        ) : (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('PostCustomize', {image: selectedImage})
            }
            disabled={!selectedImage}
            style={[
              styles(theme).submitButton,
              {opacity: selectedImage ? 1 : 0.5},
            ]}>
            <Text style={styles(theme).submitButtonText}>Next</Text>
          </TouchableOpacity>
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
    imagePreview: {
      width: '100%',
      height: 400,
      borderRadius: 10,
      marginVertical: 16,
      // resizeMode: 'cover',
      resizeMode: 'contain',
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
    },
  });
export default UploadImage;