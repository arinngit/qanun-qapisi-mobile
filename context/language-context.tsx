import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Language, translations, Translations} from '@/i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'userLanguage';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
  const [language, setLanguageState] = useState<Language>('az'); // Default to Azerbaijani

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (storedLanguage === 'az' || storedLanguage === 'en') {
          setLanguageState(storedLanguage);
        }
      } catch {
        // Failed to load language preference
      }
    };
    loadLanguage();
  }, []);

  const setLanguage = useCallback(async (newLanguage: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
      setLanguageState(newLanguage);
    } catch {
      // Failed to save language preference
    }
  }, []);

  const t = translations[language];

  const value = useMemo(
    () => ({language, setLanguage, t}),
    [language, setLanguage, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
