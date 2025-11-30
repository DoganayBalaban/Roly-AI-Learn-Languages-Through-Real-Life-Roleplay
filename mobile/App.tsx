import React, { useEffect } from "react";
import { View, ActivityIndicator, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "./src/constants/color";
import * as Notifications from "expo-notifications";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
// Ekranlar
import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ChatScreen from "./src/screens/ChatScreen";
import ProgressScreen from "./src/screens/ProgressScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import ScenarioListScreen from "./src/screens/ScenarioListScreen";
import FeedbackScreen from "./src/screens/FeedbackScreen";
import ForgotPasswordScreen from "./src/screens/ForgotPasswordScreen";
import PaywallScreen from "./src/screens/PaywallScreen";
import VocabularyScreen from "./src/screens/VocabularyScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const API_KEYS = {
  android: process.env.EXPO_PUBLIC_REVENUECAT_PUBLIC_API_KEY_ANDROID, // RevenueCat Public API Key (Android)
  ios: process.env.EXPO_PUBLIC_REVENUECAT_PUBLIC_API_KEY_IOS, // RevenueCat Public API Key (iOS)
};
// --- TAB BAR YAPISI ---
function MainTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.tabBarBg,
          borderTopWidth: 0, // Çizgiyi kaldır
          elevation: 0,
          height: 60 + (insets.bottom > 0 ? insets.bottom : 10),
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginTop: 4,
        },
        tabBarActiveTintColor: COLORS.primary, // Seçiliyken Neon Yeşil
        tabBarInactiveTintColor: COLORS.textGrey, // Seçili değilken Gri

        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap = "home";

          if (route.name === "Ana Sayfa") {
            iconName = "home";
          } else if (route.name === "İlerleme") {
            // HTML'de 'leaderboard' kullanılmış
            iconName = "leaderboard";
          } else if (route.name === "Profil") {
            iconName = "person";
          }

          return <MaterialIcons name={iconName} size={28} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Ana Sayfa" component={HomeScreen} />
      <Tab.Screen name="İlerleme" component={ProgressScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// --- ANA NAVİGASYON ---
const AppNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          // GİRİŞ YAPMIŞ KULLANICI
          <>
            {/* Ana ekran artık Tab Bar olacak */}
            <Stack.Screen
              name="MainTabs"
              component={MainTabs}
              options={{ headerShown: false }}
            />

            {/* Chat ekranı Tab Bar'ın dışında (üstünde) açılmalı */}
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{ headerBackTitle: "Geri" }}
            />
            <Stack.Screen
              name="ScenarioList"
              component={ScenarioListScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Feedback"
              component={FeedbackScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Paywall"
              component={PaywallScreen}
              options={{
                headerShown: false,
                presentation: "modal", // Bu, ekranın aşağıdan yukarı kayarak açılmasını sağlar (iOS'te çok şık durur)
              }}
            />
            <Stack.Screen
              name="Vocabulary"
              component={VocabularyScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          // GİRİŞ YAPMAMIŞ KULLANICI
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// ... diğer importlar

// BU KODU APP COMPONENT'İN DIŞINA EKLE
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // Uygulama açıkken de bildirim görünsün
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  useEffect(() => {
    const initPurchases = async () => {
      // Hata ayıklama için logları açalım
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);

      if (Platform.OS === "android") {
        await Purchases.configure({ apiKey: API_KEYS.android });
      } else if (Platform.OS === "ios") {
        await Purchases.configure({ apiKey: API_KEYS.ios });
      }
    };

    initPurchases();
  }, []);
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
