import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Animated,
  Easing,
  FlatList,
  Platform,
} from 'react-native';
import ScreenHeader from '@/components/ScreenHeader';
import { router } from 'expo-router';
import { useMindfulnessStore } from '@/store/useMindfulnessStore';
import { showAlert, withLoading } from '@/lib/state';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, UI } from '@/constants/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SkeletonRect } from '@/components/Skeleton';

const PRESETS = [
  { label: '1 min', value: 60 },
  { label: '5 min', value: 300 },
  { label: '10 min', value: 600 },
  { label: '15 min', value: 900 },
];

export default function MindfulHours() {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const [activeTab, setActiveTab] = useState<'timer' | 'history'>('timer');

  const {
    mindfulnessHistory: history,
    fetchMindfulnessHistory,
    addMindfulMinutes,
    isLoading: loading,
  } = useMindfulnessStore();

  useEffect(() => {
    (async () => {
      await fetchMindfulnessHistory();
    })();
  }, [fetchMindfulnessHistory]);

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
        title="Mindful Hours"
        subtitle="Take a moment to breathe and center yourself."
      />

      <View
        style={{
          flexDirection: 'row',
          backgroundColor: colors.card,
          borderRadius: UI.radius.lg,
          padding: 4,
          marginTop: 14,
          marginBottom: 20,
        }}
      >
        <Pressable
          onPress={() => setActiveTab('timer')}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: UI.radius.md,
            backgroundColor: activeTab === 'timer' ? colors.primary : 'transparent',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontWeight: '900',
              color: activeTab === 'timer' ? colors.onPrimary : colors.text,
            }}
          >
            Timer
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('history')}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: UI.radius.md,
            backgroundColor: activeTab === 'history' ? colors.primary : 'transparent',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontWeight: '900',
              color: activeTab === 'history' ? colors.onPrimary : colors.text,
            }}
          >
            History
          </Text>
        </Pressable>
      </View>

      {activeTab === 'timer' ? (
        <TimerView
          colors={colors}
          onCompleted={async (mins) => {
            await withLoading('add-mindful-minutes', async () => {
              await addMindfulMinutes(mins * 60);
            });
          }}
        />
      ) : (
        <HistoryView
          colors={colors}
          history={history.map((e) => ({ date: e.date_iso, minutes: Math.round(e.seconds / 60) }))}
          loading={loading}
        />
      )}
    </View>
  );
}

function TimerView({
  colors,
  onCompleted,
}: {
  colors: any;
  onCompleted: (minutes: number) => void;
}) {
  const [secondsRemaining, setSecondsRemaining] = useState(300);
  const [initialSeconds, setInitialSeconds] = useState(300);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | number | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isActive && secondsRemaining > 0) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 4000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 4000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);

      if (secondsRemaining === 0 && isActive) {
        setIsActive(false);
        const mins = Math.max(1, Math.floor(initialSeconds / 60));
        onCompleted(mins);
        showAlert(
          'Session Complete',
          `Great job! You've completed ${mins} mindful minute${mins > 1 ? 's' : ''}.`,
        );
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, pulseAnim, secondsRemaining, initialSeconds, onCompleted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = (secs: number) => {
    setIsActive(false);
    setSecondsRemaining(secs);
    setInitialSeconds(secs);
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1, alignItems: 'center', paddingBottom: 20 }}
    >
      <View style={{ height: 40 }} />
      <Animated.View
        style={{
          width: 240,
          height: 240,
          borderRadius: 120,
          backgroundColor: colors.card,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 3,
          transform: [{ scale: pulseAnim }],
        }}
      >
        <Text style={{ fontSize: 48, fontWeight: '900', color: colors.primary }}>
          {formatTime(secondsRemaining)}
        </Text>
        <Text style={{ color: colors.mutedText, fontWeight: '600', marginTop: 4 }}>
          {isActive ? 'Focusing...' : 'Ready'}
        </Text>
      </Animated.View>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 10,
          marginTop: 40,
        }}
      >
        {PRESETS.map((p) => (
          <Pressable
            key={p.value}
            onPress={() => resetTimer(p.value)}
            disabled={isActive}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: UI.radius.md,
              backgroundColor: secondsRemaining === p.value ? colors.primary : colors.card,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 5,
              elevation: 2,
            }}
          >
            <Text
              style={{
                fontWeight: '900',
                color: secondsRemaining === p.value ? colors.onPrimary : colors.text,
              }}
            >
              {p.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={{ flexDirection: 'row', gap: 16, marginTop: 30, width: '100%' }}>
        <Pressable
          onPress={toggleTimer}
          style={{
            flex: 1,
            backgroundColor: isActive ? colors.text : colors.primary,
            paddingVertical: 18,
            borderRadius: UI.radius.lg,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: isActive ? colors.background : colors.onPrimary,
              fontWeight: '900',
              fontSize: 16,
            }}
          >
            {isActive ? 'Pause' : 'Start'}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => resetTimer(300)}
          style={{
            backgroundColor: colors.border,
            paddingVertical: 18,
            paddingHorizontal: 24,
            borderRadius: UI.radius.lg,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontWeight: '900', fontSize: 16, color: colors.text }}>Reset</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={() => router.push('/resources')}
        style={{
          marginTop: 40,
          backgroundColor: colors.card,
          padding: 16,
          borderRadius: UI.radius.lg,
          width: '100%',
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <MaterialIcons name="help-outline" size={20} color={colors.primary} />
        <Text style={{ fontWeight: '900', color: colors.text }}>Emergency Resources</Text>
      </Pressable>
    </ScrollView>
  );
}

function HistoryView({
  colors,
  history,
  loading,
}: {
  colors: any;
  history: { date: string; minutes: number }[];
  loading?: boolean;
}) {
  if (loading) {
    return (
      <View style={{ gap: 12 }}>
        <SkeletonRect height={70} borderRadius={UI.radius.lg} />
        <SkeletonRect height={70} borderRadius={UI.radius.lg} />
        <SkeletonRect height={70} borderRadius={UI.radius.lg} />
        <SkeletonRect height={70} borderRadius={UI.radius.lg} />
      </View>
    );
  }

  const sortedHistory = [...history].sort((a, b) => b.date.localeCompare(a.date));

  if (sortedHistory.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', opacity: 0.5 }}>
        <MaterialIcons name="history" size={64} color={colors.icon} />
        <Text style={{ marginTop: 16, fontSize: 18, fontWeight: '600', color: colors.text }}>
          No history yet
        </Text>
        <Text style={{ marginTop: 8, color: colors.mutedText }}>
          Complete your first mindful session today!
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={sortedHistory}
      keyExtractor={(item) => item.date}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
      renderItem={({ item }) => {
        const date = new Date(item.date);
        const formattedDate = date.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });

        return (
          <View
            style={{
              backgroundColor: colors.card,
              padding: 16,
              borderRadius: UI.radius.lg,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View>
              <Text style={{ fontSize: 16, fontWeight: '900', color: colors.text }}>
                {formattedDate}
              </Text>
              <Text style={{ color: colors.mutedText, marginTop: 2 }}>Mindfulness Session</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: colors.primary }}>
                {item.minutes}m
              </Text>
              <Text style={{ fontSize: 12, color: colors.mutedText }}>Duration</Text>
            </View>
          </View>
        );
      }}
    />
  );
}
