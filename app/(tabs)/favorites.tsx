import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useFileManager, FileItem } from "@/context/FileManagerContext";
import { FileRow } from "@/components/FileRow";
import { FileActionSheet } from "@/components/FileActionSheet";

export default function FavoritesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { favorites, removeFromFavorites, addToRecent } = useFileManager();
  const [actionFile, setActionFile] = useState<FileItem | null>(null);
  const [actionVisible, setActionVisible] = useState(false);

  const topPadding = Platform.OS === "web" ? 67 : 0;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPadding }]}>
      <View style={[styles.header, { paddingTop: Platform.OS !== "web" ? insets.top : 0 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Favorites</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {favorites.length} bookmarked
        </Text>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FileRow
            file={item}
            onPress={() => {
              addToRecent(item);
              setActionFile(item);
              setActionVisible(true);
            }}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 100 + bottomPadding },
          favorites.length === 0 && styles.emptyContent,
        ]}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="bookmark-outline" size={56} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No favorites yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
              Tap the bookmark icon on any file to save it here
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      <FileActionSheet
        file={actionFile}
        visible={actionVisible}
        onClose={() => setActionVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  listContent: {
    paddingTop: 8,
  },
  emptyContent: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 32,
  },
});
