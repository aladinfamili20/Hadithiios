import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import DarkMode from '../../components/Theme/DarkMode';

const UploadPost = () => {
  const theme = DarkMode();
  const navigation = useNavigation();
  return (
    <View style={styles(theme).container}>
  <Text style={styles(theme).title}>Create a Post</Text>

  <View style={styles(theme).containerContent}>
    <TouchableOpacity
      onPress={() => navigation.navigate('uploadimage')}
      style={styles(theme).uploadImageTextCont}
    >
      <Text style={styles(theme).uploadImageTxt}>Upload Photo</Text>
    </TouchableOpacity>

    <TouchableOpacity
      onPress={() => navigation.navigate('uploadvideo')}
      style={styles(theme).uploadVideoTextCont}
    >
      <Text style={styles(theme).uploadVideoTxt}>Upload Video</Text>
    </TouchableOpacity>
  </View>

  <Text style={styles(theme).note}>
    Supported formats: JPG, PNG, MP4.
  </Text>
</View>

  );
};

export default UploadPost;

const styles = theme => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    justifyContent: 'center',
  },
  containerContent:{
    flexDirection: 'row',
    justifyContent: 'space-around',
     alignItems: 'center',
  },
  uploadImageTextCont:{
    backgroundColor: 'tomato',
    padding:10,
    borderRadius: 20,
  },
  uploadImageTxt: {
    // color: theme === 'dark' ? '#fff' : '#121212',
    color: '#fff',
    fontWeight: 'bold',
  },

  uploadVideoTextCont: {
    backgroundColor: 'tomato',
    padding:10,
    borderRadius: 20,
  },

  uploadVideoTxt:{
    // color: theme === 'dark' ? '#fff' : '#121212',
    color: '#fff',
    fontWeight: 'bold',
  },
title: {
  fontSize: 24,
  fontWeight: 'bold',
  textAlign: 'center',
  marginBottom: 30,
  color: theme === 'dark' ? '#fff' : '#121212',
},
note: {
  marginTop: 40,
  textAlign: 'center',
  fontSize: 12,
  color: theme === 'dark' ? '#aaa' : '#555',
},

});