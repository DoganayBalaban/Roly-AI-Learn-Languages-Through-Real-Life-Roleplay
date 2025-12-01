import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
  Alert,
  Modal,
  FlatList,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scheduleDailyReminder, cancelReminders } from "../utils/notifications";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import * as SecureStore from "expo-secure-store";
import { COLORS } from "../constants/color";
import { AVATAR_SEEDS } from "../constants/avatar";

export default function ProfileScreen() {
  const { t } = useTranslation();

  // Seçilebilir Diller Listesi (dinamik çeviri ile)
  const LANGUAGES = [
    { code: "Turkish", labelKey: "lang_turkish", flag: "🇹🇷" },
    { code: "English", labelKey: "lang_english", flag: "🇬🇧" },
    { code: "Spanish", labelKey: "lang_spanish", flag: "🇪🇸" },
    { code: "German", labelKey: "lang_german", flag: "🇩🇪" },
    { code: "French", labelKey: "lang_french", flag: "🇫🇷" },
    { code: "Italian", labelKey: "lang_italian", flag: "🇮🇹" },
    { code: "Japanese", labelKey: "lang_japanese", flag: "🇯🇵" },
    { code: "Korean", labelKey: "lang_korean", flag: "🇰🇷" },
    { code: "Russian", labelKey: "lang_russian", flag: "🇷🇺" },
  ];
  const navigation = useNavigation<any>();
  const { user, logout, updateUser, deleteUser } = useAuth();
  const insets = useSafeAreaInsets();

  // Modal State'leri
  const [modalVisible, setModalVisible] = useState(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [loadingAvatar, setLoadingAvatar] = useState(false);
  const [activeSelection, setActiveSelection] = useState<
    "target" | "native" | null
  >(null);
  const [loading, setLoading] = useState(false);

  const [isDailyReminderEnabled, setIsDailyReminderEnabled] = useState(false);
  const currentAvatarUrl = `https://api.dicebear.com/9.x/avataaars/png?seed=${
    user?.avatarId || user?.fullName || "User"
  }`;
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedReminder = await SecureStore.getItemAsync("daily_reminder");
        if (savedReminder === "true") {
          setIsDailyReminderEnabled(true);
        }
      } catch (error) {
        console.log("Ayarlar yüklenemedi.");
      }
    };
    loadSettings();
  }, []);

  const handleSelectAvatar = async (seed: string) => {
    setLoadingAvatar(true);
    try {
      const res = await api.put("/auth/avatar", { avatarId: seed });
      updateUser(res.data);
      setAvatarModalVisible(false);
    } catch (error) {
      Alert.alert(t("error"), t("avatar_update_error"));
    } finally {
      setLoadingAvatar(false);
    }
  };
  const handleLanguageSelect = async (langCode: string) => {
    setLoading(true);
    try {
      const payload =
        activeSelection === "target"
          ? { targetLanguage: langCode }
          : { nativeLanguage: langCode };

      const response = await api.put("/auth/preferences", payload);

      // Context'i güncelle ki ekran anında değişsin
      updateUser(response.data);
      setModalVisible(false);
    } catch (error) {
      Alert.alert(t("error"), t("language_update_error"));
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type: "target" | "native") => {
    setActiveSelection(type);
    setModalVisible(true);
  };

  // Logout Mantığı
  const handleLogout = () => {
    Alert.alert(t("logout"), t("logout_confirm"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("logout_confirm_button"),
        style: "destructive",
        onPress: () => logout(),
      },
    ]);
  };

  const toggleDailyReminder = async (value: boolean) => {
    setIsDailyReminderEnabled(value);

    try {
      await SecureStore.setItemAsync("daily_reminder", value.toString());
      if (value) {
        await scheduleDailyReminder();
      } else {
        await cancelReminders();
      }
    } catch (error) {
      console.log("Ayar kaydedilemedi.");
      setIsDailyReminderEnabled(!value);
    }
  };
  const handleDeleteAccount = async () => {
    try {
      await deleteUser();
      Alert.alert(t("info"), t("account_deleted"));
    } catch (error: any) {
      const message = error?.message || t("account_delete_error");
      Alert.alert(t("error"), message);
    }
  };

  const confirmDeleteAccount = () => {
    Alert.alert(t("delete_account"), t("delete_account_confirm"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("delete_account_yes"),
        style: "destructive",
        onPress: handleDeleteAccount,
      },
    ]);
  };

  // --- YARDIMCI BİLEŞENLER ---
  const SettingRow = ({
    icon,
    title,
    value,
    onPress,
    isDestructive = false,
    showChevron = true,
  }: any) => (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rowLeft}>
        <MaterialIcons
          name={icon}
          size={24}
          color={isDestructive ? COLORS.danger : COLORS.iconGreen}
        />
        <Text
          style={[styles.rowTitle, isDestructive && { color: COLORS.danger }]}
        >
          {title}
        </Text>
      </View>
      <View style={styles.rowRight}>
        {value && <Text style={styles.rowValue}>{value}</Text>}
        {showChevron && (
          <MaterialIcons name="chevron-right" size={24} color="#525252" />
        )}
      </View>
    </TouchableOpacity>
  );

  const SwitchRow = ({ icon, title, value, onValueChange }: any) => (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <MaterialIcons name={icon} size={24} color={COLORS.iconGreen} />
        <Text style={styles.rowTitle}>{title}</Text>
      </View>
      <Switch
        trackColor={{ false: "#3e3e3e", true: "rgba(43, 238, 121, 0.3)" }}
        thumbColor={value ? COLORS.primary : "#f4f3f4"}
        onValueChange={onValueChange}
        value={value}
      />
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.background}
        translucent={Platform.OS === "android"}
      />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("profile_settings")}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: currentAvatarUrl,
              }}
              contentFit="cover"
              style={styles.avatar}
            />
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setAvatarModalVisible(true)}
            >
              <MaterialIcons name="edit" size={16} color="#000" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user?.fullName}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* --- ÖĞRENME TERCİHLERİ --- */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{t("learning_preferences")}</Text>
          <View style={styles.card}>
            {/* Hedef Dil Seçimi */}
            <SettingRow
              icon="translate"
              title={t("target_language")}
              value={t(
                LANGUAGES.find(
                  (l) => l.code === user?.preferences?.targetLanguage
                )?.labelKey || "lang_english"
              )}
              onPress={() => openModal("target")}
            />
            <View style={styles.divider} />

            <SettingRow
              icon="language"
              title={t("native_language")}
              value={t(
                LANGUAGES.find(
                  (l) => l.code === user?.preferences?.nativeLanguage
                )?.labelKey || "lang_turkish"
              )}
              onPress={() => openModal("native")}
            />
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{t("education_tools")}</Text>
          <View style={styles.card}>
            <SettingRow
              icon="book"
              title={t("my_vocabulary")}
              onPress={() => navigation.navigate("Vocabulary")}
            />
          </View>
        </View>

        {/* --- BİLDİRİMLER --- */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{t("notifications")}</Text>
          <View style={styles.card}>
            <SwitchRow
              icon="notifications"
              title={t("daily_reminder")}
              value={isDailyReminderEnabled}
              onValueChange={toggleDailyReminder}
            />
          </View>
        </View>

        {/* --- HESAP YÖNETİMİ --- */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{t("account_management")}</Text>
          <View style={styles.card}>
            <SettingRow
              icon="lock"
              title={t("change_password")}
              onPress={() => {}}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="logout"
              title={t("logout")}
              isDestructive={true}
              showChevron={false}
              onPress={handleLogout}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="delete-forever"
              title={t("delete_account")}
              isDestructive={true}
              showChevron={false}
              onPress={confirmDeleteAccount}
            />
          </View>
        </View>
      </ScrollView>
      {/* --- AVATAR SEÇİM MODALI --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={avatarModalVisible}
        onRequestClose={() => setAvatarModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { height: "60%" }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("select_avatar")}</Text>
              <TouchableOpacity onPress={() => setAvatarModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={COLORS.textGrey} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={AVATAR_SEEDS}
              keyExtractor={(item) => item}
              numColumns={4} // Yan yana 4 tane
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.avatarOption,
                    user?.avatarId === item && styles.avatarSelected, // Seçili olanı belli et
                  ]}
                  onPress={() => handleSelectAvatar(item)}
                  disabled={loadingAvatar}
                >
                  <Image
                    source={{
                      uri: `https://api.dicebear.com/9.x/avataaars/png?seed=${item}`,
                    }}
                    style={styles.avatarSmall}
                  />
                  {user?.avatarId === item && (
                    <View style={styles.checkBadge}>
                      <MaterialIcons name="check" size={12} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* --- DİL SEÇİM MODALI --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activeSelection === "target"
                  ? t("select_target_language")
                  : t("select_native_language")}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={COLORS.textGrey} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={LANGUAGES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.langOption}
                  onPress={() => handleLanguageSelect(item.code)}
                  disabled={loading}
                >
                  <Text style={styles.langFlag}>{item.flag}</Text>
                  <Text style={styles.langLabel}>{t(item.labelKey)}</Text>
                  {/* Seçili olanı işaretle */}
                  {(activeSelection === "target" &&
                    user?.preferences?.targetLanguage === item.code) ||
                  (activeSelection === "native" &&
                    user?.preferences?.nativeLanguage === item.code) ? (
                    <MaterialIcons
                      name="check"
                      size={24}
                      color={COLORS.primary}
                    />
                  ) : null}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "transparent",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.textWhite },
  scrollContent: { paddingBottom: 40 },
  profileHeader: { alignItems: "center", marginTop: 10, marginBottom: 30 },
  avatarContainer: { position: "relative", marginBottom: 16 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e2e8f0",
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: COLORS.background,
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.textWhite,
    marginBottom: 4,
  },
  userEmail: { fontSize: 16, color: COLORS.textGrey },
  section: { marginBottom: 24, paddingHorizontal: 16 },
  sectionHeader: {
    fontSize: 13,
    fontWeight: "bold",
    color: COLORS.textGrey,
    marginBottom: 10,
    paddingLeft: 8,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    height: 60,
  },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 16 },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  rowTitle: { fontSize: 16, color: COLORS.textWhite, fontWeight: "400" },
  rowValue: { fontSize: 16, color: COLORS.textGrey, fontWeight: "500" },
  divider: { height: 1, backgroundColor: COLORS.borderColor, marginLeft: 56 },

  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: COLORS.modalOverlay,
  },
  modalContent: {
    backgroundColor: COLORS.modalBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "60%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.textWhite },
  langOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  langFlag: { fontSize: 24, marginRight: 16 },
  langLabel: { fontSize: 16, color: COLORS.textWhite, flex: 1 },
  avatarOption: {
    flex: 1,
    alignItems: "center",
    margin: 8,
    padding: 4,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "transparent",
  },
  avatarSelected: {
    borderColor: COLORS.primary, // Seçili olanın etrafı yeşil olsun
    backgroundColor: "rgba(43, 238, 121, 0.1)",
  },
  avatarSmall: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  checkBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.modalBg,
  },
});
