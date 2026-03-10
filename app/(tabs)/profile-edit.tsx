import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { profileStore } from '@/store/profileStore';
import { showAlert, withLoading } from '@/lib/state';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, UI } from '@/constants/theme';
import ScreenHeader from '@/components/ScreenHeader';
import { LoadingOverlay } from '@/components/LoadingOverlay';

function RadioOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: selected ? '#828a6a' : colors.card,
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 30,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: '600',
          color: selected ? 'white' : colors.text,
          flex: 1,
        }}
      >
        {label}
      </Text>
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: selected ? 'white' : colors.text,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: selected ? 1 : 0.3,
        }}
      >
        {selected && (
          <View
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: 'white',
            }}
          />
        )}
      </View>
    </Pressable>
  );
}

export default function ProfileEdit() {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const { profile, fetchProfile, saveProfile } = profileStore();
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [intention, setIntention] = useState('');
  const [routine, setRoutine] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchProfile();
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setIntention(profile.intention || '');
      setRoutine(profile.routine || '');
    }
  }, [profile]);

  async function handleSave() {
    await withLoading('save-profile', async () => {
      const updatedProfile = {
        ...profile,
        name: name.trim() || null,
        intention: intention || null,
        routine: routine || null,
        updated_at: new Date().toISOString(),
      } as any;

      await saveProfile(updatedProfile);
      showAlert('Success', 'Profile updated successfully.');
      router.back();
    });
  }

  if (loading) {
    return <LoadingOverlay />;
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: UI.spacing.xl,
        paddingTop: Platform.OS === 'ios' ? 18 : 8,
      }}
    >
      <ScreenHeader title="Edit Profile" showBack />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, marginTop: 14 }}
      >
        <Text style={[styles.label, { color: colors.mutedText }]}>Your Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Your name or nickname"
          placeholderTextColor={colors.placeholder}
          style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text }]}
        />

        <Text style={[styles.label, { marginTop: 24, color: colors.mutedText }]}>Primary Goal</Text>
        <View style={{ marginTop: 12 }}>
          {['Calm', 'Focus', 'Sleep', 'Stress', 'Confidence', 'Balance'].map((opt) => (
            <RadioOption
              key={opt}
              label={opt}
              selected={intention === opt}
              onPress={() => setIntention(opt)}
            />
          ))}
        </View>

        <Text style={[styles.label, { marginTop: 24, color: colors.mutedText }]}>
          Preferred Check-in Time
        </Text>
        <View style={{ marginTop: 12 }}>
          {['Morning', 'Evening', 'Anytime'].map((opt) => (
            <RadioOption
              key={opt}
              label={opt}
              selected={routine === opt}
              onPress={() => setRoutine(opt)}
            />
          ))}
        </View>

        <Pressable
          onPress={handleSave}
          style={({ pressed }) => ({
            marginTop: 32,
            paddingVertical: 18,
            borderRadius: 30,
            backgroundColor: colors.primary,
            alignItems: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ color: colors.onPrimary, fontWeight: '800', fontSize: 16 }}>
            Save Changes
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: '900',
    color: '#6a5e55',
    marginLeft: 4,
  },
  input: {
    marginTop: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 20,
    fontSize: 16,
    fontWeight: '600',
  },
});
