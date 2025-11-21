import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { COLORS } from "../constants/color";

// --- ACCORDION COMPONENT (Gramer Hataları İçin) ---
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
            <Text style={styles.correctionText}>
              {/* Düzeltilen kelimeyi vurgulamak zor olduğu için basit string basıyoruz, 
                  gelişmiş versiyonda kelime kelime diff alınabilir */}
              {correction}
            </Text>
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

  // ChatScreen'den gelen veriler (Yoksa varsayılan verilerle test et)
  const { feedback } = route.params || { feedback: {} };

  // Eğer feedback boş gelirse (Test amaçlı dummy data)
  const data = {
    score: feedback?.score || 75,
    cefr: feedback?.cefr || "A2",
    grammarMistakes: feedback?.grammarMistakes || [
      {
        original: "I is going to the market.",
        correction: "I am going to the market.",
        explanation: '"I" öznesi ile "am" kullanılır.',
      },
      {
        original: "She have two cats.",
        correction: "She has two cats.",
        explanation: '3. tekil şahıs (she) için "has" kullanılır.',
      },
    ],
    suggestions: feedback?.suggestions || [
      // "Daha Akıcı Konuş"
      "I'm feeling a bit peckish. (I want to eat now)",
      "That's outstanding! (It is very good)",
    ],
    vocabulary: feedback?.vocabularySuggestions || ["Essential", "Collaborate"],
    comment: feedback?.overallComment || "Harika bir ilerleme kaydettin!",
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* --- HEADER --- */}
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
        {/* --- BAŞLIK --- */}
        <View style={styles.headlineContainer}>
          <Text style={styles.headline}>Harika Gidiyorsun!</Text>
          <Text style={styles.subHeadline}>
            İşte konuşma performansının bir özeti.
          </Text>
        </View>

        {/* --- SKOR KARTI --- */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Genel Puan</Text>
          <View style={styles.scoreRow}>
            <Text style={styles.cefrText}>CEFR Seviyesi ({data.cefr})</Text>
            <Text style={styles.scoreText}>{data.score}/100</Text>
          </View>
          {/* Progress Bar */}
          <View style={styles.progressBarBg}>
            <View
              style={[styles.progressBarFill, { width: `${data.score}%` }]}
            />
          </View>
          <Text style={styles.commentText}>{data.comment}</Text>
        </View>

        {/* --- GRAMER İNCELEMESİ --- */}
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

        {/* --- DAHA AKICI KONUŞ (Suggestions) --- */}
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

        {/* --- KELİME HAZİNESİ --- */}
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
              {data.vocabulary.map((word: string, index: number) => (
                <View key={index} style={styles.vocabRow}>
                  <MaterialIcons
                    name="arrow-forward"
                    size={20}
                    color={COLORS.primary}
                    style={{ marginTop: 2 }}
                  />
                  <View>
                    <Text style={styles.vocabWord}>{word}</Text>
                    {/* Backend sadece kelime dönüyorsa açıklama kısmı boş kalabilir veya AI'dan istenebilir */}
                    <Text style={styles.vocabDesc}>
                      Bu kelimeyi cümle içinde kullanmayı dene.
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* --- ANA SAYFA BUTONU --- */}
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate("MainTabs")} // Veya 'Home'
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
  cardHeaderCenter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.textWhite },

  // Score Card
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

  // Accordion
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

  // Suggestions
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

  // Vocab
  vocabRow: { flexDirection: "row", gap: 12 },
  vocabWord: { color: COLORS.textWhite, fontSize: 16, fontWeight: "600" },
  vocabDesc: { color: COLORS.textGrey, fontSize: 14 },

  // CTA Card
  ctaCard: {
    backgroundColor: "rgba(43, 238, 121, 0.1)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
  },
  ctaText: { color: "#d1d5db", textAlign: "center", marginBottom: 20 },

  // Buttons
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
  },
  primaryButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: "bold",
  },

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
