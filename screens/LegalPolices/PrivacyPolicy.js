/* eslint-disable no-trailing-spaces */
import React  from 'react';
import { ScrollView,  StyleSheet, StatusBar,  View, TouchableOpacity } from 'react-native';
import DarkMode from '../../components/Theme/DarkMode';
import { Text } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PrivacyPolicy = () => {
  const theme = DarkMode();
  const navigation = useNavigation()
 
  return (
   <ScrollView style={styles(theme).container} showsVerticalScrollIndicator={false}>
      <StatusBar backgroundColor="orangered" barStyle="light-content" />
      <View style={styles(theme).topHeader}>
        <View style={styles(theme).topHeaderIcons}>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Ionicons
              name="chevron-back-outline"
              color={theme === 'dark' ? '#fff' : '#121212'}
              size={24}
              style={styles(theme).leftArrowIcon}
            />
          </TouchableOpacity>
          <Text style={styles(theme).uploadTopText}>Privacy Policy</Text>
        </View>
      </View>
      <View style={styles(theme).header}>
        <Text style={styles(theme).title}>Privacy Policy for Hadithi</Text>
      </View>

      <Text style={styles(theme).paragraph}>
        Your privacy is important to us. It is Hadithi's policy to respect your privacy regarding any information we may collect from you through our app.
      </Text>

      <Text style={styles(theme).sectionTitle}>Information We Collect</Text>
      <Text style={styles(theme).paragraph}>
        We may collect personal information that you provide directly to us, including but not limited to your name, photos, username, and email address. This information is collected for the purpose of enhancing your user experience and improving our app's features.
      </Text>

      <Text style={styles(theme).sectionTitle}>How We Use Your Information</Text>
      <Text style={styles(theme).paragraph}>
        The information we collect may be used for various purposes, including:
      </Text>
      <Text style={styles(theme).listItem}>• Providing, maintaining, and improving our app</Text>
      <Text style={styles(theme).listItem}>• Personalizing your experience</Text>
      <Text style={styles(theme).listItem}>• Sending periodic emails related to our services</Text>
      <Text style={styles(theme).listItem}>• Responding to your inquiries and providing customer support</Text>

      <Text style={styles(theme).sectionTitle}>Security</Text>
      <Text style={styles(theme).paragraph}>
        We take reasonable measures to protect the personal information we collect from unauthorized access, disclosure, alteration, and destruction.
      </Text>

      <Text style={styles(theme).sectionTitle}>Sharing Your Information</Text>
      <Text style={styles(theme).paragraph}>
        We may share your personal information with third-party service providers to facilitate our app's features and services. However, we will not sell, trade, or otherwise transfer your personal information to outside parties without your consent.
      </Text>

      <Text style={styles(theme).sectionTitle}>Your Choices</Text>
      <Text style={styles(theme).paragraph}>
        You may choose to restrict the collection or use of your personal information by adjusting the settings within our app. Please note that certain features may be limited if you choose not to provide certain information.
      </Text>

      <Text style={styles(theme).sectionTitle}>Changes to This Privacy Policy</Text>
      <Text style={styles(theme).paragraph}>
        We may update our Privacy Policy from time to time. You are advised to review this page periodically for any changes. We will notify you of any changes by posting the new Privacy Policy on this page.
      </Text>

      <Text style={styles(theme).sectionTitle}>Contact Us</Text>
      <Text style={styles(theme).paragraph}>
        If you have any questions or concerns about our Privacy Policy, please contact us at:
        {'\n'}<Text style={styles(theme).email}>hadithisocial@gmail.com</Text>
      </Text>

      <Text style={styles(theme).footer}>This Privacy Policy was last updated on June 17, 2025.</Text>
    </ScrollView>
  );
};

const styles = theme => StyleSheet.create({
  container: {
      flex: 1,
      padding: 20,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    },
     topHeader: {
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
      height: 50,
    },

    topHeaderIcons: {
       flexDirection: 'row',
      alignItems: 'center',
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    uploadTopText: {
      fontWeight: 'bold',
      textAlign: 'center',
      marginLeft: 50,
      fontSize: 18,
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    header: {
      marginBottom: 20,
    },
    title: {
      fontSize: 26,
      fontWeight: 'bold',
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      marginTop: 20,
      marginBottom: 8,
           color: theme === 'dark' ? '#fff' : '#121212',

    },
    paragraph: {
      fontSize: 16,
      lineHeight: 24,
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    listItem: {
      fontSize: 16,
      lineHeight: 24,
      paddingLeft: 10,
           color: theme === 'dark' ? '#fff' : '#121212',

    },
    email: {
      color: theme?.link || 'orangered',
      fontWeight: '500',
    },
    footer: {
      fontSize: 14,
      color: theme === 'dark' ? '#fff' : '#121212',

      marginTop: 30,
      textAlign: 'center',
      marginBottom: 50,
    },
});

export default PrivacyPolicy;










// import { StyleSheet, Text, View } from 'react-native'
// import React from 'react'

// const PrivacyPolicy = () => {
//   return (
//     <View>
//       <Text>PrivacyPolicy</Text>
//     </View>
//   )
// }

// export default PrivacyPolicy

// const styles = StyleSheet.create({})