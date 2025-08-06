/* eslint-disable no-undef */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { auth, firestore } from '../data/Firebase';
import DarkMode from '../components/Theme/DarkMode';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CommonActions, useNavigation } from '@react-navigation/native';

const ManageBlockedUsersScreen = () => {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const currentUser = auth().currentUser;
  const theme = DarkMode();
  useEffect(() => {
    if (currentUser?.uid) {
      fetchBlockedUsers();
    }
  }, []);

  const fetchBlockedUsers = async () => {
    try {
      setLoading(true);

      if (!currentUser) return;

      const snapshot = await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .collection('blockedUsers')
        .get();

      const usersData = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          uid: docSnap.id,
          displayName: data.displayName,
          lastName: data.lastName,
          profileimage: data.profileimage,
          blockedDate: data.blockedDate,
        };
      });

      setBlockedUsers(usersData);
    } catch (error) {
      console.error('Failed to fetch blocked users:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async uid => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .collection('blockedUsers')
        .doc(uid)
        .delete();

      Alert.alert('Unblocked', 'User has been unblocked.');
      setBlockedUsers(prev => prev.filter(user => user.uid !== uid));
    } catch (error) {
      console.error('Error unblocking user:', error);
      Alert.alert('Error', 'Could not unblock user.');
    }
  };

  const navigateToProfile = userId => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'UserProfileScreen',
        params: { uid: userId },
      }),
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles(theme).userItem}>
      <View style={styles(theme).profiInfo}>
        <TouchableOpacity onPress={() => navigateToProfile(item.uid)}>
          <Image
            source={{ uri: item.profileimage }}
            style={styles(theme).avatar}
          />
        </TouchableOpacity>
        <View>
          <TouchableOpacity
            onPress={() => navigateToProfile(item.uid)}
            style={styles(theme).displayName}
          >
            <Text style={styles(theme).username}>
              {item.displayName || 'Unknown User'} {item.lastName}
            </Text>
            <Text style={styles(theme).blockedDate}>{item.blockedDate}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => handleUnblock(item.uid)}
        style={styles(theme).unblockButton}
      >
        <Text style={styles(theme).unblockButtonText}>Unblock</Text>
      </TouchableOpacity>
    </View>
  );

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
          <Text style={styles(theme).uploadTopText}>Blocked Users</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="tomato" />
      ) : blockedUsers.length === 0 ? (
        <Text style={styles(theme).emptyText}>No users blocked.</Text>
      ) : (
        <FlatList
          data={blockedUsers}
          keyExtractor={item => item.uid}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

export default ManageBlockedUsersScreen;

const styles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    },
    topHeader: {
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
      height: 50,
    },
    profiInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    blockedDate: {
      fontSize: 12,
    },
    topHeaderIcons: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 10,
    },
    uploadTopText: {
      flex: 1,
      color: theme === 'dark' ? '#fff' : '#121212',
      fontWeight: 'bold',
      textAlign: 'center',
      fontSize: 18,
    },

    title: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 12,
    },
    userItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
      borderRadius: 12,
      padding: 10,
      justifyContent: 'space-between',
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      marginRight: 12,
    },
    username: {
      flex: 1,
      fontSize: 16,
    },
    unblockButton: {
      backgroundColor: 'tomato',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    unblockButtonText: {
      color: '#fff',
      fontWeight: '600',
    },
    emptyText: {
      textAlign: 'center',
      marginTop: 20,
      fontSize: 16,
      color: 'gray',
    },
  });
