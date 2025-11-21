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
  SafeAreaView,
  StatusBar,
  Animated,
  Alert,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import api from "../services/api";
import { COLORS } from "../constants/color";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
}

// --- TYPING INDICATOR COMPONENT (Dinamik Avatar) ---
const TypingIndicator = ({ avatarUrl }: { avatarUrl: string }) => {
  const opacity1 = useRef(new Animated.Value(0.3)).current;
  const opacity2 = useRef(new Animated.Value(0.3)).current;
  const opacity3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = (anim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
            delay,
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animate(opacity1, 0);
    animate(opacity2, 200);
    animate(opacity3, 400);
  }, []);

  return (
    <View style={styles.typingContainer}>
      <Image source={{ uri: avatarUrl }} style={styles.avatarSmall} />
      <View style={styles.typingBubble}>
        <Animated.View style={[styles.typingDot, { opacity: opacity1 }]} />
        <Animated.View style={[styles.typingDot, { opacity: opacity2 }]} />
        <Animated.View style={[styles.typingDot, { opacity: opacity3 }]} />
      </View>
    </View>
  );
};

export default function ChatScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { sessionId, title } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  // DİNAMİK KİŞİLİK STATE'LERİ
  const [botRole, setBotRole] = useState<string>("Asistan"); // Varsayılan

  const flatListRef = useRef<FlatList>(null);

  // Avatar URL'ini Role göre üret (Seed mantığı sayesinde her rolün avatarı sabit kalır)
  // 'avataaars' stili eğlenceli karakterler üretir.
  const botAvatarUrl = `https://api.dicebear.com/9.x/avataaars/png?seed=${botRole}`;

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);

  // Geçmiş Mesajları ve Rolü Yükle
  useEffect(() => {
    const loadSessionData = async () => {
      if (!sessionId) return;
      try {
        const response = await api.get(`/chat/${sessionId}`);

        // 1. BACKEND'DEN ROLÜ AL
        if (response.data.role) {
          setBotRole(response.data.role);
        }

        // 2. MESAJLARI YÜKLE
        const history: Message[] = response.data.messages
          .filter((msg: any) => msg.role !== "system")
          .map((msg: any) => ({
            id: msg._id || Math.random().toString(),
            text: msg.content,
            sender: msg.role === "assistant" ? "bot" : "user",
          }));
        setMessages(history);
      } catch (error) {
        console.log("Oturum verisi yüklenemedi");
      }
    };
    loadSessionData();
  }, [sessionId]);

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
      setLoading(false);
    } catch (error) {
      setLoading(false);
      Alert.alert("Hata", "Mesaj gönderilemedi.");
    }
  };

  const endSession = async () => {
    try {
      const response = await api.post("/chat/end", { sessionId });

      // Alert yerine Feedback sayfasına yönlendir
      // Backend'den gelen tüm raporu (response.data) parametre olarak gönderiyoruz
      navigation.navigate("Feedback", { feedback: response.data });
    } catch (error) {
      Alert.alert("Hata", "Rapor alınamadı.");
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isBot = item.sender === "bot";
    return (
      <View style={[styles.messageRow, !isBot && styles.messageRowUser]}>
        {/* Dinamik Avatar */}
        {isBot && (
          <Image source={{ uri: botAvatarUrl }} style={styles.avatarSmall} />
        )}

        <View
          style={[styles.bubble, isBot ? styles.bubbleBot : styles.bubbleUser]}
        >
          <Text
            style={[
              styles.messageText,
              isBot ? styles.textWhite : styles.textBlack,
            ]}
          >
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.backgroundDark}
      />

      {/* --- HEADER --- */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={28} color={COLORS.textWhite} />
        </TouchableOpacity>

        <View style={styles.headerProfile}>
          {/* Dinamik Header Avatarı */}
          <Image source={{ uri: botAvatarUrl }} style={styles.avatarHeader} />
          <View>
            {/* Dinamik İsim (Rol) */}
            <Text style={styles.headerName}>{botRole}</Text>
            <Text style={styles.headerScenario}>{title || "Pratik"}</Text>
          </View>
        </View>
      </View>

      {/* --- CHAT LIST --- */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        // Typing Indicator'a da dinamik avatarı gönderiyoruz
        ListFooterComponent={
          loading ? <TypingIndicator avatarUrl={botAvatarUrl} /> : null
        }
      />

      {/* --- FOOTER --- */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <View style={styles.footer}>
          <TouchableOpacity onPress={endSession} style={styles.endButton}>
            <Text style={styles.endButtonText}>Konuşmayı Bitir</Text>
          </TouchableOpacity>

          <View style={styles.inputRow}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Mesajını yaz..."
                placeholderTextColor="#6b7280"
                multiline
              />
              <TouchableOpacity onPress={sendMessage} style={styles.sendIcon}>
                <MaterialCommunityIcons
                  name="send"
                  size={22}
                  color={COLORS.textWhite}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.micButton}>
              <MaterialIcons
                name="mic"
                size={28}
                color={COLORS.backgroundDark}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Styles kısmı aynı kalabilir, değişiklik yok.
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundDark },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
  },
  headerProfile: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatarHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#333",
  },
  headerName: { color: COLORS.textWhite, fontSize: 16, fontWeight: "bold" },
  headerScenario: { color: COLORS.textGrey, fontSize: 12 },
  listContent: { padding: 16, paddingBottom: 20 },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 16,
    maxWidth: "85%",
  },
  messageRowUser: { alignSelf: "flex-end", justifyContent: "flex-end" },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  bubble: { padding: 16, borderRadius: 20 },
  bubbleBot: { backgroundColor: COLORS.bubbleBot, borderBottomLeftRadius: 4 },
  bubbleUser: {
    backgroundColor: COLORS.bubbleUser,
    borderBottomRightRadius: 4,
  },
  messageText: { fontSize: 16, lineHeight: 22 },
  textWhite: { color: COLORS.textWhite },
  textBlack: { color: COLORS.backgroundDark, fontWeight: "500" },
  typingContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.bubbleBot,
    padding: 16,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    gap: 6,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#9ca3af",
  },
  footer: {
    padding: 16,
    backgroundColor: COLORS.backgroundDark,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  endButton: {
    width: "100%",
    backgroundColor: COLORS.buttonGrey,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 16,
  },
  endButtonText: { color: COLORS.textWhite, fontWeight: "bold", fontSize: 14 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  inputWrapper: { flex: 1, position: "relative", justifyContent: "center" },
  input: {
    backgroundColor: COLORS.inputBg,
    color: COLORS.textWhite,
    borderRadius: 25,
    paddingLeft: 20,
    paddingRight: 50,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
  },
  sendIcon: {
    position: "absolute",
    right: 8,
    backgroundColor: "#374151",
    padding: 8,
    borderRadius: 20,
  },
  micButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
});
