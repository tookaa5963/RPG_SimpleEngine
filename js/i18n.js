import { locale } from './locale.js';

export const I18N_DICT = {
  "ja": {
    "common": {
      "yes": "はい",
      "no": "いいえ",
      "back": "戻る"
    },
    "title": {
      "new_game": "New Game",
      "load_game": "Load Game",
      "lang": "Language: 日本語",
      "theater": "Theater",
      "theater_fall": "黒竜討伐",
      "theater_ending": "エンディング",
      "theater_back": "戻る"
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
    },
    "ending": {
      "corrada_broken_1": "黒竜の断末魔とともに 聖剣コラーダは\n眩い光の粒子となって 砕け散った……",
      "corrada_broken_2": "手元には 【コラーダの折れた柄】と\n緑竜の紋章の指輪のみが 残された。",
      "dwarf_1": "鍛冶屋「おお！ 戻ったか！\nドラゴネーラ島の黒竜を 討ち果たしたのじゃな！",
      "dwarf_2": "鍛冶屋「……そして、盟約に従い\n【竜鱗の鎧】を 返しに来てくれたのだな。」",
      "dwarf_3": "勇者は 鍛冶屋に\n【竜鱗の鎧】を 返却した！",
      "dwarf_4": "鍛冶屋「うむ、確かに受け取った！\nこの太古の剥落鱗は 我がドワーフの里の誇り。\n大切に守り伝えていこう。」",
      "dwarf_5": "鍛冶屋「おぬしのおかげで 島と里は救われた。\n海の向こうの大陸へ向かうと聞く……\n大地の加護が あらんことを！」",
      "undine_1": "ウンディーネ「黒竜の灼熱の瘴気が 晴れ渡りました。\n災厄の火は 消え去ったのですね。」",
      "undine_2": "ウンディーネ「交わした誓いの通り、\n【水霊の盾】を 泉の祭壇へ奉納してください。」",
      "undine_3": "勇者は 祭壇へ\n【水霊の盾】を 奉納・返還した！",
      "undine_4": "ウンディーネ「精霊の守護は 再び島の霊脈へと還り、\n海流の恵みとなって この地を守り続けるでしょう。」",
      "undine_5": "ウンディーネ「その【折れた柄】と指輪が\nあなたを 遥かなる宿命へと導くはずです。\n旅立ちに 水の恵みがあらんことを……」",
      "port_1": "船長「おお！ 待ちわびたぜ！\n黒竜が倒れ、沖合を塞いでいた火炎の嵐が\n完全に晴れ渡ったんだ！」",
      "port_2": "学者「おお、無事であったか！\n黒竜の死によって 封印は役目を終え、\nコラーダは 砕け散ったのじゃな……」",
      "port_3": "学者「だが、手元に残った【折れた柄】と指輪、\nそしておぬし自身の存在こそが、\n大陸の歴史から消された『不敗の騎士』の真実じゃ。」",
      "port_4": "町長「島を破滅から救ってくれたおぬしを、\n島民全員が 心から讃えておるぞ！」",
      "port_5": "女の子「お兄ちゃん、行っちゃうの……？\n行かないで……！ ずっと一緒にいてよぉ……！」",
      "port_6": "船長「大陸への定期船は すでに抜錨の準備完了だ。\n海を渡り、新しい世界に乗り出す時が来たぜ！」",
      "port_7": "船長「野郎ども、帆を張れ！ 出航だーーっ！！」"
    }
  },
  "en": {
    "common": {
      "yes": "Yes",
      "no": "No",
      "back": "Back"
    },
    "title": {
      "new_game": "New Game",
      "load_game": "Load Game",
      "lang": "Language: English",
      "theater": "Theater",
      "theater_fall": "Fall of Black Dragon",
      "theater_ending": "Ending",
      "theater_back": "Back"
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
    },
    "ending": {
      "corrada_broken_1": "With the Black Dragon's dying curse,\nthe sacred sword Colada shattered into particles of light...",
      "corrada_broken_2": "In your hands, only the Broken Colada Hilt\nand the ring of the Green Dragon remained.",
      "dwarf_1": "Blacksmith: \"You returned!\nYou truly vanquished the Black Dragon of Dragonera!\"",
      "dwarf_2": "Blacksmith: \"...And true to our pact,\nyou have come to return the Dragon Scale Armor.\"",
      "dwarf_3": "The Hero returned the\nDragon Scale Armor to the blacksmith!",
      "dwarf_4": "Blacksmith: \"Aye, I have received it!\nThis ancient scale is the pride of our village.\nWe shall protect and pass it down.\"",
      "dwarf_5": "Blacksmith: \"Thanks to you, our island and village are saved.\nI hear you head across the sea...\nMay the blessing of the earth be with you!\"",
      "undine_1": "Undine: \"The scorching miasma of the Black Dragon has cleared.\nThe flames of disaster have vanished at last.\"",
      "undine_2": "Undine: \"As promised in our vow,\nplease offer the Water Spirit Shield upon the spring altar.\"",
      "undine_3": "The Hero returned and offered\nthe Water Spirit Shield to the altar!",
      "undine_4": "Undine: \"The spirit's protection returns to the island's veins,\nbecoming oceanic blessings to guard this land.\"",
      "undine_5": "Undine: \"That broken hilt and ring\nshall lead you toward your distant destiny.\nMay the blessings of water guide your voyage...\"",
      "port_1": "Captain: \"Ahoy! We've been waiting for ya!\nThe Black Dragon fell, and the storm of fire blocking the sea has vanished!\"",
      "port_2": "Scholar: \"Oh, you are safe!\nWith the dragon's demise, the seal served its purpose and Colada shattered...\"",
      "port_3": "Scholar: \"Yet the broken hilt, the ring, and your very presence\nare the living proof of the Undefeated Knight erased from continental history.\"",
      "port_4": "Mayor: \"You saved our island from ruin!\nEvery resident praises you from the bottom of their heart!\"",
      "port_5": "Girl: \"Are you leaving...? Please don't go...!\nStay with us forever...!\"",
      "port_6": "Captain: \"The liner to the continent is ready to set sail.\nTime to cross the waves and head into the new world!\"",
      "port_7": "Captain: \"All hands, hoist the sails! Set saiiil!!\""
    }
  },
  "es": {
    "common": {
      "yes": "Sí",
      "no": "No",
      "back": "Volver"
    },
    "title": {
      "new_game": "Nueva Partida",
      "load_game": "Cargar Partida",
      "lang": "Idioma: Español",
      "theater": "Teatro",
      "theater_fall": "Caída del Dragón",
      "theater_ending": "Final",
      "theater_back": "Volver"
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
    },
    "ending": {
      "corrada_broken_1": "Con el último aliento del Dragón negro,\nla espada Colada se deshizo en partículas de luz...",
      "corrada_broken_2": "En tus manos, solo quedaron la Empuñadura rota de Colada\ny el anillo del blasón del Dragón verde.",
      "dwarf_1": "Herrero: \"¡Por fin has vuelto!\n¡Has derrotado al Dragón negro de Dragonera!\"",
      "dwarf_2": "Herrero: \"...Y según lo pactado,\nvienes a devolver la Armadura de escamas de dragón.\"",
      "dwarf_3": "¡El héroe devolvió la\nArmadura de escamas de dragón al herrero!",
      "dwarf_4": "Herrero: \"¡Sí, la recibo con gratitud!\nEsta antigua escama es el orgullo de nuestra aldea.\nLa protegeremos siempre.\"",
      "dwarf_5": "Herrero: \"Gracias a ti, la isla y la aldea están a salvo.\nHe oído que partes hacia el continente...\n¡Que la bendición de la tierra te acompañe!\"",
      "undine_1": "Ondina: \"El miasma abrasador del Dragón negro se ha disipado.\nEl fuego del desastre ha desaparecido por fin.\"",
      "undine_2": "Ondina: \"Tal como juramos,\nofrenda el Escudo del espíritu del agua en el altar del manantial.\"",
      "undine_3": "¡El héroe ofrendó y devolvió\nel Escudo del espíritu del agua al altar!",
      "undine_4": "Ondina: \"La protección de los espíritus volverá a las corrientes de la isla\ny cuidará esta tierra por siempre.\"",
      "undine_5": "Ondina: \"Esa empuñadura rota y el anillo\nte guiarán hacia tu lejano destino.\nQue la bendición del agua acompañe tu viaje...\"",
      "port_1": "Capitán: \"¡Te estábamos esperando!\n¡El dragón ha caído y la tormenta de fuego que bloqueaba el mar ha desaparecido!\"",
      "port_2": "Erudito: \"¡Estás a salvo!\nCon la muerte del dragón, el sello cumplió su propósito y Colada se quebró...\"",
      "port_3": "Erudito: \"Sin embargo, la empuñadura, el anillo y tu existencia misma\nson la prueba viva del Caballero Invicto borrado de los anales del continente.\"",
      "port_4": "Alcalde: \"¡Salvaste a nuestra isla de la ruina!\n¡Todos los habitantes te aclaman desde el corazón!\"",
      "port_5": "Niña: \"¿Te vas, hermano...? ¡No te vayas...!\n¡Quédate con nosotros para siempre...!\"",
      "port_6": "Capitán: \"El barco regular hacia el continente está listo para zarpar.\n¡Ha llegado la hora de cruzar el mar hacia un nuevo mundo!\"",
      "port_7": "Capitán: \"¡Muchachos, desplegad las velas! ¡¡Zarpamos!!\""
    }
  }
};

