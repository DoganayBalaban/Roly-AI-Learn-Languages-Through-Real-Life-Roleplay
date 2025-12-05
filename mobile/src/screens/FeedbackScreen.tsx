// FeedbackScreen.js
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { COLORS } from "../constants/color";
import { saveWord } from "../services/api";
import ViewShot from "react-native-view-shot";
import Share from "react-native-share";
import { ShareCard } from "../components/ShareCard";
import { useAuth } from "../context/AuthContext";

// --- PRONUNCIATION ITEM COMPONENT ---
const PronunciationItem = ({
  word,
  correctPronunciation,
  explanation,
}: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View
      style={[styles.accordionContainer, { borderLeftColor: COLORS.danger }]}
    >
      <TouchableOpacity
        style={styles.accordionHeader}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.7}
      >
        <View style={styles.accordionTitleRow}>
          <MaterialIcons
            name="volume-up"
            size={20}
            color={COLORS.danger}
            style={{ marginTop: 2 }}
          />
          <Text style={styles.accordionTitle}>{word}</Text>
        </View>
        <MaterialIcons
          name={isOpen ? "expand-less" : "expand-more"}
          size={24}
          color={COLORS.textWhite}
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.accordionBody}>
          <View style={styles.correctionRow}>
            <MaterialIcons
              name="volume-up"
              size={20}
              color={COLORS.success}
              style={{ marginTop: 2 }}
            />
            <Text style={styles.correctionText}>
              {word} → {correctPronunciation}
            </Text>
          </View>
          <Text style={styles.explanationText}>{explanation}</Text>
        </View>
      )}
    </View>
  );
};

// --- GRAMMAR ITEM COMPONENT ---
const GrammarItem = ({ original, correction, explanation }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View
      style={[styles.accordionContainer, { borderLeftColor: COLORS.error }]}
    >
      <TouchableOpacity
        style={styles.accordionHeader}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.7}
      >
        <View style={styles.accordionTitleRow}>
          <MaterialIcons
            name="error-outline"
            size={20}
            color={COLORS.error}
            style={{ marginTop: 2 }}
          />
          <Text style={styles.accordionTitle}>{original}</Text>
        </View>
        <MaterialIcons
          name={isOpen ? "expand-less" : "expand-more"}
          size={24}
          color={COLORS.textWhite}
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.accordionBody}>
          <View style={styles.correctionRow}>
            <MaterialIcons
              name="check-circle"
              size={20}
              color={COLORS.success}
              style={{ marginTop: 2 }}
            />
            <Text style={styles.correctionText}>{correction}</Text>
          </View>
          <Text style={styles.explanationText}>{explanation}</Text>
        </View>
      )}
    </View>
  );
};

