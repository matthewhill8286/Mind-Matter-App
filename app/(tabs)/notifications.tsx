import React, { useMemo, useState } from "react";
import { View, Text, Pressable, Switch, FlatList } from "react-native";
import { router } from "expo-router";
import ScreenHeader from "@/components/ScreenHeader";

type NotifSetting = {
  key: string;
  title: string;
  subtitle: string;
  enabled: boolean;
};

export default function Notifications() {
  const [items, setItems] = useState<NotifSetting[]>([
    { key: "daily_checkin", title: "Daily check-in", subtitle: "A gentle prompt to reflect once per day.", enabled: true },
    { key: "sleep_winddown", title: "Sleep wind-down", subtitle: "A reminder to start your wind-down routine.", enabled: false },
    { key: "mindful_breaks", title: "Mindful breaks", subtitle: "Short reminders to pause and breathe.", enabled: false },
    { key: "weekly_summary", title: "Weekly summary", subtitle: "A snapshot of your week and trends.", enabled: true },
  ]);

  const enabledCount = useMemo(() => items.filter(i => i.enabled).length, [items]);

  return (
    <View style={{ flex: 1, backgroundColor: "#f6f4f2", padding: 24, paddingTop: 18 }}>
      <ScreenHeader title="Smart Notifications" subtitle="Toggle what you want. (Wiring to Expo Notifications comes next.)" />

      <View style={{ marginTop: 14, padding: 14, borderRadius: 18, backgroundColor: "white" }}>
        <Text style={{ fontWeight: "900" }}>{enabledCount} enabled</Text>
        <Text style={{ opacity: 0.7, marginTop: 4 }}>We’ll only send what you opt in to.</Text>
      </View>

      <FlatList
        style={{ marginTop: 14 }}
        data={items}
        keyExtractor={(i) => i.key}
        contentContainerStyle={{ gap: 10, paddingBottom: 18 }}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: "white", padding: 14, borderRadius: 18 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: "900" }}>{item.title}</Text>
                <Text style={{ opacity: 0.7, marginTop: 4 }}>{item.subtitle}</Text>
              </View>
              <Switch
                value={item.enabled}
                onValueChange={(v) =>
                  setItems((prev) => prev.map((x) => (x.key === item.key ? { ...x, enabled: v } : x)))
                }
              />
            </View>
          </View>
        )}
      />

      <Pressable
        onPress={() => router.push("/(utils)/utilities")}
        style={{ marginTop: 6, padding: 14, borderRadius: 18, backgroundColor: "#e9e9ff" }}
      >
        <Text style={{ fontWeight: "900" }}>Test utility screens</Text>
      </Pressable>
    </View>
  );
}
