import React, { useEffect } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { router } from "expo-router";
import ScreenHeader from "@/components/ScreenHeader";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch, fetchJournalEntries } from "@/store";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function Journal() {
  const dispatch = useDispatch<AppDispatch>();
  const entries = useSelector((s: RootState) => s.app.journalEntries);

  useEffect(() => {
    dispatch(fetchJournalEntries());
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#f6f4f2", padding: 24, paddingTop: 18 }}>
      <ScreenHeader title="Mental Health Journal" subtitle="Write, reflect, and notice patterns over time." />

      <View style={{ flexDirection: "row", gap: 12, marginTop: 14 }}>
        <Pressable onPress={() => router.push("/(app)/journal/new")} style={{ flex: 1, backgroundColor: "#a07b55", padding: 14, borderRadius: 18, alignItems: "center" }}>
          <Text style={{ color: "white", fontWeight: "900" }}>New Entry</Text>
        </Pressable>
        <Pressable onPress={() => router.push("/(app)/journal/prompts")} style={{ flex: 1, backgroundColor: "white", padding: 14, borderRadius: 18, alignItems: "center" }}>
          <Text style={{ fontWeight: "900" }}>Prompts</Text>
        </Pressable>
      </View>

      {entries.length === 0 ? (
        <View style={{ marginTop: 14, backgroundColor: "white", borderRadius: 18, padding: 16 }}>
          <Text style={{ fontWeight: "900", fontSize: 16 }}>No entries yet</Text>
          <Text style={{ opacity: 0.7, marginTop: 6 }}>Start with a prompt or write freely. Even a few lines can help.</Text>
        </View>
      ) : null}

      <FlatList
        style={{ marginTop: 14 }}
        data={entries}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ gap: 10, paddingBottom: 18 }}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push({ pathname: "/(app)/journal/[id]", params: { id: item.id } })} style={{ padding: 14, borderRadius: 18, backgroundColor: "white" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
              <Text style={{ fontSize: 16, fontWeight: "900", flex: 1 }}>{item.title || "Untitled"}</Text>
              {item.mood ? (
                <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: "#f2f2f2" }}>
                  <Text style={{ fontWeight: "800", opacity: 0.75 }}>{item.mood}</Text>
                </View>
              ) : null}
            </View>
            <Text style={{ opacity: 0.65, marginTop: 6 }}>{formatDate(item.createdAt)}</Text>
            <Text style={{ opacity: 0.75, marginTop: 6 }} numberOfLines={2}>{item.body}</Text>
            {(item.tags ?? []).length ? (
              <Text style={{ opacity: 0.6, marginTop: 8, fontWeight: "800" }}>
                {(item.tags ?? []).slice(0, 4).map((t) => `#${t}`).join(" ")}{(item.tags ?? []).length > 4 ? " …" : ""}
              </Text>
            ) : null}
          </Pressable>
        )}
      />
    </View>
  );
}
