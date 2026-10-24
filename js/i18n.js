import { locale } from './locale.js';

export const I18N_DICT = {
  "ja": {
    "common": {
      "yes": "はい",
      "no": "いいえ",
      "back": "戻る"
    },
    "system": {
      "theater_unlocked": "ゲームクリア おめでとうございます！\n\nタイトル画面に「Theater」が追加され、\nいつでも映像を振り返ることができるようになりました。"
    },
    "ui": {
      "status": "ステータス",
      "items": "道具",
      "equipment": "装備",
      "none": "なし",
      "poison_badge": " [毒]",
      "controls": "【操作方法】\n移動: 矢印 / WASD\n決定: Space / Enter\n取消: X / ESC\nBGM: M / SE: N"
    },
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
    "battle": {
      "attack": "戦う",
      "spell": "呪文",
      "item": "道具",
      "escape": "逃げる",
      "no_magic": "勇者は まだ戦いで\n使える呪文がない！",
      "magic_sealed": "呪文は 封じ込まれている！",
      "no_items": "使える道具を\n持っていない！"
    },
    "battle_action": {
      "used_herb": "勇者は {item}を使った！\n勇者の傷が 回復した！",
      "used_strong_herb": "勇者は {item}を使った！\n勇者の傷が 大きく回復した！",
      "drank_magic_water": "勇者は {item}を飲んだ！\n勇者のＭＰが {mp}回復した！",
      "cured_poison": "勇者は 毒消し草を使った！\n体の毒が 消え去った！",
      "not_poisoned": "勇者は 毒消し草を使った！\nしかし 毒には冒されていなかった！",
      "cast_spell": "勇者は {spell}を唱えた！",
      "fully_healed": "勇者の傷が 完全に回復した！",
      "healed": "勇者の傷が 回復した！",
      "greatly_healed": "勇者の傷が 大きく回復した！",
      "enemy_asleep": "{name}を 眠らせた！",
      "enemy_already_asleep": "しかし {name}は\nすでに眠っている！",
      "enemy_spell_sealed": "{name}の呪文を\n封じ込んだ！",
      "enemy_already_sealed": "しかし すでに呪文は\n封じ込まれている！",
      "spell_no_effect": "しかし 効かなかった！"
    },
    "slot": {
      "title_save": "冒険の書 - 記録",
      "title_load": "冒険の書 - 再開",
      "current": "現在の冒険の書",
      "new_game": "なし（新規冒険）",
      "book": "書",
      "empty": "空っぽ",
      "corrupted": "データ異常",
      "current_badge": " [現在]",
      "overwrite_title": "記録の上書き確認",
      "overwrite_confirm": "冒険の書{slot}には 既に記録があります。\n前の記録を消して 上書きしますか？",
      "yes": "はい",
      "no": "いいえ",
      "back": "戻る",
      "backup_export": "バックアップ出力",
      "backup_import": "バックアップ読込"
    }
  },
  "en": {
    "common": {
      "yes": "Yes",
      "no": "No",
      "back": "Back"
    },
    "system": {
      "theater_unlocked": "Congratulations on clearing the game!\n\n'Theater' mode has been added to the Title Screen.\nYou can now replay cinematics anytime."
    },
    "ui": {
      "status": "STATUS",
      "items": "ITEMS",
      "equipment": "EQUIP",
      "none": "None",
      "poison_badge": " [POISON]",
      "controls": "[CONTROLS]\nMove: Arrows / WASD\nConfirm: Space / Enter\nCancel: X / ESC\nBGM: M / SE: N"
    },
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
    "battle": {
      "attack": "Fight",
      "spell": "Spell",
      "item": "Item",
      "escape": "Run",
      "no_magic": "No spells available\nfor battle!",
      "magic_sealed": "Magic is sealed!",
      "no_items": "No usable items\nin possession!"
    },
    "battle_action": {
      "used_herb": "Hero used {item}!\nWounds were healed!",
      "used_strong_herb": "Hero used {item}!\nWounds were greatly healed!",
      "drank_magic_water": "Hero drank {item}!\nRestored {mp} MP!",
      "cured_poison": "Hero used Antidotal Herb!\nThe poison was cured!",
      "not_poisoned": "Hero used Antidotal Herb!\nBut was not poisoned!",
      "cast_spell": "Hero cast {spell}!",
      "fully_healed": "Wounds were fully healed!",
      "healed": "Wounds were healed!",
      "greatly_healed": "Wounds were greatly healed!",
      "enemy_asleep": "Put {name} to sleep!",
      "enemy_already_asleep": "But {name} is\nalready asleep!",
      "enemy_spell_sealed": "Sealed {name}'s magic!",
      "enemy_already_sealed": "But magic is already sealed!",
      "spell_no_effect": "But it had no effect!"
    },
    "slot": {
      "title_save": "Log of Adventure - Save",
      "title_load": "Log of Adventure - Load",
      "current": "Current Log",
      "new_game": "None (New Adventure)",
      "book": "Log ",
      "empty": "Empty",
      "corrupted": "Corrupted",
      "current_badge": " [Active]",
      "overwrite_title": "Overwrite Confirmation",
      "overwrite_confirm": "Log {slot} already contains data.\nDo you want to overwrite it?",
      "yes": "Yes",
      "no": "No",
      "back": "Back",
      "backup_export": "Export Save Data",
      "backup_import": "Import Save Data"
    }
  },
  "es": {
    "common": {
      "yes": "Sí",
      "no": "No",
      "back": "Volver"
    },
    "system": {
      "theater_unlocked": "¡Felicidades por completar el juego!\n\nSe ha añadido el modo 'Teatro' a la pantalla de título.\nAhora puedes revivir las escenas cuando quieras."
    },
    "ui": {
      "status": "ESTADO",
      "items": "OBJETOS",
      "equipment": "EQUIPO",
      "none": "Ninguno",
      "poison_badge": " [VENENO]",
      "controls": "[CONTROLES]\nMover: Flechas / WASD\nAceptar: Espacio / Intro\nCancelar: X / ESC\nBGM: M / SE: N"
    },
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
    "battle": {
      "attack": "Atacar",
      "spell": "Hechizo",
      "item": "Objeto",
      "escape": "Huir",
      "no_magic": "¡No hay hechizos disponibles\npara la batalla!",
      "magic_sealed": "¡Los hechizos están bloqueados!",
      "no_items": "¡No tienes objetos utilizables!"
    },
    "battle_action": {
      "used_herb": "¡Héroe usó {item}!\n¡Las heridas sanaron!",
      "used_strong_herb": "¡Héroe usó {item}!\n¡Gran recuperación de salud!",
      "drank_magic_water": "¡Héroe bebió {item}!\n¡Recuperó {mp} PM!",
      "cured_poison": "¡Héroe usó Hierba amarga!\n¡El veneno desapareció!",
      "not_poisoned": "¡Héroe usó Hierba amarga!\n¡Pero no estaba envenenado!",
      "cast_spell": "¡Héroe lanzó {spell}!",
      "fully_healed": "¡Heridas completamente sanadas!",
      "healed": "¡Las heridas sanaron!",
      "greatly_healed": "¡Gran recuperación de salud!",
      "enemy_asleep": "¡Durmió a {name}!",
      "enemy_already_asleep": "¡Pero {name} ya\nestá dormido!",
      "enemy_spell_sealed": "¡Selló la magia de {name}!",
      "enemy_already_sealed": "¡Pero los hechizos ya están sellados!",
      "spell_no_effect": "¡Pero no tuvo efecto!"
    },
    "slot": {
      "title_save": "Diario de Aventura - Guardar",
      "title_load": "Diario de Aventura - Cargar",
      "current": "Diario actual",
      "new_game": "Ninguno (Nueva Aventura)",
      "book": "Reg. ",
      "empty": "Vacío",
      "corrupted": "Dañado",
      "current_badge": " [Actual]",
      "overwrite_title": "Confirmar Sobrescritura",
      "overwrite_confirm": "El registro {slot} ya contiene datos.\n¿Deseas sobrescribirlo?",
      "yes": "Sí",
      "no": "No",
      "back": "Volver",
      "backup_export": "Exportar Datos",
      "backup_import": "Importar Datos"
    }
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
      throw new Error(`[DataValidationError] i18n.js:resolve: ????????????? (?: ${textObj}, ?: ${typeof textObj})`);
    }
    const val = textObj[this.currentLang];
    if (val === undefined) {
      throw new Error(`[DataValidationError] i18n.js:resolve: ?? "${this.currentLang}" ????????????????`);
    }
    return val;
  }

  t(keyPath, params = {}) {
    const keys = keyPath.split('.');
    
    // 1. ?????????????????????
    let result = this.localeData[this.currentLang];
    let foundInExternal = true;
    for (const k of keys) {
      if (result === undefined || result === null || result[k] === undefined) {
        foundInExternal = false;
        break;
      }
      result = result[k];
    }

    // 2. ???????????????? I18N_DICT ???? (?????)
    if (!foundInExternal) {
      result = I18N_DICT[this.currentLang];
      for (const k of keys) {
        if (result === undefined || result === null) {
          throw new Error(`[DataValidationError] i18n.js:t: ?????????????????? (??: "${keyPath}", lang: "${this.currentLang}")`);
        }
        result = result[k];
      }
    }

    if (typeof result !== 'string') {
      throw new Error(`[DataValidationError] i18n.js:t: ???????????????????? (??: "${keyPath}", ?: ${result}, ?: ${typeof result})`);
    }

    Object.keys(params).forEach(p => {
      result = result.replace(new RegExp(`\\{${p}\\}`, 'g'), params[p]);
    });
    return result;
  }

  tArray(keyPath, params = {}) {
    const keys = keyPath.split('.');

    // 1. ?????????????????????
    let result = this.localeData[this.currentLang];
    let foundInExternal = true;
    for (const k of keys) {
      if (result === undefined || result === null || result[k] === undefined) {
        foundInExternal = false;
        break;
      }
      result = result[k];
    }

    // 2. ???????????????? I18N_DICT ???? (?????)
    if (!foundInExternal) {
      result = I18N_DICT[this.currentLang];
      for (const k of keys) {
        if (result === undefined || result === null) {
          throw new Error(`[DataValidationError] i18n.js:tArray: ?????????????????? (??: "${keyPath}", lang: "${this.currentLang}")`);
        }
        result = result[k];
      }
    }

    if (!Array.isArray(result)) {
      throw new Error(`[DataValidationError] i18n.js:tArray: ??????????????????? (??: "${keyPath}", ?: ${result}, ?: ${typeof result})`);
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
