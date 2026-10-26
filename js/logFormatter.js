// FILE_ENTRY: js/logFormatter.js
import { locale } from './locale.js';

/**
 * プロトコル第3項準拠の高解像度例外を生成する決定論的ヘルパー
 * @param {string} type 例外種別
 * @param {string} contextId 発生箇所
 * @param {string} propName 不正を検知したプロパティ名
 * @param {*} val 実際に渡された値
 * @returns {Error}
 */
export function createProtocolError(type, contextId, propName, val) {
  return new Error(`[${type}] ${contextId}: プロパティ "${propName}" が不正です (値: ${JSON.stringify(val)}, 型: ${typeof val})`);
}

function createDomainProxy(domainName, rawData) {
  return new Proxy(rawData, {
    get(target, prop, receiver) {
      if (typeof prop === 'string') {
        if (!(prop in target)) {
          throw createProtocolError('NotFoundError', `logFormatter.js:${domainName}`, prop, undefined);
        }
      }
      return Reflect.get(target, prop, receiver);
    }
  });
}

export class LogFormatter {
  constructor() {
    this.domains = new Map();
  }

  registerDomain(domain, data) {
    if (typeof domain !== 'string') {
      throw createProtocolError('TypeError', 'logFormatter.js:registerDomain', 'domain', domain);
    }
    if (domain.trim() === '') {
      throw createProtocolError('EmptyStringError', 'logFormatter.js:registerDomain', 'domain', domain);
    }
    if (data === null) {
      throw createProtocolError('NullReferenceError', 'logFormatter.js:registerDomain', 'data', data);
    }
    if (typeof data !== 'object') {
      throw createProtocolError('TypeError', 'logFormatter.js:registerDomain', 'data', data);
    }

    const proxiedData = createDomainProxy(domain, data);
    this.domains.set(domain, proxiedData);
  }

  getLanguage() {
    return locale.getLanguage();
  }

  setLanguage(lang) {
    if (typeof lang !== 'string') {
      throw createProtocolError('TypeError', 'logFormatter.js:setLanguage', 'lang', lang);
    }
    locale.setLanguage(lang);
  }

  format(key, params = {}) {
    if (typeof key !== 'string') {
      throw createProtocolError('TypeError', 'logFormatter.js:format', 'key', key);
    }
    if (!key.includes('.')) {
      throw createProtocolError('FormatError', 'logFormatter.js:format', 'key', key);
    }

    const dotIndex = key.indexOf('.');
    const domain = key.substring(0, dotIndex);
    const subKey = key.substring(dotIndex + 1);

    if (!this.domains.has(domain)) {
      throw createProtocolError('NotFoundError', 'logFormatter.js:format', 'domain', domain);
    }

    const domainData = this.domains.get(domain);
    if (!(subKey in domainData)) {
      throw createProtocolError('NotFoundError', 'logFormatter.js:format', 'subKey', subKey);
    }

    const langTemplates = domainData[subKey];
    if (langTemplates === null) {
      throw createProtocolError('NullReferenceError', 'logFormatter.js:format', 'langTemplates', langTemplates);
    }
    if (typeof langTemplates !== 'object') {
      throw createProtocolError('TypeError', 'logFormatter.js:format', 'langTemplates', langTemplates);
    }

    const lang = this.getLanguage();
    if (!(lang in langTemplates)) {
      throw createProtocolError('NotFoundError', 'logFormatter.js:format', 'lang', lang);
    }

    const template = langTemplates[lang];
    if (typeof template !== 'string') {
      throw createProtocolError('TypeError', 'logFormatter.js:format', 'template', template);
    }

    if (params === null) {
      throw createProtocolError('NullReferenceError', 'logFormatter.js:format', 'params', params);
    }
    if (typeof params !== 'object') {
      throw createProtocolError('TypeError', 'logFormatter.js:format', 'params', params);
    }

    let placeholderMatches = template.match(/\{([a-zA-Z0-9_]+)\}/g);
    if (placeholderMatches === null) {
      placeholderMatches = [];
    }
    const expectedKeys = new Set(placeholderMatches.map(m => m.slice(1, -1)));

    for (const expectedKey of expectedKeys) {
      if (!(expectedKey in params)) {
        throw createProtocolError('MissingKeyError', 'logFormatter.js:format', expectedKey, undefined);
      }
      if (params[expectedKey] === undefined) {
        throw createProtocolError('UndefinedReferenceError', 'logFormatter.js:format', expectedKey, params[expectedKey]);
      }
      if (params[expectedKey] === null) {
        throw createProtocolError('NullReferenceError', 'logFormatter.js:format', expectedKey, params[expectedKey]);
      }
    }

    for (const paramKey of Object.keys(params)) {
      if (!expectedKeys.has(paramKey)) {
        throw createProtocolError('UnexpectedKeyError', 'logFormatter.js:format', paramKey, params[paramKey]);
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
  const logEntries = [
    { domain: 'player', path: 'data/logs/player.json' },
    { domain: 'menu_action', path: 'data/logs/menu_action.json' },
    { domain: 'battle_log', path: 'data/logs/battle_log.json' },
    { domain: 'field', path: 'data/logs/field.json' }
  ];

  for (const entry of logEntries) {
    const res = await fetch(entry.path);
    if (!res.ok) {
      throw createProtocolError('NetworkError', 'logFormatter.js:initLogData', entry.path, res.status);
    }
    const data = await res.json();
    logFormatter.registerDomain(entry.domain, data);
    console.log(`logFormatter: ${entry.domain} domain loaded.`);
  }
}
