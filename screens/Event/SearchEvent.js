/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-shadow */
import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DarkMode from '../../components/Theme/DarkMode';
import { auth } from '../../data/Firebase';
import Divider from '../../components/Divider';

const SearchEvent = () => {
  const theme = DarkMode();
  const user = auth().currentUser;
  const uid = user?.uid;
  const [loading, setIsLoading] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [postData, setPostData] = useState([]);

  const navigation = useNavigation();


  // Fetch the user's profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (uid) {
        try {
          const profileSnapshot = await firestore()
            .collection('profileUpdate')
            .doc(uid)
            .get();

          if (profileSnapshot.exists) {
            setPostData(profileSnapshot.data());
          }
        } catch (error) {
          console.error('Error fetching profile data:', error);
        }
      }
    };

    fetchProfileData();
  }, [uid]);


  const handleSearch = async () => {
    try {
      setIsLoading(true);

      const results = [];
      const displayNameSnapshot = await firestore()
        .collection('events')
        .where('displayName', '>=', searchQuery)
        .where('displayName', '<=', searchQuery + '\uf8ff')
        .get();

      const lastNameSnapshot = await firestore()
        .collection('events')
        .where('lastName', '>=', searchQuery)
        .where('lastName', '<=', searchQuery + '\uf8ff')
        .get();

        const eventNameSnapshot = await firestore()
        .collection('events')
        .where('eventName', '>=', searchQuery)
        .where('eventName', '<=', searchQuery + '\uf8ff')
        .get();

      displayNameSnapshot.forEach(doc => {
        results.push({id: doc.id, ...doc.data()});
      });

      lastNameSnapshot.forEach(doc => {
        const user = {id: doc.id, ...doc.data()};
        if (!results.find(u => u.id === user.id)) {
          results.push(user);
        }
      });

      eventNameSnapshot.forEach(doc => {
        const user = {id: doc.id, ...doc.data()};
        if (!results.find(u => u.id === user.id)) {
          results.push(user);
        }
      });

      setSearchResults(results);
      setIsLoading(false);
    } catch (error) {
      console.error('Error searching users:', error);
      setIsLoading(false);
    }
  };


    const debounceRef = useRef(null);

    useEffect(() => {
      if (searchQuery.trim().length === 0) {
        setSearchResults([]);
        return;
      }

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        handleSearch();
      }, 400); // debounce time in ms
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

  const handleInterestedClick = async (eventId) => {
    if (!postData) {
      console.error('Profile data not available.');
      return;
    }

    const today = new Date();
    const date = today.toDateString();
    const time = today.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    try {
      const { displayName, lastName, profileImage } = postData;
      const postRef = firestore().collection('events').doc(eventId);
      await postRef.update({
        eventInterestedUsers: firestore.FieldValue.arrayUnion({
          date,
          time,
          displayName,
          profileImage,
          lastName,
          uid,
        }),
      });
      console.log('Marked as interested successfully.');
    } catch (error) {
      console.error('Error updating interested user:', error);
    }
  };

  return (
    <View style={styles(theme).searchContainer}>
      <View style={styles(theme).topHeader}>
        <View style={styles(theme).topHeaderIcons}>
          <TouchableOpacity onPress={() => navigation.navigate('event')}>
            <Ionicons
              name="chevron-back-outline"
              color={theme === 'dark' ? '#fff' : '#121212'}
              size={30}
              style={styles(theme).leftArrowIcon}
            />
          </TouchableOpacity>

          <View style={styles(theme).searchContentInfos}>
            <View style={styles(theme).searchContent}>
              <TextInput
                placeholder="Search in Events"
                value={searchQuery}
                onChangeText={text => setSearchQuery(text)}
                // onSubmitEditing={handleSearch}
                style={styles(theme).searchBar}
                placeholderTextColor="#888"
              />
              <TouchableOpacity onPress={handleSearch}>
                <Ionicons name="search-outline" color={theme === 'dark' ? '#fff' : '#121212'} size={30} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={[styles(theme).container1, styles(theme).horizontal]}>
          <ActivityIndicator size="large" color="tomato" />
        </View>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item, index) =>
            item.id ? item.id.toString() : index.toString()
          }
          style={styles(theme).eventFlatlist}
          renderItem={({item}) => (
            <TouchableOpacity
            key={item}
            onPress={() => navigation.navigate('eventdetails', { id: item.id })}
            style={styles(theme).eventCard}
          >
            <View style={styles(theme).eventDetails}>
              <Image source={{ uri: item.eventImage }} style={styles(theme).eventImage} />
              <View>
                <Text style={styles(theme).eventTitle}>{item.eventName}</Text>
                <Text style={styles(theme).eventDate}>
                  {item.eventDate} at {item.eventTime}
                </Text>
              </View>
            </View>
            <Text style={styles(theme).eventDescription}>{item.eventDescription}</Text>
            <Divider style={styles(theme).divider} />
            <View style={styles(theme).peopleJoined}>
              <View style={styles(theme).peopleContainer}>
                {item.eventInterestedUsers?.length > 0 ? (
                  <>
                    <View style={styles(theme).joinedImages}>
                      {item.eventInterestedUsers.slice(0, 3).map((user, index) => (
                        <Image
                          key={index}
                          source={{
                            uri: user.profileImage || 'https://via.placeholder.com/50',
                          }}
                          style={styles(theme).userImage}
                        />
                      ))}
                    </View>
                    {item.eventInterestedUsers.length > 3 && (
                      <Text style={styles(theme).moreJoined}>
                        +{item.eventInterestedUsers.length - 3}
                      </Text>
                    )}
                  </>
                ) : (
                  <Text>No one has joined yet.</Text>
                )}
                <Text style={{color: theme === 'dark' ? '#fff' : '#121212'}}>{item.eventInterestedUsers?.length || 0} Joined</Text>
              </View>
              <TouchableOpacity
                style={styles(theme).interestedButton}
                onPress={() => handleInterestedClick(item.id)}
              >
                <Ionicons name="star" size={15} color={'#ff6347'} />
                <Text style={styles(theme).interestedText}>Interested</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
          )}
        />
      )}

    </View>
  );
};

