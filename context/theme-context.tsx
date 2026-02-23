import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useColorScheme} from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;

  background: string;
  backgroundSecondary: string;
  card: string;

  text: string;
  textSecondary: string;
  textTertiary: string;

  border: string;
  divider: string;

  success: string;
  error: string;
  warning: string;
  info: string;

  disabled: string;
  placeholder: string;

  premium: string;
  shadow: string;
}

const lightColors: ThemeColors = {
  primary: '#7313e8',
  primaryLight: '#8b3af5',
  primaryDark: '#5a0fb9',

  background: '#ffffff',
  backgroundSecondary: '#f5f5f5',
  card: '#ffffff',

  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',

  border: '#E5E7EB',
  divider: '#F3F4F6',

  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  disabled: '#D1D5DB',
  placeholder: '#9CA3AF',

  premium: '#F59E0B',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

const darkColors: ThemeColors = {
  primary: '#7313e8',
  primaryLight: '#8b3af5',
  primaryDark: '#5a0fb9',

  background: '#111827',
  backgroundSecondary: '#1F2937',
  card: '#1F2937',

  text: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textTertiary: '#9CA3AF',

  border: '#374151',
  divider: '#2D3748',

  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  disabled: '#4B5563',
  placeholder: '#6B7280',

  premium: '#F59E0B',
  shadow: 'rgba(0, 0, 0, 0.3)',
};

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'userTheme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'auto') {
          setThemeModeState(storedTheme);
        }
      } catch {
        // Failed to load theme preference
      }
    };
    loadTheme();
  }, []);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch {
      // Failed to save theme preference
    }
  }, []);

  const isDark = themeMode === 'dark' || (themeMode === 'auto' && systemColorScheme === 'dark');

  const colors = isDark ? darkColors : lightColors;

  const value = useMemo(
    () => ({themeMode, isDark, colors, setThemeMode}),
    [themeMode, isDark, colors, setThemeMode]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
