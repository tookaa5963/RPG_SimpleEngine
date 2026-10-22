// FILE_ENTRY: js/logFormatter.js
import { locale } from './locale.js';

export class LogFormatter {
  constructor() {
    this.domains = new Map();
  }

  registerDomain(domain, data) {
    if (typeof domain !== 'string' || !domain) {
      throw new Error(`[LogFormatterError] registerDomain: ドメイン名が不正です (値: "${domain}")`);
    }
    if (!data || typeof data !== 'object') {
      throw new Error(`[LogFormatterError] registerDomain: ドメイン "${domain}" のデータが不正です`);
    }
    this.domains.set(domain, data);
  }

  getLanguage() {
    return locale.getLanguage();
  }

  setLanguage(lang) {
    locale.setLanguage(lang);
  }

  format(key, params = {}) {
    if (typeof key !== 'string' || !key.includes('.')) {
      throw new Error(`[LogFormatterError] format: キーの形式が不正です (期待形式: "domain.key", 受信値: "${key}")`);
    }

    const dotIndex = key.indexOf('.');
    const domain = key.substring(0, dotIndex);
    const subKey = key.substring(dotIndex + 1);

    if (!this.domains.has(domain)) {
      throw new Error(`[LogFormatterError] format: ドメイン "${domain}" が登録されていません (対象キー: "${key}")`);
    }

    const domainData = this.domains.get(domain);
    if (!domainData[subKey]) {
      throw new Error(`[LogFormatterError] format: キー "${subKey}" はドメイン "${domain}" に存在しません (対象キー: "${key}")`);
    }

    const lang = this.getLanguage();
    const langTemplates = domainData[subKey];
    if (typeof langTemplates !== 'object' || langTemplates === null) {
      throw new Error(`[LogFormatterError] format: キー "${key}" の言語定義オブジェクトが不正です`);
    }

    const template = langTemplates[lang];
    if (typeof template !== 'string') {
      throw new Error(`[LogFormatterError] format: キー "${key}" に言語 "${lang}" のテンプレートが存在しません (フォールバック禁止)`);
    }

    if (params === null || typeof params !== 'object') {
      throw new Error(`[LogFormatterError] format: 引数 params がオブジェクトではありません (キー: "${key}", 値: ${params})`);
    }

    const placeholderMatches = template.match(/\{([a-zA-Z0-9_]+)\}/g) || [];
    const expectedKeys = new Set(placeholderMatches.map(m => m.slice(1, -1)));

    for (const expectedKey of expectedKeys) {
      if (!(expectedKey in params) || params[expectedKey] === undefined || params[expectedKey] === null) {
        throw new Error(`[LogFormatterError] format: 必須プレースホルダー "${expectedKey}" が未指定または不正です (キー: "${key}")`);
      }
    }

    for (const paramKey of Object.keys(params)) {
      if (!expectedKeys.has(paramKey)) {
        throw new Error(`[LogFormatterError] format: 未定義の余剰パラメータ "${paramKey}" が渡されました (キー: "${key}")`);
      }
    }

    return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, k) => String(params[k]));
  }
}

export const logFormatter = new LogFormatter();

if (typeof window !== 'undefined') {
  window.logFormatter = logFormatter;
}

export async function initLogData() {
  try {
    const res = await fetch('data/logs/player.json');
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    const data = await res.json();
    logFormatter.registerDomain('player', data);
    console.log("logFormatter: player domain loaded.");
  } catch (error) {
    console.error("Failed to fetch log data (player):", error);
  }

  try {
    const res = await fetch('data/logs/menu_action.json');
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    const data = await res.json();
    logFormatter.registerDomain('menu_action', data);
    console.log("logFormatter: menu_action domain loaded.");
  } catch (error) {
    console.error("Failed to fetch log data (menu_action):", error);
  }
}
