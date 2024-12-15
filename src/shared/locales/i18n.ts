import en from "./languages/en.json";
import ru from "./languages/ru.json";
import ch from "./languages/ch.json";
import kr from "./languages/kr.json";
import vi from "./languages/vi.json";
import de from "./languages/de.json";
import hi from "./languages/hi.json";
import es from "./languages/es.json";
import ja from "./languages/ja.json";
import fr from "./languages/fr.json";
import i18n from "i18next";

export const defaultNS = "  ";

export const resources = {
  en: {
    translation: en,
  },
  ru: {
    translation: ru,
  },
  ch: {
    translation: ch,
  },
  kr: {
    translation: kr,
  },
  vi: {
    translation: vi,
  },
  de: {
    translation: de,
  },
  hi: {
    translation: hi,
  },
  es: {
    translation: es,
  },
  ja: {
    translation: ja,
  },
  fr: {
    translation: fr,
  },
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
i18n
  // .use(reactI18nextModule)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
  });

export const isRTL = false;

export function getLanguages() {
  return {
    de: "Deutsch",
    el: "Greek",
    en: "English",
    es: "Español",
    fr: "Français",
    hi: "हिन्दी",
    id: "Bahasa Indonesian",
    ja: "日本語",
    ko: "Korean",
    pt: "Portuguese - Brazil",
    ru: "Russian",
    tl: "Filipino",
    tr: "Turkish",
    vi: "Tiếng Việt",
    zh: "Chinese - China",
  };
}

// Allow RTL alignment in RTL languages
export default i18n;
