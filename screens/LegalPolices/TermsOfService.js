/* eslint-disable react-native/no-inline-styles */
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import DarkMode from '../../components/Theme/DarkMode';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const TermsOfService = () => {
  const theme = DarkMode();
  const navigation = useNavigation();

  return (
    <View style={styles(theme).container}>
      <StatusBar backgroundColor="orangered" />

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
          <Text style={styles(theme).uploadTopText}>Terms of Service</Text>
        </View>
      </View>
      <ScrollView style={styles(theme).containerContent}>
        <Text style={styles(theme).termsh1}>Terms of Service for Hadithi</Text>
        <Text style={{ marginTop: 20, color: theme === 'dark' ? '#fff' : '#121212', }}>Effective Date: June 17/2025</Text>
        <Text style={styles(theme).termsh2}>1. Acceptance of Terms</Text>
        <Text style={styles(theme).termsh3}>
          By accessing or using the Hadithi app, you agree to be bound by these
          Terms of Service. If you do not agree with any part of these terms,
          you may not use our app.
        </Text>

        <Text style={styles(theme).termsh2}>2. User Accounts</Text>
        <Text style={styles(theme).termsh2}>a. Account Creation:</Text>
        <Text style={styles(theme).termsh3}>
          You must create an account to use certain features of the app. You
          agree to provide accurate and complete information during the
          registration process.
        </Text>

        <Text style={styles(theme).termsh2}>b. Account Security:</Text>
        <Text style={styles(theme).termsh3}>
          You are responsible for maintaining the security of your account and
          password. Notify us immediately of any unauthorized access or use of
          your account.
        </Text>

        <Text style={styles(theme).termsh2}>3. User Content</Text>
        <Text style={styles(theme).termsh2}>a. Ownership:</Text>
        <Text style={styles(theme).termsh3}>
          You retain ownership of the content you post on Hadithi. By uploading,
          submitting, or displaying content on the app, you grant us a
          worldwide, non-exclusive, royalty-free license to use, reproduce,
          modify, and distribute the content.
        </Text>

        <Text style={styles(theme).termsh2}>b. Prohibited Content:</Text>
        <Text style={styles(theme).termsh3}>
          You may not post content that is illegal, harmful, sexual,
          threatening, abusive, defamatory, or violates the rights of others.
        </Text>

        <Text style={styles(theme).termsh2}>4. App Usage Guidelines</Text>
        <Text style={styles(theme).termsh2}>a. Compliance:</Text>
        <Text style={styles(theme).termsh3}>
          You agree to comply with all applicable laws and regulations while
          using Hadithi.
        </Text>

        <Text style={styles(theme).termsh2}>b. Prohibited Conduct:</Text>
        <Text style={styles(theme).termsh3}>
          You may not engage in any conduct that disrupts or interferes with the
          functionality of the app.
        </Text>

        <Text style={styles(theme).termsh2}>5. Privacy</Text>
        <Text style={styles(theme).termsh2}>a. Data Collection:</Text>
        <Text style={styles(theme).termsh3}>
          Our Privacy Policy outlines the types of information we collect, how
          we use it, and how it is shared. By using Hadithi, you agree to our
          Privacy Policy.
        </Text>

        <Text style={styles(theme).termsh2}>6. Termination</Text>
        <Text style={styles(theme).termsh3}>
          We reserve the right to terminate or suspend your account and access
          to Hadithi, with or without cause, at any time and without notice.
        </Text>

        <Text style={styles(theme).termsh2}>
          7. Changes to the Terms of Service
        </Text>
        <Text style={styles(theme).termsh3}>
          We may update these Terms of Service from time to time. The most
          current version will be posted on this page. Your continued use of the
          app after any changes constitute your acceptance of the revised terms.
        </Text>

        <Text style={styles(theme).termsh2}>8. Disclaimer of Warranties</Text>
        <Text style={styles(theme).termsh3}>
          Hadithi is provided "as is" without any warranties, expressed or
          implied. We do not warrant that the app will be error-free or
          uninterrupted.
        </Text>

        <Text style={styles(theme).termsh2}>9. Limitation of Liability</Text>
        <Text style={styles(theme).termsh3}>
          In no event shall Hadithi or its affiliates be liable for any
          indirect, incidental, special, or consequential damages arising out of
          or in any way connected with the use of Hadithi.
        </Text>

        {/* <Text style={styles(theme).termsh2}>10. Governing Law</Text>
      <Text style={styles(theme).termsh3}>These Terms of Service shall be governed by and construed in accordance with the laws of [Your Jurisdiction].</Text> */}

        <Text style={styles(theme).termsh2}>10. Contact Us</Text>
        <Text style={styles(theme).termsh3}>
          If you have any questions or concerns about these Terms of Service,
          please contact us at email: hadithisocial@gmail.com phone: 3465044008
        </Text>
      </ScrollView>
    </View>
  );
};

export default TermsOfService;

const styles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    },
    topHeader: {
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
      height: 50,
      marginLeft: 20,
    },

    topHeaderIcons: {
      flexDirection: 'row',
      alignItems: 'center',
      color: theme === 'dark' ? '#121212' : '#fff',
    },
    uploadTopText: {
      color: theme === 'dark' ? '#fff' : '#121212',
      fontWeight: 'bold',
      textAlign: 'center',
      marginLeft: 50,
      fontSize: 18,
    },
    containerContent: {
      margin: 20,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    },
    termsh1: {
      fontWeight: 'bold',
      fontSize: 20,
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    termsh3: {
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    termsh2: {
      marginTop: 20,
      fontWeight: 'bold',
      color: theme === 'dark' ? '#fff' : '#121212',
    },
  });
