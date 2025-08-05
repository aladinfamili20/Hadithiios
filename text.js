import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const UploadPost = () => {
  const [caption, setCaption] = useState('');
  const [media, setMedia] = useState(null); // contains uri, type, etc.

  const handleMediaPick = (type) => {
    const options = {
      mediaType: type,
      quality: 1,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled media picker');
      } else if (response.errorCode) {
        Alert.alert('Error', response.errorMessage);
      } else {
        const selectedAsset = response.assets[0];
        setMedia(selectedAsset);
      }
    });
  };

  const handleCameraCapture = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
      cameraType: 'back',
    };

    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.errorCode) {
        Alert.alert('Error', response.errorMessage);
      } else {
        const capturedAsset = response.assets[0];
        setMedia(capturedAsset);
      }
    });
  };

  const handlePost = () => {
    // You can send `caption` and `media` to your backend here
    Alert.alert('Post Submitted', `Caption: ${caption}\nMedia: ${media?.uri || 'None'}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create Post</Text>

      <TextInput
        style={styles.input}
        placeholder="Write a caption..."
        value={caption}
        onChangeText={setCaption}
        multiline
      />

      {media && (
        <View style={styles.previewContainer}>
          {media.type?.startsWith('video') ? (
            <Text style={styles.previewText}>🎥 Video selected</Text>
          ) : (
            <Image source={{ uri: media.uri }} style={styles.previewImage} />
          )}
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={() => handleMediaPick('photo')}>
          <Text style={styles.buttonText}>📸 Upload Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => handleMediaPick('video')}>
          <Text style={styles.buttonText}>🎬 Upload Video</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleCameraCapture}>
        <Text style={styles.buttonText}>📷 Take Photo</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.postButton} onPress={handlePost}>
        <Text style={styles.postButtonText}>Post</Text>
      </TouchableOpacity>
    </View>
  );
};

export default UploadPost;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  previewContainer: {
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  previewText: {
    fontSize: 16,
    color: '#666',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  buttonText: {
    color: '#333',
  },
  postButton: {
    marginTop: 16,
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
