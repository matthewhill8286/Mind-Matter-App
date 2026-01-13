import React, { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, FlatList } from "react-native";
import { router } from "expo-router";
import { ISSUES } from "@/data/issues";

export default function Search() {
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return ISSUES;
    return ISSUES.filter((i) => (i.title + " " + i.description).toLowerCase().includes(s));
  }, [q]);

  return (
    <View style={{ flex: 1, backgroundColor: "#f6f4f2", padding: 24, paddingTop: 54 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 24, fontWeight: "900" }}>Search</Text>
        <Pressable onPress={() => router.back()} style={{ padding: 10, borderRadius: 14, backgroundColor: "#eee" }}>
          <Text style={{ fontWeight: "900" }}>Close</Text>
        </Pressable>
      </View>

      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder="Search sections…"
        style={{ marginTop: 14, backgroundColor: "white", padding: 12, borderRadius: 16 }}
      />

      <FlatList
        style={{ marginTop: 14 }}
        data={results}
        keyExtractor={(i) => i.key}
        contentContainerStyle={{ gap: 10, paddingBottom: 20 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: "/(app)/chat/[issueKey]", params: { issueKey: item.key } })}
            style={{ padding: 14, borderRadius: 18, backgroundColor: "white" }}
          >
            <Text style={{ fontWeight: "900" }}>{item.title}</Text>
            <Text style={{ opacity: 0.7, marginTop: 4 }}>{item.description}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}
