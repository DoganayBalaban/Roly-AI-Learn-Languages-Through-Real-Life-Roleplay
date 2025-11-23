import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { COLORS } from "../constants/color";
// Özellik Listesi
const FEATURES = [
  { icon: "lock-open", text: "Tüm Senaryoların Kilidini Aç" },
  { icon: "record-voice-over", text: "Sınırsız Sesli Konuşma" },
  { icon: "analytics", text: "Detaylı Gramer & Hata Analizi" },
  { icon: "save", text: "Sınırsız Kelime Kaydetme" },
  { icon: "block", text: "Reklamsız Deneyim" },
];

export default function PaywallScreen() {
  const navigation = useNavigation();
  const { updateUser } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">(
    "yearly"
  );
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      // 1. Ödeme Simülasyonu (2 saniye bekle)
      setTimeout(async () => {
        // 2. Backend'e haber ver
        const response = await api.post("/auth/upgrade");

        // 3. Kullanıcıyı güncelle (Context)
        updateUser(response.data.user);

        Alert.alert(
          "Tebrikler! 🌟",
          "Premium üyeliğin başarıyla aktif edildi.",
          [{ text: "Tamam", onPress: () => navigation.goBack() }]
        );
        setLoading(false);
      }, 2000);
    } catch (error) {
      Alert.alert("Hata", "Ödeme işlemi başarısız oldu.");
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* KAPAT BUTONU */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <MaterialIcons name="close" size={28} color={COLORS.textGrey} />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* BAŞLIK & İKON */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="crown"
              size={64}
              color={COLORS.gold}
            />
          </View>
          <Text style={styles.title}>
            RolyAI <Text style={{ color: COLORS.gold }}>Premium</Text>
          </Text>
          <Text style={styles.subtitle}>Dil öğrenme sınırlarını kaldır.</Text>
        </View>

        {/* ÖZELLİKLER LİSTESİ */}
        <View style={styles.featuresContainer}>
          {FEATURES.map((item, index) => (
            <View key={index} style={styles.featureRow}>
              <View style={styles.checkIcon}>
                <MaterialIcons
                  name="check"
                  size={16}
                  color={COLORS.background}
                />
              </View>
              <Text style={styles.featureText}>{item.text}</Text>
            </View>
          ))}
        </View>

        {/* PLAN SEÇİMİ */}
        <View style={styles.plansContainer}>
          {/* Yıllık Plan */}
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === "yearly" && styles.selectedPlan,
            ]}
            onPress={() => setSelectedPlan("yearly")}
            activeOpacity={0.9}
          >
            <View style={styles.planHeader}>
              <Text style={styles.planTitle}>Yıllık</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>%40 İndirim</Text>
              </View>
            </View>
            <Text style={styles.planPrice}>
              ₺499.99 <Text style={styles.planPeriod}>/ yıl</Text>
            </Text>
            <Text style={styles.planSub}>Ayda sadece ₺41.66</Text>

            {/* Seçili İkonu */}
            <View style={styles.radioCircle}>
              {selectedPlan === "yearly" && <View style={styles.radioFill} />}
            </View>
          </TouchableOpacity>

          {/* Aylık Plan */}
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === "monthly" && styles.selectedPlan,
            ]}
            onPress={() => setSelectedPlan("monthly")}
            activeOpacity={0.9}
          >
            <View style={styles.planHeader}>
              <Text style={styles.planTitle}>Aylık</Text>
            </View>
            <Text style={styles.planPrice}>
              ₺69.99 <Text style={styles.planPeriod}>/ ay</Text>
            </Text>
            <Text style={styles.planSub}>İstediğin zaman iptal et</Text>

            <View style={styles.radioCircle}>
              {selectedPlan === "monthly" && <View style={styles.radioFill} />}
            </View>
          </TouchableOpacity>
        </View>

        {/* ABONE OL BUTONU */}
        <TouchableOpacity
          style={styles.subscribeButton}
          onPress={handleSubscribe}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.background} />
          ) : (
            <Text style={styles.subscribeText}>Hemen Başla</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Ödeme, onay işleminden sonra iTunes/Play Store hesabınızdan tahsil
          edilecektir. Abonelik, dönem bitiminden 24 saat önce iptal edilmezse
          otomatik yenilenir.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 24, paddingBottom: 40 },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },

  // Header
  header: { alignItems: "center", marginTop: 40, marginBottom: 30 },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.goldLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 32, fontWeight: "bold", color: COLORS.textWhite },
  subtitle: { fontSize: 16, color: COLORS.textGrey, marginTop: 8 },

  // Features
  featuresContainer: { marginBottom: 30 },
  featureRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.gold,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  featureText: { fontSize: 16, color: COLORS.textWhite, fontWeight: "500" },

  // Plans
  plansContainer: { gap: 12, marginBottom: 30 },
  planCard: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 16,
    padding: 20,
    position: "relative",
  },
  selectedPlan: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.goldLight,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  planTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.textWhite },
  badge: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: { fontSize: 12, fontWeight: "bold", color: COLORS.background },
  planPrice: { fontSize: 24, fontWeight: "bold", color: COLORS.textWhite },
  planPeriod: { fontSize: 16, color: COLORS.textGrey, fontWeight: "normal" },
  planSub: { fontSize: 14, color: COLORS.textGrey, marginTop: 4 },

  radioCircle: {
    position: "absolute",
    right: 20,
    top: "50%",
    marginTop: -10, // Ortalamak için
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.textGrey,
    justifyContent: "center",
    alignItems: "center",
  },
  radioFill: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.gold,
  },

  // Button
  subscribeButton: {
    backgroundColor: COLORS.gold,
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  subscribeText: { fontSize: 18, fontWeight: "bold", color: COLORS.background },
  footerText: {
    fontSize: 12,
    color: "#52525b",
    textAlign: "center",
    lineHeight: 18,
  },
});
