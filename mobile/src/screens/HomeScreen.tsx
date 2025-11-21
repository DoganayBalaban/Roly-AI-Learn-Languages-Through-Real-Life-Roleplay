import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { useNavigation } from "@react-navigation/native";

// Sabit Senaryolar (İstersen bunları da backendden çekebilirsin ama şimdilik böyle hızlı olur)
const SCENARIOS = [
  {
    id: "1",
    title: "Paris Cafe",
    role: "Grumpy Waiter",
    level: "A2",
    icon: "☕",
  },
  {
    id: "2",
    title: "Job Interview",
    role: "Strict HR Manager",
    level: "B2",
    icon: "💼",
  },
  {
    id: "3",
    title: "Airport Check-in",
    role: "Helpful Staff",
    level: "B1",
    icon: "✈️",
  },
  {
    id: "4",
    title: "Grocery Store",
    role: "Chatty Cashier",
    level: "A1",
    icon: "🍎",
  },
  {
    id: "5",
    title: "Hotel Reception",
    role: "Polite Receptionist",
    level: "A2",
    icon: "🏨",
  },
  {
    id: "6",
    title: "Doctor Appointment",
    role: "Busy Doctor",
    level: "B1",
    icon: "🩺",
  },
  {
    id: "7",
    title: "Tech Support Call",
    role: "Patient Technician",
    level: "B2",
    icon: "💻",
  },
  {
    id: "8",
    title: "Subway Ticket Purchase",
    role: "Uninterested Clerk",
    level: "A1",
    icon: "🚇",
  },
  {
    id: "9",
    title: "Restaurant Reservation",
    role: "Professional Host",
    level: "A2",
    icon: "🍽️",
  },
  {
    id: "10",
    title: "Clothing Store",
    role: "Friendly Salesperson",
    level: "A2",
    icon: "👕",
  },
  {
    id: "11",
    title: "Phone Repair Shop",
    role: "Sarcastic Technician",
    level: "B1",
    icon: "📱",
  },
  {
    id: "12",
    title: "Library Inquiry",
    role: "Quiet Librarian",
    level: "A2",
    icon: "📚",
  },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStartScenario = async (item: any) => {
    setLoadingId(item.id);
    try {
      // 1. Backend'de oturumu başlat
      const response = await api.post("/chat/start", {
        scenario: item.title,
        role: item.role,
        difficultyLevel: item.level,
      });

      // 2. Session ID'yi al
      const sessionId = response.data._id;

      // 3. Chat ekranına yönlendir ve ID'yi gönder
      navigation.navigate("Chat", { sessionId, title: item.title });
    } catch (error) {
      Alert.alert("Hata", "Senaryo başlatılamadı.");
    } finally {
      setLoadingId(null);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleStartScenario(item)}
      disabled={!!loadingId}
    >
      <Text style={styles.cardIcon}>{item.icon}</Text>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>
          {item.role} • {item.level}
        </Text>
      </View>
      {loadingId === item.id && <ActivityIndicator color="#007AFF" />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Merhaba, {user?.fullName}</Text>
      </View>

      <Text style={styles.sectionTitle}>Bir senaryo seç:</Text>

      <FlatList
        data={SCENARIOS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  welcomeText: { fontSize: 18, fontWeight: "bold", color: "#333" },
  logoutButton: { padding: 8, backgroundColor: "#ffcccc", borderRadius: 8 },
  logoutText: { color: "#d9534f", fontWeight: "600" },
  sectionTitle: { fontSize: 16, color: "#666", marginBottom: 10 },
  list: { paddingBottom: 20 },
  card: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    marginBottom: 15,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  cardIcon: { fontSize: 30, marginRight: 15 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  cardSubtitle: { color: "#888", marginTop: 4 },
});
