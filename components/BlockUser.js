import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Alert } from 'react-native';

export const blockUser = async (blockedUid) => {
  const currentUserUid = auth().currentUser?.uid;
  if (!currentUserUid || currentUserUid === blockedUid) return;

  const blockRef = firestore()
    .collection('users')
    .doc(currentUserUid)
    .collection('blocked')
    .doc(blockedUid);

  const doc = await blockRef.get();
  if (doc.exists) {
    // Unblock user
    await blockRef.delete();
  } else {
    // Block user
    await blockRef.set({
      blockedUid,
      blockedAt: firestore.FieldValue.serverTimestamp(),
    });
    Alert.alert("Error blocking a user")
  }
};
