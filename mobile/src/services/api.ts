import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Alert, Platform } from "react-native";

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
  timeout: 15000,
});

// Request Interceptor
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
api.interceptors.response.use(
  (response) => {
    // Başarılı cevapları olduğu gibi geçir
    return response;
  },
  async (error) => {
    // 1. İNTERNET BAĞLANTISI YOKSA
    // "Network Error" genelde internet kapalıyken veya sunucu kapalıyken döner.
    if (error.message === "Network Error" || !error.response) {
      Alert.alert(
        "Bağlantı Hatası ⚠️",
        "Sunucuya ulaşılamıyor. Lütfen internet bağlantınızı kontrol edin."
      );
      return Promise.reject(error);
    }

    // 2. ZAMAN AŞIMI (TIMEOUT)
    // İnternet çok yavaşsa ve 15 saniye boyunca cevap gelmediyse.
    if (error.code === "ECONNABORTED") {
      Alert.alert(
        "Zaman Aşımı ⏳",
        "İstek çok uzun sürdü. Lütfen tekrar deneyin."
      );
      return Promise.reject(error);
    }

    // 3. YETKİSİZ GİRİŞ (401 Unauthorized)
    // Token süresi dolduysa veya geçersizse.
    if (error.response?.status === 401) {
      // Burada sessizce hatayı dönebiliriz, AuthContext logout işlemini yönetir.
      // Veya direkt uyarı verebiliriz:
      // Alert.alert("Oturum Doldu", "Lütfen tekrar giriş yapın.");
    }

    // 4. SUNUCU HATASI (500)
    if (error.response?.status >= 500) {
      Alert.alert(
        "Sunucu Hatası ",
        "Bizden kaynaklı bir sorun oluştu. Lütfen daha sonra tekrar deneyin."
      );
    }

    return Promise.reject(error);
  }
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
export const translateSentence = async (sentence: string) => {
  const response = await api.post("/words/sentence", { sentence });
  return response.data;
};
export const getVoiceAudio = async (text: string, voice?: string) => {
  const response = await api.post("/chat/speak", { text, voice });
  return response.data.audio; // Base64 string döner
};
export const claimQuest = async (questId: string) => {
  const response = await api.post("/auth/quests/claim", { questId });
  return response.data;
};
export const registerPushToken = async (token: string) => {
  await api.put("/auth/push-token", { token });
};

export const getLeaderboard = async (type: "weekly" | "all" = "all") => {
  const response = await api.get(`/leaderboard?type=${type}`);
  return response.data;
};

export default api;
