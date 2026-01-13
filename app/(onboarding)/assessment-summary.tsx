import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

function meter(value: number, max: number) {
  const v = Math.max(0, Math.min(max, value));
  const filled = Math.round((v / max) * 10);
  return "█".repeat(filled) + "░".repeat(10 - filled);
}

export default function AssessmentSummary() {
  const [a, setA] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem("assessment:v1");
      setA(raw ? JSON.parse(raw) : null);
    })();
  }, []);

  const sleep = typeof a?.sleepQuality === "number" ? a.sleepQuality : null;
  const stress = typeof a?.stressLevel === "number" ? a.stressLevel : null;

  return (
    <View style={{ flex: 1, backgroundColor: "#6f6660", padding: 24, justifyContent: "center" }}>
      <View style={{ backgroundColor: "white", borderRadius: 28, padding: 26 }}>
        <Text style={{ fontSize: 24, fontWeight: "900" }}>Assessment Summary</Text>

        <Text style={{ opacity: 0.7, marginTop: 10 }}>Goal: {a?.goal ?? "—"}</Text>
        <Text style={{ opacity: 0.7, marginTop: 6 }}>Mood: {a?.mood ?? "—"}</Text>

        <Text style={{ fontWeight: "900", marginTop: 14 }}>Sleep (1–5)</Text>
        <Text style={{ fontFamily: "Courier", marginTop: 6 }}>
          {sleep == null ? "—" : `${meter(sleep, 5)}  (${sleep}/5)`}
        </Text>

        <Text style={{ fontWeight: "900", marginTop: 14 }}>Stress (0–10)</Text>
        <Text style={{ fontFamily: "Courier", marginTop: 6 }}>
          {stress == null ? "—" : `${meter(stress, 10)}  (${stress}/10)`}
        </Text>

        {a?.soundCheck?.metrics ? (
          <Text style={{ opacity: 0.7, marginTop: 14 }}>
            Sound check: WPM {a.soundCheck.metrics.wpm} • fillers {a.soundCheck.metrics.fillerCount}
          </Text>
        ) : null}
        {a?.expressionCheck ? (
          <Text style={{ opacity: 0.7, marginTop: 6 }}>
            Expression check: match {a.expressionCheck.matchScore}%
          </Text>
        ) : null}
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