export default function FeedbackScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();

  const shotRef = useRef<any>(null);
  const [savedLocalWords, setSavedLocalWords] = useState<string[]>([]);
  const [sharing, setSharing] = useState(false);

  const { feedback, xpEarned } = route.params || { feedback: {}, xpEarned: 0 };

  const data = {
    score: feedback?.score || 0,
    cefr: feedback?.cefr || "A1",
    grammarMistakes: feedback?.grammarMistakes || [],
    pronunciationMistakes: feedback?.pronunciationMistakes || [],
    suggestions: feedback?.suggestions || [],
    vocabulary: feedback?.vocabularySuggestions || [],
    comment: feedback?.overallComment || "Pratik tamamlandı.",
  };

  // --- KELİME KAYDETME FONKSİYONU ---
  const handleSaveSuggestion = async (word: string) => {
    if (savedLocalWords.includes(word)) return;

    try {
      await saveWord(word, "Feedback Raporu Önerisi");
      setSavedLocalWords((prev) => [...prev, word]);
      Alert.alert(t("word_saved"), t("word_saved_message", { word }));
    } catch (error) {
      Alert.alert(t("info"), t("word_already_saved"));
      setSavedLocalWords((prev) => [...prev, word]);
    }
  };

  // --- METİN PAYLAŞIMI (FALLBACK) ---
  const generateShareMessage = (feedbackData: any) => {
    let message = `${t("feedback_share_message")}\n\n`;

    message += `⭐ ${t("overall_score")}: ${feedbackData.score}/100\n`;
    message += `📊 ${t("cefr_level", { level: feedbackData.cefr })}\n\n`;

    if (feedbackData.grammarMistakes?.length > 0) {
      message += `📝 ${t("grammar_review")}:\n`;
      feedbackData.grammarMistakes.forEach((mistake: any, index: number) => {
        message += `${index + 1}. ${mistake.original} → ${
          mistake.correction
        }\n`;
      });
      message += "\n";
    }

    if (feedbackData.pronunciationMistakes?.length > 0) {
      message += `🔊 ${t("pronunciation_review")}:\n`;
      feedbackData.pronunciationMistakes.forEach(
        (mistake: any, index: number) => {
          message += `${index + 1}. ${mistake.word} → ${
            mistake.correctPronunciation
          }\n`;
        }
      );
      message += "\n";
    }

    if (feedbackData.suggestions?.length > 0) {
      message += `💡 ${t("suggestions")}:\n`;
      feedbackData.suggestions.forEach((suggestion: string, index: number) => {
        message += `• ${suggestion}\n`;
      });
      message += "\n";
    }

    if (feedbackData.comment) {
      message += `💬 ${t("feedback_comment")}:\n${feedbackData.comment}\n\n`;
    }

    message += t("shared_via_roly");

    return message;
  };

  // --- PAYLAŞIM: ÖNCE GÖRSEL, BAŞARISIZSA METİN FALLBACK ---
  const handleShare = async () => {
    try {
      setSharing(true);

      // capture: result tmpfile -> geçici dosya yolu
      const uri = await shotRef.current.capture({
        format: "png",
        quality: 0.95,
        result: "tmpfile",
        width: 1080, // yüksek çözünürlük için fixed width
      });

      const shareOptions: any = {
        title: t("feedback_share_title"),
        url: Platform.OS === "android" ? "file://" + uri : uri,
        message: t("feedback_share_message"),
        failOnCancel: false,
      };

      await Share.open(shareOptions);
    } catch (error) {
      console.warn("Image share failed, falling back to text share:", error);
      try {
        await Share.open({
          message: generateShareMessage(data),
          failOnCancel: false,
        });
      } catch (e) {
        console.error("Text share failed:", e);
        Alert.alert(t("error"), t("share_error"));
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton}></TouchableOpacity>
        <Text style={styles.headerTitle}>{t("feedback_title")}</Text>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleShare}
          accessibilityLabel={t("share_feedback")}
          accessibilityHint={t("share_feedback_hint")}
        >
          <MaterialIcons name="share" size={24} color={COLORS.textWhite} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* BAŞLIK */}
        <View style={styles.headlineContainer}>
          <Text style={styles.headline}>{t("feedback_headline")}</Text>
          <Text style={styles.subHeadline}>{t("feedback_subheadline")}</Text>
        </View>

        {/* SKOR KARTI */}
        <View style={styles.card}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={styles.cardTitle}>{t("overall_score")}</Text>
            {xpEarned > 0 && (
              <View style={styles.xpBadge}>
                <Text style={styles.xpText}>🔥 +{xpEarned} XP</Text>
              </View>
            )}
          </View>

          <View style={styles.scoreRow}>
            <Text style={styles.cefrText}>
              {t("cefr_level", { level: data.cefr })}
            </Text>
            <Text style={styles.scoreText}>{data.score}/100</Text>
          </View>

          <View style={styles.progressBarBg}>
            <View
              style={[styles.progressBarFill, { width: `${data.score}%` }]}
            />
          </View>
          <Text style={styles.commentText}>{data.comment}</Text>
        </View>

        {/* GRAMER */}
        {data.grammarMistakes.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons
                name="auto-stories"
                size={24}
                color={COLORS.primary}
              />
              <Text style={styles.cardTitle}>{t("grammar_review")}</Text>
            </View>
            <View style={styles.gap12}>
              {data.grammarMistakes.map((item: any, index: number) => (
                <GrammarItem key={`grammar-${index}`} {...item} />
              ))}
            </View>
          </View>
        )}

        {/* PRONUNCIATION */}
        {data.pronunciationMistakes.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="volume-up" size={24} color={COLORS.danger} />
              <Text style={styles.cardTitle}>{t("pronunciation_review")}</Text>

              {/* Premium değilse başlığın yanına küçük bir kilit ikonu koyalım */}
              {!user?.isPremium && (
                <View style={styles.lockBadge}>
                  <MaterialIcons
                    name="lock"
                    size={14}
                    color={COLORS.textWhite}
                  />
                  <Text style={styles.lockBadgeText}>PRO</Text>
                </View>
              )}
            </View>

            {user?.isPremium ? (
              // --- KULLANICI PREMIUM İSE LİSTEYİ GÖSTER ---
              <View style={styles.gap12}>
                {data.pronunciationMistakes.map((item: any, index: number) => (
                  <PronunciationItem key={`pronunciation-${index}`} {...item} />
                ))}
              </View>
            ) : (
              // --- KULLANICI PREMIUM DEĞİLSE KİLİT EKRANI GÖSTER ---
              <View style={styles.lockedContainer}>
                <View style={styles.lockedIconBg}>
                  <MaterialIcons name="lock" size={32} color={COLORS.primary} />
                </View>
                <Text style={styles.lockedTitle}>
                  {t("unlock_pronunciation")}
                </Text>
                <Text style={styles.lockedSub}>
                  {t("unlock_pronunciation_desc")}
                </Text>

                <TouchableOpacity
                  style={styles.upgradeButton}
                  onPress={() => navigation.navigate("Paywall")} // Premium alma sayfana yönlendir
                >
                  <Text style={styles.upgradeButtonText}>
                    {t("go_premium")}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* ÖNERİLER */}
        {data.suggestions.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons
                name="chat-bubble-outline"
                size={24}
                color={COLORS.primary}
              />
              <Text style={styles.cardTitle}>{t("speak_more_fluently")}</Text>
            </View>
            <View style={styles.gap12}>
              {data.suggestions.map((item: string, index: number) => (
                <View key={index}>
                  <Text style={styles.suggestionText}>"{item}"</Text>
                  {index < data.suggestions.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* --- KELİME ÖNERİLERİ (GÜNCELLENDİ) --- */}
        {data.vocabulary.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons
                name="lightbulb"
                size={24}
                color={COLORS.primary}
              />
              <Text style={styles.cardTitle}>{t("expand_vocabulary")}</Text>
            </View>
            <View style={styles.gap12}>
              {data.vocabulary.map((word: string, index: number) => {
                const isSaved = savedLocalWords.includes(word);
                return (
                  <View key={index} style={styles.vocabRow}>
                    <View style={styles.vocabLeft}>
                      <MaterialIcons
                        name="arrow-forward"
                        size={20}
                        color={COLORS.primary}
                        style={{ marginTop: 2 }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.vocabWord}>{word}</Text>
                        <Text style={styles.vocabDesc}>
                          {t("save_word_desc")}
                        </Text>
                      </View>
                    </View>

                    {/* KAYDET BUTONU */}
                    <TouchableOpacity
                      onPress={() => handleSaveSuggestion(word)}
                      style={styles.saveIconBtn}
                    >
                      <MaterialIcons
                        name={isSaved ? "bookmark" : "bookmark-border"}
                        size={24}
                        color={isSaved ? COLORS.primary : COLORS.textGrey}
                      />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* BUTON */}
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate("MainTabs")}
        >
          <Text style={styles.secondaryButtonText}>{t("back_to_home")}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Offscreen ShareCard for capture (görünmez, ekranı bozmaz) */}
      <View style={{ position: "absolute", left: -10000, top: -10000 }}>
        <ViewShot ref={shotRef} options={{ format: "png", quality: 0.95 }}>
          <ShareCard data={data} xpEarned={xpEarned} />
        </ViewShot>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.textWhite },
  scrollContent: { padding: 20, paddingBottom: 40 },
  headlineContainer: { alignItems: "center", marginBottom: 24 },
  headline: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.textWhite,
    marginBottom: 8,
  },
  subHeadline: { fontSize: 16, color: COLORS.textGrey },

  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.textWhite },

  xpBadge: {
    backgroundColor: "rgba(43, 238, 121, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  xpText: {
    color: COLORS.primary,
    fontWeight: "bold",
    fontSize: 14,
  },

  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: 12,
    marginBottom: 12,
  },
  cefrText: { fontSize: 16, color: COLORS.textWhite, fontWeight: "500" },
  scoreText: { fontSize: 24, color: COLORS.primary, fontWeight: "bold" },
  progressBarBg: {
    height: 8,
    backgroundColor: "#27272a",
    borderRadius: 4,
    width: "100%",
    marginBottom: 12,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  commentText: { fontSize: 14, color: COLORS.textGrey },

  gap12: { gap: 12 },
  accordionContainer: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 8,
    overflow: "hidden",
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error, // Default color, can be overridden
    marginBottom: 12,
  },
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  accordionTitleRow: { flexDirection: "row", gap: 12, flex: 1 },
  accordionTitle: {
    color: COLORS.textWhite,
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
  accordionBody: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  correctionRow: { flexDirection: "row", gap: 12, marginBottom: 8 },
  correctionText: {
    color: COLORS.textWhite,
    fontSize: 15,
    fontWeight: "bold",
    flex: 1,
  },
  explanationText: { color: COLORS.textGrey, fontSize: 14, paddingLeft: 32 },
  suggestionText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontStyle: "italic",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 12,
  },

  // Vocab Styles
  vocabRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  vocabLeft: { flexDirection: "row", gap: 12, flex: 1 },
  vocabWord: { color: COLORS.textWhite, fontSize: 16, fontWeight: "600" },
  vocabDesc: { color: COLORS.textGrey, fontSize: 14 },
  saveIconBtn: { padding: 8 },

  secondaryButton: {
    backgroundColor: "#27272a",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: "bold",
  },
  lockBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fbbf24", // Amber rengi
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
    marginLeft: "auto", // Sağa yaslar
  },
  lockBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000",
  },
  lockedContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    backgroundColor: "rgba(0,0,0,0.2)", // Hafif koyu bir zemin
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    borderStyle: "dashed", // Kesikli çizgi şık durur
  },
  lockedIconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(43, 238, 121, 0.1)", // Primary rengin opak hali
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  lockedTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textWhite,
    marginBottom: 8,
  },
  lockedSub: {
    fontSize: 14,
    color: COLORS.textGrey,
    textAlign: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
    lineHeight: 20,
  },
  upgradeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  upgradeButtonText: {
    color: "#000", // Primary üzerine siyah yazı okunabilirliği artırır
    fontWeight: "bold",
    fontSize: 14,
  },
});
