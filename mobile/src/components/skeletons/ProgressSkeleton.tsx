import React from "react";
import { View, StyleSheet } from "react-native";
import SkeletonItem from "../SkeletonItem";

export default function ProgressSkeleton() {
  return (
    <View style={styles.container}>
      {/* 1. Profil Bölümü */}
      <View style={styles.profileSection}>
        {/* Avatar */}
        <SkeletonItem width={80} height={80} borderRadius={40} />
        <View style={{ marginLeft: 16, flex: 1 }}>
          <SkeletonItem width={150} height={24} style={{ marginBottom: 8 }} />
          <SkeletonItem width={180} height={16} />
        </View>
      </View>

      {/* 2. Seviye Kartı */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <SkeletonItem width={180} height={16} />
          <SkeletonItem width={40} height={16} />
        </View>
        <SkeletonItem
          width={"100%"}
          height={10}
          style={{ marginTop: 12, marginBottom: 8 }}
        />
        <SkeletonItem width={120} height={14} />
      </View>

      {/* 3. İstatistik Grid (2 Küçük, 1 Büyük) */}
      <View style={styles.statsGrid}>
        {/* Sol Küçük Kart */}
        <View style={styles.statCard}>
          <SkeletonItem width={100} height={14} style={{ marginBottom: 12 }} />
          <SkeletonItem width={60} height={32} />
        </View>
        {/* Sağ Küçük Kart */}
        <View style={styles.statCard}>
          <SkeletonItem width={100} height={14} style={{ marginBottom: 12 }} />
          <SkeletonItem width={60} height={32} />
        </View>
        {/* Alt Geniş Kart */}
        <View style={[styles.statCard, { width: "100%" }]}>
          <SkeletonItem width={120} height={14} style={{ marginBottom: 12 }} />
          <SkeletonItem width={80} height={32} />
        </View>
      </View>

      {/* 4. Grafik Kartı */}
      <View style={styles.card}>
        <SkeletonItem width={100} height={14} style={{ marginBottom: 8 }} />
        <SkeletonItem width={140} height={32} style={{ marginBottom: 20 }} />

        {/* Çubuklar (Bars) */}
        <View style={styles.chartRow}>
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <View key={i} style={styles.barWrapper}>
              {/* Rastgele yükseklikte barlar */}
              <SkeletonItem
                width={20}
                height={30 + ((i * 10) % 60)}
                borderRadius={4}
              />
              <SkeletonItem width={16} height={10} style={{ marginTop: 6 }} />
            </View>
          ))}
        </View>
      </View>

      {/* 5. Son Aktiviteler Başlığı ve Listesi */}
      <SkeletonItem
        width={150}
        height={20}
        style={{ marginBottom: 12, marginTop: 8 }}
      />
      <View style={{ gap: 12 }}>
        <SkeletonItem height={70} borderRadius={16} />
        <SkeletonItem height={70} borderRadius={16} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  chartRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 100,
    paddingTop: 10,
  },
  barWrapper: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
});
