import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

const TaggedUsersList = ({ taggedUsers, setTaggedUsers, theme, styles }) => {
  if (!taggedUsers || taggedUsers.length === 0) return null;

  const handleRemove = (userId) => {
    setTaggedUsers(taggedUsers.filter((u) => u.id !== userId));
  };

  return (
    <View style={styles(theme).taggedUsersContainer}>
      {taggedUsers.map((user, index) => (
        <View key={index} style={styles(theme).taggedUser}>
          <View style={styles(theme).taggedDisplayInfo}>
            <Image
              source={
                user?.profileImage
                  ? { uri: user.profileImage }
                  : require('../assets/thumblogo.png')
              }
              style={styles(theme).TaggedProfileImage}
            />
            <Text style={styles(theme).taggedUserName}>
              {user.displayName} {user.lastName}
            </Text>
          </View>
          <TouchableOpacity onPress={() => handleRemove(user.id)}>
            <Text style={styles(theme).removeTagButton}>Remove</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

export default TaggedUsersList;
