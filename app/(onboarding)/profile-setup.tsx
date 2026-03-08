import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView } from 'react-native';
import { router } from 'expo-router';
import ProfileProgressRing from '@/components/ProfileProgressRing';
import Chips from '@/components/Chips';
import { useProfileStore } from '@/store/useProfileStore';
import { withLoading } from '@/lib/state';

type StepKey = 'intro' | 'name' | 'intention' | 'routine' | 'finish';
const STEPS: StepKey[] = ['intro', 'name', 'intention', 'routine', 'finish'];

export default function ProfileSetup() {
  const { saveProfile } = useProfileStore();

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [intention, setIntention] = useState<string | undefined>();
  const [routine, setRoutine] = useState<string | undefined>();

  const progress = useMemo(() => Math.round(((step + 1) / STEPS.length) * 100), [step]);
  const stepKey = STEPS[step];

  async function next() {
    if (stepKey === 'finish') {
      await withLoading('save-profile', async () => {
        await saveProfile({
          name: name.trim() || null,
          intention: intention ?? null,
          routine: routine ?? null,
          updated_at: new Date().toISOString(),
        });
        router.replace('/(onboarding)/profile-completion');
      });
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    if (step === 0) {
      router.back();
      return;
    }
    setStep((s) => Math.max(s - 1, 0));
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#6f6660', padding: 24, paddingTop: 60 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable
            onPress={back}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.2)',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255,255,255,0.1)',
            }}
          >
            <Text style={{ color: 'white', fontSize: 24 }}>←</Text>
          </Pressable>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>Profile Setup</Text>
        </View>
        <ProfileProgressRing progress={progress} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            paddingVertical: 24,
            paddingHorizontal: 20,
            backgroundColor: 'white',
            borderRadius: 32,
            minHeight: 400,
          }}
        >
          {stepKey === 'intro' && (
            <>
              <Text style={{ fontSize: 26, fontWeight: '900', marginTop: 18, color: '#6a5e55' }}>
                Let’s set up your profile
              </Text>
              <Text style={{ opacity: 0.7, marginTop: 10, color: '#6a5e55', fontSize: 16 }}>
                This helps tailor suggestions and check-ins.
              </Text>
            </>
          )}

          {stepKey === 'name' && (
            <>
              <Text style={{ fontSize: 22, fontWeight: '900', marginTop: 18, color: '#6a5e55' }}>
                What should we call you?
              </Text>
              <Text style={{ opacity: 0.7, marginTop: 8, color: '#6a5e55' }}>
                Optional — you can skip.
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your name or nickname"
                style={{
                  marginTop: 16,
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderRadius: 16,
                  backgroundColor: '#f2f2f2',
                  fontSize: 16,
                }}
              />
            </>
          )}

          {stepKey === 'intention' && (
            <>
              <Text style={{ fontSize: 22, fontWeight: '900', marginTop: 18, color: '#6a5e55' }}>
                What do you want help with most?
              </Text>
              <Text style={{ opacity: 0.7, marginTop: 8, color: '#6a5e55' }}>Pick one.</Text>
              <Chips
                options={['Calm', 'Focus', 'Sleep', 'Stress', 'Confidence', 'Balance']}
                value={intention}
                onChange={(v) => setIntention(v as string)}
              />
            </>
          )}

          {stepKey === 'routine' && (
            <>
              <Text style={{ fontSize: 22, fontWeight: '900', marginTop: 18, color: '#6a5e55' }}>
                When do you prefer check-ins?
              </Text>
              <Text style={{ opacity: 0.7, marginTop: 8, color: '#6a5e55' }}>Pick one.</Text>
              <Chips
                options={['Morning', 'Evening', 'Anytime']}
                value={routine}
                onChange={(v) => setRoutine(v as string)}
              />
            </>
          )}

          {stepKey === 'finish' && (
            <>
              <Text style={{ fontSize: 26, fontWeight: '900', marginTop: 18, color: '#6a5e55' }}>
                You’re all set
              </Text>
              <Text style={{ opacity: 0.7, marginTop: 10, color: '#6a5e55' }}>
                Next, we’ll suggest categories based on your check-in.
              </Text>

              <View
                style={{
                  marginTop: 24,
                  backgroundColor: '#f9f9f9',
                  padding: 18,
                  borderRadius: 20,
                }}
              >
                <Text style={{ fontWeight: '900', color: '#6a5e55' }}>Name</Text>
                <Text style={{ opacity: 0.7, color: '#6a5e55' }}>{name.trim() || 'Not set'}</Text>

                <Text style={{ fontWeight: '900', marginTop: 12, color: '#6a5e55' }}>Goal</Text>
                <Text style={{ opacity: 0.7, color: '#6a5e55' }}>{intention ?? 'Not set'}</Text>

                <Text style={{ fontWeight: '900', marginTop: 12, color: '#6a5e55' }}>Routine</Text>
                <Text style={{ opacity: 0.7, color: '#6a5e55' }}>{routine ?? 'Not set'}</Text>
              </View>
            </>
          )}
        </View>

        <View style={{ marginTop: 30 }}>
          <Pressable
            onPress={next}
            disabled={saving}
            style={{
              paddingVertical: 20,
              borderRadius: 35,
              backgroundColor: '#a07b55',
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 10,
              opacity: saving ? 0.7 : 1,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 10,
              elevation: 4,
            }}
          >
            <Text style={{ color: 'white', fontWeight: '800', fontSize: 18 }}>
              {saving ? 'Saving...' : stepKey === 'finish' ? 'Complete' : 'Next'}
            </Text>
            {!saving && <Text style={{ color: 'white', fontSize: 20 }}>→</Text>}
          </Pressable>
        </View>

        <Pressable
          onPress={() => router.replace('/(onboarding)/suggested-categories')}
          style={{ marginTop: 20 }}
        >
          <Text style={{ color: 'white', opacity: 0.65, textAlign: 'center', fontWeight: '700' }}>
            Skip setup
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
