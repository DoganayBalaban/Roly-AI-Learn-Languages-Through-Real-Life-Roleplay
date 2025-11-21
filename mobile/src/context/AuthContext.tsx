import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import * as SecureStore from "expo-secure-store";
import api from "../services/api"; // Az önce oluşturduğumuz axios instance
interface User {
  id: string;
  email: string;
  fullName: string;
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
  logout: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    checkLoginStatus();
  }, []);
  const checkLoginStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync("user_token");
      if (token) {
        setUser({
          id: "temp",
          fullName: "",
          email: "",
        });
        await fetchUserProfile();
      }
    } catch (error) {
      console.log("Login check failed:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchUserProfile = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch (error) {
      console.log("User data fetch failed");
      logout(); // Token geçersizse çıkış yap
    }
  };
  const login = async (email: string, password: string) => {
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });
      const { user, token } = res.data;
      await SecureStore.setItemAsync("user_token", token);
      setUser(user);
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
      const { user, token } = res.data;
      await SecureStore.setItemAsync("user_token", token);
      setUser(user);
    } catch (error: any) {
      throw error.response?.data || { message: "Registration failed" };
    }
  };
  const logout = async () => {
    await SecureStore.deleteItemAsync("user_token");
    setUser(null);
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
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
