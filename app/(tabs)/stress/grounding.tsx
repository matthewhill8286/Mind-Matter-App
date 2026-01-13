import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, Alert } from "react-native";
import ScreenHeader from "@/components/ScreenHeader";
import { useRouter } from "expo-router";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors, UI } from "@/constants/theme";

export default function Grounding() {
  const router = useRouter();
  const theme = useColorScheme() ?? "light";
  const colors = Colors[theme];

  const [sights, setSights] = useState<string[]>(["", "", "", "", ""]);
  const [touch, setTouch] = useState<string[]>(["", "", "", ""]);
  const [sounds, setSounds] = useState<string[]>(["", "", ""]);
  const [smells, setSmells] = useState<string[]>(["", ""]);
  const [taste, setTaste] = useState<string>("");

  function done() {
    Alert.alert("Nice work", "You brought your attention back to the present.");
    router.back();
  }

  const inputStyle = {
    padding: 12,
    borderRadius: UI.radius.md,
    backgroundColor: colors.inputBg,
    color: colors.text,
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: UI.spacing.xl, paddingTop: 18 }}>
      <ScreenHeader
        title="Stress Management"
        subtitle="Quick tools for calming your body and clearing your mind."
      />
      <ScrollView style={{ flex: 1, marginTop: 14 }} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ backgroundColor: colors.card, borderRadius: UI.radius.lg, padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: "900", color: colors.text }}>Grounding 5–4–3–2–1</Text>
          <Text style={{ color: colors.mutedText, marginTop: 6 }}>
            Fill what you can. No pressure — a few words each is enough.
          </Text>
        </View>

        <Block title="5 things you can see">
          {sights.map((v, i) => (
            <TextInput
              key={i}
              value={v}
              onChangeText={(t) => setSights((p) => p.map((x, idx) => (idx === i ? t : x)))}
              placeholder={`See #${i + 1}`}
              placeholderTextColor={colors.placeholder}
              style={inputStyle}
            />
          ))}
        </Block>

        <Block title="4 things you can feel">
          {touch.map((v, i) => (
            <TextInput
              key={i}
              value={v}
              onChangeText={(t) => setTouch((p) => p.map((x, idx) => (idx === i ? t : x)))}
              placeholder={`Feel #${i + 1}`}
              placeholderTextColor={colors.placeholder}
              style={inputStyle}
            />
          ))}
        </Block>

        <Block title="3 things you can hear">
          {sounds.map((v, i) => (
            <TextInput
              key={i}
              value={v}
              onChangeText={(t) => setSounds((p) => p.map((x, idx) => (idx === i ? t : x)))}
              placeholder={`Hear #${i + 1}`}
              placeholderTextColor={colors.placeholder}
              style={inputStyle}
            />
          ))}
        </Block>

        <Block title="2 things you can smell">
          {smells.map((v, i) => (
            <TextInput
              key={i}
              value={v}
              onChangeText={(t) => setSmells((p) => p.map((x, idx) => (idx === i ? t : x)))}
              placeholder={`Smell #${i + 1}`}
              placeholderTextColor={colors.placeholder}
              style={inputStyle}
            />
          ))}
        </Block>

        <Block title="1 thing you can taste">
          <TextInput
            value={taste}
            onChangeText={setTaste}
            placeholder="Taste…"
            placeholderTextColor={colors.placeholder}
            style={inputStyle}
          />
        </Block>

        <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
          <Pressable onPress={done} style={{ flex: 1, backgroundColor: colors.primary, padding: 16, borderRadius: UI.radius.lg, alignItems: "center" }}>
            <Text style={{ color: colors.onPrimary, fontWeight: "900" }}>Finish</Text>
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
