/* eslint-disable no-trailing-spaces */
/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
import {
  Alert,
    Appearance,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
  } from "react-native";
  import React, { useEffect, useState } from "react";
  import Collapsible from "react-native-collapsible";
  import { useNavigation } from "@react-navigation/native";
   import {Timestamp  } from "firebase/firestore";
   import auth from '@react-native-firebase/auth';
   import firestore from '@react-native-firebase/firestore';

  const FAQScreen = ({ question, answer, theme }) => {
       
    const [collapsed, setCollasped] = useState(true);

    return (
      <View>
        <View style={styles(theme).faqItem}>
          <TouchableOpacity onPress={() => setCollasped(!collapsed)}>
            <Text style={styles(theme).question}>{question}</Text>
          </TouchableOpacity>
          <Collapsible collapsed={collapsed} theme={theme}>
            <Text style={styles(theme).answer}>{answer}</Text>
          </Collapsible>
        </View>
      </View>
    );
  };

  const Help = () => {
    const [theme, setTheme] = useState(Appearance.getColorScheme());
      
    useEffect(() => {
      const subscription = Appearance.addChangeListener(({ colorScheme }) => {
        setTheme(colorScheme);
      });

      return () => {
        subscription.remove();
      };
    }, []);

    const user = auth().currentUser;
    const uid = user?.uid;
    const navigation = useNavigation();
    const [feedback, setFeedback] = useState("");
    const [loading, setLoading] = useState(null);
     const [profileData, setProfileData] = useState(null);
     // Fetch the user's profile data
    useEffect(() => {
      const fetchProfileData = async () => {
        if (uid) {
          const profileSnapshot = await firestore()
            .collection('profileUpdate')
            .doc(uid)
            .get();

          if (profileSnapshot.exists) {
            setProfileData(profileSnapshot.data());
          }
        }
      };

      fetchProfileData();
    }, [uid]);

    const generateUniqueId = () => {
      return `id_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
    };

    const HandleFeedback = async () => {
      setLoading(true);


      try {
        const { displayName, profileImage, lastName } = profileData;
        const today = new Date();
        const date = today.toDateString();
        const Hours = today.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        const time = today.toLocaleDateString();
        const uniqueId = generateUniqueId();
        const postData = {
            uid: user.uid,
            feedback: feedback,
            uploadedDate: date,
            postTime: time,
            Hours: Hours,
            displayName,
            lastName,
            profileImage,
            createdAt: Timestamp.now(),
            feedbackId: uniqueId,
          };

        await firestore().collection('feedback').add(postData);

        setLoading(false);
        console.log("feedback added with ID: ", postData);
          navigation.navigate('profile');
      } catch (error) {
        setLoading(false);
        console.error("Error adding post:", error);
        Alert.alert("Error Uploading Post", "Please try again.");
      }
    };

    const faqs = [
      // {
      //   question: "How do I create an account?",
      //   answer:
      //     "To create an account, click on the Sign up button on the login screen and fill in the required details.",
      // },
      {
        question: "How do I recover my password?",
        // answer: 'To recover your password, click on the Forgot Password link on the login screen and follow the instructions.',
        answer:
          "For now, we haven't implament a password recovery, but soon we will.",
      },
      {
        question: "How can I edit my profile?",
        answer:
          "To 'Edit profile' on your profile screen, and fill out any inputs you want to update",
      },
      {
        question: "How do I adjust my privacy settings?",
        answer:
          "To adjust your privacy settings, go to Settings > Privacy and select your preferred options.",
      },
      {
        question: "How do I post content?",
        answer:
          "To post content, click on the 'Plus icon', you will have two options. Choose your option, and press the 'add icon' select your image/video, then press next. Write your caption or add a user, then press 'Post'",
      },
      // Add more FAQs as needed
    ];

    return (
      <ScrollView style={styles(theme).container}>
        <View style={styles(theme).helpConent}>
          <Text style={styles(theme).h1}>FAQs</Text>
          <Text style={styles(theme).h2}>Common Topics</Text>
        </View>
        {faqs.map((faq, index) => (
          <FAQScreen key={index} question={faq.question} theme={theme}  answer={faq.answer} />
        ))}
        <View>
          <Text style={styles(theme).h1}>Contact Support</Text>
          <Text style={styles(theme).h2}>Email: hadithisocial@gmail.com</Text>

          <Text style={styles(theme).h1}>Community Standards and legal policies.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Terms of Service")}
          >
            <Text style={[styles(theme).h2, styles(theme).terms]}>Terms of Service</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Privacy Policy")}>
            <Text style={[styles(theme).h2, styles(theme).terms]}>Privacy Policy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Community Guidelines")}
          >
            <Text style={[styles(theme).h2, styles(theme).terms]}>Community Guidelines</Text>
          </TouchableOpacity>
        </View>

        <View style={styles(theme).feedbackContainer}>
          <Text style={styles(theme).h1}>Feedback</Text>
          <Text style={styles(theme).h2}>
            Feedback on the app, report bugs, suggest features, or requests your data to be deleted.
          </Text>
          <TextInput
            placeholder="Type here"
            value={feedback}
            onChangeText={(text) => setFeedback(text)}
            editable
            numberOfLines={3}
            multiline
            style={styles(theme).feedbackInput}
            onSubmitEditing={HandleFeedback}
            placeholderTextColor={'#888'}
          />

          <TouchableOpacity onPress={HandleFeedback}>
            <Text style={styles(theme).sfButton}>Submit Feedback</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  export default Help;

  const styles = theme=> StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    },
    faqItem: {
      marginBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme === 'dark' ? '#fff' : '#121212',
      paddingBottom: 8,
    },
    question: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    answer: {
      marginTop: 8,
      fontSize: 14,
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    helpConent: {
      marginBottom: 10,
    },
    h1: {
      fontSize: 25,
      fontWeight: "bold",
      color: theme === 'dark' ? '#fff' : '#121212',
      marginTop: 7,
    },
    h2: {
      //  fontWeight: 'bold',
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    terms: {
      fontWeight: "bold",
      marginTop: 7,
      color: "blue",
    },
    feedbackInput: {
      borderWidth: 1,
      borderColor: theme === 'dark' ? '#fff' : '#121212',
      padding: 7,
      marginTop: 7,
      height: 50,
      color: theme === 'dark' ? '#fff' : '#121212',
    },
    feedbackContainer: {
      marginBottom: 75,
    },
    sfButton: {
      padding: 15,
      fontWeight: "bold",
      textAlign: "center",
      justifyContent: "center",
      color: theme === 'dark' ? '#121212' : '#fff',
      borderRadius: 10,
      backgroundColor: "#ff6347",
      marginTop: 10,
    },
  });
