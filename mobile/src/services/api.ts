import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import Constants from "expo-constants";

// ⚠️ URL AYARI (Env + Expo Constants)
// .env (veya EAS env) içine:
// EXPO_PUBLIC_API_BASE_URL_ANDROID=
// EXPO_PUBLIC_API_BASE_URL_IOS=
// şeklinde değerleri tanımlayabilirsin.

const extra = Constants.expoConfig?.extra as any;

const getBaseUrl = () => {
  if (Platform.OS === "android") {
    return (
      extra?.apiBaseUrlAndroid || "http://10.0.2.2:3000/api" // Fallback (local emulator)
    );
  }

  return (
    extra?.apiBaseUrlIOS || "http://localhost:3000/api" // Fallback (iOS simulator)
  );
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Token varsa otomatik ekle
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
