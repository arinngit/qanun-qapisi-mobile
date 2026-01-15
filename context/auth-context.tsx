import { authAPI, profileAPI, tokenManager } from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { translations } from "../constants/translations";
import { getDeviceId } from "../utils/deviceId";

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
        } catch (refreshError) {
          console.error("Background refresh failed:", refreshError);
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

  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const currentToken = await tokenManager.getToken();
      if (!currentToken) {
        await logout();
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
    } catch (error: any) {
      console.error("Error refreshing user:", error);
      if (error.response?.status === 401) {
        await logout();
      }
      throw error;
    }
  }, []);

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

  const login = async (email: string, password: string) => {
    try {
      console.log("AuthContext: Starting login process");
      const deviceId = await getDeviceId();
      const response = await authAPI.login({ email, password, deviceId });
      console.log("AuthContext: Login response received");

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

      console.log("AuthContext: Login successful");
    } catch (error: any) {
      console.error("AuthContext: Login error:", error);
      const errorMessage =
        error.response?.data?.message || translations.loginFailed;
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      const currentToken = await tokenManager.getToken();
      if (currentToken) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
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
