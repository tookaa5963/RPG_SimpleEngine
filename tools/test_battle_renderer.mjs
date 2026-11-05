/**
 * tools/test_battle_renderer.mjs
 * Step 5-1d: BattleRenderer 単体テストスイート
 * 
 * 戦闘画面描画・UIボックス呼び出し・エフェクト呼び出し・フェイルファスト検証を網羅。
 */

import assert from 'node:assert/strict';
import { BattleRenderer } from '../js/drivers/battle/BattleRenderer.js';

/**
 * テスト用 CanvasRenderingContext2D モック生成
 */
function createMockContext() {
  const calls = [];
  return {
    calls,
    save() { calls.push({ method: 'save' }); },
    restore() { calls.push({ method: 'restore' }); },
    fillRect(x, y, w, h) { calls.push({ method: 'fillRect', x, y, w, h, fillStyle: this.fillStyle }); },
    strokeRect(x, y, w, h) { calls.push({ method: 'strokeRect', x, y, w, h }); },
    clearRect(x, y, w, h) { calls.push({ method: 'clearRect', x, y, w, h }); },
    drawImage(img, x, y, w, h) { calls.push({ method: 'drawImage', img, x, y, w, h }); },
    fillText(text, x, y) { calls.push({ method: 'fillText', text, x, y, fillStyle: this.fillStyle, font: this.font, textAlign: this.textAlign }); },
    measureText(text) { return { width: (text || '').length * 10 }; },
    beginPath() { calls.push({ method: 'beginPath' }); },
    closePath() { calls.push({ method: 'closePath' }); },
    moveTo(x, y) { calls.push({ method: 'moveTo', x, y }); },
    lineTo(x, y) { calls.push({ method: 'lineTo', x, y }); },
    fill() { calls.push({ method: 'fill' }); },
    stroke() { calls.push({ method: 'stroke' }); },
    fillStyle: '#000000',
    strokeStyle: '#ffffff',
    lineWidth: 1,
    font: '16px monospace',
    textAlign: 'left'
  };
}

/**
 * テスト用 Canvas モック生成
 */
function createMockCanvas(width = 800, height = 600) {
  return { width, height };
}

/**
 * テスト用 Effects モック生成
 */
function createMockEffects() {
  const calls = [];
  return {
    calls,
    applyScreenShake(ctx) { calls.push({ method: 'applyScreenShake', ctx }); },
    draw(ctx) { calls.push({ method: 'draw', ctx }); }
  };
}

/**
 * 最小限の正常系描画状態ペイロードを生成
 */
function createBaseRenderState(overrides = {}) {
  const baseEffects = createMockEffects();
  return {
    enemy: {
      id: 'slime',
      name: 'スライム',
      hp: 10,
      color: '#00aa00',
      imageSrc: 'assets/images/monsters/slime.png'
    },
    enemyFlashTimer: 0,
    isImageLoaded: true,
    enemyImage: { src: 'assets/images/monsters/slime.png' },
    charIndex: 100,
    phase: 'MESSAGE',
    commands: ['たたかう', 'じゅもん', 'どうぐ', 'にげる'],
    commandIndex: 0,
    itemList: [],
    itemIndex: 0,
    discardList: [],
    discardIndex: 0,
    displayedText: 'スライムが あらわれた！',
    isTextComplete: false,
    discardSelectMsg: 'どれを すてますか？',
    effects: baseEffects,
    isWestern: false,
    ...overrides
  };
}

