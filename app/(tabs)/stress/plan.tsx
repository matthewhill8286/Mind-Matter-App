import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, Alert } from "react-native";
import ScreenHeader from "@/components/ScreenHeader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors, UI } from "@/constants/theme";

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
  const theme = useColorScheme() ?? "light";
  const colors = Colors[theme];
  const [kit, setKit] = useState<StressKit>(DEFAULT_KIT);
  const [draft, setDraft] = useState<StressKit>(DEFAULT_KIT);

  const inputStyle = {
    padding: 12,
    borderRadius: UI.radius.md,
    backgroundColor: colors.inputBg,
    color: colors.text,
  };

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
    <View style={{ flex: 1, backgroundColor: colors.background, padding: UI.spacing.xl, paddingTop: 18 }}>
      <ScreenHeader
        title="Stress Management"
        subtitle="Quick tools for calming your body and clearing your mind."
      />
      <ScrollView style={{ flex: 1, marginTop: 14 }} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ backgroundColor: colors.card, borderRadius: UI.radius.lg, padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: "900", color: colors.text }}>Your Stress Kit</Text>
          <Text style={{ color: colors.mutedText, marginTop: 6 }}>
            Personalize a quick plan for what helps you when stress spikes.
          </Text>
        </View>

        <Block title="Quick phrase (say this to yourself)">
          <TextInput
            value={draft.quickPhrase ?? ""}
            onChangeText={(t) => setDraft((p) => ({ ...p, quickPhrase: t }))}
            placeholder="e.g., I can handle one small step."
            placeholderTextColor={colors.placeholder}
            style={inputStyle}
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
            placeholderTextColor={colors.placeholder}
            style={[inputStyle, { height: 110 }]}
            multiline
          />
        </Block>

        <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
          <Pressable onPress={save} style={{ flex: 1, backgroundColor: colors.primary, padding: 16, borderRadius: UI.radius.lg, alignItems: "center" }}>
            <Text style={{ color: colors.onPrimary, fontWeight: "900" }}>Save</Text>
          </Pressable>
          <Pressable onPress={() => router.back()} style={{ flex: 1, backgroundColor: colors.divider, padding: 16, borderRadius: UI.radius.lg, alignItems: "center" }}>
            <Text style={{ fontWeight: "900", color: colors.text }}>Back</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useColorScheme() ?? "light";
  const colors = Colors[theme];

  return (
    <View style={{ backgroundColor: colors.card, borderRadius: UI.radius.lg, padding: 14, marginTop: 12 }}>
      <Text style={{ fontWeight: "900", color: colors.text }}>{title}</Text>
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
  const theme = useColorScheme() ?? "light";
  const colors = Colors[theme];

  const inputStyle = {
    padding: 12,
    borderRadius: UI.radius.md,
    backgroundColor: colors.inputBg,
    color: colors.text,
  };

  return (
    <View style={{ backgroundColor: colors.card, borderRadius: UI.radius.lg, padding: 14, marginTop: 12 }}>
      <Text style={{ fontWeight: "900", color: colors.text }}>{title}</Text>
      <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
        <TextInput
          value={inputValue}
          onChangeText={setInputValue}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          style={[inputStyle, { flex: 1 }]}
        />
        <Pressable onPress={onAdd} style={{ backgroundColor: colors.primary, paddingHorizontal: 14, borderRadius: UI.radius.md, justifyContent: "center" }}>
          <Text style={{ color: colors.onPrimary, fontWeight: "900" }}>Add</Text>
        </Pressable>
      </View>

      <View style={{ marginTop: 10, gap: 8 }}>
        {items.length === 0 ? <Text style={{ color: colors.subtleText }}>No items yet.</Text> : null}
        {items.map((it, idx) => (
          <View key={idx} style={{ flexDirection: "row", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
            <Text style={{ flex: 1, color: colors.text }}>{it}</Text>
            <Pressable onPress={() => onRemove(idx)} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: UI.radius.sm, backgroundColor: colors.divider }}>
              <Text style={{ fontWeight: "900", color: colors.mutedText }}>Remove</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}
