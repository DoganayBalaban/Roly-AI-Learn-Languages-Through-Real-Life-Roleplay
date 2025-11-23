import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  StatusBar,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { NAMES } from "../constants/name";
import { COLORS } from "../constants/color";
import { SCENARIOS } from "../constants/scenarios";

const FILTERS = ["Tümü", "Kolay", "Orta", "Zor"];

export default function ScenarioListScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth(); // Kullanıcının hedef dilini almak için
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Tümü");

  // Filtreleme Mantığı
  const filteredScenarios = SCENARIOS.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesFilter =
      selectedFilter === "Tümü" || item.level === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  // --- RASTGELE İSİM SEÇİCİ ---
  const getRandomName = () => {
    // Kullanıcının hedef dili varsa o dilden, yoksa İngilizce/Default havuzdan seç
    const targetLang = user?.preferences?.targetLanguage || "English";
    // @ts-ignore (TypeScript key kontrolü için basit bypass)
    const nameList = NAMES[targetLang] || NAMES["Default"];

    const randomIndex = Math.floor(Math.random() * nameList.length);
    return nameList[randomIndex];
  };

  // --- SENARYO BAŞLATMA ---
  const handleStartScenario = async (item: any) => {
    setLoadingId(item.id);
    try {
      // 1. Rastgele bir isim seç (Örn: "Jessica")
      const botName = getRandomName();
      const targetLang = user?.preferences?.targetLanguage || "English";
      // 2. Backend'e gönderilecek veriyi hazırla
      // DİKKAT: Botun rolünü (Garson vb.) unutmaması için senaryo başlığına ekliyoruz.
      // Ama Chat ekranında sadece "Jessica" ismi görünecek.
      const payload = {
        scenario: item.title,
        role: botName,
        difficultyLevel: item.level,
        roleDescription: item.role,
        targetLanguage: targetLang,
      };

      const response = await api.post("/chat/start", payload);

      const sessionId = response.data._id;
      // Chat ekranına yönlendir
      navigation.navigate("Chat", { sessionId, title: item.title });
    } catch (error) {
      Alert.alert("Hata", "Senaryo başlatılamadı.");
    } finally {
      setLoadingId(null);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Kolay":
        return COLORS.levelEasy;
      case "Orta":
        return COLORS.levelMedium;
      case "Zor":
        return COLORS.levelHard;
      default:
        return COLORS.textGrey;
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleStartScenario(item)}
      disabled={!!loadingId}
    >
      <View style={styles.iconBox}>
        <MaterialIcons
          name={item.icon as any}
          size={32}
          color={COLORS.primary}
        />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={[styles.levelText, { color: getLevelColor(item.level) }]}>
          {item.level}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Senaryolar</Text>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="settings" size={24} color={COLORS.textWhite} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialIcons
            name="search"
            size={24}
            color={COLORS.textGrey}
            style={{ marginLeft: 15 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Senaryo ara..."
            placeholderTextColor={COLORS.textGrey}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.chip,
              selectedFilter === filter
                ? styles.chipActive
                : styles.chipInactive,
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text
              style={[
                styles.chipText,
                selectedFilter === filter
                  ? { color: COLORS.textWhite }
                  : { color: COLORS.textGrey },
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filteredScenarios}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.textWhite },
  iconButton: { padding: 8 },
  searchContainer: { paddingHorizontal: 16, marginBottom: 12 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBg,
    height: 50,
    borderRadius: 25,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 12,
    color: COLORS.textWhite,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 12,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  chipActive: { backgroundColor: COLORS.chipActive },
  chipInactive: { backgroundColor: COLORS.chipInactive },
  chipText: { fontSize: 14, fontWeight: "500" },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.chipActive,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardContent: { flex: 1, justifyContent: "center", gap: 4 },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: COLORS.textWhite },
  levelText: { fontSize: 14, fontWeight: "500" },
});
