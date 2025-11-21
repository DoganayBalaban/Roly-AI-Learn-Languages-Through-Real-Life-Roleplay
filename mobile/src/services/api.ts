import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// ⚠️ URL AYARI (Çok Önemli)
// Android Emulator kullanıyorsan: 'http://10.0.2.2:3000/api'
// iOS Simulator kullanıyorsan: 'http://localhost:3000/api'
// Gerçek Cihaz (Wi-Fi) kullanıyorsan: Bilgisayarının IP'si örn: 'http://192.168.1.35:3000/api'

const getBaseUrl = () => {
  if (Platform.OS === "android") return "http://10.0.2.2:3000/api";
  return "http://localhost:3000/api";
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
