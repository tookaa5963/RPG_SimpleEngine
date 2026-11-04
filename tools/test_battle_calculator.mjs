// FILE_ENTRY: tools/test_battle_calculator.mjs
/**
 * tools/test_battle_calculator.mjs
 * 戦闘計算純粋モジュール (BattleCalculator) 決定論的単体テスト
 * 
 * 準拠規約:
 * - 汎用RPGエンジン移行運用プロトコル ver 2.00
 * - 完全ヘッドレス検証 (Node.js / Gate 2 累積テスト対象)
 * - 乱数注入 (DI) による決定論的境界値・異常系検証
 */

import assert from 'node:assert/strict';
import * as BattleCalculator from '../js/engine/battle/BattleCalculator.js';

console.log('=== [BattleCalculator 単体テスト開始] ===');

let totalAssertions = 0;
function recordAssertion() {
  totalAssertions += 1;
}

/**
 * 決定論的テスト用のモックRNG（指定した数列を順次返す乱数生成器）
 * @param {number[]} sequence 
 * @returns {() => number}
 */
function createMockRng(sequence) {
  let index = 0;
  return () => {
    if (index >= sequence.length) {
      throw new Error(`MockRng: 指定された数列の長さを超えて呼び出されました (呼び出し回数: ${index + 1})`);
    }
    const val = sequence[index];
    index += 1;
    return val;
  };
}

// =============================================================================
// 1. 正常系テスト (TC-01 〜 TC-13)
// =============================================================================

// TC-01: calcDamage（標準ダメージ・振れ幅）
{
  // atk=100, def=80 -> base = max(1, floor(50 - 20)) = 30
  // variationRange: 30 * 0.25 + 1 = 8.5
  
  // 1-1: 振れ幅 0 (rng[0]=0, rng[1]=0.5 -> sign=+1) => 30 + 1 * 0 = 30
  const dmgZeroVar = BattleCalculator.calcDamage(100, 80, createMockRng([0.0, 0.5]));
  assert.strictEqual(dmgZeroVar, 30, 'TC-01-1: 振れ幅0の通常ダメージは30であること');
  recordAssertion();

  // 1-2: 振れ幅 最大正 (rng[0]=0.999, rng[1]=0.9 -> sign=+1) => variation=floor(0.999 * 8.5)=8 => 30 + 8 = 38
  const dmgMaxPos = BattleCalculator.calcDamage(100, 80, createMockRng([0.999, 0.9]));
  assert.strictEqual(dmgMaxPos, 38, 'TC-01-2: 振れ幅最大正の通常ダメージは38であること');
  recordAssertion();

  // 1-3: 振れ幅 最大負 (rng[0]=0.999, rng[1]=0.1 -> sign=-1) => variation=8 => 30 - 8 = 22
  const dmgMaxNeg = BattleCalculator.calcDamage(100, 80, createMockRng([0.999, 0.1]));
  assert.strictEqual(dmgMaxNeg, 22, 'TC-01-3: 振れ幅最大負の通常ダメージは22であること');
  recordAssertion();
}

// TC-02: calcDamage（高防御力・最低ダメージ保証）
{
  // atk=10, def=200 -> base = max(1, floor(5 - 50)) = 1
  // variationRange: 1 * 0.25 + 1 = 1.25, variation=floor(0.999 * 1.25)=1, sign=-1 => max(1, 1 - 1) = 1
  const dmgMinGuaranteed = BattleCalculator.calcDamage(10, 200, createMockRng([0.999, 0.1]));
  assert.strictEqual(dmgMinGuaranteed, 1, 'TC-02: 高防御相手でも最低ダメージ1が保証されること');
  recordAssertion();
}

