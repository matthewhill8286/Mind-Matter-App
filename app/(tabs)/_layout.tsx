import { Tabs } from "expo-router";
import React from "react";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

export default function TabsLayout() {
  const theme = useColorScheme() ?? "light";
  const colors = Colors[theme];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBarBg,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
      }}
    >
      {/* Visible tabs */}
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="chat" options={{ title: "Chat" }} />
      <Tabs.Screen name="journal" options={{ title: "Journal" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />

      {/* Hidden routes (still inside tabs so the tab bar stays visible when navigating) */}
      <Tabs.Screen name="stress/index" options={{ href: null, title: "Stress" }} />
      <Tabs.Screen name="stress/breathing" options={{ href: null, title: "Breathing" }} />
      <Tabs.Screen name="stress/grounding" options={{ href: null, title: "Grounding" }} />
      <Tabs.Screen name="stress/plan" options={{ href: null, title: "Stress Plan" }} />
      <Tabs.Screen name="mood" options={{ href: null, title: "Mood" }} />
      <Tabs.Screen name="sleep" options={{ href: null, title: "Sleep" }} />
      <Tabs.Screen name="mindful-hours" options={{ href: null, title: "Mindful" }} />
      <Tabs.Screen name="notifications" options={{ href: null, title: "Notifications" }} />
      <Tabs.Screen name="community" options={{ href: null, title: "Community" }} />
      <Tabs.Screen name="resources-tab" options={{ href: null, title: "Resources" }} />
      <Tabs.Screen name="resources" options={{ href: null, title: "Resources" }} />
      <Tabs.Screen name="settings" options={{ href: null, title: "Settings" }} />
        <Tabs.Screen name="help-center" options={{href: null, title: "help-center"}} />
      <Tabs.Screen name="utilities" options={{href: null, title: "utilities"}} />
      <Tabs.Screen name="offline" options={{href: null, title: "offline"}} />
      <Tabs.Screen name="empty" options={{href: null, title: "empty"}}/>
      <Tabs.Screen name="error" options={{href: null, title: "error"}} />
</Tabs>
  );
}
