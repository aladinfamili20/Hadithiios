import { Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { auth, firestore } from '../data/Firebase';
import { useRoute } from '@react-navigation/native';
import FecthUserProfile from './FecthUserProfile';
import FetchFriendsCollection from './FetchFriendsCollection';
import { useUser } from '../data/Collections/FetchUserData';

export const useHandleFollow = () => {
  const user = auth().currentUser;
  const route = useRoute();
  const { uid } = route.params;
  const { userData } = useUser();

  const { userprofile } = FecthUserProfile('profileUpdate', uid);
  const { friends } = FetchFriendsCollection('users', uid);
  const [isFollowing, setIsFollowing] = useState(false);

  const [publicProfile, setPublicProfile] = useState(null);

  useEffect(() => {
    setPublicProfile(userprofile);
  }, [userprofile]);

  const toggleFollow = async () => {
    const currentUserId = user?.uid;
    const targetUserId = publicProfile?.uid;

    if (!currentUserId || !targetUserId) return;

    const currentUserRef = firestore().collection('users').doc(currentUserId);
    const targetUserRef = firestore().collection('users').doc(targetUserId);

    try {
      if (isFollowing) {
        await currentUserRef.update({
          following: firestore.FieldValue.arrayRemove(targetUserId),
        });
        await targetUserRef.update({
          followers: firestore.FieldValue.arrayRemove({
            uid: currentUserId,
            displayName: userData?.displayName,
            profileImage: userData?.profileImage,
          }),
        });
        setIsFollowing(false);
      } else {
        await currentUserRef.update({
          following: firestore.FieldValue.arrayUnion(targetUserId),
        });
        await targetUserRef.update({
          followers: firestore.FieldValue.arrayUnion({
            uid: currentUserId,
            displayName: userData?.displayName,
            profileImage: userData?.profileImage,
          }),
        });
        setIsFollowing(true);
      }

      await firestore().collection('notifications').add({
        recipientId: targetUserId,
        type: 'new_follower',
        followerId: currentUserId,
        followerName: `${userData.displayName} ${userData.lastName}`,
        followerImage: userData.profileImage,
        timestamp: firestore.Timestamp.now(),
        read: false,
      });

      Alert.alert(isFollowing ? 'Unfollowed' : 'Followed');
    } catch (error) {
      console.error('Error updating follow state:', error);
    }
  };

  return { isFollowing, toggleFollow };
};