import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, FlatList, TextInput, ScrollView } from "react-native";
import ScreenHeader from "@/components/ScreenHeader";
import Chips from "@/components/Chips";
import MoodChart from "@/components/MoodChart";
import { MoodCheckIn } from "@/lib/mood";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch, fetchMoodCheckIns, addMoodCheckIn, deleteMoodCheckIn, showAlert } from "@/store";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors, UI } from "@/constants/theme";

const MOODS: MoodCheckIn["mood"][] = ["Great", "Good", "Okay", "Low", "Bad"];
const ENERGY = ["1", "2", "3", "4", "5"];
const STRESS = Array.from({ length: 11 }, (_, i) => String(i));

function moodToScore(m: MoodCheckIn["mood"]) {
  if (m === "Great") return 5;
  if (m === "Good") return 4;
  if (m === "Okay") return 3;
  if (m === "Low") return 2;
  return 1;
}

export default function Mood() {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useColorScheme() ?? "light";
  const colors = Colors[theme];
  const items = useSelector((s: RootState) => s.app.moodCheckIns);
  const [mood, setMood] = useState<MoodCheckIn["mood"]>("Okay");
  const [energy, setEnergy] = useState<MoodCheckIn["energy"]>(3);
  const [stress, setStress] = useState<MoodCheckIn["stress"]>(5);
  const [note, setNote] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagText, setTagText] = useState("");

  const inputStyle = {
    padding: 12,
    borderRadius: UI.radius.md,
    backgroundColor: colors.inputBg,
    color: colors.text,
  };

  useEffect(() => {
    dispatch(fetchMoodCheckIns());
  }, []);

  const insights = useMemo(() => {
    if (items.length < 3) return null;
    const last = items.slice(0, 14);
    const avgMood = last.reduce((a, x) => a + moodToScore(x.mood), 0) / last.length;
    const avgStress = last.reduce((a, x) => a + x.stress, 0) / last.length;
    const avgEnergy = last.reduce((a, x) => a + x.energy, 0) / last.length;
    return { avgMood, avgStress, avgEnergy, n: last.length };
  }, [items]);

  function addTag() {
    const t = tagText.trim();
    if (!t) return;
    if (tags.includes(t)) return;
    setTags((p) => [...p, t]);
    setTagText("");
  }

  async function saveCheckIn() {
    const now = new Date().toISOString();
    const entry: MoodCheckIn = {
      id: String(Date.now()),
      createdAt: now,
      mood,
      energy,
      stress,
      note: note.trim() || undefined,
      tags: tags.length ? tags : undefined,
    };
    await dispatch(addMoodCheckIn(entry));
    setNote("");
    setTags([]);
    setTagText("");
    dispatch(showAlert({ title: "Saved", message: "Your mood check-in was saved." }));
  }

  async function remove(id: string) {
    dispatch(showAlert({
      title: "Delete check-in?",
      message: "This can’t be undone.",
      actions: [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await dispatch(deleteMoodCheckIn(id));
          },
        },
      ]
    }));
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: UI.spacing.xl, paddingTop: 18 }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="Mood Tracker" subtitle="Quick check-ins to spot patterns over time." />

        <View style={{ marginTop: 12, gap: 12 }}>
          <MoodChart items={items} />

          {insights ? (
            <View style={{ backgroundColor: colors.card, borderRadius: UI.radius.lg, padding: 14 }}>
              <Text style={{ fontWeight: "900", color: colors.text }}>Insights (last {insights.n})</Text>
              <Text style={{ color: colors.mutedText, marginTop: 6 }}>
                Avg mood: {insights.avgMood.toFixed(1)} / 5  •  Avg stress: {insights.avgStress.toFixed(1)} / 10  •  Avg energy: {insights.avgEnergy.toFixed(1)} / 5
              </Text>
            </View>
          ) : (
            <View style={{ backgroundColor: colors.card, borderRadius: UI.radius.lg, padding: 14 }}>
              <Text style={{ fontWeight: "900", color: colors.text }}>Insights</Text>
              <Text style={{ color: colors.mutedText, marginTop: 6 }}>Add a few check-ins to see averages and trends.</Text>
            </View>
          )}

          <View style={{ backgroundColor: colors.card, borderRadius: UI.radius.lg, padding: 14 }}>
            <Text style={{ fontWeight: "900", color: colors.text }}>Today’s check-in</Text>

            <Text style={{ marginTop: 10, fontWeight: "900", color: colors.text }}>Mood</Text>
            <Chips options={MOODS as any} value={mood} onChange={(v) => setMood(v as any)} />

            <Text style={{ marginTop: 10, fontWeight: "900", color: colors.text }}>Energy</Text>
            <Chips options={ENERGY} value={String(energy)} onChange={(v) => setEnergy(Number(v) as any)} />

            <Text style={{ marginTop: 10, fontWeight: "900", color: colors.text }}>Stress</Text>
            <Chips options={STRESS} value={String(stress)} onChange={(v) => setStress(Number(v) as any)} />

            <Text style={{ marginTop: 10, fontWeight: "900", color: colors.text }}>Note (optional)</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Anything you want to remember?"
              placeholderTextColor={colors.placeholder}
              style={[inputStyle, { marginTop: 8 }]}
              multiline
            />

            <Text style={{ marginTop: 10, fontWeight: "900", color: colors.text }}>Tags (optional)</Text>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
              <TextInput
                value={tagText}
                onChangeText={setTagText}
                placeholder="Add a tag…"
                placeholderTextColor={colors.placeholder}
                style={[inputStyle, { flex: 1 }]}
              />
              <Pressable onPress={addTag} style={{ backgroundColor: colors.primary, paddingHorizontal: 14, borderRadius: UI.radius.md, justifyContent: "center" }}>
                <Text style={{ color: colors.onPrimary, fontWeight: "900" }}>Add</Text>
              </Pressable>
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
              {tags.map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setTags((p) => p.filter((x) => x !== t))}
                  style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: UI.radius.pill, backgroundColor: colors.divider }}
                >
                  <Text style={{ fontWeight: "800", color: colors.mutedText }}>#{t}  ✕</Text>
                </Pressable>
              ))}
              {tags.length === 0 ? <Text style={{ color: colors.subtleText }}>No tags yet.</Text> : null}
            </View>

            <Pressable onPress={saveCheckIn} style={{ marginTop: 12, backgroundColor: colors.primary, padding: 14, borderRadius: UI.radius.lg, alignItems: "center" }}>
              <Text style={{ color: colors.onPrimary, fontWeight: "900" }}>Save check-in</Text>
            </Pressable>
          </View>

          <View style={{ backgroundColor: colors.card, borderRadius: UI.radius.lg, padding: 14 }}>
            <Text style={{ fontWeight: "900", color: colors.text }}>Recent check-ins</Text>
            <Text style={{ color: colors.mutedText, marginTop: 6 }}>Tap one to delete.</Text>

            <FlatList
              style={{ marginTop: 10 }}
              data={items.slice(0, 20)}
              keyExtractor={(i) => i.id}
              scrollEnabled={false}
              contentContainerStyle={{ gap: 10, paddingBottom: 6 }}
              renderItem={({ item }) => (
                <Pressable onPress={() => remove(item.id)} style={{ padding: 12, borderRadius: UI.radius.md, backgroundColor: colors.background }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
                    <Text style={{ fontWeight: "900", color: colors.text }}>{item.mood}</Text>
                    <Text style={{ color: colors.mutedText }}>{new Date(item.createdAt).toLocaleString()}</Text>
                  </View>
                  <Text style={{ color: colors.mutedText, marginTop: 6 }}>Energy {item.energy}/5 • Stress {item.stress}/10</Text>
                  {item.note ? <Text style={{ color: colors.mutedText, marginTop: 6 }} numberOfLines={2}>{item.note}</Text> : null}
                  {(item.tags ?? []).length ? (
                    <Text style={{ color: colors.subtleText, marginTop: 6, fontWeight: "800" }}>
                      {(item.tags ?? []).slice(0, 6).map((t) => `#${t}`).join(" ")}
                    </Text>
                  ) : null}
                </Pressable>
              )}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