export function runBattleRendererTests() {
  const renderer = new BattleRenderer();

  // =========================================================================
  // 1. 異常系・フェイルファスト検証 (TC-BR-FAIL)
  // =========================================================================

  // TC-BR-FAIL-01: ctx が null または不正オブジェクトの場合は例外をスローすること
  {
    const canvas = createMockCanvas();
    const state = createBaseRenderState();

    assert.throws(
      () => renderer.render(null, canvas, state),
      /NullReferenceError|TypeError|InvalidContextError/,
      'TC-BR-FAIL-01: ctx が null の時は例外をスローする必要があります'
    );

    assert.throws(
      () => renderer.render({}, canvas, state),
      /InvalidContextError|TypeError/,
      'TC-BR-FAIL-01: ctx.fillRect が未定義の時は例外をスローする必要があります'
    );
  }

  // TC-BR-FAIL-02: canvas が null または正の寸法を持たない場合は例外をスローすること
  {
    const ctx = createMockContext();
    const state = createBaseRenderState();

    assert.throws(
      () => renderer.render(ctx, null, state),
      /NullReferenceError|TypeError|RangeError/,
      'TC-BR-FAIL-02: canvas が null の時は例外をスローする必要があります'
    );

    assert.throws(
      () => renderer.render(ctx, { width: 0, height: 600 }, state),
      /RangeError|ProtocolError/,
      'TC-BR-FAIL-02: canvas.width <= 0 の時は例外をスローする必要があります'
    );

    assert.throws(
      () => renderer.render(ctx, { width: 800, height: -1 }, state),
      /RangeError|ProtocolError/,
      'TC-BR-FAIL-02: canvas.height <= 0 の時は例外をスローする必要があります'
    );
  }

  // TC-BR-FAIL-03: state が null または undefined の場合は例外をスローすること
  {
    const ctx = createMockContext();
    const canvas = createMockCanvas();

    assert.throws(
      () => renderer.render(ctx, canvas, null),
      /NullReferenceError|TypeError/,
      'TC-BR-FAIL-03: state が null の時は例外をスローする必要があります'
    );

    assert.throws(
      () => renderer.render(ctx, canvas, undefined),
      /NullReferenceError|TypeError/,
      'TC-BR-FAIL-03: state が undefined の時は例外をスローする必要があります'
    );
  }

  // =========================================================================
  // 2. 正常系：基本パイプラインおよびエフェクト呼び出し順序検証 (TC-BR-PIPE)
  // =========================================================================

  // TC-BR-PIPE-01: save, clear, restore, および effects 呼び出し順序の検証
  {
    const ctx = createMockContext();
    const canvas = createMockCanvas(800, 600);
    const effects = createMockEffects();
    const state = createBaseRenderState({ effects });

    renderer.render(ctx, canvas, state);

    // save が最初、restore が最後であること
    assert.strictEqual(ctx.calls[0].method, 'save', 'TC-BR-PIPE-01: 描画開始時に ctx.save() が呼ばれる必要があります');
    assert.strictEqual(ctx.calls[ctx.calls.length - 1].method, 'restore', 'TC-BR-PIPE-01: 描画終了時に ctx.restore() が呼ばれる必要があります');

    // 画面全体が黒クリアされること
    const clearCall = ctx.calls.find(c => c.method === 'fillRect' && c.x === 0 && c.y === 0 && c.w === 800 && c.h === 600);
    assert.ok(clearCall, 'TC-BR-PIPE-01: 画面全体を黒(#000000)でクリアする fillRect が実行される必要があります');
    assert.strictEqual(clearCall.fillStyle, '#000000');

    // effects.applyScreenShake と effects.draw が呼ばれていること
    assert.strictEqual(effects.calls.length, 2, 'TC-BR-PIPE-01: effects から2回メソッドが呼ばれる必要があります');
    assert.strictEqual(effects.calls[0].method, 'applyScreenShake', 'TC-BR-PIPE-01: 前段で applyScreenShake が呼ばれる必要があります');
    assert.strictEqual(effects.calls[1].method, 'draw', 'TC-BR-PIPE-01: 後段で draw が呼ばれる必要があります');
  }

  // =========================================================================
  // 3. 敵描画および点滅・フォールバック検証 (TC-BR-ENEMY)
  // =========================================================================

  // TC-BR-ENEMY-01: 生存時かつ点滅なしで drawImage が実行されること
  {
    const ctx = createMockContext();
    const canvas = createMockCanvas(800, 600);
    const state = createBaseRenderState({
      enemy: { id: 'slime', name: 'スライム', hp: 10, color: '#00aa00' },
      enemyFlashTimer: 0,
      isImageLoaded: true
    });

    renderer.render(ctx, canvas, state);

    const drawImageCall = ctx.calls.find(c => c.method === 'drawImage');
    assert.ok(drawImageCall, 'TC-BR-ENEMY-01: 生存かつ画像ロード完了時は drawImage が呼ばれる必要があります');

    // サイズ検証: Math.floor(800 * 0.42) = 336
    const expectedSize = Math.floor(800 * 0.42);
    assert.strictEqual(drawImageCall.w, expectedSize, 'TC-BR-ENEMY-01: 敵描画幅が計算値と一致する必要があります');
    assert.strictEqual(drawImageCall.h, expectedSize, 'TC-BR-ENEMY-01: 敵描画高さが計算値と一致する必要があります');

    // 座標検証: center = (400, 216), drawX = 400 - 168 = 232, drawY = 216 - 168 = 48
    const expectedX = 400 - (expectedSize / 2);
    const expectedY = 216 - (expectedSize / 2);
    assert.strictEqual(drawImageCall.x, expectedX, 'TC-BR-ENEMY-01: 敵描画X座標が一致する必要があります');
    assert.strictEqual(drawImageCall.y, expectedY, 'TC-BR-ENEMY-01: 敵描画Y座標が一致する必要があります');
  }

  // TC-BR-ENEMY-02: 点滅タイマー非表示フレームおよび敵HP0以下では敵描画がスキップされること
  {
    const canvas = createMockCanvas(800, 600);

    // 点滅非表示フレーム: timer = 3 -> Math.floor(3 / 3) % 2 === 1 (非表示)
    const ctxBlink = createMockContext();
    const stateBlink = createBaseRenderState({ enemyFlashTimer: 3, isImageLoaded: true });
    renderer.render(ctxBlink, canvas, stateBlink);
    assert.strictEqual(
      ctxBlink.calls.some(c => c.method === 'drawImage'),
      false,
      'TC-BR-ENEMY-02: 点滅非表示フレームでは敵画像が描画されてはなりません'
    );

    // 敵HP <= 0
    const ctxDead = createMockContext();
    const stateDead = createBaseRenderState({
      enemy: { id: 'slime', name: 'スライム', hp: 0, color: '#00aa00' },
      enemyFlashTimer: 0,
      isImageLoaded: true
    });
    renderer.render(ctxDead, canvas, stateDead);
    assert.strictEqual(
      ctxDead.calls.some(c => c.method === 'drawImage'),
      false,
      'TC-BR-ENEMY-02: 敵HPが0の時は敵画像が描画されてはなりません'
    );
  }

  // TC-BR-ENEMY-03: black_dragon 特例全画面描画サイズの検証
  {
    const ctx = createMockContext();
    const canvas = createMockCanvas(800, 600);
    const state = createBaseRenderState({
      enemy: { id: 'black_dragon', name: 'ブラックドラゴン', hp: 500, color: '#111111' },
      enemyFlashTimer: 0,
      isImageLoaded: true
    });

    renderer.render(ctx, canvas, state);

    const drawImageCall = ctx.calls.find(c => c.method === 'drawImage');
    assert.ok(drawImageCall, 'TC-BR-ENEMY-03: black_dragon の drawImage が呼ばれる必要があります');

    const expectedSize = Math.max(800, 600); // 800
    assert.strictEqual(drawImageCall.w, expectedSize, 'TC-BR-ENEMY-03: black_dragon の幅は Math.max(cw, ch) である必要があります');
    assert.strictEqual(drawImageCall.h, expectedSize, 'TC-BR-ENEMY-03: black_dragon の高さは Math.max(cw, ch) である必要があります');
    assert.strictEqual(drawImageCall.x, (800 - expectedSize) / 2, 'TC-BR-ENEMY-03: black_dragon のX座標は中央配置である必要があります');
    assert.strictEqual(drawImageCall.y, (600 - expectedSize) / 2, 'TC-BR-ENEMY-03: black_dragon のY座標は中央配置である必要があります');
  }

  // TC-BR-ENEMY-04: 画像未ロード時のフォールバック描画境界値検証
  {
    const canvas = createMockCanvas(800, 600);

    // charIndex < 50 の時はフォールバック描画もスキップ
    const ctxEarly = createMockContext();
    const stateEarly = createBaseRenderState({
      isImageLoaded: false,
      charIndex: 49
    });
    renderer.render(ctxEarly, canvas, stateEarly);
    assert.strictEqual(
      ctxEarly.calls.some(c => c.method === 'fillText' && c.text === 'スライム'),
      false,
      'TC-BR-ENEMY-04: 画像未ロードかつ charIndex < 50 の時はフォールバック描画を行ってはなりません'
    );

    // charIndex >= 50 の時は矩形とテキストを描画
    const ctxLate = createMockContext();
    const stateLate = createBaseRenderState({
      isImageLoaded: false,
      charIndex: 50
    });
    renderer.render(ctxLate, canvas, stateLate);
    const textCall = ctxLate.calls.find(c => c.method === 'fillText' && c.text === 'スライム');
    assert.ok(textCall, 'TC-BR-ENEMY-04: 画像未ロードかつ charIndex >= 50 の時は敵名テキストを描画する必要があります');
    assert.strictEqual(textCall.textAlign, 'center');
  }

  // =========================================================================
  // 4. フェーズ別UIボックス呼び出し検証 (TC-BR-PHASE)
  // =========================================================================

  // TC-BR-PHASE-01: COMMAND_SELECT フェーズでコマンド枠が描画されること
  {
    const ctx = createMockContext();
    const canvas = createMockCanvas(800, 600);
    const state = createBaseRenderState({
      phase: 'COMMAND_SELECT',
      commands: ['たたかう', 'にげる'],
      commandIndex: 0
    });

    renderer.render(ctx, canvas, state);

    // drawListBox によるコマンド描画の発生を確認
    const hasCommandText = ctx.calls.some(c => c.method === 'fillText' && c.text === 'たたかう');
    assert.ok(hasCommandText, 'TC-BR-PHASE-01: COMMAND_SELECT 時にコマンド名が描画される必要があります');
  }

  // TC-BR-PHASE-02: ITEM_SELECT フェーズでコマンド枠およびアイテム枠が描画されること
  {
    const ctx = createMockContext();
    const canvas = createMockCanvas(800, 600);
    const state = createBaseRenderState({
      phase: 'ITEM_SELECT',
      commands: ['たたかう', 'どうぐ'],
      commandIndex: 1,
      itemList: [{ name: 'やくそう' }],
      itemIndex: 0
    });

    renderer.render(ctx, canvas, state);

    const hasCommandText = ctx.calls.some(c => c.method === 'fillText' && c.text === 'たたかう');
    const hasItemText = ctx.calls.some(c => c.method === 'fillText' && c.text === 'やくそう');
    assert.ok(hasCommandText, 'TC-BR-PHASE-02: ITEM_SELECT 時にコマンド枠が描画される必要があります');
    assert.ok(hasItemText, 'TC-BR-PHASE-02: ITEM_SELECT 時にアイテム一覧が描画される必要があります');
  }

  // TC-BR-PHASE-03: DISCARD_SELECT フェーズで破棄メッセージと破棄リストが描画されること
  {
    const ctx = createMockContext();
    const canvas = createMockCanvas(800, 600);
    const state = createBaseRenderState({
      phase: 'DISCARD_SELECT',
      discardList: [{ name: 'どうのつるぎ' }],
      discardIndex: 0,
      discardSelectMsg: 'どれを すてますか？'
    });

    renderer.render(ctx, canvas, state);

    const hasDiscardMsg = ctx.calls.some(c => c.method === 'fillText' && c.text.includes('すてますか'));
    const hasDiscardItem = ctx.calls.some(c => c.method === 'fillText' && c.text === 'どうのつるぎ');
    assert.ok(hasDiscardMsg, 'TC-BR-PHASE-03: DISCARD_SELECT 時に破棄案内文が描画される必要があります');
    assert.ok(hasDiscardItem, 'TC-BR-PHASE-03: DISCARD_SELECT 時に破棄リストが描画される必要があります');
  }

  // =========================================================================
  // 5. ロケール別レイアウト計算検証 (TC-BR-LOCALE)
  // =========================================================================

  // TC-BR-LOCALE-01: 日本語と欧文ロケールでのコマンドボックス幅の差分検証
  {
    const canvas = createMockCanvas(800, 600);
    const margin = Math.floor(800 * 0.04); // 32

    // 日本語: cmdW = 160 -> cmdX = 800 - 32 - 160 = 608
    const ctxJa = createMockContext();
    const stateJa = createBaseRenderState({ phase: 'COMMAND_SELECT', isWestern: false });
    renderer.render(ctxJa, canvas, stateJa);
    const jaRect = ctxJa.calls.find(c => c.method === 'fillRect' && c.x === 608);
    assert.ok(jaRect, 'TC-BR-LOCALE-01: 日本語ロケールでは cmdX = 608 にボックスが配置される必要があります');

    // 欧文: cmdW = 180 -> cmdX = 800 - 32 - 180 = 588
    const ctxEn = createMockContext();
    const stateEn = createBaseRenderState({ phase: 'COMMAND_SELECT', isWestern: true });
    renderer.render(ctxEn, canvas, stateEn);
    const enRect = ctxEn.calls.find(c => c.method === 'fillRect' && c.x === 588);
    assert.ok(enRect, 'TC-BR-LOCALE-01: 欧文ロケールでは cmdX = 588 にボックスが配置される必要があります');
  }
}

// 直接実行時のランナー配備
if (process.argv[1] && process.argv[1].endsWith('test_battle_renderer.mjs')) {
  console.log('--- test_battle_renderer.mjs 開始 ---');
  runBattleRendererTests();
  console.log('--- test_battle_renderer.mjs 成功 (全検証パス) ---');
}