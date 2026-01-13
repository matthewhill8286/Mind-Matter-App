import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, Animated, Easing, ScrollView, TextInput, Alert } from "react-native";
import ScreenHeader from "@/components/ScreenHeader";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Mode = "hub" | "breathing" | "grounding" | "plan";

const STORAGE_KEY = "stress:kit:v1";

type StressKit = {
  quickPhrase?: string;
  triggers: string[];
  helpfulActions: string[];
  people: string[];
  notes?: string;
};

const DEFAULT_KIT: StressKit = {
  quickPhrase: "This feeling will pass. I can take one small step.",
  triggers: ["Work pressure", "Conflict", "Uncertainty"],
  helpfulActions: ["4-7-8 breathing", "Short walk", "Cold water on wrists"],
  people: ["A friend", "A family member"],
  notes: "",
};

export default function Stress() {
  const [mode, setMode] = useState<Mode>("hub");
  const [kit, setKit] = useState<StressKit>(DEFAULT_KIT);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setKit(JSON.parse(raw));
    })();
  }, []);

  async function saveKit(next: StressKit) {
    setKit(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f6f4f2", padding: 24, paddingTop: 18 }}>
      <ScreenHeader
        title="Stress Management"
        subtitle="Quick tools for calming your body and clearing your mind."
      />

      {mode === "hub" ? (
        <ScrollView contentContainerStyle={{ paddingBottom: 22, gap: 12, marginTop: 14 }}>
          <Card
            title="Breathing Coach"
            subtitle="Guided 4-7-8 breathing with animation."
            onPress={() => setMode("breathing")}
          />
          <Card
            title="Grounding 5–4–3–2–1"
            subtitle="Bring attention back to the present (guided checklist)."
            onPress={() => setMode("grounding")}
          />
          <Card
            title="Your Stress Plan"
            subtitle="Build a personal ‘Stress Kit’ you can use any time."
            onPress={() => setMode("plan")}
          />

          <View style={{ backgroundColor: "white", borderRadius: 18, padding: 14, marginTop: 6 }}>
            <Text style={{ fontWeight: "900" }}>Your quick phrase</Text>
            <Text style={{ opacity: 0.75, marginTop: 6 }}>{kit.quickPhrase || "—"}</Text>
          </View>
        </ScrollView>
      ) : null}

      {mode === "breathing" ? <Breathing onDone={() => setMode("hub")} /> : null}
      {mode === "grounding" ? <Grounding onDone={() => setMode("hub")} /> : null}
      {mode === "plan" ? <StressPlan kit={kit} onSave={saveKit} onDone={() => setMode("hub")} /> : null}
    </View>
  );
}

function Card({ title, subtitle, onPress }: { title: string; subtitle: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: "white",
        borderRadius: 18,
        padding: 14,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "900" }}>{title}</Text>
      <Text style={{ opacity: 0.7, marginTop: 4 }}>{subtitle}</Text>
      <Text style={{ marginTop: 10, fontWeight: "900", opacity: 0.7 }}>Open →</Text>
    </Pressable>
  );
}

