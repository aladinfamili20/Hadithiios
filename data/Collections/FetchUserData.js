/* eslint-disable no-unused-vars */
import { StyleSheet} from 'react-native';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, firestore } from '../Firebase';
import { useAuth } from '../../auth/AuthContext';
const UserContext = createContext();

export const FetchUserData = ({children}) => {
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      const user = auth().currentUser;

      if (user) {
        const uid = user.uid;

        const unsubscribe = firestore()
          .collection('profileUpdate')
          .doc(uid)
          .onSnapshot(
            snapshot => {
              if (snapshot.exists) {
                setUserData(snapshot.data());
              } else {
                setUserData(null);
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
        setUserData(null);
        setIsLoading(false);
      }
    }, []);
    return (
        <UserContext.Provider value={{ userData, isLoading, error }}>
          {children}
        </UserContext.Provider>
      );
};

export const useUser = ()=> useContext(UserContext);
