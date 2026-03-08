import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, Pressable, Switch, FlatList, Platform } from 'react-native';
import { router } from 'expo-router';
import ScreenHeader from '@/components/ScreenHeader';
import { Colors, UI } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as Notifications from 'expo-notifications';
import { scheduleNotification } from '@/lib/notifications';

type NotifSetting = {
  key: string;
  title: string;
  subtitle: string;
  enabled: boolean;
};

export default function NotificationsComp() {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const [items, setItems] = useState<NotifSetting[]>([
    {
      key: 'daily_checkin',
      title: 'Daily check-in',
      subtitle: 'A gentle prompt to reflect once per day.',
      enabled: true,
    },
    {
      key: 'sleep_winddown',
      title: 'Sleep wind-down',
      subtitle: 'A reminder to start your wind-down routine.',
      enabled: false,
    },
    {
      key: 'mindful_breaks',
      title: 'Mindful breaks',
      subtitle: 'Short reminders to pause and breathe.',
      enabled: false,
    },
    {
      key: 'weekly_summary',
      title: 'Weekly summary',
      subtitle: 'A snapshot of your week and trends.',
      enabled: true,
    },
  ]);

  const enabledCount = useMemo(() => items.filter((i) => i.enabled).length, [items]);

  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const toggleNotification = async (key: string, value: boolean) => {
    if (value && !hasPermission) {
      const { status } = await Notifications.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      if (status !== 'granted') return;
    }

    setItems((prev) => prev.map((x) => (x.key === key ? { ...x, enabled: value } : x)));
  };

  const testNotification = async () => {
    await scheduleNotification(
      'Mind Matters',
      'This is a test notification to verify your settings!',
      { type: 'test' },
    );
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: UI.spacing.xl,
        paddingTop: Platform.OS === 'ios' ? 18 : 8,
      }}
    >
      <ScreenHeader title="Smart Notifications" subtitle="Toggle what you want to stay mindful." />

      <View
        style={{
          marginTop: 14,
          padding: 14,
          borderRadius: 18,
          backgroundColor: colors.card,
        }}
      >
        <Text style={{ fontWeight: '900', color: colors.text }}>{enabledCount} enabled</Text>
        <Text style={{ color: colors.mutedText, marginTop: 4 }}>
          We’ll only send what you opt in to.
        </Text>
      </View>

      <FlatList
        style={{ marginTop: 14 }}
        data={items}
        keyExtractor={(i) => i.key}
        contentContainerStyle={{ gap: 10, paddingBottom: 18 }}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: colors.card, padding: 14, borderRadius: 18 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: '900', color: colors.text }}>
                  {item.title}
                </Text>
                <Text style={{ color: colors.mutedText, marginTop: 4 }}>{item.subtitle}</Text>
              </View>
              <Switch
                value={item.enabled}
                onValueChange={(v) => toggleNotification(item.key, v)}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>
          </View>
        )}
      />

      <Pressable
        onPress={testNotification}
        style={{
          marginTop: 6,
          padding: 14,
          borderRadius: 18,
          backgroundColor: colors.primary,
          alignItems: 'center',
        }}
      >
        <Text style={{ fontWeight: '900', color: colors.onPrimary }}>Send test notification</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push('/(utils)/utilities')}
        style={{
          marginTop: 10,
          padding: 14,
          borderRadius: 18,
          backgroundColor: colors.divider,
        }}
      >
        <Text style={{ fontWeight: '900', color: colors.text }}>Test utility screens</Text>
      </Pressable>
    </View>
  );
}
