import React, { useMemo, useState } from "react";
import { View, Text, Pressable, TextInput, ScrollView } from "react-native";
import { router } from "expo-router";
import { useDispatch } from "react-redux";
import { AppDispatch, setAssessment, showAlert } from "@/store";

import Chips from "@/components/Chips";
import SelectField from "@/components/SelectField";
import SoundPulse from "@/components/SoundPulse";
import { useRecorder, computeVoiceMetrics } from "@/lib/recorder";

type Assessment = {
  goal?: string | null;
  gender?: string | null;
  age?: string | null;
  weight?: string | null;
  mood?: string | null;
  soughtHelpBefore?: string | null;
  physicalDistress?: string | null;
  physicalDistressNotes?: string | null;
  sleepQuality?: number | null; // 1..5
  takingMeds?: string | null;
  meds?: string | null;
  otherSymptoms?: string | null;
  stressLevel?: number | null; // 0..10
  soundCheck?: { uri: string; durationMs: number; transcript: string; metrics: any } | null;
  expressionCheck?: { uri: string; durationMs: number; transcript: string; metrics: any; matchScore: number } | null;
  createdAt: string;
};

const YESNO = [
  { label: "Yes", value: "Yes" },
  { label: "No", value: "No" },
  { label: "Not sure", value: "Not sure" },
];

const GENDER = [
  { label: "Woman", value: "Woman" },
  { label: "Man", value: "Man" },
  { label: "Non-binary", value: "Non-binary" },
  { label: "Prefer not to say", value: "Prefer not to say" },
];

const AGE = Array.from({ length: 79 }).map((_, i) => {
  const n = 13 + i;
  return { label: String(n), value: String(n) };
});

const WEIGHT = Array.from({ length: 23 }).map((_, i) => {
  const kg = 40 + i * 5;
  return { label: `${kg} kg`, value: `${kg}` };
});

const SOUND_PHRASES = [
  "I feel safe speaking honestly.",
  "I am taking one step at a time.",
  "It’s okay to ask for support.",
];

const EXPRESSION_PHRASE = "Today, I’m choosing a gentle pace and a calmer mind.";

type StepKey =
  | "goal"
  | "gender"
  | "age"
  | "weight"
  | "mood"
  | "help"
  | "physical"
  | "sleep"
  | "meds"
  | "medsSpecify"
  | "symptoms"
  | "stress"
  | "sound"
  | "expression";

const STEPS: StepKey[] = [
  "goal",
  "gender",
  "age",
  "weight",
  "mood",
  "help",
  "physical",
  "sleep",
  "meds",
  "medsSpecify",
  "symptoms",
  "stress",
  "sound",
  "expression",
];

