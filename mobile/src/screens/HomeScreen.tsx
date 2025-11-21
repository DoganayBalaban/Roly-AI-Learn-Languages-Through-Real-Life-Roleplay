import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";

// Tasarımdaki Renk Paleti
import { COLORS } from "../constants/color";

export default function HomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  // Örnek Veriler (Backend'den gelebilir)
  const lastSession = {
    title: "Restoranda Sipariş Verme",
    progress: 0.75, // %75
  };

  const recommendedScenarios = [
    {
      id: "1",
      title: "Senaryo Seçimi",
      description:
        "Farklı konularda pratik yapabileceğin diyalog senaryolarını keşfet.",
      icon: "chat-bubble-outline",
      action: () => Alert.alert("Yakında", "Senaryo listesi açılacak"), // Burayı ScenarioList sayfasına yönlendirebilirsin
    },
    {
      id: "2",
      title: "Sana Özel Senaryo: Taksi Çağırma",
      description: "Şehirde gezinirken ihtiyacın olacak temel ifadeleri öğren.",
      icon: "auto-awesome", // Sparkles ikonu
      action: () =>
        navigation.navigate("Chat", {
          sessionId: "taxi",
          title: "Taksi Çağırma",
        }),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.backgroundDark}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* --- HEADER --- */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Merhaba, {user?.fullName?.split(" ")[0] || "Misafir"}!
            </Text>
            <Text style={styles.subGreeting}>
              Bugün hangi senaryoyu denemek istersin?
            </Text>
          </View>
          {/* Profil Resmi (Yoksa ikon göster) */}
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri:
                  "https://api.dicebear.com/9.x/avataaars/png?seed=" +
                  (user?.fullName || "User"),
              }}
              style={styles.avatar}
              contentFit="cover"
            />
          </View>
        </View>

        {/* --- SON PRATİK KARTI --- */}
        <View style={styles.activeCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>Son Pratiğine Devam Et</Text>
            <MaterialIcons
              name="more-horiz"
              size={24}
              color={COLORS.textGrey}
            />
          </View>

          <View style={styles.cardBody}>
            {/* İkon */}
            <View style={styles.iconBox}>
              <MaterialIcons
                name="restaurant-menu"
                size={28}
                color={COLORS.primary}
              />
            </View>

            {/* Bilgi ve Progress */}
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{lastSession.title}</Text>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${lastSession.progress * 100}%` },
                  ]}
                />
              </View>
            </View>

            {/* Play Butonu */}
            <TouchableOpacity style={styles.playButtonSmall}>
              <MaterialIcons
                name="play-arrow"
                size={28}
                color={COLORS.backgroundDark}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* --- YENİ PRATİK BUTONU (BÜYÜK) --- */}
        <TouchableOpacity style={styles.bigButton}>
          <MaterialIcons
            name="play-arrow"
            size={24}
            color={COLORS.backgroundDark}
          />
          <Text style={styles.bigButtonText}>Yeni Pratik Başlat</Text>
        </TouchableOpacity>

        {/* --- DİĞER KARTLAR --- */}
        <View style={styles.listContainer}>
          {recommendedScenarios.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.scenarioCard}
              onPress={item.action}
            >
              <View style={styles.iconBox}>
                {/* auto-awesome MaterialIcons'da yoksa 'stars' kullanabiliriz */}
                <MaterialIcons
                  name={item.icon as any}
                  size={24}
                  color={COLORS.primary}
                />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Tab barın altında kalmasın
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
    marginTop: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textWhite,
    marginBottom: 8,
  },
  subGreeting: {
    fontSize: 14,
    color: COLORS.textGrey,
    maxWidth: 250,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },

  // Active Card (Son Pratik)
  activeCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardLabel: {
    color: COLORS.textGrey,
    fontSize: 13,
    fontWeight: "600",
  },
  cardBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.iconBg,
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  cardDescription: {
    color: COLORS.textGrey,
    fontSize: 13,
    lineHeight: 18,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 3,
    width: "100%",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  playButtonSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  // Big Button
  bigButton: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    // Gölge (Neon efekti)
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  bigButtonText: {
    color: COLORS.backgroundDark,
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },

  // List Items
  listContainer: {
    gap: 16,
  },
  scenarioCard: {
    flexDirection: "row",
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    alignItems: "flex-start",
    gap: 16,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
});
