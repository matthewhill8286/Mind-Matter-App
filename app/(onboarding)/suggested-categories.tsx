import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { ISSUES, IssueKey } from "@/data/issues";
import { suggestWithReasons } from "@/lib/suggestCategories";

export default function SuggestedCategories() {
  const [suggested, setSuggested] = useState<{ key: IssueKey; score: number; reasons: string[] }[]>([]);
  const [selected, setSelected] = useState<Set<IssueKey>>(new Set());

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem("assessment:v1");
      const assessment = raw ? JSON.parse(raw) : null;
      const s = suggestWithReasons(assessment);
      setSuggested(s);
      setSelected(new Set(s.slice(0, 3).map((x) => x.key)));
    })();
  }, []);

  const selectedArray = useMemo(() => Array.from(selected), [selected]);

  async function onContinue() {
    await AsyncStorage.setItem("selectedIssues:v1", JSON.stringify(selectedArray));
    router.replace("/(app)/home");
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#6f6660", padding: 24 }}>
      <Text style={{ color: "white", fontSize: 22, fontWeight: "900", marginTop: 34 }}>Suggested sections</Text>
      <Text style={{ color: "white", opacity: 0.75, marginTop: 8 }}>Based on your check-in. Tap to adjust.</Text>

      <View style={{ marginTop: 16, backgroundColor: "white", borderRadius: 28, padding: 14, flex: 1 }}>
        <FlatList
          data={ISSUES}
          keyExtractor={(i) => i.key}
          contentContainerStyle={{ gap: 10, padding: 6 }}
          renderItem={({ item }) => {
            const isOn = selected.has(item.key);
            const why = suggested.find((s) => s.key === item.key);

            return (
              <Pressable
                onPress={() => {
                  setSelected((prev) => {
                    const next = new Set(prev);
                    if (next.has(item.key)) next.delete(item.key);
                    else next.add(item.key);
                    return next;
                  });
                }}
                style={{ padding: 14, borderRadius: 18, backgroundColor: isOn ? "#dff7df" : "#f2f2f2" }}
              >
                <Text style={{ fontSize: 17, fontWeight: "900" }}>{item.title}</Text>
                <Text style={{ opacity: 0.7, marginTop: 4 }}>{item.description}</Text>
                {why ? (
                  <View style={{ marginTop: 8 }}>
                    <Text style={{ fontWeight: "800", opacity: 0.75 }}>Why:</Text>
                    {why.reasons.slice(0, 2).map((r, idx) => (
                      <Text key={r} style={{ opacity: 0.7 }}>• {r}</Text>
                    ))}
                  </View>
                ) : null}
              </Pressable>
            );
          }}
        />
      </View>

      <Pressable onPress={onContinue} style={{ marginTop: 14, backgroundColor: "#a07b55", padding: 16, borderRadius: 18, alignItems: "center" }}>
        <Text style={{ color: "white", fontWeight: "900" }}>Continue</Text>
      </Pressable>
    </View>
  );
}
