/**
 * tools/test_battle_double_submit.mjs
 * 戦闘中コマンド二重送信例外の修正 単体・結合検証スイート
 *
 * 検証項目:
 * - TC-BM-DOUBLE-01: アイテム（'strong_herb'）使用決定時の連続キー入力抑止
 * - TC-BM-DOUBLE-02: 呪文（'hoimi'）使用決定時の連続キー入力抑止
 * - TC-BM-DOUBLE-03: メインコマンド（'ATTACK'）決定時の連続キー入力抑止
 * - TC-BM-MP-01: 呪文選択時のMP不足によるコマンド選択復帰と再入力
 * - TC-BM-GUARD-01: stateMachine.state !== BattleState.COMMAND_WAIT 時の強制入力遮断
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { BattleManager } from '../js/battle.js';
import { BattleState } from '../js/engine/battle/BattleStateMachine.js';
import { ITEM_DB, SPELL_DB } from '../js/items.js';
import { MONSTER_DEFINITIONS } from '../js/monsters.js';
import { i18n } from '../js/i18n.js';
import { logFormatter } from '../js/logFormatter.js';

/**
 * 確定マスターデータ・ロケール・ログ辞書のヘッドレスロード
 */
function ensureHeadlessEnvironmentLoaded() {
  const rootDir = process.cwd();

  if (!i18n.isLoaded) {
    const langs = ['ja', 'en', 'es'];
    for (const lang of langs) {
      const localeRaw = JSON.parse(
        fs.readFileSync(path.join(rootDir, 'data', 'locales', `${lang}.json`), 'utf8')
      );
      i18n.localeData[lang] = localeRaw;
    }
    i18n.isLoaded = true;
  }

  const logDomains = ['player', 'menu_action', 'battle_log', 'field'];
  for (const domain of logDomains) {
    if (!logFormatter.domains.has(domain)) {
      const logRaw = JSON.parse(
        fs.readFileSync(path.join(rootDir, 'data', 'logs', `${domain}.json`), 'utf8')
      );
      logFormatter.registerDomain(domain, logRaw);
    }
  }

  if (!ITEM_DB.strong_herb || !ITEM_DB.herb || !ITEM_DB.magic_water) {
    const itemFiles = ['i_strong_herb.json', 'i_herb.json', 'i_magic_water.json'];
    for (const fileName of itemFiles) {
      const raw = JSON.parse(
        fs.readFileSync(path.join(rootDir, 'data', 'items', fileName), 'utf8')
      );
      ITEM_DB[raw.id] = {
        ...raw,
        get name() {
          return i18n.resolve(raw.name);
        }
      };
    }
  }

  if (!SPELL_DB.hoimi || !SPELL_DB.mera) {
    const spellFiles = ['s_hoimi.json', 's_mera.json'];
    for (const fileName of spellFiles) {
      const raw = JSON.parse(
        fs.readFileSync(path.join(rootDir, 'data', 'spells', fileName), 'utf8')
      );
      SPELL_DB[raw.id] = {
        ...raw,
        get name() {
          return i18n.resolve(raw.name);
        }
      };
    }
  }

  if (!MONSTER_DEFINITIONS.slime) {
    const slimeRaw = JSON.parse(
      fs.readFileSync(path.join(rootDir, 'data', 'monsters', 'm_slime.json'), 'utf8')
    );
    MONSTER_DEFINITIONS[slimeRaw.id] = {
      ...slimeRaw,
      get name() {
        return i18n.resolve(slimeRaw.name);
      }
    };
  }
}

/**
 * テスト用プレイヤー生成ヘルパー（確定キーおよび実機インターフェース準拠）
 */
function createTestPlayer(overrides = {}) {
  const player = {
    name: 'テスト勇者',
    level: 5,
    hp: 30,
    maxHp: 50,
    mp: 10,
    maxMp: 20,
    atk: 18,
    def: 12,
    spd: 20,
    exp: 0,
    gold: 100,
    isPoisoned: false,
    inventory: {
      strong_herb: 2,
      herb: 1
    },
    spells: ['hoimi', 'mera'],
    equipment: {
      weapon: null,
      armor: null,
      shield: null
    },
    getAttack() {
      return this.atk;
    },
    getDefense() {
      return this.def;
    },
    removeItem(itemId, count = 1) {
      const current = this.inventory[itemId] || 0;
      this.inventory[itemId] = Math.max(0, current - count);
    },
    heal(amount) {
      this.hp = Math.min(this.maxHp, this.hp + amount);
    },
    healMp(amount) {
      this.mp = Math.min(this.maxMp, this.mp + amount);
    },
    consumeMp(cost) {
      if (this.mp < cost) {
        return false;
      }
      this.mp -= cost;
      return true;
    },
    curePoison() {
      this.isPoisoned = false;
    },
    takeDamage(dmg) {
      this.hp = Math.max(0, this.hp - dmg);
    },
    ...overrides
  };
  return player;
}

