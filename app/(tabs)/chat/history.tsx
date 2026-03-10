import React, { useEffect, useMemo } from 'react';
import { View, Text, Pressable, FlatList, Platform, ActivityIndicator } from 'react-native';
import ScreenHeader from '@/components/ScreenHeader';
import { router } from 'expo-router';
import { ISSUES } from '@/data/issues';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, UI } from '@/constants/theme';
import { chatStore } from '@/store/chatStore';

export default function ChatHistory() {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const { history, fetchAllHistories, isLoading, error } = chatStore();

  useEffect(() => {
    (async () => {
      await fetchAllHistories();
    })();
  }, [fetchAllHistories]);

  const historyItems = useMemo(() => {
    return Object.entries(history)
      .filter(([_, messages]) => messages.length > 0)
      .map(([key, messages]) => {
        const issue = ISSUES.find((i) => i.key === key);
        const lastMessage = messages[messages.length - 1];
        return {
          key,
          title: issue?.title || key,
          lastMessage: lastMessage?.content || 'No messages',
          date: lastMessage?.created_at
            ? new Date(lastMessage.created_at).toLocaleDateString()
            : '',
          timestamp: lastMessage?.created_at ? new Date(lastMessage.created_at).getTime() : 0,
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [history]);

  if (error)
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          padding: UI.spacing.xl,
          paddingTop: Platform.OS === 'ios' ? 18 : 8,
        }}
      >
        <ScreenHeader title="Chat History" subtitle="Your past conversations with AI." showBack />
      </View>
    );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: UI.spacing.xl,
        paddingTop: Platform.OS === 'ios' ? 18 : 8,
      }}
    >
      <ScreenHeader title="Chat History" subtitle="Your past conversations with AI." showBack />

      {isLoading && historyItems.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={colors.text} />
        </View>
      ) : historyItems.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', opacity: 0.6 }}>
          <Text style={{ color: colors.text, fontSize: 16 }}>No history yet.</Text>
        </View>
      ) : (
        <FlatList
          style={{ marginTop: 16 }}
          data={historyItems}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ gap: 10, paddingBottom: 18 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                router.push({
                  pathname: '/(tabs)/chat/[issueKey]',
                  params: { issueKey: item.key },
                });
              }}
              style={{
                padding: 16,
                borderRadius: UI.radius.lg,
                backgroundColor: colors.card,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 17, fontWeight: '900', color: colors.text }}>
                  {item.title}
                </Text>
                <Text style={{ fontSize: 12, color: colors.mutedText }}>{item.date}</Text>
              </View>
              <Text
                style={{ color: colors.mutedText, marginTop: 6, fontSize: 14 }}
                numberOfLines={1}
              >
                {item.lastMessage}
              </Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
