/* eslint-disable no-trailing-spaces */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DarkMode from '../components/Theme/DarkMode';

const SignUpScreen = () => {
  const theme = DarkMode();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [getError, setGetError] = useState();
  const navigation = useNavigation();

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      setGetError('Error, please fill out all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setGetError('Error, passwords do not match.');
      return;
    }

    try {
      setIsLoading(true);

      // Create user with email and password
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );
      const { uid } = userCredential.user;
      const today = new Date();
      const date = today.toDateString();
      const Hours = today.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const dateSignedUp = today.toLocaleDateString();

      // Save user to Firestore
      await firestore().collection('users').doc(uid).set({
        email: email,
        date: date,
        Hours: Hours,
        dateSignedUp: dateSignedUp,
        uid: uid,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      // Alert.alert('Success', 'User registered successfully!');
      navigation.navigate('profilesetup');
    } catch (error) {
      console.error(error);
      let message = 'Something went wrong!';
      if (error.code === 'auth/email-already-in-use') {
        setGetError((message = 'The email address is already in use.'));
        // message = 'The email address is already in use.';
      } else if (error.code === 'auth/invalid-email') {
        setGetError((message = 'The email address is invalid.'));
        // message = 'The email address is invalid.';
      } else if (error.code === 'auth/weak-password') {
        setGetError((message = 'The password is too weak.'));
        // message = 'The password is too weak.';
      }
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles(theme).container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View>
          <View>
            <Image
              source={require('../assets/Logo+name2.png')}
              style={styles(theme).logo}
            />
            <Text style={styles(theme).title}>Create your Account</Text>
          </View>
          <View style={styles(theme).inputField}>
            <TextInput
              style={styles(theme).email}
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              autoFocus={true}
              onChangeText={text => setEmail(text)}
              value={email}
              placeholderTextColor="#888"
            />

            <TextInput
              style={styles(theme).email}
              placeholder="Password"
              autoCapitalize="none"
              textContentType="password"
              secureTextEntry={!isPasswordVisible}
              onChangeText={text => setPassword(text)}
              placeholderTextColor="#888"
              value={password}
            />
            <View style={styles(theme).passwordContainer}>
              <TextInput
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholderTextColor="#888"
                secureTextEntry={!isPasswordVisible}
                style={styles(theme).password}
              />
              <TouchableOpacity
                onPress={togglePasswordVisibility}
                style={styles(theme).iconContainer}
              >
                <Ionicons
                  name={isPasswordVisible ? 'eye-off' : 'eye'}
                  size={24}
                  color="grey"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles(theme).button,
              isLoading && styles(theme).buttonDisabled,
            ]}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            <Text style={styles(theme).buttonText}>
              {isLoading ? 'Signing up...' : 'Sign up'}
            </Text>
          </TouchableOpacity>

          <Text style={styles(theme).getError}>{getError}</Text>

          <View style={styles(theme).initialization}>
            <Text style={styles(theme).quetion}>Already have an account? </Text>
            <TouchableOpacity
              style={styles(theme).link}
              onPress={() => navigation.navigate('login')}
            >
              <Text style={styles(theme).linkText}>Log In</Text>
            </TouchableOpacity>
          </View>

          {/* Terms of use and Privacy Police */}
          <View style={styles(theme).legalContainer}>
            <Text style={styles(theme).legalMessage}>
              By signing up, you agree to Hadithi
            </Text>
            <View style={styles(theme).legal}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Terms of Service')}
              >
                <Text style={styles(theme).legalText}>Terms of Service </Text>
              </TouchableOpacity>
              <Text style={styles(theme).and}>and</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Privacy Policy')}
              >
                <Text style={styles(theme).legalText}> Privacy Policy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      justifyContent: 'center',
      backgroundColor: theme === 'dark' ? '#000' : '#fff',
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme === 'dark' ? '#fff' : '#111',
      marginBottom: 30,
      // textAlign: 'center',
    },
    logo: {
      width: '80%',
      height: 100,
      resizeMode: 'contain',
      alignSelf: 'center',
      marginBottom: 30,
    },
    inputField: {
      marginBottom: 20,
    },
    email: {
      backgroundColor: theme === 'dark' ? '#1e1e1e' : '#f0f0f0',
      padding: 15,
      borderRadius: 10,
      fontSize: 16,
      color: theme === 'dark' ? '#fff' : '#000',
      marginBottom: 15,
    },
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme === 'dark' ? '#1e1e1e' : '#f0f0f0',
      borderRadius: 10,
    },
    password: {
      flex: 1,
      padding: 15,
      fontSize: 16,
      color: theme === 'dark' ? '#fff' : '#000',
    },
    iconContainer: {
      padding: 10,
    },
    errorMessage: {
      color: 'red',
      marginTop: 8,
      textAlign: 'center',
    },
    button: {
      backgroundColor: '#ff6347',
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 10,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
    link: {
      marginTop: 15,
      alignItems: 'center',
    },
    linkText: {
      color: '#ff6347',
      // fontSize: 16,
      marginBottom: 15,
      fontWeight: 'bold',
    },
    legalContainer: {
      marginTop: 30,
      alignItems: 'center',
    },
    legalMessage: {
      fontSize: 13,
      color: theme === 'dark' ? '#aaa' : '#555',
    },
    legal: {
      flexDirection: 'row',
      marginTop: 5,
    },
    legalText: {
      fontSize: 13,
      color: '#ff6347',
    },
    and: {
      fontSize: 13,
      color: theme === 'dark' ? '#aaa' : '#555',
      marginHorizontal: 5,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme === 'dark' ? '#000' : '#fff',
    },
    initialization: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
    },
    quetion: {
      color: theme === 'dark' ? '#aaa' : '#555',
    },
    getError: {
      textAlign: 'center',
    },
  });
export default SignUpScreen;
