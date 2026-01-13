import React, { useMemo, useState } from "react";
import { View, Text, Pressable, TextInput, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import ScreenHeader from "@/components/ScreenHeader";
import Chips from "@/components/Chips";
import { JOURNAL_PROMPTS } from "@/data/journalPrompts";
import { JournalEntry } from "@/lib/journal";
import { useDispatch } from "react-redux";
import { AppDispatch, upsertJournalEntry } from "@/store";

const MOODS = ["Calm", "Okay", "Anxious", "Sad", "Angry", "Overwhelmed"];

export default function NewJournalEntry() {
  const dispatch = useDispatch<AppDispatch>();
  const { promptId } = useLocalSearchParams<{ promptId?: string }>();
  const prompt = useMemo(() => JOURNAL_PROMPTS.find((p) => p.id === promptId), [promptId]);

  const [title, setTitle] = useState(prompt ? prompt.title : "");
  const [body, setBody] = useState(prompt ? prompt.prompt + "\n\n" : "");
  const [mood, setMood] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagText, setTagText] = useState("");

  async function save() {
    const now = new Date().toISOString();
    const entry: JournalEntry = {
      id: String(Date.now()),
      createdAt: now,
      updatedAt: now,
      title: (title || "Untitled").trim(),
      body: body.trim(),
      mood,
      tags,
      promptId: prompt?.id ?? null,
    };
    await dispatch(upsertJournalEntry(entry));
    router.replace("/(tabs)/journal");
  }

  function addTag() {
    const t = tagText.trim();
    if (!t) return;
    if (tags.includes(t)) return;
    setTags((p) => [...p, t]);
    setTagText("");
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f6f4f2", padding: 24, paddingTop: 18 }}>
      <ScreenHeader title="New Journal Entry" subtitle={prompt ? `Prompt: ${prompt.title}` : "Write a quick reflection."} />

      <ScrollView contentContainerStyle={{ paddingBottom: 24, gap: 12, marginTop: 12 }}>
        <View style={{ backgroundColor: "white", padding: 14, borderRadius: 18 }}>
          <Text style={{ fontWeight: "900" }}>Title</Text>
          <TextInput value={title} onChangeText={setTitle} placeholder="Give it a title…" style={input} />
        </View>

        <View style={{ backgroundColor: "white", padding: 14, borderRadius: 18 }}>
          <Text style={{ fontWeight: "900" }}>Mood</Text>
          <Chips options={MOODS} value={mood ?? undefined} onChange={(v) => setMood(v as string)} />
        </View>

        <View style={{ backgroundColor: "white", padding: 14, borderRadius: 18 }}>
          <Text style={{ fontWeight: "900" }}>Write</Text>
          <TextInput value={body} onChangeText={setBody} placeholder="Start writing…" multiline style={[input, { height: 220, textAlignVertical: "top" }]} />
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
            {tags.map((t) => (
              <Pressable key={t} onPress={() => setTags((p) => p.filter((x) => x !== t))} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: "#f2f2f2" }}>
                <Text style={{ fontWeight: "800", opacity: 0.75 }}>#{t}  ✕</Text>
              </Pressable>
            ))}
            {tags.length === 0 ? <Text style={{ opacity: 0.6 }}>No tags yet.</Text> : null}
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <Pressable onPress={save} style={{ flex: 1, backgroundColor: "#a07b55", padding: 16, borderRadius: 18, alignItems: "center" }}>
            <Text style={{ color: "white", fontWeight: "900" }}>Save</Text>
          </Pressable>
          <Pressable onPress={() => router.back()} style={{ flex: 1, backgroundColor: "#eee", padding: 16, borderRadius: 18, alignItems: "center" }}>
            <Text style={{ fontWeight: "900" }}>Cancel</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const input: any = { marginTop: 10, padding: 12, borderRadius: 16, backgroundColor: "#f2f2f2" };
