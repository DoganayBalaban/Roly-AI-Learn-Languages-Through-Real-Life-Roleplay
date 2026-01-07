import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Audio } from "expo-av";
import { Image } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  AdEventType,
  InterstitialAd,
  TestIds,
} from "react-native-google-mobile-ads";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import SkeletonItem from "../components/SkeletonItem";
import { COLORS } from "../constants/color";
import { ANALYTICS_EVENTS } from "../constants/events";
import { MALE_NAMES_LIST } from "../constants/name";
import { useAuth } from "../context/AuthContext";
import api, {
  getVoiceAudio,
  lookupWord,
  saveWord,
  translateSentence,
  uploadAudio,
} from "../services/api";
import { useAnalytics } from "../utils/analytics";
import { checkAndIncrementFeedbackCount } from "../utils/feedbackLimit";

// --- REKLAM BİRİMİ ---
const adUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID;

const interstitial = InterstitialAd.createForAdRequest(adUnitId!, {
  requestNonPersonalizedAdsOnly: true,
});

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
}

// --- TYPING INDICATOR (Yazıyor animasyonu) ---
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

// --- TIKLANABİLİR KELİME BİLEŞENİ ---
const ClickableMessage = ({
  text,
  onWordClick,
  style,
}: {
  text: string;
  onWordClick: (word: string) => void;
  style?: any;
}) => {
  const words = text.split(" ");

  return (
    <Text style={[style, { flexDirection: "row", flexWrap: "wrap" }]}>
      {words.map((word, index) => (
        <Text
          key={index}
          onPress={() => onWordClick(word.replace(/[.,!?]/g, ""))}
          style={{ marginBottom: -3 }}
        >
          {word}{" "}
        </Text>
      ))}
    </Text>
  );
};

