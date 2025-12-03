import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");

import { COLORS } from "../constants/color";
import { useAuth } from "../context/AuthContext";

export default function WelcomeScreen() {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { completeWelcome } = useAuth();

  // Slayt Verileri (dinamik çeviri ile)
  const SLIDES = [
    {
      id: "1",
      titleKey: "welcome_slide1_title",
      descKey: "welcome_slide1_desc",
      icon: "chat",
    },
    {
      id: "2",
      titleKey: "welcome_slide2_title",
      descKey: "welcome_slide2_desc",
      icon: "auto-awesome",
    },
    {
      id: "3",
      titleKey: "welcome_slide3_title",
      descKey: "welcome_slide3_desc",
      icon: "trending-up",
    },
  ];

  // Kaydırma olayını takip et
  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    setCurrentIndex(roundIndex);
  };

  const handleNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      // Bir sonraki slayta kaydır
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      await completeWelcome();
    }
  };

  const handleSkip = async () => {
    await completeWelcome();
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.slide}>
      {/* Görsel Alanı (Buraya Image da koyabilirsin, şimdilik İkon koydum) */}
      <View style={styles.imageContainer}>
        <MaterialIcons name={item.icon} size={100} color={COLORS.primary} />
        {/* Arkadaki Glow Efekti */}
        <View style={styles.glow} />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>{t(item.titleKey)}</Text>
        <Text style={styles.description}>{t(item.descKey)}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Üst Bar (Atla Butonu) */}
      <View style={styles.header}>
        {currentIndex < SLIDES.length - 1 && (
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>{t("welcome_skip")}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Slaytlar */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderItem}
        horizontal
        pagingEnabled // Sayfa sayfa kaymasını sağlar
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
      />

      {/* Alt Kısım (Noktalar ve Buton) */}
      <View style={styles.footer}>
        {/* Nokta Göstergeleri (Dots) */}
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, currentIndex === index && styles.activeDot]}
            />
          ))}
        </View>

        {/* İleri / Başla Butonu */}
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentIndex === SLIDES.length - 1
              ? t("welcome_start")
              : t("welcome_next")}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    height: 50,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingHorizontal: 20,
  },
  skipText: { color: COLORS.textGrey, fontSize: 16, fontWeight: "500" },

  slide: { width, alignItems: "center", paddingHorizontal: 20 },

  imageContainer: {
    flex: 0.6,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: 20,
  },
  glow: {
    position: "absolute",
    width: 200,
    height: 200,
    backgroundColor: COLORS.primary,
    borderRadius: 100,
    opacity: 0.15,
    zIndex: -1,
    transform: [{ scale: 1.5 }],
  },

  textContainer: {
    flex: 0.4,
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.textWhite,
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: COLORS.textGrey,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },

  footer: { padding: 20, paddingBottom: 40 },

  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 30,
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: "#334155",
    marginHorizontal: 4,
  },
  activeDot: { backgroundColor: COLORS.primary, width: 24 }, // Aktif olan uzasın

  button: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: { fontSize: 18, fontWeight: "bold", color: COLORS.background },
});
