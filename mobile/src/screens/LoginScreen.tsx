import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Linking,
  SafeAreaView,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { MaterialIcons, FontAwesome5, AntDesign } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useTranslation } from "react-i18next";

// Tasarımdaki Renk Paleti
import { COLORS } from "../constants/color";
import { Image } from "expo-image";
import { validateCredentials } from "../utils/validation";

export default function LoginScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordConfirmVisible, setIsPasswordConfirmVisible] =
    useState(false);

  // Kayıt/Giriş geçişi için state (Şimdilik tasarım Login odaklı ama mantığı koruyoruz)
  const [isRegistering, setIsRegistering] = useState(false);
  const [fullName, setFullName] = useState("");
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const { login, register, googleLogin } = useAuth();

  const navigation = useNavigation<any>();
  const handleOpenLink = async (url: string) => {
    // Cihazın tarayıcısında açar
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(t("error"), t("link_open_error"));
    }
  };
  const handleSubmit = async () => {
    // 1. Frontend Validation Kontrolü
    const error = validateCredentials(email, password, fullName, isRegistering);

    if (error) {
      Alert.alert(t("error"), error);
      return;
    }

    // 2. Eğer frontend'i geçerse Backend'e git
    setLoading(true);
    try {
      if (isRegistering) {
        await register(fullName, email, password);
      } else {
        await login(email, password);
      }
    } catch (error: any) {
      // Backend'den (Zod'dan) gelen mesajı göster
      const errorMessage = error.message || error.error || t("error");
      Alert.alert(t("error"), errorMessage);
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleLogin = async () => {
    try {
      await googleLogin();
    } catch (error) {
      console.log("Google login failed:", error);
      Alert.alert(t("error"), t("google_login_failed"));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* --- LOGO & HEADER --- */}
          <View style={styles.headerContainer}>
            {/* Logo ve İsim Yan Yana (Sol Üst) */}
            <View style={styles.brandContainer}>
              <View style={styles.logoCircle}>
                <Image
                  source={require("../../assets/logo.png")}
                  style={styles.logo}
                  contentFit="contain"
                  transition={1000}
                />
              </View>
              <Text style={styles.appName}>Roly AI</Text>
            </View>

            {/* Hoşgeldin Yazısı (Ortada veya Altta kalabilir) */}
            <Text style={styles.welcomeText}>
              {isRegistering
                ? t("login_welcome_register")
                : t("login_welcome_login")}
            </Text>
          </View>

          {/* --- FORM --- */}
          <View style={styles.formContainer}>
            {isRegistering && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t("full_name")}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t("full_name_placeholder")}
                  placeholderTextColor={COLORS.textGrey}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("email")}</Text>
              <TextInput
                style={styles.input}
                placeholder={t("email_placeholder")}
                placeholderTextColor={COLORS.textGrey}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("password")}</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder={t("password_placeholder")}
                  placeholderTextColor={COLORS.textGrey}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                />
                <TouchableOpacity
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  style={styles.eyeIcon}
                >
                  <MaterialIcons
                    name={isPasswordVisible ? "visibility" : "visibility-off"}
                    size={24}
                    color={COLORS.textGrey}
                  />
                </TouchableOpacity>
              </View>
            </View>
            {isRegistering && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t("password_confirm")}</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder={t("password_confirm_placeholder")}
                    placeholderTextColor={COLORS.textGrey}
                    value={passwordConfirm}
                    onChangeText={setPasswordConfirm}
                    secureTextEntry={!isPasswordConfirmVisible}
                  />
                  <TouchableOpacity
                    onPress={() =>
                      setIsPasswordConfirmVisible(!isPasswordConfirmVisible)
                    }
                    style={styles.eyeIcon}
                  >
                    <MaterialIcons
                      name={
                        isPasswordConfirmVisible
                          ? "visibility"
                          : "visibility-off"
                      }
                      size={24}
                      color={COLORS.textGrey}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {isRegistering ? (
              <View style={styles.termsContainer}>
                <TouchableOpacity
                  onPress={() => setIsTermsAccepted(!isTermsAccepted)}
                  style={styles.checkboxContainer}
                >
                  <MaterialIcons
                    name={
                      isTermsAccepted
                        ? "check-circle"
                        : "radio-button-unchecked"
                    }
                    size={28}
                    color={isTermsAccepted ? COLORS.primary : "#334155"}
                  />
                </TouchableOpacity>

                <Text style={styles.termsText}>
                  {/* Tıklanabilir Metinler */}
                  <Text
                    style={styles.linkText}
                    onPress={() =>
                      handleOpenLink(process.env.EXPO_PUBLIC_PRIVACY_URL)
                    }
                  >
                    {t("terms_of_use")}
                  </Text>{" "}
                  {t("and")}{" "}
                  <Text
                    style={styles.linkText}
                    onPress={() =>
                      handleOpenLink(process.env.EXPO_PUBLIC_TERMS_URL)
                    }
                  >
                    {t("privacy_policy")}
                  </Text>{" "}
                  {t("terms_accept")}
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => navigation.navigate("ForgotPassword")}
              >
                <Text style={styles.forgotPasswordText}>
                  {t("forgot_password")}
                </Text>
              </TouchableOpacity>
            )}

            {/* --- ANA BUTON --- */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.backgroundDark} />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isRegistering ? t("register") : t("login")}
                </Text>
              )}
            </TouchableOpacity>

            {/* --- DIVIDER --- */}
            <View style={styles.dividerContainer}>
              <View style={styles.line} />
              <Text style={styles.orText}>{t("or")}</Text>
              <View style={styles.line} />
            </View>

            {/* --- SOCIAL BUTTONS --- */}
            <View style={styles.socialContainer}>
              <TouchableOpacity
                onPress={handleGoogleLogin}
                style={styles.googleButton}
              >
                <AntDesign
                  name="google"
                  size={20}
                  color="white"
                  style={{ marginRight: 10 }}
                />
                <Text style={styles.socialTextGoogle}>
                  {t("continue_with_google")}
                </Text>
              </TouchableOpacity>
            </View>

            {/* --- BOTTOM LINK --- */}
            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>
                {isRegistering
                  ? t("already_have_account")
                  : t("dont_have_account")}{" "}
              </Text>
              <TouchableOpacity
                onPress={() => setIsRegistering(!isRegistering)}
              >
                <Text style={styles.footerLink}>
                  {isRegistering ? t("login") : t("register")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20, // Biraz daha yukarı aldım
    paddingBottom: 40,
    // alignItems: 'center', // <-- DİKKAT: Bunu silmelisin! Yoksa sola yaslanmaz.
  },
  headerContainer: {
    width: "100%", // Tüm genişliği kaplasın
    marginBottom: 30,
  },
  // --- YENİ EKLENEN: Logo ve Yazıyı yan yana tutan kutu ---
  brandContainer: {
    flexDirection: "row", // Yan yana dizer
    alignItems: "center", // Dikeyde ortalar
    alignSelf: "flex-start", // Sola yaslar
    marginBottom: 20,
  },
  logoCircle: {
    width: 48, // Biraz küçülttük (daha zarif dursun)
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 24, // Logo ile Yazı arasındaki boşluk
    // marginBottom sildik, çünkü yan yana geldiler
  },
  logo: {
    width: 150, // İkon boyutu
    height: 150,
  },
  appName: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.textWhite,
    // marginBottom sildik
  },
  welcomeText: {
    fontSize: 30,
    fontWeight: "bold",
    color: COLORS.textWhite,
    textAlign: "left", // İstersen 'center' yapabilirsin
    marginTop: 10,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
    color: COLORS.textWhite,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    color: COLORS.textWhite,
    fontSize: 16,
    height: "100%",
  },
  eyeIcon: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: COLORS.textGrey,
    textDecorationLine: "underline",
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 28, // Tam yuvarlak köşeler
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  primaryButtonText: {
    color: COLORS.backgroundDark,
    fontSize: 16,
    fontWeight: "bold",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#334155", // Slate-700 benzeri
  },
  orText: {
    color: COLORS.textGrey,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  socialContainer: {
    gap: 16,
    marginBottom: 32,
  },
  googleButton: {
    flexDirection: "row",
    backgroundColor: COLORS.googleBtn,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  socialTextGoogle: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  appleButton: {
    flexDirection: "row",
    backgroundColor: COLORS.appleBtn,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  socialTextApple: {
    color: "black",
    fontSize: 16,
    fontWeight: "500",
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  footerText: {
    color: COLORS.textGrey,
    fontSize: 14,
  },
  footerLink: {
    color: COLORS.primary,
    fontWeight: "bold",
    fontSize: 14,
    textDecorationLine: "underline",
  },

  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  termsText: {
    flex: 1, // Metin uzun olursa alt satıra geçsin
    color: COLORS.textGrey, // Silik gri renk
    fontSize: 14,
    lineHeight: 20,
  },
  linkText: {
    color: COLORS.primary, // Neon Yeşil
    fontWeight: "bold",
  },
});
