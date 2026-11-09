// FILE_ENTRY: tools/test_menu_action_dispatch.mjs
/**
 * tools/test_menu_action_dispatch.mjs
 * Step 5-3b: コマンド決定の完全アクションディスパッチ化 単体・契約検証テスト
 *
 * 検証項目（全14項目）:
 *  1. 静的契約検証（js/engine/menu/MenuActionExecutor.js: Core層規約・禁止演算子排除）
 *  2. 静的契約検証（js/menu.js: ActionTypes.MENU.EXECUTE 参照および player 直接状態変更の排除）
 *  3. 静的契約検証（js/main.js: ActionTypes.MENU.EXECUTE 購読および applyMenuAction 配線確認）
 *  4. 正常系: HP回復アイテム（herb）使用時のアクションディスパッチ・純粋Payload・状態適用・実行順序
 *  5. 正常系: MP回復アイテム（magic_water）使用時のアクションディスパッチと状態適用
 *  6. 正常系: 状態異常回復アイテム（antidote）使用時のアクションディスパッチと毒解除適用
 *  7. 正常系: 特殊フィールドアイテム（holy_water, torch, lantern）使用時のアクションディスパッチと状態適用
 *  8. 正常系: 装備着脱（copper_sword 装着 / 解除）のアクションディスパッチと状態適用
 *  9. 正常系: 呪文詠唱（hoimi, kiari, remira, toherosu, liremito）のアクションディスパッチと状態適用
 * 10. 正常系: アイテム破棄（CONFIRM_DROP）のアクションディスパッチと状態適用
 * 11. 境界値: 実行拒否条件（HP満タン・MP不足・バッグ満杯）時に MENU.EXECUTE が発行されないこと
 * 12. 異常系: applyMenuAction への不正 targetActor 入力に対するフェイルファスト例外検証
 * 13. 異常系: applyMenuAction への不正 payload 入力に対するフェイルファスト例外検証
 * 14. 後方互換: MENU.EXECUTE 外部リスナー未登録時および eventBus = null 時のフォールバック適用検証
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { EngineEventBus } from '../js/engine/core/EngineEventBus.js';
import { ActionTypes } from '../js/engine/core/ActionTypes.js';
import { EventTypes } from '../js/engine/core/EventTypes.js';
import { applyMenuAction } from '../js/engine/menu/MenuActionExecutor.js';
import { Player } from '../js/player.js';
import { MenuManager } from '../js/menu.js';
import { initLocaleData } from '../js/i18n.js';
import { initItemData } from '../js/items.js';
import { initLogData } from '../js/logFormatter.js';
import { initEventData } from '../js/events.js';

/**
 * コメントおよび文字列リテラルを除去して実コードの演算子・識別子を検証するためのヘルパー
 */
function stripCommentsAndStrings(source) {
  let result = '';
  let i = 0;
  const len = source.length;
  let state = 'NORMAL';
  let quoteChar = '';

  while (i < len) {
    const ch = source[i];
    const next = i + 1 < len ? source[i + 1] : '';

    if (state === 'NORMAL') {
      if (ch === '/' && next === '/') {
        state = 'LINE_COMMENT';
        i += 2;
      } else if (ch === '/' && next === '*') {
        state = 'BLOCK_COMMENT';
        i += 2;
      } else if (ch === '\'' || ch === '"' || ch === '`') {
        state = 'STRING';
        quoteChar = ch;
        result += '""';
        i += 1;
      } else {
        result += ch;
        i += 1;
      }
    } else if (state === 'LINE_COMMENT') {
      if (ch === '\n') {
        state = 'NORMAL';
        result += '\n';
      }
      i += 1;
    } else if (state === 'BLOCK_COMMENT') {
      if (ch === '*' && next === '/') {
        state = 'NORMAL';
        i += 2;
      } else {
        i += 1;
      }
    } else if (state === 'STRING') {
      if (ch === '\\') {
        i += 2;
      } else if (ch === quoteChar) {
        state = 'NORMAL';
        i += 1;
      } else {
        i += 1;
      }
    }
  }
  return result;
}

/**
 * Payload が JSON 化可能な純粋データ（関数やクラスインスタンスを含まない）であることを検証するヘルパー
 */
