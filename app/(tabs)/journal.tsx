import React, { useEffect } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { router } from "expo-router";
import ScreenHeader from "@/components/ScreenHeader";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch, fetchJournalEntries } from "@/store";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors, UI } from "@/constants/theme";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function Journal() {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useColorScheme() ?? "light";
  const colors = Colors[theme];
  const entries = useSelector((s: RootState) => s.app.journalEntries);

  useEffect(() => {
    dispatch(fetchJournalEntries());
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: UI.spacing.xl, paddingTop: 18 }}>
      <ScreenHeader title="Mental Health Journal" subtitle="Write, reflect, and notice patterns over time." />

      <View style={{ flexDirection: "row", gap: 12, marginTop: 14 }}>
        <Pressable onPress={() => router.push("/(app)/journal/new")} style={{ flex: 1, backgroundColor: colors.primary, padding: 14, borderRadius: UI.radius.lg, alignItems: "center" }}>
          <Text style={{ color: colors.onPrimary, fontWeight: "900" }}>New Entry</Text>
        </Pressable>
        <Pressable onPress={() => router.push("/(app)/journal/prompts")} style={{ flex: 1, backgroundColor: colors.card, padding: 14, borderRadius: UI.radius.lg, alignItems: "center" }}>
          <Text style={{ fontWeight: "900", color: colors.text }}>Prompts</Text>
        </Pressable>
      </View>

      {entries.length === 0 ? (
        <View style={{ marginTop: 14, backgroundColor: colors.card, borderRadius: UI.radius.lg, padding: 16 }}>
          <Text style={{ fontWeight: "900", fontSize: 16, color: colors.text }}>No entries yet</Text>
          <Text style={{ color: colors.mutedText, marginTop: 6 }}>Start with a prompt or write freely. Even a few lines can help.</Text>
        </View>
      ) : null}

      <FlatList
        style={{ marginTop: 14 }}
        data={entries}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ gap: 10, paddingBottom: 18 }}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push({ pathname: "/(app)/journal/[id]", params: { id: item.id } })} style={{ padding: 14, borderRadius: UI.radius.lg, backgroundColor: colors.card }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
              <Text style={{ fontSize: 16, fontWeight: "900", flex: 1, color: colors.text }}>{item.title || "Untitled"}</Text>
              {item.mood ? (
                <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: UI.radius.pill, backgroundColor: colors.inputBg }}>
                  <Text style={{ fontWeight: "800", color: colors.mutedText }}>{item.mood}</Text>
                </View>
              ) : null}
            </View>
            <Text style={{ color: colors.subtleText, marginTop: 6 }}>{formatDate(item.createdAt)}</Text>
            <Text style={{ color: colors.mutedText, marginTop: 6 }} numberOfLines={2}>{item.body}</Text>
            {(item.tags ?? []).length ? (
              <Text style={{ color: colors.subtleText, marginTop: 8, fontWeight: "800" }}>
                {(item.tags ?? []).slice(0, 4).map((t) => `#${t}`).join(" ")}{(item.tags ?? []).length > 4 ? " …" : ""}
              </Text>
            ) : null}
          </Pressable>
        )}
      />
    </View>
  );
}
