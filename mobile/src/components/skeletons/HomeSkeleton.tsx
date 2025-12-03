import React from "react";
import { View, StyleSheet } from "react-native";
import SkeletonItem from "../SkeletonItem";

export default function HomeSkeleton() {
  return (
    <View style={styles.container}>
      {/* Header: Yazılar ve Avatar */}
      <View style={styles.header}>
        <View>
          <SkeletonItem width={150} height={24} style={{ marginBottom: 8 }} />
          <SkeletonItem width={220} height={16} />
        </View>
        <SkeletonItem width={50} height={50} borderRadius={25} />
      </View>

      {/* Streak Bar (Varsa) */}
      <SkeletonItem
        height={60}
        borderRadius={20}
        style={{ marginBottom: 24 }}
      />

      {/* Son Pratik Kartı (Büyük) */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <SkeletonItem width={120} height={16} />
          <SkeletonItem width={24} height={24} borderRadius={12} />
        </View>
        <View style={styles.cardBody}>
          <SkeletonItem width={48} height={48} borderRadius={12} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <SkeletonItem
              width={"80%"}
              height={20}
              style={{ marginBottom: 8 }}
            />
            <SkeletonItem width={"100%"} height={6} />
          </View>
        </View>
      </View>

      {/* Büyük Buton */}
      <SkeletonItem
        height={56}
        borderRadius={28}
        style={{ marginBottom: 24 }}
      />

      {/* Liste Öğeleri */}
      <View style={{ gap: 16 }}>
        <SkeletonItem height={80} borderRadius={16} />
        <SkeletonItem height={80} borderRadius={16} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    marginTop: 10,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardBody: {
    flexDirection: "row",
    alignItems: "center",
  },
});
