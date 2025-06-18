/* eslint-disable no-unused-vars */
import { StyleSheet} from 'react-native';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, firestore } from '../Firebase';
import { useAuth } from '../../auth/AuthContext';
const UserContext = createContext();

export const FetchCurrentUser = ({children}) => {
    const [currentUserData, setCurrentUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      const user = auth().currentUser;

      if (user) {
        const uid = user.uid;

        const unsubscribe = firestore()
          .collection('users')
          .doc(uid)
          .onSnapshot(
            snapshot => {
              if (snapshot.exists) {
                setCurrentUserData(snapshot.data());
              } else {
                setCurrentUserData(null);
              }
              setIsLoading(false);
            },
            err => {
              setError(err);
              setIsLoading(false);
            }
          );

        return () => unsubscribe();
      } else {
        setCurrentUserData(null);
        setIsLoading(false);
      }
    }, []);
    return (
        <UserContext.Provider value={{ currentUserData, isLoading, error }}>
          {children}
        </UserContext.Provider>
      );
};

export const useUser = ()=> useContext(UserContext);
