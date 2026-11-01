// tools/test_menu_callbacks.mjs
// MenuManager 回帰防止単体テスト（Phase 1: コールバック方式検証）

import './setup_headless_env.mjs';
import assert from 'node:assert/strict';
import { Player } from '../js/player.js';
import { MenuManager } from '../js/menu.js';
import { initLocaleData } from '../js/i18n.js';

function createHarness() {
  const player = new Player();
  const msgWin = {
    addMessage: () => {},
    clear: () => {}
  };

  const calls = {
    onEnd: 0,
    onOpenSlot: [],
    changeMap: 0,
    getCurrentMap: 0,
    onReturnToTitle: 0
  };

  const onEndCallback = () => {
    calls.onEnd += 1;
  };

  const onOpenSlot = (mode) => {
    calls.onOpenSlot.push(mode);
  };

  const changeMap = () => {
    calls.changeMap += 1;
  };

  const getCurrentMap = () => {
    calls.getCurrentMap += 1;
    return 'map_test';
  };

  const onReturnToTitle = () => {
    calls.onReturnToTitle += 1;
  };

  const menu = new MenuManager(
    player,
    msgWin,
    onEndCallback,
    onOpenSlot,
    changeMap,
    getCurrentMap,
    onReturnToTitle
  );

  return { menu, calls };
}

async function runTests() {
  // 実在辞書データのロード
  await initLocaleData();

  // ---------------------------------------------------------------------------
  // Case 1-1: ルートカーソルの境界巡回（ブラックボックス操作保証）
  // ---------------------------------------------------------------------------
  {
    const { menu } = createHarness();
    menu.open();
    assert.strictEqual(menu.phase, 'ROOT');
    assert.strictEqual(menu.rootIndex, 0);

    // ArrowUp により末尾インデックス 6 (冒険を中断する) へ逆巡回
    menu.handleKeyDown('ArrowUp');
    assert.strictEqual(menu.rootIndex, 6);

    // Enter で QUIT_CONFIRM フェーズへ遷移
    menu.handleKeyDown('Enter');
    assert.strictEqual(menu.phase, 'QUIT_CONFIRM');

    // Escape でキャンセル復帰
    menu.handleKeyDown('Escape');
    assert.strictEqual(menu.phase, 'ROOT');
  }

  // ---------------------------------------------------------------------------
  // Case 1-2: ロードダイアログ要求のキーストローク伝達
  // ---------------------------------------------------------------------------
  {
    const { menu, calls } = createHarness();
    menu.open();

    // ルートインデックス 4 (冒険の書を読む) へ移動
    menu.handleKeyDown('ArrowDown'); // 1: 道具
    menu.handleKeyDown('ArrowDown'); // 2: 装備
    menu.handleKeyDown('ArrowDown'); // 3: 思い出す
    menu.handleKeyDown('ArrowDown'); // 4: 冒険の書を読む
    assert.strictEqual(menu.rootIndex, 4);

    menu.handleKeyDown('Enter');
    assert.strictEqual(calls.onOpenSlot.length, 1);
    assert.strictEqual(calls.onOpenSlot[0], 'load');
  }

  // ---------------------------------------------------------------------------
  // Case 1-3: セーブダイアログ要求のキーストローク伝達
  // ---------------------------------------------------------------------------
  {
    const { menu, calls } = createHarness();
    menu.open();

    // ルートインデックス 5 (冒険の書を記録する) へ移動
    menu.handleKeyDown('ArrowDown'); // 1
    menu.handleKeyDown('ArrowDown'); // 2
    menu.handleKeyDown('ArrowDown'); // 3
    menu.handleKeyDown('ArrowDown'); // 4
    menu.handleKeyDown('ArrowDown'); // 5: 冒険の書を記録する
    assert.strictEqual(menu.rootIndex, 5);

    menu.handleKeyDown('Enter');
    assert.strictEqual(calls.onOpenSlot.length, 1);
    assert.strictEqual(calls.onOpenSlot[0], 'save');
  }

  // ---------------------------------------------------------------------------
  // Case 1-4: 中断メニューの「いいえ」選択（キャンセル）
  // ---------------------------------------------------------------------------
  {
    const { menu, calls } = createHarness();
    menu.open();

    // ルートインデックス 6 (冒険を中断する) へ移動
    menu.handleKeyDown('ArrowDown'); // 1
    menu.handleKeyDown('ArrowDown'); // 2
    menu.handleKeyDown('ArrowDown'); // 3
    menu.handleKeyDown('ArrowDown'); // 4
    menu.handleKeyDown('ArrowDown'); // 5
    menu.handleKeyDown('ArrowDown'); // 6
    assert.strictEqual(menu.rootIndex, 6);

    menu.handleKeyDown('Enter');
    assert.strictEqual(menu.phase, 'QUIT_CONFIRM');
    assert.strictEqual(menu.quitConfirmIndex, 1); // デフォルトは「いいえ」

    // そのまま Enter (いいえ 確定)
    menu.handleKeyDown('Enter');
    assert.strictEqual(menu.phase, 'ROOT');
    assert.strictEqual(calls.onEnd, 0);
    assert.strictEqual(calls.onReturnToTitle, 0);
  }

  // ---------------------------------------------------------------------------
  // Case 1-5: 中断メニューのトグル反転と「はい」確定
  // ---------------------------------------------------------------------------
  {
    const { menu, calls } = createHarness();
    menu.open();

    // ルートインデックス 6 へ移動
    menu.handleKeyDown('ArrowDown');
    menu.handleKeyDown('ArrowDown');
    menu.handleKeyDown('ArrowDown');
    menu.handleKeyDown('ArrowDown');
    menu.handleKeyDown('ArrowDown');
    menu.handleKeyDown('ArrowDown');

    menu.handleKeyDown('Enter');
    assert.strictEqual(menu.phase, 'QUIT_CONFIRM');

    // ArrowLeft で 0:「はい」へトグル反転
    menu.handleKeyDown('ArrowLeft');
    assert.strictEqual(menu.quitConfirmIndex, 0);

    // Enter (はい 確定)
    menu.handleKeyDown('Enter');
    assert.strictEqual(calls.onEnd, 1);
    assert.strictEqual(calls.onReturnToTitle, 1);
  }

  console.log('[PASS] tools/test_menu_callbacks.mjs: All Phase 1 callback cases passed successfully.');
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});