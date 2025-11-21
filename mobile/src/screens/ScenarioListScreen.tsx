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
import { COLORS } from "../constants/color";
// Tasarımdaki Senaryo Listesi
const SCENARIOS = [
  {
    id: "1",
    title: "Havaalanında Check-in",
    role: "Yolcu",
    level: "Orta",
    icon: "flight-takeoff",
  },
  {
    id: "2",
    title: "Kafede Tanışma",
    role: "Müşteri",
    level: "Kolay",
    icon: "local-cafe",
  },
  {
    id: "3",
    title: "İş Görüşmesi",
    role: "Aday",
    level: "Zor",
    icon: "business-center",
  },
  {
    id: "4",
    title: "Market Alışverişi",
    role: "Müşteri",
    level: "Kolay",
    icon: "shopping-cart",
  },
  {
    id: "5",
    title: "Restoranda Sipariş Verme",
    role: "Müşteri",
    level: "Kolay",
    icon: "restaurant",
  },
  {
    id: "6",
    title: "Taksi Çağırma",
    role: "Yolcu",
    level: "Kolay",
    icon: "local-taxi",
  },
];

const FILTERS = ["Tümü", "Kolay", "Orta", "Zor"];

export default function ScenarioListScreen() {
  const navigation = useNavigation<any>();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Tümü");

  // --- FİLTRELEME MANTIĞI ---
  const filteredScenarios = SCENARIOS.filter((item) => {
    // 1. Arama Metni Kontrolü
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchText.toLowerCase());
    // 2. Kategori Filtresi Kontrolü
    const matchesFilter =
      selectedFilter === "Tümü" || item.level === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  // --- SENARYO BAŞLATMA ---
  const handleStartScenario = async (item: any) => {
    setLoadingId(item.id);
    try {
      // Zorluk seviyesini backend formatına çevir (Opsiyonel, backend A1/B1 bekliyorsa maplemek gerekir)
      // Şimdilik direkt gönderiyoruz.
      const response = await api.post("/chat/start", {
        scenario: item.title,
        role: item.role,
        difficultyLevel: item.level,
      });

      const sessionId = response.data._id;
      navigation.navigate("Chat", { sessionId, title: item.title });
    } catch (error) {
      Alert.alert("Hata", "Senaryo başlatılamadı.");
    } finally {
      setLoadingId(null);
    }
  };

  // --- ZORLUK RENGİNİ SEÇME ---
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
      {/* İkon Kutusu */}
      <View style={styles.iconBox}>
        <MaterialIcons
          name={item.icon as any}
          size={32}
          color={COLORS.primary}
        />
      </View>

      {/* Yazılar */}
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

      {/* --- HEADER --- */}
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

      {/* --- SEARCH BAR --- */}
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

      {/* --- FILTER CHIPS --- */}
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
                  : { color: COLORS.textGrey }, // Aktifse beyaz, pasifse gri yapıldı
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* --- LIST --- */}
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

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textWhite,
  },
  iconButton: {
    padding: 8,
  },

  // Search Bar
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBg,
    height: 50,
    borderRadius: 25, // Tam yuvarlak kenarlar
  },
  searchInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 12,
    color: COLORS.textWhite,
    fontSize: 16,
  },

  // Filters
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
  chipActive: {
    backgroundColor: COLORS.chipActive, // HTML'deki primary/20
  },
  chipInactive: {
    backgroundColor: COLORS.chipInactive, // HTML'deki koyu gri
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
  },

  // Card List
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBg,
    borderRadius: 24, // HTML'deki lg/xl rounded yapısına uygun
    padding: 16,
    marginBottom: 12,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16, // Hafif karemsi yuvarlak
    backgroundColor: COLORS.chipActive, // İkon arka planı (silik yeşil)
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textWhite,
  },
  levelText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