// TC-03: calcCriticalDamage（プレイヤー会心ダメージ）
{
  // atk=100 -> base = max(1, 100) = 100
  // variationRange: 100 * 0.15 + 1 = 16
  
  // 3-1: 振れ幅 0 (rng[0]=0, rng[1]=0.5) => 100 + 0 = 100
  const critZero = BattleCalculator.calcCriticalDamage(100, createMockRng([0.0, 0.5]));
  assert.strictEqual(critZero, 100, 'TC-03-1: 振れ幅0の会心ダメージは100であること');
  recordAssertion();

  // 3-2: 振れ幅 最大正 (rng[0]=0.999, rng[1]=0.9) => variation=floor(0.999 * 16)=15 => 100 + 15 = 115
  const critMaxPos = BattleCalculator.calcCriticalDamage(100, createMockRng([0.999, 0.9]));
  assert.strictEqual(critMaxPos, 115, 'TC-03-2: 振れ幅最大正の会心ダメージは115であること');
  recordAssertion();

  // 3-3: 振れ幅 最大負 (rng[0]=0.999, rng[1]=0.1) => variation=15 => 100 - 15 = 85
  const critMaxNeg = BattleCalculator.calcCriticalDamage(100, createMockRng([0.999, 0.1]));
  assert.strictEqual(critMaxNeg, 85, 'TC-03-3: 振れ幅最大負の会心ダメージは85であること');
  recordAssertion();
}

// TC-04: calcEnemyCriticalDamage（敵会心ダメージ）
{
  // normalDmg=45 -> max(1, floor(45 * 2.0)) = 90
  const enemyCrit = BattleCalculator.calcEnemyCriticalDamage(45);
  assert.strictEqual(enemyCrit, 90, 'TC-04: 敵会心ダメージは通常ダメージの2倍（90）であること');
  recordAssertion();
}

// TC-05: calcSpellDamage（呪文ダメージ範囲）
{
  // mera (min=10, max=14)
  const meraMin = BattleCalculator.calcSpellDamage(10, 14, createMockRng([0.0]));
  assert.strictEqual(meraMin, 10, 'TC-05-1: メラ最小ダメージは10であること');
  recordAssertion();

  const meraMax = BattleCalculator.calcSpellDamage(10, 14, createMockRng([0.999]));
  assert.strictEqual(meraMax, 14, 'TC-05-2: メラ最大ダメージは14であること');
  recordAssertion();

  // merami (min=70, max=90)
  const meramiMin = BattleCalculator.calcSpellDamage(70, 90, createMockRng([0.0]));
  assert.strictEqual(meramiMin, 70, 'TC-05-3: メラミ最小ダメージは70であること');
  recordAssertion();

  const meramiMax = BattleCalculator.calcSpellDamage(70, 90, createMockRng([0.999]));
  assert.strictEqual(meramiMax, 90, 'TC-05-4: メラミ最大ダメージは90であること');
  recordAssertion();
}

// TC-06: calcBreathDamage（ブレスダメージ計算および防御補正）
{
  // baseDmg=160, mult=1.0, variationRange=max(1, floor(160 * 0.05))=8
  // variation = floor(rng * (8*2 + 1)) - 8 = floor(0.5 * 17) - 8 = 8 - 8 = 0
  const breathNormal = BattleCalculator.calcBreathDamage(160, 1.0, createMockRng([0.5]));
  assert.strictEqual(breathNormal, 160, 'TC-06-1: 基準ブレスダメージは160であること');
  recordAssertion();

  // 水鏡の盾 mult=0.40 -> round(160 * 0.40) = 64
  const breathShield = BattleCalculator.calcBreathDamage(160, 0.40, createMockRng([0.5]));
  assert.strictEqual(breathShield, 64, 'TC-06-2: 水鏡の盾軽減ブレスダメージは64であること');
  recordAssertion();

  // 盾＋護符 mult=0.10 -> round(160 * 0.10) = 16
  const breathBoth = BattleCalculator.calcBreathDamage(160, 0.10, createMockRng([0.5]));
  assert.strictEqual(breathBoth, 16, 'TC-06-3: 盾＋護符重複軽減ブレスダメージは16であること');
  recordAssertion();
}

