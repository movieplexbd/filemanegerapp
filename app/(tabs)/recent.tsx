import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useFileManager, FileItem } from "@/context/FileManagerContext";
import { FileRow } from "@/components/FileRow";
import { FileActionSheet } from "@/components/FileActionSheet";

export default function RecentScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { recentFiles, addToRecent } = useFileManager();
  const [actionFile, setActionFile] = useState<FileItem | null>(null);
  const [actionVisible, setActionVisible] = useState(false);

  const topPadding = Platform.OS === "web" ? 67 : 0;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPadding }]}>
      <View style={[styles.header, { paddingTop: Platform.OS !== "web" ? insets.top : 0 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Recent</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {recentFiles.length} {recentFiles.length === 1 ? "file" : "files"}
        </Text>
      </View>

      <FlatList
        data={recentFiles}
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
          recentFiles.length === 0 && styles.emptyContent,
        ]}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={56} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No recent files</Text>
            <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
              Files you open will appear here
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
