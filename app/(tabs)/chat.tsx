import React from 'react';
import { View, Text, Pressable, FlatList, Platform } from 'react-native';
import ScreenHeader from '@/components/ScreenHeader';
import { router } from 'expo-router';
import { ISSUES } from '@/data/issues';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSubscription } from '@/hooks/useSubscription';
import { showAlert } from '@/lib/state';
import { Colors, UI } from '@/constants/theme';

export default function Chatbot() {
  const theme = useColorScheme() ?? 'light';
  const { hasFullAccess } = useSubscription();
  const colors = Colors[theme];

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: UI.spacing.xl,
        paddingTop: Platform.OS === 'ios' ? 18 : 8,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <ScreenHeader title="AI Therapy Chatbot" subtitle="Pick a topic to chat about." />
        <Pressable
          onPress={() => router.push('/(tabs)/chat/history')}
          style={{
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 20,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>History</Text>
        </Pressable>
      </View>

      <FlatList
        style={{ marginTop: 16 }}
        data={ISSUES}
        keyExtractor={(i) => i.key}
        contentContainerStyle={{ gap: 10, paddingBottom: 18 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              if (!hasFullAccess) {
                showAlert(
                  'Premium Feature',
                  'Upgrade to lifetime access to chat with the AI companion.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Upgrade', onPress: () => router.push('/(auth)/trial-upgrade') },
                  ],
                );
                return;
              }
              router.push({
                pathname: '/(tabs)/chat/[issueKey]',
                params: { issueKey: item.key },
              });
            }}
            style={{
              padding: 14,
              borderRadius: UI.radius.lg,
              backgroundColor: colors.card,
              opacity: hasFullAccess ? 1 : 0.7,
            }}
          >
            <Text style={{ fontSize: 17, fontWeight: '900', color: colors.text }}>
              {item.title}
            </Text>
            <Text style={{ color: colors.mutedText, marginTop: 4 }}>{item.description}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}
