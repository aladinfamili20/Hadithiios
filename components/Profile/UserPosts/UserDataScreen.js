import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import DarkMode from '../../Theme/DarkMode';
import YourVideos from '../../../screen/YourVideos';
import UserPhoto from '../../UserPhotos';

function UserPhotos() {
  return (
    <View style={styles.screen}>
      <UserPhoto />
    </View>
  );
}

function MyVideos() {
  return (
    <View style={styles.screen}>
      <YourVideos />
    </View>
  );
}

const UserDataScreens = () => {
  const [activeScreen, setActiveScreen] = useState('UserPhoto'); // State to track the active screen
  const theme = DarkMode();
  const renderScreen = () => {
    switch (activeScreen) {
      case 'Photo':
        return <UserPhotos />;
      case 'Video':
        return <MyVideos />;
      default:
        return null;
    }
  };

  return (
    <View style={styles(theme).NavContainer}>
      {/* Buttons for Navigation */}
      <View style={styles(theme).navBar}>
        <TouchableOpacity
          style={[
            styles(theme).navButton,
            activeScreen === 'Photo' && styles(theme).activeButton,
          ]}
          onPress={() => setActiveScreen('Photo')}>
          <Text
            style={[
              styles(theme).navButtonText,
              activeScreen === 'Photo' && styles(theme).activeButtonText,
            ]}>
            Photos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles(theme).navButton,
            activeScreen === 'Video' && styles(theme).activeButton,
          ]}
          onPress={() => setActiveScreen('Video')}>
          <Text
            style={[
              styles(theme).navButtonText,
              activeScreen === 'Video' && styles(theme).activeButtonText,
            ]}>
            Videos
          </Text>
        </TouchableOpacity>
      </View>

      {/* Render the Active Screen */}
      <View style={styles(theme).content}>{renderScreen()}</View>
    </View>
  );
};

export default UserDataScreens;

const styles = StyleSheet.create({});