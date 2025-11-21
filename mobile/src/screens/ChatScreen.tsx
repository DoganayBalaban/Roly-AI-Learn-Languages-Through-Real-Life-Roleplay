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
import api from "../services/api";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
}

export default function ChatScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { sessionId, title } = route.params; // HomeScreen'den gelen veriler

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Ekran başlığını ayarla
    navigation.setOptions({ title: title || "Chat" });

    // İlk sistem mesajını (Botun başlangıcını) manuel ekleyelim mi?
    // Şimdilik boş başlıyor, kullanıcı "Hi" diyecek.
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsgText = inputText;
    setInputText(""); // Inputu temizle

    // 1. Kullanıcı mesajını ekrana bas (Optimistic UI)
    const userMsg: Message = {
      id: Date.now().toString(),
      text: userMsgText,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMsg]);

    setLoading(true);
    try {
      // 2. Backend'e gönder
      const response = await api.post("/chat/message", {
        sessionId,
        message: userMsgText,
      });

      // 3. Botun cevabını ekrana bas
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data.reply,
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      Alert.alert("Hata", "Mesaj gönderilemedi.");
    } finally {
      setLoading(false);
    }
  };

  const endSession = async () => {
    try {
      const response = await api.post("/chat/end", { sessionId });
      Alert.alert(
        "Oturum Bitti",
        `Puanın: ${response.data.score}\n\nÖneri: ${response.data.overallComment}`,
        [{ text: "Tamam", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert("Hata", "Analiz alınamadı.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90} // Header yüksekliği kadar
    >
      {/* Üst Bar: Bitir Butonu */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={endSession} style={styles.endButton}>
          <Text style={styles.endButtonText}>Bitir & Analiz Et</Text>
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
          <ActivityIndicator size="small" color="#666" />
          <Text style={styles.loadingText}>Yazıyor...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Mesaj yaz..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Go</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },
  topBar: {
    padding: 10,
    backgroundColor: "#fff",
    alignItems: "flex-end",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  endButton: { backgroundColor: "#ff9800", padding: 8, borderRadius: 5 },
  endButtonText: { color: "white", fontWeight: "bold", fontSize: 12 },
  list: { padding: 20 },
  bubble: { maxWidth: "80%", padding: 12, borderRadius: 15, marginBottom: 10 },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 2,
  },
  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderBottomLeftRadius: 2,
  },
  text: { fontSize: 16 },
  userText: { color: "white" },
  botText: { color: "#333" },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    borderRadius: 20,
    padding: 10,
    width: 45,
    alignItems: "center",
  },
  sendButtonText: { color: "white", fontWeight: "bold" },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 20,
    marginBottom: 10,
  },
  loadingText: { marginLeft: 5, color: "#666", fontSize: 12 },
});