/**
 * BattleManager を COMMAND_WAIT 状態の戦闘中へセットアップするヘルパー
 */
function createCommandWaitBattle(playerOverrides = {}) {
  const player = createTestPlayer(playerOverrides);
  const bm = new BattleManager(player, () => {});
  bm.startBattle('slime', false);
  bm.stateMachine.proceedToTurnCheck();
  bm.stateMachine.resolveTurnCheck({ canAct: true });
  bm.phase = 'COMMAND_SELECT';
  bm.commandIndex = 0;
  return { bm, player };
}

export function runBattleDoubleSubmitTests() {
  ensureHeadlessEnvironmentLoaded();

  // =========================================================================
  // TC-BM-DOUBLE-01: アイテム（'strong_herb'）使用決定時の連続キー入力抑止
  // =========================================================================
  {
    const { bm, player } = createCommandWaitBattle({
      hp: 10,
      maxHp: 80,
      inventory: { strong_herb: 2 }
    });

    bm.phase = 'ITEM_SELECT';
    bm.itemList = [
      { name: '上薬草', id: 'strong_herb', type: 'item' },
      { name: 'もどる', id: 'cancel', type: 'cancel' }
    ];
    bm.itemIndex = 0;

    assert.strictEqual(bm.stateMachine.state, BattleState.COMMAND_WAIT);
    assert.strictEqual(player.inventory.strong_herb, 2);

    assert.doesNotThrow(() => {
      bm.handleKeyDown('Enter');
      bm.handleKeyDown('Enter');
    }, 'TC-BM-DOUBLE-01: Enter 連続2回押下で Invalid state transition 例外が発生してはなりません');

    assert.strictEqual(
      player.inventory.strong_herb,
      1,
      'TC-BM-DOUBLE-01: 上薬草は1個だけ消費される必要があります'
    );
    assert.strictEqual(
      bm.stateMachine.state,
      BattleState.ACTION_RESOLVING,
      'TC-BM-DOUBLE-01: stateMachine.state は ACTION_RESOLVING へ遷移している必要があります'
    );
    assert.strictEqual(
      bm.phase,
      'MESSAGE',
      'TC-BM-DOUBLE-01: bm.phase は MESSAGE へ遷移している必要があります'
    );
  }

  // =========================================================================
  // TC-BM-DOUBLE-02: 呪文（'hoimi'）使用決定時の連続キー入力抑止
  // =========================================================================
  {
    const hoimiCost = SPELL_DB.hoimi.cost;
    const initialMp = 10;
    const { bm, player } = createCommandWaitBattle({
      hp: 15,
      maxHp: 80,
      mp: initialMp,
      maxMp: 20,
      spells: ['hoimi']
    });

    bm.phase = 'ITEM_SELECT';
    bm.itemList = [
      { name: 'ホイミ', id: 'hoimi', type: 'magic', cost: hoimiCost },
      { name: 'もどる', id: 'cancel', type: 'cancel' }
    ];
    bm.itemIndex = 0;

    assert.strictEqual(bm.stateMachine.state, BattleState.COMMAND_WAIT);

    assert.doesNotThrow(() => {
      bm.handleKeyDown(' ');
      bm.handleKeyDown(' ');
    }, 'TC-BM-DOUBLE-02: Space 連続2回押下で Invalid state transition 例外が発生してはなりません');

    assert.strictEqual(
      player.mp,
      initialMp - hoimiCost,
      'TC-BM-DOUBLE-02: MPは1回分（cost: 3）のみ消費される必要があります'
    );
    assert.strictEqual(
      bm.stateMachine.state,
      BattleState.ACTION_RESOLVING,
      'TC-BM-DOUBLE-02: stateMachine.state は ACTION_RESOLVING へ遷移している必要があります'
    );
    assert.strictEqual(
      bm.phase,
      'MESSAGE',
      'TC-BM-DOUBLE-02: bm.phase は MESSAGE へ遷移している必要があります'
    );
  }

  // =========================================================================
  // TC-BM-DOUBLE-03: メインコマンド（'ATTACK'）決定時の連続キー入力抑止
  // =========================================================================
  {
    const { bm } = createCommandWaitBattle();
    bm.phase = 'COMMAND_SELECT';
    bm.commandIndex = 0; // たたかう

    assert.strictEqual(bm.stateMachine.state, BattleState.COMMAND_WAIT);

    let submitCount = 0;
    const origSubmitCommand = bm.stateMachine.submitCommand.bind(bm.stateMachine);
    bm.stateMachine.submitCommand = (commandType) => {
      submitCount += 1;
      return origSubmitCommand(commandType);
    };

    assert.doesNotThrow(() => {
      bm.handleKeyDown('Enter');
      bm.handleKeyDown('Enter');
    }, 'TC-BM-DOUBLE-03: メインコマンド Enter 連続2回押下で例外が発生してはなりません');

    assert.strictEqual(
      submitCount,
      1,
      'TC-BM-DOUBLE-03: submitCommand は1回のみ呼び出される必要があります'
    );
    assert.strictEqual(
      bm.stateMachine.state,
      BattleState.ACTION_RESOLVING,
      'TC-BM-DOUBLE-03: stateMachine.state は ACTION_RESOLVING である必要があります'
    );
  }

  // =========================================================================
  // TC-BM-MP-01: 呪文選択時のMP不足によるコマンド選択復帰と再入力
  // =========================================================================
  {
    const hoimiCost = SPELL_DB.hoimi.cost;
    const { bm, player } = createCommandWaitBattle({
      hp: 20,
      maxHp: 50,
      mp: 0,
      maxMp: 20,
      spells: ['hoimi']
    });

    bm.phase = 'ITEM_SELECT';
    bm.itemList = [
      { name: 'ホイミ', id: 'hoimi', type: 'magic', cost: hoimiCost },
      { name: 'もどる', id: 'cancel', type: 'cancel' }
    ];
    bm.itemIndex = 0;

    // 手順1: MP 0 の状態でホイミを決定
    bm.handleKeyDown('Enter');
    assert.strictEqual(
      bm.phase,
      'MESSAGE',
      'TC-BM-MP-01: 手順1直後は MP不足メッセージ表示のため bm.phase === MESSAGE である必要があります'
    );
    assert.strictEqual(player.mp, 0, 'TC-BM-MP-01: MP不足時はMPが消費されない必要があります');

    // 手順2: メッセージ送り完了で COMMAND_SELECT へ戻る
    let guardSteps = 0;
    while (bm.phase === 'MESSAGE' && guardSteps < 10) {
      bm.isTextComplete = true;
      bm.displayedText = bm.currentText;
      bm.handleKeyDown('Enter');
      guardSteps += 1;
    }

    assert.strictEqual(
      bm.phase,
      'COMMAND_SELECT',
      'TC-BM-MP-01: 手順2完了後は bm.phase === COMMAND_SELECT へ復帰している必要があります'
    );
    assert.strictEqual(
      bm.stateMachine.state,
      BattleState.COMMAND_WAIT,
      'TC-BM-MP-01: 手順2完了後は stateMachine.state === COMMAND_WAIT に同期復帰している必要があります'
    );

    // 手順3: 復帰した COMMAND_SELECT 状態で「たたかう」を再決定
    bm.commandIndex = 0;
    assert.doesNotThrow(() => {
      bm.handleKeyDown('Enter');
    }, 'TC-BM-MP-01: 手順3のコマンド再決定時に Invalid state transition 例外が発生してはなりません');

    assert.strictEqual(
      bm.stateMachine.state,
      BattleState.ACTION_RESOLVING,
      'TC-BM-MP-01: 手順3完了後は正常に ACTION_RESOLVING へ遷移する必要があります'
    );
  }

  // =========================================================================
  // TC-BM-GUARD-01: stateMachine.state !== BattleState.COMMAND_WAIT 時の強制入力遮断
  // =========================================================================
  {
    const { bm, player } = createCommandWaitBattle({
      hp: 25,
      maxHp: 50,
      inventory: { herb: 1 }
    });

    // 不整合状態を意図的に構築: phase は ITEM_SELECT だが、stateMachine は既に ACTION_RESOLVING
    bm.stateMachine.submitCommand('ITEM');
    bm.phase = 'ITEM_SELECT';
    bm.itemList = [
      { name: '薬草', id: 'herb', type: 'item' },
      { name: 'もどる', id: 'cancel', type: 'cancel' }
    ];
    bm.itemIndex = 0;

    assert.strictEqual(bm.stateMachine.state, BattleState.ACTION_RESOLVING);
    assert.strictEqual(player.inventory.herb, 1);

    assert.doesNotThrow(() => {
      bm.handleKeyDown('Enter');
    }, 'TC-BM-GUARD-01: COMMAND_WAIT 以外での入力で例外を外部へ漏出させてはなりません');

    assert.strictEqual(
      player.inventory.herb,
      1,
      'TC-BM-GUARD-01: 薬草が消費されてはなりません'
    );
    assert.strictEqual(
      bm.stateMachine.state,
      BattleState.ACTION_RESOLVING,
      'TC-BM-GUARD-01: stateMachine.state は ACTION_RESOLVING のまま維持される必要があります'
    );
  }
}

// 直接実行時のエントリポイント
if (process.argv[1] && process.argv[1].endsWith('test_battle_double_submit.mjs')) {
  runBattleDoubleSubmitTests();
  console.log('BattleDoubleSubmit: 全テスト項目が正常にパスしました。');
}