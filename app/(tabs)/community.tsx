import React from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import ScreenHeader from '@/components/ScreenHeader';
import { router } from 'expo-router';

import { Colors, UI } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function Screen() {
  const theme = useColorScheme() ?? 'light';
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
      <ScreenHeader
        title="Community Support"
        subtitle="Groups, posts, peer support (placeholder)."
      />

      <View style={{ marginTop: 16, gap: 10 }}>
        <Pressable
          onPress={() => router.push('/resources')}
          style={{ backgroundColor: colors.card, padding: 14, borderRadius: 18 }}
        >
          <Text style={{ fontWeight: '900', color: colors.text }}>Open Resources</Text>
        </Pressable>
      </View>
    </View>
  );
}
