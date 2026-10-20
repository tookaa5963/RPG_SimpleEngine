// FILE_ENTRY: ai_staging/js/i18n.js

// フェーズ4-B: i18n.js の新旧API分離とパージ
// 移行が完了した item, spell, monster などのデータは I18N_DICT から完全に物理削除する（Fail-Fast）。
// まだコアスクリプト（battle.js 等）で参照されているものは残す。
export const I18N_DICT = {
  ja: {
    common: {
      yes: "はい",
      no: "いいえ",
      back: "戻る"
    },
    title: {
      new_game: "New Game",
      load_game: "Load Game",
      lang: "Language: 日本語",
      theater: "Theater",
      theater_fall: "黒竜討伐",
      theater_ending: "エンディング",
      theater_back: "戻る"
    },
    system: {
      theater_unlocked: "ゲームクリア おめでとうございます！\n\nタイトル画面に「Theater」が追加され、\nいつでも映像を振り返ることができるようになりました。"
    },
    ui: {
      status: "ステータス",
      items: "道具",
      equipment: "装備",
      none: "なし",
      poison_badge: " [毒]",
      controls: "【操作方法】\n移動: 矢印 / WASD\n決定: Space / Enter\n取消: X / ESC\nBGM: M / SE: N"
    },
    menu: {
      spell: "呪文",
      item: "道具",
      equip: "装備",
      recall: "思い出す",
      load: "再開",
      save: "記録",
      quit: "終了",
      use: "使う",
      drop: "捨てる",
      back: "やめる",
      quit_confirm: "このまま 終了して\nよろしいですか？\n（セーブしていない記録は失われます）",
      drop_confirm: "{name}を\n本当に 捨てますか？",
      cannot_drop_equipped: "装備しているものは 捨てられない！",
      cannot_drop_key: "それは 大切なものだ！\n捨てることなど できない！",
      inventory_full_unequip: "持ち物がいっぱいで\n装備を 外すことができない！",
      unequipped: "勇者は {name}を 外した！",
      equipped: "勇者は {name}を 装備した！",
      dropped: "{name}を 捨てた！",
      full_hp: "しかし ＨＰは 満タンだ！",
      full_mp: "しかし ＭＰは 満タンだ！",
      cannot_use_here: "ここでは 使えない！",
      no_return_point: "帰還地が 登録されていない！",
      girl_priority: "今は 女の子を無事に 町へ送り届けるのが 先決だ！",
      mp_shortage: "ＭＰが 足りない！"
    },
    objectives: {
      talk_sister: "【現在の目的】\n始まりの町の 教会へ行き、\nシスターに 指輪について尋ねよう。",
      find_scholar: "【現在の目的】\n北の遺跡へ向かい、\n遺跡を調査している 学者に会おう。",
      report_scholar: "【現在の目的】\n北の遺跡の入口付近にいる学者に、\n石碑の調査結果を報告しよう。",
      investigate_monument: "【現在の目的】\n北の遺跡の最奥に棲む魔物を倒し、\n古代の石碑を調査しよう。",
      return_girl: "【現在の目的】\n救出した女の子を連れて、\n始まりの町の町長のもとへ戻ろう。",
      rescue_girl: "【現在の目的】\n東のダンジョンの最奥へ向かい、\nさらわれた町の女の子を救出しよう。",
      consult_mayor: "【現在の目的】\n通行手形を発行してもらうため、\n始まりの町の町長に相談しよう。",
      cross_checkpoint: "【現在の目的】\n東の関所を越えて、\n北東の港町を目指そう。",
      go_library: "【現在の目的】\n東の関所を通り、\n北東の港町の図書館へ向かおう。",
      find_temple: "【現在の目的】\n島中央の迷いの森を抜け、\n奥にあるという 神殿を目指そう。",
      deliver_ring: "【現在の目的】\n神殿跡のエルフに、\n取り戻した【恋人の指輪】を届けよう。",
      recover_ring: "【現在の目的】\n神殿の西にある地下墓地へ潜入し、\n魔物から【恋人の指輪】を奪還しよう。",
      obtain_water_shield: "【現在の目的】\n神殿跡の北東から迷いの森深部へ進み、\nウンディーネから【水霊の盾】を授かろう。",
      obtain_corrada: "【現在の目的】\n地下墓地の奥深くから地下神殿へ潜入し、\n祭壇の長櫃から名剣【コラーダ】を手に入れよう。",
      seek_dwarf_village: "【現在の目的】\n島の北東の海岸にある海底トンネルを抜け、\nドワーフの隠れ里を目指そう。",
      seek_armor_clues: "【現在の目的】\n聖剣【コラーダ】を手に入れた！\n神殿跡のエルフか 港町の学者に報告し、\n黒竜に立ち向かうための防具の手がかりを探そう。",
      defeat_black_lizard: "【現在の目的】\n海底トンネル中腹に潜む\n【黒きリザードマン】を討伐しよう。",
      report_black_lizard: "【現在の目的】\n黒きリザードマンを討伐した！\nドワーフ村の守備兵に報告しよう。",
      consult_blacksmith: "【現在の目的】\n守備兵の信頼を勝ち取った！\nドワーフ村の鍛冶屋に 鎧の仕立てを頼もう。",
      deliver_mane: "【現在の目的】\n手に入れた【ケルベロスの鬣】を\nドワーフ村の鍛冶屋に届けよう。",
      defeat_cerberus: "【現在の目的】\n竜の洞窟に潜む【ケルベロス】を倒し、\n鎧の仕立てに必要な【ケルベロスの鬣】を奪取しよう。",
      defeat_black_dragon: "【現在の目的】\n最終装備が揃った！\nドラゴネーラ島の火口へ向かい、黒竜を討伐しよう。"
    },
    menu_action: {
      used_herb_1: "勇者は 薬草を使った！",
      used_herb_2: "勇者の傷が 回復した！",
      used_strong_herb_1: "勇者は 上薬草を使った！",
      used_strong_herb_2: "勇者の傷が 大きく回復した！",
      used_special_herb_1: "勇者は 特薬草を使った！",
      drank_magic_water_1: "勇者は 魔法の聖水を飲んだ！",
      drank_magic_water_2: "勇者のＭＰが １５回復した！",
      drank_sage_water_1: "勇者は 賢者の聖水を飲んだ！",
      drank_sage_water_2: "勇者のＭＰが ４０回復した！",
      holy_water_1: "勇者は 聖水をまいた！",
      holy_water_2: "魔物が 近づけなくなった！",
      torch_1: "勇者は たいまつを灯した！",
      torch_2: "明かりが あたりを照らし出した！",
      lantern_on: "勇者は ランタンに\n火を灯した！",
      lantern_off: "勇者は ランタンの\n火を消した！",
      antidote_1: "勇者は 毒消し草を飲んだ！",
      antidote_2: "体の毒が 消え去った！",
      antidote_not_poisoned: "しかし 毒には冒されていなかった！",
      forest_guide: "森の道標が 神秘的な光を放った！",
      broken_hilt_1: "刃の失われた 剣の柄だ。\n緑竜の紋章が 微かに刻まれている。",
      broken_hilt_2: "しかし 何も起こらない。",
      charm_passive: "持っているだけで\n不思議な加護が 働くようだ。",
      spell_cast: "勇者は {spell}を唱えた！",
      healed: "勇者の傷が 回復した！",
      greatly_healed: "勇者の傷が 大きく回復した！",
      fully_healed: "勇者の傷が 完全に回復した！",
      remira_shine: "光が あたりを明るく照らした！"
    },
    battle: {
      attack: "戦う",
      spell: "呪文",
      item: "道具",
      escape: "逃げる",
      no_magic: "勇者は まだ戦いで\n使える呪文がない！",
      magic_sealed: "呪文は 封じ込まれている！",
      no_items: "使える道具を\n持っていない！"
    },
    battle_log: {
      appeared: "{name}が 現れた！",
      enemy_ambush: "{name}が 突如として襲いかかってきた！",
      player_awake: "勇者は 目を覚ました！",
      player_sleep: "勇者は ぐうぐう眠っている……",
      hero_attack: "勇者の 攻撃！",
      critical_hit: "会心の一撃！！",
      damage_dealt: "{name}に {dmg}ポイントの\nダメージを 与えた！",
      heavy_damage_dealt: "{name}に {dmg}ポイントの\n大ダメージを 与えた！",
      enemy_awake: "{name}は 目を覚ました！",
      enemy_sleep: "{name}は ぐうぐう眠っている……",
      breath_attack: "{name}は {spell}を 吐き出した！",
      hero_damage_heavy: "勇者は {dmg}ポイントの\n大ダメージを 受けた！",
      breath_defended_both: "水霊の盾と火炎の護符が\n猛烈な業火を 打ち払った！",
      breath_defended_shield: "水霊の盾が 炎を防ぐが\n防ぎきれぬ熱気が 身体を焼く！",
      breath_defended_charm: "火炎の護符が 熱を遮るが\nあまりの火炎に 耐えきれない！",
      breath_no_defense: "凄まじい業火が\n勇者を 容赦なく焼き尽くす！！",
      enemy_special_phys: "{name}の {spell}！",
      dragon_claw_hit: "漆黒の爪が 勇者を切り裂く！",
      dragon_armor_defend: "太古の竜鱗の鎧が\n黒竜の猛撃を ガッシリと弾き返した！",
      dragon_armor_penetrated: "鎧を容易く貫通し\n致命的な一撃を 受けてしまった！！",
      enemy_cast: "{name}は {spell}を唱えた！",
      enemy_spell_sealed: "しかし 呪文は封じ込まれている！",
      already_asleep: "しかし 勇者は すでに眠っている！",
      hero_fell_asleep: "勇者は 眠ってしまった！",
      spell_no_effect_hero: "しかし 勇者には 効かなかった！",
      already_sealed: "しかし すでに呪文は 封じられている！",
      hero_spell_sealed: "勇者の呪文が 封じ込まれた！",
      hero_damage: "勇者は {dmg}ポイントの\nダメージを 受けた！",
      enemy_attack: "{name}の 攻撃！",
      enemy_critical: "痛恨の一撃！！",
      poison_defended: "しかし 防疫の護符が\n毒を防ぎ止めた！",
      hero_poisoned: "勇者は 毒を受けてしまった！",
      hero_escape: "勇者は 逃げ出した！",
      escape_failed: "しかし 回り込まれてしまった！",
      enemy_defeated: "{name}を 倒した！",
      exp_gold_gain: "{exp}ポイントの 経験値を獲得！\n{gold}ゴールドを 手に入れた！",
      treasure_drop: "{name}は 宝箱を落としていった！\nなんと {item}を 手に入れた！",
      bag_full_drop: "{name}は 宝箱を落としていった！\nしかし 荷物がいっぱいで 持てない！\n何か 道具を捨ててください。",
      discard_select_msg: "持ち物がいっぱいです。\n捨てる道具を 選んでください。",
      hero_discarded_item: "勇者は {discarded}を 捨てた！\nなんと {dropped}を 手に入れた！",
      hero_defeated: "勇者は 力尽きた……"
    },
    battle_action: {
      used_herb: "勇者は {item}を使った！\n勇者の傷が 回復した！",
      used_strong_herb: "勇者は {item}を使った！\n勇者の傷が 大きく回復した！",
      drank_magic_water: "勇者は {item}を飲んだ！\n勇者のＭＰが {mp}回復した！",
      cured_poison: "勇者は 毒消し草を使った！\n体の毒が 消え去った！",
      not_poisoned: "勇者は 毒消し草を使った！\nしかし 毒には冒されていなかった！",
      cast_spell: "勇者は {spell}を唱えた！",
      fully_healed: "勇者の傷が 完全に回復した！",
      healed: "勇者の傷が 回復した！",
      greatly_healed: "勇者の傷が 大きく回復した！",
      enemy_asleep: "{name}を 眠らせた！",
      enemy_already_asleep: "しかし {name}は\nすでに眠っている！",
      enemy_spell_sealed: "{name}の呪文を\n封じ込んだ！",
      enemy_already_sealed: "しかし すでに呪文は\n封じ込まれている！",
      spell_no_effect: "しかし 効かなかった！"
    },
    player: {
      level_up: "勇者は レベル{level}に 上がった！",
      stat_gain: "最大ＨＰが {hp}ポイント 上がった！\n最大ＭＰが {mp}ポイント 上がった！\n力が {atk}ポイント 上がった！\n身の守りが {def}ポイント 上がった！\n素早さが {spd}ポイント 上がった！",
      learned_spell: "勇者は {spell}の呪文を\n覚えた！"
    },
    shop: {
      buy: "買う",
      sell: "売る",
      leave: "やめる",
      greetings: {
        default: "いらっしゃい！\n何か 用かね？",
        weapon: "いらっしゃい！\n武器や防具を買っていくかい？",
        item: "いらっしゃい！\n旅の道具を揃えているよ。",
        merchant: "いらっしゃい！\n武器や道具を扱っているよ。"
      },
      what_to_buy: "どれを 買うかね？",
      what_to_sell: "どれを 売ってくれるのかね？",
      anything_else: "他に 何か要るかね？",
      buy_confirm: "{name}だね。\n{price}ゴールドになるが 買うかい？",
      sell_confirm: "{name}だね。\n{price}ゴールドで 買い取ろう。",
      cannot_sell_equipped: "それは 装備しているから\n買い取れないよ！",
      inventory_full: "持ち物がいっぱいで\nこれ以上 持てないよ！",
      gold_shortage: "お金が 足りないみたいだね。\n他に 何か要るかね？",
      thank_you_buy: "毎度あり！\n他に 何か要るかね？",
      thank_you_sell: "毎度あり！\n他に 何か売ってくれるかね？"
    },
    inn: {
      greeting: "旅の疲れを 癒やしていくかい？\n一晩 {cost}ゴールド だよ。",
      gold_shortage: "ゴールドが 足りないようだよ。",
      goodbye: "それでは またどうぞ。",
      morning: "おはよう！\n昨夜は よくお休みでしたね。"
    },
    church: {
      greeting: "神のご加護が あらんことを。\nどのような ご用件でしょうか？",
      talk: "話す",
      set_return: "帰還地登録",
      leave: "やめる",
      hint_scholar_1: "指輪の紋章のことでしたら、\n北の遺跡を調査している学者様に\n相談してみてください。",
      hint_scholar_2: "何か手がかりが見つかるよう、\n心よりお祈りしております。",
      hint_general: "迷った時は光を信じて進みなさい。\n目に見えるものは幻です。\n神のご加護が あらんことを……",
      return_registered: "帰ってくる場所を\nこの場所に登録しました。\nルーラを唱えれば\nいつでもここへ戻ってこれます。",
      blessing: "神のご加護が\nあらんことを……"
    },
    slot: {
      title_save: "冒険の書 - 記録",
      title_load: "冒険の書 - 再開",
      current: "現在の冒険の書",
      new_game: "なし（新規冒険）",
      book: "書",
      empty: "空っぽ",
      corrupted: "データ異常",
      current_badge: " [現在]",
      overwrite_title: "記録の上書き確認",
      overwrite_confirm: "冒険の書{slot}には 既に記録があります。\n前の記録を消して 上書きしますか？",
      yes: "はい",
      no: "いいえ",
      back: "戻る",
      backup_export: "バックアップ出力", backup_import: "バックアップ読込"
    },
    field: {
      chest_inventory_full_give_up: "しかし 荷物がいっぱいで 持てない！\n勇者は {item} をあきらめた。",
      chest_give_up: "勇者は {item} をあきらめ、\n宝箱をそっと閉じた。",
      death_exp_lost: "経験値を {exp}ポイント 失ってしまった！",
      light_expired: "明かりが 消えてしまった！",
      holy_water_expired: "清めの効果が\n切れてしまった！",
      dragons_cave_warn_1: "洞窟の最奥から 凄まじい邪気が漂ってくる……！\nこの先へ進めば、もはや後戻りはできない。",
      dragons_cave_warn_2: "決戦に挑む前に\nこれまでの冒険の記録を 残しておこう。",
      chest_locked_altar: "祭壇の長櫃には 二つの鍵穴がある。",
      chest_locked: "鍵がかかっていて 開かない！",
      chest_inventory_full: "持ち物がいっぱいで\n宝箱を開けられない！",
      chest_open_corrada_1: "勇者は 【古びた鍵】と【青銅の鍵】を差し込んだ！",
      chest_open_corrada_2: "カチャリ……！ 長櫃の重厚な封印が解かれた！",
      chest_open_corrada_3: "祭壇の長櫃を開けた！\nなんと 名剣【コラーダ】を手に入れた！",
      chest_open_corrada_4: "剣を手にした瞬間、緑竜の刻印が淡い光を放った……！\n（身体の奥底から 懐かしい力が湧き上がるようだ）",
      chest_open: "宝箱を開けた！\nなんと {item}を手に入れた！",
      chest_empty: "しかし 宝箱は\nからっぽだった。",
      chest_altar_empty: "しかし 長櫃は\nからっぽだった。",
      death_poison: "勇者は 毒によって\n倒れてしまった……\nゴールドが 半分になった！",
      death_normal: "勇者は 倒れてしまった！\nゴールドが 半分になった……",
      death_girl_lost: "\n（女の子は 再び ダンジョン奥へ\n連れ戻されてしまった！）",
      saved_slot: "冒険の書{slot}に\n記録した！",
      loaded_slot: "冒険の書{slot}から\n再開した！",
      data_not_found: "冒険の書{slot}は 空っぽです"
    },
    ending: {
      corrada_broken_1: "黒竜の断末魔とともに 聖剣コラーダは\n眩い光の粒子となって 砕け散った……",
      corrada_broken_2: "手元には 【コラーダの折れた柄】と\n緑竜の紋章の指輪のみが 残された。",
      dwarf_1: "鍛冶屋「おお！ 戻ったか！\nドラゴネーラ島の黒竜を 討ち果たしたのじゃな！",
      dwarf_2: "鍛冶屋「……そして、盟約に従い\n【竜鱗の鎧】を 返しに来てくれたのだな。」",
      dwarf_3: "勇者は 鍛冶屋に\n【竜鱗の鎧】を 返却した！",
      dwarf_4: "鍛冶屋「うむ、確かに受け取った！\nこの太古の剥落鱗は 我がドワーフの里の誇り。\n大切に守り伝えていこう。」",
      dwarf_5: "鍛冶屋「おぬしのおかげで 島と里は救われた。\n海の向こうの大陸へ向かうと聞く……\n大地の加護が あらんことを！」",
      undine_1: "ウンディーネ「黒竜の灼熱の瘴気が 晴れ渡りました。\n災厄の火は 消え去ったのですね。」",
      undine_2: "ウンディーネ「交わした誓いの通り、\n【水霊の盾】を 泉の祭壇へ奉納してください。」",
      undine_3: "勇者は 祭壇へ\n【水霊の盾】を 奉納・返還した！",
      undine_4: "ウンディーネ「精霊の守護は 再び島の霊脈へと還り、\n海流の恵みとなって この地を守り続けるでしょう。」",
      undine_5: "ウンディーネ「その【折れた柄】と指輪が\nあなたを 遥かなる宿命へと導くはずです。\n旅立ちに 水の恵みがあらんことを……」",
      port_1: "船長「おお！ 待ちわびたぜ！\n黒竜が倒れ、沖合を塞いでいた火炎の嵐が\n完全に晴れ渡ったんだ！」",
      port_2: "学者「おお、無事であったか！\n黒竜の死によって 封印は役目を終え、\nコラーダは 砕け散ったのじゃな……」",
      port_3: "学者「だが、手元に残った【折れた柄】と指輪、\nそしておぬし自身の存在こそが、\n大陸の歴史から消された『不敗の騎士』の真実じゃ。」",
      port_4: "町長「島を破滅から救ってくれたおぬしを、\n島民全員が 心から讃えておるぞ！」",
      port_5: "女の子「お兄ちゃん、行っちゃうの……？\n行かないで……！ ずっと一緒にいてよぉ……！」",
      port_6: "船長「大陸への定期船は すでに抜錨の準備完了だ。\n海を渡り、新しい世界に乗り出す時が来たぜ！」",
      port_7: "船長「野郎ども、帆を張れ！ 出航だーーっ！！」"
    },
    events: {
      sister: {
        bag_full: [
          "異国の方ですね。歓迎いたします。\nその指輪の紋章については\n私にはわかりかねますが……",
          "北の遺跡を調査している学者様なら\n何か知っているかもしれません。",
          "旅の安全を祈り 薬草をお渡ししたいのですが、\n持ち物がいっぱいのようですね。\n整理してから またお越しください。"
        ],
        give_herb: [
          "異国の方ですね。歓迎いたします。\nその指輪の紋章については\n私にはわかりかねますが……",
          "北の遺跡を調査している学者様なら\n何か知っているかもしれません。",
          "旅の安全を祈り、こちらをお持ちください。\n（やくそうを手に入れた！）"
        ],
        after: [
          "指輪の紋章のことでしたら、\n北の遺跡にいらっしゃる学者様に\n相談してみてくださいね。",
          "何か手がかりが見つかるよう、\n心よりお祈りしております。"
        ]
      },
      dwarf_soldier: {
        quest_start: [
          "守備兵「最近見かけるようになった黒いリザードマンが、\nトンネル内の魔物たちを統率し始めて 手を焼いているんだ。",
          "守備兵「海底トンネルの中腹あたりで、\n待ち伏せしているという報告がある。",
          "守備兵「腕に自信があるなら、そいつを仕留めてきてくれないか？\n成功したら俺の【火炎の護符】をくれてやるし、\n鍛冶屋の親父にも 宝の鎧を貸してもらえるよう頼んでやる！」"
        ],
        quest_waiting: [
          "守備兵「たった今、報告が入った！\n毒の沼を４つ越えたところで 見かけたと！",
          "守備兵「そいつを仕留めてきてくれたら、\n俺の【火炎の護符】をくれてやるし、\n鍛冶屋の親父にも 宝の鎧を貸すよう頼んでやる！\n急いで急行するんだ！」"
        ],
        bag_full: [
          "守備兵「おお！ あの黒いリザードマンを討ち取ったか！\n約束通り【火炎の護符】を渡したいが、荷物がいっぱいだな。\n整理してから また来てくれ！」"
        ],
        quest_complete: [
          "守備兵「おお！ あの黒いリザードマンを討ち取ったか！\nこれでトンネルの安全も 保たれるというものだ。",
          "守備兵「約束通り、俺の【火炎の護符】をくれてやる！\n（【火炎の護符】を手に入れた！）",
          "守備兵「お前なら黒竜にも立ち向かえるかもしれんな。\n鍛冶屋の親父にも 話を通しておいてやるよ！」"
        ],
        after: [
          "守備兵「お前の強さなら、黒竜にも立ち向かえるかもしれんな。\n鍛冶屋の親父のところで 鎧を仕立ててもらうんだな！」"
        ]
      },
      blacksmith: {
        need_trust: [
          "鍛冶屋「ん？ なんだおぬし。\nよそ者に村の宝を 易々と貸せるわけがなかろう。",
          "鍛冶屋「村の守備兵が トンネルの魔物に手を焼いておる。\nまずは腕っぷしを証明し、信頼を勝ち取ってくるんじゃな！」"
        ],
        wearing: [
          "鍛冶屋「太古の黒竜の剥落鱗で作った【竜鱗の鎧】、\nその着心地はどうじゃ？",
          "鍛冶屋「黒竜を討ち果たしたら、\n我がドワーフの神体、必ず返しに来るんじゃぞ！」"
        ],
        bag_full: [
          "鍛冶屋「おお！ その【ケルベロスの鬣】を\n持ち帰ってくれたのか！",
          "鍛冶屋「すぐに鎧を仕立て直したいが、\n荷物がいっぱいのようじゃな。\n道具を整理してから また来なさい！」"
        ],
        craft_success: [
          "鍛冶屋「おお！ 竜の洞窟の門番たる\n灼熱の【ケルベロス】を 討ち果たしてくれたか！",
          "鍛冶屋「よし！ この鬣を耐火インナーとして織り込み、\n黒竜の剥落鱗をおぬしの体格に合わせて\n突貫で仕立て直してやるぞ！",
          "カン！ カン！ カン！ ……ジューッ！！",
          "鍛冶屋「完成じゃ！ 最高硬度の物理防御と耐火性を誇る\nドワーフ秘伝の【竜鱗の鎧】を受け取るがよい！\n（【竜鱗の鎧】を手に入れた！）」",
          "鍛冶屋「よいか、黒竜を討ち倒したあかつきには、\n必ず儂のところへ返しに来るんじゃぞ！」"
        ],
        ask_quest: [
          "鍛冶屋「……むむ！？ おぬしが手挟んでいるその剣は、\nかつて英雄が振るった名剣【コラーダ】ではないか！",
          "鍛冶屋「その剣の主ならば、黒竜を倒す資格がある。\n我が里の神体『太古の黒竜の剥落鱗』で作られた\n最高硬度の【竜鱗の鎧】を貸してやりたいところじゃが……",
          "鍛冶屋「ドワーフ規格の鎧は幅広・短身ゆえ、\nそのままでは人間の体格に合わんのじゃ。",
          "鍛冶屋「切削不能な外殻の隙間を埋め、かつ高熱を防ぐ\n緩衝ライナーとして、竜の洞窟の入口を塞ぐ魔獣\n【ケルベロス】の鬣が必要じゃ！",
          "鍛冶屋「竜の洞窟へ向かい、【ケルベロス】を倒して\n【ケルベロスの鬣】を持ち帰ってくだされ！\n突貫でおぬし専用のサイズに仕立て直してやろう！」"
        ],
        quest_waiting: [
          "鍛冶屋「どうした！ 【ケルベロスの鬣】はまだか！",
          "鍛冶屋「竜の洞窟へ向かい、【ケルベロス】を倒して\n【ケルベロスの鬣】を持ち帰るんじゃ！"
        ],
        busy: [
          "鍛冶屋「何か用か！\n今忙しいんじゃ！！"
        ]
      },
      elf: {
        dummy: [
          "僕はエルフ。この神殿の守り手さ。",
          "森の奥へは行かない方がいいよ。危険な魔物がいるからね。"
        ],
        has_corrada: [
          "ついに 伝説の剣【コラーダ】を手に入れたんだね！\n君のその指輪の紋章と共鳴しているように見えるよ。",
          "でも、黒竜の恐ろしい爪撃を防ぐには\n今の防具では まだ耐えきれないだろう。",
          "島の北東の海岸から、ドワーフの隠れ里へ続く\n【海底トンネル】に入ることができるはずだ。",
          "彼らなら、太古の黒竜の剥落鱗から作られた\n強固な鎧を持っていると聞いたことがある。\n北東の海岸へ向かってみて！"
        ],
        has_shield: [
          "ウンディーネから【水霊の盾】を授かったんだね！\nその盾があれば、黒竜の灼熱の炎をも\n防ぐことができるはずだ。",
          "地下神殿への入口は、この神殿の西にある\n地下墓地の奥深くから通じているよ。",
          "地下神殿の奥には、かつて緑竜が授けたという\n伝説の剣【コラーダ】が眠っている。",
          "地下神殿には恐ろしい魔物たちが蠢いている。\nくれぐれも気をつけて行くんだよ。"
        ],
        need_shield: [
          "その装備で地下神殿の化け物や\n黒竜と戦うのは無謀だよ。",
          "森の最深部の祠にいるウンディーネに\n会いに行ってごらん。\n彼女が【水霊の盾】を持っているはずだ。",
          "森の最深部へは、この神殿の北東の森から\n行くことができるよ。"
        ],
        return_ring: [
          "あっ……！ その指輪は、彼女の……！\n地下墓地の魔物から 取り戻してくれたんだね！",
          "ありがとう……！ 本当にありがとう！\n約束通り、この【森の道標】を君にあげよう。\n（【森の道標】を手に入れた！）",
          "……君は、本当に黒竜を倒すつもりなんだね。",
          "その装備で地下神殿の恐ろしい化け物とは戦えないよ。\nまして黒竜とは なおさらだ。",
          "森の最深部の祠に ウンディーネがいる。\n彼女が【水霊の盾】を持っているはずだから、\nまず会いに行ってみて。",
          "森の最深部へは、この神殿の北東の森から\n入ることができるよ。"
        ],
        quest_start: [
          "この神殿は 遥か昔に建てられたものさ。\nかつては僕たちエルフが 守護していたが、\n大戦乱の時代に 皆この島を去ってしまった。",
          "僕だけが この島に残り、\n今もこの神殿に 居続けているというわけさ。\nなぜって？……ここは、僕の恋人が眠る場所だからね。",
          "だが……地下墓地の魔物に、\n僕の恋人が大事にしていた指輪を\n奪われてしまったんだ。",
          "お願いだ。地下墓地の魔物から\n【恋人の指輪】を 取り戻してもらえないかい？",
          "取り戻してくれたら、【森の道標】を君にあげるよ。\nエルフの僕には もう必要のないものだからね。",
          "地下神殿には 今は直接入れないけれど、\n地下墓地から 入る道があるはずだ。\n地下墓地は 神殿の西に入口があるよ。"
        ],
        quest_waiting: [
          "地下墓地は この神殿の西に入口があるよ。\nどうか 魔物から【恋人の指輪】を\n取り戻してほしいんだ。",
          "指輪を取り戻してくれたら、\n約束通り【森の道標】を渡すよ。"
        ]
      },
      undine: {
        after: [
          "ウンディーネ「【水霊の盾】が あなたの力となりますように。\nエルフの待つ神殿へ戻り、\nどうかご無事で 旅をお続けください。」"
        ],
        bag_full: [
          "ウンディーネ「エルフから もう話は聞きました。\n【水霊の盾】をお渡ししたいのですが、\n荷物がいっぱいのようです。」",
          "ウンディーネ「持ち物を整理してから\n再び 訪れてください。」"
        ],
        give_shield: [
          "ウンディーネ「エルフから もう話は聞きました。\n緑竜より預かりし【水霊の盾】をお貸ししましょう。」",
          "（【水霊の盾】を手に入れた！）",
          "ウンディーネ「その盾は 古の加護を帯び、\n黒竜の灼熱の炎をも 払い除ける力を宿しています。」",
          "ウンディーネ「黒竜に立ち向かう勇気ある者よ、\nどうかご無事で……」"
        ]
      },
      lighthousekeeper: {
        initial: [
          "目が覚めたかい？\nこのまま起きないのじゃないかと思ったよ……\nお前はタフな男だな。\nあんな嵐で生き残るなんて。",
          "何も覚えていないのか？\n海岸で倒れていたから助けたが……\nまずは、元気になってよかった。",
          "しかし、記憶がないってのは困ったものだな\n俺のような一介の灯台守では、何もしてやれない",
          "そうだ\nとりあえず教会へ行って\n相談してみたらどうだ？",
          "それとその指輪、\n何か身元の手がかりになりそうじゃないか。\n金色の盾に緑の竜の紋章。",
          "外に出ればすぐに町は見えるから\n気を付けて行くんだぞ。"
        ],
        after: [
          "まずは、元気になってよかった。\nなにか思い出したかい？"
        ]
      },
      scholar: {
        dummy: [
          "ほほほ、わしはこの遺跡を\n調査しておる学者じゃ。",
          "この遺跡は かなり古い時代のものでな。\n奥には 貴重な碑文があるらしいのじゃが……",
          "魔物が住み着いてしまって、\n調査が進まんのじゃよ。"
        ],
        port_corrada: [
          "おお！ その手に輝くのは 名剣【コラーダ】！\nついに 神殿の遺産を手にしたのじゃな！",
          "じゃが 古文書の記述によれば、黒竜の猛撃を\n防ぐには まだ防具が心許ない。",
          "島の北東の海岸に、海底深くへと続く\n【海底トンネル】の入口があるそうじゃ。",
          "その先にある ドワーフの隠れ里へ行けば、\n竜の爪を弾く【竜鱗の鎧】が 手に入るやもしれん。\n北東の海岸へ向かうのじゃ！"
        ],
        port_initial: [
          "おお、無事に来てくれたな！\n儂はこの図書館で、あの石碑と指輪の紋章について\n古文書を調べておったところじゃ。",
          "古文書によれば、かつて大陸より訪れた英雄が\n緑竜の加護を受け、災厄の黒竜を討伐したとある。\nそして英雄は二つの遺産を島に残したそうじゃ。",
          "黒竜の炎を遮る【水霊の盾】と、\n竜の強固な鱗を貫く名剣【コラーダ】じゃ。\nどちらも島の中央、迷いの森と神殿の奥に眠っておる。",
          "……それにしても、おぬしの指輪の紋章は\nかの英雄のものとあまりに酷似しておる。\nだが大陸の記録では、英雄の直系は途絶えたはず……",
          "おぬしが何者なのか、儂にもまだ分からん。\nだが、迷いの森の遺産を手にすることができれば、\nその答えは海の向こうの大陸で見つかるかもしれんな。"
        ],
        cave_reported: [
          "おお、あの魔物を倒し、\n碑文を調べたのか！",
          "ふむふむ。。。\n・・・・ ・・・・ ・・・・",
          "やはり、石碑にも盾と竜の紋章が刻まれておったか\nこれは更なる調査が必要なようじゃ・・・。",
          "自身のことが知りたければ\nまた港町の図書館で会おうではないか\n儂は先に北東の港町の図書館へ向かうぞ",
          "学者は慌てた様子で去って行ってしまった。"
        ],
        cave_initial: [
          "ほほほ、わしはこの遺跡を\n調査しておる学者じゃ。",
          "ほう、指輪の紋章を見てほしいと？\nどれどれ・・・。",
          "……むむ！？ この紋章の指輪をどこで？！\n異国の者がこの紋章を・・・",
          "・・・ ・・・ ・・・\n・・・ ・・・ ・・・",
          "実はこの遺跡の奥に同じ紋章が刻まれた石碑がある\n儂も若いころに一度見たきりじゃが・・・。",
          "今ではこの遺跡には魔物たちが住み着いてしまって\n奥の様子を調査することが出来ぬのじゃ",
          "特に奥の方には像の魔物が住んでおり\n遺跡の奥を調べることはもはやできん。",
          "おぬしの素性を知りたいのなら、\nこの遺跡の奥の石碑を調べてみるがよい。\nなにか手掛かりが分かるかもしれん",
          "もし、像の魔物を倒し石碑を調べたならば\n儂の所に戻ってくるのじゃ、なにか出来るかもしれん。"
        ],
        cave_waiting: [
          "おぬしの素性を知りたいのなら、\nこの遺跡の奥の石碑を調べてみるがよい。\nなにか手掛かりが分かるかもしれん",
          "もし、像の魔物を倒し石碑を調べたならば\n儂の所に戻ってくるのじゃ、なにか出来るかもしれん。"
        ]
      },
      guard: {
        pass_ok: [
          "町長さんの【手形】を持っているな。\nよし、通っていいぞ！"
        ],
        pass_ng: [
          "ここから先は港町だ。\n町長さんの【手形】がないと\n通すわけにはいかないな！"
        ]
      },
      mayor: {
        has_pass: [
          "町の女の子を助けてくれたこと、\n決して忘れんぞ。\n港町への旅、道中気をつけるのじゃぞ。"
        ],
        bag_full: [
          "町長「町の女の子を助けてくれたこと、\n本当に感謝しておる！",
          "町長「約束の【通行手形】を渡したいが、\n荷物がいっぱいのようじゃな。\n持ち物を整理してから 来てくだされ。」"
        ],
        give_pass: [
          "町長「旅の者よ！\n連れ去られた女の子を無事に助け出してくれたのか！\n本当によかった……！」",
          "町長「町の者を救ってくれたおぬしを見直したぞ。\n約束通り、これを受け取るがよい！\n（【通行手形】を手に入れた！）」",
          "町長「これがあれば、港町への関所を通れるはずじゃ。\n道中くれぐれも気をつけてな。」"
        ],
        waiting_rescue: [
          "東のダンジョンへ向かい、\nどうか町の女の子を助けてくだされ……！\n無事に戻ったあかつきには、\n必ず【手形】をお渡しする！"
        ],
        quest_start: [
          "なに？ 港町へ行くための【手形】が欲しいと？\n……ふむ、おぬしは見慣れぬ異国人じゃな。\n身元も定かでない者に、\n手形を発行するわけにはいかんのじゃ。",
          "・・・ ・・・・ ・・・\n・・・ ・・・ ・・・",
          "……なにっ！？\n\n た、大変じゃ！\nたった今、町の者が知らせに来たのじゃが……",
          "町の小さな女の子が東のダンジョンの\nモンスターに連れ去られてしまったのじゃ！",
          "頼む！ 旅の者よ！\nあの子を無事に助け出してくれ！\n連れ戻してくれたなら、\n礼として【手形】を発行しよう！"
        ],
        default: [
          "わしがこの町の町長じゃ。\n何か用かね？\n……特に用がないなら、\n町でゆっくり休んでいくがよい。"
        ]
      },
      girl: {
        in_dungeon_scared: [
          "女の子「きゃあっ！ 助けて！\nあっちの魔物が怖くて動けないの！」"
        ],
        in_dungeon_rescued: [
          "女の子「助けてくれてありがとう！\n町の町長さんのところまで、\nおねがいします。一緒に連れて帰って！」",
          "（町の女の子が同行することになった！\n無事に始まりの町へ送り届けよう）"
        ],
        in_town_rescued: [
          "あっ、助けてくれたお兄ちゃん！\n無事におうちに帰れたよ、ありがとう！"
        ],
        in_town_default: [
          "こんにちは！\nお兄さん、かっこいいね。\n気をつけて旅を続けてね。"
        ]
      }
    },
    map_names: {
      first_island: "始まりの島",
      lighthousekeeper_cottage: "灯台守の小屋",
      cave: "北の遺跡",
      dungeon: "ダンジョン",
      first_dungeon2: "ダンジョン2",
      first_town: "始まりの町",
      first_church: "始まりの町の教会",
      inn: "始まりの町の宿屋",
      armor_shop: "始まりの町の武器屋",
      general_shop: "始まりの町の道具屋",
      port_town: "港町",
      port_church: "港町の教会",
      port_inn: "港町の宿屋",
      port_armor_shop: "港町の武器屋",
      port_general_shop: "港町の道具屋",
      forest: "迷いの森",
      forest2: "迷いの森",
      forest3: "迷いの森",
      temple: "神殿跡",
      deep_forest: "迷いの森深部",
      temple11: "地下墓地 地下1階",
      temple21: "地下墓地 地下2階",
      temple22: "地下墓地2階",
      temple3: "地下神殿",
      undersea_tunnel1: "海底トンネル",
      undersea_tunnel2: "海底トンネル",
      undersea_tunnel3: "海底トンネル",
      dwarf_village: "ドワーフ村",
      dwarf_village_general_shop: "ドワーフ村の道具屋",
      dragonera_island: "ドラゴネーラ島",
      dragons_cave1: "竜の洞窟",
      dragons_cave2: "竜の洞窟"
    },
    map_objects: {
      cave_monument: [
        "石碑には 盾と竜の紋章が 刻まれている……\nさらに 短い碑文が 彫られている。",
        "『古の緑竜より授かりし\n我が剣を長櫃に収めた\n資格持ちし者あらわれし時\n再びその使命を果たさん\n船出の前に…』",
        "この先は かすれて 良く読めない。"
      ],
      port_town_bookshelf: [
        "本棚には 古びた記録が 並んでいる……\n【島の古文書：白銀の記録】",
        "『……かつて海を越え 大陸より訪れし騎士、\n緑竜の加護を帯びて黒竜を討ち滅ぼす。\n騎士は自らの剣「コラーダ」と「水霊の盾」を\nこの地に託し 再び大陸へと去りぬ。』",
        "『……追記：大陸の記録によれば、\nかの騎士の家系は 後の戦乱にて後継者を失い、\nその血脈は すでに途絶えたと伝えられる。』"
      ],
      temple11_notebook: [
        "ボロボロの古びたノートが落ちている。",
        "「……主はこの不気味な古代神殿の最奥を、剣の封印地とお決めになった。",
        "騎士様はあの恐ろしい青銅の巨兵と刃を交え、ついにこれを沈黙させられた……」",
        "他は読むことが出来なかった。"
      ],
      temple22_notebook: [
        "血に染まった 古い手記が落ちている。",
        "「……主は祭壇の長櫃に細工を施し、二重の鍵をかけられた。",
        "一つは、主がお持ちになったあの鉄の鍵だ。",
        "だが、もう一つの青銅の鍵は……再び動き出したあの巨兵の体内に、戻されてしまった。",
        "二つの鍵が揃わぬ限り、剣が……」",
        "（文字は ここで途切れている……）"
      ]
    },
    map_npcs: {
      first_town_woman: ["こんにちは！\nここは始まりの町よ。", "気をつけて旅を続けてね。"],
      first_town_port_youth: ["最近はモンスターが増えて", "おちおち外に出られないよ", "特に森は危ないから注意しろよ"],
      first_town_town_man: ["ここは平和な町だよ。\n外には魔物が出るから気をつけな。"],
      first_church_inn_guest: ["復活の祈りをしておきなよ。"],
      first_church_inn_keeper: ["神様が救ってくれますよ。"],
      inn_inn_guest: ["ふう、ベッドで寝ると\n傷がすっかり治るよ。"],
      port_town_port_worker: [
        "ドラゴンのせいで船が出せないんだよ。\n荷が運べなきゃ、仕事もお手上げだ。",
        "あんな怪物を倒せる奴なんて、\nこの島にいるわけねぇだろ……"
      ],
      port_town_port_woman: [
        "大陸との交易が途絶えてから、\n町に入ってくる物資が減る一方よ……",
        "昔みたいに平和な港町に戻ってほしいわ。"
      ],
      port_town_port_youth: [
        "こんなちっぽけな島の港町だけど、\n立派な図書館がこの町の誇りさ。",
        "昔の英雄の記録や、島の古い歴史が\nたくさん眠ってるらしいぜ。\nあんたも読んでみたらどうだ？"
      ],
      port_town_port_old_woman: [
        "黒竜が海を塞いでから、もうどれくらい経つかねぇ……",
        "かつて大陸から来た英雄様のように、\n海を切り拓く者が現れてくれんものかね。"
      ],
      port_town_captain: [
        "大陸へ向かう定期船を出したいのは山々だが、\n沖合のドラゴネーラ島に陣取る黒竜のせいで船が出せん。",
        "あの黒竜の灼熱の炎は、船の甲板どころか\n鋼鉄の鎧すら一瞬で焼き溶かす。\n生身で近づけば 船ごと灰にされるのがオチだ。",
        "黒竜を討ち果たすか、あるいは炎を防ぐ\n手立てでもなければ 出航はできんよ。"
      ],
      port_inn_inn_guest: [
        "島の中央にある迷いの森は木が生い茂り真っ暗だぞ。\n行くなら雑貨屋で【ランタン】と【毒消し草】を\nしっかり揃えてから向かうんだな。",
        "あの森は木が勝手に動き回るから、\n奥へ行くなら神殿の地下にあるという\n【森の道標】がないと迷子になるぜ。"
      ],
      port_inn_bard: [
        "わたくしは吟遊詩人です。\nこの島に伝わる古い詩を ご存じですか？",
        "『波間に消えし黄金の盾、緑の竜は誰を待つ。\n絶えたるはずの血脈が、黒き災厄を再び祓わん……』",
        "島の中央、動く木々の奥深くに眠る古き遺産……\n大陸へと続く航路を閉ざす黒竜に、\n立ち向かう鍵が そこにあると歌われています。"
      ],
    }
    // items, spells, monsters は完全パージ
  },
  en: {
    common: {
      yes: "Yes",
      no: "No",
      back: "Back"
    },
    title: {
      new_game: "New Game",
      load_game: "Load Game",
      lang: "Language: English",
      theater: "Theater",
      theater_fall: "Fall of Black Dragon",
      theater_ending: "Ending",
      theater_back: "Back"
    },
    system: {
      theater_unlocked: "Congratulations on clearing the game!\n\n'Theater' mode has been added to the Title Screen.\nYou can now replay cinematics anytime."
    },
    ui: {
      status: "STATUS",
      items: "ITEMS",
      equipment: "EQUIP",
      none: "None",
      poison_badge: " [POISON]",
      controls: "[CONTROLS]\nMove: Arrows / WASD\nConfirm: Space / Enter\nCancel: X / ESC\nBGM: M / SE: N"
    },
    menu: {
      spell: "Spells",
      item: "Items",
      equip: "Equip",
      recall: "Recall",
      load: "Load",
      save: "Save",
      quit: "Quit",
      use: "Use",
      drop: "Drop",
      back: "Back",
      quit_confirm: "Are you sure you want to quit?\n(Unsaved progress will be lost)",
      drop_confirm: "Are you sure you want\nto discard {name}?",
      cannot_drop_equipped: "You cannot discard equipped items!",
      cannot_drop_key: "This is an important item!\nYou cannot discard it!",
      inventory_full_unequip: "Inventory is full!\nCannot unequip item!",
      unequipped: "Hero unequipped {name}!",
      equipped: "Hero equipped {name}!",
      dropped: "Hero discarded {name}!",
      full_hp: "HP is already full!",
      full_mp: "MP is already full!",
      cannot_use_here: "Cannot use that here!",
      no_return_point: "No return point registered!",
      girl_priority: "You must escort the girl safely back to town first!",
      mp_shortage: "Not enough MP!"
    },
    objectives: {
      talk_sister: "[Current Objective]\nGo to the church in Starting Town\nand ask the sister about the ring.",
      find_scholar: "[Current Objective]\nHead to the Northern Cave and meet\nthe scholar investigating the ruins.",
      report_scholar: "[Current Objective]\nReport the findings from the monument\nto the scholar near the cave entrance.",
      investigate_monument: "[Current Objective]\nDefeat the monster deep in Northern Cave\nand examine the ancient monument.",
      return_girl: "[Current Objective]\nEscort the rescued girl safely back\nto the Mayor of Starting Town.",
      rescue_girl: "[Current Objective]\nHead deep into the Eastern Dungeon\nand rescue the kidnapped girl.",
      consult_mayor: "[Current Objective]\nConsult the Mayor of Starting Town\nto obtain a Travel Pass.",
      cross_checkpoint: "[Current Objective]\nPass through the eastern checkpoint\nand head toward the Port Town.",
      go_library: "[Current Objective]\nPass through the eastern checkpoint\nand visit the library in Port Town.",
      find_temple: "[Current Objective]\nTraverse the central Lost Forest\nand find the temple hidden within.",
      deliver_ring: "[Current Objective]\nDeliver the recovered Lover's Ring\nto the elf at the Temple Ruins.",
      recover_ring: "[Current Objective]\nInfiltrate the catacombs west of the temple\nand retrieve the Lover's Ring from monsters.",
      obtain_water_shield: "[Current Objective]\nProceed northeast into the Deep Forest\nand receive the Water Spirit Shield from Undine.",
      obtain_corrada: "[Current Objective]\nInfiltrate the Underground Temple through the catacombs\nand claim the legendary sword Colada.",
      seek_dwarf_village: "[Current Objective]\nPass through the Undersea Tunnel on the northeast\ncoast and reach the hidden dwarven village.",
      seek_armor_clues: "[Current Objective]\nSword Colada obtained! Speak with the elf\nor the scholar to seek clues for dragon-proof armor.",
      defeat_black_lizard: "[Current Objective]\nDefeat the Black Lizardman lurking\naround the middle of the Undersea Tunnel.",
      report_black_lizard: "[Current Objective]\nBlack Lizardman defeated!\nReport to the guard in the dwarven village.",
      consult_blacksmith: "[Current Objective]\nEarned the guard's trust!\nSpeak to the blacksmith in the dwarven village.",
      deliver_mane: "[Current Objective]\nDeliver the obtained Cerberus Mane\nto the blacksmith in the dwarven village.",
      defeat_cerberus: "[Current Objective]\nDefeat Cerberus in the dragon's cavern\nand obtain the mane needed for the armor.",
      defeat_black_dragon: "[Current Objective]\nFinal equipment gathered! Head to the crater\nof Dragonera Island and vanquish the Black Dragon."
    },
    menu_action: {
      used_herb_1: "Hero used Medicinal Herb!",
      used_herb_2: "Wounds were healed!",
      used_strong_herb_1: "Hero used Strong Herb!",
      used_strong_herb_2: "Wounds were greatly healed!",
      used_special_herb_1: "Hero used Special Herb!",
      drank_magic_water_1: "Hero drank Magic Water!",
      drank_magic_water_2: "Restored 15 MP!",
      drank_sage_water_1: "Hero drank Sage's Water!",
      drank_sage_water_2: "Restored 40 MP!",
      holy_water_1: "Hero sprinkled Holy Water!",
      holy_water_2: "Monsters cannot approach!",
      torch_1: "Hero lit a Torch!",
      torch_2: "Light illuminated the surroundings!",
      lantern_on: "Hero lit the Lantern!",
      lantern_off: "Hero put out the Lantern!",
      antidote_1: "Hero took Antidotal Herb!",
      antidote_2: "The poison vanished!",
      antidote_not_poisoned: "However, was not poisoned!",
      forest_guide: "The Forest Guide emitted a mystic light!",
      broken_hilt_1: "A sword hilt without a blade.\nA green dragon crest is faintly engraved.",
      broken_hilt_2: "However, nothing happened.",
      charm_passive: "Carrying it seems to grant\nmysterious protection.",
      spell_cast: "Hero cast {spell}!",
      healed: "Wounds were healed!",
      greatly_healed: "Wounds were greatly healed!",
      fully_healed: "Wounds were fully healed!",
      remira_shine: "Light brightly lit the area!"
    },
    battle: {
      attack: "Fight",
      spell: "Spell",
      item: "Item",
      escape: "Run",
      no_magic: "No spells available\nfor battle!",
      magic_sealed: "Magic is sealed!",
      no_items: "No usable items\nin possession!"
    },
    battle_log: {
      appeared: "{name} appeared!",
      enemy_ambush: "{name} launched a surprise attack!",
      player_awake: "The Hero woke up!",
      player_sleep: "The Hero is fast asleep...",
      hero_attack: "The Hero attacks!",
      critical_hit: "A critical hit!!",
      damage_dealt: "Dealt {dmg} damage\nto {name}!",
      heavy_damage_dealt: "Dealt a massive {dmg} damage\nto {name}!",
      enemy_awake: "{name} woke up!",
      enemy_sleep: "{name} is fast asleep...",
      breath_attack: "{name} spewed {spell}!",
      hero_damage_heavy: "The Hero took a massive\n{dmg} damage!",
      breath_defended_both: "The Water Spirit Shield and Fire Ward\nwarded off the fierce flames!",
      breath_defended_shield: "The shield protects, but the\nunbearable heat burns the body!",
      breath_defended_charm: "The charm blocks heat, but cannot\nwithstand the inferno!",
      breath_no_defense: "A merciless blaze consumes the Hero!!",
      enemy_special_phys: "{name}'s {spell}!",
      dragon_claw_hit: "Pitch-black claws slash the Hero!",
      dragon_armor_defend: "The ancient dragon scale armor\nsolidly deflected the fierce strike!",
      dragon_armor_penetrated: "Pierced easily through armor,\nsuffering a fatal blow!!",
      enemy_cast: "{name} cast {spell}!",
      enemy_spell_sealed: "But magic is sealed!",
      already_asleep: "But the Hero is already asleep!",
      hero_fell_asleep: "The Hero fell asleep!",
      spell_no_effect_hero: "But it had no effect on the Hero!",
      already_sealed: "But magic is already sealed!",
      hero_spell_sealed: "The Hero's magic was sealed!",
      hero_damage: "The Hero took {dmg} damage!",
      enemy_attack: "{name} attacks!",
      enemy_critical: "A devastating blow!!",
      poison_defended: "However, the Poison Ward stopped the poison!",
      hero_poisoned: "The Hero was poisoned!",
      hero_escape: "The Hero ran away!",
      escape_failed: "But was cornered!",
      enemy_defeated: "Defeated {name}!",
      exp_gold_gain: "Gained {exp} EXP!\nAcquired {gold} Gold!",
      treasure_drop: "{name} dropped a chest!\nFound {item}!",
      bag_full_drop: "{name} dropped a chest!\nInventory is full! Choose an item to discard.",
      discard_select_msg: "Inventory is full.\nSelect an item to discard.",
      hero_discarded_item: "The Hero discarded {discarded}!\nFound {dropped}!",
      hero_defeated: "The Hero has collapsed..."
    },
    battle_action: {
      used_herb: "Hero used {item}!\nWounds were healed!",
      used_strong_herb: "Hero used {item}!\nWounds were greatly healed!",
      drank_magic_water: "Hero drank {item}!\nRestored {mp} MP!",
      cured_poison: "Hero used Antidotal Herb!\nThe poison was cured!",
      not_poisoned: "Hero used Antidotal Herb!\nBut was not poisoned!",
      cast_spell: "Hero cast {spell}!",
      fully_healed: "Wounds were fully healed!",
      healed: "Wounds were healed!",
      greatly_healed: "Wounds were greatly healed!",
      enemy_asleep: "Put {name} to sleep!",
      enemy_already_asleep: "But {name} is\nalready asleep!",
      enemy_spell_sealed: "Sealed {name}'s magic!",
      enemy_already_sealed: "But magic is already sealed!",
      spell_no_effect: "But it had no effect!"
    },
    player: {
      level_up: "The Hero reached level {level}!",
      stat_gain: "Max HP +{hp}!\nMax MP +{mp}!\nStrength +{atk}!\nResilience +{def}!\nAgility +{spd}!",
      learned_spell: "The Hero learned\n{spell}!"
    },
    shop: {
      buy: "Buy",
      sell: "Sell",
      leave: "Leave",
      greetings: {
        default: "Welcome!\nHow can I help you?",
        weapon: "Welcome!\nLooking to buy weapons or armor?",
        item: "Welcome!\nWe've got all the travel supplies you need.",
        merchant: "Welcome!\nI deal in weapons and adventuring gear."
      },
      what_to_buy: "What would you like to buy?",
      what_to_sell: "What would you like to sell?",
      anything_else: "Anything else?",
      buy_confirm: "{name}, right?\nThat'll be {price} gold. Buy it?",
      sell_confirm: "{name}, right?\nI can buy it for {price} gold.",
      cannot_sell_equipped: "You have that equipped!\nI cannot buy it!",
      inventory_full: "Your bag is full!\nYou cannot carry any more!",
      gold_shortage: "You do not have enough gold.\nNeed anything else?",
      thank_you_buy: "Thank you!\nAnything else?",
      thank_you_sell: "Thank you!\nAnything else to sell?"
    },
    inn: {
      greeting: "Care to rest your weary bones?\nIt's {cost} gold a night.",
      gold_shortage: "You do not have enough gold.",
      goodbye: "Come back anytime.",
      morning: "Good morning!\nDid you rest well last night?"
    },
    church: {
      greeting: "May the divine blessings be upon you.\nWhat is your request?",
      talk: "Talk",
      set_return: "Set Return Point",
      leave: "Leave",
      hint_scholar_1: "If it is about the ring's crest,\nplease consult the scholar\ninvestigating the northern ruins.",
      hint_scholar_2: "I pray with all my heart that\nyou may find a clue.",
      hint_general: "When lost, believe in the light and press forward.\nWhat you see may be an illusion.\nMay the divine blessings be upon you...",
      return_registered: "This place has been registered\nas your return destination.\nCast Zoom to return here anytime.",
      blessing: "May the divine blessings\nbe upon you..."
    },
    slot: {
      title_save: "Log of Adventure - Save",
      title_load: "Log of Adventure - Load",
      current: "Current Log",
      new_game: "None (New Adventure)",
      book: "Log ",
      empty: "Empty",
      corrupted: "Corrupted",
      current_badge: " [Active]",
      overwrite_title: "Overwrite Confirmation",
      overwrite_confirm: "Log {slot} already contains data.\nDo you want to overwrite it?",
      yes: "Yes",
      no: "No",
      back: "Back",
      backup_export: "Export Save Data", backup_import: "Import Save Data"
    },
    field: {
      chest_inventory_full_give_up: "But your bag is full!\nThe Hero gave up on {item}.",
      chest_give_up: "The Hero gave up on {item}\nand closed the chest.",
      death_exp_lost: "Lost {exp} EXP points!",
      light_expired: "The light has gone out!",
      holy_water_expired: "The holy protection\nhas worn off!",
      dragons_cave_warn_1: "A dreadful malice drifts from deep within the cave...!\nOnce you proceed, there is no turning back.",
      dragons_cave_warn_2: "Before challenging the final battle,\nlet us record the tale of your journey.",
      chest_locked_altar: "There are two keyholes on the altar's coffer.",
      chest_locked: "It is locked and will not open!",
      chest_inventory_full: "Inventory is full!\nCannot open the treasure chest!",
      chest_open_corrada_1: "The Hero inserted the Ancient Key and Bronze Key!",
      chest_open_corrada_2: "Click...! The heavy seal of the coffer was undone!",
      chest_open_corrada_3: "Opened the altar's coffer!\nAcquired the legendary sword Colada!",
      chest_open_corrada_4: "The moment you held the sword, the green dragon seal radiated light...!\n(A familiar power seems to surge from deep within.)",
      chest_open: "Opened the treasure chest!\nFound {item}!",
      chest_empty: "However, the chest\nwas empty.",
      chest_altar_empty: "However, the coffer\nwas empty.",
      death_poison: "The Hero collapsed\nfrom poison...\nLost half of all gold!",
      death_normal: "The Hero collapsed!\nLost half of all gold...",
      death_girl_lost: "\n(The girl was taken back\ndeep into the dungeon!)",
      saved_slot: "Saved to Log {slot}!",
      loaded_slot: "Resumed from Log {slot}!",
      data_not_found: "Log {slot} is empty."
    },
    ending: {
      corrada_broken_1: "With the Black Dragon's dying curse,\nthe sacred sword Colada shattered into particles of light...",
      corrada_broken_2: "In your hands, only the Broken Colada Hilt\nand the ring of the Green Dragon remained.",
      dwarf_1: "Blacksmith: \"You returned!\nYou truly vanquished the Black Dragon of Dragonera!\"",
      dwarf_2: "Blacksmith: \"...And true to our pact,\nyou have come to return the Dragon Scale Armor.\"",
      dwarf_3: "The Hero returned the\nDragon Scale Armor to the blacksmith!",
      dwarf_4: "Blacksmith: \"Aye, I have received it!\nThis ancient scale is the pride of our village.\nWe shall protect and pass it down.\"",
      dwarf_5: "Blacksmith: \"Thanks to you, our island and village are saved.\nI hear you head across the sea...\nMay the blessing of the earth be with you!\"",
      undine_1: "Undine: \"The scorching miasma of the Black Dragon has cleared.\nThe flames of disaster have vanished at last.\"",
      undine_2: "Undine: \"As promised in our vow,\nplease offer the Water Spirit Shield upon the spring altar.\"",
      undine_3: "The Hero returned and offered\nthe Water Spirit Shield to the altar!",
      undine_4: "Undine: \"The spirit's protection returns to the island's veins,\nbecoming oceanic blessings to guard this land.\"",
      undine_5: "Undine: \"That broken hilt and ring\nshall lead you toward your distant destiny.\nMay the blessings of water guide your voyage...\"",
      port_1: "Captain: \"Ahoy! We've been waiting for ya!\nThe Black Dragon fell, and the storm of fire blocking the sea has vanished!\"",
      port_2: "Scholar: \"Oh, you are safe!\nWith the dragon's demise, the seal served its purpose and Colada shattered...\"",
      port_3: "Scholar: \"Yet the broken hilt, the ring, and your very presence\nare the living proof of the Undefeated Knight erased from continental history.\"",
      port_4: "Mayor: \"You saved our island from ruin!\nEvery resident praises you from the bottom of their heart!\"",
      port_5: "Girl: \"Are you leaving...? Please don't go...!\nStay with us forever...!\"",
      port_6: "Captain: \"The liner to the continent is ready to set sail.\nTime to cross the waves and head into the new world!\"",
      port_7: "Captain: \"All hands, hoist the sails! Set saiiil!!\""
    },
    events: {
      sister: {
        bag_full: [
          "Welcome, traveler from afar.\nThough I cannot recognize\nthe crest on that ring...",
          "The scholar investigating the ruins to the north\nmight know something about it.",
          "I wished to offer an herb for your safe journey,\nbut your bag seems full.\nPlease return once you have organized your items."
        ],
        give_herb: [
          "Welcome, traveler from afar.\nThough I cannot recognize\nthe crest on that ring...",
          "The scholar investigating the ruins to the north\nmight know something about it.",
          "Please take this for your safe journey.\n(Acquired Medicinal Herb!)"
        ],
        after: [
          "If it is about the ring's crest,\nplease consult the scholar at the northern ruins.",
          "I pray with all my heart that\nyou may find a clue."
        ]
      },
      dwarf_soldier: {
        quest_start: [
          "Guard: \"A black lizardman has appeared lately,\nrallying the monsters in the tunnel and causing us trouble.",
          "Guard: \"Reports say it's lying in ambush around the middle\nof the Undersea Tunnel.",
          "Guard: \"If you're confident in your skills, will you take it down?\nSucceed, and I'll give you my Fire Ward,\nand convince the blacksmith to lend you the treasure armor!\""
        ],
        quest_waiting: [
          "Guard: \"A report just came in!\nIt was sighted just past 4 tiles of poison swamp!",
          "Guard: \"Defeat it, and I'll grant you my Fire Ward\nand ask the blacksmith to lend you the treasure armor!\nMake haste!\""
        ],
        bag_full: [
          "Guard: \"Oho! You felled that black lizardman!\nI'd like to hand over the Fire Ward as promised, but your pack is full.\nMake room and come back!\""
        ],
        quest_complete: [
          "Guard: \"Oho! You felled that black lizardman!\nWith this, the tunnel's safety is secured.",
          "Guard: \"As promised, take my Fire Ward!\n(Acquired Fire Ward!)",
          "Guard: \"With strength like yours, you might even stand a chance against the Black Dragon.\nI'll put in a good word with the blacksmith!\""
        ],
        after: [
          "Guard: \"With your strength, you might even face the Black Dragon.\nGo have the blacksmith tailor that armor for you!\""
        ]
      },
      blacksmith: {
        need_trust: [
          "Blacksmith: \"Hmm? Who do you think you are?\nI won't lend our village treasure to an outsider so easily.",
          "Blacksmith: \"Our guard is having trouble with the monsters in the tunnel.\nProve your mettle to him first and earn our trust!\""
        ],
        wearing: [
          "Blacksmith: \"How does the Dragon Scale Armor feel?\nCrafted from the molted scales of the ancient black dragon!",
          "Blacksmith: \"Once you have vanquished the Black Dragon,\nbe sure to return our sacred relic!\""
        ],
        bag_full: [
          "Blacksmith: \"Oh! You brought back the Cerberus Mane!",
          "Blacksmith: \"I'd like to tailor the armor right away,\nbut your bag is completely full.\nSort your gear and come back!\""
        ],
        craft_success: [
          "Blacksmith: \"Superb! You brought back the searing Cerberus Mane\nfrom the fierce beast guarding the dragon's cavern!",
          "Blacksmith: \"Right then! I will weave this mane as a heat-resistant liner,\nand refit the dragon scale armor to your frame in a flash!",
          "*Clang! Clang! Clang! ...Sssssssss!!*",
          "Blacksmith: \"It is finished! Behold the secret dwarven Dragon Scale Armor,\nboasting the highest physical defense and heat resistance!\n(Acquired Dragon Scale Armor!)\"",
          "Blacksmith: \"Remember, once the Black Dragon is slain,\nyou must return it to my forge!\""
        ],
        ask_quest: [
          "Blacksmith: \"...What's this!? That blade at your hip...\nIs that not the legendary Colada once wielded by the hero?!",
          "Blacksmith: \"If you are master of that sword, you have the right to challenge the dragon.\nI'd lend you our village's sacred Dragon Scale Armor, but...\"",
          "Blacksmith: \"Dwarven armor is broad and short.\nIt will not fit a human's build as it is.",
          "Blacksmith: \"To cushion the unworkable outer shell and protect from extreme heat,\nwe need the mane of the beast Cerberus guarding the entrance of the dragon's cavern!",
          "Blacksmith: \"Head to the cavern, defeat Cerberus, and bring back its mane!\nI shall tailor it specifically for your size!\""
        ],
        quest_waiting: [
          "Blacksmith: \"What is it! Have you not brought the Cerberus Mane yet?",
          "Blacksmith: \"Head to the dragon's cavern, defeat Cerberus,\nand bring back its mane!\""
        ],
        busy: [
          "Blacksmith: \"What do you want!\nI'm busy right now!!\""
        ]
      },
      elf: {
        dummy: [
          "I am an elf. I watch over this temple.",
          "You shouldn't venture deeper into the forest. Dangerous monsters lurk there."
        ],
        has_corrada: [
          "You have finally obtained the legendary sword Colada!\nIt seems to resonate with the crest upon your ring.",
          "However, your current armor will never withstand\nthe ferocious claws of the Black Dragon.",
          "From the northeast coast of this island, you should find\nthe Undersea Tunnel leading to the hidden dwarven village.",
          "I hear they possess armor forged from ancient dragon scales.\nHead toward the northeast coast!"
        ],
        has_shield: [
          "You received the Water Spirit Shield from Undine!\nWith that shield, you can ward off even the dragon's searing breath.",
          "The entrance to the underground temple lies deep within\nthe catacombs to the west of this temple.",
          "In the depths of the underground temple rests Colada,\nthe legendary blade bestowed by the Green Dragon.",
          "Fearsome monsters lurk within. Tread with utmost caution."
        ],
        need_shield: [
          "Challenging the underground temple or the Black Dragon\nwith your current gear is reckless.",
          "Go meet Undine at the shrine in the deepest part of the forest.\nShe should possess the Water Spirit Shield.",
          "You can reach the deep forest from the woods\nnortheast of this temple."
        ],
        return_ring: [
          "Ah...! That ring, it belonged to her...!\nYou retrieved it from the beasts in the catacombs!",
          "Thank you...! Thank you so much!\nAs promised, take this Forest Guide.\n(Acquired Forest Guide!)",
          "...You truly intend to slay the Black Dragon, don't you?",
          "Your current equipment will not hold against the horrors below,\nmuch less the Black Dragon itself.",
          "Undine rests at the shrine in the deepest forest.\nShe holds the Water Spirit Shield. Meet her first.",
          "You can enter the deep forest through the woods northeast of here."
        ],
        quest_start: [
          "This temple was built long ago.\nWe elves once guarded it, but during the great wars,\nmy kin left this island.",
          "I alone remained behind, staying in this temple.\nWhy? ...Because this is where my beloved rests.",
          "Yet... the monsters in the catacombs stole the ring\nthat meant the world to her.",
          "Please, I beg of you.\nCould you recover my Lover's Ring from the monsters?",
          "If you bring it back, I will grant you the Forest Guide.\nAn elf no longer has any use for it.",
          "You cannot enter the underground temple directly,\nbut there is a passage from the catacombs to the west."
        ],
        quest_waiting: [
          "The catacombs lie to the west of this temple.\nPlease recover the Lover's Ring from the monsters.",
          "Bring the ring back, and I will grant you the Forest Guide as promised."
        ]
      },
      undine: {
        after: [
          "Undine: \"May the Water Spirit Shield serve as your strength.\nReturn to the temple where the elf awaits, and travel safely.\""
        ],
        bag_full: [
          "Undine: \"I have heard your tale from the elf.\nI wish to grant you the Water Spirit Shield, but your bag is full.\"",
          "Undine: \"Please return after sorting your belongings.\""
        ],
        give_shield: [
          "Undine: \"I have heard your tale from the elf.\nI shall grant you the Water Spirit Shield entrusted by the Green Dragon.\"",
          "(Acquired Water Spirit Shield!)",
          "Undine: \"Carrying an ancient blessing, this shield holds the power\nto repel the Black Dragon's searing flames.\"",
          "Undine: \"Brave soul confronting the dragon, may fortune guide you...\""
        ]
      },
      lighthousekeeper: {
        initial: [
          "You're awake? I almost thought you wouldn't open your eyes...\nYou're a tough one, surviving a storm like that.",
          "You don't remember anything? I rescued you after finding you collapsed on the shore...\nWell, glad to see you're on your feet.",
          "Still, losing your memories is quite a predicament.\nA humble lighthouse keeper like me can't do much for you.",
          "I know. Why not visit the church in town\nand ask for advice?",
          "Besides, that ring might hold a clue to your identity.\nA golden shield with a green dragon crest.",
          "Step outside and you'll see the town right away.\nTake care out there."
        ],
        after: [
          "Glad to see you up and about.\nRemembered anything yet?"
        ]
      },
      scholar: {
        dummy: [
          "Hohoho! I am a scholar investigating these ruins.",
          "These ruins are quite ancient. I believe there is a valuable inscription deep within...",
          "But monsters have settled in, so my investigation has stalled."
        ],
        port_corrada: [
          "Oho! That gleaming blade in your hand is Colada!\nYou finally claimed the temple's legacy!",
          "Yet according to ancient texts, your armor is still insufficient\nto weather the Black Dragon's ferocious onslaught.",
          "On the northeast coast of this island lies the entrance\nto an Undersea Tunnel leading into the abyss.",
          "Beyond it, in the hidden dwarven village,\nyou may find Dragon Scale Armor that deflects dragon claws.\nMake haste to the northeast coast!"
        ],
        port_initial: [
          "Ah, you made it safely!\nI have been examining ancient texts here in the library\nregarding the stone monument and your ring's crest.",
          "The records state that a hero from the continent once arrived with the Green Dragon's blessing,\nslew the calamitous Black Dragon, and left two relics behind.",
          "The Water Spirit Shield to ward off dragon flames, and Colada to pierce dragon scales.\nBoth rest within the central Lost Forest and temple.",
          "...However, your ring's crest is nearly identical to that hero's.\nYet continental records claim the hero's direct line died out long ago...",
          "Who you truly are, I still cannot say.\nYet if you claim the relics of the Lost Forest,\nyour answers may await across the sea on the continent."
        ],
        cave_reported: [
          "Oho, you defeated the beast and investigated the monument!",
          "Hmm, let me see... Hmm, hmm...",
          "As I thought, the shield and dragon crest were engraved upon it.\nThis warrants further investigation...",
          "If you wish to discover your origins, meet me at the library in the port town.\nI shall head to the port town in the northeast ahead of you.",
          "The scholar hurried away in excitement."
        ],
        cave_initial: [
          "Hohoho! I am a scholar investigating these ruins.",
          "Oh? You wish for me to examine your ring's crest?\nLet me take a look...",
          "...What?! Where did you get a ring with this crest?!\nA foreigner bearing this emblem...",
          "... ... ...\n... ... ...",
          "Truth be told, a monument bearing this exact crest lies deep within these ruins.\nI only saw it once in my youth...",
          "Alas, monsters have nested here now,\nmaking it impossible to explore the interior.",
          "A gargoyle blocks the path further in,\npreventing any investigation.",
          "If you seek your identity, investigate the monument beyond that beast.\nYou may find a clue to who you are.",
          "Should you fell the gargoyle and inspect the stone, return to me.\nI may be able to shed light on your lineage."
        ],
        cave_waiting: [
          "If you seek your identity, investigate the monument deep within.\nYou may find a clue to your origins.",
          "Should you defeat the gargoyle and inspect the stone, return to me."
        ]
      },
      guard: {
        pass_ok: [
          "You have the Mayor's Travel Pass.\nAll right, you may pass!"
        ],
        pass_ng: [
          "Beyond here lies the port town.\nI can't let you through without the Mayor's Travel Pass!"
        ]
      },
      mayor: {
        has_pass: [
          "I will never forget how you saved our little girl.\nTake care on your journey to the port town."
        ],
        bag_full: [
          "Mayor: \"I am truly grateful to you for saving our girl!",
          "Mayor: \"I wish to grant you the promised Travel Pass, but your bag is full.\nPlease make room in your pack and return.\""
        ],
        give_pass: [
          "Mayor: \"Traveler! You safely rescued the kidnapped girl!\nThank goodness... thank goodness!\"",
          "Mayor: \"You have proven your valor and heart to our town.\nAs promised, take this!\n(Acquired Travel Pass!)\"",
          "Mayor: \"With this, you can pass the checkpoint to the port town.\nTravel safely on your road.\""
        ],
        waiting_rescue: [
          "Head to the eastern dungeon and rescue our town's little girl...!\nOnce she returns safely, I shall grant you the Travel Pass without fail!"
        ],
        quest_start: [
          "What? You desire a Travel Pass to the port town?\n...Hmm, you are an unfamiliar traveler.\nI cannot issue a pass to someone of unknown background.",
          "... ... ...\n... ... ...",
          "...What?! S-Something terrible has happened!\nA townsman just delivered grave news...",
          "A young girl from town was abducted by monsters\nand dragged into the eastern dungeon!",
          "I beg you, traveler! Rescue that child safely!\nIf you bring her back, I shall grant you the Travel Pass as a reward!"
        ],
        default: [
          "I am the mayor of this town.\nDo you need something?\n...If not, feel free to rest your weary feet."
        ]
      },
      girl: {
        in_dungeon_scared: [
          "Girl: \"Eek! Help me!\nThat monster over there is terrifying, I can't move!\""
        ],
        in_dungeon_rescued: [
          "Girl: \"Thank you for saving me!\nPlease take me back to the Mayor in town!\"",
          "(The town girl joined your company!\nEscort her safely back to the starting town.)"
        ],
        in_town_rescued: [
          "Ah, you're the one who saved me!\nI'm safely back home, thank you so much!"
        ],
        in_town_default: [
          "Hello, traveler!\nYou look very cool.\nHave a safe journey!"
        ]
      }
    },
    map_names: {
      first_island: "Starting Island",
      lighthousekeeper_cottage: "Lighthouse Cottage",
      cave: "Northern Cave",
      dungeon: "Eastern Dungeon B1",
      first_dungeon2: "Eastern Dungeon B2",
      first_town: "Starting Town",
      first_church: "Start: Church",
      inn: "Start: Inn",
      armor_shop: "Start: Armory",
      general_shop: "Start: Item Shop",
      port_town: "Port Town",
      port_church: "Port: Church",
      port_inn: "Port: Inn",
      port_armor_shop: "Port: Armory",
      port_general_shop: "Port: Item Shop",
      forest: "Lost Forest",
      forest2: "Lost Forest",
      forest3: "Lost Forest",
      temple: "Temple Ruins",
      deep_forest: "Deep Forest",
      temple11: "Catacombs B1",
      temple21: "Catacombs B2",
      temple22: "Catacombs B3",
      temple3: "Underground Temple",
      undersea_tunnel1: "Undersea Tunnel 1",
      undersea_tunnel2: "Undersea Tunnel 2",
      undersea_tunnel3: "Undersea Tunnel 3",
      dwarf_village: "Dwarven Village",
      dwarf_village_general_shop: "Dwarf: Item Shop",
      dragonera_island: "Dragonera Island",
      dragons_cave1: "Dragon's Cave 1",
      dragons_cave2: "Dragon's Cave 2"
    },
    map_objects: {
      cave_monument: [
        "A shield and dragon crest are carved into the monument...\nBelow it, a short inscription is etched.",
        "'Bestowed by the ancient Green Dragon,\nI sealed my sword within the coffer.\nWhen one worthy appears,\nmay it fulfill its duty once more\nbefore setting sail...'",
        "The rest is worn away and unreadable."
      ],
      port_town_bookshelf: [
        "Old records line the bookshelf...\n[Island Chronicle: The Silver Record]",
        "'...A knight once crossed the sea from the continent,\nbearing the Green Dragon's blessing to slay the Black Dragon.\nThe knight entrusted his sword Colada and the Water Spirit Shield\nto this land before returning to the continent.'",
        "'...Postscript: According to continental records,\nthat knight's house lost its heir in subsequent wars,\nand the bloodline is said to have perished.'"
      ],
      temple11_notebook: [
        "A tattered old notebook lies on the ground.",
        "'...My lord chose the deepest reaches of this eerie ancient temple as the sword's resting place.",
        "The knight crossed blades with that dreadful bronze colossus, finally silencing it at last...'",
        "The rest is illegible."
      ],
      temple22_notebook: [
        "A bloodstained old journal lies on the ground.",
        "'...My lord modified the altar's coffer with a double lock.",
        "One key was the iron key held by my lord.",
        "However, the other bronze key... was placed back inside that giant when it began moving once more.",
        "Unless both keys are gathered, the sword cannot...'",
        "(The writing cuts off here...)"
      ]
    },
    map_npcs: {
      first_town_woman: ["Hello!\nThis is the starting town.", "Take care on your journey."],
      first_town_port_youth: ["Monsters have been increasing lately.", "We can barely step outside.", "The forest is especially dangerous, watch out!"],
      first_town_town_man: ["This is a peaceful town.\nMonsters roam outside, so be careful."],
      first_church_inn_guest: ["Make sure to pray for revival."],
      first_church_inn_keeper: ["The divine power shall save you."],
      inn_inn_guest: ["Whew, sleeping in a bed\nheals wounds completely."],
      port_town_port_worker: [
        "Can't sail the ships thanks to the dragon.\nCan't haul cargo, so we're out of work.",
        "Ain't nobody on this island who could\ntake down a monster like that..."
      ],
      port_town_port_woman: [
        "Since trade with the continent ceased,\nsupplies coming into town keep dwindling...",
        "I wish we could return to being\na peaceful port town like before."
      ],
      port_town_port_youth: [
        "It may be a small port town,\nbut our grand library is our pride.",
        "Ancient tales of heroes and island lore\nare said to rest there.\nWhy don't you have a look?"
      ],
      port_town_port_old_woman: [
        "How long has it been since the Black Dragon blocked the seas...?",
        "I wonder if someone will appear to open the waters,\njust like the hero who came from the continent long ago."
      ],
      port_town_captain: [
        "I'd love to sail the regular ship to the continent,\nbut that Black Dragon perched on Dragonera Island won't let us.",
        "Its searing flames can melt iron armor in an instant,\nnot to mention the wooden decks.\nGo near it, and ship and crew turn to ash.",
        "Unless that dragon is slain or we find a way\nto withstand the fire, we can't set sail."
      ],
      port_inn_inn_guest: [
        "The Lost Forest in the center of the island is pitch black with dense trees.\nIf you go, make sure you buy a Lantern and Antidotal Herb at the shop.",
        "The trees shift on their own in that forest.\nTo reach the depths, you'll need the Forest Guide\nresting beneath the temple, or you'll be lost forever."
      ],
      port_inn_bard: [
        "I am a wandering minstrel.\nDo you know the ancient ballad of this island?",
        "'A golden shield lost to the waves, for whom does the green dragon wait.\nA bloodline thought severed shall banish the dark calamity once more...'",
        "An ancient relic sleeping deep within the shifting trees...\nIt is sung that the key to confronting the Black Dragon\nwho blocks the sea lies there."
      ],
    }
  },
  es: {
    common: {
      yes: "Sí",
      no: "No",
      back: "Volver"
    },
    title: {
      new_game: "Nueva Partida",
      load_game: "Cargar Partida",
      lang: "Idioma: Español",
      theater: "Teatro",
      theater_fall: "Caída del Dragón",
      theater_ending: "Final",
      theater_back: "Volver"
    },
    system: {
      theater_unlocked: "¡Felicidades por completar el juego!\n\nSe ha añadido el modo 'Teatro' a la pantalla de título.\nAhora puedes revivir las escenas cuando quieras."
    },
    ui: {
      status: "ESTADO",
      items: "OBJETOS",
      equipment: "EQUIPO",
      none: "Ninguno",
      poison_badge: " [VENENO]",
      controls: "[CONTROLES]\nMover: Flechas / WASD\nAceptar: Espacio / Intro\nCancelar: X / ESC\nBGM: M / SE: N"
    },
    menu: {
      spell: "Hechizos",
      item: "Objetos",
      equip: "Equipo",
      recall: "Recordar",
      load: "Cargar",
      save: "Guardar",
      quit: "Salir",
      use: "Usar",
      drop: "Tirar",
      back: "Volver",
      quit_confirm: "¿Seguro que quieres salir?\n(El progreso no guardado se perderá)",
      drop_confirm: "¿Seguro que quieres\ntirar {name}?",
      cannot_drop_equipped: "¡No puedes tirar objetos equipados!",
      cannot_drop_key: "¡Es un objeto importante!\n¡No puedes tirarlo!",
      inventory_full_unequip: "¡La bolsa está llena!\n¡No puedes desequipar el objeto!",
      unequipped: "¡El héroe se desequipó {name}!",
      equipped: "¡El héroe se equipó {name}!",
      dropped: "¡Tiraste {name}!",
      full_hp: "¡Los PV ya están al máximo!",
      full_mp: "¡Los PM ya están al máximo!",
      cannot_use_here: "¡No se puede usar aquí!",
      no_return_point: "¡No hay punto de retorno registrado!",
      girl_priority: "¡Primero debes llevar a la niña a la ciudad a salvo!",
      mp_shortage: "¡No tienes suficientes PM!"
    },
    objectives: {
      talk_sister: "[Objetivo actual]\nVe a la iglesia del pueblo de inicio\ny pregunta a la hermana sobre el anillo.",
      find_scholar: "[Objetivo actual]\nDirígete a la Cueva del Norte y busca\nal erudito que investiga las ruinas.",
      report_scholar: "[Objetivo actual]\nInforma sobre la inscripción del monumento\nal erudito cerca de la entrada de la cueva.",
      investigate_monument: "[Objetivo actual]\nDerrota a la bestia de la Cueva del Norte\ny examina el monumento antiguo.",
      return_girl: "[Objetivo actual]\nLleva a la niña rescatada de vuelta\ncon el alcalde del pueblo de inicio.",
      rescue_girl: "[Objetivo actual]\nAdéntrate en la Mazmorra Oriental\ny rescata a la niña secuestrada.",
      consult_mayor: "[Objetivo actual]\nHabla con el alcalde del pueblo de inicio\npara conseguir un salvoconducto.",
      cross_checkpoint: "[Objetivo actual]\nCruza el puesto de control del este\ny dirígete al Pueblo Costero.",
      go_library: "[Objetivo actual]\nAtraviesa el puesto de control del este\ny ve a la biblioteca del Pueblo Costero.",
      find_temple: "[Objetivo actual]\nAtraviesa el Bosque Perdido central\ny busca el templo oculto en su interior.",
      deliver_ring: "[Objetivo actual]\nLleva el Anillo de amantes recuperado\nal elfo en las Ruinas del Templo.",
      recover_ring: "[Objetivo actual]\nEntra a las catacumbas al oeste del templo\ny recupera el Anillo de amantes de las bestias.",
      obtain_water_shield: "[Objetivo actual]\nAvanza al Bosque Profundo hacia el noreste\ny recibe el Escudo del espíritu de Ondina.",
      obtain_corrada: "[Objetivo actual]\nEntra al Templo Subterráneo por las catacumbas\ny obtén la espada legendaria Colada del arca.",
      seek_dwarf_village: "[Objetivo actual]\nCruza el Túnel Submarino en la costa noreste\ny llega a la aldea oculta de los enanos.",
      seek_armor_clues: "[Objetivo actual]\n¡Colada obtenida! Habla con el elfo o el\nerudito para hallar pistas de la armadura adecuada.",
      defeat_black_lizard: "[Objetivo actual]\nDerrota al Hombre lagarto negro que acecha\na mitad del Túnel Submarino.",
      report_black_lizard: "[Objetivo actual]\n¡Hombre lagarto negro derrotado!\nInforma al guardia en la aldea de los enanos.",
      consult_blacksmith: "[Objetivo actual]\n¡Te ganaste la confianza del guardia!\nPide al herrero que te ajuste la armadura.",
      deliver_mane: "[Objetivo actual]\nEntrega la Melena de cerbero obtenida\nal herrero de la aldea de los enanos.",
      defeat_cerberus: "[Objetivo actual]\nDerrota a Cerbero en la cueva del dragón\ny obtén la melena necesaria para la armadura.",
      defeat_black_dragon: "[Objetivo actual]\n¡Equipo final listo! Ve al cráter de la\nIsla Dragonera y acaba con el Dragón negro."
    },
    menu_action: {
      used_herb_1: "¡Héroe usó Planta medicinal!",
      used_herb_2: "¡Las heridas sanaron!",
      used_strong_herb_1: "¡Héroe usó Planta fuerte!",
      used_strong_herb_2: "¡Gran recuperación de salud!",
      used_special_herb_1: "¡Héroe usó Planta especial!",
      drank_magic_water_1: "¡Héroe bebió Agua mágica!",
      drank_magic_water_2: "¡Recuperó 15 PM!",
      drank_sage_water_1: "¡Héroe bebió Agua de sabio!",
      drank_sage_water_2: "¡Recuperó 40 PM!",
      holy_water_1: "¡Héroe esparció Agua bendita!",
      holy_water_2: "¡Los monstruos no pueden acercarse!",
      torch_1: "¡Héroe encendió una Antorcha!",
      torch_2: "¡La luz iluminó los alrededores!",
      lantern_on: "¡Héroe encendió el Farol!",
      lantern_off: "¡Héroe apagó el Farol!",
      antidote_1: "¡Héroe tomó Hierba amarga!",
      antidote_2: "¡El veneno desapareció!",
      antidote_not_poisoned: "¡Sin embargo, no estaba envenenado!",
      forest_guide: "¡La Guía del bosque emitió una luz mística!",
      broken_hilt_1: "Una empuñadura de espada sin hoja.\nTiene grabado el blasón del dragón verde.",
      broken_hilt_2: "Sin embargo, no ocurre nada.",
      charm_passive: "Llevarlo parece otorgar\nuna misteriosa protección.",
      spell_cast: "¡Héroe lanzó {spell}!",
      healed: "¡Las heridas sanaron!",
      greatly_healed: "¡Gran recuperación de salud!",
      fully_healed: "¡Heridas completamente sanadas!",
      remira_shine: "¡La luz iluminó el área con fuerza!"
    },
    battle: {
      attack: "Atacar",
      spell: "Hechizo",
      item: "Objeto",
      escape: "Huir",
      no_magic: "¡No hay hechizos disponibles\npara la batalla!",
      magic_sealed: "¡Los hechizos están bloqueados!",
      no_items: "¡No tienes objetos utilizables!"
    },
    battle_log: {
      appeared: "¡Ha aparecido {name}!",
      enemy_ambush: "¡{name} atacó por sorpresa!",
      player_awake: "¡El héroe se ha despertado!",
      player_sleep: "El héroe está profundamente dormido...",
      hero_attack: "¡El héroe ataca!",
      critical_hit: "¡¡Un golpe crítico!!",
      damage_dealt: "¡Infligió {dmg} puntos de\ndaño a {name}!",
      heavy_damage_dealt: "¡Infligió un daño masivo de\n{dmg} puntos a {name}!",
      enemy_awake: "¡{name} se ha despertado!",
      enemy_sleep: "{name} está profundamente dormido...",
      breath_attack: "¡{name} lanzó {spell}!",
      hero_damage_heavy: "¡El héroe recibió un gran daño\nde {dmg} puntos!",
      breath_defended_both: "¡El escudo del espíritu y el talismán\nrepelieron las fieras llamas!",
      breath_defended_shield: "¡El escudo protege, pero el calor\nabrasador quema el cuerpo!",
      breath_defended_charm: "¡El talismán frena el calor, pero\nno resiste tal llamarada!",
      breath_no_defense: "¡¡Una llamarada atroz consume al héroe!!",
      enemy_special_phys: "¡{spell} de {name}!",
      dragon_claw_hit: "¡Garras tenebrosas desgarran al héroe!",
      dragon_armor_defend: "¡La armadura de escamas repelió\nfirmemente el fiero embate!",
      dragon_armor_penetrated: "¡¡Atravesó la armadura sufriendo\nun golpe fatal!!",
      enemy_cast: "¡{name} lanzó {spell}!",
      enemy_spell_sealed: "¡Pero los hechizos están bloqueados!",
      already_asleep: "¡Pero el héroe ya está dormido!",
      hero_fell_asleep: "¡El héroe se quedó dormido!",
      spell_no_effect_hero: "¡Pero no tuvo efecto en el héroe!",
      already_sealed: "¡Pero los hechizos ya están bloqueados!",
      hero_spell_sealed: "¡Los hechizos del héroe fueron bloqueados!",
      hero_damage: "¡El héroe recibió {dmg} puntos de daño!",
      enemy_attack: "¡{name} ataca!",
      enemy_critical: "¡¡Un golpe devastador!!",
      poison_defended: "¡Sin embargo, el talismán detuvo el veneno!",
      hero_poisoned: "¡El héroe fue envenenado!",
      hero_escape: "¡El héroe huyó!",
      escape_failed: "¡Pero fue acorralado!",
      enemy_defeated: "¡Derrotó a {name}!",
      exp_gold_gain: "¡Obtuvo {exp} de experiencia!\n¡Consiguió {gold} monedas de oro!",
      treasure_drop: "¡{name} dejó un cofre!\n¡Consiguió {item}!",
      bag_full_drop: "¡{name} dejó un cofre!\n¡Bolsa llena! Elige un objeto para tirar.",
      discard_select_msg: "La bolsa está llena.\nElige un objeto para tirar.",
      hero_discarded_item: "¡El héroe tiró {discarded}!\n¡Consiguió {dropped}!",
      hero_defeated: "El héroe ha caído..."
    },
    battle_action: {
      used_herb: "¡Héroe usó {item}!\n¡Las heridas sanaron!",
      used_strong_herb: "¡Héroe usó {item}!\n¡Gran recuperación de salud!",
      drank_magic_water: "¡Héroe bebió {item}!\n¡Recuperó {mp} PM!",
      cured_poison: "¡Héroe usó Hierba amarga!\n¡El veneno desapareció!",
      not_poisoned: "¡Héroe usó Hierba amarga!\n¡Pero no estaba envenenado!",
      cast_spell: "¡Héroe lanzó {spell}!",
      fully_healed: "¡Heridas completamente sanadas!",
      healed: "¡Las heridas sanaron!",
      greatly_healed: "¡Gran recuperación de salud!",
      enemy_asleep: "¡Durmió a {name}!",
      enemy_already_asleep: "¡Pero {name} ya\nestá dormido!",
      enemy_spell_sealed: "¡Selló la magia de {name}!",
      enemy_already_sealed: "¡Pero los hechizos ya están sellados!",
      spell_no_effect: "¡Pero no tuvo efecto!"
    },
    player: {
      level_up: "¡El héroe ha alcanzado el nivel {level}!",
      stat_gain: "¡PV máx. +{hp}!\n¡PM máx. +{mp}!\n¡Fuerza +{atk}!\n¡Defensa +{def}!\n¡Agilidad +{spd}!",
      learned_spell: "¡El héroe aprendió\n{spell}!"
    },
    shop: {
      buy: "Comprar",
      sell: "Vender",
      leave: "Salir",
      greetings: {
        default: "¡Bienvenido!\n¿En qué puedo ayudarte?",
        weapon: "¡Bienvenido!\n¿Buscas armas o armaduras?",
        item: "¡Bienvenido!\nTenemos todo lo necesario para tu viaje.",
        merchant: "¡Bienvenido!\nComercio con armas y pertrechos de viaje."
      },
      what_to_buy: "¿Qué deseas comprar?",
      what_to_sell: "¿Qué deseas vender?",
      anything_else: "¿Algo más?",
      buy_confirm: "¿{name}?\nSon {price} monedas de oro. ¿Lo compras?",
      sell_confirm: "¿{name}?\nTe lo compro por {price} monedas de oro.",
      cannot_sell_equipped: "¡Lo tienes equipado!\n¡No puedo comprarlo!",
      inventory_full: "¡Tu bolsa está llena!\n¡No puedes llevar más!",
      gold_shortage: "No tienes suficiente oro.\n¿Necesitas algo más?",
      thank_you_buy: "¡Gracias!\n¿Algo más?",
      thank_you_sell: "¡Gracias!\n¿Algo más que vender?"
    },
    inn: {
      greeting: "¿Deseas descansar de tu viaje?\nSon {cost} monedas de oro por noche.",
      gold_shortage: "Parece que no tienes suficiente oro.",
      goodbye: "Vuelve cuando quieras.",
      morning: "¡Buenos días!\n¿Has descansado bien esta noche?"
    },
    church: {
      greeting: "Que las bendiciones divinas te acompañen.\n¿En qué podemos servirte?",
      talk: "Hablar",
      set_return: "Punto de retorno",
      leave: "Salir",
      hint_scholar_1: "Si se trata del blasón del anillo,\nconsulta al erudito que investiga\nlas ruinas del norte.",
      hint_scholar_2: "Rezo de todo corazón para que\nencuentres alguna pista.",
      hint_general: "Cuando te pierdas, confía en la luz y avanza.\nLo que ves puede ser una ilusión.\nQue las bendiciones te acompañen...",
      return_registered: "Este lugar ha sido registrado\ncomo tu punto de retorno.\nLanza Teletransporte para volver aquí.",
      blessing: "Que las bendiciones divinas\nte acompañen..."
    },
    slot: {
      title_save: "Diario de Aventura - Guardar",
      title_load: "Diario de Aventura - Cargar",
      current: "Diario actual",
      new_game: "Ninguno (Nueva Aventura)",
      book: "Reg. ",
      empty: "Vacío",
      corrupted: "Dañado",
      current_badge: " [Actual]",
      overwrite_title: "Confirmar Sobrescritura",
      overwrite_confirm: "El registro {slot} ya contiene datos.\n¿Deseas sobrescribirlo?",
      yes: "Sí",
      no: "No",
      back: "Volver",
      backup_export: "Exportar Datos", backup_import: "Importar Datos"
    },
    field: {
      chest_inventory_full_give_up: "¡Pero tu bolsa está llena!\nEl héroe renunció a {item}.",
      chest_give_up: "El héroe renunció a {item}\ny cerró el cofre.",
      death_exp_lost: "¡Has perdido {exp} puntos de experiencia!",
      light_expired: "¡La luz se ha apagado!",
      holy_water_expired: "¡El efecto de purificación\nse ha desvanecido!",
      dragons_cave_warn_1: "¡Una densa maldad emana de lo profundo de la cueva...!\nSi avanzas más, ya no habrá vuelta atrás.",
      dragons_cave_warn_2: "Antes de desafiar la batalla final,\nguardemos el registro de tu aventura.",
      chest_locked_altar: "Hay dos cerraduras en el arca del altar.",
      chest_locked: "¡Está cerrado con llave y no se abre!",
      chest_inventory_full: "¡Tu bolsa está llena!\n¡No puedes abrir el cofre!",
      chest_open_corrada_1: "¡El héroe introdujo la Llave antigua y la Llave de bronce!",
      chest_open_corrada_2: "¡Clic...! ¡El pesado sello del arca fue liberado!",
      chest_open_corrada_3: "¡Abrió el arca del altar!\n¡Consiguió la espada legendaria Colada!",
      chest_open_corrada_4: "¡Al empuñar la espada, el blasón del dragón verde emitió luz...!\n(Un poder nostálgico parece brotar desde lo profundo del cuerpo.)",
      chest_open: "¡Abrió el cofre del tesoro!\n¡Consiguió {item}!",
      chest_empty: "Sin embargo, el cofre\nestaba vacío.",
      chest_altar_empty: "Sin embargo, el arca\nestaba vacía.",
      death_poison: "¡El héroe cayó derrotado\npor el veneno...!\n¡Perdió la mitad del oro!",
      death_normal: "¡El héroe cayó derrotado!\nPerdió la mitad del oro...",
      death_girl_lost: "\n(¡La niña fue llevada de vuelta\na lo profundo de la mazmorra!)",
      saved_slot: "¡Guardado en el diario {slot}!",
      loaded_slot: "¡Reanudado desde el diario {slot}!",
      data_not_found: "El diario {slot} está vacío."
    },
    ending: {
      corrada_broken_1: "Con el último aliento del Dragón negro,\nla espada Colada se deshizo en partículas de luz...",
      corrada_broken_2: "En tus manos, solo quedaron la Empuñadura rota de Colada\ny el anillo del blasón del Dragón verde.",
      dwarf_1: "Herrero: \"¡Por fin has vuelto!\n¡Has derrotado al Dragón negro de Dragonera!\"",
      dwarf_2: "Herrero: \"...Y según lo pactado,\nvienes a devolver la Armadura de escamas de dragón.\"",
      dwarf_3: "¡El héroe devolvió la\nArmadura de escamas de dragón al herrero!",
      dwarf_4: "Herrero: \"¡Sí, la recibo con gratitud!\nEsta antigua escama es el orgullo de nuestra aldea.\nLa protegeremos siempre.\"",
      dwarf_5: "Herrero: \"Gracias a ti, la isla y la aldea están a salvo.\nHe oído que partes hacia el continente...\n¡Que la bendición de la tierra te acompañe!\"",
      undine_1: "Ondina: \"El miasma abrasador del Dragón negro se ha disipado.\nEl fuego del desastre ha desaparecido por fin.\"",
      undine_2: "Ondina: \"Tal como juramos,\nofrenda el Escudo del espíritu del agua en el altar del manantial.\"",
      undine_3: "¡El héroe ofrendó y devolvió\nel Escudo del espíritu del agua al altar!",
      undine_4: "Ondina: \"La protección de los espíritus volverá a las corrientes de la isla\ny cuidará esta tierra por siempre.\"",
      undine_5: "Ondina: \"Esa empuñadura rota y el anillo\nte guiarán hacia tu lejano destino.\nQue la bendición del agua acompañe tu viaje...\"",
      port_1: "Capitán: \"¡Te estábamos esperando!\n¡El dragón ha caído y la tormenta de fuego que bloqueaba el mar ha desaparecido!\"",
      port_2: "Erudito: \"¡Estás a salvo!\nCon la muerte del dragón, el sello cumplió su propósito y Colada se quebró...\"",
      port_3: "Erudito: \"Sin embargo, la empuñadura, el anillo y tu existencia misma\nson la prueba viva del Caballero Invicto borrado de los anales del continente.\"",
      port_4: "Alcalde: \"¡Salvaste a nuestra isla de la ruina!\n¡Todos los habitantes te aclaman desde el corazón!\"",
      port_5: "Niña: \"¿Te vas, hermano...? ¡No te vayas...!\n¡Quédate con nosotros para siempre...!\"",
      port_6: "Capitán: \"El barco regular hacia el continente está listo para zarpar.\n¡Ha llegado la hora de cruzar el mar hacia un nuevo mundo!\"",
      port_7: "Capitán: \"¡Muchachos, desplegad las velas! ¡¡Zarpamos!!\""
    },
    events: {
      sister: {
        bag_full: [
          "Bienvenido, forastero.\nAunque desconozco\nel blasón de ese anillo...",
          "El erudito que investiga las ruinas del norte\npodría saber algo al respecto.",
          "Deseaba darte una planta medicinal para tu viaje,\npero tu bolsa parece llena.\nOrdénala y regresa."
        ],
        give_herb: [
          "Bienvenido, forastero.\nAunque desconozco\nel blasón de ese anillo...",
          "El erudito que investiga las ruinas del norte\npodría saber algo al respecto.",
          "Lleva esto para tu seguridad en el viaje.\n(¡Conseguiste Planta medicinal!)"
        ],
        after: [
          "Si se trata del blasón de tu anillo,\nconsulta al erudito en las ruinas del norte.",
          "Rezo con el corazón para que encuentres una pista."
        ]
      },
      dwarf_soldier: {
        quest_start: [
          "Guardia: \"Últimamente ha aparecido un hombre lagarto negro\nque lidera a los monstruos del túnel y nos causa problemas.",
          "Guardia: \"Dicen los informes que tiende emboscadas a mitad\ndel Túnel Submarino.",
          "Guardia: \"Si confías en tu fuerza, ¿podrías acabar con él?\n¡Si lo logras, te daré mi Talismán ígneo y convenceré al herrero\npara que te preste la armadura del tesoro!\""
        ],
        quest_waiting: [
          "Guardia: \"¡Acaba de llegar un informe!\n¡Lo vieron justo después de cruzar 4 ciénagas venenosas!",
          "Guardia: \"¡Derrótalo y te entregaré mi Talismán ígneo,\ny le pediré al herrero que te preste la armadura sagrada!\n¡Ve de inmediato!\""
        ],
        bag_full: [
          "Guardia: \"¡Oh! ¡Derrotaste a ese hombre lagarto negro!\nQuisiera darte el Talismán ígneo como prometí, pero tu bolsa está llena.\n¡Haz espacio y regresa!\""
        ],
        quest_complete: [
          "Guardia: \"¡Oh! ¡Derrotaste a ese hombre lagarto negro!\nCon esto la seguridad del túnel queda restablecida.",
          "Guardia: \"¡Tal como prometí, toma mi Talismán ígneo!\n(¡Conseguiste Talismán ígneo!)",
          "Guardia: \"Con tu fuerza, tal vez puedas enfrentarte al Dragón negro.\n¡Hablaré con el herrero en tu favor!\""
        ],
        after: [
          "Guardia: \"Con tu fuerza, quizá puedas desafiar al Dragón negro.\n¡Ve con el herrero para que te ajuste la armadura!\""
        ]
      },
      blacksmith: {
        need_trust: [
          "Herrero: \"¿Mmm? ¿Quién te crees que eres?\nNo prestaré el tesoro de la aldea a un forastero tan fácilmente.",
          "Herrero: \"Nuestro guardia tiene problemas con los monstruos del túnel.\n¡Demuéstrale tu valía primero y gánate nuestra confianza!\""
        ],
        wearing: [
          "Herrero: \"¿Qué tal sienta la Armadura de escamas de dragón?\n¡Forjada con escamas mudadas del dragón negro ancestral!",
          "Herrero: \"¡Cuando derrotes al dragón,\nasegúrate de devolver nuestra reliquia sagrada!\""
        ],
        bag_full: [
          "Herrero: \"¡Oh! ¡Has traído la Melena de cerbero!",
          "Herrero: \"Quisiera forjar la armadura ahora mismo,\npero tu bolsa está llena.\n¡Organiza tus cosas y vuelve!\""
        ],
        craft_success: [
          "Herrero: \"¡Magnífico! ¡Has traído la ardiente Melena de cerbero\nde la feroz bestia que guardaba la cueva del dragón!",
          "Herrero: \"¡Bien! ¡Usaré esta melena como forro aislante\ny ajustaré las escamas de dragón a tu complexión en un santiamén!",
          "*¡Clang! ¡Clang! ¡Clang! ...¡¡Fssssss!!*",
          "Herrero: \"¡Terminado! ¡Toma la Armadura de escamas secreta de los enanos,\ncon la más alta defensa y resistencia al fuego!\n(¡Conseguiste Armadura de escamas de dragón!)\"",
          "Herrero: \"¡Recuerda que cuando el dragón caiga,\ndebes volver para devolvérmela!\""
        ],
        ask_quest: [
          "Herrero: \"...¡¿Qué?! Esa espada que llevas al cinto...\n¡¿No es la legendaria Colada blandida por el héroe?!",
          "Herrero: \"Si eres su dueño, tienes derecho a desafiar al dragón.\nTe prestaría la sagrada armadura de escamas de nuestra aldea, pero...\"",
          "Herrero: \"La talla enana es ancha y baja.\nNo le quedará a un humano tal como está.",
          "Herrero: \"Para rellenar el interior y soportar el calor abrasador,\n¡necesito la melena de Cerbero, la bestia de la cueva del dragón!",
          "Herrero: \"¡Ve a la cueva, derrota a Cerbero y trae su melena!\n¡La adaptaré a tu medida inmediatamente!\""
        ],
        quest_waiting: [
          "Herrero: \"¡¿Qué pasa?! ¡¿Aún no has traído la Melena de cerbero?!",
          "Herrero: \"¡Ve a la cueva del dragón, derrota a Cerbero\ny trae su melena!\""
        ],
        busy: [
          "Herrero: \"¡¿Qué quieres?!\n¡¡Ahora estoy ocupado!!\""
        ]
      },
      elf: {
        dummy: [
          "Soy un elfo. Cuido de este templo.",
          "No deberías adentrarte más en el bosque. Hay monstruos peligrosos."
        ],
        has_corrada: [
          "¡Por fin has obtenido la legendaria Colada!\nParece resonar con el blasón de tu anillo.",
          "Sin embargo, con tu armadura actual jamás soportarás\nlos zarpazos atroces del Dragón negro.",
          "Desde la costa noreste de la isla podrás entrar\nal Túnel submarino que lleva a la aldea oculta de los enanos.",
          "He oído que poseen una armadura hecha de escamas del dragón ancestral.\n¡Dirígete a la costa noreste!"
        ],
        has_shield: [
          "¡Has recibido el Escudo del espíritu del agua de Ondina!\nCon él podrás contener el aliento abrasador del dragón.",
          "La entrada al templo subterráneo está en lo profundo\nde las catacumbas, al oeste de este templo.",
          "Allí descansa Colada, la espada legendaria concedida\npor el Dragón verde en el pasado.",
          "Dentro habitan criaturas temibles. Ten mucho cuidado."
        ],
        need_shield: [
          "Ir al templo subterráneo o luchar contra el dragón\ncon tu equipo actual es un suicidio.",
          "Ve a ver a Ondina al santuario en lo más profundo del bosque.\nElla custodia el Escudo del espíritu del agua.",
          "Puedes llegar al bosque profundo por el camino al noreste."
        ],
        return_ring: [
          "¡Ah...! ¡Ese anillo, es el de ella...!\n¡Lo recuperaste de las criaturas de las catacumbas!",
          "¡Gracias...! ¡Muchísimas gracias!\nComo prometí, te entrego esta Guía del bosque.\n(¡Conseguiste Guía del bosque!)",
          "...De verdad pretendes matar al Dragón negro, ¿verdad?",
          "No resistirás a los horrores subterráneos con tu equipo,\ny mucho menos al Dragón negro.",
          "Ondina aguarda en el santuario del bosque profundo.\nTiene el Escudo del espíritu del agua. Ve a verla primero.",
          "Entra al bosque profundo por el camino al noreste."
        ],
        quest_start: [
          "Este templo fue erigido hace eones.\nLos elfos lo protegíamos, pero durante la gran guerra\ntodos abandonaron esta isla.",
          "Solo yo me quedé en este templo solitario.\n¿Por qué? ...Porque aquí descansa mi amada.",
          "Sin embargo... los monstruos de las catacumbas\nle arrebataron el anillo que tanto apreciaba.",
          "Te lo ruego. ¿Podrías recuperar el Anillo de amantes\nde las garras de esas bestias?",
          "Si me lo traes, te daré la Guía del bosque.\nUn elfo como yo ya no la necesita.",
          "No puedes entrar directamente al templo subterráneo,\npero hay un pasaje desde las catacumbas al oeste."
        ],
        quest_waiting: [
          "Las catacumbas están al oeste de este templo.\nPor favor, recupera el Anillo de amantes de los monstruos.",
          "Tráeme el anillo y te entregaré la Guía del bosque tal como prometí."
        ]
      },
      undine: {
        after: [
          "Ondina: \"Que el Escudo del espíritu del agua te dé fuerza.\nRegresa al templo donde aguarda el elfo y viaja a salvo.\""
        ],
        bag_full: [
          "Ondina: \"Ya he oído la historia del elfo.\nQuisiera entregarte el escudo, pero tu bolsa está llena.\"",
          "Ondina: \"Por favor, ordena tus pertenencias y regresa.\""
        ],
        give_shield: [
          "Ondina: \"Ya he oído la historia del elfo.\nTe confiaré el Escudo del espíritu del agua del Dragón verde.\"",
          "(¡Conseguiste Escudo del espíritu del agua!)",
          "Ondina: \"Con una bendición antigua, este escudo tiene el poder\nde repeler las llamas abrasadoras del Dragón negro.\"",
          "Ondina: \"Valiente que desafía al dragón, que las aguas te guíen...\""
        ]
      },
      lighthousekeeper: {
        initial: [
          "¿Despertaste? Temía que no volvieras a abrir los ojos...\nEres un tipo duro para sobrevivir a semejante tormenta.",
          "¿No recuerdas nada? Te encontré desplomado en la orilla...\nEn fin, me alegro de que estés bien.",
          "Pero no tener memoria es un grave problema.\nUn simple farero como yo poco puede hacer por ti.",
          "Ya sé. ¿Por qué no vas a la iglesia del pueblo\ny pides consejo?",
          "Además, ese anillo podría ser una pista sobre quién eres.\nUn escudo dorado con el blasón de un dragón verde.",
          "Sal y verás el pueblo enseguida.\nTen mucho cuidado."
        ],
        after: [
          "Me alegra verte bien.\n¿Has recordado algo ya?"
        ]
      },
      scholar: {
        dummy: [
          "¡Jajaja! Soy un erudito que investiga estas ruinas.",
          "Estas ruinas son muy antiguas. Creo que hay una inscripción valiosa en lo más profundo...",
          "Pero los monstruos se han instalado, así que mi investigación está paralizada."
        ],
        port_corrada: [
          "¡Oh! ¡Esa espada resplandeciente es Colada!\n¡Por fin obtuviste el legado del templo!",
          "Sin embargo, según los textos antiguos, tu armadura\naún no bastará contra los ataques del dragón.",
          "En la costa noreste de la isla se encuentra la entrada\na un Túnel submarino que desciende al abismo.",
          "Más allá, en la aldea oculta de los enanos,\npodrías conseguir la armadura que repele sus garras.\n¡Ve de inmediato a la costa noreste!"
        ],
        port_initial: [
          "¡Ah, has llegado sano y salvo!\nHe estado investigando textos antiguos en esta biblioteca\nacerca del monumento de piedra y el blasón de tu anillo.",
          "Cuentan que un héroe del continente llegó con la bendición del Dragón verde,\nderrotó al funesto Dragón negro y dejó dos reliquias en la isla.",
          "El Escudo del espíritu para frenar sus llamas y la espada Colada para quebrar sus escamas.\nAmbos yacen en el Bosque Perdido y el templo.",
          "...Sin embargo, el blasón de tu anillo es casi idéntico al del héroe.\nAunque los anales afirman que su linaje se extinguió hace mucho...",
          "Aún no puedo afirmar quién eres en realidad.\nPero si obtienes las reliquias del bosque,\ntus respuestas podrían aguardar al otro lado del mar."
        ],
        cave_reported: [
          "¡Oh, derrotaste a la bestia e investigaste la inscripción!",
          "Mmm, déjame ver... Ya veo, ya veo...",
          "Como pensaba, el escudo y el dragón estaban grabados allí.\nEsto requiere una investigación más profunda...",
          "Si deseas conocer tu origen, búscame en la biblioteca del pueblo costero.\nMe adelantaré hacia el noreste.",
          "El erudito se marchó apresuradamente."
        ],
        cave_initial: [
          "¡Jajaja! Soy un erudito que investiga estas ruinas.",
          "¿Quieres que examine el blasón de tu anillo?\nA ver, déjame mirar...",
          "...¡¿Qué?! ¡¿Dónde conseguiste un anillo con este blasón?!\nUn extranjero con este emblema...",
          "... ... ...\n... ... ...",
          "A decir verdad, en lo profundo de estas ruinas hay un monumento con este mismo blasón.\nSolo lo vi una vez en mi juventud...",
          "Pero ahora las bestias han anidado aquí\ny es imposible investigar el interior.",
          "Una gárgola bloquea el camino,\nimpidiendo cualquier avance.",
          "Si deseas conocer tu identidad, examina el monumento más allá de ese monstruo.\nPodrías encontrar una pista de tu origen.",
          "Si vences a la gárgola y miras la piedra, vuelve a verme.\nQuizá pueda ayudarte."
        ],
        cave_waiting: [
          "Si deseas conocer tu identidad, examina el monumento en las profundidades.\nPodrías hallar pistas sobre tus orígenes.",
          "Si derrotas a la gárgola y miras la inscripción, regresa a verme."
        ]
      },
      guard: {
        pass_ok: [
          "Llevas el Salvoconducto del alcalde.\n¡Bien, puedes pasar!"
        ],
        pass_ng: [
          "Más allá está el pueblo costero.\n¡No puedo dejarte pasar sin el Salvoconducto del alcalde!"
        ]
      },
      mayor: {
        has_pass: [
          "Jamás olvidaré cómo salvaste a la niña.\nQue tengas un buen viaje al pueblo costero."
        ],
        bag_full: [
          "Alcalde: \"¡Agradezco de todo corazón que salvaras a la niña!",
          "Alcalde: \"Deseo darte el Salvoconducto prometido, pero tu bolsa está llena.\nHaz sitio y regresa a verme.\""
        ],
        give_pass: [
          "Alcalde: \"¡Viajero! ¡Has rescatado a salvo a la pequeña!\n¡Qué bendición... qué alivio...!\"",
          "Alcalde: \"Has demostrado tu valor y nobleza al pueblo.\n¡Tal como prometí, toma esto!\n(¡Conseguiste Salvoconducto!)\"",
          "Alcalde: \"Con esto podrás cruzar el puesto hacia el pueblo costero.\nTen mucho cuidado en tu camino.\""
        ],
        waiting_rescue: [
          "¡Ve a la mazmorra del este y salva a la niña por favor...!\n¡Cuando vuelva a salvo, te entregaré el salvoconducto sin falta!"
        ],
        quest_start: [
          "¿Dices que quieres un salvoconducto para ir al pueblo costero?\n...Mmm, eres un forastero desconocido.\nNo puedo emitir un pase a alguien de origen incierto.",
          "... ... ...\n... ... ...",
          "¡¿Q-Qué?! ¡Ha ocurrido una tragedia!\nUn vecino acaba de traerme una terrible noticia...",
          "¡Una niña del pueblo fue raptada por monstruos\ny arrastrada a la mazmorra del este!",
          "¡Te lo suplico, viajero! ¡Salva a esa niña!\n¡Si la traes de vuelta, te daré el salvoconducto en agradecimiento!"
        ],
        default: [
          "Soy el alcalde de este pueblo.\n¿Necesitas algo?\n...Si no es así, descansa cuanto gustes."
        ]
      },
      girl: {
        in_dungeon_scared: [
          "Niña: \"¡Aaah! ¡Ayuda!\n¡Ese monstruo da mucho miedo, no puedo moverme!\""
        ],
        in_dungeon_rescued: [
          "Niña: \"¡Gracias por salvarme!\n¡Por favor, llévame de vuelta con el alcalde!\"",
          "(¡La niña se unió a ti!\nLlévala a salvo al pueblo de inicio.)"
        ],
        in_town_rescued: [
          "¡Ah, fuiste tú quien me salvó!\n¡Ya estoy en casa sana y salva, gracias!"
        ],
        in_town_default: [
          "¡Hola, viajero!\nTe ves muy fuerte.\n¡Buen viaje!"
        ]
      }
    },
    map_names: {
      first_island: "Isla del Inicio",
      lighthousekeeper_cottage: "Cabaña del Farero",
      cave: "Cueva del Norte",
      dungeon: "Mazmorra Oriental S1",
      first_dungeon2: "Mazmorra Oriental S2",
      first_town: "Pueblo del Inicio",
      first_church: "Inicio: Iglesia",
      inn: "Inicio: Posada",
      armor_shop: "Inicio: Armería",
      general_shop: "Inicio: Tienda",
      port_town: "Pueblo Costero",
      port_church: "Puerto: Iglesia",
      port_inn: "Puerto: Posada",
      port_armor_shop: "Puerto: Armería",
      port_general_shop: "Puerto: Tienda",
      forest: "Bosque Perdido",
      forest2: "Bosque Perdido",
      forest3: "Bosque Perdido",
      temple: "Ruinas del Templo",
      deep_forest: "Bosque Profundo",
      temple11: "Catacumbas S1",
      temple21: "Catacumbas S2",
      temple22: "Catacumbas S3",
      temple3: "Templo Subterráneo",
      undersea_tunnel1: "Túnel Submarino 1",
      undersea_tunnel2: "Túnel Submarino 2",
      undersea_tunnel3: "Túnel Submarino 3",
      dwarf_village: "Aldea de los Enanos",
      dwarf_village_general_shop: "Enanos: Tienda",
      dragonera_island: "Isla Dragonera",
      dragons_cave1: "Cueva del Dragón 1",
      dragons_cave2: "Cueva del Dragón 2"
    },
    map_objects: {
      cave_monument: [
        "Un blasón de escudo y dragón está grabado en el monumento...\nDebajo, hay una breve inscripción esculpida.",
        "'Otorgada por el antiguo Dragón verde,\nhe sellado mi espada en el arca.\nCuando aparezca aquel digno,\nque cumpla su misión una vez más\nantes de zarpar...'",
        "El resto está desgastado y no se puede leer."
      ],
      port_town_bookshelf: [
        "Viejos registros llenan la estantería...\n[Crónica de la isla: El registro plateado]",
        "'...Un caballero cruzó una vez el mar desde el continente,\ncon la bendición del Dragón verde para derrotar al Dragón negro.\nEl caballero confió su espada Colada y el Escudo del espíritu\na esta tierra antes de regresar al continente.'",
        "'...Posdata: Según los registros del continente,\nel linaje de dicho caballero perdió a su heredero en guerras posteriores,\ny se dice que su sangre se extinguió por completo.'"
      ],
      temple11_notebook: [
        "Un viejo cuaderno destrozado yace en el suelo.",
        "'...Mi señor eligió las profundidades de este lúgubre templo antiguo para sellar la espada.",
        "El caballero cruzó aceros con ese temible coloso de bronce, logrando silenciarlo al fin...'",
        "El resto es ilegible."
      ],
      temple22_notebook: [
        "Un viejo diario manchado de sangre yace en el suelo.",
        "'...Mi señor modificó el arca del altar con una cerradura doble.",
        "Una llave era la de hierro que custodiaba mi señor.",
        "Sin embargo, la otra llave de bronce... fue devuelta al interior de ese coloso cuando volvió a moverse.",
        "A menos que se reúnan ambas llaves, la espada no...'",
        "(El texto se corta aquí...)"
      ]
    },
    map_npcs: {
      first_town_woman: ["¡Hola!\nEste es el pueblo de inicio.", "Ten cuidado en tu viaje."],
      first_town_port_youth: ["Los monstruos aumentan últimamente.", "Apenas podemos salir fuera.", "¡El bosque es muy peligroso, ten cuidado!"],
      first_town_town_man: ["Este es un pueblo pacífico.\nHay monstruos afuera, así que ten cuidado."],
      first_church_inn_guest: ["Asegúrate de rezar por tu resurrección."],
      first_church_inn_keeper: ["Dios te salvará."],
      inn_inn_guest: ["Uff, dormir en una cama sana todas las heridas por completo."],
      port_town_port_worker: [
        "No podemos zarpar por culpa del dragón.\nSin cargar mercancías, no hay trabajo.",
        "Nadie en esta isla es capaz de derrotar a un monstruo semejante..."
      ],
      port_town_port_woman: [
        "Desde que cesó el comercio con el continente,\nlas provisiones no hacen más que escasear...",
        "Ojalá volviéramos a ser un pueblo costero pacífico como antes."
      ],
      port_town_port_youth: [
        "Puede que sea un pueblo costero pequeño,\npero nuestra gran biblioteca es nuestro orgullo.",
        "Dicen que guarda relatos de antiguos héroes y la historia de esta isla.\n¿Por qué no le echas un vistazo?"
      ],
      port_town_port_old_woman: [
        "¿Cuánto tiempo habrá pasado desde que el Dragón negro bloqueó el mar...?",
        "¿No aparecerá alguien que despeje las aguas,\nigual que aquel héroe venido del continente en el pasado?"
      ],
      port_town_captain: [
        "Quisiera zarpar hacia el continente,\npero el Dragón negro apostado en Dragonera nos lo impide.",
        "Sus llamas ardientes derriten una armadura de hierro en un instante,\npor no hablar de la cubierta.\nAcercarse es convertirse en cenizas con el barco.",
        "A menos que alguien lo derrote o hallemos forma de resistir el fuego, no podemos partir."
      ],
      port_inn_inn_guest: [
        "El Bosque Perdido en el centro de la isla está a oscuras por la maleza.\nSi vas, asegúrate de llevar un Farol y Hierba amarga de la tienda.",
        "Los árboles se mueven por sí mismos en ese bosque.\nPara adentrarte, necesitarás la Guía del bosque oculta bajo el templo, o te perderás para siempre."
      ],
      port_inn_bard: [
        "Soy un bardo errante.\n¿Conoces la antigua balada de esta isla?",
        "'El escudo dorado perdido entre las olas, a quién aguarda el dragón verde.\nLa estirpe que se creía extinta purgará la oscura calamidad una vez más...'",
        "Una antigua reliquia que duerme en lo profundo de los árboles móviles...\nSe canta que la clave para desafiar al Dragón negro que bloquea el mar descansa allí."
      ],
    }
  }
};

