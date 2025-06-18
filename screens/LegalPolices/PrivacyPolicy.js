/* eslint-disable no-trailing-spaces */
import React, { useEffect, useState } from 'react';
import { ScrollView, TextInput, StyleSheet, StatusBar, Appearance } from 'react-native';

const PrivacyPolicy = () => {
      const [theme, setTheme] = useState(Appearance.getColorScheme());
  
      useEffect(() => {
        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
          setTheme(colorScheme);
        });
  
        return () => {
          subscription.remove();
        };
      }, []);
  const [policyContent, setPolicyContent] = React.useState(
    // Your Privacy Policy content goes here
    `
    **Privacy Policy for Hadithi**

    Your privacy is important to us. It is Hadithi's policy to respect your privacy regarding any information we may collect from you through our app.

    **Information We Collect**

    We may collect personal information that you provide directly to us, including but not limited to your name, photos, username, and email address. This information is collected for the purpose of enhancing your user experience and improving our app's features.

    **How We Use Your Information**

    The information we collect may be used for various purposes, including:

    - Providing, maintaining, and improving our app
    - Personalizing your experience
    - Sending periodic emails related to our services
    - Responding to your inquiries and providing customer support

    **Security**

    We take reasonable measures to protect the personal information we collect from unauthorized access, disclosure, alteration, and destruction.

    **Sharing Your Information**

    We may share your personal information with third-party service providers to facilitate our app's features and services. However, we will not sell, trade, or otherwise transfer your personal information to outside parties without your consent.

    **Your Choices**

    You may choose to restrict the collection or use of your personal information by adjusting the settings within our app. Please note that certain features may be limited if you choose not to provide certain information.

    **Changes to This Privacy Policy**

    We may update our Privacy Policy from time to time. You are advised to review this page periodically for any changes. We will notify you of any changes by posting the new Privacy Policy on this page.

    **Contact Us**

    If you have any questions or concerns about our Privacy Policy, please contact us at [hadithisocial@gmail.com].

    This Privacy Policy was last updated on [June 17/2025].
    `
  );

  return (
    <ScrollView style={styles(theme).container}>
      {/* <Text style={styles.title}>Privacy Policy</Text> */}
               <StatusBar backgroundColor="orangered" />
      
      <TextInput
        style={styles(theme).policyContent}
        multiline={true}
        value={policyContent}
        onChangeText={(text) => setPolicyContent(text)}
      />
     </ScrollView>
  );
};

const styles = theme => StyleSheet.create({
  container: {
    flex:1,
    padding: 20,
    backgroundColor: theme === 'dark' ? '#121212' : '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: theme === 'dark' ? '#fff' : '#121212',
  },
  policyContent: {
    borderWidth: 1,
    borderColor: theme === 'dark' ? '#fff' : '#121212',
    padding: 10,
    marginBottom: 20,
    color: theme === 'dark' ? '#fff' : '#121212',
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