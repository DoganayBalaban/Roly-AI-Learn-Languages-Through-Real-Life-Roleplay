import React, { useEffect } from "react";
import { View, ActivityIndicator, Platform, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "./src/constants/color";
import * as Notifications from "expo-notifications";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import "./src/i18n.ts";
import { useTranslation } from "react-i18next";
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
import OnboardingScreen from "./src/screens/OnboardingScreen";
import WelcomeScreen from "./src/screens/WelcomeScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const API_KEYS = {
  android: process.env.EXPO_PUBLIC_REVENUECAT_PUBLIC_API_KEY_ANDROID, // RevenueCat Public API Key (Android)
  ios: process.env.EXPO_PUBLIC_REVENUECAT_PUBLIC_API_KEY_IOS, // RevenueCat Public API Key (iOS)
};
// --- TAB BAR YAPISI ---
function MainTabs() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.tabBarBg,
          borderTopWidth: 0,
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
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textGrey,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap = "home";

          if (route.name === "Home") {
            iconName = "home";
          } else if (route.name === "Progress") {
            iconName = "leaderboard";
          } else if (route.name === "Profile") {
            iconName = "person";
          }

          return <MaterialIcons name={iconName} size={28} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: t("tab_home"),
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          tabBarLabel: t("tab_progress"),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t("tab_profile"),
        }}
      />
    </Tab.Navigator>
  );
}

// --- ANA NAVİGASYON ---
const AppNavigator = () => {
  const { user, isLoading, isNewUser, isFirstLaunch } = useAuth();

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
          isNewUser ? (
            <Stack.Screen
              name="Onboarding"
              component={OnboardingScreen}
              options={{ headerShown: false }}
            />
          ) : (
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
          )
        ) : (
          // GİRİŞ YAPMAMIŞ KULLANICI
          <>
            {isFirstLaunch && (
              <Stack.Screen
                name="Welcome"
                component={WelcomeScreen}
                options={{ headerShown: false }}
              />
            )}
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
