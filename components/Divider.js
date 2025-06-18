import { StyleSheet, View } from 'react-native';
import React from 'react';
import DarkMode from './Theme/DarkMode';

const Divider = () => {
  const theme = DarkMode();
  return (
    <View style={styles(theme).Divider} />
  );
};

export default Divider;

const styles = theme=> StyleSheet.create({
    Divider: {
        height : 1 ,
        backgroundColor: theme === 'dark' ? '#1c1c1c' : '#f5f5f5',
        width: '100%',
    },
});