import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';

export default function Screen() {
  return (
    <View style={styles.page}>
      <Text style={styles.h1}>Something went wrong</Text>
      <Text style={styles.sub}>A generic error screen route (placeholder).</Text>

      <View style={{ marginTop: 16, gap: 10 }}>
        <Pressable onPress={() => router.push('/(tabs)/home')} style={styles.link}>
          <Text style={styles.linkText}>Back</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles: any = {
  page: { flex: 1, backgroundColor: '#f6f4f2', padding: 24, paddingTop: 54 },
  h1: { fontSize: 26, fontWeight: '900' },
  sub: { opacity: 0.7, marginTop: 8 },
  link: { backgroundColor: 'white', padding: 14, borderRadius: 18 },
  linkText: { fontWeight: '900' },
};
