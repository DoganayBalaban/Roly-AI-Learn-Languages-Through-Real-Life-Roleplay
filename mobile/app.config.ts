const config = {
  name: "RolyAI",
  slug: "rolyai",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    supportsTablet: true,
    googleServicesFile: "./GoogleService-Info.plist",
    bundleIdentifier: "com.doganay.rolyai",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      CFBundleURLTypes: [
        {
          CFBundleURLSchemes: [
            "com.googleusercontent.apps.618439721328-9namoain2tk94d7qvnlte7k8rovk9ois",
          ],
        },
      ],
    },
  },
  android: {
    package: "com.doganay.rolyai",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    googleServicesFile: "./google-services.json",
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    "@react-native-google-signin/google-signin",
  ],
  extra: {
    router: {},
    eas: {
      projectId: "da083d46-8d69-4b28-9e66-da9de3923a05",
    },
    // Ortam değişkenleri (env) üzerinden okunacak değerler
    apiBaseUrlAndroid: process.env.EXPO_PUBLIC_API_BASE_URL_ANDROID,
    apiBaseUrlIOS: process.env.EXPO_PUBLIC_API_BASE_URL_IOS,
    googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  },
};

export default config;
