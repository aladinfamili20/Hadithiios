import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {useNavigation} from '@react-navigation/native';
import DarkMode from '../components/Theme/DarkMode';
import Ionicons from 'react-native-vector-icons/Ionicons';

const DeleteAccountScreen = () => {
  const theme = DarkMode();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [getError, setGetError] = useState('');
  const navigation = useNavigation();
  const reauthenticate = async (email, password) => {
    const user = auth().currentUser;
    const credential = auth.EmailAuthProvider.credential(email, password);
    return user.reauthenticateWithCredential(credential);
  };

const handleDeleteAccount = async () => {
  const user = auth().currentUser;
  if (!user) {
    setGetError('No user is currently signed in.');
    return;
  }

  try {
    await reauthenticate(email, password);

    // Delete documents from collections
    const deleteCollectionDocsByUID = async (collectionName) => {
      const snapshot = await firestore()
        .collection(collectionName)
        .where('uid', '==', user.uid)
        .get();

      const batch = firestore().batch();
      snapshot.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    };

    // Example deletion calls
    await firestore().collection('users').doc(user.uid).delete();
    await firestore().collection('feedback').doc(user.uid).delete();
    await firestore().collection('notifications').doc(user.uid).delete();
    await firestore().collection('profileUpdate').doc(user.uid).delete();
    await firestore().collection('reports').doc(user.uid).delete();
    await deleteCollectionDocsByUID('posts');
    await deleteCollectionDocsByUID('story');
    await deleteCollectionDocsByUID('videos');
    await deleteCollectionDocsByUID('events');

    // Finally delete the account
    await user.delete();
    setGetError('Your account has been successfully deleted.');
    navigation.navigate('login');
  } catch (error) {
    if (error.code === 'auth/wrong-password') {
      setGetError('Incorrect password. Please try again.');
    } else if (error.code === 'auth/user-mismatch') {
      setGetError('Email does not match current user.');
    } else if (error.code === 'auth/too-many-requests') {
      setGetError('Too many failed attempts. Please try again later.');
    } else if (error.code === 'auth/requires-recent-login') {
      setGetError('Please re-login before deleting your account.');
    } else {
      setGetError('Failed to delete your account. Please try again or contact support.');
    }
  }
};


  return (
    <View style={styles(theme).container}>
      <View style={styles(theme).topHeader}>
        <View style={styles(theme).topHeaderIcons}>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Ionicons
              name="chevron-back-outline"
              color={theme === 'dark' ? '#fff' : '#121212'}
              size={24}
              style={styles(theme).leftArrowIcon}
            />
          </TouchableOpacity>
          <Text style={styles(theme).uploadTopText}>Delete Account</Text>
        </View>
      </View>
      <Text style={styles(theme).warning}>This action is permanent.</Text>
        <Text style={styles(theme).warning2}>All your data will be removed, and cannot be recovered.</Text>

      <TextInput
        placeholder="Confirm Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={styles(theme).input}
        placeholderTextColor="#888"
      />
      <TextInput
        placeholder="Confirm Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles(theme).input}
        placeholderTextColor="#888"
      />
      <TouchableOpacity
        style={styles(theme).deleteButton}
        onPress={handleDeleteAccount}>
        <Text style={styles(theme).deleteButtonText}>Delete Account</Text>
      </TouchableOpacity>

      <Text style={styles(theme).getError}>{getError}</Text>
    </View>
  );
};

const styles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 10,
      backgroundColor: theme === 'dark' ? '#121212' : '#f9f9f9',
    },
    // topHeader: {
    //   paddingVertical: 16,
    //   borderBottomWidth: 1,
    //   borderColor: theme === 'dark' ? '#333' : '#ddd',
    //   marginBottom: 24,
    // },
    // topHeaderIcons: {
    //   flexDirection: 'row',
    //   alignItems: 'center',
    // },\
    topHeader: {
      // marginTop: Platform.OS === 'ios' ? -9 : 20,
      // backgroundColor: theme === 'dark' ? '#121212' : '#fff',
      height: 50,
      borderBottomWidth: 1,
      borderColor: theme === 'dark' ? '#333' : '#ddd',
      marginBottom: 24,
    },

    topHeaderIcons: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    leftArrowIcon: {
      marginRight: 12,
    },
    uploadTopText: {
      fontSize: 18,
      fontWeight: '600',
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    warning: {
      fontSize: 16,
      color: 'red',
      textAlign: 'center',
    },    
    warning2: {
      fontSize: 16,
      color: 'black',
      marginBottom: 20,
      textAlign: 'center',
    },
    input: {
      backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
      borderColor: theme === 'dark' ? '#444' : '#ccc',
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: theme === 'dark' ? '#eee' : '#000',
      marginBottom: 16,
    },
    deleteButton: {
      backgroundColor: 'red',
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 10,
    },
    deleteButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
    getError: {
      textAlign: 'center',
      justifyContent: 'center',
      color: theme === 'dark' ? '#ffffff' : '#000',
    },
  });

export default DeleteAccountScreen;