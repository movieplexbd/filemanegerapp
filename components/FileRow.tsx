import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";
import { FileItem, useFileManager } from "@/context/FileManagerContext";
import { FileIcon } from "./FileIcon";
import { formatFileSize, formatDate } from "@/utils/format";

interface FileRowProps {
  file: FileItem;
  onPress: () => void;
  onLongPress?: () => void;
  isSelected?: boolean;
  showCheckbox?: boolean;
}

export function FileRow({ file, onPress, onLongPress, isSelected, showCheckbox }: FileRowProps) {
  const colors = useColors();
  const { isFavorite, addToFavorites, removeFromFavorites, deleteFile } = useFileManager();
  const scale = useSharedValue(1);
  const favorite = isFavorite(file.id);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 20 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20 });
  };

  const handleFavoriteToggle = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (favorite) removeFromFavorites(file.id);
    else addToFavorites(file);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete",
      `Are you sure you want to delete "${file.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            deleteFile(file.id);
          },
        },
      ]
    );
  };

  return (
    <Animated.View entering={FadeIn.duration(200)} style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.container,
          {
            backgroundColor: isSelected ? colors.accent : colors.background,
            borderColor: isSelected ? colors.primary : "transparent",
            borderWidth: isSelected ? 1 : 0,
          },
        ]}
      >
        {showCheckbox && (
          <View style={[styles.checkbox, { borderColor: isSelected ? colors.primary : colors.border, backgroundColor: isSelected ? colors.primary : "transparent" }]}>
            {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
          </View>
        )}

        <FileIcon type={file.type} isDirectory={file.isDirectory} extension={file.extension} />

        <View style={styles.info}>
          <Text
            style={[styles.name, { color: colors.foreground }]}
            numberOfLines={1}
          >
            {file.name}
          </Text>
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>
            {file.isDirectory
              ? `${file.children?.length ?? 0} items`
              : `${formatFileSize(file.size)} · ${formatDate(file.modifiedAt)}`}
          </Text>
        </View>

        <View style={styles.actions}>
          {!file.isDirectory && (
            <Pressable
              onPress={handleFavoriteToggle}
              hitSlop={8}
              style={styles.actionBtn}
            >
              <Ionicons
                name={favorite ? "bookmark" : "bookmark-outline"}
                size={18}
                color={favorite ? colors.primary : colors.mutedForeground}
              />
            </Pressable>
          )}
          {file.isDirectory && (
            <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 3,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  meta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionBtn: {
    padding: 4,
  },
});
