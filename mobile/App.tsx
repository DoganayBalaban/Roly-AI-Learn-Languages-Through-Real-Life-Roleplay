import React from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "./src/constants/color";

import { AuthProvider, useAuth } from "./src/context/AuthContext";

// Ekranlar
import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ChatScreen from "./src/screens/ChatScreen";
import ProgressScreen from "./src/screens/ProgressScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import ScenarioListScreen from "./src/screens/ScenarioListScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- TAB BAR YAPISI ---
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.tabBarBg,
          borderTopWidth: 0, // Çizgiyi kaldır
          elevation: 0,
          height: 80, // Biraz daha yüksek
          paddingBottom: 20,
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
          </>
        ) : (
          // GİRİŞ YAPMAMIŞ KULLANICI
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
