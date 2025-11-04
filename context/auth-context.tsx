import { authAPI, profileAPI, tokenManager } from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { translations } from "../constants/translations";

// Match ProfileResponse interface exactly
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

  useEffect(() => {
    checkAuth();
  }, []);

  // Check if token exists and load cached user
  const checkAuth = async () => {
    try {
      const storedToken = await tokenManager.getToken();
      const storedUser = await AsyncStorage.getItem("user");

      if (storedToken) {
        setToken(storedToken);

        // Use cached user for immediate UI rendering
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
        }

        // Refresh user data in background
        try {
          await refreshUser();
        } catch (refreshError) {
          console.error("Background refresh failed:", refreshError);
          // Don't break auth flow if refresh fails
        }
      } else {
        await logout();
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      await logout();
    } finally {
      setLoading(false);
    }
  };

  // Refresh user data from backend
  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const currentToken = await tokenManager.getToken();
      if (!currentToken) {
        await logout();
        return;
      }

      const profileData = await profileAPI.getProfile();

      // Map ProfileResponse to User interface
      const userData: User = {
        id: profileData.id,
        email: profileData.email,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        role: profileData.role,
        verified: profileData.verified,
        profilePicture: profileData.profilePictureUrl || undefined,
        isPremium: profileData.isPremium,
        createdAt: profileData.createdAt,
        updatedAt: profileData.updatedAt,
      };

      await AsyncStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } catch (error: any) {
      console.error("Error refreshing user:", error);
      if (error.response?.status === 401) {
        await logout();
      }
      throw error;
    }
  }, []);

  // Update user in local state
  const updateUser = useCallback((userData: Partial<User>) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      
      const updatedUser = { ...prevUser, ...userData };
      AsyncStorage.setItem("user", JSON.stringify(updatedUser)).catch((err) =>
        console.error("Error saving updated user:", err)
      );
      return updatedUser;
    });
  }, []);

  // Login with email and password
  const login = async (email: string, password: string) => {
    try {
      console.log("AuthContext: Starting login process");
      const response = await authAPI.login({ email, password });
      console.log("AuthContext: Login response received");

      // Fetch user profile after successful login
      const profileData = await profileAPI.getProfile();

      // Create user object
      const userData: User = {
        id: profileData.id,
        email: profileData.email,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        role: profileData.role,
        verified: profileData.verified,
        profilePicture: profileData.profilePictureUrl || undefined,
        isPremium: profileData.isPremium,
        createdAt: profileData.createdAt,
        updatedAt: profileData.updatedAt,
      };

      // Save to AsyncStorage
      await AsyncStorage.setItem("user", JSON.stringify(userData));

      setToken(response.accessToken);
      setUser(userData);
      setIsAuthenticated(true);

      console.log("AuthContext: Login successful");
    } catch (error: any) {
      console.error("AuthContext: Login error:", error);
      const errorMessage =
        error.response?.data?.message || translations.loginFailed;
      throw new Error(errorMessage);
    }
  };

  // Logout and clear all data
  const logout = async () => {
    try {
      const currentToken = await tokenManager.getToken();
      // Call logout API if token exists
      if (currentToken) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error("Logout API error:", error);
      // Continue with local logout even if API fails
    } finally {
      // Always clear local data
      await AsyncStorage.multiRemove(["user", "accessToken", "refreshToken"]);
      await tokenManager.removeTokens();
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        token,
        login,
        logout,
        loading,
        refreshUser,
        updateUser,
      }}
    >
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
