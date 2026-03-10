import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import ScreenHeader from '@/components/ScreenHeader';
import Chips from '@/components/Chips';
import { journalStore } from '@/store/journalStore';
import { JournalEntry } from '@/lib/types';
import { showAlert, withLoading } from '@/lib/state';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, UI } from '@/constants/theme';
import { SkeletonRect } from '@/components/Skeleton';

const MOODS = ['Calm', 'Okay', 'Anxious', 'Sad', 'Angry', 'Overwhelmed'];

export default function EditJournalEntry() {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  const {
    journalEntries: entries,
    fetchJournalEntries,
    upsertJournalEntry,
    deleteJournalEntry,
    isLoading: loading,
  } = journalStore();

  const { id } = useLocalSearchParams<{ id: string }>();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [tagText, setTagText] = useState('');

  const inputStyle = {
    marginTop: 10,
    padding: 12,
    borderRadius: UI.radius.md,
    backgroundColor: colors.inputBg,
    color: colors.text,
  };

  useEffect(() => {
    (async () => {
      await fetchJournalEntries();
    })();
  }, [fetchJournalEntries]);

  useEffect(() => {
    if (entries.length > 0) {
      const found = entries.find((e) => e.id === id);
      if (found) {
        setEntry({ ...found, tags: found.tags || [] });
      }
    }
  }, [entries, id]);

  async function save() {
    if (!entry) return;
    await withLoading('save-journal', async () => {
      await upsertJournalEntry({ ...entry, updated_at: new Date().toISOString() });
      router.back();
    });
  }

  async function remove() {
    showAlert('Delete entry?', 'This can’t be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await withLoading('delete-journal', async () => {
            await deleteJournalEntry(String(id));
            router.back();
          });
        },
      },
    ]);
  }

  function addTag() {
    if (!entry) return;
    const t = tagText.trim();
    if (!t) return;
    const tags = entry.tags ?? [];
    if (tags.includes(t)) return;
    setEntry({ ...entry, tags: [...tags, t] });
    setTagText('');
  }

  if (!entry) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          padding: UI.spacing.xl,
          paddingTop: Platform.OS === 'ios' ? 18 : 8,
        }}
      >
        <ScreenHeader title="Edit Entry" subtitle={loading ? 'Loading…' : 'Not found'} showBack />
        {loading && (
          <View style={{ gap: 12, marginTop: 14 }}>
            <SkeletonRect height={80} borderRadius={UI.radius.lg} />
            <SkeletonRect height={80} borderRadius={UI.radius.lg} />
            <SkeletonRect height={260} borderRadius={UI.radius.lg} />
            <SkeletonRect height={140} borderRadius={UI.radius.lg} />
          </View>
        )}
      </View>
    );
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
        title="Edit Entry"
        subtitle={new Date(entry.created_at).toLocaleString()}
        showBack
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 24, gap: 12, marginTop: 14 }}>
        <View style={{ backgroundColor: colors.card, padding: 14, borderRadius: UI.radius.lg }}>
          <Text style={{ fontWeight: '900', color: colors.text }}>Title</Text>
          <TextInput
            value={entry.title}
            onChangeText={(t) => setEntry({ ...entry, title: t })}
            placeholderTextColor={colors.placeholder}
            style={inputStyle}
          />
        </View>

        <View style={{ backgroundColor: colors.card, padding: 14, borderRadius: UI.radius.lg }}>
          <Text style={{ fontWeight: '900', color: colors.text }}>Mood</Text>
          <Chips
            options={MOODS}
            value={entry.mood ?? undefined}
            onChange={(v) => setEntry({ ...entry, mood: v as string })}
          />
        </View>

        <View style={{ backgroundColor: colors.card, padding: 14, borderRadius: UI.radius.lg }}>
          <Text style={{ fontWeight: '900', color: colors.text }}>Write</Text>
          <TextInput
            value={entry.content}
            onChangeText={(t) => setEntry({ ...entry, content: t })}
            placeholderTextColor={colors.placeholder}
            multiline
            style={[inputStyle, { height: 240, textAlignVertical: 'top' }]}
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
            {(entry.tags ?? []).map((t) => (
              <Pressable
                key={t}
                onPress={() =>
                  setEntry({ ...entry, tags: (entry.tags ?? []).filter((x) => x !== t) })
                }
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
            {(entry.tags ?? []).length === 0 ? (
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
          <Pressable
            onPress={remove}
            style={{
              flex: 1,
              backgroundColor: '#ffe8e8',
              padding: 16,
              borderRadius: UI.radius.lg,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#ffc1c1',
            }}
          >
            <Text style={{ fontWeight: '900', color: '#cc0000' }}>Delete</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
