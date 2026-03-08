import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';

export default function Screen() {
  return (
    <View style={styles.page}>
      <Text style={styles.h1}>Error & Other Utilities</Text>
      <Text style={styles.sub}>
        Placeholder route for error states, offline, empty screens, permission prompts.
      </Text>

      <View style={{ marginTop: 16, gap: 10 }}>
        <Pressable onPress={() => router.push('/(utils)/offline')} style={styles.link}>
          <Text style={styles.linkText}>Offline screen</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/(utils)/empty')} style={styles.link}>
          <Text style={styles.linkText}>Empty state screen</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/(utils)/error')} style={styles.link}>
          <Text style={styles.linkText}>Generic error screen</Text>
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
