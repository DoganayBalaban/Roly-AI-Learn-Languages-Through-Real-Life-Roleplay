import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// React Native'in global değişkeni __DEV__:
// Geliştirme modundaysan (bilgisayara bağlıysan) 'true' döner.
// Build aldığında (APK/AAB) 'false' döner.

const getBaseUrl = () => {
  // 1. Eğer uygulama MAĞAZA/BUILD modundaysa (Production) -> Render Linki
  if (!__DEV__) {
    return process.env.EXPO_PUBLIC_API_URL_PROD;
  }

  // 2. Eğer geliştirme modundaysan (Localhost) -> Cihaza göre seçim
  if (Platform.OS === "android") {
    return process.env.EXPO_PUBLIC_API_URL_ANDROID;
  }

  return process.env.EXPO_PUBLIC_API_URL_IOS;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor (Aynen kalsın)
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("user_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
