import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import ScreenHeader from '@/components/ScreenHeader';
import { useLocalSearchParams } from 'expo-router';
import { ISSUES } from '@/data/issues';
import { showAlert, withLoading, useIsLoading } from '@/lib/state';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, UI } from '@/constants/theme';
import { IconSymbol } from '@/components/icon-symbol';
import { SkeletonRect } from '@/components/Skeleton';
import TypingBubble from '@/components/TypingBubble';
import { sendChatToAI } from '@/lib/chat';
import { useChatStore } from '@/store/useChatStore';
import { ChatMessage } from '@/lib/types';

export default function Chat() {
  const { issueKey } = useLocalSearchParams<{ issueKey: string }>();
  const issue = useMemo(() => ISSUES.find((i) => i.key === issueKey), [issueKey]);

  const { history, fetchHistory, addMessage, clearHistory } = useChatStore();
  const isGlobalLoading = useIsLoading();
  const messages = useMemo(() => (issueKey ? history[issueKey] || [] : []), [history, issueKey]);
  const [loading, setLoading] = useState(true);

  const isTyping = loading || isGlobalLoading;

  const loadMessages = useCallback(async () => {
    if (issueKey) {
      setLoading(true);
      await fetchHistory(issueKey);
      setLoading(false);
    }
  }, [fetchHistory, issueKey]);

  useEffect(() => {
    (async () => {
      await loadMessages();
    })();
  }, [issueKey, loadMessages]);

  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  async function handleSend() {
    if (!inputText.trim() || !issueKey) return;

    const text = inputText.trim();
    setInputText('');

    // 1. Add a user message
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    await addMessage(issueKey, userMsg);

    // Current history + new user message
    const updatedMessages = [...messages, userMsg];

    try {
      setLoading(true);
      // 2. Call AI API
      const aiText = await sendChatToAI(
        issue?.title ?? 'General Support',
        issue?.tags ?? [],
        updatedMessages.map((m) => ({ role: m.role, content: m.content })),
      );

      // 3. Add AI message
      const aiMsg: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        role: 'assistant',
        content: aiText,
        created_at: new Date().toISOString(),
      };
      await addMessage(issueKey, aiMsg);
      setLoading(false);
    } catch (error) {
      console.error('Chat error:', error);
      setLoading(false);
      showAlert('Chat Error', 'Could not get a response from the AI assistant.');
    }
  }

  async function handleClear() {
    if (!issueKey) return;
    showAlert('Clear chat?', 'This will delete all messages in this conversation.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await withLoading('clear-chat', async () => {
            await clearHistory(issueKey);
          });
        },
      },
    ]);
  }

  if (loading && messages.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ padding: UI.spacing.xl, paddingTop: Platform.OS === 'ios' ? 18 : 8 }}>
          <ScreenHeader
            title={issue?.title ?? 'Chat'}
            subtitle="AI COACHING ASSISTANT"
            showBack
            rightElement={
              messages.length > 0 ? (
                <Pressable onPress={handleClear} style={{ padding: 4 }}>
                  <IconSymbol name="trash" size={20} color={colors.subtleText} />
                </Pressable>
              ) : null
            }
          />
          <View style={{ marginTop: 20, gap: 16 }}>
            <SkeletonRect
              height={60}
              width="70%"
              borderRadius={20}
              style={{ borderBottomLeftRadius: 4 }}
            />
            <SkeletonRect
              height={80}
              width="60%"
              borderRadius={20}
              style={{ borderBottomLeftRadius: 4 }}
            />
            <SkeletonRect
              height={50}
              width="50%"
              borderRadius={20}
              style={{ alignSelf: 'flex-end', borderBottomRightRadius: 4 }}
            />
            <SkeletonRect
              height={100}
              width="80%"
              borderRadius={20}
              style={{ borderBottomLeftRadius: 4 }}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View style={{ flex: 1, padding: UI.spacing.xl, paddingTop: Platform.OS === 'ios' ? 18 : 8 }}>
        <ScreenHeader
          title={issue?.title ?? 'Chat'}
          subtitle="AI COACHING ASSISTANT"
          showBack
          rightElement={
            messages.length > 0 ? (
              <Pressable
                onPress={handleClear}
                style={({ pressed }) => ({
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: theme === 'light' ? '#fee2e2' : '#442222',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <IconSymbol name="trash" size={22} color={theme === 'light' ? '#ef4444' : '#f88'} />
              </Pressable>
            ) : null
          }
        />

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(_, idx) => String(idx)}
          contentContainerStyle={{ paddingVertical: 20, gap: 16 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View
              style={{
                padding: 24,
                backgroundColor: colors.card,
                borderRadius: 24,
                marginTop: 20,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                style={{
                  textAlign: 'center',
                  fontWeight: '800',
                  color: colors.text,
                  fontSize: 16,
                }}
              >
                Start a conversation
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  color: colors.mutedText,
                  marginTop: 8,
                  lineHeight: 20,
                }}
              >
                How can I help you with {issue?.title.toLowerCase() ?? 'this'} today? It’s a safe,
                private space to explore your thoughts.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isUser = item.role === 'user';
            return (
              <View
                style={{
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  backgroundColor: isUser ? colors.primary : colors.card,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 20,
                  borderBottomRightRadius: isUser ? 4 : 20,
                  borderBottomLeftRadius: isUser ? 20 : 4,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <Text
                  style={{
                    color: isUser ? colors.onPrimary : colors.text,
                    fontSize: 16,
                    lineHeight: 22,
                  }}
                >
                  {item.content}
                </Text>
              </View>
            );
          }}
        />

        {isTyping && (
          <View
            style={{
              alignSelf: 'flex-start',
              paddingHorizontal: 16,
              paddingVertical: 12,
              backgroundColor: colors.card,
              borderRadius: 20,
              borderBottomLeftRadius: 4,
              marginBottom: 12,
              marginLeft: 8,
            }}
          >
            <TypingBubble />
          </View>
        )}

        <View
          style={{
            flexDirection: 'row',
            gap: 10,
            alignItems: 'flex-end',
            marginBottom: Platform.OS === 'ios' ? 20 : 0,
          }}
        >
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message…"
            placeholderTextColor={colors.placeholder}
            multiline
            style={{
              flex: 1,
              backgroundColor: colors.card,
              borderRadius: 24,
              paddingHorizontal: 18,
              paddingVertical: 12,
              maxHeight: 120,
              color: colors.text,
              fontSize: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          />
          <Pressable
            onPress={handleSend}
            disabled={!inputText.trim() || isTyping}
            style={({ pressed }) => ({
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: inputText.trim() && !isTyping ? colors.primary : colors.divider,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <IconSymbol
              name="paperplane.fill"
              size={24}
              color={inputText.trim() && !loading ? colors.onPrimary : colors.mutedText}
            />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
