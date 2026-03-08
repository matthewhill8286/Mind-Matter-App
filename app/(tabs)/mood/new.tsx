import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, Platform, StyleSheet } from 'react-native';
import ScreenHeader from '@/components/ScreenHeader';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSubscription } from '@/hooks/useSubscription';
import { Colors, UI } from '@/constants/theme';
import { useMoodStore } from '@/store/useMoodStore';
import { showAlert, withLoading } from '@/lib/state';
import { MoodCheckIn } from '@/lib/types';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';

const MOODS: { value: MoodCheckIn['mood']; icon: string; color: string }[] = [
  { value: 'Great', icon: 'sentiment-very-satisfied', color: '#22c55e' },
  { value: 'Good', icon: 'sentiment-satisfied', color: '#84cc16' },
  { value: 'Okay', icon: 'sentiment-neutral', color: '#f59e0b' },
  { value: 'Low', icon: 'sentiment-dissatisfied', color: '#f97316' },
  { value: 'Bad', icon: 'sentiment-very-dissatisfied', color: '#ef4444' },
];

export default function NewMoodCheckIn() {
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const { hasFullAccess } = useSubscription();
  const { addMoodCheckIn } = useMoodStore();

  const [mood, setMood] = useState<MoodCheckIn['mood']>('Okay');
  const [energy, setEnergy] = useState<MoodCheckIn['energy']>(3);
  const [stress, setStress] = useState<MoodCheckIn['stress']>(5);
  const [note, setNote] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagText, setTagText] = useState('');

  function addTag() {
    const v = tagText.trim();
    if (!v || tags.includes(v)) return;
    setTags((p) => [...p, v]);
    setTagText('');
  }

  async function handleSave() {
    if (!hasFullAccess) {
      showAlert(t('common.premiumFeature'), t('mood.upgradeToLogMood'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.upgrade'), onPress: () => router.push('/(auth)/trial-upgrade') },
      ]);
      return;
    }
    await withLoading('save-mood', async () => {
      await addMoodCheckIn({
        mood,
        energy,
        stress,
        note: note.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
      });
      showAlert(t('common.saved'), t('common.moodSaved'));
      router.back();
    });
  }

  const selectedMood = MOODS.find((m) => m.value === mood)!;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title={t('mood.newCheckIn')} subtitle={t('mood.howAreYouFeeling')} showBack />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Mood selector */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.label, { color: colors.text }]}>{t('mood.mood')}</Text>
          <View style={styles.moodRow}>
            {MOODS.map((m) => {
              const active = mood === m.value;
              return (
                <Pressable
                  key={m.value}
                  onPress={() => setMood(m.value)}
                  style={[
                    styles.moodButton,
                    {
                      backgroundColor: active ? m.color : colors.background,
                      borderColor: active ? m.color : colors.divider,
                    },
                  ]}
                >
                  <MaterialIcons
                    name={m.icon as any}
                    size={28}
                    color={active ? '#fff' : colors.mutedText}
                  />
                  <Text style={[styles.moodLabel, { color: active ? '#fff' : colors.mutedText }]}>
                    {t(`mood.${(m.value ?? '').toLowerCase()}`)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Energy */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t('mood.energy')}
            <Text style={{ color: colors.mutedText, fontWeight: '400' }}> (1–5)</Text>
          </Text>
          <View style={styles.scaleRow}>
            {[1, 2, 3, 4, 5].map((val) => (
              <Pressable
                key={val}
                onPress={() => setEnergy(val as MoodCheckIn['energy'])}
                style={[
                  styles.scaleButton,
                  {
                    backgroundColor: energy === val ? '#4fc3f7' : colors.background,
                    borderColor: energy === val ? '#4fc3f7' : colors.divider,
                  },
                ]}
              >
                <Text style={[styles.scaleValue, { color: energy === val ? '#fff' : colors.text }]}>
                  {val}
                </Text>
                <Text
                  style={[
                    styles.scaleHint,
                    { color: energy === val ? '#ffffffcc' : colors.mutedText },
                  ]}
                >
                  {getEnergyLabel(val)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Stress */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t('mood.stress')}
            <Text style={{ color: colors.mutedText, fontWeight: '400' }}> (0–10)</Text>
          </Text>
          <View style={styles.stressRow}>
            {Array.from({ length: 11 }, (_, i) => i).map((val) => (
              <Pressable
                key={val}
                onPress={() => setStress(val as MoodCheckIn['stress'])}
                style={[
                  styles.stressButton,
                  {
                    backgroundColor: stress === val ? getStressColor(val) : colors.background,
                    borderColor: stress === val ? getStressColor(val) : colors.divider,
                  },
                ]}
              >
                <Text
                  style={{
                    fontWeight: '800',
                    color: stress === val ? '#fff' : colors.text,
                    fontSize: 13,
                  }}
                >
                  {val}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.stressHints}>
            <Text style={{ color: colors.mutedText, fontSize: 11 }}>{t('mood.stressLow')}</Text>
            <Text style={{ color: colors.mutedText, fontSize: 11 }}>{t('mood.stressHigh')}</Text>
          </View>
        </View>

        {/* Note */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.label, { color: colors.text }]}>{t('mood.noteOptional')}</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder={t('mood.notePlaceholder')}
            placeholderTextColor={colors.placeholder}
            style={[styles.textArea, { backgroundColor: colors.inputBg, color: colors.text }]}
            multiline
          />

          {/* Tags */}
          <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>
            {t('mood.tagsOptional')}
          </Text>
          <View style={styles.tagInputRow}>
            <TextInput
              value={tagText}
              onChangeText={setTagText}
              onSubmitEditing={addTag}
              returnKeyType="done"
              placeholder={t('mood.tagPlaceholder')}
              placeholderTextColor={colors.placeholder}
              style={[styles.tagInput, { backgroundColor: colors.inputBg, color: colors.text }]}
            />
            <Pressable
              onPress={addTag}
              style={[styles.addTagButton, { backgroundColor: colors.primary }]}
            >
              <Text style={{ color: colors.onPrimary, fontWeight: '900' }}>{t('common.add')}</Text>
            </Pressable>
          </View>

          {tags.length > 0 && (
            <View style={styles.tagsWrap}>
              {tags.map((tag) => (
                <Pressable
                  key={tag}
                  onPress={() => setTags((p) => p.filter((x) => x !== tag))}
                  style={[styles.tagChip, { backgroundColor: colors.divider }]}
                >
                  <Text style={{ fontWeight: '800', color: colors.mutedText }}>#{tag} ✕</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Preview pill */}
        <View style={[styles.previewPill, { backgroundColor: selectedMood.color + '22' }]}>
          <MaterialIcons name={selectedMood.icon as any} size={20} color={selectedMood.color} />
          <Text style={{ color: selectedMood.color, fontWeight: '800', marginLeft: 6 }}>
            {t(`mood.${(mood ?? '').toLowerCase()}`)} · {t('mood.energy')} {energy}/5 ·{' '}
            {t('mood.stress')} {stress}/10
          </Text>
        </View>

        <Pressable
          onPress={handleSave}
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.saveButtonText}>{t('mood.saveCheckIn')}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function getEnergyLabel(val: number) {
  switch (val) {
    case 1:
      return 'Low';
    case 2:
      return 'Fair';
    case 3:
      return 'Okay';
    case 4:
      return 'Good';
    case 5:
      return 'High';
    default:
      return '';
  }
}

function getStressColor(val: number) {
  if (val <= 3) return '#22c55e';
  if (val <= 6) return '#f59e0b';
  return '#ef4444';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: UI.spacing.xl,
    paddingTop: Platform.OS === 'ios' ? 18 : 8,
  },
  scrollContent: {
    paddingBottom: 40,
    marginTop: 14,
    gap: 12,
  },
  card: {
    padding: 20,
    borderRadius: UI.radius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 12,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  moodButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: UI.radius.md,
    borderWidth: 1.5,
    gap: 4,
  },
  moodLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  scaleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  scaleButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: UI.radius.md,
    borderWidth: 1.5,
    gap: 2,
  },
  scaleValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  scaleHint: {
    fontSize: 9,
    fontWeight: '600',
  },
  stressRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stressButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: UI.radius.md,
    borderWidth: 1.5,
  },
  stressHints: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  textArea: {
    padding: 12,
    borderRadius: UI.radius.md,
    height: 90,
    textAlignVertical: 'top',
  },
  tagInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tagInput: {
    flex: 1,
    padding: 12,
    borderRadius: UI.radius.md,
  },
  addTagButton: {
    paddingHorizontal: 16,
    borderRadius: UI.radius.md,
    justifyContent: 'center',
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: UI.radius.pill,
  },
  previewPill: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: UI.radius.lg,
  },
  saveButton: {
    padding: 16,
    borderRadius: UI.radius.lg,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  },
});
