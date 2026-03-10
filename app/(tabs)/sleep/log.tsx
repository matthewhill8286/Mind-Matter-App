import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, Platform, StyleSheet } from 'react-native';
import ScreenHeader from '@/components/ScreenHeader';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSubscription } from '@/hooks/useSubscription';
import { Colors, UI } from '@/constants/theme';
import { useSleepStore } from '@/store/useSleepStore';
import { showAlert, withLoading } from '@/lib/state';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function LogSleepScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const { hasFullAccess } = useSubscription();
  const { addSleepEntry } = useSleepStore();

  const [quality, setQuality] = useState(3);
  const [duration, setDuration] = useState((params.duration as string) || '8');
  const [note, setNote] = useState('');

  const [loading] = useState(false);

  const handleSave = async () => {
    if (!hasFullAccess) {
      showAlert('Premium Feature', 'Upgrade to lifetime access to log new sleep entries.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Upgrade', onPress: () => router.push('/(auth)/trial-upgrade') },
      ]);
      return;
    }
    await withLoading('save-sleep', async () => {
      const hours = parseFloat(duration) || 0;
      const end = new Date();
      const start = new Date(end.getTime() - hours * 60 * 60 * 1000);
      await addSleepEntry({
        startISO: start.toISOString(),
        endISO: end.toISOString(),
        quality: quality as any,
        duration: hours,
        notes: note || undefined,
      } as any);
      showAlert('Saved', 'Your sleep entry was saved.');
      router.back();
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Log Sleep" subtitle="How did you rest last night?" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.label, { color: colors.text }]}>Sleep Quality</Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((val) => (
              <Pressable
                key={val}
                onPress={() => setQuality(val)}
                style={[
                  styles.ratingButton,
                  { backgroundColor: quality === val ? colors.primary : colors.background },
                ]}
              >
                <MaterialIcons
                  name={getQualityIcon(val)}
                  size={24}
                  color={quality === val ? '#fff' : colors.mutedText}
                />
                <Text
                  style={[
                    styles.ratingText,
                    { color: quality === val ? '#fff' : colors.mutedText },
                  ]}
                >
                  {getQualityLabel(val)}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.label, { color: colors.text, marginTop: 24 }]}>
            Duration (Hours)
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
            placeholder="8"
            placeholderTextColor={colors.mutedText}
          />

          <Text style={[styles.label, { color: colors.text, marginTop: 24 }]}>
            Notes (Optional)
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={4}
            placeholder="Anything affecting your sleep?"
            placeholderTextColor={colors.mutedText}
          />

          <Pressable
            onPress={handleSave}
            disabled={loading}
            style={[
              styles.saveButton,
              { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 },
            ]}
          >
            <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save Sleep Entry'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function getQualityIcon(val: number) {
  switch (val) {
    case 1:
      return 'sentiment-very-dissatisfied';
    case 2:
      return 'sentiment-dissatisfied';
    case 3:
      return 'sentiment-neutral';
    case 4:
      return 'sentiment-satisfied';
    case 5:
      return 'sentiment-very-satisfied';
    default:
      return 'sentiment-neutral';
  }
}

function getQualityLabel(val: number) {
  switch (val) {
    case 1:
      return 'Poor';
    case 2:
      return 'Fair';
    case 3:
      return 'Good';
    case 4:
      return 'Great';
    case 5:
      return 'Excellent';
    default:
      return '';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: UI.spacing.xl,
    paddingTop: Platform.OS === 'ios' ? 18 : 8,
  },
  scrollContent: {
    paddingBottom: 40,
    marginTop: 14,
  },
  card: {
    padding: 20,
    borderRadius: UI.radius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: UI.radius.md,
    flex: 1,
    marginHorizontal: 2,
  },
  ratingText: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '700',
  },
  input: {
    padding: 12,
    borderRadius: UI.radius.md,
    borderWidth: 1,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: 30,
    padding: 16,
    borderRadius: UI.radius.lg,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  },
});
