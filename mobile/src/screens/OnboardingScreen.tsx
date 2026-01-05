import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { COLORS } from "../constants/color";
import { useAnalytics } from "../utils/analytics";
import { ANALYTICS_EVENTS } from "../constants/events";

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { user, updateUser, setIsNewUser } = useAuth();
  const { track } = useAnalytics();

  // Diller (dinamik çeviri ile)
  const LANGUAGES = [
    { code: "Turkish", labelKey: "lang_turkish", flag: "🇹🇷" },
    { code: "English", labelKey: "lang_english", flag: "🇬🇧" },
    { code: "Spanish", labelKey: "lang_spanish", flag: "🇪🇸" },
    { code: "German", labelKey: "lang_german", flag: "🇩🇪" },
    { code: "French", labelKey: "lang_french", flag: "🇫🇷" },
    { code: "Italian", labelKey: "lang_italian", flag: "🇮🇹" },
    { code: "Japanese", labelKey: "lang_japanese", flag: "🇯🇵" },
    { code: "Russian", labelKey: "lang_russian", flag: "🇷🇺" },
  ];

  const [step, setStep] = useState(1); // 1: Ana Dil, 2: Hedef Dil
  const [nativeLang, setNativeLang] = useState("Turkish");
  const [targetLang, setTargetLang] = useState("English");
  const [loading, setLoading] = useState(false);

  const handleSelect = (langCode: string) => {
    if (step === 1) {
      setNativeLang(langCode);
    } else {
      setTargetLang(langCode);
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      // 2. Adıma geç
      setStep(2);
    } else {
      // BİTİR VE KAYDET
      setLoading(true);
      try {
        // Backend'e tercihleri gönder
        const response = await api.put("/auth/preferences", {
          nativeLanguage: nativeLang,
          targetLanguage: targetLang,
        });

        // Context'i güncelle
        if (user) {
          updateUser(response.data);
        }

        // Track onboarding completion (no PII - only language preferences)
        track(ANALYTICS_EVENTS.ONBOARDING_COMPLETED, {
          native_language: nativeLang,
          target_language: targetLang,
        });

        // Ana sayfaya yönlendir (Stack'i sıfırlayarak, geri dönemesin)
        navigation.reset({
          index: 0,
          routes: [{ name: "MainTabs" }],
        });
        setIsNewUser(false);
      } catch (error) {
        console.log("Onboarding error", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isSelected =
      step === 1 ? nativeLang === item.code : targetLang === item.code;

    return (
      <TouchableOpacity
        style={[styles.langCard, isSelected && styles.langCardSelected]}
        onPress={() => handleSelect(item.code)}
        activeOpacity={0.8}
      >
        <Text style={styles.flag}>{item.flag}</Text>
        <Text
          style={[
            styles.langLabel,
            isSelected && { color: COLORS.background, fontWeight: "bold" },
          ]}
        >
          {t(item.labelKey)}
        </Text>
        {isSelected && (
          <View style={styles.checkIcon}>
            <MaterialIcons name="check" size={16} color={COLORS.background} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Progress Bar (Üstte Çizgi) */}
      <View style={styles.progressContainer}>
        <View
          style={[styles.progressBar, { width: step === 1 ? "50%" : "100%" }]}
        />
      </View>

      <View style={styles.content}>
        {/* Başlıklar */}
        <View style={styles.header}>
          <Text style={styles.stepText}>{t("onboarding_step", { step })}</Text>
          <Text style={styles.title}>
            {step === 1
              ? t("onboarding_native_title")
              : t("onboarding_target_title")}
          </Text>
          <Text style={styles.subtitle}>
            {step === 1
              ? t("onboarding_native_subtitle")
              : t("onboarding_target_subtitle")}
          </Text>
        </View>

        {/* Dil Listesi */}
        <FlatList
          data={LANGUAGES}
          keyExtractor={(item) => item.code}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        {/* İleri Butonu */}
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.background} />
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={styles.nextButtonText}>
                {step === 1 ? t("onboarding_continue") : t("onboarding_start")}
              </Text>
              <MaterialIcons
                name="arrow-forward"
                size={20}
                color={COLORS.background}
                style={{ marginLeft: 5 }}
              />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  progressContainer: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    width: "100%",
    marginTop: 10,
  },
  progressBar: { height: "100%", backgroundColor: COLORS.primary },

  content: { flex: 1, padding: 24 },
  header: { marginBottom: 30 },
  stepText: {
    color: COLORS.primary,
    fontWeight: "bold",
    fontSize: 12,
    marginBottom: 8,
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.textWhite,
    marginBottom: 8,
  },
  subtitle: { fontSize: 16, color: COLORS.textGrey, lineHeight: 22 },

  listContent: { paddingBottom: 100 },
  row: { justifyContent: "space-between", marginBottom: 12 },

  langCard: {
    width: "48%",
    backgroundColor: COLORS.cardBg,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
  },
  langCardSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  flag: { fontSize: 32, marginBottom: 8 },
  langLabel: { fontSize: 16, color: COLORS.textWhite, fontWeight: "500" },

  checkIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 10,
    padding: 2,
  },

  nextButton: {
    position: "absolute",
    bottom: 30,
    left: 24,
    right: 24,
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  nextButtonText: {
    color: COLORS.background,
    fontSize: 18,
    fontWeight: "bold",
  },
});
