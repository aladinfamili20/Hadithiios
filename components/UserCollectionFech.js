/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { ToastAndroid } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const UserCollectionFech = (collectionName, documentID) => {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true); // Default loading to true
  const user = auth().currentUser; // Get the current user

  const getDocument = async () => {
    try {
      const docRef = firestore().collection(collectionName).doc(documentID);
      const docSnap = await docRef.get();

      if (docSnap.exists) {
        const obj = {
          id: documentID,
          user: user?.uid, // Optional chaining to avoid crashes if user is null
          ...docSnap.data(),
        };
        setDocument(obj);
      } else {
        console.log('Document not found')
      }
    } catch (error) {
      console.error('Error fetching document:', error);      
    } finally {
      setLoading(false); // Ensure loading is set to false after the attempt
    }
  };

  useEffect(() => {
    if (user) {
      getDocument();
    } else {
      console.warn('No user is signed in.');
      setLoading(false); // Stop loading if no user is signed in
    }
  }, [user]); // Re-run if the user changes

  return { document, loading };
};

export default UserCollectionFech;