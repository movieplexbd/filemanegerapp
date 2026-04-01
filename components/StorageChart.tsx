import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { FileType } from "@/context/FileManagerContext";
import { formatFileSize, formatPercent } from "@/utils/format";

interface StorageChartProps {
  used: number;
  total: number;
  byType: Record<FileType, number>;
}

const TYPE_LABELS: Record<FileType, string> = {
  image: "Photos",
  video: "Videos",
  audio: "Music",
  document: "Docs",
  apk: "Apps",
  zip: "Archives",
  other: "Other",
};

const TYPE_COLORS: Record<FileType, string> = {
  image: "#FF6B6B",
  video: "#FF9500",
  audio: "#AF52DE",
  document: "#34C759",
  apk: "#007AFF",
  zip: "#FF6B35",
  other: "#8A8A8A",
};

export function StorageChart({ used, total, byType }: StorageChartProps) {
  const colors = useColors();
  const free = total - used;
  const usedPercent = used / total;

  const segments = (Object.entries(byType) as [FileType, number][])
    .filter(([, size]) => size > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.foreground }]}>Storage</Text>

      <View style={styles.barContainer}>
        <View style={[styles.barTrack, { backgroundColor: colors.muted }]}>
          {segments.map(([type, size], i) => {
            const segPercent = size / total;
            return (
              <View
                key={type}
                style={[
                  styles.barSegment,
                  {
                    flex: segPercent,
                    backgroundColor: TYPE_COLORS[type],
                    borderTopLeftRadius: i === 0 ? 6 : 0,
                    borderBottomLeftRadius: i === 0 ? 6 : 0,
                    borderTopRightRadius: i === segments.length - 1 ? 6 : 0,
                    borderBottomRightRadius: i === segments.length - 1 ? 6 : 0,
                  },
                ]}
              />
            );
          })}
          <View style={[styles.barSegment, { flex: 1 - usedPercent, backgroundColor: "transparent" }]} />
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.foreground }]}>{formatFileSize(used)}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Used</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.foreground }]}>{formatFileSize(free)}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Free</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.foreground }]}>{formatFileSize(total)}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Total</Text>
        </View>
      </View>

      <View style={styles.legend}>
        {segments.map(([type, size]) => (
          <View key={type} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: TYPE_COLORS[type] }]} />
            <View style={styles.legendInfo}>
              <Text style={[styles.legendLabel, { color: colors.foreground }]}>{TYPE_LABELS[type]}</Text>
              <Text style={[styles.legendSize, { color: colors.mutedForeground }]}>{formatFileSize(size)}</Text>
            </View>
            <Text style={[styles.legendPercent, { color: colors.mutedForeground }]}>
              {formatPercent(size, total)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    gap: 16,
  },
  title: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  barContainer: {
    height: 12,
  },
  barTrack: {
    flexDirection: "row",
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
  },
  barSegment: {
    height: "100%",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  statDivider: {
    width: 1,
    height: 30,
  },
  legend: {
    gap: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  legendLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  legendSize: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  legendPercent: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    minWidth: 36,
    textAlign: "right",
  },
});
