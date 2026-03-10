import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WelcomeComp from '@/components/Welcome';

export default function Welcome() {
  const { t } = useTranslation();
  const router = useRouter();
  const [slideIndex, setSlideIndex] = useState(0);

  const SLIDES = [
    {
      step: t('welcome.slides.0.step'),
      title: t('welcome.slides.0.title'),
      text: t('welcome.slides.0.text'),
    },
    {
      step: t('welcome.slides.1.step'),
      title: t('welcome.slides.1.title'),
      text: t('welcome.slides.1.text'),
    },
    {
      step: t('welcome.slides.2.step'),
      title: t('welcome.slides.2.title'),
      text: t('welcome.slides.2.text'),
    },
    {
      step: t('welcome.slides.3.step'),
      title: t('welcome.slides.3.title'),
      text: t('welcome.slides.3.text'),
    },
    {
      step: t('welcome.slides.4.step'),
      title: t('welcome.slides.4.title'),
      text: t('welcome.slides.4.text'),
    },
    {
      step: t('welcome.slides.5.step'),
      title: t('welcome.slides.5.title'),
      text: t('welcome.slides.5.text'),
    },
  ];

  const ILLUSTRATIONS = [
    require('@/assets/images/1.png'),
    require('@/assets/images/2.png'),
    require('@/assets/images/3.png'),
    require('@/assets/images/4.png'),
    require('@/assets/images/5.png'),
    require('@/assets/images/6.png'),
  ];

  const handleNext = async () => {
    if (slideIndex < SLIDES.length - 1) {
      setSlideIndex(slideIndex + 1);
    } else {
      await AsyncStorage.setItem('onboarding:seen:v1', 'true');
      router.replace('/(auth)/sign-up');
    }
  };

  const handleBack = () => {
    if (slideIndex > 0) {
      setSlideIndex(slideIndex - 1);
    }
  };

  return (
    <WelcomeComp
      slideIndex={slideIndex}
      slides={SLIDES}
      illustration={ILLUSTRATIONS[slideIndex]}
      onNext={handleNext}
      onBack={slideIndex > 0 ? handleBack : undefined}
    />
  );
}
