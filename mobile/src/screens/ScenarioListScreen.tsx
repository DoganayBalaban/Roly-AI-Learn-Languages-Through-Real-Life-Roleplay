import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Animated,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../constants/color";
import { NAMES } from "../constants/name";
import { SCENARIOS } from "../constants/scenarios";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function ScenarioListScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { user } = useAuth(); // Kullanıcının hedef dilini almak için
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  // Her item için ayrı animasyon değerleri tutmak için Map
  const scaleAnims = useRef<Map<string, Animated.Value>>(new Map()).current;

  // Her item için animasyon değeri al veya oluştur
  const getScaleAnim = (itemId: string) => {
    if (!scaleAnims.has(itemId)) {
      scaleAnims.set(itemId, new Animated.Value(1));
    }
    return scaleAnims.get(itemId)!;
  };

  const FILTERS = [
    { key: "all", label: t("all") },
    { key: "easy", label: t("easy") },
    { key: "medium", label: t("medium") },
    { key: "hard", label: t("hard") },
  ];

  // Filtreleme Mantığı
  const filteredScenarios = SCENARIOS.filter((item) => {
    const translatedTitle = t(item.titleKey);
    const matchesSearch = translatedTitle
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesFilter =
      selectedFilter === "all" || item.levelKey === selectedFilter;
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
      if (item.isPremium && !user?.isPremium) {
        Alert.alert(t("premium_lock") + " 💎", t("premium_alert"), [
          { text: t("cancel"), style: "cancel" },
          {
            text: t("buy_premium"),
            onPress: () => navigation.navigate("Paywall"),
          },
        ]);
        return;
      }
      // 1. Rastgele bir isim seç (Örn: "Jessica")
      const botName = getRandomName();
      const targetLang = user?.preferences?.targetLanguage || "English";
      // 2. Backend'e gönderilecek veriyi hazırla
      const translatedTitle = t(item.titleKey);
      const translatedRole = t(item.roleKey);

      const payload = {
        scenario: translatedTitle,
        role: botName,
        difficultyLevel: t(item.levelKey),
        roleDescription: translatedRole,
        targetLanguage: targetLang,
      };

      const response = await api.post("/chat/start", payload);

      const sessionId = response.data._id;
      // Chat ekranına yönlendir
      navigation.navigate("Chat", { sessionId, title: translatedTitle });
    } catch (error) {
      Alert.alert(t("error"), t("scenario_start_error"));
    } finally {
      setLoadingId(null);
    }
  };

  const getLevelColor = (levelKey: string) => {
    switch (levelKey) {
      case "easy":
        return COLORS.levelEasy;
      case "medium":
        return COLORS.levelMedium;
      case "hard":
        return COLORS.levelHard;
      default:
        return COLORS.textGrey;
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const scaleAnim = getScaleAnim(item.id);

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[
            styles.card,
            // Premium ve kilitli ise biraz soluk gösterelim
            item.isPremium && !user?.isPremium && { opacity: 0.7 },
          ]}
          onPress={() => handleStartScenario(item)}
          onPressIn={() =>
            Animated.spring(scaleAnim, {
              toValue: 0.95,
              useNativeDriver: true,
              friction: 3,
              tension: 40,
            }).start()
          }
          onPressOut={() =>
            Animated.spring(scaleAnim, {
              toValue: 1,
              useNativeDriver: true,
              friction: 3,
              tension: 40,
            }).start()
          }
        >
          {/* KİLİT İKONU (SAĞ ÜST) */}
          {item.isPremium && !user?.isPremium && (
            <View style={styles.lockIconContainer}>
              <MaterialIcons name="lock" size={20} color="#fbbf24" />
            </View>
          )}
          <View style={styles.iconBox}>
            <MaterialIcons
              name={item.icon as any}
              size={32}
              color={COLORS.primary}
            />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{t(item.titleKey)}</Text>
            <Text
              style={[
                styles.levelText,
                { color: getLevelColor(item.levelKey) },
              ]}
            >
              {t(item.levelKey)}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

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
        <Text style={styles.headerTitle}>{t("scenarios_title")}</Text>
        <TouchableOpacity style={styles.iconButton}></TouchableOpacity>
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
            placeholder={t("search_scenario")}
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
            key={filter.key}
            style={[
              styles.chip,
              selectedFilter === filter.key
                ? styles.chipActive
                : styles.chipInactive,
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Text
              style={[
                styles.chipText,
                selectedFilter === filter.key
                  ? { color: COLORS.textWhite }
                  : { color: COLORS.textGrey },
              ]}
            >
              {filter.label}
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
  lockIconContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
    padding: 4,
    zIndex: 10,
  },
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
