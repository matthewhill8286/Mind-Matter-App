import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenHeader from '@/components/ScreenHeader';
import Chips from '@/components/Chips';
import MoodChart from '@/components/MoodChart';
import { useMoodStore } from '@/store/useMoodStore';
import { MoodCheckIn } from '@/lib/types';
import { showAlert, withLoading } from '@/lib/state';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, UI } from '@/constants/theme';
import { router } from 'expo-router';
import { useSubscription } from '@/hooks/useSubscription';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SkeletonRect } from '@/components/Skeleton';
import { SummaryCard } from '@/components/SummaryCard';

const MOODS: MoodCheckIn['mood'][] = ['Great', 'Good', 'Okay', 'Low', 'Bad'];
const ENERGY = ['1', '2', '3', '4', '5'];
const STRESS = Array.from({ length: 11 }, (_, i) => String(i));

function moodToScore(m: string) {
  if (m === 'Great') return 5;
  if (m === 'Good') return 4;
  if (m === 'Okay') return 3;
  if (m === 'Low') return 2;
  return 1;
}

function getMoodIcon(mood: MoodCheckIn['mood']) {
  switch (mood) {
    case 'Great':
      return 'sentiment-very-satisfied';
    case 'Good':
      return 'sentiment-satisfied';
    case 'Okay':
      return 'sentiment-neutral';
    case 'Low':
      return 'sentiment-dissatisfied';
    case 'Bad':
      return 'sentiment-very-dissatisfied';
    default:
      return 'sentiment-neutral';
  }
}

