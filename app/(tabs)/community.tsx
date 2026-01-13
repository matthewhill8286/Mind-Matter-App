import React from "react";
import { View, Text, Pressable } from "react-native";
import ScreenHeader from "@/components/ScreenHeader";
import { router } from "expo-router";

export default function Screen() {
  return (
    <View style={styles.page}>
      <ScreenHeader title="Community Support" subtitle="Groups, posts, peer support (placeholder)." />

      <View style={{ marginTop: 16, gap: 10 }}>
        <Pressable onPress={() => router.push("/(tabs)/resources-tab")} style={styles.link}><Text style={styles.linkText}>Open Resources</Text></Pressable>
      </View>
    </View>
  );
}

const styles: any = {
  page: { flex: 1, backgroundColor: "#f6f4f2", padding: 24, paddingTop: 18 },
  h1: { fontSize: 26, fontWeight: "900" },
  sub: { opacity: 0.7, marginTop: 8 },
  link: { backgroundColor: "white", padding: 14, borderRadius: 18 },
  linkText: { fontWeight: "900" },
};
