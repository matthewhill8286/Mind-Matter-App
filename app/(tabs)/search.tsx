import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, Platform } from 'react-native';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, UI } from '@/constants/theme';
import ScreenHeader from '@/components/ScreenHeader';
import { useSubscription } from '@/hooks/useSubscription';
import { showAlert } from '@/lib/state';
import { IconSymbol } from '@/components/icon-symbol';

export type MenuItem = {
  key: string;
  title: string;
  subtitle: string;
  path: string;
  isPremium?: boolean;
};

export const ITEMS: MenuItem[] = [
  {
    key: 'home',
    title: 'Home & Score',
    subtitle: 'Dashboard and wellbeing snapshot.',
    path: '/(tabs)/home',
  },
  {
    key: 'assessment',
    title: 'Mental Health Assessment',
    subtitle: '14-step check-in flow.',
    path: '/(onboarding)/assessment',
    isPremium: true,
  },
  {
    key: 'stress',
    title: 'Stress Management',
    subtitle: 'Breathing coach, grounding, and a personal stress plan.',
    path: '/(tabs)/stress',
  },
  {
    key: 'mood',
    title: 'Mood Tracker',
    subtitle: 'Track how you feel over time.',
    path: '/(tabs)/mood',
  },
  {
    key: 'journal',
    title: 'Mental Health Journal',
    subtitle: 'Write entries, use prompts, and track moods.',
    path: '/(tabs)/journal',
  },
  {
    key: 'sleep',
    title: 'Sleep Quality',
    subtitle: 'Sleep check-ins and routines.',
    path: '/(tabs)/sleep',
  },
  {
    key: 'mindful',
    title: 'Mindful Hours',
    subtitle: 'Meditations and mindful breaks.',
    path: '/(tabs)/mindful-hours',
  },
  {
    key: 'notifications',
    title: 'Smart Notifications',
    subtitle: 'Reminders you control.',
    path: '/(tabs)/notifications',
  },
  {
    key: 'community',
    title: 'Community Support',
    subtitle: 'Peer support space.',
    path: '/(tabs)/community',
  },
  {
    key: 'chatbot',
    title: 'AI Therapy Chatbot',
    subtitle: 'Chat by topic.',
    path: '/(tabs)/chat',
    isPremium: true,
  },
  {
    key: 'resources',
    title: 'Mindful Resources',
    subtitle: 'Crisis and helpful links.',
    path: '/resources',
  },
  {
    key: 'profile',
    title: 'Profile & Settings',
    subtitle: 'Preferences and help center.',
    path: '/(tabs)/profile',
  },
  {
    key: 'help',
    title: 'Help Center',
    subtitle: 'FAQs and support.',
    path: '/(utils)/help-center',
  },
  {
    key: 'utilities',
    title: 'Error & Utilities',
    subtitle: 'Offline, empty, error screens.',
    path: '/(utils)/utilities',
  },
];

export default function Search() {
  const [q, setQ] = useState('');
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const { hasFullAccess } = useSubscription();

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return ITEMS;
    return ITEMS.filter((i) => (i.title + ' ' + i.subtitle).toLowerCase().includes(s));
  }, [q]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: UI.spacing.xl,
        paddingTop: Platform.OS === 'ios' ? 18 : 8,
      }}
    >
      <ScreenHeader title="Search" subtitle="Find sections, tools, or topics." />

      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder="Search features…"
        placeholderTextColor={colors.placeholder}
        style={{
          marginTop: 18,
          backgroundColor: colors.card,
          padding: 14,
          borderRadius: UI.radius.lg,
          color: colors.text,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      />

      <FlatList
        style={{ marginTop: 14 }}
        data={results}
        keyExtractor={(i) => i.key}
        contentContainerStyle={{ gap: 10, paddingBottom: 20 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              if (item.isPremium && !hasFullAccess) {
                showAlert('Premium Feature', 'Upgrade to lifetime access to use this feature.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Upgrade', onPress: () => router.push('/(auth)/trial-upgrade') },
                ]);
                return;
              }
              router.push(item.path as any);
            }}
            style={{
              padding: 16,
              borderRadius: UI.radius.lg,
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
              opacity: item.isPremium && !hasFullAccess ? 0.7 : 1,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontWeight: '900', color: colors.text, fontSize: 16 }}>
                {item.title}
              </Text>
              {item.isPremium && !hasFullAccess && (
                <IconSymbol name="bolt.fill" size={16} color="#a07b55" />
              )}
            </View>
            <Text style={{ color: colors.mutedText, marginTop: 4 }}>{item.subtitle}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}
