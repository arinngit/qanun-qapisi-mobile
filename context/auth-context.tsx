import {authAPI, profileAPI, tokenManager} from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {createContext, useCallback, useContext, useEffect, useMemo, useState,} from "react";
import {translations} from "@/constants/translations";
import {getDeviceId} from "@/utils/deviceId";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  verified: boolean;
  profilePicture?: string;
  isPremium?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  refreshUser: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
                                                                        children,
                                                                      }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const clearAuthState = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove(["user", "accessToken", "refreshToken"]);
    } catch {
      // Storage clear failed
    }
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      const currentToken = await tokenManager.getToken();
      if (currentToken) {
        await authAPI.logout();
      }
    } catch {
      // Logout API error — proceed with local cleanup
    } finally {
      await clearAuthState();
    }
  }, [clearAuthState]);

  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const currentToken = await tokenManager.getToken();
      if (!currentToken) {
        await clearAuthState();
        return;
      }

      const profileData = await profileAPI.getProfile();

      const userData: User = {
        id: profileData.id,
        email: profileData.email,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        role: profileData.role,
        verified: profileData.verified,
        isPremium: profileData.isPremium,
        createdAt: profileData.createdAt,
        updatedAt: profileData.updatedAt,
      };

      await AsyncStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 401) {
        await clearAuthState();
      }
      throw error;
    }
  }, [clearAuthState]);

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser((prevUser) => {
      if (!prevUser) return null;

      const updatedUser = {...prevUser, ...userData};
      AsyncStorage.setItem("user", JSON.stringify(updatedUser)).catch(() => {
        // Failed to persist user update
      });
      return updatedUser;
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const deviceId = await getDeviceId();
      const response = await authAPI.login({email, password, deviceId});

      const profileData = await profileAPI.getProfile();

      const userData: User = {
        id: profileData.id,
        email: profileData.email,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        role: profileData.role,
        verified: profileData.verified,
        isPremium: profileData.isPremium,
        createdAt: profileData.createdAt,
        updatedAt: profileData.updatedAt,
      };

      await AsyncStorage.setItem("user", JSON.stringify(userData));

      setToken(response.accessToken);
      setUser(userData);
      setIsAuthenticated(true);

    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const errorMessage =
        axiosError.response?.data?.message || translations.loginFailed;
      throw new Error(errorMessage);
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedToken = await tokenManager.getToken();
        const storedUser = await AsyncStorage.getItem("user");

        if (storedToken) {
          setToken(storedToken);

          if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            setIsAuthenticated(true);
          }

          try {
            await refreshUser();
          } catch {
            // Background refresh failed — cached data still available
          }
        } else {
          await clearAuthState();
        }
      } catch {
        await clearAuthState();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [refreshUser, clearAuthState]);

  const value = useMemo<AuthContextType>(
    () => ({
      isAuthenticated,
      user,
      token,
      login,
      logout,
      loading,
      refreshUser,
      updateUser,
    }),
    [isAuthenticated, user, token, login, logout, loading, refreshUser, updateUser]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
