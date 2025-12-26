import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import SkeletonItem from "../components/SkeletonItem";
import { COLORS } from "../constants/color";
import { useAuth } from "../context/AuthContext";
import { getLeaderboard } from "../services/api";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  fullName: string;
  avatarId: string;
  xp: number;
  streak: number;
  targetLanguage: string;
  isCurrentUser: boolean;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  currentUser: LeaderboardEntry | null;
  type: string;
}

const getLanguageName = (lang: string, t: any): string => {
  const langMap: { [key: string]: string } = {
    English: t("lang_english"),
    Turkish: t("lang_turkish"),
    Spanish: t("lang_spanish"),
    German: t("lang_german"),
    French: t("lang_french"),
    Italian: t("lang_italian"),
    Japanese: t("lang_japanese"),
    Korean: t("lang_korean"),
    Russian: t("lang_russian"),
  };
  return langMap[lang] || lang;
};

export default function Leaderboard() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user } = useAuth();
  const [type, setType] = useState<"weekly" | "all">("weekly");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getLeaderboard(type);
      setData(result);
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
      setError(t("leaderboard_error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [type]);

  useFocusEffect(
    useCallback(() => {
      fetchLeaderboard();
    }, [type])
  );

  const topThree = data?.leaderboard.slice(0, 3) || [];
  const rest = data?.leaderboard.slice(3) || [];
  const currentUser = data?.currentUser;

  const renderSkeleton = () => {
    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top 3 Skeleton */}
        <View style={styles.topThreeContainer}>
          {[0, 1, 2].map((index) => (
            <View
              key={index}
              style={[styles.topThreeItem, index === 0 && styles.topThreeFirst]}
            >
              <SkeletonItem
                width={index === 0 ? 90 : 70}
                height={index === 0 ? 90 : 70}
                borderRadius={index === 0 ? 45 : 35}
                style={{ marginBottom: 8 }}
              />
              <SkeletonItem
                width={50}
                height={20}
                borderRadius={12}
                style={{ marginBottom: 8 }}
              />
              <SkeletonItem
                width={60}
                height={16}
                borderRadius={8}
                style={{ marginBottom: 4 }}
              />
              <SkeletonItem width={50} height={14} borderRadius={8} />
            </View>
          ))}
        </View>

        {/* List Skeleton */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
          <View key={index} style={styles.listItem}>
            <SkeletonItem width={40} height={24} borderRadius={8} />
            <SkeletonItem
              width={50}
              height={50}
              borderRadius={25}
              style={{ marginRight: 12 }}
            />
            <View style={styles.listInfo}>
              <SkeletonItem
                width={120}
                height={16}
                borderRadius={8}
                style={{ marginBottom: 8 }}
              />
              <SkeletonItem width={100} height={13} borderRadius={8} />
            </View>
            <SkeletonItem width={60} height={16} borderRadius={8} />
          </View>
        ))}

        {/* Current User Skeleton */}
        <View style={styles.currentUserContainer}>
          <SkeletonItem
            width={60}
            height={60}
            borderRadius={30}
            style={{ marginRight: 12 }}
          />
          <View style={styles.currentUserInfo}>
            <SkeletonItem
              width={80}
              height={18}
              borderRadius={8}
              style={{ marginBottom: 8 }}
            />
            <SkeletonItem width={100} height={13} borderRadius={8} />
          </View>
          <View style={styles.currentUserXpContainer}>
            <SkeletonItem width={70} height={20} borderRadius={8} />
            <SkeletonItem
              width={50}
              height={12}
              borderRadius={8}
              style={{ marginTop: 4 }}
            />
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderTopThree = () => {
    if (topThree.length === 0) return null;

    const positions = [
      { index: 1, user: topThree[1] }, // 2nd place (left)
      { index: 0, user: topThree[0] }, // 1st place (center)
      { index: 2, user: topThree[2] }, // 3rd place (right)
    ];

    return (
      <View style={styles.topThreeContainer}>
        {positions.map(({ index, user: entry }) => {
          if (!entry)
            return <View key={index} style={styles.topThreePlaceholder} />;
          const isFirst = index === 0;
          return (
            <View
              key={entry.userId}
              style={[styles.topThreeItem, isFirst && styles.topThreeFirst]}
            >
              {isFirst && (
                <MaterialIcons
                  name="emoji-events"
                  size={32}
                  color="#FFD700"
                  style={styles.crownIcon}
                />
              )}
              <View
                style={[
                  styles.topThreeAvatarContainer,
                  isFirst && styles.topThreeAvatarFirst,
                ]}
              >
                <Image
                  source={{
                    uri: `https://api.dicebear.com/9.x/avataaars/png?seed=${
                      entry.avatarId || entry.fullName
                    }`,
                  }}
                  style={[
                    styles.topThreeAvatar,
                    isFirst && styles.topThreeAvatarFirstSize,
                  ]}
                  contentFit="cover"
                />
              </View>
              <View
                style={[
                  styles.topThreeRankBadge,
                  isFirst && styles.topThreeRankBadgeFirst,
                ]}
              >
                <Text
                  style={[
                    styles.topThreeRankText,
                    isFirst && styles.topThreeRankTextFirst,
                  ]}
                >
                  #{entry.rank}
                </Text>
              </View>
              <Text
                style={[
                  styles.topThreeName,
                  isFirst && styles.topThreeNameFirst,
                ]}
                numberOfLines={1}
              >
                {entry.fullName}
              </Text>
              <Text
                style={[styles.topThreeXp, isFirst && styles.topThreeXpFirst]}
              >
                {entry.xp} XP
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderListEntry = (entry: LeaderboardEntry) => {
    const isCurrentUser = entry.isCurrentUser;
    return (
      <View
        key={entry.userId}
        style={[styles.listItem, isCurrentUser && styles.listItemCurrent]}
      >
        <Text
          style={[styles.listRank, isCurrentUser && styles.listRankCurrent]}
        >
          {entry.rank}
        </Text>
        <Image
          source={{
            uri: `https://api.dicebear.com/9.x/avataaars/png?seed=${
              entry.avatarId || entry.fullName
            }`,
          }}
          style={styles.listAvatar}
          contentFit="cover"
        />
        <View style={styles.listInfo}>
          <Text
            style={[styles.listName, isCurrentUser && styles.listNameCurrent]}
            numberOfLines={1}
          >
            {entry.isCurrentUser ? t("leaderboard_you") : entry.fullName}
          </Text>
          <Text
            style={[
              styles.listLanguage,
              isCurrentUser && styles.listLanguageCurrent,
            ]}
          >
            {t("learning_language", {
              lang: getLanguageName(entry.targetLanguage, t),
            })}
          </Text>
        </View>
        <Text style={[styles.listXp, isCurrentUser && styles.listXpCurrent]}>
          {entry.xp} XP
        </Text>
      </View>
    );
  };

  const renderCurrentUser = () => {
    if (!currentUser || topThree.some((u) => u.userId === currentUser.userId)) {
      return null;
    }

    return (
      <View style={styles.currentUserContainer}>
        <View style={styles.currentUserHeader}>
          <MaterialIcons name="trending-up" size={20} color={COLORS.primary} />
          <Text style={styles.currentUserRank}>{currentUser.rank}</Text>
        </View>
        <Image
          source={{
            uri: `https://api.dicebear.com/9.x/avataaars/png?seed=${
              currentUser.avatarId || currentUser.fullName
            }`,
          }}
          style={styles.currentUserAvatar}
          contentFit="cover"
        />
        <View style={styles.currentUserInfo}>
          <Text style={styles.currentUserName}>{t("leaderboard_you")}</Text>
          <View style={styles.currentUserStreak}>
            <MaterialIcons
              name="local-fire-department"
              size={16}
              color={COLORS.backgroundDark}
            />
            <Text style={styles.currentUserStreakText}>
              {currentUser.streak}{" "}
              {t("streak_count", { count: currentUser.streak }).replace(
                /{{count}}\s*/,
                ""
              )}
            </Text>
          </View>
        </View>
        <View style={styles.currentUserXpContainer}>
          <Text style={styles.currentUserXp}>{currentUser.xp} XP</Text>
          <Text style={styles.currentUserXpLabel}>
            {type === "weekly" ? t("leaderboard_this_week") : ""}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("leaderboard_title")}</Text>
        <View style={styles.backButton} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, type === "weekly" && styles.tabActive]}
          onPress={() => setType("weekly")}
        >
          <Text
            style={[styles.tabText, type === "weekly" && styles.tabTextActive]}
          >
            {t("leaderboard_weekly")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, type === "all" && styles.tabActive]}
          onPress={() => setType("all")}
        >
          <Text
            style={[styles.tabText, type === "all" && styles.tabTextActive]}
          >
            {t("leaderboard_all_time")}
          </Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : loading ? (
        renderSkeleton()
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top 3 */}
          {renderTopThree()}

          {/* Rest of the list */}
          {rest.map(renderListEntry)}

          {/* Current User (if not in top 100) */}
          {renderCurrentUser()}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textWhite,
  },
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: COLORS.error,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  // Top 3 Styles
  topThreeContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    marginBottom: 24,
    paddingTop: 20,
  },
  topThreeItem: {
    alignItems: "center",
    width: "30%",
  },
  topThreeFirst: {
    marginBottom: 0,
  },
  topThreePlaceholder: {
    width: "30%",
  },
  topThreeAvatarContainer: {
    position: "relative",
    marginBottom: 8,
  },
  topThreeAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  topThreeAvatarFirst: {
    borderColor: COLORS.primary,
  },
  topThreeAvatarFirstSize: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },

  topThreeRankBadge: {
    backgroundColor: COLORS.chipInactive,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  topThreeRankBadgeFirst: {
    backgroundColor: COLORS.primary,
  },
  topThreeRankText: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.textWhite,
  },
  topThreeRankTextFirst: {
    color: COLORS.backgroundDark,
  },
  topThreeName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textGrey,
    textAlign: "center",
    marginBottom: 4,
  },
  topThreeNameFirst: {
    color: COLORS.textWhite,
    fontSize: 16,
  },
  topThreeXp: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.textGrey,
  },
  topThreeXpFirst: {
    color: COLORS.primary,
    fontSize: 16,
  },
  crownIcon: {
    position: "absolute",
    top: -15,
    zIndex: 10,
  },
  // List Styles
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  listItemCurrent: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  listRank: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textGrey,
    width: 40,
    textAlign: "center",
  },
  listRankCurrent: {
    color: COLORS.backgroundDark,
  },
  listAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textWhite,
    marginBottom: 4,
  },
  listNameCurrent: {
    color: COLORS.backgroundDark,
    fontWeight: "bold",
  },
  listLanguage: {
    fontSize: 13,
    color: COLORS.textGrey,
  },
  listLanguageCurrent: {
    color: COLORS.backgroundDark,
    opacity: 0.8,
  },
  listXp: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  listXpCurrent: {
    color: COLORS.backgroundDark,
  },
  // Current User Styles
  currentUserContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  currentUserHeader: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: -12,
    left: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  currentUserRank: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.backgroundDark,
  },
  currentUserAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    borderWidth: 2,
    borderColor: COLORS.backgroundDark,
  },
  currentUserInfo: {
    flex: 1,
  },
  currentUserName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.backgroundDark,
    marginBottom: 6,
  },
  currentUserStreak: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  currentUserStreakText: {
    fontSize: 13,
    color: COLORS.backgroundDark,
    opacity: 0.8,
  },
  currentUserXpContainer: {
    alignItems: "flex-end",
  },
  currentUserXp: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.backgroundDark,
    marginBottom: 2,
  },
  currentUserXpLabel: {
    fontSize: 12,
    color: COLORS.backgroundDark,
    opacity: 0.7,
  },
});
