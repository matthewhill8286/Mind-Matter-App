import React, { useMemo, useState } from "react";
import { View, Text, Pressable, TextInput, FlatList } from "react-native";
import { router } from "expo-router";
import ScreenHeader from "@/components/ScreenHeader";
import { JOURNAL_PROMPTS } from "@/data/journalPrompts";

export default function JournalPrompts() {
  const [q, setQ] = useState("");

  const data = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return JOURNAL_PROMPTS;
    return JOURNAL_PROMPTS.filter((p) => (p.title + " " + p.prompt + " " + p.category).toLowerCase().includes(s));
  }, [q]);

  return (
    <View style={{ flex: 1, backgroundColor: "#f6f4f2", padding: 24, paddingTop: 18 }}>
      <ScreenHeader title="Journal Prompts" subtitle="Pick one to start writing." />

      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder="Search prompts…"
        style={{ marginTop: 12, backgroundColor: "white", padding: 12, borderRadius: 16 }}
      />

      <FlatList
        style={{ marginTop: 12 }}
        data={data}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ gap: 10, paddingBottom: 18 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: "/(app)/journal/new", params: { promptId: item.id } })}
            style={{ padding: 14, borderRadius: 18, backgroundColor: "white" }}
          >
            <Text style={{ fontSize: 16, fontWeight: "900" }}>{item.title}</Text>
            <Text style={{ opacity: 0.7, marginTop: 4 }}>{item.prompt}</Text>
            <Text style={{ opacity: 0.6, marginTop: 8, fontWeight: "800" }}>{item.category.toUpperCase()}</Text>
          </Pressable>
        )}
      />

      <Pressable onPress={() => router.back()} style={{ marginTop: 10, padding: 14, borderRadius: 18, backgroundColor: "#eee", alignItems: "center" }}>
        <Text style={{ fontWeight: "900" }}>Back</Text>
      </Pressable>
    </View>
  );
}