export default function Mood() {
  const { t } = useTranslation();
  const theme = useColorScheme() ?? 'light';
  const { hasFullAccess } = useSubscription();
  const colors = Colors[theme];

  const {
    moodCheckIns: items,
    fetchMoodCheckIns,
    addMoodCheckIn,
    isLoading: loading,
  } = useMoodStore();

  useEffect(() => {
    (async () => {
      await fetchMoodCheckIns();
    })();
  }, [fetchMoodCheckIns]);

  const [mood, setMood] = useState<MoodCheckIn['mood']>('Okay');
  const [energy, setEnergy] = useState<MoodCheckIn['energy']>(3);
  const [stress, setStress] = useState<MoodCheckIn['stress']>(5);
  const [note, setNote] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagText, setTagText] = useState('');

  const inputStyle = {
    padding: 12,
    borderRadius: UI.radius.md,
    backgroundColor: colors.inputBg,
    color: colors.text,
  };

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
    setTagText('');
  }

  async function saveCheckIn() {
    if (!hasFullAccess) {
      showAlert(t('common.premiumFeature'), t('mood.upgradeToLogMood'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.upgrade'), onPress: () => router.push('/(auth)/trial-upgrade') },
      ]);
      return;
    }
    await withLoading('save-mood', async () => {
      const entry: Omit<MoodCheckIn, 'id' | 'created_at'> = {
        mood,
        energy,
        stress,
        note: note.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
      };
      await addMoodCheckIn(entry);
      setNote('');
      setTags([]);
      setTagText('');
      showAlert(t('common.saved'), t('common.moodSaved'));
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
        title={t('tabs.mood')}
        subtitle={t('mood.hubSubtitle')}
        rightElement={
          <Pressable
            onPress={() => router.push('/(tabs)/mood/history')}
            style={({ pressed }) => ({
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: colors.card,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <MaterialIcons name="history" size={24} color={colors.primary} />
          </Pressable>
        }
      />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24, marginTop: 14 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={{ gap: 12 }}>
            <SkeletonRect height={200} borderRadius={UI.radius.lg} />
            <SkeletonRect height={100} borderRadius={UI.radius.lg} />
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: UI.radius.lg,
                padding: 14,
                gap: 10,
              }}
            >
              <SkeletonRect height={20} width={120} />
              <SkeletonRect height={40} borderRadius={UI.radius.md} />
              <SkeletonRect height={20} width={120} />
              <SkeletonRect height={40} borderRadius={UI.radius.md} />
              <SkeletonRect height={20} width={120} />
              <SkeletonRect height={40} borderRadius={UI.radius.md} />
            </View>
          </View>
        ) : (
          <View style={{ marginTop: 12, gap: 12 }}>
            <MoodChart items={items as any} />

            {items.length > 0 && (
              <SummaryCard
                title={t('mood.lastCheckIn')}
                icon="chevron-right"
                onPress={() => router.push(`/(tabs)/mood/${items[0].id}`)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <MaterialIcons
                    name={getMoodIcon(items[0].mood)}
                    size={32}
                    color={colors.primary}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '800', color: colors.text, fontSize: 18 }}>
                      {t(`mood.${items[0]?.mood?.toLowerCase()}`)}
                    </Text>
                    <Text style={{ color: colors.mutedText, fontSize: 14 }}>
                      {new Date(items[0].created_at).toLocaleString(undefined, {
                        weekday: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: colors.mutedText, fontSize: 12, fontWeight: '600' }}>
                      {t('mood.energy').toUpperCase()}
                    </Text>
                    <Text style={{ fontWeight: '800', color: colors.text }}>
                      {items[0].energy}/5
                    </Text>
                  </View>
                </View>
              </SummaryCard>
            )}

            {insights ? (
              <View
                style={{ backgroundColor: colors.card, borderRadius: UI.radius.lg, padding: 14 }}
              >
                <Text style={{ fontWeight: '900', color: colors.text }}>
                  {t('mood.insightsCount', { count: insights.n })}
                </Text>
                <Text style={{ color: colors.mutedText, marginTop: 6 }}>
                  {t('mood.avgMood')}: {insights.avgMood.toFixed(1)} / 5 • {t('mood.avgStress')}:{' '}
                  {insights.avgStress.toFixed(1)} / 10 • {t('mood.avgEnergy')}:{' '}
                  {insights.avgEnergy.toFixed(1)} / 5
                </Text>
              </View>
            ) : (
              <View
                style={{ backgroundColor: colors.card, borderRadius: UI.radius.lg, padding: 14 }}
              >
                <Text style={{ fontWeight: '900', color: colors.text }}>{t('mood.insights')}</Text>
                <Text style={{ color: colors.mutedText, marginTop: 6 }}>
                  {t('mood.addCheckInsToSeeTrends')}
                </Text>
              </View>
            )}

            <View style={{ backgroundColor: colors.card, borderRadius: UI.radius.lg, padding: 14 }}>
              <Text style={{ fontWeight: '900', color: colors.text }}>
                {t('mood.todaysCheckIn')}
              </Text>

              <Text style={{ marginTop: 10, fontWeight: '900', color: colors.text }}>
                {t('mood.mood')}
              </Text>
              <Chips
                options={MOODS.map((m) => t(`mood.${m.toLowerCase()}`))}
                value={mood}
                onChange={(v) => setMood(v as MoodCheckIn['mood'])}
              />

              <Text style={{ marginTop: 10, fontWeight: '900', color: colors.text }}>
                {t('mood.energy')}
              </Text>
              <Chips
                options={ENERGY}
                value={String(energy)}
                onChange={(v) => setEnergy(Number(v) as MoodCheckIn['energy'])}
              />

              <Text style={{ marginTop: 10, fontWeight: '900', color: colors.text }}>
                {t('mood.stress')}
              </Text>
              <Chips
                options={STRESS}
                value={String(stress)}
                onChange={(v) => setStress(Number(v) as MoodCheckIn['stress'])}
              />

              <Text style={{ marginTop: 10, fontWeight: '900', color: colors.text }}>
                {t('mood.noteOptional')}
              </Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder={t('mood.notePlaceholder')}
                placeholderTextColor={colors.placeholder}
                style={[inputStyle, { marginTop: 8 }]}
                multiline
              />

              <Text style={{ marginTop: 10, fontWeight: '900', color: colors.text }}>
                {t('mood.tagsOptional')}
              </Text>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                <TextInput
                  value={tagText}
                  onChangeText={setTagText}
                  placeholder={t('mood.tagPlaceholder')}
                  placeholderTextColor={colors.placeholder}
                  style={[inputStyle, { flex: 1 }]}
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
                  <Text style={{ color: colors.onPrimary, fontWeight: '900' }}>
                    {t('common.add')}
                  </Text>
                </Pressable>
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                {tags.map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => setTags((p) => p.filter((x) => x !== t))}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: UI.radius.pill,
                      backgroundColor: colors.divider,
                    }}
                  >
                    <Text style={{ fontWeight: '800', color: colors.mutedText }}>#{t} ✕</Text>
                  </Pressable>
                ))}
                {tags.length === 0 ? (
                  <Text style={{ color: colors.subtleText }}>{t('mood.noTagsYet')}</Text>
                ) : null}
              </View>

              <Pressable
                onPress={saveCheckIn}
                style={{
                  marginTop: 20,
                  backgroundColor: colors.primary,
                  padding: 16,
                  borderRadius: UI.radius.lg,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 8,
                  opacity: 1,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Text style={{ color: colors.onPrimary, fontWeight: '900', fontSize: 16 }}>
                  {t('mood.saveCheckIn')}
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
