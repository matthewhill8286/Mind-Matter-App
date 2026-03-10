import React, { useState } from 'react';
import { stressHistoryStore } from '@/store/stressHistoryStore';
import { Alert, Platform, View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenHeader from '@/components/ScreenHeader';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, UI } from '@/constants/theme';

export default function Grounding() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  const [sights, setSights] = useState<string[]>(['', '', '', '', '']);
  const [touch, setTouch] = useState<string[]>(['', '', '', '']);
  const [sounds, setSounds] = useState<string[]>(['', '', '']);
  const [smells, setSmells] = useState<string[]>(['', '']);
  const [taste, setTaste] = useState<string>('');

  async function done() {
    await stressHistoryStore
      .getState()
      .addStressCompletion('grounding-54321', t('grounding.title'));
    Alert.alert(t('common.niceWork'), t('common.groundingSuccess'));
    router.back();
  }

  const inputStyle = {
    padding: 12,
    borderRadius: UI.radius.md,
    backgroundColor: colors.inputBg,
    color: colors.text,
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
      <ScreenHeader title={t('grounding.title')} subtitle={t('grounding.subtitle')} showBack />
      <ScrollView style={{ flex: 1, marginTop: 14 }} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ backgroundColor: colors.card, borderRadius: UI.radius.lg, padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '900', color: colors.text }}>
            {t('grounding.howItWorks')}
          </Text>
          <Text style={{ color: colors.mutedText, marginTop: 6 }}>
            {t('grounding.description')}
          </Text>
        </View>

        <Block title={t('grounding.see')}>
          {sights.map((v, i) => (
            <TextInput
              key={`see-${i}`}
              value={v}
              onChangeText={(tVal) => setSights((p) => p.map((x, idx) => (idx === i ? tVal : x)))}
              placeholder={t('grounding.seePlaceholder', { count: i + 1 })}
              placeholderTextColor={colors.placeholder}
              style={inputStyle}
            />
          ))}
        </Block>

        <Block title={t('grounding.feel')}>
          {touch.map((v, i) => (
            <TextInput
              key={`feel-${i}`}
              value={v}
              onChangeText={(tVal) => setTouch((p) => p.map((x, idx) => (idx === i ? tVal : x)))}
              placeholder={t('grounding.feelPlaceholder', { count: i + 1 })}
              placeholderTextColor={colors.placeholder}
              style={inputStyle}
            />
          ))}
        </Block>

        <Block title={t('grounding.hear')}>
          {sounds.map((v, i) => (
            <TextInput
              key={`hear-${i}`}
              value={v}
              onChangeText={(tVal) => setSounds((p) => p.map((x, idx) => (idx === i ? tVal : x)))}
              placeholder={t('grounding.hearPlaceholder', { count: i + 1 })}
              placeholderTextColor={colors.placeholder}
              style={inputStyle}
            />
          ))}
        </Block>

        <Block title={t('grounding.smell')}>
          {smells.map((v, i) => (
            <TextInput
              key={`smell-${i}`}
              value={v}
              onChangeText={(tVal) => setSmells((p) => p.map((x, idx) => (idx === i ? tVal : x)))}
              placeholder={t('grounding.smellPlaceholder', { count: i + 1 })}
              placeholderTextColor={colors.placeholder}
              style={inputStyle}
            />
          ))}
        </Block>

        <Block title={t('grounding.taste')}>
          <TextInput
            value={taste}
            onChangeText={setTaste}
            placeholder={t('grounding.tastePlaceholder')}
            placeholderTextColor={colors.placeholder}
            style={inputStyle}
          />
        </Block>

        <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
          <Pressable
            onPress={done}
            style={{
              flex: 1,
              backgroundColor: colors.primary,
              padding: 16,
              borderRadius: UI.radius.lg,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.onPrimary, fontWeight: '900' }}>{t('common.finish')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: UI.radius.lg,
        padding: 14,
        marginTop: 12,
      }}
    >
      <Text style={{ fontWeight: '900', color: colors.text }}>{title}</Text>
      <View style={{ marginTop: 10, gap: 10 }}>{children}</View>
    </View>
  );
}
