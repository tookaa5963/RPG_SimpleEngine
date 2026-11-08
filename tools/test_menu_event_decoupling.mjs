// FILE_ENTRY: tools/test_menu_event_decoupling.mjs
/**
 * tools/test_menu_event_decoupling.mjs
 * Step 5-3-Pre: メッセージ枠・効果音直接呼出しの分離 単体・契約検証テスト
 *
 * 検証項目（全11項目）:
 *  1. 静的契約検証（js/menu.js: sound.js 依存排除・AUDIO_PLAY_SE / MESSAGE_LOG 参照確認）
 *  2. 静的契約検証（js/main.js: MESSAGE_LOG 購読および messageWindow.open 取り次ぎ確認）
 *  3. 正常系: カーソル移動（ArrowDown / ArrowUp）およびキャンセル（Escape）時の SE イベント発行
 *  4. 正常系: 回復アイテム（herb）使用時の状態変化・実行順序（onEnd -> AUDIO_PLAY_SE -> MESSAGE_LOG）
 *  5. 正常系: 装備品（copper_sword）装着時のイベント通知および実行順序
 *  6. 正常系: 回復呪文（hoimi）詠唱時の MP 消費・HP 回復・2段階 SE（magic -> heal）発行
 *  7. 正常系・結合: WebAudioDriver とのイベント駆動連携
 *  8. 境界値: HP 満タン時の herb 使用拒否（消費なし・SE なし・メッセージ通知のみ）
 *  9. 異常系: MP 不足時の hoimi 詠唱拒否（消費/回復なし・SE なし・メッセージ通知のみ）
 * 10. 異常系: インベントリ満杯時の装備解除失敗（装備維持・bump SE・メッセージ通知）
 * 11. 後方互換: eventBus = null 時のフォールバック動作（mockMsgWin.open への直接フォールバック）
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { EngineEventBus } from '../js/engine/core/EngineEventBus.js';
import { EventTypes } from '../js/engine/core/EventTypes.js';
import { WebAudioDriver } from '../js/drivers/audio/WebAudioDriver.js';
import { Player } from '../js/player.js';
import { MenuManager } from '../js/menu.js';
import { initLocaleData } from '../js/i18n.js';
import { initItemData } from '../js/items.js';
import { initLogData } from '../js/logFormatter.js';
import { initEventData } from '../js/events.js';

/**
 * メッセージウィンドウ用モック生成ヘルパー
 */
function createMockMessageWindow() {
  const calls = [];
  return {
    calls,
    open(messages) {
      calls.push(messages);
    }
  };
}

/**
 * テスト用観測フック付きハーネス生成ヘルパー
 */
function createTestHarness({ withEventBus = true } = {}) {
  const player = new Player();
  const mockMsgWin = createMockMessageWindow();
  const timeline = [];
  const sePayloads = [];
  const msgPayloads = [];
  let endCount = 0;

  const eventBus = withEventBus ? new EngineEventBus() : null;
  if (eventBus !== null) {
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
    () => null,
    eventBus
  );

  return {
    player,
    mockMsgWin,
    eventBus,
    menu,
    timeline,
    sePayloads,
    msgPayloads,
    getEndCount: () => endCount
  };
}

