/* eslint-disable react-hooks/rules-of-hooks */
// useUser.js
import { useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export const currentLoggedInUserData = () => {
  const [getCurrentLoggedIn, setGetCurrentLoggedIn] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const user = auth().currentUser;

  useEffect(() => {
    if (!user) return;

    const unsubscribe = firestore()
      .collection('users')
      .doc(user.uid)
      .onSnapshot((doc) => {
        if (doc.exists) {
          setGetCurrentLoggedIn({ uid: user.uid, ...doc.data() });
        }
        setIsLoading(false);
      });

    return () => unsubscribe();
  }, [user]);

  return { getCurrentLoggedIn, isLoading };
};
