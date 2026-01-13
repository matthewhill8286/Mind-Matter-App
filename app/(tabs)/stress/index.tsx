import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
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

export default function StressHub() {
  const router = useRouter();
  const theme = useColorScheme() ?? "light";
  const colors = Colors[theme];
  const [kit, setKit] = useState<StressKit>(DEFAULT_KIT);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setKit(JSON.parse(raw));
    })();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: UI.spacing.xl, paddingTop: 18 }}>
      <ScreenHeader
        title="Stress Management"
        subtitle="Quick tools for calming your body and clearing your mind."
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 22, gap: 12, marginTop: 14 }}>
        <Card
          title="Breathing Coach"
          subtitle="Guided 4-7-8 breathing with animation."
          onPress={() => router.push("/(tabs)/stress/breathing")}
        />
        <Card
          title="Grounding 5–4–3–2–1"
          subtitle="Bring attention back to the present (guided checklist)."
          onPress={() => router.push("/(tabs)/stress/grounding")}
        />
        <Card
          title="Your Stress Plan"
          subtitle="Build a personal ‘Stress Kit’ you can use any time."
          onPress={() => router.push("/(tabs)/stress/plan")}
        />

        <View style={{ backgroundColor: colors.card, borderRadius: UI.radius.lg, padding: 14, marginTop: 6 }}>
          <Text style={{ fontWeight: "900", color: colors.text }}>Your quick phrase</Text>
          <Text style={{ color: colors.mutedText, marginTop: 6 }}>{kit.quickPhrase || "—"}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function Card({ title, subtitle, onPress }: { title: string; subtitle: string; onPress: () => void }) {
  const theme = useColorScheme() ?? "light";
  const colors = Colors[theme];

  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: colors.card,
        borderRadius: UI.radius.lg,
        padding: 14,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "900", color: colors.text }}>{title}</Text>
      <Text style={{ color: colors.mutedText, marginTop: 4 }}>{subtitle}</Text>
      <Text style={{ marginTop: 10, fontWeight: "900", color: colors.primary }}>Open →</Text>
    </Pressable>
  );
}
