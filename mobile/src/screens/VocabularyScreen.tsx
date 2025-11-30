import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { getMyWords, deleteWord } from "../services/api";

const COLORS = {
  background: "#102217",
  cardBg: "rgba(255, 255, 255, 0.05)",
  primary: "#2bee79",
  textWhite: "#FFFFFF",
  textGrey: "#9db9a8",
  delete: "#ef4444",
};

export default function VocabularyScreen() {
  const navigation = useNavigation();
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadWords();
    }, [])
  );

  const loadWords = async () => {
    try {
      const data = await getMyWords();
      setWords(data);
    } catch (error) {
      console.log("Kelimeler alınamadı");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    // Optimistic Update (Hemen ekrandan sil)
    setWords((prev) => prev.filter((w: any) => w._id !== id));
    await deleteWord(id);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.word}>{item.word}</Text>
        <TouchableOpacity onPress={() => handleDelete(item._id)}>
          <MaterialIcons
            name="delete-outline"
            size={24}
            color={COLORS.delete}
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.translation}>{item.translation}</Text>
      {item.contextSentence && (
        <Text style={styles.context}>"{item.contextSentence}"</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ padding: 8 }}
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Kelime Defterim</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={words}
          keyExtractor={(item: any) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Henüz hiç kelime kaydetmedin.</Text>
          }
        />
      )}
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
  title: { fontSize: 20, fontWeight: "bold", color: COLORS.textWhite },
  list: { padding: 16 },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  word: { fontSize: 18, fontWeight: "bold", color: COLORS.primary },
  translation: { fontSize: 16, color: COLORS.textWhite, marginTop: 4 },
  context: {
    fontSize: 14,
    color: COLORS.textGrey,
    fontStyle: "italic",
    marginTop: 8,
  },
  emptyText: { color: COLORS.textGrey, textAlign: "center", marginTop: 50 },
});
