import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, Alert } from "react-native";
import ScreenHeader from "@/components/ScreenHeader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

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

export default function StressPlan() {
  const router = useRouter();
  const [kit, setKit] = useState<StressKit>(DEFAULT_KIT);
  const [draft, setDraft] = useState<StressKit>(DEFAULT_KIT);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setKit(parsed);
        setDraft(parsed);
      }
    })();
  }, []);

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
    const next = {
      quickPhrase: draft.quickPhrase?.trim() || "",
      triggers: (draft.triggers || []).filter(Boolean),
      helpfulActions: (draft.helpfulActions || []).filter(Boolean),
      people: (draft.people || []).filter(Boolean),
      notes: draft.notes || "",
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    Alert.alert("Saved", "Your Stress Kit was updated.");
    router.back();
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f6f4f2", padding: 24, paddingTop: 18 }}>
      <ScreenHeader
        title="Stress Management"
        subtitle="Quick tools for calming your body and clearing your mind."
      />
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
          <Pressable onPress={() => router.back()} style={{ flex: 1, backgroundColor: "#eee", padding: 16, borderRadius: 18, alignItems: "center" }}>
            <Text style={{ fontWeight: "900" }}>Back</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
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
