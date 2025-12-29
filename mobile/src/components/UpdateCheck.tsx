import { MaterialIcons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../constants/color";

interface UpdateCheckProps {
  visible: boolean;
  onUpdate: () => void;
}

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.doganay.rolyai";
const APP_STORE_URL = "https://apps.apple.com/app/idYOUR_APP_ID"; // iOS için App Store URL'inizi buraya ekleyin

export default function UpdateCheck({ visible, onUpdate }: UpdateCheckProps) {
  const { t } = useTranslation();

  const handleUpdate = () => {
    const url = Platform.OS === "android" ? PLAY_STORE_URL : APP_STORE_URL;
    Linking.openURL(url).catch((err) => {
      console.error("Store açılamadı:", err);
    });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {}} // Android geri tuşunu devre dışı bırak
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <MaterialIcons
              name="system-update"
              size={64}
              color={COLORS.primary}
            />
          </View>

          <Text style={styles.title}>
            {t("update_required_title", "Yeni Güncelleme Mevcut")}
          </Text>

          <Text style={styles.message}>
            {t(
              "update_required_message",
              "Uygulamanın yeni bir sürümü mevcut. Devam etmek için lütfen uygulamayı güncelleyin."
            )}
          </Text>

          <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
            <MaterialIcons name="download" size={24} color={COLORS.textBlack} />
            <Text style={styles.updateButtonText}>
              {t("update_button", "Güncelle")}
            </Text>
          </TouchableOpacity>

          <Text style={styles.hint}>
            {t(
              "update_hint",
              "Güncelleme yapıldıktan sonra uygulamayı yeniden başlatın"
            )}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.modalOverlay,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: COLORS.modalBg,
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.iconBg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textWhite,
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: COLORS.textGrey,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  updateButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    gap: 8,
  },
  updateButtonText: {
    color: COLORS.textBlack,
    fontSize: 18,
    fontWeight: "bold",
  },
  hint: {
    fontSize: 12,
    color: COLORS.textGrey,
    textAlign: "center",
    marginTop: 16,
    fontStyle: "italic",
  },
});
