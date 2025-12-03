import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import { COLORS } from "../constants/color";

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [step, setStep] = useState(1); // 1: Email, 2: Kod, 3: Yeni Şifre
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // --- ADIM 1: KOD GÖNDER ---
  const handleSendCode = async () => {
    if (!email)
      return Alert.alert(t("error"), "Lütfen e-posta adresinizi girin.");
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email });
      // TEST İÇİN: Kodu alert içinde gösteriyoruz (Normalde e-postaya gider)
      if (res.data.debugCode) {
        Alert.alert("Test Modu", `Gelen Kod: ${res.data.debugCode}`);
      } else {
        Alert.alert(t("success"), t("code_sent"));
      }
      setStep(2);
    } catch (error: any) {
      Alert.alert(
        t("error"),
        error.response?.data?.message || "İşlem başarısız."
      );
    } finally {
      setLoading(false);
    }
  };

  // --- ADIM 2: KODU DOĞRULA ---
  const handleVerifyCode = async () => {
    if (!code) return Alert.alert(t("error"), "Lütfen kodu girin.");
    setLoading(true);
    try {
      await api.post("/auth/verify-code", { email, code });
      setStep(3);
    } catch (error: any) {
      Alert.alert(t("error"), t("code_invalid"));
    } finally {
      setLoading(false);
    }
  };

  // --- ADIM 3: ŞİFREYİ SIFIRLA ---
  const handleResetPassword = async () => {
    if (!newPassword) return Alert.alert(t("error"), "Yeni şifrenizi girin.");
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { email, code, newPassword });
      Alert.alert(t("success"), t("password_updated"), [
        { text: t("ok"), onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert(t("error"), t("password_reset_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={COLORS.textWhite}
            />
          </TouchableOpacity>
          <Text style={styles.title}>{t("forgot_password_title")}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          {/* --- ADIM 1: EMAIL --- */}
          {step === 1 && (
            <>
              <MaterialIcons
                name="lock-reset"
                size={80}
                color={COLORS.primary}
                style={styles.icon}
              />
              <Text style={styles.infoText}>{t("forgot_password_info")}</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t("email")}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ornek@email.com"
                  placeholderTextColor={COLORS.textGrey}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={handleSendCode}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.buttonText}>{t("send_code")}</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* --- ADIM 2: KOD GİRME --- */}
          {step === 2 && (
            <>
              <MaterialIcons
                name="mark-email-read"
                size={80}
                color={COLORS.primary}
                style={styles.icon}
              />
              <Text style={styles.infoText}>
                {t("verification_code_info", { email })}
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t("verification_code")}</Text>
                <TextInput
                  style={[
                    styles.input,
                    { textAlign: "center", letterSpacing: 5, fontSize: 24 },
                  ]}
                  placeholder="XXXXXX"
                  placeholderTextColor={COLORS.textGrey}
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={handleVerifyCode}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.buttonText}>{t("verify")}</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* --- ADIM 3: YENİ ŞİFRE --- */}
          {step === 3 && (
            <>
              <MaterialIcons
                name="verified-user"
                size={80}
                color={COLORS.primary}
                style={styles.icon}
              />
              <Text style={styles.infoText}>{t("new_password_info")}</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t("new_password")}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t("new_password_placeholder")}
                  placeholderTextColor={COLORS.textGrey}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.buttonText}>{t("update_password")}</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  backButton: { padding: 8 },
  title: { fontSize: 18, fontWeight: "bold", color: COLORS.textWhite },
  content: { flex: 1, padding: 24, justifyContent: "center" },
  icon: { alignSelf: "center", marginBottom: 24 },
  infoText: {
    color: COLORS.textGrey,
    textAlign: "center",
    marginBottom: 32,
    fontSize: 16,
    lineHeight: 24,
  },
  inputGroup: { marginBottom: 24 },
  label: { color: COLORS.textWhite, marginBottom: 8, fontWeight: "bold" },
  input: {
    backgroundColor: COLORS.inputBg,
    color: COLORS.textWhite,
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
  },
  buttonText: { color: COLORS.background, fontWeight: "bold", fontSize: 16 },
});
