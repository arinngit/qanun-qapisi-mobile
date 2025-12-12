import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosRequestConfig } from "axios";

export const API_BASE_URL = "https://vmi2809419.contaboserver.net/api/v1";

// Device ID bypass email - set this to the email that should bypass device restrictions
export const DEVICE_BYPASS_EMAIL = "appreview.qanunqapisi@gmail.com";

// Create axios instance with optimized defaults
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Request cache to prevent duplicate requests
const requestCache = new Map<string, Promise<any>>();
const cacheExpiry = new Map<string, number>();
const CACHE_DURATION = 30000; // 30 seconds

// Helper function to generate cache key
const getCacheKey = (config: AxiosRequestConfig): string => {
  return `${config.method}-${config.url}-${JSON.stringify(config.params || {})}-${JSON.stringify(config.data || {})}`;
};

// Helper functions for AsyncStorage
export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem("accessToken");
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

export const setTokens = async (
  accessToken: string,
  refreshToken: string
): Promise<void> => {
  try {
    await Promise.all([
      AsyncStorage.setItem("accessToken", accessToken),
      AsyncStorage.setItem("refreshToken", refreshToken),
    ]);
  } catch (error) {
    console.error("Error saving tokens:", error);
  }
};

export const removeTokens = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(["accessToken", "refreshToken"]);
  } catch (error) {
    console.error("Error removing tokens:", error);
  }
};

export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem("refreshToken");
  } catch (error) {
    console.error("Error getting refresh token:", error);
    return null;
  }
};

// Request interceptor: add auth token and handle caching
api.interceptors.request.use(
  async (config) => {
    try {
      // Add auth token
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Request deduplication for GET requests
      if (config.method?.toLowerCase() === 'get') {
        const cacheKey = getCacheKey(config);
        const cachedExpiry = cacheExpiry.get(cacheKey);

        // Check if we have a valid cached request
        if (cachedExpiry && Date.now() < cachedExpiry) {
          const cachedRequest = requestCache.get(cacheKey);
          if (cachedRequest) {
            console.log('Using cached request:', cacheKey.substring(0, 50));
            return cachedRequest as any;
          }
        }
      }
    } catch (error) {
      console.error("Error in request interceptor:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle token refresh and update cache
api.interceptors.response.use(
  (response) => {
    // Update cache for successful GET requests
    if (response.config.method?.toLowerCase() === 'get') {
      const cacheKey = getCacheKey(response.config);
      requestCache.delete(cacheKey);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Enhanced error logging for debugging
    if (!error.response) {
      // Network error (no response received)
      console.error('❌ Network Error:', {
        message: error.message,
        code: error.code,
        url: originalRequest?.url,
        baseURL: originalRequest?.baseURL,
      });
      
      // Common network errors
      if (error.message.includes('Network request failed')) {
        console.error('Possible causes: SSL certificate issue, DNS resolution failed, or server unreachable');
      }
    } else {
      // Server responded with error status
      console.error('❌ Server Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: originalRequest?.url,
        data: error.response.data,
      });
    }

    // Clear cache for failed requests
    if (originalRequest?.method?.toLowerCase() === 'get') {
      const cacheKey = getCacheKey(originalRequest);
      requestCache.delete(cacheKey);
      cacheExpiry.delete(cacheKey);
    }

    // Handle 401 errors with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          await setTokens(accessToken, newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        await removeTokens();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Create a wrapper for GET requests with caching
export const cachedGet = async <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  const requestConfig = { ...config, method: 'GET', url };
  const cacheKey = getCacheKey(requestConfig);

  // Check for valid cached request
  const cachedExpiry = cacheExpiry.get(cacheKey);
  if (cachedExpiry && Date.now() < cachedExpiry) {
    const cachedRequest = requestCache.get(cacheKey);
    if (cachedRequest) {
      return cachedRequest;
    }
  }

  // Create new request and cache it
  const request = api.get<T>(url, config).then((response) => response.data);
  requestCache.set(cacheKey, request);
  cacheExpiry.set(cacheKey, Date.now() + CACHE_DURATION);

  // Clean up cache entry after completion
  request.finally(() => {
    setTimeout(() => {
      requestCache.delete(cacheKey);
      cacheExpiry.delete(cacheKey);
    }, CACHE_DURATION);
  });

  return request;
};

// Clear cache manually (useful after mutations)
export const clearCache = (pattern?: string) => {
  if (pattern) {
    for (const key of requestCache.keys()) {
      if (key.includes(pattern)) {
        requestCache.delete(key);
        cacheExpiry.delete(key);
      }
    }
  } else {
    requestCache.clear();
    cacheExpiry.clear();
  }
};

export const tokenManager = {
  getToken,
  setTokens,
  removeTokens,
  getRefreshToken,
};
