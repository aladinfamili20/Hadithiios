const styles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === 'dark' ? '#121212' : '#ffffff',
      paddingHorizontal: 16,
      paddingTop: Platform.OS === 'ios' ? 60 : 40,
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      height: 50,
      marginBottom: 20,
    },

    texth1: {
      fontSize: 22,
      fontWeight: '700',
      color: theme === 'dark' ? '#fff' : '#121212',
      marginLeft: 12,
    },

    headerIcons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },

    NotificationContainer: {
      backgroundColor: theme === 'dark' ? '#1e1e1e' : '#f9f9f9',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      borderRadius: 12,
      marginVertical: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },

    image: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: '#ccc',
    },

    lickedPostImage: {
      width: 60,
      height: 60,
      borderRadius: 8,
      marginTop: 8,
      backgroundColor: '#e0e0e0',
    },

    displayName: {
      fontWeight: '600',
      fontSize: 16,
      color: theme === 'dark' ? '#ffffff' : '#121212',
    },

    alert: {
      fontSize: 13,
      marginTop: 2,
      color: theme === 'dark' ? '#cccccc' : '#555555',
    },

    followback: {
      backgroundColor: 'orangered',
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderRadius: 20,
      color: '#fff',
      fontWeight: '600',
      fontSize: 14,
      overflow: 'hidden',
    },

    noFollowing: {
      textAlign: 'center',
      fontSize: 16,
      color: '#888888',
      marginTop: 40,
    },

    lickedPostImg: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
  });