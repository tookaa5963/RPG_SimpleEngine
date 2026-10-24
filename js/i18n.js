import { locale } from './locale.js';

export const I18N_DICT = {
  "ja": {
    "menu": {
      "spell": "呪文",
      "item": "道具",
      "equip": "装備",
      "recall": "思い出す",
      "load": "再開",
      "save": "記録",
      "quit": "終了",
      "use": "使う",
      "drop": "捨てる",
      "back": "やめる",
      "quit_confirm": "このまま 終了して\nよろしいですか？\n（セーブしていない記録は失われます）",
      "drop_confirm": "{name}を\n本当に 捨てますか？",
      "cannot_drop_equipped": "装備しているものは 捨てられない！",
      "cannot_drop_key": "それは 大切なものだ！\n捨てることなど できない！",
      "inventory_full_unequip": "持ち物がいっぱいで\n装備を 外すことができない！",
      "unequipped": "勇者は {name}を 外した！",
      "equipped": "勇者は {name}を 装備した！",
      "dropped": "{name}を 捨てた！",
      "full_hp": "しかし ＨＰは 満タンだ！",
      "full_mp": "しかし ＭＰは 満タンだ！",
      "cannot_use_here": "ここでは 使えない！",
      "no_return_point": "帰還地が 登録されていない！",
      "girl_priority": "今は 女の子を無事に 町へ送り届けるのが 先決だ！",
      "mp_shortage": "ＭＰが 足りない！"
    },
  },
  "en": {
    "menu": {
      "spell": "Spells",
      "item": "Items",
      "equip": "Equip",
      "recall": "Recall",
      "load": "Load",
      "save": "Save",
      "quit": "Quit",
      "use": "Use",
      "drop": "Drop",
      "back": "Back",
      "quit_confirm": "Are you sure you want to quit?\n(Unsaved progress will be lost)",
      "drop_confirm": "Are you sure you want\nto discard {name}?",
      "cannot_drop_equipped": "You cannot discard equipped items!",
      "cannot_drop_key": "This is an important item!\nYou cannot discard it!",
      "inventory_full_unequip": "Inventory is full!\nCannot unequip item!",
      "unequipped": "Hero unequipped {name}!",
      "equipped": "Hero equipped {name}!",
      "dropped": "Hero discarded {name}!",
      "full_hp": "HP is already full!",
      "full_mp": "MP is already full!",
      "cannot_use_here": "Cannot use that here!",
      "no_return_point": "No return point registered!",
      "girl_priority": "You must escort the girl safely back to town first!",
      "mp_shortage": "Not enough MP!"
    },
  },
  "es": {
    "menu": {
      "spell": "Hechizos",
      "item": "Objetos",
      "equip": "Equipo",
      "recall": "Recordar",
      "load": "Cargar",
      "save": "Guardar",
      "quit": "Salir",
      "use": "Usar",
      "drop": "Tirar",
      "back": "Volver",
      "quit_confirm": "¿Seguro que quieres salir?\n(El progreso no guardado se perderá)",
      "drop_confirm": "¿Seguro que quieres\ntirar {name}?",
      "cannot_drop_equipped": "¡No puedes tirar objetos equipados!",
      "cannot_drop_key": "¡Es un objeto importante!\n¡No puedes tirarlo!",
      "inventory_full_unequip": "¡La bolsa está llena!\n¡No puedes desequipar el objeto!",
      "unequipped": "¡El héroe se desequipó {name}!",
      "equipped": "¡El héroe se equipó {name}!",
      "dropped": "¡Tiraste {name}!",
      "full_hp": "¡Los PV ya están al máximo!",
      "full_mp": "¡Los PM ya están al máximo!",
      "cannot_use_here": "¡No se puede usar aquí!",
      "no_return_point": "¡No hay punto de retorno registrado!",
      "girl_priority": "¡Primero debes llevar a la niña a la ciudad a salvo!",
      "mp_shortage": "¡No tienes suficientes PM!"
    },
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
