import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import SkeletonItem from "./SkeletonItem";
import { claimQuest } from "../services/api"; // <-- IMPORT ET
import { COLORS } from "../constants/color";

// ... (COLORS aynı)

interface Quest {
  id: string;
  description: string;
  target: number;
  progress: number;
  isCompleted: boolean;
  isClaimed: boolean;
  xpReward: number;
}

// Props'a onRewardClaimed ekleyelim ki ana sayfayı güncelleyebilelim
export default function DailyQuests({
  quests,
  loading,
  onRewardClaimed,
}: {
  quests: Quest[];
  loading: boolean;
  onRewardClaimed: () => void;
}) {
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const handleClaim = async (quest: Quest) => {
    setClaimingId(quest.id);
    try {
      const res = await claimQuest(quest.id);
      Alert.alert("Tebrikler! 🎉", `+${res.xpEarned} XP kazandın!`);
      // Ana sayfayı yenile ki XP artsın ve buton 'Tamamlandı' olsun
      onRewardClaimed();
    } catch (error) {
      Alert.alert("Hata", "Ödül alınamadı.");
    } finally {
      setClaimingId(null);
    }
  };

  if (loading) {
    return (
      <SkeletonItem
        height={100}
        borderRadius={16}
        style={{ marginBottom: 24 }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Günlük Görevler</Text>

      {quests.map((quest) => (
        <View
          key={quest.id}
          style={[styles.questRow, quest.isClaimed && styles.claimedRow]}
        >
          {/* İKON KISMI */}
          <View
            style={[
              styles.iconBox,
              quest.isCompleted && { backgroundColor: COLORS.primary },
            ]}
          >
            <MaterialIcons
              name={quest.isCompleted ? "check" : "bolt"}
              size={20}
              color={quest.isCompleted ? "#102217" : COLORS.primary}
            />
          </View>

          {/* METİN KISMI */}
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.desc,
                quest.isClaimed && {
                  textDecorationLine: "line-through",
                  opacity: 0.6,
                },
              ]}
            >
              {quest.description}
            </Text>

            {/* Progress Bar (Sadece tamamlanmamışsa göster) */}
            {!quest.isCompleted && (
              <View style={styles.progressBg}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(quest.progress / quest.target) * 100}%` },
                  ]}
                />
              </View>
            )}
          </View>

          {/* SAĞ TARAF: BUTON VEYA XP YAZISI */}
          <View>
            {quest.isClaimed ? (
              // Ödül alınmışsa: Soluk XP yazısı
              <Text style={[styles.rewardText, { opacity: 0.5 }]}>
                +{quest.xpReward} XP
              </Text>
            ) : quest.isCompleted ? (
              // Tamamlanmış ama alınmamışsa: PARLAYAN BUTON
              <TouchableOpacity
                style={styles.claimButton}
                onPress={() => handleClaim(quest)}
                disabled={!!claimingId}
              >
                {claimingId === quest.id ? (
                  <ActivityIndicator color="#102217" size="small" />
                ) : (
                  <Text style={styles.claimText}>AL</Text>
                )}
              </TouchableOpacity>
            ) : (
              // Henüz bitmemişse: Normal XP yazısı
              <Text style={styles.rewardText}>+{quest.xpReward} XP</Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 24, paddingHorizontal: 16 }, // Padding eklendi
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textWhite,
    marginBottom: 12,
  },
  questRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  claimedRow: {
    borderColor: "transparent",
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  desc: { color: COLORS.textWhite, fontSize: 14, fontWeight: "500" },
  progressBg: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 2,
    marginTop: 6,
    width: "100%",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },

  // Yeni Stiller
  rewardText: { color: COLORS.primary, fontSize: 12, fontWeight: "bold" },
  claimButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8, // Glow efekti
    elevation: 5,
  },
  claimText: {
    color: "#102217",
    fontWeight: "bold",
    fontSize: 12,
  },
});
