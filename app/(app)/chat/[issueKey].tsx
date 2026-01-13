import React, { useState, useMemo, useRef } from "react";
import { View, Text, Pressable, TextInput, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { ISSUES } from "@/data/issues";
import { sendChat, ChatMessage } from "@/lib/api";

export default function Chat() {
  const { issueKey } = useLocalSearchParams<{ issueKey: string }>();
  const issue = useMemo(() => ISSUES.find((i) => i.key === issueKey), [issueKey]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  async function handleSend() {
    if (!inputText.trim() || loading) return;

    const userMsg: ChatMessage = { role: "user", content: inputText.trim() };
    const newMessages = [...messages, userMsg];
    
    setMessages(newMessages);
    setInputText("");
    setLoading(true);

    try {
      const response = await sendChat({
        issueKey: issue?.key ?? "general",
        issueTitle: issue?.title,
        issueTags: issue?.tags,
        messages: newMessages,
      });

      setMessages((prev) => [...prev, { role: "assistant", content: response.text }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I'm having trouble connecting right now. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#f6f4f2" }}
    >
      <View style={{ flex: 1, padding: 24, paddingTop: 18 }}>
        <View style={{ marginTop: 34, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flex: 1, marginRight: 16 }}>
            <Text style={{ fontSize: 22, fontWeight: "900" }}>{issue?.title ?? "Chat"}</Text>
            <Text style={{ opacity: 0.6, fontSize: 13 }}>AI Coaching Assistant</Text>
          </View>
          <Pressable onPress={() => router.back()} style={{ padding: 10, borderRadius: 14, backgroundColor: "#eee" }}>
            <Text style={{ fontWeight: "900" }}>Back</Text>
          </Pressable>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(_, idx) => String(idx)}
          contentContainerStyle={{ paddingVertical: 20, gap: 12 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={{ padding: 20, backgroundColor: "white", borderRadius: 18, opacity: 0.8 }}>
              <Text style={{ textAlign: "center", fontWeight: "600" }}>
                How can I help you with {issue?.title.toLowerCase() ?? "this"} today?
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View
              style={{
                alignSelf: item.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%",
                backgroundColor: item.role === "user" ? "#a07b55" : "white",
                padding: 14,
                borderRadius: 18,
                borderBottomRightRadius: item.role === "user" ? 4 : 18,
                borderBottomLeftRadius: item.role === "assistant" ? 4 : 18,
              }}
            >
              <Text style={{ color: item.role === "user" ? "white" : "#111", fontSize: 16 }}>
                {item.content}
              </Text>
            </View>
          )}
        />

        {loading && (
          <View style={{ alignSelf: "flex-start", padding: 14, backgroundColor: "white", borderRadius: 18, borderBottomLeftRadius: 4, marginBottom: 12 }}>
            <ActivityIndicator color="#a07b55" />
          </View>
        )}

        <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-end", marginBottom: Platform.OS === "ios" ? 20 : 0 }}>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            multiline
            style={{
              flex: 1,
              backgroundColor: "white",
              borderRadius: 18,
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 12,
              maxHeight: 100,
              fontSize: 16,
            }}
          />
          <Pressable
            onPress={handleSend}
            disabled={!inputText.trim() || loading}
            style={{
              backgroundColor: inputText.trim() && !loading ? "#a07b55" : "#ccc",
              width: 50,
              height: 50,
              borderRadius: 25,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "900" }}>Send</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
