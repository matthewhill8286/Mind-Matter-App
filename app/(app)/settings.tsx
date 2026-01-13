import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import ScreenHeader from "@/components/ScreenHeader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { ISSUES, IssueKey } from "@/data/issues";
import { useDispatch } from "react-redux";
import { AppDispatch, showAlert } from "@/store";

export default function Settings() {
  const [selected, setSelected] = useState<Set<IssueKey>>(new Set());
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem("selectedIssues:v1");
      setSelected(new Set(raw ? JSON.parse(raw) : []));
    })();
  }, []);

  const selectedArray = useMemo(() => Array.from(selected), [selected]);

  async function save() {
    if (selectedArray.length === 0) {
      dispatch(showAlert({ title: "Select at least one section", message: "Choose one or more sections to continue." }));
      return;
    }
    await AsyncStorage.setItem("selectedIssues:v1", JSON.stringify(selectedArray));
    dispatch(showAlert({ title: "Saved", message: "Your preferences were updated." }));
    router.back();
  }

  return (
    <View style={{ flex: 1, padding: 24, backgroundColor: "#f6f4f2" }}>
      <ScreenHeader title="Settings" subtitle="Choose which sections you want to see." />

      <View style={{ marginTop: 14, backgroundColor: "white", borderRadius: 18, padding: 12, flex: 1 }}>
        <FlatList
          data={ISSUES}
          keyExtractor={(i) => i.key}
          contentContainerStyle={{ gap: 10, padding: 6 }}
          renderItem={({ item }) => {
            const isOn = selected.has(item.key);
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
                <Text style={{ fontWeight: "900" }}>{item.title}</Text>
                <Text style={{ opacity: 0.7, marginTop: 4 }}>{isOn ? "Selected" : "Tap to select"}</Text>
              </Pressable>
            );
          }}
        />
      </View>

      <Pressable onPress={save} style={{ marginTop: 14, backgroundColor: "#a07b55", padding: 16, borderRadius: 18, alignItems: "center" }}>
        <Text style={{ color: "white", fontWeight: "900" }}>Save</Text>
      </Pressable>
    </View>
  );
}
