// Import the necessary Firebase modules
import { firebase } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
 // No need for manual firebaseConfig; RNFirebase uses the native configuration files
// Place `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) in your project.


// Make sure you have these in your project
const firebaseConfig = {
//  apiKey: 'AIzaSyAVBOkXkqxnZq4fTXXv2oVfUdNoCaZy6H4',
//   authDomain: 'hadithisocial-c964d.firebaseapp.com',
//   projectId: 'hadithisocial-c964d',
//   storageBucket: 'hadithisocial-c964d.firebasestorage.app',
//   messagingSenderId: '894401546395',
//   appId: '1:894401546395:web:23a25a449e66335796de3e',
//   measurementId: 'G-SBYJNW7RH9',

  apiKey: "AIzaSyAhOTviHv2jMcucd2Qse8EckVZHG-ndFfw",
  authDomain: "hadithidev.firebaseapp.com",
  projectId: "hadithidev",
  storageBucket: "hadithidev.firebasestorage.app",
  messagingSenderId: "477493476864",
  appId: "1:477493476864:web:a5ebee6bb91d686ff7e2e5",
  measurementId: "G-XTHPWCGPZX"
};

// Initialize Firebase if not already initialized
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}



// Export the Firebase services for use in your app
export { auth, firestore, storage };
