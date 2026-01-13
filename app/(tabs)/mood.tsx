import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, FlatList, TextInput, ScrollView } from "react-native";
import ScreenHeader from "@/components/ScreenHeader";
import Chips from "@/components/Chips";
import MoodChart from "@/components/MoodChart";
import { MoodCheckIn } from "@/lib/mood";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch, fetchMoodCheckIns, addMoodCheckIn, deleteMoodCheckIn, showAlert } from "@/store";

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
  const items = useSelector((s: RootState) => s.app.moodCheckIns);
  const [mood, setMood] = useState<MoodCheckIn["mood"]>("Okay");
  const [energy, setEnergy] = useState<MoodCheckIn["energy"]>(3);
  const [stress, setStress] = useState<MoodCheckIn["stress"]>(5);
  const [note, setNote] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagText, setTagText] = useState("");

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
    <View style={{ flex: 1, backgroundColor: "#f6f4f2", padding: 24, paddingTop: 18 }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="Mood Tracker" subtitle="Quick check-ins to spot patterns over time." />

        <View style={{ marginTop: 12, gap: 12 }}>
          <MoodChart items={items} />

          {insights ? (
            <View style={{ backgroundColor: "white", borderRadius: 18, padding: 14 }}>
              <Text style={{ fontWeight: "900" }}>Insights (last {insights.n})</Text>
              <Text style={{ opacity: 0.7, marginTop: 6 }}>
                Avg mood: {insights.avgMood.toFixed(1)} / 5  •  Avg stress: {insights.avgStress.toFixed(1)} / 10  •  Avg energy: {insights.avgEnergy.toFixed(1)} / 5
              </Text>
            </View>
          ) : (
            <View style={{ backgroundColor: "white", borderRadius: 18, padding: 14 }}>
              <Text style={{ fontWeight: "900" }}>Insights</Text>
              <Text style={{ opacity: 0.7, marginTop: 6 }}>Add a few check-ins to see averages and trends.</Text>
            </View>
          )}

          <View style={{ backgroundColor: "white", borderRadius: 18, padding: 14 }}>
            <Text style={{ fontWeight: "900" }}>Today’s check-in</Text>

            <Text style={{ marginTop: 10, fontWeight: "900" }}>Mood</Text>
            <Chips options={MOODS as any} value={mood} onChange={(v) => setMood(v as any)} />

            <Text style={{ marginTop: 10, fontWeight: "900" }}>Energy</Text>
            <Chips options={ENERGY} value={String(energy)} onChange={(v) => setEnergy(Number(v) as any)} />

            <Text style={{ marginTop: 10, fontWeight: "900" }}>Stress</Text>
            <Chips options={STRESS} value={String(stress)} onChange={(v) => setStress(Number(v) as any)} />

            <Text style={{ marginTop: 10, fontWeight: "900" }}>Note (optional)</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Anything you want to remember?"
              style={{ marginTop: 8, padding: 12, borderRadius: 16, backgroundColor: "#f2f2f2" }}
              multiline
            />

            <Text style={{ marginTop: 10, fontWeight: "900" }}>Tags (optional)</Text>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
              <TextInput
                value={tagText}
                onChangeText={setTagText}
                placeholder="Add a tag…"
                style={{ flex: 1, padding: 12, borderRadius: 16, backgroundColor: "#f2f2f2" }}
              />
              <Pressable onPress={addTag} style={{ backgroundColor: "#a07b55", paddingHorizontal: 14, borderRadius: 16, justifyContent: "center" }}>
                <Text style={{ color: "white", fontWeight: "900" }}>Add</Text>
              </Pressable>
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
              {tags.map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setTags((p) => p.filter((x) => x !== t))}
                  style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: "#f2f2f2" }}
                >
                  <Text style={{ fontWeight: "800", opacity: 0.75 }}>#{t}  ✕</Text>
                </Pressable>
              ))}
              {tags.length === 0 ? <Text style={{ opacity: 0.6 }}>No tags yet.</Text> : null}
            </View>

            <Pressable onPress={saveCheckIn} style={{ marginTop: 12, backgroundColor: "#a07b55", padding: 14, borderRadius: 18, alignItems: "center" }}>
              <Text style={{ color: "white", fontWeight: "900" }}>Save check-in</Text>
            </Pressable>
          </View>

          <View style={{ backgroundColor: "white", borderRadius: 18, padding: 14 }}>
            <Text style={{ fontWeight: "900" }}>Recent check-ins</Text>
            <Text style={{ opacity: 0.7, marginTop: 6 }}>Tap one to delete.</Text>

            <FlatList
              style={{ marginTop: 10 }}
              data={items.slice(0, 20)}
              keyExtractor={(i) => i.id}
              scrollEnabled={false}
              contentContainerStyle={{ gap: 10, paddingBottom: 6 }}
              renderItem={({ item }) => (
                <Pressable onPress={() => remove(item.id)} style={{ padding: 12, borderRadius: 16, backgroundColor: "#f6f4f2" }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
                    <Text style={{ fontWeight: "900" }}>{item.mood}</Text>
                    <Text style={{ opacity: 0.7 }}>{new Date(item.createdAt).toLocaleString()}</Text>
                  </View>
                  <Text style={{ opacity: 0.7, marginTop: 6 }}>Energy {item.energy}/5 • Stress {item.stress}/10</Text>
                  {item.note ? <Text style={{ opacity: 0.75, marginTop: 6 }} numberOfLines={2}>{item.note}</Text> : null}
                  {(item.tags ?? []).length ? (
                    <Text style={{ opacity: 0.6, marginTop: 6, fontWeight: "800" }}>
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
