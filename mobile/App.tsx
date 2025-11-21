import React from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import LoginScreen from "./src/screens/LoginScreen";

// Geçici Home Screen (Şimdilik boş bir ekran olsun)
// İleride burayı src/screens/HomeScreen.tsx yapacağız
const HomeScreen = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <ActivityIndicator size="large" color="#007AFF" />
    {/* Buraya Logout butonu vs gelecek */}
  </View>
);

const Stack = createNativeStackNavigator();

// Navigasyon Mantığı Burada
const AppNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // Uygulama açılırken token kontrolü sırasında gösterilecek ekran
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // Giriş Yapmış Kullanıcılar Burayı Görür
          <Stack.Screen name="Home" component={HomeScreen} />
        ) : (
          // Giriş Yapmamış Kullanıcılar Burayı Görür
          <Stack.Screen name="Login" component={LoginScreen} />
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
