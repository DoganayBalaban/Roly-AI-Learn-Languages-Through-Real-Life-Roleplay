import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons"; // İkon için ekledim
import api from "../services/api";
import * as Speech from "expo-speech";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
}

// Renkler
const COLORS = {
  primary: "#2bee79",
  backgroundDark: "#102217",
  userBubble: "#2bee79",
  botBubble: "rgba(255,255,255,0.1)",
  textWhite: "#FFFFFF",
};

export default function ChatScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { sessionId, title } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true); // İlk açılış yüklemesi
  const flatListRef = useRef<FlatList>(null);

  // --- 1. ESKİ MESAJLARI YÜKLEME MANTIĞI ---
  useEffect(() => {
    navigation.setOptions({ title: title || "Chat" });

    const loadSessionHistory = async () => {
      if (!sessionId) {
        setFetchingHistory(false);
        return;
      }

      try {
        const response = await api.get(`/chat/${sessionId}`);
        const sessionData = response.data;

        // Backend mesajlarını UI formatına çevir
        const history: Message[] = sessionData.messages
          .filter((msg: any) => msg.role !== "system") // System mesajını gizle
          .map((msg: any) => ({
            id: msg._id || Math.random().toString(),
            text: msg.content,
            sender: msg.role === "assistant" ? "bot" : "user",
          }));

        setMessages(history);
      } catch (error) {
        console.log("Geçmiş yüklenemedi", error);
      } finally {
        setFetchingHistory(false);
      }
    };

    loadSessionHistory();
  }, [sessionId]);

  // --- 2. MESAJ GÖNDERME ---
  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsgText = inputText;
    setInputText("");

    const userMsg: Message = {
      id: Date.now().toString(),
      text: userMsgText,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMsg]);

    setLoading(true);
    try {
      const response = await api.post("/chat/message", {
        sessionId,
        message: userMsgText,
      });

      const botReply = response.data.reply;
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: botReply,
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMsg]);

      // Seslendirme (Opsiyonel)
      Speech.speak(botReply, { language: "en-US", rate: 0.9 });
    } catch (error) {
      Alert.alert("Hata", "Mesaj gönderilemedi.");
    } finally {
      setLoading(false);
    }
  };

  // --- 3. OTURUMU BİTİRME ---
  const endSession = async () => {
    try {
      const response = await api.post("/chat/end", { sessionId });
      Alert.alert(
        "Tebrikler! 🎉",
        `Pratiği tamamladın.\n\nPuanın: ${response.data.score}/100\n\nÖneri: ${response.data.overallComment}`,
        [{ text: "Ana Sayfaya Dön", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert("Hata", "Analiz alınamadı.");
    }
  };

  if (fetchingHistory) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ color: "white", marginTop: 10 }}>
          Sohbet yükleniyor...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Üst Bar (Custom Header) */}
      <View style={styles.topBar}>
        <Text style={styles.headerTitle}>{title}</Text>
        <TouchableOpacity onPress={endSession} style={styles.endButton}>
          <Text style={styles.endButtonText}>Bitir</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.sender === "user" ? styles.userBubble : styles.botBubble,
            ]}
          >
            <Text
              style={[
                styles.text,
                item.sender === "user" ? styles.userText : styles.botText,
              ]}
            >
              {item.text}
            </Text>
          </View>
        )}
      />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingText}>Yazıyor...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Mesaj yaz..."
          placeholderTextColor="#666"
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <MaterialIcons name="send" size={24} color={COLORS.backgroundDark} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundDark },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginTop: Platform.OS === "ios" ? 0 : 30,
  },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  endButton: {
    backgroundColor: "rgba(255, 68, 68, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  endButtonText: { color: "#ff4444", fontWeight: "bold", fontSize: 14 },

  list: { padding: 20, paddingBottom: 40 },
  bubble: { maxWidth: "80%", padding: 14, borderRadius: 20, marginBottom: 12 },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.userBubble,
    borderBottomRightRadius: 4,
  },
  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.botBubble,
    borderBottomLeftRadius: 4,
  },

  text: { fontSize: 16, lineHeight: 22 },
  userText: { color: COLORS.backgroundDark, fontWeight: "500" },
  botText: { color: COLORS.textWhite },

  inputContainer: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: COLORS.backgroundDark,
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 10,
    color: "white",
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 25,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 20,
    marginBottom: 10,
  },
  loadingText: { marginLeft: 8, color: COLORS.primary, fontSize: 12 },
});
