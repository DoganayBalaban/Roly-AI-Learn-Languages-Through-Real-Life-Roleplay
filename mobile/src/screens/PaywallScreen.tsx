import React, { useState, useEffect } from "react";
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

// REVENUECAT IMPORTLARI
import Purchases, { PurchasesPackage } from "react-native-purchases";

// Renkler
import { COLORS } from "../constants/color";

const FEATURES = [
  { icon: "lock-open", text: "Tüm Senaryoların Kilidini Aç" },
  { icon: "record-voice-over", text: "Sınırsız Sesli Konuşma" },
  { icon: "analytics", text: "Detaylı Gramer & Hata Analizi" },
  { icon: "block", text: "Reklamsız Deneyim" },
];

export default function PaywallScreen() {
  const navigation = useNavigation();
  const { user, updateUser } = useAuth();

  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selectedPackage, setSelectedPackage] =
    useState<PurchasesPackage | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true); // Sayfa ilk açılış yüklemesi

  // 1. Ürünleri RevenueCat'ten Çek
  useEffect(() => {
    const getOfferings = async () => {
      try {
        const offerings = await Purchases.getOfferings();
        // 'current' offering RevenueCat panelinde varsayılan olandır
        if (
          offerings.current !== null &&
          offerings.current.availablePackages.length !== 0
        ) {
          setPackages(offerings.current.availablePackages);
          // Varsayılan olarak Yıllık paketi seç (Genelde en karlı olandır)
          // Package ID'si içinde 'year' veya 'annual' geçeni bulmaya çalışabilirsin, şimdilik ilkini seçelim
          setSelectedPackage(offerings.current.availablePackages[0]);
        }
      } catch (e: any) {
        Alert.alert("Hata", "Ürünler yüklenemedi: " + e.message);
      } finally {
        setPageLoading(false);
      }
    };
    getOfferings();
  }, []);

  // 2. Satın Alma Fonksiyonu
  const handleSubscribe = async () => {
    if (!selectedPackage) return;
    setLoading(true);
    try {
      // Satın alımı başlat
      const { customerInfo } = await Purchases.purchasePackage(selectedPackage);

      // 'premium_access' bizim RevenueCat'te oluşturacağımız yetki (Entitlement) adı
      if (
        typeof customerInfo.entitlements.active["premium_access"] !==
        "undefined"
      ) {
        await activatePremium();
      }
    } catch (e: any) {
      if (!e.userCancelled) {
        Alert.alert("Hata", e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // 3. Restore (Eski Satın Alımı Geri Yükle)
  const handleRestore = async () => {
    setLoading(true);
    try {
      const restore = await Purchases.restorePurchases();
      if (restore.entitlements.active["premium_access"]) {
        await activatePremium();
        Alert.alert("Başarılı", "Üyeliğin geri yüklendi! 🎉");
      } else {
        Alert.alert("Bilgi", "Aktif bir üyelik bulunamadı.");
      }
    } catch (e: any) {
      Alert.alert("Hata", "Geri yükleme başarısız.");
    } finally {
      setLoading(false);
    }
  };

  // Yardımcı Fonksiyon: Backend'i ve Uygulamayı Güncelle
  const activatePremium = async () => {
    try {
      // Backend'e haber ver
      await api.post("/auth/upgrade");
      // Uygulamayı güncelle (Anlık kilitleri açar)
      if (user) {
        updateUser({ ...user, isPremium: true });
      }
      navigation.goBack();
    } catch (error) {
      console.log("Backend sync error");
    }
  };

  if (pageLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={COLORS.gold} />
        <Text style={{ color: "white", marginTop: 10 }}>
          Mağazaya bağlanılıyor...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

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
        <View style={styles.header}>
          <MaterialCommunityIcons name="crown" size={64} color={COLORS.gold} />
          <Text style={styles.title}>
            RolyAI <Text style={{ color: COLORS.gold }}>Premium</Text>
          </Text>
          <Text style={styles.subtitle}>Sınırları kaldır, akıcı konuş.</Text>
        </View>

        <View style={styles.featuresContainer}>
          {FEATURES.map((item, index) => (
            <View key={index} style={styles.featureRow}>
              <MaterialIcons
                name="check"
                size={20}
                color={COLORS.gold}
                style={{ marginRight: 10 }}
              />
              <Text style={styles.featureText}>{item.text}</Text>
            </View>
          ))}
        </View>

        {/* DİNAMİK PAKET LİSTESİ */}
        <View style={styles.plansContainer}>
          {packages.length > 0 ? (
            packages.map((pkg) => {
              const isSelected = selectedPackage?.identifier === pkg.identifier;
              const isYearly =
                pkg.product.title.toLowerCase().includes("year") ||
                pkg.product.title.toLowerCase().includes("yıllık");

              return (
                <TouchableOpacity
                  key={pkg.identifier}
                  style={[styles.planCard, isSelected && styles.selectedPlan]}
                  onPress={() => setSelectedPackage(pkg)}
                  activeOpacity={0.9}
                >
                  <View style={styles.planHeader}>
                    {/* Ürün başlığını temizle (Google bazen "App Name (App)" ekler) */}
                    <Text style={styles.planTitle}>
                      {isYearly ? "Yıllık Plan" : "Aylık Plan"}
                    </Text>
                    {isYearly && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>EN POPÜLER</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.planPrice}>
                    {pkg.product.priceString}
                  </Text>
                  <Text style={styles.planSub}>{pkg.product.description}</Text>

                  <View style={styles.radioCircle}>
                    {isSelected && <View style={styles.radioFill} />}
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={{ color: "white", textAlign: "center" }}>
              Ürün bulunamadı. (Mağaza yapılandırmasını kontrol edin)
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.subscribeButton}
          onPress={handleSubscribe}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.background} />
          ) : (
            <Text style={styles.subscribeText}>Abone Ol</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
          <Text style={styles.restoreText}>Satın Alımları Geri Yükle</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Abonelik otomatik olarak yenilenir. Mağaza ayarlarından iptal
          edilebilir.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// Stillerin çoğu aynı kalabilir, sadece ufak düzenlemeler:
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
  header: { alignItems: "center", marginTop: 20, marginBottom: 30 },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.textWhite,
    marginTop: 10,
  },
  subtitle: { fontSize: 16, color: COLORS.textGrey, marginTop: 5 },
  featuresContainer: { marginBottom: 30 },
  featureRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  featureText: { fontSize: 16, color: COLORS.textWhite, fontWeight: "500" },
  plansContainer: { gap: 12, marginBottom: 30 },
  planCard: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 16,
    padding: 20,
  },
  selectedPlan: {
    borderColor: COLORS.gold,
    backgroundColor: "rgba(255, 215, 0, 0.05)",
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
  badgeText: { fontSize: 10, fontWeight: "bold", color: COLORS.background },
  planPrice: { fontSize: 24, fontWeight: "bold", color: COLORS.textWhite },
  planSub: { fontSize: 14, color: COLORS.textGrey, marginTop: 4 },
  radioCircle: {
    position: "absolute",
    right: 20,
    top: "50%",
    marginTop: -10,
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
  subscribeButton: {
    backgroundColor: COLORS.gold,
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 15,
  },
  subscribeText: { fontSize: 18, fontWeight: "bold", color: COLORS.background },
  restoreButton: { alignSelf: "center", marginBottom: 20, padding: 10 },
  restoreText: {
    color: COLORS.textGrey,
    fontSize: 14,
    textDecorationLine: "underline",
  },
  footerText: {
    fontSize: 11,
    color: "#52525b",
    textAlign: "center",
    lineHeight: 16,
  },
});
