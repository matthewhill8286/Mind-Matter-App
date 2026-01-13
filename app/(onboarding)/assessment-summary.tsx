import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function AssessmentSummary() {
  const [a, setA] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem("assessment:v1");
      setA(raw ? JSON.parse(raw) : null);
    })();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#6f6660", padding: 24, justifyContent: "center" }}>
      <View style={{ backgroundColor: "white", borderRadius: 28, padding: 26 }}>
        <Text style={{ fontSize: 24, fontWeight: "900" }}>Assessment Summary</Text>
        <Text style={{ opacity: 0.7, marginTop: 8 }}>
          Mood: {a?.mood || "—"} • Stress: {a?.stress ?? "—"} • Sleep: {a?.sleep ?? "—"}
        </Text>
      </View>

      <Pressable
        onPress={() => router.replace("/(onboarding)/profile-setup")}
        style={{ marginTop: 18, backgroundColor: "#a07b55", padding: 16, borderRadius: 18, alignItems: "center" }}
      >
        <Text style={{ color: "white", fontWeight: "900" }}>Continue</Text>
      </Pressable>
    </View>
  );
}
