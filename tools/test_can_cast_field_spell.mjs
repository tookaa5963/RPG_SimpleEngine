/**
 * tools/test_can_cast_field_spell.mjs
 * シナリオ呪文詠唱可否判定（canCastFieldSpell）単体テスト
 */

import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// 1. レガシー依存のトップレベル初期化を通過させるための最小限ブラウザAPIモック
if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  };
}

if (typeof globalThis.document === 'undefined') {
  globalThis.document = {
    createElement: (tag) => {
      return {
        tagName: tag.toUpperCase(),
        loop: false,
        volume: 1,
        src: '',
        type: '',
        children: [],
        appendChild(child) {
          this.children.push(child);
          return child;
        }
      };
    }
  };
}

// 2. モック初期化完了後に動的インポートでモジュールを解決
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const targetRelPath = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(__dirname, '../js/events.js');
const moduleUrl = pathToFileURL(targetRelPath).href;
const { canCastFieldSpell } = await import(moduleUrl);

console.log(`=== canCastFieldSpell 単体テスト開始 (対象: ${targetRelPath}) ===`);

let testCount = 0;
let failCount = 0;

function runTest(description, testFn) {
  testCount++;
  try {
    testFn();
    console.log(`[PASS] ${description}`);
  } catch (error) {
    failCount++;
    console.error(`[FAIL] ${description} -> ${error.message}`);
  }
}

// -------------------------------------------------------------
// [TC-EV-SPELL-01] 通常状態（手形なし・少女未救出）での詠唱許可
// -------------------------------------------------------------
runTest('[TC-EV-SPELL-01a] rula: 通常状態での詠唱許可', () => {
  const player = { flags: { rescuedGirl: false, hasPass: false } };
  const result = canCastFieldSpell('rula', player);
  assert.strictEqual(result.allowed, true);
  assert.strictEqual(result.reason, null);
});

runTest('[TC-EV-SPELL-01b] liremito: 通常状態での詠唱許可', () => {
  const player = { flags: { rescuedGirl: false, hasPass: false } };
  const result = canCastFieldSpell('liremito', player);
  assert.strictEqual(result.allowed, true);
  assert.strictEqual(result.reason, null);
});

// -------------------------------------------------------------
// [TC-EV-SPELL-02] 少女救出済かつ通行手形所持時の詠唱許可
// -------------------------------------------------------------
runTest('[TC-EV-SPELL-02a] rula: 少女救出済・通行手形所持での詠唱許可', () => {
  const player = { flags: { rescuedGirl: true, hasPass: true } };
  const result = canCastFieldSpell('rula', player);
  assert.strictEqual(result.allowed, true);
  assert.strictEqual(result.reason, null);
});

runTest('[TC-EV-SPELL-02b] liremito: 少女救出済・通行手形所持での詠唱許可', () => {
  const player = { flags: { rescuedGirl: true, hasPass: true } };
  const result = canCastFieldSpell('liremito', player);
  assert.strictEqual(result.allowed, true);
  assert.strictEqual(result.reason, null);
});

// -------------------------------------------------------------
// [TC-EV-SPELL-03] テレポート系以外の呪文での無条件許可
// -------------------------------------------------------------
runTest('[TC-EV-SPELL-03] hoimi: シナリオ移動制限無関係の常時許可', () => {
  const player = { flags: { rescuedGirl: true, hasPass: false } };
  const result = canCastFieldSpell('hoimi', player);
  assert.strictEqual(result.allowed, true);
  assert.strictEqual(result.reason, null);
});

// -------------------------------------------------------------
// [TC-EV-SPELL-04] 少女救出中かつ手形なし（移動制限）
// -------------------------------------------------------------
runTest('[TC-EV-SPELL-04a] rula: 少女救出中かつ手形なし時の詠唱拒否', () => {
  const player = { flags: { rescuedGirl: true, hasPass: false } };
  const result = canCastFieldSpell('rula', player);
  assert.strictEqual(result.allowed, false);
  assert.strictEqual(result.reason, 'girl_priority');
});

runTest('[TC-EV-SPELL-04b] liremito: 少女救出中かつ手形なし時の詠唱拒否', () => {
  const player = { flags: { rescuedGirl: true, hasPass: false } };
  const result = canCastFieldSpell('liremito', player);
  assert.strictEqual(result.allowed, false);
  assert.strictEqual(result.reason, 'girl_priority');
});

// -------------------------------------------------------------
// 異常系・境界値: 不正引数に対するフェイルファスト検証
// -------------------------------------------------------------
runTest('異常系: spellId が null の場合に例外スロー', () => {
  assert.throws(() => canCastFieldSpell(null, { flags: {} }), Error);
});

runTest('異常系: spellId が undefined の場合に例外スロー', () => {
  assert.throws(() => canCastFieldSpell(undefined, { flags: {} }), Error);
});

runTest('異常系: spellId が空文字列の場合に例外スロー', () => {
  assert.throws(() => canCastFieldSpell('', { flags: {} }), Error);
});

runTest('異常系: spellId が非文字列の場合に例外スロー', () => {
  assert.throws(() => canCastFieldSpell(12345, { flags: {} }), Error);
});

runTest('異常系: player が null の場合に例外スロー', () => {
  assert.throws(() => canCastFieldSpell('rula', null), Error);
});

runTest('異常系: player が undefined の場合に例外スロー', () => {
  assert.throws(() => canCastFieldSpell('rula', undefined), Error);
});

runTest('異常系: player が非オブジェクトの場合に例外スロー', () => {
  assert.throws(() => canCastFieldSpell('rula', 'not_an_object'), Error);
});

console.log(`\n=== canCastFieldSpell テスト完了: 全 ${testCount} 項目中 失敗: ${failCount} 件 ===`);

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}