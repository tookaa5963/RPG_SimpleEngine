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
    "objectives": {
      "talk_sister": "【現在の目的】\n始まりの町の 教会へ行き、\nシスターに 指輪について尋ねよう。",
      "find_scholar": "【現在の目的】\n北の遺跡へ向かい、\n遺跡を調査している 学者に会おう。",
      "report_scholar": "【現在の目的】\n北の遺跡の入口付近にいる学者に、\n石碑の調査結果を報告しよう。",
      "investigate_monument": "【現在の目的】\n北の遺跡の最奥に棲む魔物を倒し、\n古代の石碑を調査しよう。",
      "return_girl": "【現在の目的】\n救出した女の子を連れて、\n始まりの町の町長のもとへ戻ろう。",
      "rescue_girl": "【現在の目的】\n東のダンジョンの最奥へ向かい、\nさらわれた町の女の子を救出しよう。",
      "consult_mayor": "【現在の目的】\n通行手形を発行してもらうため、\n始まりの町の町長に相談しよう。",
      "cross_checkpoint": "【現在の目的】\n東の関所を越えて、\n北東の港町を目指そう。",
      "go_library": "【現在の目的】\n東の関所を通り、\n北東の港町の図書館へ向かおう。",
      "find_temple": "【現在の目的】\n島中央の迷いの森を抜け、\n奥にあるという 神殿を目指そう。",
      "deliver_ring": "【現在の目的】\n神殿跡のエルフに、\n取り戻した【恋人の指輪】を届けよう。",
      "recover_ring": "【現在の目的】\n神殿の西にある地下墓地へ潜入し、\n魔物から【恋人の指輪】を奪還しよう。",
      "obtain_water_shield": "【現在の目的】\n神殿跡の北東から迷いの森深部へ進み、\nウンディーネから【水霊の盾】を授かろう。",
      "obtain_corrada": "【現在の目的】\n地下墓地の奥深くから地下神殿へ潜入し、\n祭壇の長櫃から名剣【コラーダ】を手に入れよう。",
      "seek_dwarf_village": "【現在の目的】\n島の北東の海岸にある海底トンネルを抜け、\nドワーフの隠れ里を目指そう。",
      "seek_armor_clues": "【現在の目的】\n聖剣【コラーダ】を手に入れた！\n神殿跡のエルフか 港町の学者に報告し、\n黒竜に立ち向かうための防具の手がかりを探そう。",
      "defeat_black_lizard": "【現在の目的】\n海底トンネル中腹に潜む\n【黒きリザードマン】を討伐しよう。",
      "report_black_lizard": "【現在の目的】\n黒きリザードマンを討伐した！\nドワーフ村の守備兵に報告しよう。",
      "consult_blacksmith": "【現在の目的】\n守備兵の信頼を勝ち取った！\nドワーフ村の鍛冶屋に 鎧の仕立てを頼もう。",
      "deliver_mane": "【現在の目的】\n手に入れた【ケルベロスの鬣】を\nドワーフ村の鍛冶屋に届けよう。",
      "defeat_cerberus": "【現在の目的】\n竜の洞窟に潜む【ケルベロス】を倒し、\n鎧の仕立てに必要な【ケルベロスの鬣】を奪取しよう。",
      "defeat_black_dragon": "【現在の目的】\n最終装備が揃った！\nドラゴネーラ島の火口へ向かい、黒竜を討伐しよう。"
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
    "battle_log": {
      "appeared": "{name}が 現れた！",
      "enemy_ambush": "{name}が 突如として襲いかかってきた！",
      "player_awake": "勇者は 目を覚ました！",
      "player_sleep": "勇者は ぐうぐう眠っている……",
      "hero_attack": "勇者の 攻撃！",
      "critical_hit": "会心の一撃！！",
      "damage_dealt": "{name}に {dmg}ポイントの\nダメージを 与えた！",
      "heavy_damage_dealt": "{name}に {dmg}ポイントの\n大ダメージを 与えた！",
      "enemy_awake": "{name}は 目を覚ました！",
      "enemy_sleep": "{name}は ぐうぐう眠っている……",
      "breath_attack": "{name}は {spell}を 吐き出した！",
      "hero_damage_heavy": "勇者は {dmg}ポイントの\n大ダメージを 受けた！",
      "breath_defended_both": "水霊の盾と火炎の護符が\n猛烈な業火を 打ち払った！",
      "breath_defended_shield": "水霊の盾が 炎を防ぐが\n防ぎきれぬ熱気が 身体を焼く！",
      "breath_defended_charm": "火炎の護符が 熱を遮るが\nあまりの火炎に 耐えきれない！",
      "breath_no_defense": "凄まじい業火が\n勇者を 容赦なく焼き尽くす！！",
      "enemy_special_phys": "{name}の {spell}！",
      "dragon_claw_hit": "漆黒の爪が 勇者を切り裂く！",
      "dragon_armor_defend": "太古の竜鱗の鎧が\n黒竜の猛撃を ガッシリと弾き返した！",
      "dragon_armor_penetrated": "鎧を容易く貫通し\n致命的な一撃を 受けてしまった！！",
      "enemy_cast": "{name}は {spell}を唱えた！",
      "enemy_spell_sealed": "しかし 呪文は封じ込まれている！",
      "already_asleep": "しかし 勇者は すでに眠っている！",
      "hero_fell_asleep": "勇者は 眠ってしまった！",
      "spell_no_effect_hero": "しかし 勇者には 効かなかった！",
      "already_sealed": "しかし すでに呪文は 封じられている！",
      "hero_spell_sealed": "勇者の呪文が 封じ込まれた！",
      "hero_damage": "勇者は {dmg}ポイントの\nダメージを 受けた！",
      "enemy_attack": "{name}の 攻撃！",
      "enemy_critical": "痛恨の一撃！！",
      "poison_defended": "しかし 防疫の護符が\n毒を防ぎ止めた！",
      "hero_poisoned": "勇者は 毒を受けてしまった！",
      "hero_escape": "勇者は 逃げ出した！",
      "escape_failed": "しかし 回り込まれてしまった！",
      "enemy_defeated": "{name}を 倒した！",
      "exp_gold_gain": "{exp}ポイントの 経験値を獲得！\n{gold}ゴールドを 手に入れた！",
      "treasure_drop": "{name}は 宝箱を落としていった！\nなんと {item}を 手に入れた！",
      "bag_full_drop": "{name}は 宝箱を落としていった！\nしかし 荷物がいっぱいで 持てない！\n何か 道具を捨ててください。",
      "discard_select_msg": "持ち物がいっぱいです。\n捨てる道具を 選んでください。",
      "hero_discarded_item": "勇者は {discarded}を 捨てた！\nなんと {dropped}を 手に入れた！",
      "hero_defeated": "勇者は 力尽きた……"
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
    "field": {
      "chest_inventory_full_give_up": "しかし 荷物がいっぱいで 持てない！\n勇者は {item} をあきらめた。",
      "chest_give_up": "勇者は {item} をあきらめ、\n宝箱をそっと閉じた。",
      "death_exp_lost": "経験値を {exp}ポイント 失ってしまった！",
      "light_expired": "明かりが 消えてしまった！",
      "holy_water_expired": "清めの効果が\n切れてしまった！",
      "dragons_cave_warn_1": "洞窟の最奥から 凄まじい邪気が漂ってくる……！\nこの先へ進めば、もはや後戻りはできない。",
      "dragons_cave_warn_2": "決戦に挑む前に\nこれまでの冒険の記録を 残しておこう。",
      "chest_locked_altar": "祭壇の長櫃には 二つの鍵穴がある。",
      "chest_locked": "鍵がかかっていて 開かない！",
      "chest_inventory_full": "持ち物がいっぱいで\n宝箱を開けられない！",
      "chest_open_corrada_1": "勇者は 【古びた鍵】と【青銅の鍵】を差し込んだ！",
      "chest_open_corrada_2": "カチャリ……！ 長櫃の重厚な封印が解かれた！",
      "chest_open_corrada_3": "祭壇の長櫃を開けた！\nなんと 名剣【コラーダ】を手に入れた！",
      "chest_open_corrada_4": "剣を手にした瞬間、緑竜の刻印が淡い光を放った……！\n（身体の奥底から 懐かしい力が湧き上がるようだ）",
      "chest_open": "宝箱を開けた！\nなんと {item}を手に入れた！",
      "chest_empty": "しかし 宝箱は\nからっぽだった。",
      "chest_altar_empty": "しかし 長櫃は\nからっぽだった。",
      "death_poison": "勇者は 毒によって\n倒れてしまった……\nゴールドが 半分になった！",
      "death_normal": "勇者は 倒れてしまった！\nゴールドが 半分になった……",
      "death_girl_lost": "\n（女の子は 再び ダンジョン奥へ\n連れ戻されてしまった！）",
      "saved_slot": "冒険の書{slot}に\n記録した！",
      "loaded_slot": "冒険の書{slot}から\n再開した！",
      "data_not_found": "冒険の書{slot}は 空っぽです"
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
    "objectives": {
      "talk_sister": "[Current Objective]\nGo to the church in Starting Town\nand ask the sister about the ring.",
      "find_scholar": "[Current Objective]\nHead to the Northern Cave and meet\nthe scholar investigating the ruins.",
      "report_scholar": "[Current Objective]\nReport the findings from the monument\nto the scholar near the cave entrance.",
      "investigate_monument": "[Current Objective]\nDefeat the monster deep in Northern Cave\nand examine the ancient monument.",
      "return_girl": "[Current Objective]\nEscort the rescued girl safely back\nto the Mayor of Starting Town.",
      "rescue_girl": "[Current Objective]\nHead deep into the Eastern Dungeon\nand rescue the kidnapped girl.",
      "consult_mayor": "[Current Objective]\nConsult the Mayor of Starting Town\nto obtain a Travel Pass.",
      "cross_checkpoint": "[Current Objective]\nPass through the eastern checkpoint\nand head toward the Port Town.",
      "go_library": "[Current Objective]\nPass through the eastern checkpoint\nand visit the library in Port Town.",
      "find_temple": "[Current Objective]\nTraverse the central Lost Forest\nand find the temple hidden within.",
      "deliver_ring": "[Current Objective]\nDeliver the recovered Lover's Ring\nto the elf at the Temple Ruins.",
      "recover_ring": "[Current Objective]\nInfiltrate the catacombs west of the temple\nand retrieve the Lover's Ring from monsters.",
      "obtain_water_shield": "[Current Objective]\nProceed northeast into the Deep Forest\nand receive the Water Spirit Shield from Undine.",
      "obtain_corrada": "[Current Objective]\nInfiltrate the Underground Temple through the catacombs\nand claim the legendary sword Colada.",
      "seek_dwarf_village": "[Current Objective]\nPass through the Undersea Tunnel on the northeast\ncoast and reach the hidden dwarven village.",
      "seek_armor_clues": "[Current Objective]\nSword Colada obtained! Speak with the elf\nor the scholar to seek clues for dragon-proof armor.",
      "defeat_black_lizard": "[Current Objective]\nDefeat the Black Lizardman lurking\naround the middle of the Undersea Tunnel.",
      "report_black_lizard": "[Current Objective]\nBlack Lizardman defeated!\nReport to the guard in the dwarven village.",
      "consult_blacksmith": "[Current Objective]\nEarned the guard's trust!\nSpeak to the blacksmith in the dwarven village.",
      "deliver_mane": "[Current Objective]\nDeliver the obtained Cerberus Mane\nto the blacksmith in the dwarven village.",
      "defeat_cerberus": "[Current Objective]\nDefeat Cerberus in the dragon's cavern\nand obtain the mane needed for the armor.",
      "defeat_black_dragon": "[Current Objective]\nFinal equipment gathered! Head to the crater\nof Dragonera Island and vanquish the Black Dragon."
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
    "battle_log": {
      "appeared": "{name} appeared!",
      "enemy_ambush": "{name} launched a surprise attack!",
      "player_awake": "The Hero woke up!",
      "player_sleep": "The Hero is fast asleep...",
      "hero_attack": "The Hero attacks!",
      "critical_hit": "A critical hit!!",
      "damage_dealt": "Dealt {dmg} damage\nto {name}!",
      "heavy_damage_dealt": "Dealt a massive {dmg} damage\nto {name}!",
      "enemy_awake": "{name} woke up!",
      "enemy_sleep": "{name} is fast asleep...",
      "breath_attack": "{name} spewed {spell}!",
      "hero_damage_heavy": "The Hero took a massive\n{dmg} damage!",
      "breath_defended_both": "The Water Spirit Shield and Fire Ward\nwarded off the fierce flames!",
      "breath_defended_shield": "The shield protects, but the\nunbearable heat burns the body!",
      "breath_defended_charm": "The charm blocks heat, but cannot\nwithstand the inferno!",
      "breath_no_defense": "A merciless blaze consumes the Hero!!",
      "enemy_special_phys": "{name}'s {spell}!",
      "dragon_claw_hit": "Pitch-black claws slash the Hero!",
      "dragon_armor_defend": "The ancient dragon scale armor\nsolidly deflected the fierce strike!",
      "dragon_armor_penetrated": "Pierced easily through armor,\nsuffering a fatal blow!!",
      "enemy_cast": "{name} cast {spell}!",
      "enemy_spell_sealed": "But magic is sealed!",
      "already_asleep": "But the Hero is already asleep!",
      "hero_fell_asleep": "The Hero fell asleep!",
      "spell_no_effect_hero": "But it had no effect on the Hero!",
      "already_sealed": "But magic is already sealed!",
      "hero_spell_sealed": "The Hero's magic was sealed!",
      "hero_damage": "The Hero took {dmg} damage!",
      "enemy_attack": "{name} attacks!",
      "enemy_critical": "A devastating blow!!",
      "poison_defended": "However, the Poison Ward stopped the poison!",
      "hero_poisoned": "The Hero was poisoned!",
      "hero_escape": "The Hero ran away!",
      "escape_failed": "But was cornered!",
      "enemy_defeated": "Defeated {name}!",
      "exp_gold_gain": "Gained {exp} EXP!\nAcquired {gold} Gold!",
      "treasure_drop": "{name} dropped a chest!\nFound {item}!",
      "bag_full_drop": "{name} dropped a chest!\nInventory is full! Choose an item to discard.",
      "discard_select_msg": "Inventory is full.\nSelect an item to discard.",
      "hero_discarded_item": "The Hero discarded {discarded}!\nFound {dropped}!",
      "hero_defeated": "The Hero has collapsed..."
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
    "field": {
      "chest_inventory_full_give_up": "But your bag is full!\nThe Hero gave up on {item}.",
      "chest_give_up": "The Hero gave up on {item}\nand closed the chest.",
      "death_exp_lost": "Lost {exp} EXP points!",
      "light_expired": "The light has gone out!",
      "holy_water_expired": "The holy protection\nhas worn off!",
      "dragons_cave_warn_1": "A dreadful malice drifts from deep within the cave...!\nOnce you proceed, there is no turning back.",
      "dragons_cave_warn_2": "Before challenging the final battle,\nlet us record the tale of your journey.",
      "chest_locked_altar": "There are two keyholes on the altar's coffer.",
      "chest_locked": "It is locked and will not open!",
      "chest_inventory_full": "Inventory is full!\nCannot open the treasure chest!",
      "chest_open_corrada_1": "The Hero inserted the Ancient Key and Bronze Key!",
      "chest_open_corrada_2": "Click...! The heavy seal of the coffer was undone!",
      "chest_open_corrada_3": "Opened the altar's coffer!\nAcquired the legendary sword Colada!",
      "chest_open_corrada_4": "The moment you held the sword, the green dragon seal radiated light...!\n(A familiar power seems to surge from deep within.)",
      "chest_open": "Opened the treasure chest!\nFound {item}!",
      "chest_empty": "However, the chest\nwas empty.",
      "chest_altar_empty": "However, the coffer\nwas empty.",
      "death_poison": "The Hero collapsed\nfrom poison...\nLost half of all gold!",
      "death_normal": "The Hero collapsed!\nLost half of all gold...",
      "death_girl_lost": "\n(The girl was taken back\ndeep into the dungeon!)",
      "saved_slot": "Saved to Log {slot}!",
      "loaded_slot": "Resumed from Log {slot}!",
      "data_not_found": "Log {slot} is empty."
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
    "objectives": {
      "talk_sister": "[Objetivo actual]\nVe a la iglesia del pueblo de inicio\ny pregunta a la hermana sobre el anillo.",
      "find_scholar": "[Objetivo actual]\nDirígete a la Cueva del Norte y busca\nal erudito que investiga las ruinas.",
      "report_scholar": "[Objetivo actual]\nInforma sobre la inscripción del monumento\nal erudito cerca de la entrada de la cueva.",
      "investigate_monument": "[Objetivo actual]\nDerrota a la bestia de la Cueva del Norte\ny examina el monumento antiguo.",
      "return_girl": "[Objetivo actual]\nLleva a la niña rescatada de vuelta\ncon el alcalde del pueblo de inicio.",
      "rescue_girl": "[Objetivo actual]\nAdéntrate en la Mazmorra Oriental\ny rescata a la niña secuestrada.",
      "consult_mayor": "[Objetivo actual]\nHabla con el alcalde del pueblo de inicio\npara conseguir un salvoconducto.",
      "cross_checkpoint": "[Objetivo actual]\nCruza el puesto de control del este\ny dirígete al Pueblo Costero.",
      "go_library": "[Objetivo actual]\nAtraviesa el puesto de control del este\ny ve a la biblioteca del Pueblo Costero.",
      "find_temple": "[Objetivo actual]\nAtraviesa el Bosque Perdido central\ny busca el templo oculto en su interior.",
      "deliver_ring": "[Objetivo actual]\nLleva el Anillo de amantes recuperado\nal elfo en las Ruinas del Templo.",
      "recover_ring": "[Objetivo actual]\nEntra a las catacumbas al oeste del templo\ny recupera el Anillo de amantes de las bestias.",
      "obtain_water_shield": "[Objetivo actual]\nAvanza al Bosque Profundo hacia el noreste\ny recibe el Escudo del espíritu de Ondina.",
      "obtain_corrada": "[Objetivo actual]\nEntra al Templo Subterráneo por las catacumbas\ny obtén la espada legendaria Colada del arca.",
      "seek_dwarf_village": "[Objetivo actual]\nCruza el Túnel Submarino en la costa noreste\ny llega a la aldea oculta de los enanos.",
      "seek_armor_clues": "[Objetivo actual]\n¡Colada obtenida! Habla con el elfo o el\nerudito para hallar pistas de la armadura adecuada.",
      "defeat_black_lizard": "[Objetivo actual]\nDerrota al Hombre lagarto negro que acecha\na mitad del Túnel Submarino.",
      "report_black_lizard": "[Objetivo actual]\n¡Hombre lagarto negro derrotado!\nInforma al guardia en la aldea de los enanos.",
      "consult_blacksmith": "[Objetivo actual]\n¡Te ganaste la confianza del guardia!\nPide al herrero que te ajuste la armadura.",
      "deliver_mane": "[Objetivo actual]\nEntrega la Melena de cerbero obtenida\nal herrero de la aldea de los enanos.",
      "defeat_cerberus": "[Objetivo actual]\nDerrota a Cerbero en la cueva del dragón\ny obtén la melena necesaria para la armadura.",
      "defeat_black_dragon": "[Objetivo actual]\n¡Equipo final listo! Ve al cráter de la\nIsla Dragonera y acaba con el Dragón negro."
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
    "battle_log": {
      "appeared": "¡Ha aparecido {name}!",
      "enemy_ambush": "¡{name} atacó por sorpresa!",
      "player_awake": "¡El héroe se ha despertado!",
      "player_sleep": "El héroe está profundamente dormido...",
      "hero_attack": "¡El héroe ataca!",
      "critical_hit": "¡¡Un golpe crítico!!",
      "damage_dealt": "¡Infligió {dmg} puntos de\ndaño a {name}!",
      "heavy_damage_dealt": "¡Infligió un daño masivo de\n{dmg} puntos a {name}!",
      "enemy_awake": "¡{name} se ha despertado!",
      "enemy_sleep": "{name} está profundamente dormido...",
      "breath_attack": "¡{name} lanzó {spell}!",
      "hero_damage_heavy": "¡El héroe recibió un gran daño\nde {dmg} puntos!",
      "breath_defended_both": "¡El escudo del espíritu y el talismán\nrepelieron las fieras llamas!",
      "breath_defended_shield": "¡El escudo protege, pero el calor\nabrasador quema el cuerpo!",
      "breath_defended_charm": "¡El talismán frena el calor, pero\nno resiste tal llamarada!",
      "breath_no_defense": "¡¡Una llamarada atroz consume al héroe!!",
      "enemy_special_phys": "¡{spell} de {name}!",
      "dragon_claw_hit": "¡Garras tenebrosas desgarran al héroe!",
      "dragon_armor_defend": "¡La armadura de escamas repelió\nfirmemente el fiero embate!",
      "dragon_armor_penetrated": "¡¡Atravesó la armadura sufriendo\nun golpe fatal!!",
      "enemy_cast": "¡{name} lanzó {spell}!",
      "enemy_spell_sealed": "¡Pero los hechizos están bloqueados!",
      "already_asleep": "¡Pero el héroe ya está dormido!",
      "hero_fell_asleep": "¡El héroe se quedó dormido!",
      "spell_no_effect_hero": "¡Pero no tuvo efecto en el héroe!",
      "already_sealed": "¡Pero los hechizos ya están bloqueados!",
      "hero_spell_sealed": "¡Los hechizos del héroe fueron bloqueados!",
      "hero_damage": "¡El héroe recibió {dmg} puntos de daño!",
      "enemy_attack": "¡{name} ataca!",
      "enemy_critical": "¡¡Un golpe devastador!!",
      "poison_defended": "¡Sin embargo, el talismán detuvo el veneno!",
      "hero_poisoned": "¡El héroe fue envenenado!",
      "hero_escape": "¡El héroe huyó!",
      "escape_failed": "¡Pero fue acorralado!",
      "enemy_defeated": "¡Derrotó a {name}!",
      "exp_gold_gain": "¡Obtuvo {exp} de experiencia!\n¡Consiguió {gold} monedas de oro!",
      "treasure_drop": "¡{name} dejó un cofre!\n¡Consiguió {item}!",
      "bag_full_drop": "¡{name} dejó un cofre!\n¡Bolsa llena! Elige un objeto para tirar.",
      "discard_select_msg": "La bolsa está llena.\nElige un objeto para tirar.",
      "hero_discarded_item": "¡El héroe tiró {discarded}!\n¡Consiguió {dropped}!",
      "hero_defeated": "El héroe ha caído..."
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
    "field": {
      "chest_inventory_full_give_up": "¡Pero tu bolsa está llena!\nEl héroe renunció a {item}.",
      "chest_give_up": "El héroe renunció a {item}\ny cerró el cofre.",
      "death_exp_lost": "¡Has perdido {exp} puntos de experiencia!",
      "light_expired": "¡La luz se ha apagado!",
      "holy_water_expired": "¡El efecto de purificación\nse ha desvanecido!",
      "dragons_cave_warn_1": "¡Una densa maldad emana de lo profundo de la cueva...!\nSi avanzas más, ya no habrá vuelta atrás.",
      "dragons_cave_warn_2": "Antes de desafiar la batalla final,\nguardemos el registro de tu aventura.",
      "chest_locked_altar": "Hay dos cerraduras en el arca del altar.",
      "chest_locked": "¡Está cerrado con llave y no se abre!",
      "chest_inventory_full": "¡Tu bolsa está llena!\n¡No puedes abrir el cofre!",
      "chest_open_corrada_1": "¡El héroe introdujo la Llave antigua y la Llave de bronce!",
      "chest_open_corrada_2": "¡Clic...! ¡El pesado sello del arca fue liberado!",
      "chest_open_corrada_3": "¡Abrió el arca del altar!\n¡Consiguió la espada legendaria Colada!",
      "chest_open_corrada_4": "¡Al empuñar la espada, el blasón del dragón verde emitió luz...!\n(Un poder nostálgico parece brotar desde lo profundo del cuerpo.)",
      "chest_open": "¡Abrió el cofre del tesoro!\n¡Consiguió {item}!",
      "chest_empty": "Sin embargo, el cofre\nestaba vacío.",
      "chest_altar_empty": "Sin embargo, el arca\nestaba vacía.",
      "death_poison": "¡El héroe cayó derrotado\npor el veneno...!\n¡Perdió la mitad del oro!",
      "death_normal": "¡El héroe cayó derrotado!\nPerdió la mitad del oro...",
      "death_girl_lost": "\n(¡La niña fue llevada de vuelta\na lo profundo de la mazmorra!)",
      "saved_slot": "¡Guardado en el diario {slot}!",
      "loaded_slot": "¡Reanudado desde el diario {slot}!",
      "data_not_found": "El diario {slot} está vacío."
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

