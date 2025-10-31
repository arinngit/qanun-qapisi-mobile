import { authAPI, profileAPI, tokenManager } from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import React, { createContext, useContext, useEffect, useState } from "react";
import { translations } from "../constants/translations";

// Обновите интерфейс User для совместимости с ProfileResponse
interface User {
  id: string;
  email: string;
  name: string;
  surname: string;
  role: string;
  verified?: boolean;
  profilePicture?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface DecodedToken {
  exp: number;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  refreshUser: () => Promise<void>; // Добавляем эту функцию
  updateUser: (userData: Partial<User>) => void; // И эту
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

  const decodeToken = (token: string): DecodedToken => {
    try {
      return jwtDecode<DecodedToken>(token);
    } catch (error) {
      console.error("Error decoding token:", error);
      throw new Error("Invalid token");
    }
  };

  const isTokenExpired = (token: string): boolean => {
    try {
      const decoded = decodeToken(token);
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  const extractUserFromToken = (token: string): User => {
    const decoded = decodeToken(token);
    return {
      id: decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ],
      email:
        decoded[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
        ],
      role: decoded[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ],
      name: "",
      surname: "",
    };
  };

  // Функция для обновления пользователя в состоянии
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      AsyncStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  // auth-context.tsx faylında aşağıdakı dəyişiklikləri edin

  const checkAuth = async () => {
    try {
      const storedToken = await tokenManager.getToken();
      const storedUser = await AsyncStorage.getItem("user");

      if (storedToken && !isTokenExpired(storedToken)) {
        setToken(storedToken);

        // Əvvəlcə storedUser istifadə et, sonra refresh et
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
        }

        // Background-da user məlumatlarını yenilə
        try {
          await refreshUser();
        } catch (refreshError) {
          console.error("Background refresh failed:", refreshError);
          // Əsas auth-u pozma
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

  const refreshUser = async (): Promise<void> => {
    try {
      const currentToken = await tokenManager.getToken();
      if (!currentToken || isTokenExpired(currentToken)) {
        await logout();
        return;
      }

      const profileData = await profileAPI.getProfile();

      const userData: User = {
        id: profileData.id,
        email: profileData.email,
        name: profileData.firstName,
        surname: profileData.lastName,
        role: profileData.role,
        verified: profileData.verified,
        profilePicture: profileData.profilePicture,
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
      throw error; // Xətanı yuxarıya ötür
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log("AuthContext: Starting login process");
      const response = await authAPI.login({ email, password });
      console.log("AuthContext: Login response received");

      // Получаем профиль пользователя после успешного логина
      const profileData = await profileAPI.getProfile();

      // Создаем объект пользователя
      const userData: User = {
        id: profileData.id,
        email: profileData.email,
        name: profileData.firstName,
        surname: profileData.lastName,
        role: profileData.role,
        verified: profileData.verified,
        profilePicture: profileData.profilePicture,
        createdAt: profileData.createdAt,
        updatedAt: profileData.updatedAt,
      };

      // Сохраняем пользователя в AsyncStorage
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
      // Token varsa logout API-ni çağır
      if (currentToken && !isTokenExpired(currentToken)) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error("Logout API error:", error);
      // API xətası olsa belə, local logout et
    } finally {
      // Həmişə local logout et
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
        refreshUser, // Добавляем в value
        updateUser, // Добавляем в value
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
