import i18n, { use } from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from './locales/en/translation';
import el from './locales/el/translation';

const resources = {
  en: { translation: en },
  el: { translation: el },
};

const getLocale = () => {
  const locale = Localization.getLocales()[0]?.languageCode || 'en';
  return resources[locale as keyof typeof resources] ? locale : 'en';
};

(async () => {
  await use(initReactI18next).init({
    resources,
    lng: getLocale(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });
})();

export default i18n;
