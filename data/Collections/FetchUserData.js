/* eslint-disable no-unused-vars */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, firestore } from '../Firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

export const FetchUserData = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const user = auth().currentUser;

        if (user) {
          const uid = user.uid;

          // Check cached data
          const cached = await AsyncStorage.getItem(`user_${uid}`);
          if (cached) {
            setUserData(JSON.parse(cached)); // Show cached immediately
          }

          // Fetch fresh data from Firestore
          const doc = await firestore().collection('profileUpdate').doc(uid).get();
          if (doc.exists) {
            const data = doc.data();
            setUserData(data);
            await AsyncStorage.setItem(`user_${uid}`, JSON.stringify(data));
          } else {
            setUserData(null);
          }
        } else {
          setUserData(null);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ userData, isLoading, error }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
