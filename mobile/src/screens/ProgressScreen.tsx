import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { COLORS } from "../constants/color";
import ProgressSkeleton from "../components/skeletons/ProgressSkeleton";

// Tarihi formatla (Örn: "2 gün önce")
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Bugün";
  if (diffDays === 1) return "Dün";
  return `${diffDays} gün önce`;
};

export default function ProgressScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  // Ekran her odaklandığında veriyi yenile
  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  const fetchStats = async () => {
    try {
      const res = await api.get("/auth/stats"); // Backend route'unu buraya bağladık
      setStats(res.data);
    } catch (error) {
      console.log("Stats fetch error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.background}
        translucent={Platform.OS === "android"}
      />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>İlerleme Raporum</Text>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="settings" size={24} color={COLORS.textWhite} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ProgressSkeleton />
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* --- PROFİL KARTI --- */}
          <View style={styles.profileSection}>
            <Image
              source={{
                uri:
                  "https://api.dicebear.com/9.x/avataaars/png?seed=" +
                  user?.avatarId,
              }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.userName}>{user?.fullName}</Text>
              <Text style={styles.userStatus}>
                {stats?.level.current} Seviyesine Ulaştın!
              </Text>
            </View>
          </View>

          {/* --- SEVİYE PROGRESS --- */}
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.cardLabel}>
                Mevcut İngilizce Seviyen: {stats?.level.current}
              </Text>
              <Text style={styles.cardLabel}>
                {Math.round(stats?.level.progress)}%
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${stats?.level.progress}%` },
                ]}
              />
            </View>
            <Text style={styles.helperText}>
              {stats?.level.next} seviyesine %
              {100 - Math.round(stats?.level.progress)} kaldı
            </Text>
          </View>

          {/* --- İSTATİSTİK GRID --- */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Tamamlanan Senaryolar</Text>
              <Text style={styles.statValue}>
                {stats?.stats.completedSessions}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Öğrenilen Kelimeler</Text>
              <Text style={styles.statValue}>{stats?.stats.learnedWords}</Text>
            </View>
            <View style={[styles.statCard, { width: "100%" }]}>
              <Text style={styles.statLabel}>Pratik Süresi (Tahmini)</Text>
              <Text style={styles.statValue}>
                {stats?.stats.practiceHours} sa
              </Text>
            </View>
          </View>

          {/* --- HAFTALIK AKTİVİTE GRAFİĞİ --- */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Haftalık Aktivite</Text>
            <Text style={styles.bigStat}>
              {stats?.stats.weeklyCount} Senaryo
            </Text>
            <View style={styles.trendRow}>
              <Text style={styles.helperText}>Son 7 Gün</Text>
              {/* Burası statik kalabilir veya önceki haftaya göre hesaplanabilir */}
              <Text style={styles.trendPositive}>Aktif</Text>
            </View>

            <View style={styles.chartContainer}>
              {stats?.chart.map((item: any, index: number) => (
                <View key={index} style={styles.barWrapper}>
                  {/* Barın yüksekliği dinamik */}
                  <View
                    style={[
                      styles.barFill,
                      { height: `${Math.max(item.percent, 5)}%` },
                    ]}
                  />
                  <Text style={styles.barLabel}>{item.day}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* --- SON GERİ BİLDİRİMLER --- */}
          <Text style={styles.sectionTitle}>Son Geri Bildirimlerin</Text>
          <View style={styles.recentList}>
            {stats?.recentReports.length > 0 ? (
              stats?.recentReports.map((item: any) => (
                <TouchableOpacity
                  key={item._id}
                  style={styles.recentItem}
                  // Tıklayınca o raporun detayına (Chat geçmişine) gidebiliriz
                  onPress={() =>
                    navigation.navigate("Chat", {
                      sessionId: item._id,
                      title: item.scenario,
                    })
                  }
                >
                  <View>
                    <Text style={styles.recentTitle}>{item.scenario}</Text>
                    <Text style={styles.recentDate}>
                      {formatDate(item.updatedAt)}
                    </Text>
                  </View>
                  <MaterialIcons
                    name="chevron-right"
                    size={24}
                    color={COLORS.textGrey}
                  />
                </TouchableOpacity>
              ))
            ) : (
              <Text style={{ color: COLORS.textGrey, fontStyle: "italic" }}>
                Henüz tamamlanmış bir rapor yok.
              </Text>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.textWhite },
  scrollContent: { padding: 16, paddingBottom: 40 },

  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#e2e8f0",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.textWhite,
    marginBottom: 4,
  },
  userStatus: { fontSize: 16, color: COLORS.textGrey },

  card: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.borderColor,
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardLabel: { fontSize: 14, color: COLORS.textWhite, fontWeight: "600" },

  progressBarBg: {
    height: 10,
    backgroundColor: "#334155",
    borderRadius: 5,
    width: "100%",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 5,
  },
  helperText: { fontSize: 14, color: COLORS.textGrey },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.borderColor,
    borderWidth: 1,
    padding: 16,
    borderRadius: 16,
  },
  statLabel: { fontSize: 13, color: COLORS.textGrey, marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: "bold", color: COLORS.textWhite },

  bigStat: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.textWhite,
    marginTop: 4,
  },
  trendRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  trendPositive: { color: COLORS.primary, fontWeight: "bold" },

  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 160,
    paddingTop: 20,
  },
  barWrapper: {
    alignItems: "center",
    width: "10%",
    height: "100%",
    justifyContent: "flex-end",
    gap: 8,
  },
  barFill: {
    width: "100%",
    backgroundColor: COLORS.barBg,
    borderRadius: 20,
    minHeight: 5,
  },
  barLabel: { fontSize: 12, color: COLORS.textGrey, fontWeight: "bold" },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textWhite,
    marginBottom: 12,
    marginTop: 8,
  },
  recentList: { gap: 12 },
  recentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.borderColor,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textWhite,
    marginBottom: 4,
  },
  recentDate: { fontSize: 13, color: COLORS.textGrey },
});
