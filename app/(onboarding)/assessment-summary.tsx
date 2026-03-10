import React, { useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import ScoreCard from '@/components/ScoreCard';
import { profileStore } from '@/store/profileStore';

export default function AssessmentSummary() {
  const { assessment: a, fetchAssessment } = profileStore();

  useEffect(() => {
    if (!a) {
      fetchAssessment();
    }
  }, [a, fetchAssessment]);

  const sleep = typeof a?.sleep_quality === 'number' ? a.sleep_quality : null;
  const stress = typeof a?.stress_level === 'number' ? a.stress_level : null;

  return (
    <View style={{ flex: 1, backgroundColor: '#6f6660', padding: 24, paddingTop: 60 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 20,
          gap: 12,
        }}
      >
        <Pressable
          onPress={() => router.back()}
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
        <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>Summary</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={{ backgroundColor: 'white', borderRadius: 32, padding: 26, minHeight: 400 }}>
          <Text style={{ fontSize: 26, fontWeight: '900', color: '#6a5e55' }}>
            Assessment Summary
          </Text>
          <Text style={{ opacity: 0.7, marginTop: 8, color: '#6a5e55', fontSize: 16 }}>
            Here’s what we’ve gathered so far.
          </Text>

          <View style={{ marginTop: 24, gap: 16 }}>
            <View
              style={{
                backgroundColor: '#f9f9f9',
                padding: 16,
                borderRadius: 24,
              }}
            >
              <Text style={{ fontWeight: '900', color: '#6a5e55' }}>Goal</Text>
              <Text style={{ opacity: 0.7, color: '#6a5e55', marginTop: 4, fontSize: 16 }}>
                {a?.goal ?? '—'}
              </Text>
            </View>

            <View
              style={{
                backgroundColor: '#f9f9f9',
                padding: 16,
                borderRadius: 24,
              }}
            >
              <Text style={{ fontWeight: '900', color: '#6a5e55' }}>Current Mood</Text>
              <Text style={{ opacity: 0.7, color: '#6a5e55', marginTop: 4, fontSize: 16 }}>
                {a?.mood ?? '—'}
              </Text>
            </View>

            {sleep !== null && (
              <ScoreCard
                score={sleep}
                title="Sleep Quality"
                subtitle="Based on your 1-5 rating."
                bg="#9b8df1"
              />
            )}

            {stress !== null && (
              <ScoreCard
                score={stress}
                title="Stress Level"
                subtitle="Based on your 0-10 rating."
                bg="#f2a65a"
              />
            )}

            {a?.sound_check &&
            typeof a.sound_check === 'object' &&
            'metrics' in a.sound_check &&
            (a.sound_check as any).metrics ? (
              <View
                style={{
                  marginTop: 8,
                  padding: 16,
                  backgroundColor: '#f9f9f9',
                  borderRadius: 24,
                }}
              >
                <Text style={{ fontWeight: '900', color: '#6a5e55' }}>Voice Analysis</Text>
                <Text style={{ opacity: 0.7, color: '#6a5e55', fontSize: 14, marginTop: 4 }}>
                  {(a.sound_check as any).metrics.wpm} words per minute detected.
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={{ marginTop: 30 }}>
          <Pressable
            onPress={() => router.replace('/(onboarding)/profile-setup')}
            style={{
              paddingVertical: 20,
              borderRadius: 35,
              backgroundColor: '#a07b55',
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 10,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 10,
              elevation: 4,
            }}
          >
            <Text style={{ color: 'white', fontWeight: '800', fontSize: 18 }}>Continue</Text>
            <Text style={{ color: 'white', fontSize: 20 }}>→</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
