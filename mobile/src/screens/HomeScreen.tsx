import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import { usePostHog } from "posthog-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Animated,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import StreakHeader from "../components/StreakHeader";
import HomeSkeleton from "../components/skeletons/HomeSkeleton";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
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
  const scaleAnimBtn = useRef(new Animated.Value(1)).current;
  const scaleAnimItem = useRef(new Animated.Value(1)).current;
  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture("home_screen_loaded");
  }, []);

  // Senaryo adını çeviri anahtarına çevir
  const getScenarioTranslationKey = (scenarioName: string): string => {
    // Türkçe senaryo adlarını key'lere map et
    const scenarioMap: { [key: string]: string } = {
      "Havaalanında Check-in": "scenario_airport_checkin",
      "Kafede Tanışma": "scenario_cafe_meeting",
      "İş Görüşmesi": "scenario_job_interview",
      "Market Alışverişi": "scenario_grocery_shopping",
      "Restoranda Sipariş Verme": "scenario_restaurant_order",
      "Taksi Çağırma": "scenario_taxi_call",
      "Otel Resepsiyonu": "scenario_hotel_reception",
      "Adres Sorma": "scenario_asking_directions",
      "Doktor Muayenesi": "scenario_doctor_appointment",
      "Kıyafet Alışverişi": "scenario_clothes_shopping",
      "Polise Kayıp İhbarı": "scenario_police_report",
      "Spor Salonu Kaydı": "scenario_gym_registration",
      "Film Hakkında Sohbet": "scenario_movie_chat",
      "Eczaneden İlaç Alma": "scenario_pharmacy",
      "Teknik Destek (İnternet)": "scenario_tech_support",
      "Kuaför Randevusu": "scenario_hair_salon",
      "Ev Kiralama": "scenario_house_rental",
      "Tren Bileti Alma": "scenario_train_ticket",
      "Kütüphane Üyeliği": "scenario_library_membership",
      "Araba Kiralama": "scenario_car_rental",
      // İngilizce versiyonları da ekle (eğer backend İngilizce kaydetmişse)
      "Airport Check-in": "scenario_airport_checkin",
      "Meeting at Cafe": "scenario_cafe_meeting",
      "Job Interview": "scenario_job_interview",
      "Grocery Shopping": "scenario_grocery_shopping",
      "Ordering at Restaurant": "scenario_restaurant_order",
      "Calling a Taxi": "scenario_taxi_call",
      "Hotel Reception": "scenario_hotel_reception",
      "Asking for Directions": "scenario_asking_directions",
      "Doctor's Appointment": "scenario_doctor_appointment",
      "Clothes Shopping": "scenario_clothes_shopping",
      "Police Report": "scenario_police_report",
      "Gym Registration": "scenario_gym_registration",
      "Chatting About Movies": "scenario_movie_chat",
      "Getting Medicine at Pharmacy": "scenario_pharmacy",
      "Tech Support (Internet)": "scenario_tech_support",
      "Hair Salon Appointment": "scenario_hair_salon",
      "House Rental": "scenario_house_rental",
      "Buying Train Ticket": "scenario_train_ticket",
      "Library Membership": "scenario_library_membership",
      "Car Rental": "scenario_car_rental",
    };

    return scenarioMap[scenarioName] || scenarioName;
  };

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

  // Buton animasyon fonksiyonları
  const handlePressIn = () => {
    Animated.spring(scaleAnimBtn, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 3,
      tension: 40,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnimBtn, {
      toValue: 1,
      useNativeDriver: true,
      friction: 3,
      tension: 40,
    }).start();
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
                    (user?.avatarId || user?.fullName || "User"),
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
                  title: t(getScenarioTranslationKey(lastSession.scenario)),
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
                  <Text style={styles.cardTitle}>
                    {t(getScenarioTranslationKey(lastSession.scenario))}
                  </Text>
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
          <Animated.View style={{ transform: [{ scale: scaleAnimBtn }] }}>
            <TouchableOpacity
              style={styles.bigButton}
              onPress={() => navigation.navigate("ScenarioList")}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              activeOpacity={1}
            >
              <MaterialIcons
                name="play-arrow"
                size={24}
                color={COLORS.backgroundDark}
              />
              <Text style={styles.bigButtonText}>{t("new_practice")}</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* --- DİĞER KARTLAR --- */}
          <Animated.View style={{ transform: [{ scale: scaleAnimItem }] }}>
            <View style={styles.listContainer}>
              {recommendedScenarios.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.scenarioCard}
                  onPress={item.action}
                  onPressIn={() =>
                    Animated.spring(scaleAnimItem, {
                      toValue: 0.95,
                      useNativeDriver: true,
                      friction: 3,
                      tension: 40,
                    }).start()
                  }
                  onPressOut={() =>
                    Animated.spring(scaleAnimItem, {
                      toValue: 1,
                      useNativeDriver: true,
                      friction: 3,
                      tension: 40,
                    }).start()
                  }
                  activeOpacity={1}
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
                    <Text style={styles.cardDescription}>
                      {item.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
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
