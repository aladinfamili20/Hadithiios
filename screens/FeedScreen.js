/* eslint-disable no-fallthrough */
import React, {useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import HomeScreen from './HomeScreen';
import ProfileScreen from './ProfileScreen';
import DarkMode from '../components/Theme/DarkMode';
import VideoScreen from './Video/VideoScreen';
import SearchScreen from './SearchScreen';
import UploadPost from './Post/UploadPost';
 
const Tab = createBottomTabNavigator();

const FeedScreen = () => {
  const theme = DarkMode();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth().currentUser;

    if (user) {
      const unsubscribe = firestore()
        .collection('profileUpdate')
        .doc(user.uid)
        .onSnapshot(
          doc => {
            if (doc.exists) {
              setProfileData(doc.data());
            } else {
              console.warn('No user data found in Firestore.');
            }
            setLoading(false);
          },
          error => {
            console.error('Error fetching user data:', error);
            setLoading(false);
          },
        );

      return () => unsubscribe();
    }
  }, []);

  const renderTabBarIcon = (route, focused, color, profileData) => {
    let iconName;

    switch (route.name) {
      case 'Home':
        iconName = focused ? 'home' : 'home-outline';
        break;
      case 'Post':
        iconName = focused ? 'add-circle' : 'add-circle-outline';
        break;
      // case 'Event':
      //   iconName = focused ? 'calendar' : 'calendar-outline';
      //   break;
      case 'Search':
        iconName = focused ? 'search' : 'search-outline';
        break;
      case 'Video':
        iconName = focused ? 'play' : 'play-outline';
        break;
      case 'Profile':
        // return profileData?.profileImage ? (
        //   <Image source={{ uri: profileData.profileImage }} style={styles(theme).profileImage} />
        // ) : (
        iconName = focused ? 'person' : 'person-outline';

      // <Ionicons name={focused ? 'person' : 'person-outline'} size={30} color={color} />
      // );
      default:
        break;
    }

    return <Ionicons name={iconName} size={30} color={color} />;
  };

  return (

     <>


    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarActiveTintColor: '#FF4500',
        tabBarInactiveTintColor: theme === 'dark' ? '#fff' : '#000', // Adjust inactive tint based on theme
        tabBarStyle: styles(theme).tabBar,
        headerShown: false,
        headerTitleAlign: 'center',
        tabBarLabelStyle: styles(theme).tabBarLabel,
        tabBarIcon: ({focused, color}) =>
          renderTabBarIcon(route, focused, color, profileData),
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      {/* <Tab.Screen name="Event" component={Event} /> */}
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Post" component={UploadPost} />
      {/* <Tab.Screen name='Post' component={CameraScreen}/> */}

      <Tab.Screen name="Video" component={VideoScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>


     </>
  );
};

export default FeedScreen;

const styles = theme =>
  StyleSheet.create({
    tabBar: {
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
      height: 65,
    },
    tabBarLabel: {
      display: 'none',
      marginTop: 20,
    },
    profileImage: {
      width: 30,
      height: 30,
      borderRadius: 15,
      marginBottom: 10,
      marginTop: 20,
    },
  });