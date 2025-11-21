import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../constants/color";
// Örnek Grafik Verisi (Haftalık)
const WEEKLY_DATA = [
  { day: "Pzt", percent: 40 },
  { day: "Sal", percent: 20 },
  { day: "Çar", percent: 80 },
  { day: "Per", percent: 100 },
  { day: "Cum", percent: 50 },
  { day: "Cmt", percent: 80 },
  { day: "Paz", percent: 20 },
];

// Örnek Son Bildirimler
const RECENT_REPORTS = [
  { id: "1", title: "Restoranda Sipariş Verme", date: "1 gün önce" },
  { id: "2", title: "Otelde Check-in Yapma", date: "3 gün önce" },
  { id: "3", title: "Havaalanında Yön Sorma", date: "5 gün önce" },
];

export default function ProgressScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* --- HEADER --- */}
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* --- PROFİL KARTI --- */}
        <View style={styles.profileSection}>
          <Image
            source={{
              uri:
                "https://api.dicebear.com/9.x/avataaars/png?seed=" +
                (user?.fullName || "Cem"),
            }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.userName}>
              {user?.fullName || "Cem Yılmaz"}
            </Text>
            <Text style={styles.userStatus}>B2 Seviyesine Ulaştın!</Text>
          </View>
        </View>

        {/* --- SEVİYE PROGRESS --- */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardLabel}>Mevcut İngilizce Seviyen: B1</Text>
            <Text style={styles.cardLabel}>65%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: "65%" }]} />
          </View>
          <Text style={styles.helperText}>B2 seviyesine %35 kaldı</Text>
        </View>

        {/* --- İSTATİSTİK GRID --- */}
        <View style={styles.statsGrid}>
          {/* Senaryolar */}
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Tamamlanan Senaryolar</Text>
            <Text style={styles.statValue}>42</Text>
          </View>
          {/* Kelimeler */}
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Öğrenilen Kelimeler</Text>
            <Text style={styles.statValue}>210</Text>
          </View>
          {/* Süre (Tam Genişlik) */}
          <View style={[styles.statCard, { width: "100%" }]}>
            <Text style={styles.statLabel}>Pratik Süresi</Text>
            <Text style={styles.statValue}>12 sa</Text>
          </View>
        </View>

        {/* --- HAFTALIK AKTİVİTE GRAFİĞİ --- */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Haftalık Aktivite</Text>
          <Text style={styles.bigStat}>15 Senaryo</Text>
          <View style={styles.trendRow}>
            <Text style={styles.helperText}>Son 7 Gün</Text>
            <Text style={styles.trendPositive}>+5%</Text>
          </View>

          {/* Grafik Barları */}
          <View style={styles.chartContainer}>
            {WEEKLY_DATA.map((item, index) => (
              <View key={index} style={styles.barWrapper}>
                <View
                  style={[styles.barFill, { height: `${item.percent}%` }]}
                />
                <Text style={styles.barLabel}>{item.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* --- SON GERİ BİLDİRİMLER --- */}
        <Text style={styles.sectionTitle}>Son Geri Bildirimlerin</Text>
        <View style={styles.recentList}>
          {RECENT_REPORTS.map((item) => (
            <TouchableOpacity key={item.id} style={styles.recentItem}>
              <View>
                <Text style={styles.recentTitle}>{item.title}</Text>
                <Text style={styles.recentDate}>{item.date}</Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={COLORS.textGrey}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // Header
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

  // Profile
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

  // General Card
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

  // Progress Bar
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

  // Stats Grid
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

  // Chart
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
    minHeight: 10,
  },
  barLabel: { fontSize: 12, color: COLORS.textGrey, fontWeight: "bold" },

  // Recent Reports
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
