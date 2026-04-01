import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useFileManager } from "@/context/FileManagerContext";
import { StorageChart } from "@/components/StorageChart";

export default function StorageScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { getStorageInfo } = useFileManager();

  const storageInfo = getStorageInfo();

  const topPadding = Platform.OS === "web" ? 67 : 0;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPadding }]}>
      <View style={[styles.header, { paddingTop: Platform.OS !== "web" ? insets.top : 0 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Storage</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Manage your device storage
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + bottomPadding }]}
      >
        <StorageChart
          used={storageInfo.used}
          total={storageInfo.total}
          byType={storageInfo.byType}
        />

        <View style={[styles.tipsCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.tipsTitle, { color: colors.foreground }]}>Storage Tips</Text>
          {[
            { text: "Delete unused APK files to free space", icon: "💡" },
            { text: "Move videos to cloud for more storage", icon: "☁️" },
            { text: "Clear cache files regularly", icon: "🗑️" },
          ].map((tip, i) => (
            <View key={i} style={[styles.tipItem, { borderTopColor: colors.border, borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth }]}>
              <Text style={styles.tipIcon}>{tip.icon}</Text>
              <Text style={[styles.tipText, { color: colors.mutedForeground }]}>{tip.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
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
  scrollContent: {
    paddingTop: 8,
    gap: 8,
  },
  tipsCard: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: "hidden",
  },
  tipsTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    padding: 16,
    paddingBottom: 12,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  tipIcon: {
    fontSize: 18,
  },
  tipText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
});
