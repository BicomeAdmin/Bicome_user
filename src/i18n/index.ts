
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import messages from './local/index';

// 防止與第三方插件的 i18next 實例衝突
const createI18nInstance = () => {
  const instance = i18n.createInstance();
  
  instance
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      lng: 'zh-TW',
      fallbackLng: 'en',
      debug: false,
      resources: messages,
      interpolation: {
        escapeValue: false,
      },
      // 使用獨立的命名空間避免衝突
      ns: ['common'],
      defaultNS: 'common',
      // 防止與其他 i18next 實例衝突
      initImmediate: false,
    });
    
  return instance;
};

const appI18n = createI18nInstance();

export default appI18n;
