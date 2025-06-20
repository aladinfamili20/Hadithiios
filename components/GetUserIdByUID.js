import { doc, getDoc } from "@react-native-firebase/firestore";
import { firestore } from "../data/Firebase";

export const getUserInfoByUid = async (uid) => {
  const docRef = doc(firestore, 'users', uid);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? snapshot.data() : {};
};
