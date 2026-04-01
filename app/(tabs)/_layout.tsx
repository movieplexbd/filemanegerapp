import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Ionicons, Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";

import { useColors } from "@/hooks/useColors";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "folder", selected: "folder.fill" }} />
        <Label>Files</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="recent">
        <Icon sf={{ default: "clock", selected: "clock.fill" }} />
        <Label>Recent</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="favorites">
        <Icon sf={{ default: "bookmark", selected: "bookmark.fill" }} />
        <Label>Favorites</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="storage">
        <Icon sf={{ default: "chart.pie", selected: "chart.pie.fill" }} />
        <Label>Storage</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.background,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: colors.background },
              ]}
            />
          ) : null,
        tabBarLabelStyle: {
          fontFamily: "Inter_500Medium",
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Files",
          tabBarIcon: ({ color, size }) =>
            isIOS ? (
              <SymbolView name="folder" tintColor={color} size={size} />
            ) : (
              <Ionicons name="folder-outline" size={size} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="recent"
        options={{
          title: "Recent",
          tabBarIcon: ({ color, size }) =>
            isIOS ? (
              <SymbolView name="clock" tintColor={color} size={size} />
            ) : (
              <Ionicons name="time-outline" size={size} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          tabBarIcon: ({ color, size }) =>
            isIOS ? (
              <SymbolView name="bookmark" tintColor={color} size={size} />
            ) : (
              <Ionicons name="bookmark-outline" size={size} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="storage"
        options={{
          title: "Storage",
          tabBarIcon: ({ color, size }) =>
            isIOS ? (
              <SymbolView name="chart.pie" tintColor={color} size={size} />
            ) : (
              <Feather name="pie-chart" size={size} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
