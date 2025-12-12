import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { COLORS } from "../constants/color";

export const ShareCard = ({ data, xpEarned }: any) => {
  const { t } = useTranslation();

  return (
    <View
      style={{
        width: 1080,
        padding: 48,
        backgroundColor: COLORS.background,
      }}
    >
      <View style={{ alignItems: "center", marginBottom: 24 }}>
        <Text
          style={{
            color: "#fff",
            fontSize: 56,
            fontWeight: "800",
            textAlign: "center",
          }}
        >
          You're Doing Great!
        </Text>
        <Text
          style={{
            color: COLORS.textGrey,
            fontSize: 28,
            marginTop: 8,
            textAlign: "center",
          }}
        >
          {t("feedback_subheadline")}
        </Text>
      </View>

      <View
        style={{
          borderRadius: 32,
          padding: 40,
          backgroundColor: COLORS.cardBg,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{ color: COLORS.textWhite, fontSize: 28, fontWeight: "700" }}
          >
            {t("overall_score")}
          </Text>
          {xpEarned > 0 && (
            <View
              style={{
                backgroundColor: "rgba(43, 238, 121, 0.15)",
                paddingHorizontal: 18,
                paddingVertical: 8,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: COLORS.primary,
              }}
            >
              <Text style={{ color: COLORS.primary, fontWeight: "700" }}>
                🔥 +{xpEarned} XP
              </Text>
            </View>
          )}
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 18,
          }}
        >
          <Text
            style={{ color: COLORS.textWhite, fontSize: 28, fontWeight: "700" }}
          >
            {t("cefr_level", { level: data.cefr })}
          </Text>
          <Text
            style={{ color: COLORS.primary, fontSize: 46, fontWeight: "900" }}
          >
            {data.score}/100
          </Text>
        </View>

        <View
          style={{
            height: 14,
            backgroundColor: "#27272a",
            borderRadius: 8,
            marginTop: 18,
          }}
        >
          <View
            style={{
              width: `${Math.max(0, Math.min(100, data.score))}%`,
              height: "100%",
              backgroundColor: COLORS.primary,
              borderRadius: 8,
            }}
          />
        </View>

        <Text style={{ color: COLORS.textGrey, marginTop: 18, fontSize: 22 }}>
          {data.comment}
        </Text>

        <Text
          style={{
            color: "rgba(255,255,255,0.25)",
            fontSize: 18,
            textAlign: "right",
            marginTop: 24,
          }}
        >
          RolyAI
        </Text>
      </View>
    </View>
  );
};
