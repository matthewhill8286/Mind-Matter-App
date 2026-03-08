import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { showAlert, withLoading } from '@/lib/state';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useProfileStore } from '@/store/useProfileStore';

export default function TrialUpgrade() {
  const { t } = useTranslation();
  const [isNewUser, setIsNewUser] = useState(true);
  const [loading, setLoading] = useState(false);
  const { assessment, fetchAssessment, updateProfile } = useProfileStore();

  useEffect(() => {
    (async () => {
      if (!assessment) {
        await fetchAssessment();
      }
      if (useProfileStore.getState().assessment) {
        setIsNewUser(false);
      }
    })();
  }, [assessment, fetchAssessment]);

  async function selectTrial() {
    await withLoading('select-trial', async () => {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);
      await updateProfile({
        subscription_type: 'trial',
        subscription_expiry: expiryDate.toISOString(),
      });
      router.push('/(auth)/payment-success');
    });
  }

  // Helper to get formatted expiry date
  const getExpiryDate = (type: 'monthly' | 'lifetime') => {
    if (type === 'lifetime') return null;
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date.toISOString();
  };

  // Function to call the backend API to create a Checkout Session
  const createCheckoutSession = async (
    mode: 'payment' | 'subscription',
    amount: number,
    name: string,
    currency: string,
  ) => {
    try {
      // Replace with your actual API URL
      const API_URL = 'http://localhost:4000';
      const successUrl = Linking.createURL('/(auth)/payment-success');
      const cancelUrl = Linking.createURL('/(auth)/payment-failure');

      const response = await fetch(`${API_URL}/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode,
          price_data: {
            unit_amount: amount,
            name: name,
          },
          currency,
          success_url: successUrl,
          cancel_url: cancelUrl,
        }),
      });

      const data = await response.json();
      if (data.url) {
        return data.url;
      } else {
        new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      showAlert(t('auth.error'), String(error));
      return null;
    }
  };

  async function buyPlan(type: 'monthly' | 'lifetime') {
    const amount = type === 'monthly' ? 1000 : 7200; // cents
    const currency = 'eur';
    const name = type === 'monthly' ? t('auth.monthlyPlan') : t('auth.lifetimePlan');
    const mode = type === 'monthly' ? 'subscription' : 'payment';

    setLoading(true);

    const checkoutUrl = await createCheckoutSession(mode, amount, name, currency);

    if (checkoutUrl) {
      // After initiating payment, we can tentatively update the subscription if the backend handles it,
      // but usually the backend should handle it via webhooks.
      // However, for the purpose of "using gql", if we want to record the intent:
      try {
        await updateProfile({
          subscription_type: type,
          subscription_expiry: getExpiryDate(type),
        });
      } catch (e) {
        console.error('Failed to update subscription intent:', e);
      }

      setLoading(false);
      // Open the Stripe Checkout URL in the system browser
      await WebBrowser.openBrowserAsync(checkoutUrl);
    } else {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#6f6660', padding: 24, paddingTop: 60 }}>
      {loading && (
        <View
          style={{
            ...UI.absoluteFill,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 99,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" color="white" />
        </View>
      )}
      <ScrollView showsVerticalScrollIndicator={false}>
        {!isNewUser && (
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: 'rgba(255,255,255,0.1)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 10,
            }}
          >
            <Text style={{ color: 'white', fontSize: 24 }}>←</Text>
          </Pressable>
        )}
        <Text style={{ color: 'white', fontSize: 32, fontWeight: '900', textAlign: 'center' }}>
          {t('auth.premiumTitle')}
        </Text>
        <Text
          style={{ color: 'white', opacity: 0.8, fontSize: 16, textAlign: 'center', marginTop: 12 }}
        >
          {t('auth.premiumSubtitle')}
        </Text>

        <View style={{ marginTop: 40, gap: 20 }}>
          <Pressable
            onPress={selectTrial}
            disabled={loading}
            style={{
              backgroundColor: 'white',
              borderRadius: 24,
              padding: 24,
              opacity: loading ? 0.7 : 1,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: '900', color: '#6a5e55' }}>
              {t('auth.start7DayTrial')}
            </Text>
            <Text style={{ marginTop: 8, color: '#6a5e55', opacity: 0.7 }}>
              {t('auth.sevenDayTrialDesc')}
            </Text>
            <View
              style={{
                marginTop: 20,
                backgroundColor: '#828a6a',
                padding: 14,
                borderRadius: 16,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontWeight: '900' }}>
                {loading ? t('auth.starting') : t('auth.startFreeTrialBtn')}
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => buyPlan('monthly')}
            disabled={loading}
            style={{
              backgroundColor: '#828a6a',
              borderRadius: 24,
              padding: 24,
              borderWidth: 2,
              borderColor: 'white',
              opacity: loading ? 0.7 : 1,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: '900', color: 'white' }}>
                {t('auth.monthlyPlan')}
              </Text>
              <Text style={{ fontSize: 18, fontWeight: '900', color: 'white' }}>
                {t('auth.monthlyPlanPrice')}
              </Text>
            </View>
            <Text style={{ marginTop: 8, color: 'white', opacity: 0.9 }}>
              {t('auth.monthlyPlanDesc')}
            </Text>
            <View
              style={{
                marginTop: 20,
                backgroundColor: 'white',
                padding: 14,
                borderRadius: 16,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Text style={{ color: '#828a6a', fontWeight: '900' }}>{t('auth.payWithCard')}</Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => buyPlan('lifetime')}
            disabled={loading}
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 24,
              padding: 24,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.2)',
              opacity: loading ? 0.7 : 1,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>
                {t('auth.lifetimePlan')}
              </Text>
              <Text style={{ fontWeight: '900', fontSize: 16, color: 'white' }}>
                {t('auth.lifetimePlanPrice')}
              </Text>
            </View>
            <Text style={{ marginTop: 8, color: 'white', opacity: 0.7 }}>
              {t('auth.lifetimePlanDesc')}
            </Text>
          </Pressable>
        </View>

        <Text
          style={{
            color: 'white',
            opacity: 0.5,
            fontSize: 12,
            textAlign: 'center',
            marginTop: 30,
            paddingHorizontal: 20,
          }}
        >
          {t('auth.termsAndPrivacy')}
        </Text>
      </ScrollView>
    </View>
  );
}

const UI = {
  absoluteFill: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
};
