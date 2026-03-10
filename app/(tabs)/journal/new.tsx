import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import ScreenHeader from '@/components/ScreenHeader';
import Chips from '@/components/Chips';
import { JOURNAL_PROMPTS } from '@/data/journalPrompts';
import { JournalEntry } from '@/lib/types';
import { journalStore } from '@/store/journalStore';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, UI } from '@/constants/theme';
import { withLoading } from '@/lib/state';

const MOODS = ['Calm', 'Okay', 'Anxious', 'Sad', 'Angry', 'Overwhelmed'];

export default function NewJournalEntry() {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const { promptId, date } = useLocalSearchParams<{ promptId?: string; date?: string }>();
  const prompt = useMemo(() => JOURNAL_PROMPTS.find((p) => p.id === promptId), [promptId]);

  const [title, setTitle] = useState(prompt ? prompt.title : '');
  const [body, setBody] = useState(prompt ? prompt.prompt + '\n\n' : '');
  const [mood, setMood] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagText, setTagText] = useState('');

  const inputStyle = {
    marginTop: 10,
    padding: 12,
    borderRadius: UI.radius.md,
    backgroundColor: colors.inputBg,
    color: colors.text,
  };

  async function save() {
    const entryInput: Omit<JournalEntry, 'id' | 'created_at' | 'updated_at'> = {
      title: (title || 'Untitled').trim(),
      content: body.trim(),
      mood,
      tags,
    };
    await withLoading('save-journal', async () => {
      await journalStore.getState().createJournalEntry(entryInput as any);
      router.replace('/(tabs)/journal');
    });
  }

  function addTag() {
    const t = tagText.trim();
    if (!t) return;
    if (tags.includes(t)) return;
    setTags((p) => [...p, t]);
    setTagText('');
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: UI.spacing.xl,
        paddingTop: Platform.OS === 'ios' ? 18 : 8,
      }}
    >
      <ScreenHeader
        title="New Journal Entry"
        subtitle={
          date
            ? `Entry for ${new Date(date).toLocaleDateString()}`
            : prompt
              ? `Prompt: ${prompt.title}`
              : 'Write a quick reflection.'
        }
        showBack
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 24, gap: 12, marginTop: 14 }}>
        <View style={{ backgroundColor: colors.card, padding: 14, borderRadius: UI.radius.lg }}>
          <Text style={{ fontWeight: '900', color: colors.text }}>Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Give it a title…"
            placeholderTextColor={colors.placeholder}
            style={inputStyle}
          />
        </View>

        <View style={{ backgroundColor: colors.card, padding: 14, borderRadius: UI.radius.lg }}>
          <Text style={{ fontWeight: '900', color: colors.text }}>Mood</Text>
          <Chips options={MOODS} value={mood ?? undefined} onChange={(v) => setMood(v as string)} />
        </View>

        <View style={{ backgroundColor: colors.card, padding: 14, borderRadius: UI.radius.lg }}>
          <Text style={{ fontWeight: '900', color: colors.text }}>Write</Text>
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Start writing…"
            placeholderTextColor={colors.placeholder}
            multiline
            style={[inputStyle, { height: 220, textAlignVertical: 'top' }]}
          />
        </View>

        <View style={{ backgroundColor: colors.card, padding: 14, borderRadius: UI.radius.lg }}>
          <Text style={{ fontWeight: '900', color: colors.text }}>Tags</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <TextInput
              value={tagText}
              onChangeText={setTagText}
              placeholder="Add a tag…"
              placeholderTextColor={colors.placeholder}
              style={[inputStyle, { flex: 1, marginTop: 0 }]}
            />
            <Pressable
              onPress={addTag}
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: 14,
                borderRadius: UI.radius.md,
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: colors.onPrimary, fontWeight: '900' }}>Add</Text>
            </Pressable>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {tags.map((t) => (
              <Pressable
                key={t}
                onPress={() => setTags((p) => p.filter((x) => x !== t))}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: UI.radius.pill,
                  backgroundColor: colors.inputBg,
                }}
              >
                <Text style={{ fontWeight: '800', color: colors.text, opacity: 0.75 }}>#{t} ✕</Text>
              </Pressable>
            ))}
            {tags.length === 0 ? (
              <Text style={{ color: colors.mutedText, opacity: 0.6 }}>No tags yet.</Text>
            ) : null}
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable
            onPress={save}
            style={{
              flex: 1,
              backgroundColor: colors.primary,
              padding: 16,
              borderRadius: UI.radius.lg,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.onPrimary, fontWeight: '900' }}>Save</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
