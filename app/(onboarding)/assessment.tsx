import React, { useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function Assessment() {
  const [mood, setMood] = useState("");
  const [stress, setStress] = useState("5");
  const [sleep, setSleep] = useState("3");

  async function finish() {
    await AsyncStorage.setItem(
      "assessment:v1",
      JSON.stringify({
        mood,
        stress: Number(stress),
        sleep: Number(sleep),
        createdAt: new Date().toISOString(),
      })
    );
    router.replace("/(onboarding)/assessment-summary");
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#6f6660", padding: 24, justifyContent: "center" }}>
      <View style={{ backgroundColor: "white", borderRadius: 28, padding: 26 }}>
        <Text style={{ fontSize: 24, fontWeight: "900" }}>Quick Assessment (placeholder)</Text>
        <Text style={{ opacity: 0.7, marginTop: 8 }}>
          Replace this with your full 14-step assessment.
        </Text>

        <Text style={{ marginTop: 18, fontWeight: "800" }}>Mood</Text>
        <TextInput
          value={mood}
          onChangeText={setMood}
          placeholder="How are you feeling?"
          style={{ marginTop: 8, padding: 12, borderRadius: 14, backgroundColor: "#f2f2f2" }}
        />

        <Text style={{ marginTop: 14, fontWeight: "800" }}>Stress (0-10)</Text>
        <TextInput
          value={stress}
          onChangeText={setStress}
          keyboardType="numeric"
          style={{ marginTop: 8, padding: 12, borderRadius: 14, backgroundColor: "#f2f2f2" }}
        />

        <Text style={{ marginTop: 14, fontWeight: "800" }}>Sleep (1-5)</Text>
        <TextInput
          value={sleep}
          onChangeText={setSleep}
          keyboardType="numeric"
          style={{ marginTop: 8, padding: 12, borderRadius: 14, backgroundColor: "#f2f2f2" }}
        />
      </View>

      <Pressable
        onPress={finish}
        style={{ marginTop: 18, backgroundColor: "#a07b55", padding: 16, borderRadius: 18, alignItems: "center" }}
      >
        <Text style={{ color: "white", fontWeight: "900" }}>Finish</Text>
      </Pressable>
    </View>
  );
}
