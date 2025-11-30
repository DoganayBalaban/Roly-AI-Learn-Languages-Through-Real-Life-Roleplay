import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

// Dil dosyalarını import et
import en from "./locales/en.json";
import tr from "./locales/tr.json";

const resources = {
  en: { translation: en },
  tr: { translation: tr },
};

// Cihazın dilini al (tr-TR, en-US vb. döner, biz ilk iki harfi alacağız)
const deviceLanguage = Localization.getLocales()[0]?.languageCode;

i18n.use(initReactI18next).init({
  resources,
  // MANTIK: Cihaz dili 'tr' ise Türkçe, yoksa İngilizce
  lng: deviceLanguage === "tr" ? "tr" : "en",
  fallbackLng: "en", // Eğer çeviri bulunamazsa İngilizce göster
  interpolation: {
    escapeValue: false, // React zaten XSS koruması yapıyor
  },
});

export default i18n;