export default function AssessmentScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Assessment>({ createdAt: new Date().toISOString() });

  const { startRecording, stopRecording, isRecording } = useRecorder();
  const [recordingFor, setRecordingFor] = useState<null | "sound" | "expression">(null);
  const [draftTranscript, setDraftTranscript] = useState("");

  const key = STEPS[step];
  const progress = Math.round(((step + 1) / STEPS.length) * 100);

  const canContinue = useMemo(() => {
    if (key === "goal") return Boolean(a.goal?.trim());
    if (key === "mood") return Boolean(a.mood?.trim());
    if (key === "medsSpecify") return a.takingMeds !== "Yes" || Boolean(a.meds?.trim());
    return true;
  }, [key, a]);

  async function next() {
    if (!canContinue) {
      dispatch(showAlert({ title: "Just one more thing", message: "Please fill in this step to continue." }));
      return;
    }
    if (step === STEPS.length - 1) {
      await dispatch(setAssessment(a));
      router.replace("/(onboarding)/assessment-summary");
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    setDraftTranscript("");
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
    setDraftTranscript("");
  }

  async function startRec(kind: "sound" | "expression") {
    try {
      setRecordingFor(kind);
      await startRecording();
    } catch (e) {
      setRecordingFor(null);
      dispatch(showAlert({ title: "Microphone needed", message: "Please allow microphone access to record." }));
      throw e;
    }
  }

  async function stopRec() {
    if (!isRecording || !recordingFor) return;
    try {
      const { uri, durationMs } = await stopRecording();
      const transcript = draftTranscript.trim();
      const metrics = computeVoiceMetrics(durationMs, transcript || " ");
      if (recordingFor === "sound") {
        setA((prev) => ({ ...prev, soundCheck: { uri, durationMs, transcript, metrics } }));
      } else {
        const phrase = EXPRESSION_PHRASE.toLowerCase().replaceAll(/[^a-z\s]/g, "");
        const said = transcript.toLowerCase().replaceAll(/[^a-z\s]/g, "");
        const phraseWords = new Set(phrase.split(/\s+/).filter(Boolean));
        const saidWords = new Set(said.split(/\s+/).filter(Boolean));
        let hit = 0;
        phraseWords.forEach((w) => { if (saidWords.has(w)) hit += 1; });
        const matchScore = phraseWords.size ? Math.round((hit / phraseWords.size) * 100) : 0;
        setA((prev) => ({ ...prev, expressionCheck: { uri, durationMs, transcript, metrics, matchScore } }));
      }
    } catch (e) {
      dispatch(showAlert({ title: "Recording error", message: "Could not save the recording. Please try again." }));
      throw e;
    } finally {
      setRecordingFor(null);
    }
  }

  function renderStep() {
    switch (key) {
      case "goal":
        return (
          <>
            <Text style={styles.h1}>What’s your health goal for today?</Text>
            <Text style={styles.sub}>Pick one (or type your own).</Text>
            <Chips
              options={["Calm", "Reduce stress", "Better sleep", "Clarity", "Confidence", "Motivation"]}
              value={a.goal ?? undefined}
              onChange={(v) => setA((p) => ({ ...p, goal: v as string }))}
            />
            <TextInput
              value={a.goal ?? ""}
              onChangeText={(t) => setA((p) => ({ ...p, goal: t }))}
              placeholder="Or type your goal…"
              style={styles.input}
            />
          </>
        );
      case "gender":
        return (
          <>
            <Text style={styles.h1}>What’s your gender?</Text>
            <SelectField
              label="Gender"
              value={a.gender ?? null}
              options={GENDER}
              allowCustom
              customLabel="Self-describe…"
              onChange={(v) => setA((p) => ({ ...p, gender: v }))}
            />
          </>
        );
      case "age":
        return (
          <>
            <Text style={styles.h1}>How old are you?</Text>
            <SelectField
              label="Age"
              value={a.age ?? null}
              options={AGE}
              allowCustom
              customLabel="Enter custom age…"
              onChange={(v) => setA((p) => ({ ...p, age: v }))}
            />
          </>
        );
      case "weight":
        return (
          <>
            <Text style={styles.h1}>What’s your weight?</Text>
            <SelectField
              label="Weight"
              value={a.weight ?? null}
              options={WEIGHT}
              allowCustom
              customLabel="Enter custom weight…"
              onChange={(v) => setA((p) => ({ ...p, weight: v }))}
            />
          </>
        );
      case "mood":
        return (
          <>
            <Text style={styles.h1}>Describe your mood</Text>
            <Text style={styles.sub}>A sentence or two is enough.</Text>
            <TextInput
              value={a.mood ?? ""}
              onChangeText={(t) => setA((p) => ({ ...p, mood: t }))}
              placeholder="e.g., anxious, tired, overwhelmed…"
              multiline
              style={[styles.input, { height: 110 }]}
            />
            <Chips
              options={["Anxious", "Overwhelmed", "Low", "Irritable", "Numb", "Okay"]}
              value={undefined}
              onChange={(v) =>
                setA((p) => ({ ...p, mood: ((p.mood ?? "").trim() + " " + (v as string)).trim() }))
              }
            />
          </>
        );
      case "help":
        return (
          <>
            <Text style={styles.h1}>Have you sought help before?</Text>
            <SelectField
              label="Sought help before?"
              value={a.soughtHelpBefore ?? null}
              options={YESNO}
              onChange={(v) => setA((p) => ({ ...p, soughtHelpBefore: v }))}
            />
          </>
        );
      case "physical":
        return (
          <>
            <Text style={styles.h1}>Experiencing physical distress?</Text>
            <SelectField
              label="Physical distress?"
              value={a.physicalDistress ?? null}
              options={YESNO}
              onChange={(v) => setA((p) => ({ ...p, physicalDistress: v }))}
            />
            <TextInput
              value={a.physicalDistressNotes ?? ""}
              onChangeText={(t) => setA((p) => ({ ...p, physicalDistressNotes: t }))}
              placeholder="Optional notes (headache, chest tightness, nausea, etc.)"
              style={styles.input}
            />
          </>
        );
      case "sleep":
        return (
          <>
            <Text style={styles.h1}>Rate your sleep quality</Text>
            <Text style={styles.sub}>1 = poor, 5 = great</Text>
            <Chips
              options={["1", "2", "3", "4", "5"]}
              value={a.sleepQuality ? String(a.sleepQuality) : undefined}
              onChange={(v) => setA((p) => ({ ...p, sleepQuality: Number(v) }))}
            />
          </>
        );
      case "meds":
        return (
          <>
            <Text style={styles.h1}>Are you taking meds?</Text>
            <SelectField
              label="Taking meds?"
              value={a.takingMeds ?? null}
              options={YESNO}
              onChange={(v) => setA((p) => ({ ...p, takingMeds: v, meds: v === "Yes" ? (p.meds ?? "") : null }))}
            />
          </>
        );
      case "medsSpecify":
        return (
          <>
            <Text style={styles.h1}>Specify meds (if any)</Text>
            <Text style={styles.sub}>If you selected “Yes”, please list them.</Text>
            <TextInput
              value={a.meds ?? ""}
              onChangeText={(t) => setA((p) => ({ ...p, meds: t }))}
              placeholder="Medication names"
              style={styles.input}
            />
          </>
        );
      case "symptoms":
        return (
          <>
            <Text style={styles.h1}>Other mental health symptoms</Text>
            <Text style={styles.sub}>Anything else you’ve noticed?</Text>
            <TextInput
              value={a.otherSymptoms ?? ""}
              onChangeText={(t) => setA((p) => ({ ...p, otherSymptoms: t }))}
              placeholder="e.g., rumination, panic, low appetite…"
              multiline
              style={[styles.input, { height: 110 }]}
            />
          </>
        );
      case "stress":
        return (
          <>
            <Text style={styles.h1}>Rate your stress level</Text>
            <Text style={styles.sub}>0 = none, 10 = extreme</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, marginTop: 16 }}>
              {Array.from({ length: 11 }).map((_, i) => {
                const on = a.stressLevel === i;
                return (
                  <Pressable
                    key={i + Math.random().toString()}
                    onPress={() => setA((p) => ({ ...p, stressLevel: i }))}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: on ? "#a07b55" : "#f2f2f2",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: on ? "white" : "#333", fontWeight: "900" }}>{i}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </>
        );
      case "sound":
        return (
          <>
            <Text style={styles.h1}>Sound check-in</Text>
            <Text style={styles.sub}>Read these phrases out loud.</Text>
            <View style={{ marginTop: 12 }}>
              {SOUND_PHRASES.map((p) => (
                <Text key={p} style={{ opacity: 0.8, marginTop: 6 }}>• {p}</Text>
              ))}
            </View>

            <View style={{ alignItems: "center", marginTop: 18 }}>
              <SoundPulse active={recordingFor === "sound"} />
            </View>

            <View style={{ marginTop: 12 }}>
              <Text style={{ fontWeight: "900" }}>Optional transcript (for metrics)</Text>
              <TextInput
                value={draftTranscript}
                onChangeText={setDraftTranscript}
                placeholder="Type what you said (optional)…"
                multiline
                style={[styles.input, { height: 90 }]}
              />
            </View>

            <Pressable
              onPress={() => (recordingFor === "sound" ? stopRec() : startRec("sound"))}
              style={[styles.primaryBtn, { marginTop: 12, backgroundColor: recordingFor === "sound" ? "#333" : "#a07b55" }]}
            >
              <Text style={styles.primaryBtnText}>{recordingFor === "sound" ? "Stop recording" : "Start recording"}</Text>
            </Pressable>

            {a.soundCheck ? (
              <View style={{ marginTop: 12 }}>
                <Text style={{ fontWeight: "900" }}>Saved</Text>
                <Text style={{ opacity: 0.7 }}>Duration: {Math.round(a.soundCheck.durationMs / 1000)}s • WPM: {a.soundCheck.metrics?.wpm ?? "—"}</Text>
              </View>
            ) : null}
          </>
        );
      case "expression":
        return (
          <>
            <Text style={styles.h1}>Expression check-in</Text>
            <Text style={styles.sub}>Read this out loud:</Text>
            <View style={{ marginTop: 12, padding: 14, borderRadius: 18, backgroundColor: "#f2f2f2" }}>
              <Text style={{ fontWeight: "900" }}>{EXPRESSION_PHRASE}</Text>
            </View>

            <View style={{ alignItems: "center", marginTop: 18 }}>
              <SoundPulse active={recordingFor === "expression"} />
            </View>

            <View style={{ marginTop: 12 }}>
              <Text style={{ fontWeight: "900" }}>Optional transcript (for match score)</Text>
              <TextInput
                value={draftTranscript}
                onChangeText={setDraftTranscript}
                placeholder="Type what you said (optional)…"
                multiline
                style={[styles.input, { height: 90 }]}
              />
            </View>

            <Pressable
              onPress={() => (recordingFor === "expression" ? stopRec() : startRec("expression"))}
              style={[styles.primaryBtn, { marginTop: 12, backgroundColor: recordingFor === "expression" ? "#333" : "#a07b55" }]}
            >
              <Text style={styles.primaryBtnText}>{recordingFor === "expression" ? "Stop recording" : "Start recording"}</Text>
            </Pressable>

            {a.expressionCheck ? (
              <View style={{ marginTop: 12 }}>
                <Text style={{ fontWeight: "900" }}>Saved</Text>
                <Text style={{ opacity: 0.7 }}>
                  Duration: {Math.round(a.expressionCheck.durationMs / 1000)}s • Match: {a.expressionCheck.matchScore}%
                </Text>
              </View>
            ) : null}
          </>
        );
      default:
        return null;
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#6f6660", padding: 24 }}>
      <View style={{ marginTop: 34 }}>
        <Text style={{ color: "white", fontSize: 20, fontWeight: "900" }}>Assessment</Text>
        <Text style={{ color: "white", opacity: 0.75, marginTop: 6 }}>
          Step {step + 1} of {STEPS.length} • {progress}%
        </Text>
      </View>

      <ScrollView style={{ marginTop: 16 }} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ backgroundColor: "white", borderRadius: 28, padding: 18 }}>
          {renderStep()}
        </View>

        <View style={{ flexDirection: "row", gap: 12, marginTop: 14 }}>
          <Pressable
            onPress={back}
            disabled={step === 0}
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

          <Pressable
            onPress={next}
            style={{
              flex: 1,
              padding: 16,
              borderRadius: 18,
              backgroundColor: canContinue ? "#a07b55" : "rgba(160,123,85,0.5)",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "900" }}>
              {step === STEPS.length - 1 ? "Finish" : "Next"}
            </Text>
          </Pressable>
        </View>

        <Pressable onPress={() => router.replace("/(onboarding)/assessment-summary")} style={{ marginTop: 10 }}>
          <Text style={{ color: "white", opacity: 0.65, textAlign: "center" }}>Skip assessment</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles: any = {
  h1: { fontSize: 22, fontWeight: "900", marginTop: 4 },
  sub: { opacity: 0.7, marginTop: 8 },
  input: { marginTop: 14, padding: 12, borderRadius: 16, backgroundColor: "#f2f2f2" },
  primaryBtn: { padding: 16, borderRadius: 18, alignItems: "center" },
  primaryBtnText: { color: "white", fontWeight: "900" },
};
