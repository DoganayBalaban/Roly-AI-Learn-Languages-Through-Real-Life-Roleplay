import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {user?.fullName?.charAt(0).toUpperCase() || "U"}
        </Text>
      </View>

      <Text style={styles.name}>{user?.fullName}</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  avatarText: { fontSize: 40, color: "white", fontWeight: "bold" },
  name: { fontSize: 22, fontWeight: "bold", color: "#333" },
  email: { fontSize: 16, color: "#666", marginBottom: 40 },
  logoutButton: {
    backgroundColor: "#ff4444",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  logoutText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
