import React from 'react';
import { View, Text, useColorScheme } from 'react-native';
import { Colors, UI } from '@/constants/theme';

export function MiniStat({ label, value }: Readonly<{ label: string; value: string }>) {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        borderRadius: UI.radius.md,
        padding: 12,
      }}
    >
      <Text style={{ color: colors.mutedText, fontWeight: '800' }}>{label}</Text>
      <Text style={{ fontSize: 18, fontWeight: '900', marginTop: 6, color: colors.text }}>
        {value}
      </Text>
    </View>
  );
}
