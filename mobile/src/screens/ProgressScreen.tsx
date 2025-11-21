import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ProgressScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>📊 İlerleme Raporların Yakında Burada!</Text>
      <Text style={styles.subText}>Toplam Konuşma: 0</Text>
      <Text style={styles.subText}>Öğrenilen Kelimeler: 0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  subText: { fontSize: 14, color: "#666" },
});
