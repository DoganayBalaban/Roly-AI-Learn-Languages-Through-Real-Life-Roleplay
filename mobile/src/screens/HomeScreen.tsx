import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import api from "../services/api";
import StreakHeader from "../components/StreakHeader";

const COLORS = {
  primary: "#2bee79",
  backgroundDark: "#102217",
  cardBg: "rgba(255, 255, 255, 0.05)",
  textWhite: "#FFFFFF",
  textGrey: "#9db9a8",
  iconBg: "rgba(43, 238, 121, 0.1)",
};

export default function HomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [lastSession, setLastSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // useFocusEffect: Ekran her odaklandığında (geri gelince) çalışır
  useFocusEffect(
    useCallback(() => {
      fetchLastSession();
    }, [])
  );

  const fetchLastSession = async () => {
    try {
      const res = await api.get("/chat/last");
      setLastSession(res.data); // Veri yoksa null döner
    } catch (error) {
      console.log("Son oturum çekilemedi");
    } finally {
      setLoading(false);
    }
  };

  // İlerleme yüzdesini mesaj sayısına göre uyduralım (Örn: 20 mesaj %100 olsun)
  const calculateProgress = (msgCount: number): number => {
    return Math.min(msgCount * 5, 100); // Her mesaj %5 artış
  };

  const recommendedScenarios = [
    {
      id: "1",
      title: "Senaryo Seçimi",
      description:
        "Farklı konularda pratik yapabileceğin diyalog senaryolarını keşfet.",
      icon: "chat-bubble-outline",
      action: () => navigation.navigate("ScenarioList"), // ARTIK YENİ SAYFAYA GİDİYOR
    },
    {
      id: "2",
      title: "Sana Özel Senaryo: Taksi Çağırma",
      description: "Şehirde gezinirken ihtiyacın olacak temel ifadeleri öğren.",
      icon: "auto-awesome",
      action: () =>
        navigation.navigate("Chat", {
          sessionId: null, // Yeni başlatacağı için ID yok, backendde create lazım olur
          title: "Taksi Çağırma",
          isQuickStart: true, // Bu parametreyi ChatScreen'de yakalayıp start atabilirsin (Opsiyonel)
          // Şimdilik basit olsun, direkt senaryo listesine de atabiliriz:
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
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Merhaba, {user?.fullName?.split(" ")[0] || "Misafir"}!
            </Text>
            <Text style={styles.subGreeting}>
              Bugün hangi senaryoyu denemek istersin?
            </Text>
          </View>
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
        <StreakHeader
          streakCount={user?.stats?.streak || 0}
          activityHistory={user?.stats?.activityHistory || []}
        />

        {/* --- DİNAMİK SON PRATİK KARTI --- */}
        {loading ? (
          <ActivityIndicator
            color={COLORS.primary}
            style={{ marginBottom: 20 }}
          />
        ) : lastSession ? (
          <TouchableOpacity
            style={styles.activeCard}
            onPress={() =>
              navigation.navigate("Chat", {
                sessionId: lastSession._id,
                title: lastSession.scenario,
              })
            }
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>Son Pratiğine Devam Et</Text>
              <MaterialIcons
                name="more-horiz"
                size={24}
                color={COLORS.textGrey}
              />
            </View>

            <View style={styles.cardBody}>
              <View style={styles.iconBox}>
                <MaterialIcons
                  name="restaurant-menu"
                  size={28}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{lastSession.scenario}</Text>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: calculateProgress(lastSession.messages.length) },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.playButtonSmall}>
                <MaterialIcons
                  name="play-arrow"
                  size={28}
                  color={COLORS.backgroundDark}
                />
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          // Oturum yoksa boş bir alan veya mesaj gösterebiliriz
          <View style={[styles.activeCard, { opacity: 0.5 }]}>
            <Text style={{ color: "white", textAlign: "center" }}>
              Henüz bir pratiğin yok.
            </Text>
          </View>
        )}

        {/* --- YENİ PRATİK BAŞLAT (Senaryo Listesine Gider) --- */}
        <TouchableOpacity
          style={styles.bigButton}
          onPress={() => navigation.navigate("ScenarioList")}
        >
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
  container: { flex: 1, backgroundColor: COLORS.backgroundDark },
  scrollContent: { padding: 20, paddingBottom: 100 },
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
  subGreeting: { fontSize: 14, color: COLORS.textGrey, maxWidth: 250 },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
  },
  avatar: { width: "100%", height: "100%" },

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
  cardLabel: { color: COLORS.textGrey, fontSize: 13, fontWeight: "600" },
  cardBody: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.iconBg,
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: { flex: 1 },
  cardTitle: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  cardDescription: { color: COLORS.textGrey, fontSize: 13, lineHeight: 18 },
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

  bigButton: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
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

  listContainer: { gap: 16 },
  scenarioCard: {
    flexDirection: "row",
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    alignItems: "flex-start",
    gap: 16,
  },
  textContainer: { flex: 1, justifyContent: "center" },
});
