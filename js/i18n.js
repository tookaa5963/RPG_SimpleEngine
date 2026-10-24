import { locale } from './locale.js';

export const I18N_DICT = {
  "ja": {
  },
  "en": {
  },
  "es": {
  }
};

class I18nManager {
  constructor() {
    this.localeData = {
      ja: {},
      en: {},
      es: {}
    };
    this.isLoaded = false;
  }

  get currentLang() {
    return locale.getLanguage();
  }

  set currentLang(lang) {
    locale.setLanguage(lang);
  }

  get langs() {
    return locale.langs;
  }

  toggleLang() {
    return locale.toggleLang();
  }

  async loadLocales() {
    const langs = ['ja', 'en', 'es'];
    const loadPromises = langs.map(async (lang) => {
      const response = await fetch(`data/locales/${lang}.json`);
      if (!response.ok) {
        throw new Error(`[DataValidationError] Failed to load locale file: data/locales/${lang}.json (HTTP ${response.status})`);
      }
      const json = await response.json();
      if (!json || typeof json !== 'object') {
        throw new Error(`[DataValidationError] Invalid JSON format in data/locales/${lang}.json`);
      }
      this.localeData[lang] = json;
    });

    await Promise.all(loadPromises);
    this.isLoaded = true;
    console.log('[i18n] Locales loaded successfully:', Object.keys(this.localeData));
  }

  resolve(textObj) {
    if (!textObj || typeof textObj !== 'object') {
      throw new Error(`[DataValidationError] i18n.js:resolve: \u7ffb\u8bad\u30aa\u30d6\u30b8\u30a7\u30af\u30c8\u304c\u4e0d\u6b63\u3067\u3059 (\u5024: ${textObj}, \u578b: ${typeof textObj})`);
    }
    const val = textObj[this.currentLang];
    if (val === undefined) {
      throw new Error(`[DataValidationError] i18n.js:resolve: \u8a00\u8a9e "${this.currentLang}" \u306b\u5bfe\u5fdc\u3059\u308b\u30c6\u30ad\u30b9\u30c8\u304c\u3042\u308a\u307e\u305b\u3093\u3002`);
    }
    return val;
  }

  t(keyPath, params = {}) {
    const keys = keyPath.split('.');

    // 1. \u5916\u90e8\u30ed\u30fc\u30c9\u3055\u308c\u305f\u30ed\u30b1\u30fc\u30eb\u30c7\u30fc\u30bf\u304b\u3089\u512a\u5148\u63a2\u7d22
    let result = this.localeData[this.currentLang];
    let foundInExternal = true;
    for (const k of keys) {
      if (result === undefined || result === null || result[k] === undefined) {
        foundInExternal = false;
        break;
      }
      result = result[k];
    }

    // 2. \u5916\u90e8\u30c7\u30fc\u30bf\u306b\u5b58\u5728\u3057\u306a\u3044\u5834\u5408\u3001\u6b8b\u5b58 I18N_DICT \u304b\u3089\u63a2\u7d22 (\u6bb5\u968e\u79fb\u884c\u7528)
    if (!foundInExternal) {
      result = I18N_DICT[this.currentLang];
      for (const k of keys) {
        if (result === undefined || result === null) {
          throw new Error(`[DataValidationError] i18n.js:t: \u8f9e\u66f8\u306b\u5b58\u5728\u3057\u306a\u3044\u30ad\u30fc\u304c\u53c2\u7167\u3055\u308c\u307e\u3057\u305f (\u30ad\u30fc: "${keyPath}", lang: "${this.currentLang}")`);
        }
        result = result[k];
      }
    }

    if (typeof result !== 'string') {
      throw new Error(`[DataValidationError] i18n.js:t: \u53c2\u7167\u3055\u308c\u307f\u30ad\u30fc\u306e\u5024\u304c\u6587\u5b57\u5217\u3067\u306f\u3042\u308a\u307e\u305b\u3093 (\u30ad\u30fc: "${keyPath}", \u5024: ${result}, \u578b: ${typeof result})`);
    }

    Object.keys(params).forEach(p => {
      result = result.replace(new RegExp(`\\{${p}\\}`, 'g'), params[p]);
    });
    return result;
  }

  tArray(keyPath, params = {}) {
    const keys = keyPath.split('.');

    // 1. \u5916\u90e8\u30ed\u30fc\u30c9\u3055\u308c\u305f\u30ed\u30b1\u30fc\u30eb\u30c7\u30fc\u30bf\u304b\u3089\u512a\u5148\u63a2\u7d22
    let result = this.localeData[this.currentLang];
    let foundInExternal = true;
    for (const k of keys) {
      if (result === undefined || result === null || result[k] === undefined) {
        foundInExternal = false;
        break;
      }
      result = result[k];
    }

    // 2. \u5916\u90e8\u30c7\u30fc\u30bf\u306b\u5b58\u5728\u3057\u306a\u3044\u5834\u5408\u3001\u6b8b\u5b58 I18N_DICT \u304b\u3089\u63a2\u7d22 (\u6bb5\u968e\u79fb\u884c\u7528)
    if (!foundInExternal) {
      result = I18N_DICT[this.currentLang];
      for (const k of keys) {
        if (result === undefined || result === null) {
          throw new Error(`[DataValidationError] i18n.js:tArray: \u8f9e\u66f8\u306b\u5b58\u5728\u3057\u306a\u3044\u30ad\u30fc\u304c\u53c2\u7167\u3055\u308c\u307e\u3057\u305f (\u30ad\u30fc: "${keyPath}", lang: "${this.currentLang}")`);
        }
        result = result[k];
      }
    }

    if (!Array.isArray(result)) {
      throw new Error(`[DataValidationError] i18n.js:tArray: \u53c2\u7167\u3055\u308c\u305f\u30ad\u30fc\u306e\u5024\u304c\u914d\u5217\u3067\u306f\u3042\u308a\u307e\u305b\u3093 (\u30ad\u30fc: "${keyPath}", \u5024: ${result}, \u578b: ${typeof result})`);
    }

    return result.map(text => {
      let s = text;
      Object.keys(params).forEach(p => {
        s = s.replace(new RegExp(`\\{${p}\\}`, 'g'), params[p]);
      });
      return s;
    });
  }
}

export const i18n = new I18nManager();

export async function initLocaleData() {
  await i18n.loadLocales();
}

if (typeof window !== 'undefined') {
  window.i18n = i18n;
}
