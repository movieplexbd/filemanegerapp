import { Ionicons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";
import { FileItem, useFileManager } from "@/context/FileManagerContext";

interface FileActionSheetProps {
  file: FileItem | null;
  visible: boolean;
  onClose: () => void;
}

type Action = "copy" | "move" | "delete" | "rename" | "share" | "install";

export function FileActionSheet({ file, visible, onClose }: FileActionSheetProps) {
  const colors = useColors();
  const { deleteFile, renameFile, isFavorite, addToFavorites, removeFromFavorites } = useFileManager();
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState("");

  if (!file) return null;

  const favorite = isFavorite(file.id);

  const handleAction = async (action: Action) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    switch (action) {
      case "delete":
        onClose();
        Alert.alert(
          "Delete",
          `Delete "${file.name}"?`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => deleteFile(file.id),
            },
          ]
        );
        break;
      case "rename":
        setNewName(file.name);
        setRenaming(true);
        break;
      case "copy":
        Alert.alert("Copy", `"${file.name}" will be copied`);
        onClose();
        break;
      case "move":
        Alert.alert("Move", `"${file.name}" will be moved`);
        onClose();
        break;
      case "share":
        Alert.alert("Share", `Sharing "${file.name}"`);
        onClose();
        break;
      case "install":
        Alert.alert("Install APK", `Install "${file.name}"?`, [
          { text: "Cancel", style: "cancel" },
          { text: "Install", onPress: () => Alert.alert("Installing...", "APK installation started") },
        ]);
        onClose();
        break;
    }
  };

  const handleRename = async () => {
    if (newName.trim() && newName.trim() !== file.name) {
      await renameFile(file.id, newName.trim());
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setRenaming(false);
    onClose();
  };

  const actions = [
    { id: "rename" as Action, label: "Rename", icon: "pencil", color: colors.foreground },
    { id: "copy" as Action, label: "Copy", icon: "copy", color: colors.foreground },
    { id: "move" as Action, label: "Move", icon: "folder", color: colors.foreground },
    { id: "share" as Action, label: "Share", icon: "share-2", color: colors.primary },
    ...(file.extension === "apk" ? [{ id: "install" as Action, label: "Install APK", icon: "download", color: colors.success }] : []),
    { id: "delete" as Action, label: "Delete", icon: "trash-2", color: colors.destructive },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          entering={SlideInDown.springify().damping(20)}
          style={[styles.sheet, { backgroundColor: colors.background }]}
        >
          <Pressable>
            {renaming ? (
              <View style={styles.renameContainer}>
                <Text style={[styles.title, { color: colors.foreground }]}>Rename</Text>
                <TextInput
                  value={newName}
                  onChangeText={setNewName}
                  style={[styles.renameInput, { color: colors.foreground, backgroundColor: colors.muted, borderColor: colors.border }]}
                  autoFocus
                  selectTextOnFocus
                />
                <View style={styles.renameActions}>
                  <Pressable onPress={() => setRenaming(false)} style={[styles.renameBtn, { backgroundColor: colors.muted }]}>
                    <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium" }}>Cancel</Text>
                  </Pressable>
                  <Pressable onPress={handleRename} style={[styles.renameBtn, { backgroundColor: colors.primary }]}>
                    <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold" }}>Rename</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <>
                <View style={styles.handle} />
                <View style={styles.fileInfo}>
                  <Text style={[styles.fileName, { color: colors.foreground }]} numberOfLines={2}>{file.name}</Text>
                </View>

                <Pressable
                  onPress={() => { favorite ? removeFromFavorites(file.id) : addToFavorites(file); onClose(); }}
                  style={[styles.actionRow, { borderBottomColor: colors.border }]}
                >
                  <View style={[styles.actionIcon, { backgroundColor: favorite ? "#FFF3E0" : colors.muted }]}>
                    <Ionicons name={favorite ? "bookmark" : "bookmark-outline"} size={20} color={favorite ? "#FF9500" : colors.foreground} />
                  </View>
                  <Text style={[styles.actionLabel, { color: colors.foreground }]}>
                    {favorite ? "Remove from Favorites" : "Add to Favorites"}
                  </Text>
                </Pressable>

                {actions.map((action, i) => (
                  <Pressable
                    key={action.id}
                    onPress={() => handleAction(action.id)}
                    style={[styles.actionRow, { borderBottomColor: colors.border, borderBottomWidth: i < actions.length - 1 ? StyleSheet.hairlineWidth : 0 }]}
                  >
                    <View style={[styles.actionIcon, { backgroundColor: action.color === colors.destructive ? "#FFF0F0" : colors.muted }]}>
                      <Feather name={action.icon as any} size={20} color={action.color} />
                    </View>
                    <Text style={[styles.actionLabel, { color: action.color }]}>{action.label}</Text>
                  </Pressable>
                ))}
              </>
            )}
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E0E0E0",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  fileInfo: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  fileName: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  title: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 16,
    textAlign: "center",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
  renameContainer: {
    padding: 20,
    gap: 16,
  },
  renameInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  renameActions: {
    flexDirection: "row",
    gap: 10,
  },
  renameBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
});
