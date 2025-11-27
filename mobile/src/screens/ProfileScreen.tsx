import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Switch,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import { scheduleDailyReminder, cancelReminders } from "../utils/notifications";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { COLORS } from "../constants/color";

// Seçilebilir Diller Listesi
const LANGUAGES = [
  { code: "Turkish", label: "Türkçe", flag: "🇹🇷" },
  { code: "English", label: "İngilizce", flag: "🇬🇧" },
  { code: "Spanish", label: "İspanyolca", flag: "🇪🇸" },
  { code: "German", label: "Almanca", flag: "🇩🇪" },
  { code: "French", label: "Fransızca", flag: "🇫🇷" },
  { code: "Italian", label: "İtalyanca", flag: "🇮🇹" },
  { code: "Japanese", label: "Japonca", flag: "🇯🇵" },
  { code: "Korean", label: "Korece", flag: "🇰🇷" },
  { code: "Russian", label: "Rusça", flag: "🇷🇺" },
];

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, logout, updateUser } = useAuth();

  // Modal State'leri
  const [modalVisible, setModalVisible] = useState(false);
  const [activeSelection, setActiveSelection] = useState<
    "target" | "native" | null
  >(null);
  const [loading, setLoading] = useState(false);

  const [isDailyReminderEnabled, setIsDailyReminderEnabled] = useState(false);
  const [isWeeklySummaryEnabled, setIsWeeklySummaryEnabled] = useState(false);

  // --- DİL DEĞİŞTİRME FONKSİYONU ---
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
      Alert.alert("Hata", "Dil güncellenemedi.");
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
    Alert.alert("Çıkış Yap", "Hesabından çıkış yapmak istediğine emin misin?", [
      { text: "İptal", style: "cancel" },
      { text: "Çıkış Yap", style: "destructive", onPress: () => logout() },
    ]);
  };

  const toggleDailyReminder = async (value: boolean) => {
    setIsDailyReminderEnabled(value);

    if (value) {
      // Açıldıysa kur
      await scheduleDailyReminder();
    } else {
      // Kapandıysa iptal et
      await cancelReminders();
    }
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil ve Ayarlar</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri:
                  "https://api.dicebear.com/9.x/avataaars/png?seed=" +
                  (user?.fullName || "Elif"),
              }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editButton}>
              <MaterialIcons name="edit" size={16} color="#000" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user?.fullName}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* --- ÖĞRENME TERCİHLERİ --- */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>ÖĞRENME TERCİHLERİ</Text>
          <View style={styles.card}>
            {/* Hedef Dil Seçimi */}
            <SettingRow
              icon="translate"
              title="Hedef Dil"
              value={
                LANGUAGES.find(
                  (l) => l.code === user?.preferences?.targetLanguage
                )?.label || user?.preferences?.targetLanguage
              }
              onPress={() => openModal("target")}
            />
            <View style={styles.divider} />

            <SettingRow
              icon="language"
              title="Ana Dil"
              value={
                LANGUAGES.find(
                  (l) => l.code === user?.preferences?.nativeLanguage
                )?.label || user?.preferences?.nativeLanguage
              }
              onPress={() => openModal("native")}
            />
          </View>
        </View>

        {/* --- BİLDİRİMLER --- */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>BİLDİRİMLER</Text>
          <View style={styles.card}>
            <SwitchRow
              icon="notifications"
              title="Günlük Hatırlatıcı"
              value={isDailyReminderEnabled}
              onValueChange={toggleDailyReminder}
            />
            <View style={styles.divider} />
            <SwitchRow
              icon="event"
              title="Haftalık Özet"
              value={isWeeklySummaryEnabled}
              onValueChange={setIsWeeklySummaryEnabled}
            />
          </View>
        </View>

        {/* --- HESAP YÖNETİMİ --- */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>HESAP YÖNETİMİ</Text>
          <View style={styles.card}>
            <SettingRow
              icon="lock"
              title="Parolayı Değiştir"
              onPress={() => {}}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="logout"
              title="Çıkış Yap"
              isDestructive={true}
              showChevron={false}
              onPress={handleLogout}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="delete-forever"
              title="Hesabı Sil"
              isDestructive={true}
              showChevron={false}
              onPress={() =>
                Alert.alert("Hesap Sil", "Bu işlem geri alınamaz.")
              }
            />
          </View>
        </View>
      </ScrollView>

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
                {activeSelection === "target" ? "Hedef Dil Seç" : "Ana Dil Seç"}
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
                  <Text style={styles.langLabel}>{item.label}</Text>
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
    </SafeAreaView>
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
});
