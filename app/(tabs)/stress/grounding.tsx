import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, Alert } from "react-native";
import ScreenHeader from "@/components/ScreenHeader";
import { useRouter } from "expo-router";

export default function Grounding() {
  const router = useRouter();
  const [sights, setSights] = useState<string[]>(["", "", "", "", ""]);
  const [touch, setTouch] = useState<string[]>(["", "", "", ""]);
  const [sounds, setSounds] = useState<string[]>(["", "", ""]);
  const [smells, setSmells] = useState<string[]>(["", ""]);
  const [taste, setTaste] = useState<string>("");

  function done() {
    Alert.alert("Nice work", "You brought your attention back to the present.");
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

const input: any = { padding: 12, borderRadius: 16, backgroundColor: "#f2f2f2" };
