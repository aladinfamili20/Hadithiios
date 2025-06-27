/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Appearance,
  ActivityIndicator,
  KeyboardAvoidingViewBase,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import DarkMode from '../components/Theme/DarkMode';

const LoginScreen = () => {
  const theme = DarkMode();
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loginError, setLoginError] = useState('');
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user) {
        navigation.replace('feed'); // Navigate to the Home screen directly
      }
      setIsInitializing(false);
    });

    return unsubscribe; // Cleanup listener on unmount
  }, [navigation]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    try {
      setIsLoading(true);
      const userCredential = await auth().signInWithEmailAndPassword(
        email,
        password,
      );
      console.log('User logged in:', userCredential.user);
      setLoginError('Logged in successfully!');
      // navigation.replace('feed');
    } catch (error) {
      console.error(error);
      setLoginError('Error logging in, incorrent email or password');
      // let message = 'Something went wrong!' + 'please check your email or password.';
      let message =
        'Something went wrong!' + 'please check your email or password.';
      if (error.code === 'auth/user-not-found') {
        message = 'No user found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'The email address is invalid.';
      }
      // Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff6347" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles(theme).container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles(theme).container}>
          <View>
            <Image
              source={require('../assets/Logo+name2.png')}
              style={styles(theme).logo}
            />
          </View>

          <Text style={styles(theme).title}>Login to your Account</Text>
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
              returnKeyType="next"
            />
            <View style={styles(theme).passwordContainer}>
              <TextInput
                style={styles(theme).password}
                placeholder="Password"
                autoCapitalize="none"
                textContentType="password"
                secureTextEntry={!isPasswordVisible}
                onChangeText={text => setPassword(text)}
                placeholderTextColor="#888"
                value={password}
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
            <Text style={styles(theme).errorMessage}>{loginError}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles(theme).button,
              isLoading && styles(theme).buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles(theme).buttonText}>
              {isLoading ? 'Logging In...' : 'Login'}
            </Text>
          </TouchableOpacity>

          <View style={styles(theme).initialization}>
            <Text style={styles(theme).quetion}>Already have an account? </Text>
            <TouchableOpacity
              style={styles(theme).link}
              onPress={() => navigation.navigate('signup')}
            >
              <Text style={styles(theme).linkText}>Sign up</Text>
            </TouchableOpacity>
          </View>

          {/* <View style={styles(theme).legalContainer}>
        <Text style={styles(theme).legalMessage}>
          By logging in, you agree to Hadithi
        </Text>
        <View style={styles(theme).legal}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Terms of Service')}>
            <Text style={styles(theme).legalText}>Terms of Service </Text>
          </TouchableOpacity>
          <Text style={styles(theme).and}>and</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Privacy Policy')}>
            <Text style={styles(theme).legalText}> Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </View> */}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 10,
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
  });

export default LoginScreen;
