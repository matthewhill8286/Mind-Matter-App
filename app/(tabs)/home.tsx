import React, { useEffect, useMemo } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import ScreenHeader from "@/components/ScreenHeader";
import { router } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch, fetchAll } from "@/store";

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function moodToScore(m: "Great" | "Good" | "Okay" | "Low" | "Bad") {
  if (m === "Great") return 5;
  if (m === "Good") return 4;
  if (m === "Okay") return 3;
  if (m === "Low") return 2;
  return 1;
}

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const { moodCheckIns, journalEntries, assessment } = useSelector((s: RootState) => s.app);

  useEffect(() => {
    dispatch(fetchAll());
  }, []);

  const { score, scoreHint } = useMemo(() => {
    // Very simple heuristic score (0-100) using last mood + stress
    if (moodCheckIns.length) {
      const last = moodCheckIns[0];
      const moodScore = (moodToScore(last.mood) / 5) * 70; // up to 70
      const stressPenalty = (last.stress / 10) * 25; // up to -25
      const energyBonus = ((last.energy - 1) / 4) * 15; // up to +15
      const s = clamp(Math.round(moodScore - stressPenalty + energyBonus + 10), 0, 100);
      return { score: s, scoreHint: "Updated from your latest mood check-in." };
    } else if (assessment) {
      return { score: 65, scoreHint: "Set from your assessment. Add mood check-ins to refine it." };
    } else {
      return { score: 60, scoreHint: "Complete your assessment and add check-ins to refine this." };
    }
  }, [moodCheckIns, assessment]);

  const moodCount = moodCheckIns.length;
  const journalCount = journalEntries.length;

  const quickCards = useMemo(
    () => [
      { title: "Stress toolkit", subtitle: "Breathing, grounding, and your Stress Plan.", onPress: () => router.push("/(tabs)/stress") },
      { title: "Mood check-in", subtitle: "Log mood, energy, and stress in 30 seconds.", onPress: () => router.push("/(tabs)/mood") },
      { title: "Journal", subtitle: "Write a quick entry or use a prompt.", onPress: () => router.push("/(tabs)/journal") },
      { title: "Chat", subtitle: "Talk to the AI about a specific topic.", onPress: () => router.push("/(tabs)/chat") },
    ],
    []
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f6f4f2", padding: 24, paddingTop: 18 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 26 }} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Home" subtitle="Your wellbeing snapshot and quick actions." />

        <View style={{ backgroundColor: "white", borderRadius: 22, padding: 16, marginTop: 14 }}>
          <Text style={{ fontWeight: "900", opacity: 0.7 }}>Mental Health Score</Text>
          <Text style={{ fontSize: 44, fontWeight: "900", marginTop: 6 }}>{score}</Text>
          <Text style={{ opacity: 0.7, marginTop: 6 }}>{scoreHint}</Text>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
            <MiniStat label="Mood check-ins" value={String(moodCount)} />
            <MiniStat label="Journal entries" value={String(journalCount)} />
          </View>

          {assessment ? null : (
              <Pressable
                  onPress={() => router.push("/(onboarding)/assessment")}
                  style={{
                    marginTop: 14,
                    backgroundColor: "#a07b55",
                    padding: 14,
                    borderRadius: 18,
                    alignItems: "center"
                  }}
              >
                <Text style={{color: "white", fontWeight: "900"}}>Complete assessment</Text>
              </Pressable>
          )}
        </View>

        <Text style={{ marginTop: 16, fontWeight: "900", fontSize: 16 }}>Quick actions</Text>

        <View style={{ marginTop: 10, gap: 12 }}>
          {quickCards.map((c) => (
            <Pressable key={c.title} onPress={c.onPress} style={{ backgroundColor: "white", borderRadius: 18, padding: 14 }}>
              <Text style={{ fontSize: 16, fontWeight: "900" }}>{c.title}</Text>
              <Text style={{ opacity: 0.7, marginTop: 4 }}>{c.subtitle}</Text>
              <Text style={{ marginTop: 10, fontWeight: "900", opacity: 0.7 }}>Open →</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ backgroundColor: "white", borderRadius: 18, padding: 14, marginTop: 16 }}>
          <Text style={{ fontWeight: "900" }}>Need a quick reset?</Text>
          <Text style={{ opacity: 0.7, marginTop: 6 }}>Tap to start guided breathing or grounding exercises right away.</Text>
          <Pressable
            onPress={() => router.push("/(tabs)/stress")}
            style={{ marginTop: 12, backgroundColor: "#eee", padding: 14, borderRadius: 18, alignItems: "center" }}
          >
            <Text style={{ fontWeight: "900" }}>Open Stress toolkit</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function MiniStat({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <View style={{ flex: 1, backgroundColor: "#f6f4f2", borderRadius: 16, padding: 12 }}>
      <Text style={{ opacity: 0.7, fontWeight: "800" }}>{label}</Text>
      <Text style={{ fontSize: 18, fontWeight: "900", marginTop: 6 }}>{value}</Text>
    </View>
  );
}