function Breathing({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [cycles, setCycles] = useState(0);

  const scale = useRef(new Animated.Value(0.75)).current;

  const plan = useMemo(() => {
    if (phase === "inhale") return { label: "Inhale", secs: 4 };
    if (phase === "hold") return { label: "Hold", secs: 7 };
    return { label: "Exhale", secs: 8 };
  }, [phase]);

  useEffect(() => {
    if (!running) return;

    setSecondsLeft(plan.secs);

    if (phase === "inhale") {
      Animated.timing(scale, { toValue: 1.05, duration: plan.secs * 1000, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }).start();
    } else if (phase === "hold") {
      Animated.timing(scale, { toValue: 1.05, duration: plan.secs * 1000, useNativeDriver: true, easing: Easing.linear }).start();
    } else {
      Animated.timing(scale, { toValue: 0.75, duration: plan.secs * 1000, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }).start();
    }

    const tick = setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);

    const t = setTimeout(() => {
      clearInterval(tick);
      setPhase((p) => (p === "inhale" ? "hold" : p === "hold" ? "exhale" : "inhale"));
      if (phase === "exhale") setCycles((c) => c + 1);
    }, plan.secs * 1000);

    return () => {
      clearInterval(tick);
      clearTimeout(t);
    };
  }, [running, phase, plan.secs, scale]);

  function stop() {
    setRunning(false);
    setPhase("inhale");
    setSecondsLeft(4);
    Animated.timing(scale, { toValue: 0.75, duration: 220, useNativeDriver: true }).start();
  }

  return (
    <View style={{ flex: 1, marginTop: 14 }}>
      <View style={{ backgroundColor: "white", borderRadius: 18, padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "900" }}>Breathing Coach (4–7–8)</Text>
        <Text style={{ opacity: 0.7, marginTop: 6 }}>
          Try 3–5 cycles. If you feel lightheaded, stop and breathe normally.
        </Text>
      </View>

      <View style={{ alignItems: "center", marginTop: 22 }}>
        <Animated.View
          style={{
            width: 220,
            height: 220,
            borderRadius: 110,
            backgroundColor: "#efe6dd",
            alignItems: "center",
            justifyContent: "center",
            transform: [{ scale }],
          }}
        >
          <View style={{ width: 160, height: 160, borderRadius: 80, backgroundColor: "#a07b55", opacity: 0.25 }} />
        </Animated.View>

        <Text style={{ marginTop: 18, fontSize: 22, fontWeight: "900" }}>{plan.label}</Text>
        <Text style={{ opacity: 0.7, marginTop: 6 }}>{running ? `${secondsLeft}s` : "Ready"}</Text>
        <Text style={{ opacity: 0.7, marginTop: 6 }}>Cycles completed: {cycles}</Text>
      </View>

      <View style={{ flexDirection: "row", gap: 12, marginTop: 22 }}>
        {!running ? (
          <Pressable
            onPress={() => setRunning(true)}
            style={{ flex: 1, backgroundColor: "#a07b55", padding: 16, borderRadius: 18, alignItems: "center" }}
          >
            <Text style={{ color: "white", fontWeight: "900" }}>Start</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={stop}
            style={{ flex: 1, backgroundColor: "#333", padding: 16, borderRadius: 18, alignItems: "center" }}
          >
            <Text style={{ color: "white", fontWeight: "900" }}>Stop</Text>
          </Pressable>
        )}

        <Pressable
          onPress={() => {
            stop();
            onDone();
          }}
          style={{ flex: 1, backgroundColor: "#eee", padding: 16, borderRadius: 18, alignItems: "center" }}
        >
          <Text style={{ fontWeight: "900" }}>Back</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Grounding({ onDone }: { onDone: () => void }) {
  const [sights, setSights] = useState<string[]>(["", "", "", "", ""]);
  const [touch, setTouch] = useState<string[]>(["", "", "", ""]);
  const [sounds, setSounds] = useState<string[]>(["", "", ""]);
  const [smells, setSmells] = useState<string[]>(["", ""]);
  const [taste, setTaste] = useState<string>("");

  function done() {
    Alert.alert("Nice work", "You brought your attention back to the present.");
    onDone();
  }

  return (
    <ScrollView style={{ flex: 1, marginTop: 14 }} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={{ backgroundColor: "white", borderRadius: 18, padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "900" }}>Grounding 5–4–3–2–1</Text>
        <Text style={{ opacity: 0.7, marginTop: 6 }}>
          Fill what you can. No pressure — a few words each is enough.
        </Text>
      </View>

      <Block title="5 things you can see">
        {sights.map((v, i) => (
          <TextInput key={i} value={v} onChangeText={(t) => setSights((p) => p.map((x, idx) => (idx === i ? t : x)))} placeholder={`See #${i + 1}`} style={input} />
        ))}
      </Block>

      <Block title="4 things you can feel">
        {touch.map((v, i) => (
          <TextInput key={i} value={v} onChangeText={(t) => setTouch((p) => p.map((x, idx) => (idx === i ? t : x)))} placeholder={`Feel #${i + 1}`} style={input} />
        ))}
      </Block>

      <Block title="3 things you can hear">
        {sounds.map((v, i) => (
          <TextInput key={i} value={v} onChangeText={(t) => setSounds((p) => p.map((x, idx) => (idx === i ? t : x)))} placeholder={`Hear #${i + 1}`} style={input} />
        ))}
      </Block>

      <Block title="2 things you can smell">
        {smells.map((v, i) => (
          <TextInput key={i} value={v} onChangeText={(t) => setSmells((p) => p.map((x, idx) => (idx === i ? t : x)))} placeholder={`Smell #${i + 1}`} style={input} />
        ))}
      </Block>

      <Block title="1 thing you can taste">
        <TextInput value={taste} onChangeText={setTaste} placeholder="Taste…" style={input} />
      </Block>

      <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
        <Pressable onPress={done} style={{ flex: 1, backgroundColor: "#a07b55", padding: 16, borderRadius: 18, alignItems: "center" }}>
          <Text style={{ color: "white", fontWeight: "900" }}>Finish</Text>
        </Pressable>
        <Pressable onPress={onDone} style={{ flex: 1, backgroundColor: "#eee", padding: 16, borderRadius: 18, alignItems: "center" }}>
          <Text style={{ fontWeight: "900" }}>Back</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function StressPlan({ kit, onSave, onDone }: { kit: StressKit; onSave: (k: StressKit) => Promise<void>; onDone: () => void }) {
  const [draft, setDraft] = useState<StressKit>(kit);

  const addItem = (field: keyof StressKit, value: string) => {
    const v = value.trim();
    if (!v) return;
    setDraft((p) => {
      const arr = Array.isArray(p[field]) ? (p[field] as string[]) : [];
      return { ...p, [field]: [...arr, v] } as StressKit;
    });
  };

  const removeItem = (field: keyof StressKit, idx: number) => {
    setDraft((p) => {
      const arr = Array.isArray(p[field]) ? (p[field] as string[]) : [];
      return { ...p, [field]: arr.filter((_, i) => i !== idx) } as StressKit;
    });
  };

  const [triggerText, setTriggerText] = useState("");
  const [actionText, setActionText] = useState("");
  const [peopleText, setPeopleText] = useState("");

  async function save() {
    await onSave({
      quickPhrase: draft.quickPhrase?.trim() || "",
      triggers: (draft.triggers || []).filter(Boolean),
      helpfulActions: (draft.helpfulActions || []).filter(Boolean),
      people: (draft.people || []).filter(Boolean),
      notes: draft.notes || "",
    });
    Alert.alert("Saved", "Your Stress Kit was updated.");
    onDone();
  }

  return (
    <ScrollView style={{ flex: 1, marginTop: 14 }} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={{ backgroundColor: "white", borderRadius: 18, padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "900" }}>Your Stress Kit</Text>
        <Text style={{ opacity: 0.7, marginTop: 6 }}>
          Personalize a quick plan for what helps you when stress spikes.
        </Text>
      </View>

      <Block title="Quick phrase (say this to yourself)">
        <TextInput
          value={draft.quickPhrase ?? ""}
          onChangeText={(t) => setDraft((p) => ({ ...p, quickPhrase: t }))}
          placeholder="e.g., I can handle one small step."
          style={input}
        />
      </Block>

      <EditableList
        title="Common triggers"
        items={draft.triggers || []}
        inputValue={triggerText}
        setInputValue={setTriggerText}
        onAdd={() => { addItem("triggers", triggerText); setTriggerText(""); }}
        onRemove={(i) => removeItem("triggers", i)}
        placeholder="Add a trigger…"
      />

      <EditableList
        title="Helpful actions"
        items={draft.helpfulActions || []}
        inputValue={actionText}
        setInputValue={setActionText}
        onAdd={() => { addItem("helpfulActions", actionText); setActionText(""); }}
        onRemove={(i) => removeItem("helpfulActions", i)}
        placeholder="Add an action…"
      />

      <EditableList
        title="People who help"
        items={draft.people || []}
        inputValue={peopleText}
        setInputValue={setPeopleText}
        onAdd={() => { addItem("people", peopleText); setPeopleText(""); }}
        onRemove={(i) => removeItem("people", i)}
        placeholder="Add a person…"
      />

      <Block title="Notes">
        <TextInput
          value={draft.notes ?? ""}
          onChangeText={(t) => setDraft((p) => ({ ...p, notes: t }))}
          placeholder="Anything else that helps (music, places, reminders)…"
          style={[input, { height: 110 }]}
          multiline
        />
      </Block>

      <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
        <Pressable onPress={save} style={{ flex: 1, backgroundColor: "#a07b55", padding: 16, borderRadius: 18, alignItems: "center" }}>
          <Text style={{ color: "white", fontWeight: "900" }}>Save</Text>
        </Pressable>
        <Pressable onPress={onDone} style={{ flex: 1, backgroundColor: "#eee", padding: 16, borderRadius: 18, alignItems: "center" }}>
          <Text style={{ fontWeight: "900" }}>Back</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ backgroundColor: "white", borderRadius: 18, padding: 14, marginTop: 12 }}>
      <Text style={{ fontWeight: "900" }}>{title}</Text>
      <View style={{ marginTop: 10, gap: 10 }}>{children}</View>
    </View>
  );
}

function EditableList({
  title,
  items,
  inputValue,
  setInputValue,
  onAdd,
  onRemove,
  placeholder,
}: {
  title: string;
  items: string[];
  inputValue: string;
  setInputValue: (v: string) => void;
  onAdd: () => void;
  onRemove: (idx: number) => void;
  placeholder: string;
}) {
  return (
    <View style={{ backgroundColor: "white", borderRadius: 18, padding: 14, marginTop: 12 }}>
      <Text style={{ fontWeight: "900" }}>{title}</Text>
      <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
        <TextInput value={inputValue} onChangeText={setInputValue} placeholder={placeholder} style={[input, { flex: 1, marginTop: 0 }]} />
        <Pressable onPress={onAdd} style={{ backgroundColor: "#a07b55", paddingHorizontal: 14, borderRadius: 16, justifyContent: "center" }}>
          <Text style={{ color: "white", fontWeight: "900" }}>Add</Text>
        </Pressable>
      </View>

      <View style={{ marginTop: 10, gap: 8 }}>
        {items.length === 0 ? <Text style={{ opacity: 0.6 }}>No items yet.</Text> : null}
        {items.map((it, idx) => (
          <View key={idx} style={{ flexDirection: "row", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
            <Text style={{ flex: 1, opacity: 0.85 }}>{it}</Text>
            <Pressable onPress={() => onRemove(idx)} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, backgroundColor: "#f2f2f2" }}>
              <Text style={{ fontWeight: "900", opacity: 0.65 }}>Remove</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}

const input: any = { padding: 12, borderRadius: 16, backgroundColor: "#f2f2f2" };
