import React from 'react';
import { View, Text } from 'react-native';

export default function ScoreCard({
  score,
  title,
  subtitle,
  bg,
}: Readonly<{
  score: string | number;
  title: string;
  subtitle: string;
  bg: string;
}>) {
  return (
    <View style={{ backgroundColor: bg, borderRadius: 26, padding: 22, marginTop: 14 }}>
      <Text style={{ color: 'white', fontSize: 34, fontWeight: '900' }}>{score}</Text>
      <Text style={{ color: 'white', fontSize: 16, fontWeight: '900', marginTop: 6 }}>{title}</Text>
      <Text style={{ color: 'white', opacity: 0.92, marginTop: 6 }}>{subtitle}</Text>
    </View>
  );
}
