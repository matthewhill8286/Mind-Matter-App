import React from 'react';
import { View, Text, Pressable, ScrollView, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, UI } from '@/constants/theme';
import { IconSymbol } from '@/components/icon-symbol';

interface Action {
  title: string;
  subtitle: string;
  onPress: () => void;
  icon: any; // Using any for icon name as it's a bit complex with IconSymbol
  color: string;
}

export function HorizontalActionList({ title }: { title: string }) {
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  const actions: Action[] = [
    {
      title: 'Stress toolkit',
      subtitle: 'Breathing, grounding, and your Stress Plan.',
      onPress: () => router.push('/(tabs)/stress'),
      icon: 'bolt.fill',
      color: '#f2a65a',
    },
    {
      title: 'Mood check-in',
      subtitle: 'Log mood, energy, and stress in 30 seconds.',
      onPress: () => router.push('/(tabs)/mood'),
      icon: 'text.bubble',
      color: '#6bbf8e',
    },
    {
      title: 'Journal',
      subtitle: 'Write a quick entry or use a prompt.',
      onPress: () => router.push('/(tabs)/journal'),
      icon: 'note.text',
      color: '#9b8df1',
    },
    {
      title: 'Chat',
      subtitle: 'Talk to the AI about a specific topic.',
      onPress: () => router.push('/(tabs)/chat'),
      icon: 'paperplane.fill',
      color: '#a07b55',
    },
    {
      title: 'Sleep check-in',
      subtitle: 'Log sleep quality and duration.',
      onPress: () => router.push('/(tabs)/sleep'),
      icon: 'moon.stars.fill',
      color: '#6e8b6f',
    },
  ];

  return (
    <View style={{ marginTop: 24, marginBottom: 8 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 4,
          marginBottom: 12,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text }}>{title}</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingHorizontal: 4 }}
      >
        {actions.map((action) => (
          <Pressable
            key={action.title}
            onPress={action.onPress}
            style={({ pressed }) => [
              {
                width: 200,
                backgroundColor: colors.card,
                borderRadius: UI.radius.lg,
                padding: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: action.color + '20',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              <IconSymbol name={action.icon} size={20} color={action.color} />
            </View>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '900',
                color: colors.text,
                marginBottom: 4,
              }}
              numberOfLines={1}
            >
              {action.title}
            </Text>
            <Text
              style={{ fontSize: 13, color: colors.mutedText, lineHeight: 18 }}
              numberOfLines={2}
            >
              {action.subtitle}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
