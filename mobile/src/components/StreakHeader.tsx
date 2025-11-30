import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "../constants/color";
import { useTranslation } from "react-i18next";

// StreakHeader props interface aynı kaldı
interface Props {
  streakCount: number;
  activityHistory: string[]; // ISO Date string array
}

export default function StreakHeader({ streakCount, activityHistory }: Props) {
  const { t } = useTranslation();

  // Haftanın gün isimlerini i18n'den alıyoruz (short form)
  const days = t("weekdays_short", { returnObjects: true }) as string[];

  // Son 7 günü hesapla (bugünkü tarih son eleman olacak)
  const getLast7Days = () => {
    const result: { dayName: string; date: Date; isToday: boolean }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      result.push({
        dayName: days[d.getDay()] ?? d.toLocaleDateString(),
        date: d,
        isToday: i === 0,
      });
    }
    return result;
  };

  const weekDays = getLast7Days();

  // Tarih kontrolü (String gelen tarihi Date objesine çevirip karşılaştırır)
  const isActiveDay = (targetDate: Date) => {
    if (!activityHistory) return false;
    return activityHistory.some((dateStr) => {
      const d = new Date(dateStr);
      return (
        d.getDate() === targetDate.getDate() &&
        d.getMonth() === targetDate.getMonth() &&
        d.getFullYear() === targetDate.getFullYear()
      );
    });
  };

  return (
    <View style={styles.container}>
      {/* Üst Kısım: Ateş İkonu ve Sayaç */}
      <View style={styles.headerRow}>
        <View style={styles.fireContainer}>
          <MaterialIcons
            name="local-fire-department"
            size={24}
            color={COLORS.primary}
            accessibilityLabel={t("streak_fire_icon_aria")}
          />
          <Text style={styles.streakText}>
            {t("streak_count", { count: streakCount })}
          </Text>
        </View>
        <Text style={styles.subtitle}>{t("streak_subtitle")}</Text>
      </View>

      {/* Günler */}
      <View style={styles.daysRow}>
        {weekDays.map((item, index) => {
          const active = isActiveDay(item.date);
          return (
            <View key={index} style={styles.dayItem}>
              <Text
                style={[styles.dayName, active && { color: COLORS.primary }]}
              >
                {item.dayName}
              </Text>
              <View
                style={[
                  styles.dayCircle,
                  active ? styles.circleActive : styles.circleInactive,
                  item.isToday && !active && styles.circleToday, // Bugünse ama henüz yapmadıysa
                ]}
                accessibilityLabel={
                  active
                    ? t("day_active_aria", {
                        day: item.dayName,
                      })
                    : t("day_inactive_aria", { day: item.dayName })
                }
              >
                {active && (
                  <MaterialIcons
                    name="check"
                    size={16}
                    color={COLORS.primary}
                  />
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  fireContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  streakText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "bold",
  },
  subtitle: {
    color: COLORS.textGrey,
    fontSize: 12,
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayItem: {
    alignItems: "center",
    gap: 8,
  },
  dayName: {
    color: COLORS.textGrey,
    fontSize: 12,
    fontWeight: "500",
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  circleActive: {
    backgroundColor: COLORS.activeBg,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  circleInactive: {
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  circleToday: {
    borderWidth: 1,
    borderColor: COLORS.textGrey,
    borderStyle: "dashed", // Bugün henüz yapılmadıysa kesikli çizgi
  },
});
