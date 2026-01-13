import React from "react";
import { Pressable, Text } from "react-native";
import { router } from "expo-router";

export default function MenuButton() {
  return (
    <Pressable
      onPress={() => router.push("/menu")}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 14,
        backgroundColor: "#eee",
      }}
      accessibilityRole="button"
      accessibilityLabel="Open menu"
    >
      <Text style={{ fontWeight: "900" }}>Menu</Text>
    </Pressable>
  );
}
