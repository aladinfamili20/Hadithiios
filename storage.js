import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_VERSION = '1.0.6';

export const safeInitializeStorage = async () => {
  try {
    const version = await AsyncStorage.getItem('@storage_version');

    if (version !== STORAGE_VERSION) {
      // Incompatible storage — clear and set new version
      await AsyncStorage.clear();
      await AsyncStorage.setItem('@storage_version', STORAGE_VERSION);
    } else {
      // Optional: validate that key data isn't corrupt
      const maybeCorruptData = await AsyncStorage.getItem('@user_data');
      if (maybeCorruptData) {
        try {
          JSON.parse(maybeCorruptData);
        } catch {
          console.log('Corrupt data detected — clearing...');
          await AsyncStorage.clear();
          await AsyncStorage.setItem('@storage_version', STORAGE_VERSION);
        }
      }
    }
  } catch (error) {
    console.log('Error initializing AsyncStorage:', error);
    await AsyncStorage.clear();
    await AsyncStorage.setItem('@storage_version', STORAGE_VERSION);
  }
};