class I18nManager {
  constructor() {
    this.langs = ['ja', 'en', 'es'];
    this.currentLang = 'ja';
    try {
      const saved = localStorage.getItem('camino_de_leyenda_lang');
      if (saved && this.langs.includes(saved)) {
        this.currentLang = saved;
      }
    } catch (e) {
      console.warn('言語設定の読込に失敗しました:', e);
    }
  }

  toggleLang() {
    const idx = this.langs.indexOf(this.currentLang);
    this.currentLang = this.langs[(idx + 1) % this.langs.length];
    try {
      localStorage.setItem('camino_de_leyenda_lang', this.currentLang);
    } catch (e) {
      console.warn('言語設定の保存に失敗しました:', e);
    }
    return this.currentLang;
  }

  // 旧API: まだコアスクリプトに残存している参照のために維持
  t(keyPath, params = {}) {
    const keys = keyPath.split('.');
    let result = I18N_DICT[this.currentLang];
    for (const k of keys) {
      if (result === undefined || result === null) {
        result = keyPath;
        break;
      }
      result = result[k];
    }
    if (typeof result !== 'string') return keyPath;

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
        return [keyPath];
      }
      result = result[k];
    }
    if (!Array.isArray(result)) return [keyPath];

    return result.map(text => {
      let s = text;
      Object.keys(params).forEach(p => {
        s = s.replace(new RegExp(`\\{${p}\\}`, 'g'), params[p]);
      });
      return s;
    });
  }

  getMapName(mapId) {
    if (!mapId) return '';
    return this.t(`map_names.${mapId}`);
  }

  getInteractableText(mapId, obj) {
    if (!obj || !obj.type) return null;
    let key = null;
    if (mapId === 'cave' && obj.type === 'monument') key = 'cave_monument';
    else if (mapId === 'port_town' && obj.type === 'bookshelf') key = 'port_town_bookshelf';
    else if (mapId === 'temple11' && obj.type === 'notebook') key = 'temple11_notebook';
    else if (mapId === 'temple22' && obj.type === 'notebook') key = 'temple22_notebook';

    if (key) {
      return this.tArray(`map_objects.${key}`);
    }
    return null;
  }

  getNpcText(mapId, npcId) {
    if (!npcId) return null;
    const lookupKey = `${mapId}_${npcId}`;
    let result = I18N_DICT[this.currentLang]?.map_npcs?.[lookupKey];
    if (result && Array.isArray(result)) {
      return result;
    }
    return null;
  }

  getShopGreeting(npcId) {
    let type = 'default';
    if (npcId === 'weapon_shop_keeper' || npcId === 'port_weapon_shop_keeper') type = 'weapon';
    else if (npcId === 'general_shop_keeper' || npcId === 'port_general_shop_keeper' || npcId === 'dwarf_village_general_shop_keeper') type = 'item';
    else if (npcId === 'merchant') type = 'merchant';
    return this.t(`shop.greetings.${type}`);
  }

  // --- 新API (フェーズ4-B追加分) ---
  /**
   * カプセル化されたエンティティの多言語オブジェクトから、現在の言語のテキストを返す。
   * @param {object} textObj - 例: { ja: "スライム", en: "Slime", es: "Limos" }
   * @returns {string} 解決されたテキスト
   * @throws 該当言語のテキストが存在しない場合（Fail-Fast）
   */
  resolve(textObj) {
      if (!textObj || typeof textObj !== 'object') {
          throw new Error(`i18n.resolve に不正なオブジェクトが渡されました: ${JSON.stringify(textObj)}`);
      }
      
      const resolvedText = textObj[this.currentLang];
      
      if (resolvedText === undefined) {
          throw new Error(`言語 '${this.currentLang}' のテキストが定義されていません: ${JSON.stringify(textObj)}`);
      }
      
      return resolvedText;
  }
}

export const i18n = new I18nManager();