/* eslint-disable react-native/no-inline-styles */
import { ActivityIndicator, Alert, Platform, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from './auth/LoginScreen';
import SignUpScreen from './auth/SignUpScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import FeedScreen from './screens/FeedScreen';
import ProfileSetup from './screens/ProfileSetup';
import { FetchUserData } from './data/Collections/FetchUserData';
import UserProfileScreen from './screens/UserProfileScreen';
import EventDetails from './screens/Event/EventDetails';
import Event from './screens/Event/Event';
import SearchEvent from './screens/Event/SearchEvent';
import YourEvents from './screens/Event/YourEvents';
import AddEvent from './screens/Event/AddEvent';
import PostDetails from './screens/Post/PostDetails';
import UploadPost from './screens/Post/UploadPost';
import UserPhotos from './components/UserPhotos';
import PostHandler from './components/PostHandler';
import PostCustomize from './screens/Post/PostCustomize';
import VideoCustomize from './screens/Video/VideoCustomize';
import UploadVideo from './screens/Video/UploadVideo';
import VideoDetails from './screens/Video/VideoDetails';
import PrivacyPolicy from './screens/LegalPolices/PrivacyPolicy';
import CommunityGuidelines from './screens/LegalPolices/CommunityGuidelines';
import TermsOfService from './screens/LegalPolices/TermsOfService';
import Help from './screens/InfoSupport/Help';
import About from './screens/InfoSupport/About';
import Notifications from './screens/Notifications';
import ProfileScreen from './screens/ProfileScreen';
import Settings from './screens/Settings';
import LickedPhotos from './screens/LickedPhotos';
import LickedVideos from './screens/LickedVideos';
import SavedPhotos from './screens/SavedPhotos';
import SavedVideos from './screens/SaveVideos';
import DeleteAccountScreen from './screens/DeleteAccountScreen';
import SearchScreen from './screens/SearchScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import UploadImage from './screens/Post/UploadImage';
import mobileAds from 'react-native-google-mobile-ads';
import EditPhoto from './screens/EditPhoto';
import EditVideos from './screens/EditVideos';
import ManageBlockedUsersScreen from './screens/ManageBlockedUsersScreen';
 import FollowersScreen from './screens/FollowersScreen';
import FollowingScreen from './screens/FollowingScreen';
import { safeInitializeStorage } from './storage';
 import NetInfo from '@react-native-community/netinfo';

const Stack = createNativeStackNavigator();

const App = () => {
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    const init = async () => {
      await safeInitializeStorage();
      setIsReady(true);
    };
    init();
  }, []); 


  // Initialize Google AdMob
useEffect(() => {
  mobileAds()
    .initialize()
    .then(adapterStatuses => {
      console.log('AdMob initialized');
    });
}, []);


// Checking user's internert connection
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (!state.isConnected) {
        Alert.alert(
          'No Internet Connection',
          'You are not connected to the internet. Please check your connection and try again.'
        );
      }
    });
  
    return () => unsubscribe();
  }, []);





  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }


  return (
   <GestureHandlerRootView>
    <SafeAreaProvider>
   <FetchUserData>     
    <SafeAreaView/>
    <NavigationContainer>
    <Stack.Navigator initialRouteName='login'>
      {/* Authentification */}
      <Stack.Screen name='login' component={LoginScreen} options={{headerShown: false}}/>
      <Stack.Screen name='signup' component={SignUpScreen} options={{headerShown: false}}/>

      {/* Profile */}
      <Stack.Screen name='profile' component={ProfileScreen} options={{headerShown: false}}/>
      <Stack.Screen name='profilesetup' component={ProfileSetup} options={{headerShown: false}}/>      
      <Stack.Screen name='Settings' component={Settings} options={{headerShown: false}}/>

      {/* Event functionality */}
      <Stack.Screen name='Upload event' component={AddEvent} options={{headerShown: false}}/>
      <Stack.Screen name='eventdetails' component={EventDetails} options={{headerShown: false}}/>
      <Stack.Screen name='event' component={Event} options={{headerShown: false}}/>
      <Stack.Screen name='Searchevents' component={SearchEvent} options={{headerShown: false}}/>
      <Stack.Screen name='Your events' component={YourEvents} options={{headerShown: false}}/>

      {/* Post functionality */}
      <Stack.Screen name='uploadposts' component={UploadPost} options={{headerShown: false}}/>
      <Stack.Screen name='userposts' component={UserPhotos} options={{headerShown: false}}/>
      <Stack.Screen name='posthandler' component={PostHandler} options={{headerShown: false}}/>
      <Stack.Screen name='postDetail' component={PostDetails} options={{headerShown: false}}/>
      <Stack.Screen name='PostCustomize' component={PostCustomize} options={{headerShown: false}}/>
      <Stack.Screen name='uploadimage' component={UploadImage} options={{headerShown: false}}/>
      <Stack.Screen name='editphoto' component={EditPhoto} options={{headerShown: false}}/>

      {/* Video functionality */}
      <Stack.Screen name='VideoCustomize' component={VideoCustomize} options={{headerShown: false}}/>
      <Stack.Screen name='uploadvideo' component={UploadVideo} options={{headerShown: false}}/>
      <Stack.Screen name='videodetails' component={VideoDetails} options={{headerShown: false}}/>
      <Stack.Screen name='editvideos' component={EditVideos} options={{headerShown: false}}/>

      {/* Legal polices */}
      <Stack.Screen name='Privacy Policy' component={PrivacyPolicy} options={{headerShown: false}}/>
      <Stack.Screen name='Community Guidelines' component={CommunityGuidelines} options={{headerShown: false}}/>
      <Stack.Screen name='Terms of Service' component={TermsOfService} options={{headerShown: false}}/>

      {/* Info and support */}
      <Stack.Screen name='Help' component={Help} options={{headerShown: false}}/>
      <Stack.Screen name='About' component={About} options={{headerShown: false}}/>

      {/* User posts interactions */}
      <Stack.Screen name='lickedposts' component={LickedPhotos} options={{headerShown: false}}/>
      <Stack.Screen name='lickedvideos' component={LickedVideos} options={{headerShown: false}}/>
      <Stack.Screen name='savedposts' component={SavedPhotos} options={{headerShown: false}}/>
      <Stack.Screen name='savedvideos' component={SavedVideos} options={{headerShown: false}}/>

      {/* Other */}
      <Stack.Screen name='feed' component={FeedScreen} options={{headerShown: false}}/>
      <Stack.Screen name='Notifications' component={Notifications} options={{headerShown: false}}/>
      <Stack.Screen name='DeleteAccount' component={DeleteAccountScreen} options={{headerShown: false}}/>
      <Stack.Screen name='UserProfileScreen' component={UserProfileScreen} options={{headerShown: false}}/>
      <Stack.Screen name='search' component={SearchScreen} options={{headerShown: false}}/>
      <Stack.Screen name='manageblockedusers' component={ManageBlockedUsersScreen} options={{headerShown: false}}/>
      <Stack.Screen name='FollowersScreen' component={FollowersScreen} options={{headerShown: false}}/>
      <Stack.Screen name='FollowingScreen' component={FollowingScreen} options={{headerShown: false}}/>


    </Stack.Navigator>
   </NavigationContainer>
   </FetchUserData>
   </SafeAreaProvider>
   </GestureHandlerRootView>
  )
}

export default App

const styles = StyleSheet.create({})