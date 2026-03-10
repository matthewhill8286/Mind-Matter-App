import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Platform } from 'react-native';
import ScreenHeader from '@/components/ScreenHeader';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, UI } from '@/constants/theme';
import { showAlert, withLoading } from '@/lib/state';
import { stressStore } from '@/store/stressStore';
import { IconSymbol } from '@/components/icon-symbol';
import { DEFAULT_KIT, StressKit } from '@/lib/types';

export default function StressPlan() {
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  const inputStyle = {
    padding: 12,
    borderRadius: UI.radius.md,
    backgroundColor: colors.inputBg,
    color: colors.text,
  };

  const { stressKit, fetchStressKit, saveStressKit } = stressStore();
  const [draft, setDraft] = useState<StressKit>(DEFAULT_KIT);

  useEffect(() => {
    (async () => {
      await fetchStressKit();
    })();
  }, [fetchStressKit]);

  useEffect(() => {
    if (stressKit) setDraft(stressKit);
  }, [stressKit]);

  const addItem = (field: keyof StressKit, value: string) => {
    const v = value.trim();
    if (!v) return;
    setDraft((p) => {
      const arr = Array.isArray(p[field]) ? (p[field] as string[]) : [];
      if (arr.includes(v)) return p; // Don't add duplicates
      return { ...p, [field]: [...arr, v] } as StressKit;
    });
  };

  const removeItem = (field: keyof StressKit, idx: number) => {
    setDraft((p) => {
      const arr = Array.isArray(p[field]) ? (p[field] as string[]) : [];
      return { ...p, [field]: arr.filter((_, i) => i !== idx) } as StressKit;
    });
  };

  const [triggerText, setTriggerText] = useState('');
  const [actionText, setActionText] = useState('');
  const [peopleText, setPeopleText] = useState('');

  async function save() {
    const next = {
      quick_phrase: draft.quick_phrase?.trim() || '',
      triggers: (draft.triggers || []).filter(Boolean),
      helpful_actions: (draft.helpful_actions || []).filter(Boolean),
      people: (draft.people || []).filter(Boolean),
      notes: draft.notes || '',
    };
    await withLoading('save-stress-kit', async () => {
      await saveStressKit(next as StressKit);
      showAlert('Saved', 'Your Stress Kit was updated.');
      router.back();
    });
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
        title="Your Stress Plan"
        subtitle="Build a personal ‘Stress Kit’ you can use any time."
        showBack
      />
      <ScrollView style={{ flex: 1, marginTop: 14 }} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ backgroundColor: colors.card, borderRadius: UI.radius.lg, padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '900', color: colors.text }}>
            Personal Stress Kit
          </Text>
          <Text style={{ color: colors.mutedText, marginTop: 6 }}>
            Personalize a quick plan for what helps you when stress spikes.
          </Text>
        </View>

        <Block title="Quick phrase" icon="text.bubble">
          <Text style={{ color: colors.mutedText, fontSize: 13, marginBottom: 8 }}>
            Say this to yourself when you feel overwhelmed.
          </Text>
          <TextInput
            value={draft.quick_phrase ?? ''}
            onChangeText={(t) => setDraft((p) => ({ ...p, quick_phrase: t }))}
            placeholder="e.g., I can handle one small step."
            placeholderTextColor={colors.placeholder}
            style={inputStyle}
          />
        </Block>

        <EditableList
          title="Common triggers"
          icon="bolt.fill"
          items={draft.triggers || []}
          inputValue={triggerText}
          setInputValue={setTriggerText}
          onAdd={() => {
            addItem('triggers', triggerText);
            setTriggerText('');
          }}
          onRemove={(i) => removeItem('triggers', i)}
          placeholder="Add a trigger…"
        />

        <EditableList
          title="Helpful actions"
          icon="paperplane.fill"
          items={draft.helpful_actions || []}
          inputValue={actionText}
          setInputValue={setActionText}
          onAdd={() => {
            addItem('helpful_actions', actionText);
            setActionText('');
          }}
          onRemove={(i) => removeItem('helpful_actions', i)}
          placeholder="Add an action…"
        />

        <EditableList
          title="People who help"
          icon="person.2.fill"
          items={draft.people || []}
          inputValue={peopleText}
          setInputValue={setPeopleText}
          onAdd={() => {
            addItem('people', peopleText);
            setPeopleText('');
          }}
          onRemove={(i) => removeItem('people', i)}
          placeholder="Add a person…"
        />

        <Block title="Notes" icon="note.text">
          <TextInput
            value={draft.notes ?? ''}
            onChangeText={(t) => setDraft((p) => ({ ...p, notes: t }))}
            placeholder="Anything else that helps (music, places, reminders)…"
            placeholderTextColor={colors.placeholder}
            style={[inputStyle, { height: 110 }]}
            multiline
          />
        </Block>

        <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
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
            onPress={() => router.back()}
            style={{
              flex: 1,
              backgroundColor: colors.divider,
              padding: 16,
              borderRadius: UI.radius.lg,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontWeight: '900', color: colors.text }}>Back</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function Block({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: any;
  children: React.ReactNode;
}) {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: UI.radius.lg,
        padding: 14,
        marginTop: 12,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {icon && <IconSymbol name={icon} size={18} color={colors.primary} />}
        <Text style={{ fontWeight: '900', color: colors.text }}>{title}</Text>
      </View>
      <View style={{ marginTop: 10, gap: 10 }}>{children}</View>
    </View>
  );
}

function EditableList({
  title,
  icon,
  items,
  inputValue,
  setInputValue,
  onAdd,
  onRemove,
  placeholder,
}: {
  title: string;
  icon?: any;
  items: string[];
  inputValue: string;
  setInputValue: (v: string) => void;
  onAdd: () => void;
  onRemove: (idx: number) => void;
  placeholder: string;
}) {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  const inputStyle = {
    padding: 12,
    borderRadius: UI.radius.md,
    backgroundColor: colors.inputBg,
    color: colors.text,
  };

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: UI.radius.lg,
        padding: 14,
        marginTop: 12,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {icon && <IconSymbol name={icon} size={18} color={colors.primary} />}
        <Text style={{ fontWeight: '900', color: colors.text }}>{title}</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
        <TextInput
          value={inputValue}
          onChangeText={setInputValue}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          style={[inputStyle, { flex: 1 }]}
          onSubmitEditing={onAdd}
          returnKeyType="done"
        />
        <Pressable
          onPress={onAdd}
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 14,
            borderRadius: UI.radius.md,
            justifyContent: 'center',
          }}
        >
          <IconSymbol name="plus" size={20} color={colors.onPrimary} />
        </Pressable>
      </View>

      <View style={{ marginTop: 10, gap: 8 }}>
        {items.length === 0 ? (
          <Text style={{ color: colors.mutedText, fontSize: 13, fontStyle: 'italic' }}>
            No items yet.
          </Text>
        ) : null}
        {items.map((it, idx) => (
          <View
            key={`${it}-${idx}`}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: 12,
              alignItems: 'center',
              paddingVertical: 4,
              borderBottomWidth: 1,
              borderBottomColor: colors.divider,
            }}
          >
            <Text style={{ flex: 1, color: colors.text }}>{it}</Text>
            <Pressable onPress={() => onRemove(idx)} style={{ padding: 6 }}>
              <IconSymbol name="trash" size={18} color={colors.mutedText} />
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}
