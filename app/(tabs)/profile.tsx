import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Platform } from 'react-native';
import ScreenHeader from '@/components/ScreenHeader';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSubscription } from '@/hooks/useSubscription';
import { profileStore } from '@/store/profileStore';
import { Colors, UI } from '@/constants/theme';
import { IconSymbol } from '@/components/icon-symbol';
import { SkeletonRect } from '@/components/Skeleton';
import { useTranslation } from 'react-i18next';
import { authStore } from '@/store/authStore';

import { moodStore } from '@/store/moodStore';
import { journalStore } from '@/store/journalStore';
import { sleepStore } from '@/store/sleepStore';
import { mindfulnessStore } from '@/store/mindfulnessStore';
import { stressHistoryStore } from '@/store/stressHistoryStore';
import { stressStore } from '@/store/stressStore';
import { chatStore } from '@/store/chatStore';
import { ActionCard } from '@/components/ActionCard';

export default function Profile() {
  const { t } = useTranslation();
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const { profile, fetchProfile } = profileStore();
  const { user, signOut: authSignOut } = authStore();
  const [loading, setLoading] = useState(true);
  const { subscription, isExpired, isLifetime } = useSubscription();

  const email = user?.email ?? null;

  useEffect(() => {
    (async () => {
      await fetchProfile();
      setLoading(false);
    })();
  }, [fetchProfile]);

  async function handleSignOut() {
    profileStore.getState().clearProfile();
    moodStore.getState().clearMood();
    journalStore.getState().clearJournal();
    sleepStore.getState().clearSleep();
    mindfulnessStore.getState().clearMindfulness();
    stressHistoryStore.getState().clearStressHistory();
    stressStore.getState().clearStress();
    chatStore.getState().clearAllChat();
    await authSignOut();
  }

  const btnStyle = {
    marginTop: 12,
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: UI.radius.lg,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  };

  const subTypeLabel = isLifetime
    ? t('common.lifetimeAccess')
    : subscription?.type === 'monthly'
      ? t('common.monthlyAccess')
      : isExpired
        ? t('common.trialExpired')
        : t('common.freeTrial');

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: UI.spacing.xl,
        paddingTop: Platform.OS === 'ios' ? 18 : 8,
      }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title={t('common.profile')}
          subtitle={email ? t('common.signedInAs', { email }) : t('common.notSignedIn')}
        />

        {loading ? (
          <View style={{ gap: 14 }}>
            <SkeletonRect height={140} borderRadius={UI.radius.xl} />
            <SkeletonRect height={24} width={120} style={{ marginTop: 24 }} />
            <SkeletonRect height={80} borderRadius={UI.radius.xl} />
            <SkeletonRect height={24} width={120} style={{ marginTop: 24 }} />
            <SkeletonRect height={50} borderRadius={UI.radius.lg} />
            <SkeletonRect height={50} borderRadius={UI.radius.lg} />
            <SkeletonRect height={50} borderRadius={UI.radius.lg} />
          </View>
        ) : (
          <>
            <ActionCard
              title={profile?.name || t('common.yourProfile')}
              icon="person"
              style={{ marginTop: 14 }}
            >
              <View
                style={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                }}
              >
                <Pressable
                  onPress={() => router.push('/(tabs)/profile-edit')}
                  style={{
                    backgroundColor: '#828a6a',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 12,
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '700', fontSize: 12 }}>
                    {t('common.edit')}
                  </Text>
                </Pressable>
              </View>

              <View style={{ marginTop: 16, gap: 12 }}>
                <View>
                  <Text
                    style={{
                      color: colors.mutedText,
                      fontSize: 12,
                      fontWeight: '800',
                      textTransform: 'uppercase',
                    }}
                  >
                    {t('common.primaryGoal')}
                  </Text>
                  <Text
                    style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 2 }}
                  >
                    {profile?.intention || t('common.notSet')}
                  </Text>
                </View>
                <View>
                  <Text
                    style={{
                      color: colors.mutedText,
                      fontSize: 12,
                      fontWeight: '800',
                      textTransform: 'uppercase',
                    }}
                  >
                    {t('common.checkInRoutine')}
                  </Text>
                  <Text
                    style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 2 }}
                  >
                    {profile?.routine || t('common.notSet')}
                  </Text>
                </View>
              </View>
            </ActionCard>

            <Text style={{ marginTop: 24, fontSize: 16, fontWeight: '900', color: colors.text }}>
              {t('common.subscription')}
            </Text>

            <ActionCard title={subTypeLabel} icon="card-membership" style={{ marginTop: 14 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <View style={{ flex: 1 }}>
                  {subscription?.expiryDate && !isLifetime && (
                    <Text style={{ color: colors.mutedText, fontSize: 13, marginTop: 4 }}>
                      {isExpired
                        ? t('common.expiredOn', {
                            date: new Date(subscription.expiryDate).toLocaleDateString(),
                          })
                        : t('common.renewsOn', {
                            date: new Date(subscription.expiryDate).toLocaleDateString(),
                          })}
                    </Text>
                  )}
                </View>
                {!isLifetime && (
                  <Pressable
                    onPress={() => router.push('/(auth)/trial-upgrade')}
                    style={{
                      backgroundColor: colors.primary,
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: UI.radius.md,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <IconSymbol name="bolt.fill" size={16} color={colors.onPrimary} />
                    <Text style={{ color: colors.onPrimary, fontWeight: '900' }}>
                      {t('common.upgrade')}
                    </Text>
                  </Pressable>
                )}
              </View>
            </ActionCard>

            <Text style={{ marginTop: 24, fontSize: 16, fontWeight: '900', color: colors.text }}>
              {t('common.appSettings')}
            </Text>

            <Pressable onPress={() => router.push('/(tabs)/notifications')} style={btnStyle}>
              <Text style={{ fontWeight: '800', color: colors.text }}>
                {t('common.notifications')}
              </Text>
              <Text style={{ color: colors.primary, fontWeight: '900' }}>→</Text>
            </Pressable>

            <Pressable onPress={() => router.push('/(tabs)/settings')} style={btnStyle}>
              <Text style={{ fontWeight: '800', color: colors.text }}>
                {t('common.manageCategories')}
              </Text>
              <Text style={{ color: colors.primary, fontWeight: '900' }}>→</Text>
            </Pressable>

            <Pressable onPress={() => router.push('/(utils)/help-center')} style={btnStyle}>
              <Text style={{ fontWeight: '800', color: colors.text }}>
                {t('common.helpCenter')}
              </Text>
              <Text style={{ color: colors.primary, fontWeight: '900' }}>→</Text>
            </Pressable>

            <Pressable onPress={() => router.push('/(utils)/utilities')} style={btnStyle}>
              <Text style={{ fontWeight: '800', color: colors.text }}>{t('common.utilities')}</Text>
              <Text style={{ color: colors.primary, fontWeight: '900' }}>→</Text>
            </Pressable>

            <Pressable
              onPress={handleSignOut}
              style={[
                btnStyle,
                { marginTop: 24, backgroundColor: theme === 'light' ? '#ffe8e8' : '#442222' },
              ]}
            >
              <Text style={{ fontWeight: '900', color: theme === 'light' ? '#b22' : '#f88' }}>
                {t('common.signOut')}
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}
