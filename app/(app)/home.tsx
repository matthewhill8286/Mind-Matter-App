import React, { useEffect, useState } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { ISSUES, Issue } from "../../src/data/issues";

export default function Home() {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem("selectedIssues:v1");
      setSelectedKeys(raw ? JSON.parse(raw) : []);
    })();
  }, []);

  const filtered: Issue[] = ISSUES.filter((i) => selectedKeys.includes(i.key));

  return (
    <View style={{ flex: 1, padding: 24, backgroundColor: "#f6f4f2" }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 34 }}>
        <Text style={{ fontSize: 24, fontWeight: "900" }}>Home</Text>
        <Pressable onPress={() => router.push("/(app)/settings")} style={{ padding: 10, borderRadius: 14, backgroundColor: "#eee" }}>
          <Text style={{ fontWeight: "900" }}>Settings</Text>
        </Pressable>
      </View>

      <FlatList
        style={{ marginTop: 16 }}
        data={filtered}
        keyExtractor={(i) => i.key}
        contentContainerStyle={{ gap: 10, paddingBottom: 18 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: "/(app)/chat/[issueKey]", params: { issueKey: item.key } })}
            style={{ padding: 14, borderRadius: 18, backgroundColor: "white" }}
          >
            <Text style={{ fontSize: 17, fontWeight: "900" }}>{item.title}</Text>
            <Text style={{ opacity: 0.7, marginTop: 4 }}>{item.description}</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={{ padding: 14, borderRadius: 18, backgroundColor: "white", marginTop: 10 }}>
            <Text style={{ fontWeight: "900" }}>No sections selected</Text>
            <Text style={{ opacity: 0.7, marginTop: 6 }}>Go through onboarding to choose sections.</Text>
          </View>
        }
      />

      <Pressable onPress={() => router.push("/resources")} style={{ marginTop: 8, padding: 14, borderRadius: 18, backgroundColor: "#e9e9ff" }}>
        <Text style={{ fontWeight: "900" }}>Crisis / immediate help</Text>
      </Pressable>
    </View>
  );
}
