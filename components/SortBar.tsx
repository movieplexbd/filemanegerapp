import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { SortBy, SortOrder } from "@/context/FileManagerContext";

interface SortBarProps {
  sortBy: SortBy;
  sortOrder: SortOrder;
  onSortByChange: (sort: SortBy) => void;
  onSortOrderChange: (order: SortOrder) => void;
  showHidden: boolean;
  onToggleHidden: () => void;
}

const SORT_OPTIONS: { key: SortBy; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "size", label: "Size" },
  { key: "date", label: "Date" },
];

export function SortBar({
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
  showHidden,
  onToggleHidden,
}: SortBarProps) {
  const colors = useColors();

  return (
    <View style={styles.wrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
        {SORT_OPTIONS.map((opt) => (
          <Pressable
            key={opt.key}
            onPress={() => {
              if (sortBy === opt.key) {
                onSortOrderChange(sortOrder === "asc" ? "desc" : "asc");
              } else {
                onSortByChange(opt.key);
              }
            }}
            style={[
              styles.chip,
              {
                backgroundColor: sortBy === opt.key ? colors.primary : colors.muted,
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                { color: sortBy === opt.key ? "#fff" : colors.mutedForeground },
              ]}
            >
              {opt.label}
            </Text>
            {sortBy === opt.key && (
              <Ionicons
                name={sortOrder === "asc" ? "arrow-up" : "arrow-down"}
                size={12}
                color="#fff"
              />
            )}
          </Pressable>
        ))}

        <Pressable
          onPress={onToggleHidden}
          style={[
            styles.chip,
            { backgroundColor: showHidden ? colors.primary : colors.muted },
          ]}
        >
          <Ionicons
            name={showHidden ? "eye" : "eye-off"}
            size={14}
            color={showHidden ? "#fff" : colors.mutedForeground}
          />
          <Text
            style={[
              styles.chipText,
              { color: showHidden ? "#fff" : colors.mutedForeground },
            ]}
          >
            Hidden
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 4,
  },
  container: {
    paddingHorizontal: 16,
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
});