class I18nManager {
  constructor() {}

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
  resolve(textObj) {
    if (!textObj || typeof textObj !== 'object') {
      throw new Error(`[DataValidationError] i18n.js:resolve: 翻訳オブジェクトが不正です (値: ${textObj}, 型: ${typeof textObj})`);
    }
    const val = textObj[this.currentLang];
    if (val === undefined) {
      throw new Error(`[DataValidationError] i18n.js:resolve: 言語 "${this.currentLang}" に対応するテキストがありません。`);
    }
    return val;
  }

  t(keyPath, params = {}) {
    const keys = keyPath.split('.');
    let result = I18N_DICT[this.currentLang];
    for (const k of keys) {
      if (result === undefined || result === null) {
        throw new Error(`[DataValidationError] i18n.js:t: 辞書に存在しないキーが参照されました (キー: "${keyPath}", lang: "${this.currentLang}")`);
      }
      result = result[k];
    }
    if (typeof result !== 'string') {
      throw new Error(`[DataValidationError] i18n.js:t: 参照されたキーの値が文字列ではありません (キー: "${keyPath}", 値: ${result}, 型: ${typeof result})`);
    }

    Object.keys(params).forEach(p => {
      result = result.replace(new RegExp(`\\{${p}\\}`, 'g'), params[p]);
    });
    return result;
  }

  tArray(keyPath, params = {}) {
    const keys = keyPath.split('.');
    let result = I18N_DICT[this.currentLang];
    for (const k of keys) {
      if (result === undefined || result === null) {
        throw new Error(`[DataValidationError] i18n.js:tArray: 辞書に存在しないキーが参照されました (キー: "${keyPath}", lang: "${this.currentLang}")`);
      }
      result = result[k];
    }
    if (!Array.isArray(result)) {
      throw new Error(`[DataValidationError] i18n.js:tArray: 参照されたキーの値が配列ではありません (キー: "${keyPath}", 値: ${result}, 型: ${typeof result})`);
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

if (typeof window !== 'undefined') {
  window.i18n = i18n;
}

