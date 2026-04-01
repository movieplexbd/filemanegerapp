import { Ionicons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState, useCallback } from "react";
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
import { SearchBar } from "@/components/SearchBar";
import { SortBar } from "@/components/SortBar";
import { FileActionSheet } from "@/components/FileActionSheet";

export default function FilesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    files,
    currentPath,
    setCurrentPath,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    showHidden,
    toggleHidden,
    selectedFiles,
    isSelecting,
    setIsSelecting,
    toggleSelect,
    clearSelection,
    addToRecent,
  } = useFileManager();

  const [actionFile, setActionFile] = useState<FileItem | null>(null);
  const [actionVisible, setActionVisible] = useState(false);

  const breadcrumbs = currentPath.split("/").filter(Boolean);

  const handleFilePress = useCallback((file: FileItem) => {
    if (isSelecting) {
      toggleSelect(file.id);
      return;
    }
    if (file.isDirectory) {
      setCurrentPath(file.path);
    } else {
      addToRecent(file);
      setActionFile(file);
      setActionVisible(true);
    }
  }, [isSelecting, toggleSelect, setCurrentPath, addToRecent]);

  const handleLongPress = useCallback((file: FileItem) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSelecting(true);
    toggleSelect(file.id);
  }, [setIsSelecting, toggleSelect]);

  const handleBack = () => {
    if (breadcrumbs.length > 0) {
      const parts = breadcrumbs.slice(0, -1);
      setCurrentPath(parts.length === 0 ? "/" : "/" + parts.join("/"));
    }
  };

  const topPadding = Platform.OS === "web" ? 67 : 0;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPadding }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS !== "web" ? insets.top : 0 }]}>
        <View style={styles.headerTop}>
          {currentPath !== "/" ? (
            <Pressable onPress={handleBack} style={styles.backBtn} hitSlop={8}>
              <Ionicons name="chevron-back" size={24} color={colors.primary} />
            </Pressable>
          ) : (
            <View style={styles.backBtn} />
          )}
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            {currentPath === "/" ? "Files" : breadcrumbs[breadcrumbs.length - 1]}
          </Text>
          {isSelecting ? (
            <Pressable onPress={clearSelection} hitSlop={8}>
              <Text style={[styles.cancelText, { color: colors.primary }]}>Done</Text>
            </Pressable>
          ) : (
            <View style={styles.headerActions}>
              <Pressable hitSlop={8}>
                <Feather name="more-vertical" size={22} color={colors.foreground} />
              </Pressable>
            </View>
          )}
        </View>

        {/* Breadcrumb */}
        {breadcrumbs.length > 0 && (
          <View style={styles.breadcrumb}>
            <Pressable onPress={() => setCurrentPath("/")}>
              <Text style={[styles.breadcrumbItem, { color: colors.primary }]}>Storage</Text>
            </Pressable>
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={i}>
                <Ionicons name="chevron-forward" size={12} color={colors.mutedForeground} />
                <Text
                  style={[
                    styles.breadcrumbItem,
                    { color: i === breadcrumbs.length - 1 ? colors.foreground : colors.primary },
                  ]}
                >
                  {crumb}
                </Text>
              </React.Fragment>
            ))}
          </View>
        )}

        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
        <SortBar
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortByChange={setSortBy}
          onSortOrderChange={setSortOrder}
          showHidden={showHidden}
          onToggleHidden={toggleHidden}
        />
      </View>

      <FlatList
        data={files}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FileRow
            file={item}
            onPress={() => handleFilePress(item)}
            onLongPress={() => handleLongPress(item)}
            isSelected={selectedFiles.has(item.id)}
            showCheckbox={isSelecting}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 100 + bottomPadding },
          files.length === 0 && styles.emptyContent,
        ]}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={56} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              {searchQuery ? "No results found" : "Empty folder"}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
              {searchQuery ? `No files match "${searchQuery}"` : "This folder has no files"}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* Selection toolbar */}
      {isSelecting && selectedFiles.size > 0 && (
        <View style={[styles.selectionBar, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: insets.bottom + 8 }]}>
          <Pressable style={styles.selBarBtn}>
            <Feather name="copy" size={22} color={colors.primary} />
            <Text style={[styles.selBarLabel, { color: colors.primary }]}>Copy</Text>
          </Pressable>
          <Pressable style={styles.selBarBtn}>
            <Feather name="move" size={22} color={colors.primary} />
            <Text style={[styles.selBarLabel, { color: colors.primary }]}>Move</Text>
          </Pressable>
          <Pressable style={styles.selBarBtn}>
            <Feather name="share-2" size={22} color={colors.primary} />
            <Text style={[styles.selBarLabel, { color: colors.primary }]}>Share</Text>
          </Pressable>
          <Pressable style={styles.selBarBtn}>
            <Feather name="trash-2" size={22} color={colors.destructive} />
            <Text style={[styles.selBarLabel, { color: colors.destructive }]}>Delete</Text>
          </Pressable>
        </View>
      )}

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
    paddingBottom: 4,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backBtn: {
    width: 36,
    alignItems: "flex-start",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
    width: 36,
    justifyContent: "flex-end",
  },
  cancelText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    width: 36,
    textAlign: "right",
  },
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 4,
    flexWrap: "wrap",
    gap: 4,
  },
  breadcrumbItem: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  listContent: {
    paddingTop: 8,
  },
  emptyContent: {
    flex: 1,
  },
  separator: {
    height: 0,
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
  selectionBar: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
    paddingHorizontal: 20,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  selBarBtn: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  selBarLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
});