function assertPureJsonPayload(payload) {
  assert.notEqual(payload, null, 'Payload は null であってはいけません。');
  assert.equal(typeof payload, 'object', 'Payload はプレーンオブジェクトである必要があります。');
  assert.equal(Object.getPrototypeOf(payload), Object.prototype, 'Payload にクラスインスタンスは使用できません。');
  const serialized = JSON.stringify(payload);
  assert.equal(typeof serialized, 'string');
  const deserialized = JSON.parse(serialized);
  assert.deepEqual(deserialized, payload, 'Payload にシリアライズ不可要素（関数・undefined等）が含まれています。');
}

/**
 * テスト用観測フック付きハーネス生成ヘルパー
 */
function createDispatchHarness({ autoApply = true, withEventBus = true, currentMap = null } = {}) {
  const player = new Player();
  const mockMsgWin = {
    calls: [],
    open(messages) {
      this.calls.push(messages);
    }
  };

  const timeline = [];
  const dispatchedActions = [];
  const mapChangePayloads = [];
  const sePayloads = [];
  const msgPayloads = [];
  let endCount = 0;

  const eventBus = withEventBus ? new EngineEventBus() : null;
  if (eventBus !== null) {
    eventBus.on(ActionTypes.MENU.EXECUTE, (payload) => {
      timeline.push('MENU_EXECUTE');
      dispatchedActions.push(payload);
      if (autoApply) {
        applyMenuAction(player, payload);
      }
    });
    eventBus.on(ActionTypes.SYSTEM.CHANGE_MAP, (payload) => {
      timeline.push('CHANGE_MAP');
      mapChangePayloads.push(payload);
    });
    eventBus.on(EventTypes.SYSTEM.AUDIO_PLAY_SE, (payload) => {
      timeline.push('AUDIO_PLAY_SE');
      sePayloads.push(payload);
    });
    eventBus.on(EventTypes.SYSTEM.MESSAGE_LOG, (payload) => {
      timeline.push('MESSAGE_LOG');
      msgPayloads.push(payload);
    });
  }

  const onEnd = () => {
    endCount += 1;
    timeline.push('onEnd');
  };

  const menu = new MenuManager(
    player,
    mockMsgWin,
    onEnd,
    () => {},
    () => currentMap,
    eventBus
  );

  return {
    player,
    mockMsgWin,
    eventBus,
    menu,
    timeline,
    dispatchedActions,
    mapChangePayloads,
    sePayloads,
    msgPayloads,
    getEndCount: () => endCount
  };
}

