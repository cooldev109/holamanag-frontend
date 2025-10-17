import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';

const supportedLngs = ['en', 'es', 'de', 'pt', 'nl'] as const;
const namespaces = ['common', 'marketing', 'admin', 'superadmin'] as const;

export type SupportedLanguage = typeof supportedLngs[number];
export type Namespace = typeof namespaces[number];

i18n
  .use(
    resourcesToBackend((language: string, namespace: string) => {
      return import(`./locales/${language}/${namespace}.json`);
    })
  )
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs,
    fallbackLng: 'en',
    lng: 'en',
    
    ns: namespaces,
    defaultNS: 'common',
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['localStorage', 'querystring', 'navigator'],
      caches: ['localStorage'],
      lookupQuerystring: 'lng',
      lookupLocalStorage: 'i18nextLng',
    },

    react: {
      useSuspense: true,
    },
  });

// Update document language and direction when language changes
i18n.on('languageChanged', (lng: string) => {
  document.documentElement.lang = lng;
  document.documentElement.dir = 'ltr';
});

export { supportedLngs, namespaces };
export default i18n;