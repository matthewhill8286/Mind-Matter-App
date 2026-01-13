import React, { useMemo, useState } from "react";
import { View, Text, Pressable, TextInput, FlatList } from "react-native";
import { router } from "expo-router";

type MenuItem = { key: string; title: string; subtitle: string; path: string };

const ITEMS: MenuItem[] = [
  { key: "home", title: "Home & Score", subtitle: "Dashboard and wellbeing snapshot.", path: "/(tabs)/home" },
  { key: "assessment", title: "Mental Health Assessment", subtitle: "14-step check-in flow.", path: "/(onboarding)/assessment" },
  { key: "stress", title: "Stress Management", subtitle: "Breathing coach, grounding, and a personal stress plan.", path: "/(tabs)/stress" },
  { key: "mood", title: "Mood Tracker", subtitle: "Track how you feel over time.", path: "/(tabs)/mood" },
  { key: "journal", title: "Mental Health Journal", subtitle: "Write entries, use prompts, and track moods.", path: "/(tabs)/journal" },
  { key: "sleep", title: "Sleep Quality", subtitle: "Sleep check-ins and routines.", path: "/(tabs)/sleep" },
  { key: "mindful", title: "Mindful Hours", subtitle: "Meditations and mindful breaks.", path: "/(tabs)/mindful-hours" },
  { key: "notifications", title: "Smart Notifications", subtitle: "Reminders you control.", path: "/(tabs)/notifications" },
  { key: "community", title: "Community Support", subtitle: "Peer support space.", path: "/(tabs)/community" },
  { key: "chatbot", title: "AI Therapy Chatbot", subtitle: "Chat by topic.", path: "/(tabs)/chat" },
  { key: "search", title: "Search", subtitle: "Find sections quickly.", path: "/search" },
  { key: "resources", title: "Mindful Resources", subtitle: "Crisis and helpful links.", path: "/(tabs)/resources" },
  { key: "profile", title: "Profile & Settings", subtitle: "Preferences and help center.", path: "/(tabs)/profile" },
  { key: "help", title: "Help Center", subtitle: "FAQs and support.", path: "/(tabs)/help-center" },
  { key: "utilities", title: "Error & Utilities", subtitle: "Offline, empty, error screens.", path: "/(tabs)/utilities" },
];

export default function MenuModal() {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return ITEMS;
    return ITEMS.filter((i) => (i.title + " " + i.subtitle).toLowerCase().includes(s));
  }, [q]);

  return (
    <View style={{ flex: 1, backgroundColor: "#f6f4f2", padding: 18, paddingTop: 26 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 22, fontWeight: "900" }}>Menu</Text>
        <Pressable onPress={() => router.back()} style={{ padding: 10, borderRadius: 14, backgroundColor: "#eee" }}>
          <Text style={{ fontWeight: "900" }}>Close</Text>
        </Pressable>
      </View>

      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder="Search features…"
        style={{ marginTop: 12, backgroundColor: "white", padding: 12, borderRadius: 16 }}
      />

      <FlatList
        style={{ marginTop: 12 }}
        data={filtered}
        keyExtractor={(i) => i.key}
        contentContainerStyle={{ gap: 10, paddingBottom: 20 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              router.back();
              // small delay so modal closes smoothly
              setTimeout(() => router.push(item.path as any), 120);
            }}
            style={{ padding: 14, borderRadius: 18, backgroundColor: "white" }}
          >
            <Text style={{ fontSize: 16, fontWeight: "900" }}>{item.title}</Text>
            <Text style={{ opacity: 0.7, marginTop: 4 }}>{item.subtitle}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}
