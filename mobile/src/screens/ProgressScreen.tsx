import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import React, { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Animated,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import SkeletonItem from "../components/SkeletonItem"; // Skeleton bileşeni
import { COLORS } from "../constants/color";
import { useAuth } from "../context/AuthContext";
import api, { claimQuest } from "../services/api";

// --- GÖREVLER SKELETON ---
const QuestSkeleton = () => (
  <View style={{ gap: 16 }}>
    {/* Günlük İlerleme Barı */}
    <SkeletonItem height={80} borderRadius={16} />

    {/* Görevler */}
    {[1, 2, 3, 4].map((i) => (
      <View key={i} style={styles.questCard}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <SkeletonItem width={48} height={48} borderRadius={24} />
          <View style={{ flex: 1 }}>
            <SkeletonItem width={120} height={16} style={{ marginBottom: 8 }} />
            <SkeletonItem width={60} height={12} />
          </View>
          <SkeletonItem width={80} height={36} borderRadius={18} />
        </View>
      </View>
    ))}
  </View>
);

// --- İLERLEME SKELETON ---
const ProgressSkeleton = () => (
  <View>
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
        gap: 16,
      }}
    >
      <SkeletonItem width={80} height={80} borderRadius={40} />
      <View>
        <SkeletonItem width={150} height={24} style={{ marginBottom: 8 }} />
        <SkeletonItem width={180} height={16} />
      </View>
    </View>
    <SkeletonItem height={100} borderRadius={16} style={{ marginBottom: 16 }} />
    <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
      <SkeletonItem style={{ flex: 1 }} height={80} borderRadius={16} />
      <SkeletonItem style={{ flex: 1 }} height={80} borderRadius={16} />
    </View>
    <SkeletonItem height={200} borderRadius={16} />
  </View>
);

