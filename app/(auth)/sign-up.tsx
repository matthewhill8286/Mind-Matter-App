import React, { useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';

export default function SignUp() {
  const { t } = useTranslation();
  const { signUpWithEmail, submitting, error: authError, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  async function onCreate() {
    if (!email || !pass) {
      setLocalError(t('auth.emailPasswordRequired'));
      return;
    }
    clearError();
    setLocalError(null);
    const error = await signUpWithEmail(email, pass);
    if (!error) {
      // Check if session was created (email confirmation may be required)
      const { session } = useAuthStore.getState();
      if (!session) {
        setLocalError(t('auth.checkEmailForConfirmation'));
        return;
      }
      router.replace('/(auth)/trial-upgrade');
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#6f6660', padding: 24, justifyContent: 'center' }}>
      <View style={{ backgroundColor: 'white', borderRadius: 28, padding: 26 }}>
        <Text style={{ fontSize: 26, fontWeight: '900' }}>{t('auth.signUp')}</Text>
        {(authError || localError) && <Text style={{ color: 'red', marginTop: 12, fontWeight: '600' }}>{authError || localError}</Text>}
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
          placeholder={t('auth.createPasswordPlaceholder')}
          style={input}
          secureTextEntry
        />
        <Pressable
          onPress={onCreate}
          style={[primaryBtn, submitting && { opacity: 0.7 }]}
          disabled={submitting}
        >
          <Text style={primaryBtnText}>
            {submitting ? t('auth.creatingAccount') : t('auth.createAccountBtn')}
          </Text>
        </Pressable>
        <Pressable onPress={() => router.navigate('/(auth)/sign-in')} style={{ marginTop: 12 }}>
          <Text style={{ textAlign: 'center', fontWeight: '800', opacity: 0.75 }}>
            {t('auth.backToSignIn')}
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
