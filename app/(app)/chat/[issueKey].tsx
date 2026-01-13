import React from "react";
import { View, Text, Pressable } from "react-native";
import { useLocalSearchParams, router } from "expo-router";

export default function Chat() {
  const { issueKey } = useLocalSearchParams<{ issueKey: string }>();

  return (
    <View style={{ flex: 1, padding: 24, backgroundColor: "#f6f4f2" }}>
      <View style={{ marginTop: 34, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 22, fontWeight: "900" }}>Chat: {issueKey}</Text>
        <Pressable onPress={() => router.back()} style={{ padding: 10, borderRadius: 14, backgroundColor: "#eee" }}>
          <Text style={{ fontWeight: "900" }}>Back</Text>
        </Pressable>
      </View>

      <View style={{ marginTop: 18, padding: 14, borderRadius: 18, backgroundColor: "white" }}>
        <Text style={{ opacity: 0.75 }}>
          Placeholder chat screen. Move your existing chat UI here and swap navigation calls with router.push/router.back.
        </Text>
      </View>
    </View>
  );
}