export default function ProgressScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const scaleAnimTab = useRef(new Animated.Value(1)).current;
  // Helper - Tarihi formatla
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return t("today");
    if (diffDays === 1) return t("yesterday");
    return t("days_ago", { count: diffDays });
  };

  // Gün kısaltmalarını çevir
  const translateDayAbbr = (dayAbbr: string): string => {
    const dayMap: { [key: string]: number } = {
      Paz: 0,
      Pzt: 1,
      Sal: 2,
      Çar: 3,
      Per: 4,
      Cum: 5,
      Cmt: 6,
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };

    const dayIndex = dayMap[dayAbbr];
    if (dayIndex !== undefined) {
      const weekdays = t("weekdays_short", { returnObjects: true }) as string[];
      return weekdays[dayIndex] || dayAbbr;
    }
    return dayAbbr;
  };

  // Görev açıklamalarını çevir
  const translateQuestDescription = (description: string): string => {
    const questMap: { [key: string]: string } = {
      "1 Senaryo Tamamla": "quest_session_complete",
      "3 Yeni Kelime Kaydet": "quest_word_save",
      "Sesli Konuşma Yap": "quest_voice_use",
      "Complete 1 Scenario": "quest_session_complete",
      "Save 3 New Words": "quest_word_save",
      "Use Voice Chat": "quest_voice_use",
    };

    return questMap[description] ? t(questMap[description]) : description;
  };

  const [activeTab, setActiveTab] = useState<"progress" | "quests">("progress");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const res = await api.get("/auth/stats");
      setStats(res.data);
    } catch (error) {
      console.log("Stats fetch error");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  const handleClaim = async (questId: string) => {
    setClaimingId(questId);
    try {
      await claimQuest(questId);
      await fetchStats(); // Verileri yenile
    } catch (error) {
      console.log("Claim error");
    } finally {
      setClaimingId(null);
    }
  };

  // Görev ikonunu belirle
  const getQuestIcon = (type: string) => {
    switch (type) {
      case "SESSION_COMPLETE":
        return "play-circle-outline";
      case "WORD_SAVE":
        return "bookmark-border";
      case "VOICE_USE":
        return "mic";
      default:
        return "stars";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("progress_and_quests")}</Text>
      </View>

      {/* SEGMENTED CONTROL (TAB) */}
      <Animated.View
        style={[styles.tabContainer, { transform: [{ scale: scaleAnimTab }] }]}
      >
        <TouchableOpacity
          style={[styles.tab, activeTab === "progress" && styles.tabActive]}
          onPress={() => setActiveTab("progress")}
          onPressIn={() =>
            Animated.spring(scaleAnimTab, {
              toValue: 0.95,
              useNativeDriver: true,
              friction: 3,
              tension: 40,
            }).start()
          }
          onPressOut={() =>
            Animated.spring(scaleAnimTab, {
              toValue: 1,
              useNativeDriver: true,
              friction: 3,
              tension: 40,
            }).start()
          }
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "progress" && styles.tabTextActive,
            ]}
          >
            {t("progress_tab")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "quests" && styles.tabActive]}
          onPress={() => setActiveTab("quests")}
          onPressIn={() =>
            Animated.spring(scaleAnimTab, {
              toValue: 0.95,
              useNativeDriver: true,
              friction: 3,
              tension: 40,
            }).start()
          }
          onPressOut={() =>
            Animated.spring(scaleAnimTab, {
              toValue: 1,
              useNativeDriver: true,
              friction: 3,
              tension: 40,
            }).start()
          }
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "quests" && styles.tabTextActive,
            ]}
          >
            {t("daily_quests_tab")}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          activeTab === "progress" ? (
            <ProgressSkeleton />
          ) : (
            <QuestSkeleton />
          )
        ) : activeTab === "progress" ? (
          // --- İLERLEME TABI ---
          <>
            {/* PROFİL */}
            <View style={styles.profileSection}>
              <Image
                source={{
                  uri:
                    "https://api.dicebear.com/9.x/avataaars/png?seed=" +
                    (user?.avatarId || user?.fullName || "User"),
                }}
                style={styles.avatar}
                contentFit="cover"
              />
              <View>
                <Text style={styles.userName}>{user?.fullName}</Text>
                <Text style={styles.userStatus}>
                  {t("reached_level", { level: stats?.level.current })}
                </Text>
              </View>
            </View>

            {/* SEVİYE KARTI */}
            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardLabel}>
                  {t("current_english_level", { level: stats?.level.current })}
                </Text>
                <Text style={styles.cardLabel}>
                  {Math.round(stats?.level.progress)}%
                </Text>
              </View>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${stats?.level.progress}%` },
                  ]}
                />
              </View>
              <Text style={styles.helperText}>
                {t("level_remaining_percent", {
                  next: stats?.level.next,
                  remaining: 100 - Math.round(stats?.level.progress),
                })}
              </Text>
            </View>

            {/* İSTATİSTİK GRID */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>
                  {t("completed_scenarios_label")}
                </Text>
                <Text style={styles.statValue}>
                  {stats?.stats.completedSessions}
                </Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>{t("learned_words_label")}</Text>
                <Text style={styles.statValue}>
                  {stats?.stats.learnedWords}
                </Text>
              </View>
              <View style={[styles.statCard, { width: "100%" }]}>
                <Text style={styles.statLabel}>{t("practice_time_label")}</Text>
                <Text style={styles.statValue}>
                  {stats?.stats.practiceHours} {t("hours_short")}
                </Text>
              </View>
            </View>

            {/* GRAFİK */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>{t("weekly_activity_label")}</Text>
              <Text style={styles.bigStat}>
                {t("scenarios_count", { count: stats?.stats.weeklyCount })}
              </Text>
              <View style={styles.trendRow}>
                <Text style={styles.helperText}>{t("last_7_days_label")}</Text>
                <Text style={styles.trendPositive}>{t("active_label")}</Text>
              </View>
              <View style={styles.chartContainer}>
                {stats?.chart.map((item: any, index: number) => {
                  const translatedDay = translateDayAbbr(item.day);
                  return (
                    <View key={index} style={styles.barWrapper}>
                      <View
                        style={[
                          styles.barFill,
                          { height: `${Math.max(item.percent, 5)}%` },
                        ]}
                      />
                      <Text style={styles.barLabel}>{translatedDay}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* SON RAPORLAR */}
            <Text style={styles.sectionTitle}>
              {t("recent_feedback_title")}
            </Text>
            <View style={styles.recentList}>
              {stats?.recentReports.length > 0 ? (
                stats?.recentReports.map((item: any) => (
                  <TouchableOpacity
                    key={item._id}
                    style={styles.recentItem}
                    onPress={() =>
                      navigation.navigate("Chat", {
                        sessionId: item._id,
                        title: item.scenario,
                      })
                    }
                  >
                    <View>
                      <Text style={styles.recentTitle}>{item.scenario}</Text>
                      <Text style={styles.recentDate}>
                        {formatDate(item.updatedAt)}
                      </Text>
                    </View>
                    <MaterialIcons
                      name="chevron-right"
                      size={24}
                      color={COLORS.textGrey}
                    />
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={{ color: COLORS.textGrey, fontStyle: "italic" }}>
                  {t("no_data_yet")}
                </Text>
              )}
            </View>
          </>
        ) : (
          // --- GÜNLÜK GÖREVLER TABI ---
          <View style={{ gap: 16 }}>
            {/* GÜNLÜK İLERLEME KARTI */}
            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardLabel}>{t("daily_progress")}</Text>
                <Text style={styles.helperText}>
                  {t("quests_completed", {
                    completed: stats?.quests.filter((q: any) => q.isCompleted)
                      .length,
                    total: stats?.quests.length,
                  })}
                </Text>
              </View>
              <View style={[styles.progressBarBg, { marginTop: 10 }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${
                        (stats?.quests.filter((q: any) => q.isCompleted)
                          .length /
                          stats?.quests.length) *
                        100
                      }%`,
                    },
                  ]}
                />
              </View>
            </View>

            {/* GÖREV LİSTESİ */}
            {stats?.quests.map((quest: any) => (
              <View
                key={quest.id}
                style={[styles.questCard, quest.isClaimed && { opacity: 0.6 }]}
              >
                <View style={styles.questContent}>
                  {/* İkon */}
                  <View
                    style={[
                      styles.questIconBox,
                      quest.isCompleted && {
                        backgroundColor: "rgba(43, 238, 121, 0.1)",
                      },
                    ]}
                  >
                    <MaterialIcons
                      name={
                        quest.isCompleted
                          ? "check-circle"
                          : (getQuestIcon(quest.type) as any)
                      }
                      size={32}
                      color={COLORS.primary}
                    />
                  </View>

                  {/* Metin */}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.questTitle}>
                      {translateQuestDescription(quest.description)}
                    </Text>
                    <Text style={styles.questReward}>
                      {t("xp_reward", { xp: quest.xpReward })}
                    </Text>
                    {/* Progress Bar (Bitmemişse) */}
                    {!quest.isCompleted && (
                      <View style={styles.miniProgressBg}>
                        <View
                          style={[
                            styles.miniProgressFill,
                            {
                              width: `${
                                (quest.progress / quest.target) * 100
                              }%`,
                            },
                          ]}
                        />
                      </View>
                    )}
                    {!quest.isCompleted && (
                      <Text style={styles.miniProgressText}>
                        {t("progress_fraction", {
                          current: quest.progress,
                          target: quest.target,
                        })}
                      </Text>
                    )}
                  </View>

                  {/* Buton */}
                  <View>
                    {quest.isClaimed ? (
                      <View style={styles.claimedBadge}>
                        <Text style={styles.claimedText}>{t("claimed")}</Text>
                      </View>
                    ) : quest.isCompleted ? (
                      <TouchableOpacity
                        style={styles.claimButton}
                        onPress={() => handleClaim(quest.id)}
                        disabled={claimingId === quest.id}
                      >
                        {claimingId === quest.id ? (
                          <ActivityIndicator
                            color={COLORS.background}
                            size="small"
                          />
                        ) : (
                          <Text style={styles.claimButtonText}>
                            {t("claim")}
                          </Text>
                        )}
                      </TouchableOpacity>
                    ) : (
                      // Bitmemiş görev için boş alan veya 0/3 gibi sayaç (yukarıda eklendi)
                      <View />
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.textWhite },

  // Tab Bar
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.chipInactive,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textGrey,
  },
  tabTextActive: {
    color: COLORS.backgroundDark,
  },

  scrollContent: { padding: 16, paddingBottom: 40 },

  // Ortak Kartlar
  card: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.borderColor,
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardLabel: { fontSize: 14, color: COLORS.textWhite, fontWeight: "600" },
  progressBarBg: {
    height: 10,
    backgroundColor: "#334155",
    borderRadius: 5,
    width: "100%",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 5,
  },
  helperText: { fontSize: 13, color: COLORS.textGrey },

  // Profil
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#e2e8f0",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.textWhite,
    marginBottom: 4,
  },
  userStatus: { fontSize: 16, color: COLORS.textGrey },

  // İstatistikler
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.borderColor,
    borderWidth: 1,
    padding: 16,
    borderRadius: 16,
  },
  statLabel: { fontSize: 13, color: COLORS.textGrey, marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: "bold", color: COLORS.textWhite },

  // Grafik
  bigStat: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.textWhite,
    marginTop: 4,
  },
  trendRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  trendPositive: { color: COLORS.primary, fontWeight: "bold" },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 160,
    paddingTop: 20,
  },
  barWrapper: {
    alignItems: "center",
    width: "10%",
    height: "100%",
    justifyContent: "flex-end",
    gap: 8,
  },
  barFill: {
    width: "100%",
    backgroundColor: COLORS.barBg,
    borderRadius: 20,
    minHeight: 5,
  },
  barLabel: { fontSize: 12, color: COLORS.textGrey, fontWeight: "bold" },

  // Liste
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textWhite,
    marginBottom: 12,
    marginTop: 8,
  },
  recentList: { gap: 12 },
  recentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.borderColor,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textWhite,
    marginBottom: 4,
  },
  recentDate: { fontSize: 13, color: COLORS.textGrey },

  // --- GÖREV KARTLARI ---
  questCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  questContent: { flexDirection: "row", alignItems: "center", gap: 16 },
  questIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  questTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textWhite,
    marginBottom: 4,
  },
  questReward: { fontSize: 13, color: COLORS.primary, fontWeight: "bold" },

  miniProgressBg: {
    height: 4,
    backgroundColor: "#334155",
    borderRadius: 2,
    marginTop: 8,
    width: "90%",
  },
  miniProgressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  miniProgressText: { fontSize: 11, color: COLORS.textGrey, marginTop: 4 },

  claimButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  claimButtonText: {
    color: COLORS.background,
    fontWeight: "bold",
    fontSize: 14,
  },

  claimedBadge: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  claimedText: { color: COLORS.textGrey, fontWeight: "600", fontSize: 14 },
});
