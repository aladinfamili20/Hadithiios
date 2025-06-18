import {Appearance} from 'react-native';
import  {useEffect, useState} from 'react';

const DarkMode = () => {
    const [theme, setTheme] = useState(Appearance.getColorScheme());

    useEffect(() => {
    const subscription = Appearance.addChangeListener(({colorScheme}) => {
      setTheme(colorScheme);
    });
    return () => {
      subscription.remove();
    };
  }, []);
  return theme;
};

export default DarkMode;