// TC-07: calcSpecialPhysicalDamage（特殊物理攻撃ダメージ）
{
  // baseDmg=240, variationRange=max(1, floor(240 * 0.06))=14
  // variation = floor(0.5 * 29) - 14 = 14 - 14 = 0
  const specNormal = BattleCalculator.calcSpecialPhysicalDamage(240, 1.0, createMockRng([0.5]));
  assert.strictEqual(specNormal, 240, 'TC-07-1: 基準特殊物理ダメージは240であること');
  recordAssertion();

  // ドラゴンメイル mult=0.22 -> round(240 * 0.22) = round(52.8) = 53
  const specArmor = BattleCalculator.calcSpecialPhysicalDamage(240, 0.22, createMockRng([0.5]));
  assert.strictEqual(specArmor, 53, 'TC-07-2: ドラゴンメイル軽減特殊物理ダメージは53であること');
  recordAssertion();
}

// TC-08: applyDamageRate（割合補正・最低保証）
{
  const rateNormal = BattleCalculator.applyDamageRate(100, 0.2);
  assert.strictEqual(rateNormal, 20, 'TC-08-1: 割合補正 (100 * 0.2) は20であること');
  recordAssertion();

  const rateMin = BattleCalculator.applyDamageRate(3, 0.2);
  assert.strictEqual(rateMin, 1, 'TC-08-2: 割合補正 (3 * 0.2) でも最低値1が保証されること');
  recordAssertion();
}

// TC-09: applyDamageReduction（固定値減算補正）
{
  const redNormal = BattleCalculator.applyDamageReduction(12, 5);
  assert.strictEqual(redNormal, 7, 'TC-09-1: 固定減算 (12 - 5) は7であること');
  recordAssertion();

  const redMin = BattleCalculator.applyDamageReduction(3, 5);
  assert.strictEqual(redMin, 1, 'TC-09-2: 固定減算 (3 - 5) でも最低値1が保証されること');
  recordAssertion();
}

// TC-10: checkChance（確率判定）
{
  const chanceSuccess = BattleCalculator.checkChance(0.5, createMockRng([0.49]));
  assert.strictEqual(chanceSuccess, true, 'TC-10-1: 乱数0.49 < 確率0.5 は成功(true)');
  recordAssertion();

  const chanceFailure = BattleCalculator.checkChance(0.5, createMockRng([0.50]));
  assert.strictEqual(chanceFailure, false, 'TC-10-2: 乱数0.50 >= 確率0.5 は失敗(false)');
  recordAssertion();
}

// TC-11: calcStatusTurns（持続ターン数）
{
  // min=2, max=4
  const turnsMin = BattleCalculator.calcStatusTurns(2, 4, createMockRng([0.0]));
  assert.strictEqual(turnsMin, 2, 'TC-11-1: 状態異常最小ターンは2であること');
  recordAssertion();

  const turnsMax = BattleCalculator.calcStatusTurns(2, 4, createMockRng([0.999]));
  assert.strictEqual(turnsMax, 4, 'TC-11-2: 状態異常最大ターンは4であること');
  recordAssertion();
}

// TC-12: determineFirstAttacker（行動順判定）
{
  // プレイヤーの素早さが敵以上なら無条件でプレイヤー先行
  const firstBySpd = BattleCalculator.determineFirstAttacker(50, 30, createMockRng([0.99]));
  assert.strictEqual(firstBySpd, true, 'TC-12-1: playerSpd >= enemySpd なら常に先行');
  recordAssertion();

  // プレイヤーが遅い場合: 乱数 < 0.6 で先行
  const firstByRngSuccess = BattleCalculator.determineFirstAttacker(30, 50, createMockRng([0.59]));
  assert.strictEqual(firstByRngSuccess, true, 'TC-12-2: 遅い場合でも rng 0.59 < 0.6 なら先行');
  recordAssertion();

  const firstByRngFail = BattleCalculator.determineFirstAttacker(30, 50, createMockRng([0.60]));
  assert.strictEqual(firstByRngFail, false, 'TC-12-3: 遅い場合で rng 0.60 >= 0.6 なら後攻');
  recordAssertion();
}

