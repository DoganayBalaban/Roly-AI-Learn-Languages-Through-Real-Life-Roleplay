import React, { useState } from "react";
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
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { COLORS } from "../constants/color";
import { saveWord } from "../services/api"; // <-- EKLENDI

// --- ACCORDION COMPONENT ---
const GrammarItem = ({ original, correction, explanation }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.accordionContainer}>
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
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { feedback, xpEarned } = route.params || { feedback: {}, xpEarned: 0 };

  // --- LOCAL STATE: O an kaydedilen kelimeleri takip etmek için ---
  const [savedLocalWords, setSavedLocalWords] = useState<string[]>([]);

  const data = {
    score: feedback?.score || 0,
    cefr: feedback?.cefr || "A1",
    grammarMistakes: feedback?.grammarMistakes || [],
    suggestions: feedback?.suggestions || [],
    vocabulary: feedback?.vocabularySuggestions || [],
    comment: feedback?.overallComment || "Pratik tamamlandı.",
  };

  // --- KELİME KAYDETME FONKSİYONU ---
  const handleSaveSuggestion = async (word: string) => {
    // Zaten kaydettiyse tekrar işlem yapma
    if (savedLocalWords.includes(word)) return;

    try {
      // Backend'e kaydet (Context olarak "Feedback Önerisi" gönderiyoruz)
      await saveWord(word, "Feedback Raporu Önerisi");

      // State güncelle (İkonu dolu yapmak için)
      setSavedLocalWords((prev) => [...prev, word]);

      Alert.alert("Kaydedildi", `"${word}" kelime defterine eklendi.`);
    } catch (error) {
      Alert.alert("Bilgi", "Bu kelime zaten kayıtlı olabilir.");
      // Hata olsa bile UI'da kaydedilmiş gibi gösterelim ki kullanıcı tekrar basmasın
      setSavedLocalWords((prev) => [...prev, word]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Performans Raporun</Text>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="share" size={24} color={COLORS.textWhite} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* BAŞLIK */}
        <View style={styles.headlineContainer}>
          <Text style={styles.headline}>Harika Gidiyorsun!</Text>
          <Text style={styles.subHeadline}>
            İşte konuşma performansının bir özeti.
          </Text>
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
            <Text style={styles.cardTitle}>Genel Puan</Text>
            {xpEarned > 0 && (
              <View style={styles.xpBadge}>
                <Text style={styles.xpText}>🔥 +{xpEarned} XP</Text>
              </View>
            )}
          </View>

          <View style={styles.scoreRow}>
            <Text style={styles.cefrText}>CEFR Seviyesi ({data.cefr})</Text>
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
              <Text style={styles.cardTitle}>Gramer İncelemesi</Text>
            </View>
            <View style={styles.gap12}>
              {data.grammarMistakes.map((item: any, index: number) => (
                <GrammarItem key={index} {...item} />
              ))}
            </View>
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
              <Text style={styles.cardTitle}>Daha Akıcı Konuş</Text>
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
              <Text style={styles.cardTitle}>Kelime Hazineni Genişlet</Text>
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
                          Bu kelimeyi öğrenmek için kaydet.
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
          <Text style={styles.secondaryButtonText}>Ana Sayfaya Dön</Text>
        </TouchableOpacity>
      </ScrollView>
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
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 12,
    overflow: "hidden",
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
});
