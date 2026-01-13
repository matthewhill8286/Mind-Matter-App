import React, { useEffect, useState } from "react";
import { View, Text, Pressable, TextInput, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import ScreenHeader from "@/components/ScreenHeader";
import Chips from "@/components/Chips";
import { JournalEntry } from "@/lib/journal";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch, fetchJournalEntries, upsertJournalEntry, deleteJournalEntry, showAlert } from "@/store";

const MOODS = ["Calm", "Okay", "Anxious", "Sad", "Angry", "Overwhelmed"];

export default function EditJournalEntry() {
  const dispatch = useDispatch<AppDispatch>();
  const journalEntries = useSelector((s: RootState) => s.app.journalEntries);
  const { id } = useLocalSearchParams<{ id: string }>();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [tagText, setTagText] = useState("");

  useEffect(() => {
    const found = journalEntries.find((e) => e.id === id);
    if (found) {
      setEntry(found);
    } else {
      dispatch(fetchJournalEntries());
    }
  }, [id, journalEntries]);

  async function save() {
    if (!entry) return;
    await dispatch(upsertJournalEntry({ ...entry, updatedAt: new Date().toISOString() }));
    router.replace("/(tabs)/journal");
  }

  async function remove() {
    dispatch(showAlert({
      title: "Delete entry?",
      message: "This can’t be undone.",
      actions: [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await dispatch(deleteJournalEntry(String(id)));
            router.replace("/(tabs)/journal");
          }
        },
      ]
    }));
  }

  function addTag() {
    if (!entry) return;
    const t = tagText.trim();
    if (!t) return;
    const tags = entry.tags ?? [];
    if (tags.includes(t)) return;
    setEntry({ ...entry, tags: [...tags, t] });
    setTagText("");
  }

  if (!entry) {
    return (
      <View style={{ flex: 1, backgroundColor: "#f6f4f2", padding: 24, paddingTop: 18 }}>
        <ScreenHeader title="Edit Entry" subtitle="Loading…" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f6f4f2", padding: 24, paddingTop: 18 }}>
      <ScreenHeader title="Edit Entry" subtitle={new Date(entry.createdAt).toLocaleString()} />

      <ScrollView contentContainerStyle={{ paddingBottom: 24, gap: 12, marginTop: 12 }}>
        <View style={{ backgroundColor: "white", padding: 14, borderRadius: 18 }}>
          <Text style={{ fontWeight: "900" }}>Title</Text>
          <TextInput value={entry.title} onChangeText={(t) => setEntry({ ...entry, title: t })} style={input} />
        </View>

        <View style={{ backgroundColor: "white", padding: 14, borderRadius: 18 }}>
          <Text style={{ fontWeight: "900" }}>Mood</Text>
          <Chips options={MOODS} value={entry.mood ?? undefined} onChange={(v) => setEntry({ ...entry, mood: v as string })} />
        </View>

        <View style={{ backgroundColor: "white", padding: 14, borderRadius: 18 }}>
          <Text style={{ fontWeight: "900" }}>Write</Text>
          <TextInput value={entry.body} onChangeText={(t) => setEntry({ ...entry, body: t })} multiline style={[input, { height: 240, textAlignVertical: "top" }]} />
        </View>

        <View style={{ backgroundColor: "white", padding: 14, borderRadius: 18 }}>
          <Text style={{ fontWeight: "900" }}>Tags</Text>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
            <TextInput value={tagText} onChangeText={setTagText} placeholder="Add a tag…" style={[input, { flex: 1, marginTop: 0 }]} />
            <Pressable onPress={addTag} style={{ backgroundColor: "#a07b55", paddingHorizontal: 14, borderRadius: 16, justifyContent: "center" }}>
              <Text style={{ color: "white", fontWeight: "900" }}>Add</Text>
            </Pressable>
          </View>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            {(entry.tags ?? []).map((t) => (
              <Pressable key={t} onPress={() => setEntry({ ...entry, tags: (entry.tags ?? []).filter((x) => x !== t) })} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: "#f2f2f2" }}>
                <Text style={{ fontWeight: "800", opacity: 0.75 }}>#{t}  ✕</Text>
              </Pressable>
            ))}
            {(entry.tags ?? []).length === 0 ? <Text style={{ opacity: 0.6 }}>No tags yet.</Text> : null}
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <Pressable onPress={save} style={{ flex: 1, backgroundColor: "#a07b55", padding: 16, borderRadius: 18, alignItems: "center" }}>
            <Text style={{ color: "white", fontWeight: "900" }}>Save</Text>
          </Pressable>
          <Pressable onPress={remove} style={{ flex: 1, backgroundColor: "#ffe8e8", padding: 16, borderRadius: 18, alignItems: "center" }}>
            <Text style={{ fontWeight: "900" }}>Delete</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => router.back()} style={{ padding: 14, borderRadius: 18, backgroundColor: "#eee", alignItems: "center" }}>
          <Text style={{ fontWeight: "900" }}>Back</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const input: any = { marginTop: 10, padding: 12, borderRadius: 16, backgroundColor: "#f2f2f2" };
