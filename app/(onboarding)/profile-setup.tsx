import React, { useMemo, useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import ProfileProgressRing from "../../src/components/ProfileProgressRing";
import Chips from "../../src/components/Chips";

type StepKey = "intro" | "name" | "intention" | "routine" | "finish";
const STEPS: StepKey[] = ["intro", "name", "intention", "routine", "finish"];

export default function ProfileSetup() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [intention, setIntention] = useState<string | undefined>();
  const [routine, setRoutine] = useState<string | undefined>();

  const progress = useMemo(() => Math.round(((step + 1) / STEPS.length) * 100), [step]);
  const stepKey = STEPS[step];

  async function next() {
    if (stepKey === "finish") {
      await AsyncStorage.setItem(
        "profile:v1",
        JSON.stringify({
          name: name.trim() || null,
          intention: intention ?? null,
          routine: routine ?? null,
          createdAt: new Date().toISOString(),
        })
      );
      router.replace("/(onboarding)/profile-completion");
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#6f6660", padding: 24, justifyContent: "center" }}>
      <View style={{ backgroundColor: "white", borderRadius: 28, padding: 26 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ opacity: 0.7, fontWeight: "800" }}>Profile Setup</Text>
          <ProfileProgressRing progress={progress} />
        </View>

        {stepKey === "intro" && (
          <>
            <Text style={{ fontSize: 26, fontWeight: "900", marginTop: 18 }}>Let’s set up your profile</Text>
            <Text style={{ opacity: 0.7, marginTop: 10 }}>This helps tailor suggestions and check-ins.</Text>
          </>
        )}

        {stepKey === "name" && (
          <>
            <Text style={{ fontSize: 22, fontWeight: "900", marginTop: 18 }}>What should we call you?</Text>
            <Text style={{ opacity: 0.7, marginTop: 8 }}>Optional — you can skip.</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name or nickname"
              style={{
                marginTop: 16,
                paddingVertical: 12,
                paddingHorizontal: 14,
                borderRadius: 16,
                backgroundColor: "#f2f2f2",
                fontSize: 16,
              }}
            />
          </>
        )}

        {stepKey === "intention" && (
          <>
            <Text style={{ fontSize: 22, fontWeight: "900", marginTop: 18 }}>What do you want help with most?</Text>
            <Text style={{ opacity: 0.7, marginTop: 8 }}>Pick one.</Text>
            <Chips
              options={["Calm", "Focus", "Sleep", "Stress", "Confidence", "Balance"]}
              value={intention}
              onChange={(v) => setIntention(v as string)}
            />
          </>
        )}

        {stepKey === "routine" && (
          <>
            <Text style={{ fontSize: 22, fontWeight: "900", marginTop: 18 }}>When do you prefer check-ins?</Text>
            <Text style={{ opacity: 0.7, marginTop: 8 }}>Pick one.</Text>
            <Chips options={["Morning", "Evening", "Anytime"]} value={routine} onChange={(v) => setRoutine(v as string)} />
          </>
        )}

        {stepKey === "finish" && (
          <>
            <Text style={{ fontSize: 26, fontWeight: "900", marginTop: 18 }}>You’re all set</Text>
            <Text style={{ opacity: 0.7, marginTop: 10 }}>Next, we’ll suggest categories based on your check-in.</Text>

            <View style={{ marginTop: 18 }}>
              <Text style={{ fontWeight: "900" }}>Name</Text>
              <Text style={{ opacity: 0.7 }}>{name.trim() || "Not set"}</Text>

              <Text style={{ fontWeight: "900", marginTop: 12 }}>Goal</Text>
              <Text style={{ opacity: 0.7 }}>{intention ?? "Not set"}</Text>

              <Text style={{ fontWeight: "900", marginTop: 12 }}>Routine</Text>
              <Text style={{ opacity: 0.7 }}>{routine ?? "Not set"}</Text>
            </View>
          </>
        )}
      </View>

      <View style={{ flexDirection: "row", gap: 12, marginTop: 18 }}>
        <Pressable
          onPress={back}
          disabled={step == 0}
          style={{
            flex: 1,
            padding: 16,
            borderRadius: 18,
            backgroundColor: "rgba(255,255,255,0.16)",
            opacity: step === 0 ? 0.35 : 1,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "900" }}>Back</Text>
        </Pressable>

        <Pressable onPress={next} style={{ flex: 1, padding: 16, borderRadius: 18, backgroundColor: "#a07b55", alignItems: "center" }}>
          <Text style={{ color: "white", fontWeight: "900" }}>{stepKey === "finish" ? "Continue" : "Next"}</Text>
        </Pressable>
      </View>

      <Pressable onPress={() => router.replace("/(onboarding)/suggested-categories")} style={{ marginTop: 12 }}>
        <Text style={{ color: "white", opacity: 0.65, textAlign: "center" }}>Skip setup</Text>
      </Pressable>
    </View>
  );
}
