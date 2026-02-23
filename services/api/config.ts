import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, {AxiosRequestConfig} from "axios";

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

const requestCache = new Map<string, Promise<any>>();
const cacheExpiry = new Map<string, number>();
const CACHE_DURATION = 30000;

const getCacheKey = (config: AxiosRequestConfig): string => {
  return `${config.method}-${config.url}-${JSON.stringify(config.params || {})}-${JSON.stringify(config.data || {})}`;
};

export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem("accessToken");
  } catch {
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
  } catch {
    // Token save failed — will require re-login
  }
};

export const removeTokens = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(["accessToken", "refreshToken"]);
  } catch {
    // Token removal failed
  }
};

export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem("refreshToken");
  } catch {
    return null;
  }
};

api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken: string) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const {accessToken, refreshToken: newRefreshToken} = response.data;
          await setTokens(accessToken, newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          onRefreshed(accessToken);
          return api(originalRequest);
        }
      } catch (refreshError) {
        refreshSubscribers = [];
        await removeTokens();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const cachedGet = async <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  const requestConfig = {...config, method: 'GET', url};
  const cacheKey = getCacheKey(requestConfig);

  const cachedExpiry = cacheExpiry.get(cacheKey);
  if (cachedExpiry && Date.now() < cachedExpiry) {
    const cachedRequest = requestCache.get(cacheKey);
    if (cachedRequest) {
      return cachedRequest;
    }
  }

  const request = api.get<T>(url, config).then((response) => response.data);
  requestCache.set(cacheKey, request);
  cacheExpiry.set(cacheKey, Date.now() + CACHE_DURATION);

  request.finally(() => {
    setTimeout(() => {
      requestCache.delete(cacheKey);
      cacheExpiry.delete(cacheKey);
    }, CACHE_DURATION);
  });

  return request;
};

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