export async function runMenuActionDispatchTests() {
  await initLocaleData();
  await initItemData();
  await initLogData();
  await initEventData();

  const rootDir = process.cwd();

  // -------------------------------------------------------------
  // ケース1: 静的契約検証（js/engine/menu/MenuActionExecutor.js）
  // -------------------------------------------------------------
  {
    const executorPath = path.resolve(rootDir, 'js/engine/menu/MenuActionExecutor.js');
    assert.equal(
      fs.existsSync(executorPath),
      true,
      '契約違反: js/engine/menu/MenuActionExecutor.js が存在しません。'
    );

    const rawSource = fs.readFileSync(executorPath, 'utf8');
    const codeOnly = stripCommentsAndStrings(rawSource);

    const forbiddenBrowserApis = [
      /\bwindow\b/,
      /\bdocument\b/,
      /\bHTMLCanvasElement\b/,
      /\bAudioContext\b/,
      /\blocalStorage\b/,
      /\bsessionStorage\b/,
      /\bnavigator\b/
    ];
    for (const pattern of forbiddenBrowserApis) {
      assert.equal(
        pattern.test(codeOnly),
        false,
        `契約違反: Core層で禁止されているブラウザAPIパターン (${pattern}) が検出されました。`
      );
    }

    assert.equal(
      /drivers\//.test(rawSource),
      false,
      '契約違反: Core層から js/drivers/ への参照・import は禁止されています。'
    );

    assert.equal(
      codeOnly.includes('||'),
      false,
      '契約違反: Core層で禁止されている論理和演算子 (||) が検出されました。'
    );
    assert.equal(
      codeOnly.includes('??'),
      false,
      '契約違反: Core層で禁止されているNull合体演算子 (??) が検出されました。'
    );
    assert.equal(
      codeOnly.includes('?'),
      false,
      '契約違反: Core層で禁止されている三項演算子 (?:) または ? 演算子が検出されました。'
    );
  }

  // -------------------------------------------------------------
  // ケース2: 静的契約検証（js/menu.js）
  // -------------------------------------------------------------
  {
    const menuPath = path.resolve(rootDir, 'js/menu.js');
    const menuSource = fs.readFileSync(menuPath, 'utf8');

    assert.equal(
      menuSource.includes('ActionTypes.MENU.EXECUTE'),
      true,
      '契約違反: js/menu.js に ActionTypes.MENU.EXECUTE の参照が存在しません。'
    );

    const forbiddenDirectMutations = [
      'this.player.equip(',
      'this.player.unequip(',
      'this.player.heal(',
      'this.player.healMp(',
      'this.player.curePoison(',
      'this.player.removeItem(',
      'this.player.consumeMp(',
      'this.player.holyWaterSteps =',
      'this.player.torchSteps =',
      'this.player.isLanternLit =',
      'this.player.remiraSteps ='
    ];

    for (const pattern of forbiddenDirectMutations) {
      assert.equal(
        menuSource.includes(pattern),
        false,
        `契約違反: js/menu.js に player 状態への直接操作 (${pattern}) が残存しています。`
      );
    }
  }

  // -------------------------------------------------------------
  // ケース3: 静的契約検証（js/main.js）
  // -------------------------------------------------------------
  {
    const mainPath = path.resolve(rootDir, 'js/main.js');
    const mainSource = fs.readFileSync(mainPath, 'utf8');

    assert.equal(
      mainSource.includes('ActionTypes.MENU.EXECUTE'),
      true,
      '契約違反: js/main.js に ActionTypes.MENU.EXECUTE の購読登録が存在しません。'
    );

    assert.equal(
      mainSource.includes('applyMenuAction'),
      true,
      '契約違反: js/main.js に applyMenuAction への委譲処理が存在しません。'
    );
  }

  // -------------------------------------------------------------
  // ケース4: 正常系・HP回復アイテム（herb）使用のディスパッチと順序検証
  // -------------------------------------------------------------
  {
    const { player, menu, timeline, dispatchedActions } = createDispatchHarness({
      autoApply: true,
      withEventBus: true
    });

    player.hp = 5;
    assert.equal(player.maxHp, 15);
    assert.equal(player.inventory.herb, 1);

    menu.useItem({ id: 'herb', type: 'item' });

    assert.equal(dispatchedActions.length, 1);
    const payload = dispatchedActions[0];
    assertPureJsonPayload(payload);
    assert.equal(payload.actionType, 'USE_ITEM');
    assert.equal(payload.itemId, 'herb');
    assert.equal(payload.consumeCount, 1);
    assert.equal(payload.healHp, 30);

    assert.equal(player.hp, 15);
    assert.equal(player.inventory.herb, 0);
    assert.deepEqual(timeline, ['onEnd', 'MENU_EXECUTE', 'AUDIO_PLAY_SE', 'MESSAGE_LOG']);
  }

  // -------------------------------------------------------------
  // ケース5: 正常系・MP回復アイテム（magic_water）使用のディスパッチと状態適用
  // -------------------------------------------------------------
  {
    const { player, menu, dispatchedActions } = createDispatchHarness({
      autoApply: true,
      withEventBus: true
    });

    player.maxMp = 20;
    player.mp = 4;
    player.addItem('magic_water', 1);

    menu.useItem({ id: 'magic_water', type: 'item' });

    assert.equal(dispatchedActions.length, 1);
    const payload = dispatchedActions[0];
    assertPureJsonPayload(payload);
    assert.equal(payload.actionType, 'USE_ITEM');
    assert.equal(payload.itemId, 'magic_water');
    assert.equal(payload.consumeCount, 1);
    assert.equal(payload.healMp, 15);

    assert.equal(player.mp, 19);
    assert.equal(player.inventory.magic_water, 0);
  }

  // -------------------------------------------------------------
  // ケース6: 正常系・状態異常回復アイテム（antidote）使用のディスパッチと状態適用
  // -------------------------------------------------------------
  {
    const { player, menu, dispatchedActions } = createDispatchHarness({
      autoApply: true,
      withEventBus: true
    });

    player.isPoisoned = true;
    player.addItem('antidote', 1);

    menu.useItem({ id: 'antidote', type: 'item' });

    assert.equal(dispatchedActions.length, 1);
    const payload = dispatchedActions[0];
    assertPureJsonPayload(payload);
    assert.equal(payload.actionType, 'USE_ITEM');
    assert.equal(payload.itemId, 'antidote');
    assert.equal(payload.consumeCount, 1);
    assert.equal(payload.curePoison, true);

    assert.equal(player.isPoisoned, false);
    assert.equal(player.inventory.antidote, 0);
  }

  // -------------------------------------------------------------
  // ケース7: 正常系・特殊フィールドアイテム（holy_water, torch, lantern）
  // -------------------------------------------------------------
  {
    const { player, menu, dispatchedActions } = createDispatchHarness({
      autoApply: true,
      withEventBus: true
    });

    player.addItem('holy_water', 1);
    player.addItem('torch', 1);
    player.addItem('lantern', 1);

    // 7-1. holy_water
    menu.useItem({ id: 'holy_water', type: 'item' });
    assert.equal(dispatchedActions.length, 1);
    assertPureJsonPayload(dispatchedActions[0]);
    assert.equal(dispatchedActions[0].actionType, 'USE_ITEM');
    assert.equal(dispatchedActions[0].itemId, 'holy_water');
    assert.equal(dispatchedActions[0].consumeCount, 1);
    assert.equal(dispatchedActions[0].holyWaterSteps, 128);
    assert.equal(player.holyWaterSteps, 128);
    assert.equal(player.inventory.holy_water, 0);

    // 7-2. torch
    menu.useItem({ id: 'torch', type: 'item' });
    assert.equal(dispatchedActions.length, 2);
    assertPureJsonPayload(dispatchedActions[1]);
    assert.equal(dispatchedActions[1].actionType, 'USE_ITEM');
    assert.equal(dispatchedActions[1].itemId, 'torch');
    assert.equal(dispatchedActions[1].consumeCount, 1);
    assert.equal(dispatchedActions[1].torchSteps, 60);
    assert.equal(player.torchSteps, 60);
    assert.equal(player.inventory.torch, 0);

    // 7-3. lantern（点灯 -> 消灯トグル）
    assert.equal(player.isLanternLit, false);
    menu.useItem({ id: 'lantern', type: 'item' });
    assert.equal(dispatchedActions.length, 3);
    assertPureJsonPayload(dispatchedActions[2]);
    assert.equal(dispatchedActions[2].actionType, 'USE_ITEM');
    assert.equal(dispatchedActions[2].itemId, 'lantern');
    assert.equal(dispatchedActions[2].consumeCount, 0);
    assert.equal(dispatchedActions[2].isLanternLit, true);
    assert.equal(player.isLanternLit, true);

    menu.useItem({ id: 'lantern', type: 'item' });
    assert.equal(dispatchedActions.length, 4);
    assert.equal(dispatchedActions[3].isLanternLit, false);
    assert.equal(player.isLanternLit, false);
  }

  // -------------------------------------------------------------
  // ケース8: 正常系・装備着脱（copper_sword 装着 / 解除）
  // -------------------------------------------------------------
  {
    const { player, menu, dispatchedActions } = createDispatchHarness({
      autoApply: true,
      withEventBus: true
    });

    assert.equal(player.equipment.weapon, 'stick');
    player.addItem('copper_sword', 1);

    // 8-1. 装着
    menu.equipItem({ id: 'copper_sword', type: 'weapon' });
    assert.equal(dispatchedActions.length, 1);
    assertPureJsonPayload(dispatchedActions[0]);
    assert.equal(dispatchedActions[0].actionType, 'EQUIP_ITEM');
    assert.equal(dispatchedActions[0].operation, 'equip');
    assert.equal(dispatchedActions[0].slot, 'weapon');
    assert.equal(dispatchedActions[0].itemId, 'copper_sword');
    assert.equal(player.equipment.weapon, 'copper_sword');

    // 8-2. 解除
    menu.equipItem({ id: 'copper_sword', type: 'weapon' });
    assert.equal(dispatchedActions.length, 2);
    assertPureJsonPayload(dispatchedActions[1]);
    assert.equal(dispatchedActions[1].actionType, 'EQUIP_ITEM');
    assert.equal(dispatchedActions[1].operation, 'unequip');
    assert.equal(dispatchedActions[1].slot, 'weapon');
    assert.equal(dispatchedActions[1].itemId, 'copper_sword');
    assert.equal(player.equipment.weapon, null);
  }

  // -------------------------------------------------------------
  // ケース9: 正常系・呪文詠唱（hoimi, kiari, remira, toherosu, liremito）
  // -------------------------------------------------------------
  {
    const { player, menu, dispatchedActions, mapChangePayloads } = createDispatchHarness({
      autoApply: true,
      withEventBus: true,
      currentMap: {
        id: 'cave',
        escapeTarget: {
          targetMap: 'first_island',
          targetX: 6,
          targetY: 10,
          direction: 'down'
        }
      }
    });

    player.hp = 5;
    player.maxMp = 30;
    player.mp = 30;
    player.isPoisoned = true;
    player.spells = ['hoimi', 'kiari', 'remira', 'toherosu', 'liremito'];

    // 9-1. hoimi
    menu.useMagic({ id: 'hoimi', cost: 3, type: 'magic' });
    assert.equal(dispatchedActions.length, 1);
    assertPureJsonPayload(dispatchedActions[0]);
    assert.equal(dispatchedActions[0].actionType, 'USE_MAGIC');
    assert.equal(dispatchedActions[0].spellId, 'hoimi');
    assert.equal(dispatchedActions[0].mpCost, 3);
    assert.equal(typeof dispatchedActions[0].healHp === 'number' && dispatchedActions[0].healHp > 0, true);
    assert.equal(player.mp, 27);
    assert.equal(player.hp, 15);

    // 9-2. kiari
    menu.useMagic({ id: 'kiari', cost: 3, type: 'magic' });
    assert.equal(dispatchedActions.length, 2);
    assertPureJsonPayload(dispatchedActions[1]);
    assert.equal(dispatchedActions[1].actionType, 'USE_MAGIC');
    assert.equal(dispatchedActions[1].spellId, 'kiari');
    assert.equal(dispatchedActions[1].mpCost, 3);
    assert.equal(dispatchedActions[1].curePoison, true);
    assert.equal(player.mp, 24);
    assert.equal(player.isPoisoned, false);

    // 9-3. remira
    menu.useMagic({ id: 'remira', cost: 3, type: 'magic' });
    assert.equal(dispatchedActions.length, 3);
    assertPureJsonPayload(dispatchedActions[2]);
    assert.equal(dispatchedActions[2].actionType, 'USE_MAGIC');
    assert.equal(dispatchedActions[2].spellId, 'remira');
    assert.equal(dispatchedActions[2].mpCost, 3);
    assert.equal(dispatchedActions[2].remiraSteps, 120);
    assert.equal(player.mp, 21);
    assert.equal(player.remiraSteps, 120);

    // 9-4. toherosu
    menu.useMagic({ id: 'toherosu', cost: 2, type: 'magic' });
    assert.equal(dispatchedActions.length, 4);
    assertPureJsonPayload(dispatchedActions[3]);
    assert.equal(dispatchedActions[3].actionType, 'USE_MAGIC');
    assert.equal(dispatchedActions[3].spellId, 'toherosu');
    assert.equal(dispatchedActions[3].mpCost, 2);
    assert.equal(dispatchedActions[3].holyWaterSteps, 128);
    assert.equal(player.mp, 19);
    assert.equal(player.holyWaterSteps, 128);

    // 9-5. liremito（MP消費ディスパッチ + CHANGE_MAP 発行の共存確認）
    menu.useMagic({ id: 'liremito', cost: 6, type: 'magic' });
    assert.equal(dispatchedActions.length, 5);
    assertPureJsonPayload(dispatchedActions[4]);
    assert.equal(dispatchedActions[4].actionType, 'USE_MAGIC');
    assert.equal(dispatchedActions[4].spellId, 'liremito');
    assert.equal(dispatchedActions[4].mpCost, 6);
    assert.equal(player.mp, 13);
    assert.equal(mapChangePayloads.length, 1);
  }

  // -------------------------------------------------------------
  // ケース10: 正常系・アイテム破棄（CONFIRM_DROP）のディスパッチと状態適用
  // -------------------------------------------------------------
  {
    const { player, menu, dispatchedActions } = createDispatchHarness({
      autoApply: true,
      withEventBus: true
    });

    assert.equal(player.inventory.herb, 1);
    menu.open();
    // ルートインデックス 1（どうぐ）を選択
    menu.handleKeyDown('ArrowDown');
    menu.handleKeyDown('Enter');
    // 先頭アイテム（herb）を選択 -> ITEM_ACTION
    menu.handleKeyDown('Enter');
    // インデックス 1（すてる）を選択 -> DROP_CONFIRM
    menu.handleKeyDown('ArrowDown');
    menu.handleKeyDown('Enter');
    // 上キーで「はい（インデックス0）」へ移動し確定 -> CONFIRM_DROP
    menu.handleKeyDown('ArrowUp');
    menu.handleKeyDown('Enter');

    assert.equal(dispatchedActions.length, 1);
    const payload = dispatchedActions[0];
    assertPureJsonPayload(payload);
    assert.equal(payload.actionType, 'DROP_ITEM');
    assert.equal(payload.itemId, 'herb');
    assert.equal(payload.count, 1);
    assert.equal(player.inventory.herb, 0);
  }

  // -------------------------------------------------------------
  // ケース11: 境界値・実行拒否条件時に MENU.EXECUTE が発行されないこと
  // -------------------------------------------------------------
  {
    const { player, menu, dispatchedActions } = createDispatchHarness({
      autoApply: true,
      withEventBus: true
    });

    // 11-1. HP満タン時の herb 使用
    player.hp = 15;
    menu.useItem({ id: 'herb', type: 'item' });
    assert.equal(dispatchedActions.length, 0);

    // 11-2. MP不足時の hoimi 詠唱
    player.hp = 5;
    player.mp = 2;
    player.spells = ['hoimi'];
    menu.useMagic({ id: 'hoimi', cost: 3, type: 'magic' });
    assert.equal(dispatchedActions.length, 0);

    // 11-3. バッグ満杯時の装備解除
    player.addItem('herb', 11);
    assert.equal(player.isInventoryFull(1), true);
    menu.equipItem({ id: 'stick', type: 'weapon' });
    assert.equal(dispatchedActions.length, 0);
  }

  // -------------------------------------------------------------
  // ケース12: 異常系・applyMenuAction への不正 targetActor 入力検証
  // -------------------------------------------------------------
  {
    const validPayload = { actionType: 'DROP_ITEM', itemId: 'herb', count: 1 };

    assert.throws(
      () => applyMenuAction(null, validPayload),
      'null の targetActor に対して例外がスローされませんでした。'
    );
    assert.throws(
      () => applyMenuAction(undefined, validPayload),
      'undefined の targetActor に対して例外がスローされませんでした。'
    );
    assert.throws(
      () => applyMenuAction('invalid_actor', validPayload),
      '文字列の targetActor に対して例外がスローされませんでした。'
    );
  }

  // -------------------------------------------------------------
  // ケース13: 異常系・applyMenuAction への不正 payload 入力検証
  // -------------------------------------------------------------
  {
    const player = new Player();

    assert.throws(
      () => applyMenuAction(player, null),
      'null の payload に対して例外がスローされませんでした。'
    );
    assert.throws(
      () => applyMenuAction(player, {}),
      'actionType 未指定の payload に対して例外がスローされませんでした。'
    );
    assert.throws(
      () => applyMenuAction(player, { actionType: 'UNKNOWN_MENU_ACTION' }),
      '未知の actionType に対して例外がスローされませんでした。'
    );
    assert.throws(
      () => applyMenuAction(player, { actionType: 'EQUIP_ITEM', operation: 'invalid_op', slot: 'weapon', itemId: 'stick' }),
      '不正な装備 operation に対して例外がスローされませんでした。'
    );
    assert.throws(
      () => applyMenuAction(player, { actionType: 'DROP_ITEM', itemId: 'herb', count: 0 }),
      '0以下の破棄数量に対して例外がスローされませんでした。'
    );
  }

  // -------------------------------------------------------------
  // ケース14: 後方互換・MENU.EXECUTE 外部リスナー未登録時のフォールバック適用検証
  // -------------------------------------------------------------
  {
    const player = new Player();
    const standaloneBus = new EngineEventBus();
    const mockMsgWin = { open() {} };

    const menu = new MenuManager(
      player,
      mockMsgWin,
      () => {},
      () => {},
      () => null,
      standaloneBus
    );

    player.hp = 5;
    assert.equal(player.inventory.herb, 1);

    // MENU.EXECUTE のリスナーを登録しない状態で useItem を実行
    menu.useItem({ id: 'herb', type: 'item' });

    assert.equal(player.hp, 15, '外部リスナー未登録時のフォールバック HP 回復が機能していません。');
    assert.equal(player.inventory.herb, 0, '外部リスナー未登録時のフォールバックアイテム消費が機能していません。');
  }
}

const currentFilePath = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentFilePath) {
  runMenuActionDispatchTests()
    .then(() => {
      console.log('[PASS] test_menu_action_dispatch.mjs 全14項目の検証に合格しました。');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[FAIL] test_menu_action_dispatch.mjs 検証失敗:', err);
      process.exit(1);
    });
}