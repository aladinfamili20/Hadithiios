import React, { createContext, useContext, useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';

 const UserContext = createContext();
export const AuthContext = ({children}) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  const onAuthStateChanged = (currentUser) => {
    setUser(currentUser);
  };

  const value  = {
    user,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};


export const useAuth = ()=>{
  return useContext(UserContext);
};
