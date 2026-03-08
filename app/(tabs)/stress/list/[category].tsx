import React from 'react';
import { View, Text, Pressable, FlatList, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, UI } from '@/constants/theme';
import { STRESS_VIDEOS, StressVideo } from '@/data/stressVideos';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import ScreenHeader from '@/components/ScreenHeader';

export default function StressVideosScreen() {
  const { category } = useLocalSearchParams<{ category: 'body' | 'mind' }>();
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  const filteredVideos = STRESS_VIDEOS.filter((v) => v.category === category);
  const title = category === 'body' ? 'Body Relaxation' : 'Mind Relaxation';
  const subtitle =
    category === 'body'
      ? 'Physical exercises to release bodily tension.'
      : 'Breathing exercises to calm your mind.';

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: UI.spacing.xl,
        paddingTop: Platform.OS === 'ios' ? 18 : 8,
      }}
    >
      <ScreenHeader title={title} subtitle={subtitle} showBack />

      <FlatList
        style={{ marginTop: 14 }}
        data={filteredVideos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 16, paddingBottom: 24 }}
        renderItem={({ item }) => <VideoCard category={category} video={item} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function VideoCard({ category, video }: { category: string; video: StressVideo }) {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: UI.radius.xl,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: '900', color: colors.text }}>{video.title}</Text>
        <Text style={{ color: colors.mutedText, marginTop: 4 }}>{video.subtitle}</Text>

        <Pressable
          onPress={() => {
            router.push(`/(tabs)/stress/list/${category}/${video.id}`);
          }}
          style={{
            marginTop: 16,
            backgroundColor: colors.primary,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: UI.radius.md,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <MaterialIcons name="play-arrow" size={20} color={colors.onPrimary} />
          <Text style={{ color: colors.onPrimary, fontWeight: '900' }}>Watch Exercise</Text>
        </Pressable>
      </View>
    </View>
  );
}
