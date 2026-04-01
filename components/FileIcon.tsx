import { Feather, MaterialCommunityIcons, Ionicons, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { View, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";
import { FileType } from "@/context/FileManagerContext";

interface FileIconProps {
  type: FileType;
  isDirectory?: boolean;
  extension?: string;
  size?: number;
}

export function FileIcon({ type, isDirectory, extension, size = 24 }: FileIconProps) {
  const colors = useColors();

  if (isDirectory) {
    return (
      <View style={[styles.iconContainer, { backgroundColor: "#FFF3E0" }]}>
        <Ionicons name="folder" size={size} color="#FF9500" />
      </View>
    );
  }

  const getIconInfo = (): { icon: React.ReactNode; bg: string } => {
    switch (type) {
      case "image":
        return {
          icon: <Ionicons name="image" size={size} color={colors.imageColor} />,
          bg: "#FFF0F0",
        };
      case "video":
        return {
          icon: <Ionicons name="videocam" size={size} color={colors.videoColor} />,
          bg: "#FFF5E6",
        };
      case "audio":
        return {
          icon: <Ionicons name="musical-notes" size={size} color={colors.audioColor} />,
          bg: "#F5F0FF",
        };
      case "document":
        if (extension === "pdf") return {
          icon: <MaterialCommunityIcons name="file-pdf-box" size={size} color="#FF3B30" />,
          bg: "#FFF0F0",
        };
        if (["xlsx", "csv", "numbers"].includes(extension || "")) return {
          icon: <MaterialCommunityIcons name="file-excel" size={size} color="#34C759" />,
          bg: "#F0FFF4",
        };
        if (["doc", "docx", "pages", "rtf"].includes(extension || "")) return {
          icon: <MaterialCommunityIcons name="file-word" size={size} color="#007AFF" />,
          bg: "#F0F6FF",
        };
        if (["pptx", "ppt"].includes(extension || "")) return {
          icon: <MaterialCommunityIcons name="file-powerpoint" size={size} color="#FF6B35" />,
          bg: "#FFF3EE",
        };
        return {
          icon: <Feather name="file-text" size={size} color={colors.docColor} />,
          bg: "#F0FFF4",
        };
      case "apk":
        return {
          icon: <MaterialCommunityIcons name="android" size={size} color={colors.apkColor} />,
          bg: "#E8F4FF",
        };
      case "zip":
        return {
          icon: <MaterialCommunityIcons name="zip-box" size={size} color={colors.zipColor} />,
          bg: "#FFF3EE",
        };
      default:
        return {
          icon: <Feather name="file" size={size} color={colors.otherColor} />,
          bg: "#F5F5F5",
        };
    }
  };

  const { icon, bg } = getIconInfo();

  return (
    <View style={[styles.iconContainer, { backgroundColor: bg }]}>
      {icon}
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