export default SearchEvent;

// Styles are unchanged
const styles = theme => StyleSheet.create({
  searchContainer: {
    flex: 1,
    backgroundColor: theme === 'dark' ? '#121212' : '#fff',
  },
  searchContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    margin: 10,
    height: 50,
    borderRadius: 30,
    padding: 5,
    alignItems: 'center',
    width: Dimensions.get('window').width * 0.85,
    borderWidth: 1,
    borderColor: theme === 'dark' ? '#fff' : '#121212',

  },
  searchContentInfos: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    color: theme === 'dark' ? '#fff' : '#121212',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
  searchInfo: {
    flexDirection: 'row',
    // margin: 10,
  },
  displayName: {
    marginLeft: 10,
    fontWeight: 'bold',
    fontSize: 20,
    color: theme === 'dark' ? '#fff' : '#121212',
  },
  username: {
    marginLeft: 10,
  },
  searchIcon: {},
  container1: {
    flex: 1,
    justifyContent: 'center',
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },

  topHeader: {
    backgroundColor: theme === 'dark' ? '#121212' : '#fff',
    height: 50,
  },

  topHeaderIcons: {
    // margin: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  imageContainer: {
    width: '30%', // Three images per row
    marginBottom: 10,
    marginLeft: 10,
    marginTop:40,
  },
  userPhotos: {
    width: '100%',
    height: 130,
    borderRadius: 20,
  },

  // Event card
  eventFlatlist:{
    marginTop:30,
  },
  eventCard: {
    margin: 10,
      padding: 15,
      backgroundColor: theme === 'dark' ? '#121212' : '#fff',
      borderRadius: 10,
      shadowColor: theme === 'dark' ? '#fff' : '#121212',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
  },
  eventDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  eventImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: theme === 'dark' ? '#fff' : '#121212',

  },
  eventDate: {
    fontSize: 14,
    color: theme === 'dark' ? '#bbb' : '#5b5b5b',
  },
  eventDescription: {
    fontSize: 14,
    color: theme === 'dark' ? '#fff' : '#121212',
    marginVertical: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  peopleJoined: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  peopleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  joinedImages: {
    flexDirection: 'row',
    marginRight: 10,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: -10, // Overlapping effect
    borderWidth: 2,
    borderColor: '#fff',
  },
  moreJoined: {
    fontSize: 14,
    color: theme === 'dark' ? '#fff' : '#5b5b5b',
    marginLeft: 5,
  },
  interestedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#ffefeb',
    borderRadius: 20,
    marginTop:5,
    marginLeft:5,
  },
  interestedText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#ff6347',
  },
  FlatList:{
    marginBottom:10,
  },
});