import React from "react";
import { View, StyleSheet } from "react-native";
import SkeletonItem from "../SkeletonItem";

export default function VocabSkeleton() {
  // 5 tane liste elemanı tekrarla
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((key) => (
        <View key={key} style={styles.card}>
          <View style={styles.row}>
            <SkeletonItem width={100} height={20} />
            <SkeletonItem width={24} height={24} borderRadius={12} />
          </View>
          <SkeletonItem width={150} height={16} style={{ marginTop: 8 }} />
          <SkeletonItem
            width={"100%"}
            height={14}
            style={{ marginTop: 12, opacity: 0.6 }}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
