import React, { useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { authStore } from '@/store/authStore';

export default function SignIn() {
  const { t } = useTranslation();
  const { signInWithEmail, submitting, error: authError, clearError } = authStore();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');

  async function onSignIn() {
    if (!email || !pass) {
      return;
    }
    clearError();
    const error = await signInWithEmail(email, pass);
    if (!error) {
      router.replace('/(auth)/trial-upgrade');
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#6f6660', padding: 24, justifyContent: 'center' }}>
      <View style={{ backgroundColor: 'white', borderRadius: 28, padding: 26 }}>
        <Text style={{ fontSize: 26, fontWeight: '900' }}>{t('auth.signIn')}</Text>
        {authError && (
          <Text style={{ color: 'red', marginTop: 12, fontWeight: '600' }}>{authError}</Text>
        )}

        <Text style={{ marginTop: 18, fontWeight: '900' }}>{t('auth.email')}</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder={t('auth.emailPlaceholder')}
          style={input}
          autoCapitalize="none"
        />

        <Text style={{ marginTop: 14, fontWeight: '900' }}>{t('auth.password')}</Text>
        <TextInput
          value={pass}
          onChangeText={setPass}
          placeholder={t('auth.passwordPlaceholder')}
          style={input}
          secureTextEntry
        />

        <Pressable
          onPress={onSignIn}
          style={[primaryBtn, submitting && { opacity: 0.7 }]}
          disabled={submitting}
        >
          <Text style={primaryBtnText}>
            {submitting ? t('auth.signingIn') : t('auth.continue')}
          </Text>
        </Pressable>

        <Pressable onPress={() => router.push('/(auth)/sign-up')} style={{ marginTop: 12 }}>
          <Text style={{ textAlign: 'center', fontWeight: '800', opacity: 0.75 }}>
            {t('auth.createAccount')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const input = { marginTop: 8, padding: 12, borderRadius: 16, backgroundColor: '#f2f2f2' };
const primaryBtn = {
  marginTop: 18,
  backgroundColor: '#a07b55',
  padding: 16,
  borderRadius: 18,
};
const primaryBtnText = { color: 'white' };