// TC-13: checkEscape（逃走成否判定）
{
  // noEscape = true の場合は常に失敗
  const escapeBoss = BattleCalculator.checkEscape(true, createMockRng([0.0]));
  assert.strictEqual(escapeBoss, false, 'TC-13-1: noEscape時は乱数0でも逃走失敗');
  recordAssertion();

  // noEscape = false: 乱数 < 0.65 で成功
  const escapeSuccess = BattleCalculator.checkEscape(false, createMockRng([0.64]));
  assert.strictEqual(escapeSuccess, true, 'TC-13-2: rng 0.64 < 0.65 なら逃走成功');
  recordAssertion();

  const escapeFailure = BattleCalculator.checkEscape(false, createMockRng([0.65]));
  assert.strictEqual(escapeFailure, false, 'TC-13-3: rng 0.65 >= 0.65 なら逃走失敗');
  recordAssertion();
}

// =============================================================================
// 2. 異常系・境界値テスト (TC-ERR-01 〜 TC-ERR-06 / Tier 3 フェイルファスト)
// =============================================================================

// TC-ERR-01: calcDamage 型検証
{
  assert.throws(() => BattleCalculator.calcDamage('100', 80), TypeError, 'TC-ERR-01-1: atk文字列はTypeError');
  recordAssertion();
  assert.throws(() => BattleCalculator.calcDamage(100, null), TypeError, 'TC-ERR-01-2: def nullはTypeError');
  recordAssertion();
  assert.throws(() => BattleCalculator.calcDamage(NaN, 80), TypeError, 'TC-ERR-01-3: atk NaNはTypeError');
  recordAssertion();
  assert.throws(() => BattleCalculator.calcDamage(100, Infinity), TypeError, 'TC-ERR-01-4: def InfinityはTypeError');
  recordAssertion();
}

// TC-ERR-02: calcDamage 負数境界値
{
  assert.throws(() => BattleCalculator.calcDamage(-1, 80), RangeError, 'TC-ERR-02-1: atk負数はRangeError');
  recordAssertion();
  assert.throws(() => BattleCalculator.calcDamage(100, -10), RangeError, 'TC-ERR-02-2: def負数はRangeError');
  recordAssertion();
}

// TC-ERR-03: calcSpellDamage 逆転境界値
{
  assert.throws(() => BattleCalculator.calcSpellDamage(50, 20), RangeError, 'TC-ERR-03: minDmg > maxDmg はRangeError');
  recordAssertion();
  assert.throws(() => BattleCalculator.calcSpellDamage(-5, 10), RangeError, 'TC-ERR-03: minDmg < 0 はRangeError');
  recordAssertion();
}

// TC-ERR-04: applyDamageRate 境界値
{
  assert.throws(() => BattleCalculator.applyDamageRate(100, -0.1), RangeError, 'TC-ERR-04-1: rate < 0 はRangeError');
  recordAssertion();
  assert.throws(() => BattleCalculator.applyDamageRate(100, 10.1), RangeError, 'TC-ERR-04-2: rate > 10.0 はRangeError');
  recordAssertion();
}

// TC-ERR-05: checkChance 境界値
{
  assert.throws(() => BattleCalculator.checkChance(-0.01), RangeError, 'TC-ERR-05-1: chance < 0 はRangeError');
  recordAssertion();
  assert.throws(() => BattleCalculator.checkChance(1.01), RangeError, 'TC-ERR-05-2: chance > 1 はRangeError');
  recordAssertion();
}

// TC-ERR-06: checkEscape 型検証
{
  assert.throws(() => BattleCalculator.checkEscape('true'), TypeError, 'TC-ERR-06-1: noEscape文字列はTypeError');
  recordAssertion();
  assert.throws(() => BattleCalculator.checkEscape(null), TypeError, 'TC-ERR-06-2: noEscape nullはTypeError');
  recordAssertion();
}

console.log(`=== [BattleCalculator 単体テスト全件合格] 合計アサーション数: ${totalAssertions} ===`);
