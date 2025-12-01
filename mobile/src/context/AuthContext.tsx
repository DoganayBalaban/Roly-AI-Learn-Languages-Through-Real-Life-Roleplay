import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import * as SecureStore from "expo-secure-store";
import api from "../services/api";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

// 1. User Interface'ini Güncelledik (Preferences ekledik)
interface User {
  id: string;
  _id?: string; // Backend bazen _id dönebilir
  email: string;
  fullName: string;
  isPremium: boolean;
  avatarId?: string;
  preferences: {
    targetLanguage: string;
    nativeLanguage: string;
    difficultyLevel?: string;
  };
  stats: {
    streak: number;
    activityHistory: string[];
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    fullName: string,
    email: string,
    password: string
  ) => Promise<void>;
  googleLogin: () => Promise<void>;
  logout: () => Promise<void>;
  deleteUser: () => Promise<void>;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // 1. Google Ayarları (Env + Expo Constants)
      GoogleSignin.configure({
        // Backend için Web Client ID (Google Cloud'dan aldığın)
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,

        // iOS Simülatörü / cihaz için Native Client ID
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      });

      // 2. Mevcut oturumu kontrol et
      await checkLoginStatus();
    };

    initAuth();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync("user_token");
      if (token) {
        // Token varsa gerçek kullanıcı verilerini yükle
        await fetchUserProfile();
      } else {
        // Token yoksa loading'i bitir
        setIsLoading(false);
      }
    } catch (error) {
      console.log("Login check failed:", error);
      setIsLoading(false);
    }
  };
  const fetchUserProfile = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch (error) {
      console.log("User data fetch failed");
      logout();
    } finally {
      // Kullanıcı verileri yüklendikten sonra loading'i bitir
      setIsLoading(false);
    }
  };
  const updateUser = (userData: User) => {
    setUser(userData);
  };
  const login = async (email: string, password: string) => {
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });
      const { token } = res.data;
      await SecureStore.setItemAsync("user_token", token);
      // Token kaydedildikten sonra tam kullanıcı verisini çek
      await fetchUserProfile();
    } catch (error: any) {
      throw error.response?.data || { message: "Login failed" };
    }
  };
  const register = async (
    fullName: string,
    email: string,
    password: string
  ) => {
    try {
      const res = await api.post("/auth/register", {
        fullName,
        email,
        password,
      });
      const { token } = res.data;
      await SecureStore.setItemAsync("user_token", token);
      // Token kaydedildikten sonra tam kullanıcı verisini çek
      await fetchUserProfile();
    } catch (error: any) {
      throw error.response?.data || { message: "Registration failed" };
    }
  };
  const googleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;
      if (idToken) {
        const res = await api.post("/auth/google", {
          idToken,
        });
        const { token } = res.data;
        await SecureStore.setItemAsync("user_token", token);
        // Token kaydedildikten sonra tam kullanıcı verisini çek
        await fetchUserProfile();
      }
    } catch (error) {
      console.log("Google login failed:", error);
      throw error;
    }
  };
  const logout = async () => {
    await SecureStore.deleteItemAsync("user_token");
    setUser(null);
  };
  const deleteUser = async () => {
    try {
      await api.delete("/auth/delete");
      await logout();
    } catch (error: any) {
      throw error.response?.data || { message: "Delete account failed" };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        googleLogin,
        logout,
        updateUser,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