export async function runMenuEventDecouplingTests() {
  // 必須非同期マスタデータ初期化（全4種）
  await initLocaleData();
  await initItemData();
  await initLogData();
  await initEventData();

  const rootDir = process.cwd();

  // -------------------------------------------------------------
  // ケース1: 静的契約検証（js/menu.js）
  // -------------------------------------------------------------
  {
    const menuPath = path.resolve(rootDir, 'js/menu.js');
    const menuSource = fs.readFileSync(menuPath, 'utf8');

    const hasSoundImport = /import\s+[\s\S]*?['"]\.\/sound\.js['"]/.test(menuSource);
    assert.equal(
      hasSoundImport,
      false,
      '契約違反: js/menu.js に ./sound.js の import 文が残存しています。'
    );

    assert.equal(
      menuSource.includes('sound.play'),
      false,
      '契約違反: js/menu.js に sound.play の直接呼び出しが残存しています。'
    );

    assert.equal(
      menuSource.includes('EventTypes.SYSTEM.AUDIO_PLAY_SE'),
      true,
      '契約違反: js/menu.js に EventTypes.SYSTEM.AUDIO_PLAY_SE の参照が存在しません。'
    );

    assert.equal(
      menuSource.includes('EventTypes.SYSTEM.MESSAGE_LOG'),
      true,
      '契約違反: js/menu.js に EventTypes.SYSTEM.MESSAGE_LOG の参照が存在しません。'
    );
  }

  // -------------------------------------------------------------
  // ケース2: 静的契約検証（js/main.js）
  // -------------------------------------------------------------
  {
    const mainPath = path.resolve(rootDir, 'js/main.js');
    const mainSource = fs.readFileSync(mainPath, 'utf8');

    assert.equal(
      mainSource.includes('EventTypes.SYSTEM.MESSAGE_LOG'),
      true,
      '契約違反: js/main.js に EventTypes.SYSTEM.MESSAGE_LOG の購読登録が存在しません。'
    );

    assert.equal(
      mainSource.includes('messageWindow.open'),
      true,
      '契約違反: js/main.js に messageWindow.open への取り次ぎ処理が存在しません。'
    );
  }

  // -------------------------------------------------------------
  // ケース3: 正常系・カーソル操作およびキャンセル SE
  // -------------------------------------------------------------
  {
    const { menu, sePayloads } = createTestHarness({ withEventBus: true });

    assert.equal(menu.phase, 'ROOT');
    menu.handleKeyDown('ArrowDown');
    menu.handleKeyDown('ArrowUp');

    assert.equal(sePayloads.length, 2);
    assert.deepEqual(sePayloads[0], { se: 'submit' });
    assert.deepEqual(sePayloads[1], { se: 'submit' });

    menu.phase = 'QUIT_CONFIRM';
    menu.handleKeyDown('Escape');

    assert.equal(sePayloads.length, 3);
    assert.deepEqual(sePayloads[2], { se: 'cancel' });
  }

  // -------------------------------------------------------------
  // ケース4: 正常系・回復アイテム herb 使用時のイベント通知と実行順序
  // -------------------------------------------------------------
  {
    const { player, mockMsgWin, menu, timeline, sePayloads, msgPayloads } = createTestHarness({
      withEventBus: true
    });

    player.hp = 5;
    assert.equal(player.maxHp, 15);
    assert.equal(player.inventory.herb, 1);

    menu.useItem({ id: 'herb', type: 'item' });

    assert.equal(player.hp, 15, 'herb 使用後に HP が最大値 15 まで回復していません。');
    assert.equal(player.inventory.herb, 0, 'herb 使用後に所持数が 0 に減少していません。');
    assert.equal(mockMsgWin.calls.length, 0, 'msgWin.open が直接呼び出されています。');
    assert.deepEqual(
      timeline,
      ['onEnd', 'AUDIO_PLAY_SE', 'MESSAGE_LOG'],
      'イベントおよび onEnd の実行順序が仕様と一致しません。'
    );
    assert.equal(sePayloads.length, 1);
    assert.deepEqual(sePayloads[0], { se: 'heal' });

    assert.equal(msgPayloads.length, 1);
    assert.equal(Array.isArray(msgPayloads[0].messages), true);
    assert.equal(msgPayloads[0].messages.length, 2);
    for (const msg of msgPayloads[0].messages) {
      assert.equal(typeof msg === 'string' && msg.trim().length > 0, true);
    }
  }

  // -------------------------------------------------------------
  // ケース5: 正常系・装備品 copper_sword 装着時のイベント通知
  // -------------------------------------------------------------
  {
    const { player, mockMsgWin, menu, timeline, sePayloads, msgPayloads } = createTestHarness({
      withEventBus: true
    });

    assert.equal(player.equipment.weapon, 'stick');
    player.addItem('copper_sword', 1);

    menu.equipItem({ id: 'copper_sword', type: 'weapon' });

    assert.equal(player.equipment.weapon, 'copper_sword');
    assert.equal(mockMsgWin.calls.length, 0, 'msgWin.open が直接呼び出されています。');
    assert.deepEqual(
      timeline,
      ['onEnd', 'AUDIO_PLAY_SE', 'MESSAGE_LOG'],
      '装備装着時の実行順序が仕様と一致しません。'
    );
    assert.equal(sePayloads.length, 1);
    assert.deepEqual(sePayloads[0], { se: 'chest' });

    assert.equal(msgPayloads.length, 1);
    assert.equal(Array.isArray(msgPayloads[0].messages), true);
    assert.equal(msgPayloads[0].messages.length, 1);
    assert.equal(
      typeof msgPayloads[0].messages[0] === 'string' && msgPayloads[0].messages[0].trim().length > 0,
      true
    );
  }

  // -------------------------------------------------------------
  // ケース6: 正常系・回復呪文 hoimi 詠唱時のイベント通知
  // -------------------------------------------------------------
  {
    const { player, mockMsgWin, menu, sePayloads, msgPayloads } = createTestHarness({
      withEventBus: true
    });

    player.hp = 5;
    player.maxMp = 10;
    player.mp = 10;
    player.spells = ['hoimi'];

    menu.useMagic({ id: 'hoimi', cost: 3, type: 'magic' });

    assert.equal(player.mp, 7, 'hoimi 詠唱後の消費 MP が一致しません。');
    assert.equal(player.hp, 15, 'hoimi 詠唱後に HP が最大値 15 まで回復していません。');
    assert.equal(mockMsgWin.calls.length, 0, 'msgWin.open が直接呼び出されています。');

    assert.equal(sePayloads.length, 2);
    assert.deepEqual(sePayloads[0], { se: 'magic' });
    assert.deepEqual(sePayloads[1], { se: 'heal' });

    assert.equal(msgPayloads.length, 1);
    assert.equal(Array.isArray(msgPayloads[0].messages), true);
    assert.equal(msgPayloads[0].messages.length, 2);
    for (const msg of msgPayloads[0].messages) {
      assert.equal(typeof msg === 'string' && msg.trim().length > 0, true);
    }
  }

  // -------------------------------------------------------------
  // ケース7: 正常系・結合（WebAudioDriver とのイベント駆動連携）
  // -------------------------------------------------------------
  {
    const { player, eventBus, menu } = createTestHarness({ withEventBus: true });
    const soundCalls = [];
    const mockSound = {
      playSubmit() { soundCalls.push('playSubmit'); },
      playHeal() { soundCalls.push('playHeal'); },
      playCancel() { soundCalls.push('playCancel'); },
      playChest() { soundCalls.push('playChest'); },
      playBump() { soundCalls.push('playBump'); },
      playMagic() { soundCalls.push('playMagic'); }
    };

    const audioDriver = new WebAudioDriver(eventBus, mockSound);
    audioDriver.subscribe();

    try {
      player.hp = 5;
      menu.handleKeyDown('ArrowDown');
      menu.useItem({ id: 'herb', type: 'item' });

      assert.deepEqual(
        soundCalls,
        ['playSubmit', 'playHeal'],
        'WebAudioDriver を経由した音声メソッド呼び出しが一致しません。'
      );
    } finally {
      audioDriver.unsubscribe();
    }
  }

  // -------------------------------------------------------------
  // ケース8: 境界値・HP 満タン時の herb 使用拒否
  // -------------------------------------------------------------
  {
    const { player, mockMsgWin, menu, sePayloads, msgPayloads } = createTestHarness({
      withEventBus: true
    });

    player.hp = 15;
    assert.equal(player.inventory.herb, 1);

    menu.useItem({ id: 'herb', type: 'item' });

    assert.equal(player.inventory.herb, 1, 'HP満タン時に herb が消費されています。');
    assert.equal(sePayloads.length, 0, 'HP満タン時の使用拒否で効果音が発行されています。');
    assert.equal(msgPayloads.length, 1);
    assert.equal(Array.isArray(msgPayloads[0].messages) && msgPayloads[0].messages.length >= 1, true);
    assert.equal(mockMsgWin.calls.length, 0, 'msgWin.open が直接呼び出されています。');
  }

  // -------------------------------------------------------------
  // ケース9: 異常系・MP 不足時の hoimi 詠唱拒否
  // -------------------------------------------------------------
  {
    const { player, mockMsgWin, menu, sePayloads, msgPayloads } = createTestHarness({
      withEventBus: true
    });

    player.hp = 5;
    player.maxMp = 10;
    player.mp = 2;
    player.spells = ['hoimi'];

    menu.useMagic({ id: 'hoimi', cost: 3, type: 'magic' });

    assert.equal(player.mp, 2, 'MP不足時に MP が変化しています。');
    assert.equal(player.hp, 5, 'MP不足時に HP が変化しています。');
    assert.equal(sePayloads.length, 0, 'MP不足時の詠唱拒否で効果音が発行されています。');
    assert.equal(msgPayloads.length, 1);
    assert.equal(Array.isArray(msgPayloads[0].messages) && msgPayloads[0].messages.length >= 1, true);
    assert.equal(mockMsgWin.calls.length, 0, 'msgWin.open が直接呼び出されています。');
  }

  // -------------------------------------------------------------
  // ケース10: 異常系・インベントリ満杯時の装備解除失敗
  // -------------------------------------------------------------
  {
    const { player, mockMsgWin, menu, sePayloads, msgPayloads } = createTestHarness({
      withEventBus: true
    });

    assert.equal(player.equipment.weapon, 'stick');
    player.addItem('herb', 11);
    assert.equal(
      player.isInventoryFull(1),
      true,
      'バッグ内非装備アイテム数が上限12個に到達していません。'
    );

    menu.equipItem({ id: 'stick', type: 'weapon' });

    assert.equal(player.equipment.weapon, 'stick', '満杯時に装備が解除されています。');
    assert.equal(sePayloads.length, 1);
    assert.deepEqual(sePayloads[0], { se: 'bump' });
    assert.equal(msgPayloads.length, 1);
    assert.equal(Array.isArray(msgPayloads[0].messages) && msgPayloads[0].messages.length >= 1, true);
    assert.equal(mockMsgWin.calls.length, 0, 'msgWin.open が直接呼び出されています。');
  }

  // -------------------------------------------------------------
  // ケース11: 後方互換・eventBus = null 時のフォールバック動作
  // -------------------------------------------------------------
  {
    const { mockMsgWin, menu } = createTestHarness({ withEventBus: false });

    menu.showCurrentObjective();

    assert.equal(
      mockMsgWin.calls.length,
      1,
      'eventBus = null 時に mockMsgWin.open へのフォールバックが実行されていません。'
    );
    assert.equal(Array.isArray(mockMsgWin.calls[0]), true);
    assert.equal(mockMsgWin.calls[0].length, 1);
    assert.equal(
      typeof mockMsgWin.calls[0][0] === 'string' && mockMsgWin.calls[0][0].trim().length > 0,
      true
    );
  }
}

// 単体直接実行用エントリポイント
const currentFilePath = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentFilePath) {
  runMenuEventDecouplingTests()
    .then(() => {
      console.log('[PASS] test_menu_event_decoupling.mjs 全11項目の検証に合格しました。');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[FAIL] test_menu_event_decoupling.mjs 検証失敗:', err);
      process.exit(1);
    });
}