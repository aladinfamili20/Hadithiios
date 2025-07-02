// components/CommunityGuidelines.js
import React  from 'react';
import {
   ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DarkMode from '../../components/Theme/DarkMode';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CommunityGuidelines = () => {
  const theme = DarkMode()
  const navigation = useNavigation()
  return (
    <ScrollView style={styles(theme).container}>
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
          <Text style={styles(theme).uploadTopText}>Community Guidelines</Text>
        </View>
      </View>

      <Text style={styles(theme).heading}>Hadithi Community Guidelines</Text>

      <Text style={styles(theme).sectionHeading}>1. Be Respectful</Text>
      <Text style={styles(theme).text}>
        - Respect Others: Treat everyone with respect and kindness. Harassment,
        bullying, and hate speech are not tolerated.
        {'\n'}- Respect Privacy: Do not share personal information about
        yourself or others without consent. This includes phone numbers,
        addresses, and private conversations.
      </Text>

      <Text style={styles(theme).sectionHeading}>2. Be Inclusive</Text>
      <Text style={styles(theme).text}>
        - Embrace Diversity: Hadithi is a global community. Be mindful and
        respectful of different cultures, backgrounds, and perspectives.
        {'\n'}- No Discrimination: Discrimination based on race, ethnicity,
        gender, sexuality, religion, or any other characteristic is strictly
        prohibited.
      </Text>

      <Text style={styles(theme).sectionHeading}>3. Be Safe</Text>
      <Text style={styles(theme).text}>
        - No Harmful Behavior: Any form of violence, threat, or encouragement of
        self-harm or harm to others is not allowed.
        {'\n'}- Report Concerns: If you see something that violates these
        guidelines or makes you feel unsafe, report it to us immediately.
      </Text>

      <Text style={styles(theme).sectionHeading}>4. Be Authentic</Text>
      <Text style={styles(theme).text}>
        - Real Identities: Use your real identity and be genuine in your
        interactions. Impersonation and fake profiles are not permitted.
        {'\n'}- Original Content: Share content that you own or have the right
        to share. Plagiarism and unauthorized use of others’ content are not
        allowed.
      </Text>

      <Text style={styles(theme).sectionHeading}>5. Be Legal</Text>
      <Text style={styles(theme).text}>
        - Follow the Law: Do not engage in or promote illegal activities.
        {'\n'}- Respect Intellectual Property: Only share content that you have
        the right to share, and always credit creators where appropriate.
      </Text>

      <Text style={styles(theme).sectionHeading}>6. Keep It Clean</Text>
      <Text style={styles(theme).text}>
        - Appropriate Content: Avoid sharing explicit, violent, or otherwise
        inappropriate content. Keep the community friendly and suitable for all
        ages. Accont that has been reported for posting explicit contents, will
        be removed immediately.
        {'\n'}- No Spam: Refrain from spamming, including repetitive messages,
        excessive links, or advertisements.
      </Text>

      <Text style={styles(theme).sectionHeading}>7. Use Responsibly</Text>
      <Text style={styles(theme).text}>
        - Accurate Information: Share accurate information and avoid spreading
        misinformation or false news.
        {'\n'}- Constructive Feedback: When providing feedback, be constructive
        and courteous. Negative comments should be helpful and respectful.
      </Text>

      <Text style={styles(theme).sectionHeading}>8. Follow Platform Rules</Text>
      <Text style={styles(theme).text}>
        - Adhere to Terms: In addition to these guidelines, follow Hadithi’s
        Terms of Service and any other applicable policies.
      </Text>

      <Text style={styles(theme).sectionHeading}>Enforcement</Text>
      <Text style={styles(theme).text}>
        Violating these guidelines can result in content removal, account
        suspension, or permanent bans. Hadithi reserves the right to enforce
        these guidelines at its discretion and to update them as necessary.
      </Text>

      <Text style={styles(theme).sectionHeading}>Reporting</Text>
      <Text style={styles(theme).text}>
        If you encounter behavior that violates these guidelines, please report
        it through our in-app reporting feature or contact our support team at
        {/* <Text style={styles(theme).email}>support@Hadithi.com</Text>. */}
        <Text style={styles(theme).email}> hadithisocial@gmail.com</Text>.
      </Text>

      <Text style={styles(theme).footer}>
        Thank you for helping us build a positive community on Hadithi. Let’s
        work together to make this a safe and welcoming space for everyone!
      </Text>
    </ScrollView>
  );
};

const styles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    },
     topHeader: {
    backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    height: 50,
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
    heading: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 16,
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    sectionHeading: {
      fontSize: 20,
      fontWeight: 'bold',
      marginTop: 16,
      marginBottom: 8,
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    text: {
      fontSize: 16,
      lineHeight: 24,
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    email: {
      color: 'tomato',
    },
    footer: {
      marginTop: 24,
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 50,
      color: theme === 'dark' ? '#fff' : '#121212',
    },
  });

export default CommunityGuidelines;
