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
export const uploadAudio = async (uri: string) => {
  const formData = new FormData();

  // Dosya uzantısını al
  const uriParts = uri.split(".");
  const fileExtension = uriParts[uriParts.length - 1] || "m4a";

  // Mime type mapping - Expo Audio farklı formatlar kullanabilir
  const getMimeType = (ext: string): string => {
    const mimeMap: { [key: string]: string } = {
      m4a: "audio/mp4", // iOS/Android genelde m4a kullanır ama mime type audio/mp4 olur
      mp4: "audio/mp4",
      mp3: "audio/mpeg",
      wav: "audio/wav",
      webm: "audio/webm",
      ogg: "audio/ogg",
      flac: "audio/flac",
    };
    return mimeMap[ext.toLowerCase()] || "audio/mp4";
  };

  const mimeType = getMimeType(fileExtension);

  formData.append("audio", {
    uri,
    name: `recording.${fileExtension}`,
    type: mimeType,
  } as any);

  // FormData için özel header ayarı gerekebilir, axios bunu genelde otomatik yapar
  // ama garanti olsun diye content-type'ı siliyoruz (browser/axios kendi doldursun)
  const response = await api.post("/chat/transcribe", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
export const saveWord = async (word: string, contextSentence: string) => {
  const response = await api.post("/words", { word, contextSentence });
  return response.data;
};

export const getMyWords = async () => {
  const response = await api.get("/words");
  return response.data;
};

export const deleteWord = async (wordId: string) => {
  const response = await api.delete(`/words/${wordId}`);
  return response.data;
};
export const lookupWord = async (word: string, contextSentence: string) => {
  const response = await api.post("/words/lookup", {
    word,
    contextSentence,
  });
  return response.data;
};
export const getVoiceAudio = async (text: string, voice?: string) => {
  const response = await api.post("/chat/speak", { text, voice });
  return response.data.audio; // Base64 string döner
};
export default api;
