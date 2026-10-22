// FILE_ENTRY: js/locale.js
/**
 * ロケール状態 Single Source of Truth (SSOT)
 * 辞書データを一切保持せず、現在言語の状態管理および切り替えのみを厳格に担う。
 */
const SUPPORTED_LANGS = Object.freeze(['ja', 'en', 'es']);
const STORAGE_KEY = 'camino_de_leyenda_lang';

export class LocaleManager {
  constructor() {
    this.langs = SUPPORTED_LANGS;
    this._currentLang = null;

    let saved = null;
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        saved = window.localStorage.getItem(STORAGE_KEY);
      } catch (e) {
        // localStorageアクセス不可環境
      }
    }

    if (saved !== null && saved !== undefined && saved !== '') {
      if (!SUPPORTED_LANGS.includes(saved)) {
        throw new Error(`[LocaleError] 保存された言語コードが無効です (値: "${saved}", 許容: ${SUPPORTED_LANGS.join(', ')})`);
      }
      this._currentLang = saved;
    } else {
      // 初回起動時の決定論的初期化
      this._currentLang = 'ja';
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.setItem(STORAGE_KEY, 'ja');
        } catch (e) {}
      }
    }
  }

  getLanguage() {
    if (!this._currentLang || !SUPPORTED_LANGS.includes(this._currentLang)) {
      throw new Error(`[LocaleError] getLanguage: 現在の言語状態が不正です (値: "${this._currentLang}")`);
    }
    return this._currentLang;
  }

  setLanguage(lang) {
    if (typeof lang !== 'string' || !SUPPORTED_LANGS.includes(lang)) {
      throw new Error(`[LocaleError] setLanguage: 不正な言語コードです (値: "${lang}", 型: ${typeof lang}, 許容: ${SUPPORTED_LANGS.join(', ')})`);
    }
    this._currentLang = lang;
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEY, lang);
      } catch (e) {
        console.warn('localStorageへの言語保存に失敗しました:', e);
      }
    }
  }

  toggleLang() {
    const current = this.getLanguage();
    const idx = SUPPORTED_LANGS.indexOf(current);
    const nextLang = SUPPORTED_LANGS[(idx + 1) % SUPPORTED_LANGS.length];
    this.setLanguage(nextLang);
    return nextLang;
  }
}

export const locale = new LocaleManager();

if (typeof window !== 'undefined') {
  window.locale = locale;
}
