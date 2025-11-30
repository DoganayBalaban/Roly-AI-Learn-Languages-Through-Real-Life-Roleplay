import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";
import { Image } from "expo-image";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import api from "../services/api";
import StreakHeader from "../components/StreakHeader";
import HomeSkeleton from "../components/skeletons/HomeSkeleton";
import { useTranslation } from "react-i18next";
const bannerAdUnitId = __DEV__
  ? TestIds.BANNER
  : process.env.EXPO_PUBLIC_ADMOB_BANNER_ID;
const COLORS = {
  primary: "#2bee79",
  backgroundDark: "#102217",
  cardBg: "rgba(255, 255, 255, 0.05)",
  textWhite: "#FFFFFF",
  textGrey: "#9db9a8",
  iconBg: "rgba(43, 238, 121, 0.1)",
};

export default function HomeScreen() {
  const { t } = useTranslation();
  const { user, isLoading: isUserLoading } = useAuth();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [lastSession, setLastSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // useFocusEffect: Ekran her odaklandığında (geri gelince) çalışır
  useFocusEffect(
    useCallback(() => {
      // Kullanıcı verileri yüklendiyse son oturumu çek
      if (!isUserLoading && user) {
        fetchLastSession();
      }
    }, [isUserLoading, user])
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
      title: t("rec_scenario_title"),
      description: t("rec_scenario_desc"),
      icon: "chat-bubble-outline",
      action: () => navigation.navigate("ScenarioList"),
    },
    {
      id: "2",
      title: t("rec_taxi_title"),
      description: t("rec_taxi_desc"),
      icon: "auto-awesome",
      action: () =>
        navigation.navigate("Chat", {
          sessionId: null,
          title: t("taxi_call_title"),
          isQuickStart: true,
        }),
    },
  ];

  // Kullanıcı verileri yükleniyorsa veya lastSession yükleniyorsa skeleton göster
  const showSkeleton = isUserLoading || loading || !user;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.backgroundDark}
        translucent={Platform.OS === "android"}
      />
      {showSkeleton ? (
        <HomeSkeleton />
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>
                {t("welcome")}, {user?.fullName?.split(" ")[0] || t("guest")}!
              </Text>
              <Text style={styles.subGreeting}>{t("welcome_sub")}</Text>
            </View>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri:
                    "https://api.dicebear.com/9.x/avataaars/png?seed=" +
                    user?.avatarId,
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
                <Text style={styles.cardLabel}>{t("last_practice")}</Text>
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
                        {
                          width: calculateProgress(lastSession.messages.length),
                        },
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
                {t("no_practice_yet")}
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
            <Text style={styles.bigButtonText}>{t("new_practice")}</Text>
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
          {!user?.isPremium && (
            <View style={{ alignItems: "center", marginVertical: 10 }}>
              <BannerAd
                unitId={bannerAdUnitId} // <-- ARTIK DİNAMİK
                size={BannerAdSize.BANNER}
                requestOptions={{ requestNonPersonalizedAdsOnly: true }}
              />
            </View>
          )}
        </ScrollView>
      )}
    </View>
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