export default function ChatScreen() {
  const { t } = useTranslation();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { sessionId, title } = route.params;
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const soundRef = useRef<Audio.Sound | null>(null);
  const scaleAnimVoiceBtn = useRef(new Animated.Value(1)).current;
  const scaleAnimEndSessionBtn = useRef(new Animated.Value(1)).current;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false); // Bot yazıyor mu?
  const [loadingFeedback, setLoadingFeedback] = useState(false); // Bitir butonuna basınca
  const { track } = useAnalytics();

  // Track conversation start time and abandonment
  const conversationStartTime = useRef<number>(Date.now());
  const hasTrackedStart = useRef<boolean>(false);
  const hasTrackedCompletion = useRef<boolean>(false);

  // Ses Kaydı
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Seslendirme durumu
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(
    null
  );
  const getVoiceForRole = (name: string) => {
    if (!name) return "shimmer"; // İsim yoksa varsayılan kadın

    // Listede var mı kontrol et (Büyük/küçük harf duyarsız)
    const isMale = MALE_NAMES_LIST.some(
      (maleName) => maleName.toLowerCase() === name.toLowerCase()
    );

    return isMale ? "onyx" : "shimmer";
  };
  // Reklam
  const [adLoaded, setAdLoaded] = useState(false);

  // Kelime Modalı
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWordData, setSelectedWordData] = useState<any>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  // Çeviri durumları
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedSentence, setTranslatedSentence] = useState<string>("");
  const [
    isTranslatedSentenceModalVisible,
    setIsTranslatedSentenceModalVisible,
  ] = useState(false);

  // Dinamik Rol ve Avatar
  const [botRole, setBotRole] = useState<string>("Asistan");
  const botAvatarUrl = `https://api.dicebear.com/9.x/avataaars/png?seed=${botRole}`;

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);

  // --- 1. REKLAM YÜKLEME ---
  useEffect(() => {
    if (user?.isPremium) return;

    const unsubscribe = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => {
        setAdLoaded(true);
      }
    );
    interstitial.load();
    return unsubscribe;
  }, [user]);

  // --- 2. GEÇMİŞ MESAJLARI YÜKLE ---
  useEffect(() => {
    const loadSessionData = async () => {
      if (!sessionId) return;
      try {
        const response = await api.get(`/chat/${sessionId}`);
        if (response.data.role) setBotRole(response.data.role);

        const history: Message[] = response.data.messages
          .filter((msg: any) => msg.role !== "system")
          .map((msg: any) => ({
            id: msg._id || Math.random().toString(),
            text: msg.content,
            sender: msg.role === "assistant" ? "bot" : "user",
          }));
        setMessages(history);

        // Track conversation started (only once, no message content)
        if (!hasTrackedStart.current) {
          track(ANALYTICS_EVENTS.CONVERSATION_STARTED, {
            session_id: sessionId,
            scenario_title: title,
            is_resuming: history.length > 0,
          });
          hasTrackedStart.current = true;
          conversationStartTime.current = Date.now();
        }
      } catch (error) {
        console.log("Oturum verisi yüklenemedi");
      }
    };
    loadSessionData();
  }, [sessionId, title, track]);

  // Track conversation abandonment when user navigates away
  useEffect(() => {
    return () => {
      // Component unmounting - check if conversation was abandoned
      if (hasTrackedStart.current && !hasTrackedCompletion.current) {
        const duration = Math.floor(
          (Date.now() - conversationStartTime.current) / 1000
        );
        track(ANALYTICS_EVENTS.CONVERSATION_ABANDONED, {
          session_id: sessionId,
          duration_seconds: duration,
          message_count: messages.length,
          last_action: "navigated_away",
        });
      }
    };
  }, [sessionId, messages.length, track]);

  // Mesajlar değiştiğinde otomatik scroll yap
  useEffect(() => {
    if (messages.length > 0) {
      // Kısa bir gecikme ile scroll yap (render tamamlanana kadar bekle)
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  // --- SES KAYDI ---
  const startRecording = async () => {
    Animated.spring(scaleAnimVoiceBtn, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 3,
      tension: 40,
    }).start();
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert(
          t("chat_permission_required"),
          t("chat_microphone_permission")
        );
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // m4a formatı (OpenAI uyumlu)
      const recordingOptions: any = {
        android: {
          extension: ".m4a",
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: ".m4a",
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.MAX,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: { mimeType: "audio/webm", bitsPerSecond: 128000 },
      };

      const { recording } = await Audio.Recording.createAsync(recordingOptions);
      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      console.error("Kayıt Başlatılamadı", error);
    }
  };

  const stopRecording = async () => {
    Animated.spring(scaleAnimVoiceBtn, {
      toValue: 1,
      useNativeDriver: true,
      friction: 3,
      tension: 40,
    }).start();
    if (!recording) return;
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);

    if (uri) {
      setLoading(true);
      try {
        const response = await uploadAudio(uri);
        if (response.text && response.text.trim()) {
          // Ses metne çevrildi, direkt gönder
          await sendMessage(response.text);
        } else {
          Alert.alert(t("chat_audio_warning"), t("chat_audio_warning"));
        }
      } catch (error) {
        Alert.alert(t("error"), t("chat_audio_error"));
      } finally {
        setLoading(false);
      }
    }
  };
  const handleSpeakMessage = async (text: string, messageId: string) => {
    // Aynı mesaj tekrar tıklanırsa iptal et
    if (speakingMessageId === messageId) {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      setSpeakingMessageId(null);
      return;
    }
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    const voiceId = getVoiceForRole(botRole);

    setSpeakingMessageId(messageId);
    try {
      // Backend'den sesi al (bu biraz zaman alabilir)
      const audioUri = await getVoiceAudio(text, voiceId);

      // Sesi oynat
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );
      soundRef.current = sound;

      // Ses oynatılmaya başladığında loading'i kaldır
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;

        // Ses normal şekilde bittiğinde
        if (status.didJustFinish) {
          sound.unloadAsync();
          soundRef.current = null;
          setSpeakingMessageId(null);
        }
      });
    } catch (error) {
      console.log("Ses çalma hatası:", error);
      if (soundRef.current) {
        try {
          await soundRef.current.unloadAsync();
        } catch {}
        soundRef.current = null;
      }
      setSpeakingMessageId(null);
      Alert.alert(t("error"), t("chat_audio_playback_error"));
    }
  };
  // --- MESAJ GÖNDERME ---
  const sendMessage = async (messageText?: string) => {
    const userMsgText = messageText || inputText;
    if (!userMsgText.trim()) return;

    if (!messageText) setInputText(""); // Input temizle

    const userMsg: Message = {
      id: Date.now().toString(),
      text: userMsgText,
      sender: "user",
    };

    // Mesajı hemen ekle
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
      Alert.alert(t("error"), t("chat_message_error"));
    }
  };

  // --- OTURUMU BİTİR (REKLAM & FEEDBACK) ---
  const endSession = async () => {
    try {
      setLoadingFeedback(true);
      const response = await api.post("/chat/end", { sessionId });

      const feedbackData = {
        feedback: response.data,
        xpEarned: response.data.xpEarned || 0,
      };

      // Track conversation completion (no message content, no user input)
      if (!hasTrackedCompletion.current) {
        const duration = Math.floor(
          (Date.now() - conversationStartTime.current) / 1000
        );
        track(ANALYTICS_EVENTS.CONVERSATION_COMPLETED, {
          session_id: sessionId,
          duration_seconds: duration,
          message_count: messages.length,
          xp_earned: response.data.xpEarned || 0,
        });
        hasTrackedCompletion.current = true;
      }

      // Premium olmayan kullanıcılar için günlük feedback limitini kontrol et
      if (!user?.isPremium) {
        const feedbackCheck = await checkAndIncrementFeedbackCount();

        if (!feedbackCheck.canView) {
          // Limit aşıldı, paywall'a yönlendir
          setLoadingFeedback(false);
          Alert.alert(
            t("feedback_limit_reached_title"),
            t("feedback_limit_reached_message"),
            [
              {
                text: t("cancel"),
                style: "cancel",
              },
              {
                text: t("go_premium"),
                onPress: () => navigation.navigate("Paywall"),
              },
            ]
          );
          return;
        }
      }

      const navigateToFeedback = () => {
        navigation.navigate("Feedback", feedbackData);
      };

      // Premium değilse ve reklam yüklendiyse göster
      if (!user?.isPremium && adLoaded) {
        const closeListener = interstitial.addAdEventListener(
          AdEventType.CLOSED,
          () => {
            navigateToFeedback();
            // Listener'ı temizlemesi zor olduğu için basit bırakıyoruz,
            // navigation unmount edeceği için sorun olmaz.
          }
        );
        interstitial.show();
      } else {
        navigateToFeedback();
      }
    } catch (error) {
      Alert.alert(t("error"), t("chat_feedback_error"));
    } finally {
      setLoadingFeedback(false);
    }
  };

  // --- KELİME MODALI İŞLEMLERİ ---
  const handleWordPress = async (word: string, fullSentence: string) => {
    setModalVisible(true);
    setIsLookingUp(true);
    setSelectedWordData({ word, context: fullSentence, translation: null });

    try {
      const res = await lookupWord(word, fullSentence);
      setSelectedWordData({
        word,
        context: fullSentence,
        translation: res.translation,
      });
    } catch (error) {
      console.log(error);
      setSelectedWordData({
        word,
        context: fullSentence,
        translation: t("chat_meaning_not_found"),
      });
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleSaveWord = async () => {
    if (!selectedWordData) return;
    try {
      await saveWord(selectedWordData.word, selectedWordData.context);
      setModalVisible(false);
      Alert.alert(t("success"), t("chat_word_saved"));
    } catch (error) {
      Alert.alert(t("error"), t("chat_save_error"));
    }
  };

  // Yeni: cümle çevirisi ve modal açma
  const handleTranslateSentence = async (sentence: string) => {
    if (!sentence) return;
    try {
      setIsTranslating(true);
      // Modal'ı aç (spinner gösterebilmek için önce aç)
      setIsTranslatedSentenceModalVisible(true);
      setTranslatedSentence(""); // temizle eski veriyi

      const res = await translateSentence(sentence);
      const translation = res?.translation || "";
      setTranslatedSentence(translation);
    } catch (error) {
      console.log("Çeviri hatası:", error);
      Alert.alert(t("error"), t("chat_translate_error"));
      setTranslatedSentence(t("chat_translate_error"));
    } finally {
      setIsTranslating(false);
    }
  };

  // --- RENDER ---
  const renderItem = ({ item }: { item: Message }) => {
    const isBot = item.sender === "bot";
    /**
     * Privacy Note: Chat Message Masking
     *
     * PostHog session replay is configured with maskAllInputs: true in App.tsx,
     * which automatically masks all TextInput components.
     *
     * For chat message bubbles (Text components), PostHog React Native doesn't
     * support selective masking like the web SDK. However, we ensure privacy by:
     * 1. Never capturing message content in event properties (only metadata)
     * 2. Using maskAllText: false to allow UX debugging while being selective
     * 3. Relying on event-level privacy (no PII in analytics events)
     *
     * If stricter masking is needed, consider using PostHog's web-based masking
     * or implementing custom masking overlays for sensitive screens.
     */
    return (
      <View style={[styles.messageRow, !isBot && styles.messageRowUser]}>
        {isBot && (
          <Image source={{ uri: botAvatarUrl }} style={styles.avatarSmall} />
        )}
        <View
          style={[styles.bubble, isBot ? styles.bubbleBot : styles.bubbleUser]}
        >
          <ClickableMessage
            text={item.text}
            onWordClick={(word) => handleWordPress(word, item.text)}
            style={[
              styles.messageText,
              isBot ? styles.textWhite : styles.textBlack,
            ]}
          />
          {isBot && (
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                style={styles.speakerIcon}
                onPress={() => handleTranslateSentence(item.text)}
                disabled={isTranslating}
              >
                <MaterialIcons
                  name="translate"
                  size={18}
                  color={COLORS.textGrey}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.speakerIcon}
                onPress={() => handleSpeakMessage(item.text, item.id)}
              >
                <MaterialIcons
                  // O an bu mesaj çalıyorsa stop iconu, değilse volume-up
                  name={speakingMessageId === item.id ? "stop" : "volume-up"}
                  size={18}
                  color={COLORS.textGrey}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.backgroundDark}
        translucent={Platform.OS === "android"}
      />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={28} color={COLORS.textWhite} />
        </TouchableOpacity>

        <View style={styles.headerProfile}>
          <Image source={{ uri: botAvatarUrl }} style={styles.avatarHeader} />
          <View>
            <Text style={styles.headerName}>{botRole}</Text>
            <Text style={styles.headerScenario}>{title || "Pratik"}</Text>
          </View>
        </View>
      </View>

      {/* CHAT LİSTESİ */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        ListFooterComponent={
          loading ? <TypingIndicator avatarUrl={botAvatarUrl} /> : null
        }
      />

      {/* FOOTER & INPUT */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={
          Platform.OS === "ios" ? insets.top - 80 : insets.top - 40
        }
      >
        <ScrollView
          style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}
        >
          <Animated.View
            style={{ transform: [{ scale: scaleAnimEndSessionBtn }] }}
          >
            <TouchableOpacity
              onPress={endSession}
              style={styles.endButton}
              onPressIn={() =>
                Animated.spring(scaleAnimEndSessionBtn, {
                  toValue: 0.95,
                  useNativeDriver: true,
                  friction: 3,
                  tension: 40,
                }).start()
              }
              onPressOut={() =>
                Animated.spring(scaleAnimEndSessionBtn, {
                  toValue: 1,
                  useNativeDriver: true,
                  friction: 3,
                  tension: 40,
                }).start()
              }
            >
              <Text style={styles.endButtonText}>
                {loadingFeedback ? (
                  <ActivityIndicator size="small" color={COLORS.textWhite} />
                ) : (
                  t("chat_end_session")
                )}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.inputRow}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder={t("chat_input_placeholder")}
                placeholderTextColor="#6b7280"
                multiline
                // Privacy: This input is automatically masked by PostHog's maskAllInputs setting
                // No chat content will be captured in session replay
              />
              <TouchableOpacity
                onPress={() => sendMessage()}
                style={styles.sendIcon}
              >
                <MaterialCommunityIcons
                  name="send"
                  size={22}
                  color={COLORS.textWhite}
                />
              </TouchableOpacity>
            </View>
            <Animated.View
              style={{ transform: [{ scale: scaleAnimVoiceBtn }] }}
            >
              <TouchableOpacity
                style={[
                  styles.micButton,
                  isRecording && { backgroundColor: "#ef4444" },
                ]}
                onPressIn={startRecording}
                onPressOut={stopRecording}
              >
                <MaterialIcons
                  name={isRecording ? "stop" : "mic"}
                  size={28}
                  color={COLORS.backgroundDark}
                />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* KELİME / ÇEVİRİ MODALI */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible || isTranslatedSentenceModalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setIsTranslatedSentenceModalVisible(false);
          setTranslatedSentence("");
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setModalVisible(false);
            setIsTranslatedSentenceModalVisible(false);
            setTranslatedSentence("");
          }}
        >
          <View style={styles.wordPopup} onStartShouldSetResponder={() => true}>
            {/* Eğer kelime modalı açıksa kelime içeriğini göster */}
            {modalVisible ? (
              <>
                <Text style={styles.popupWord}>{selectedWordData?.word}</Text>

                {isLookingUp ? (
                  <View
                    style={{
                      width: "100%",
                      alignItems: "flex-start",
                      paddingTop: 10,
                    }}
                  >
                    <SkeletonItem
                      width={180}
                      height={24}
                      borderRadius={4}
                      style={{ alignSelf: "center", marginBottom: 20 }}
                    />
                    <SkeletonItem
                      width={60}
                      height={14}
                      borderRadius={4}
                      style={{ marginBottom: 8 }}
                    />
                    <SkeletonItem
                      width="100%"
                      height={60}
                      borderRadius={8}
                      style={{ marginBottom: 24 }}
                    />
                  </View>
                ) : (
                  <View>
                    <Text style={styles.popupTranslation}>
                      {selectedWordData?.translation}
                    </Text>
                    <Text style={styles.popupContextLabel}>
                      {t("chat_context_label")}
                    </Text>
                    <Text style={styles.popupContext}>
                      "{selectedWordData?.context}"
                    </Text>

                    <View style={styles.popupButtons}>
                      <TouchableOpacity
                        style={styles.btnCancel}
                        onPress={() => setModalVisible(false)}
                      >
                        <Text style={styles.btnTextCancel}>{t("close")}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.btnSave}
                        onPress={handleSaveWord}
                      >
                        <MaterialIcons
                          name="bookmark-border"
                          size={20}
                          color={COLORS.backgroundDark}
                          style={{ marginRight: 5 }}
                        />
                        <Text style={styles.btnTextSave}>
                          {t("chat_save_word")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </>
            ) : (
              // Aksi halde çeviri modalı göster
              <>
                <Text style={styles.popupWord}>{t("chat_translation")}</Text>
                {isTranslating ? (
                  <View
                    style={{
                      width: "100%",
                      alignItems: "flex-start",
                      paddingTop: 10,
                    }}
                  >
                    <SkeletonItem
                      width={180}
                      height={24}
                      borderRadius={4}
                      style={{ alignSelf: "center", marginBottom: 20 }}
                    />
                    <SkeletonItem
                      width={60}
                      height={14}
                      borderRadius={4}
                      style={{ marginBottom: 8 }}
                    />
                    <SkeletonItem
                      width="100%"
                      height={60}
                      borderRadius={8}
                      style={{ marginBottom: 24 }}
                    />
                  </View>
                ) : (
                  <View>
                    <Text style={styles.popupTranslation}>
                      {translatedSentence || t("chat_no_translation")}
                    </Text>

                    <View
                      style={{ marginTop: 18, flexDirection: "row", gap: 12 }}
                    >
                      <TouchableOpacity
                        style={styles.btnSave}
                        onPress={() => {
                          // İsteğe bağlı: çeviri kaydetme işlemi burada yapılabilir
                          setIsTranslatedSentenceModalVisible(false);
                          setTranslatedSentence("");
                        }}
                      >
                        <Text style={styles.btnTextSave}>{t("ok")}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// --- STYLES ---
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
  speakerIcon: {
    alignSelf: "flex-end", // Sağa yasla
    marginTop: 8, // Metinle arasına boşluk koy
    padding: 4, // Dokunma alanını genişlet
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  wordPopup: {
    width: "85%",
    backgroundColor: "#1c2720",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(43, 238, 121, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  popupWord: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 10,
    textAlign: "center",
    textTransform: "capitalize",
  },
  popupTranslation: {
    fontSize: 18,
    color: COLORS.textWhite,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "500",
  },
  popupContextLabel: {
    fontSize: 12,
    color: COLORS.textGrey,
    marginBottom: 4,
  },
  popupContext: {
    fontSize: 14,
    color: "#d1d5db",
    fontStyle: "italic",
    marginBottom: 24,
    backgroundColor: "rgba(0,0,0,0.2)",
    padding: 10,
    borderRadius: 8,
  },
  loadingBox: {
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingText: {
    color: COLORS.textGrey,
    marginTop: 10,
  },
  popupButtons: {
    flexDirection: "row",
    gap: 12,
  },
  btnCancel: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
  },
  btnSave: {
    flex: 1.5,
    padding: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  btnTextCancel: {
    color: COLORS.textWhite,
    fontWeight: "bold",
  },
  btnTextSave: {
    color: COLORS.backgroundDark,
    fontWeight: "bold",
  },
});
