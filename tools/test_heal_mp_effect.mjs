import assert from 'node:assert/strict';
import fs from 'node:fs';

let targetModulePath = '../ai_staging/js/engine/effects/HealMpEffect.js';
if (!fs.existsSync(new URL(targetModulePath, import.meta.url))) {
  targetModulePath = '../js/engine/effects/HealMpEffect.js';
}

const { HealMpEffect } = await import(targetModulePath);
const effect = new HealMpEffect();

console.log(`[TEST] Testing HealMpEffect from: ${targetModulePath}`);

const dummyUser = { id: 'hero' };

// 1. 固定値回復（まほうのせいすい想定: base 15, variance 0）
{
  const def = { type: 'heal_mp', params: { base: 15, variance: 0 } };
  const target = { mp: 10, maxMp: 50 };
  const result = effect.calculate(def, dummyUser, target);
  assert.equal(result.success, true);
  assert.equal(result.rawAmount, 15);
  assert.equal(result.effectiveAmount, 15);
  assert.equal(result.isTargetFull, false);
  assert.equal(result.isTargetDead, false);
  assert.equal(target.mp, 10, 'Target MP must not be mutated');
}

// 2. 乱数幅回復（base 20, variance 10）
{
  const def = { type: 'heal_mp', params: { base: 20, variance: 10 } };
  const target = { mp: 5, maxMp: 100 };

  const resMin = effect.calculate(def, dummyUser, target, { random: 0 });
  assert.equal(resMin.rawAmount, 20);
  assert.equal(resMin.effectiveAmount, 20);

  const resMid = effect.calculate(def, dummyUser, target, { random: 0.5 });
  assert.equal(resMid.rawAmount, 25);
  assert.equal(resMid.effectiveAmount, 25);

  const resMax = effect.calculate(def, dummyUser, target, { random: 0.999 });
  assert.equal(resMax.rawAmount, 29);
  assert.equal(resMax.effectiveAmount, 29);
}

// 3. 全回復（full: true）
{
  const def = { type: 'heal_mp', params: { full: true } };
  const target = { mp: 10, maxMp: 80 };
  const result = effect.calculate(def, dummyUser, target);
  assert.equal(result.success, true);
  assert.equal(result.rawAmount, 80);
  assert.equal(result.effectiveAmount, 70);
}

// 4. MP上限クリッピング
{
  const def = { type: 'heal_mp', params: { base: 30, variance: 0 } };
  const target = { mp: 40, maxMp: 50 };
  const result = effect.calculate(def, dummyUser, target);
  assert.equal(result.rawAmount, 30);
  assert.equal(result.effectiveAmount, 10);
}

// 5. MP満タン時の挙動
{
  const def = { type: 'heal_mp', params: { base: 15, variance: 0 } };
  const target = { mp: 50, maxMp: 50 };
  const result = effect.calculate(def, dummyUser, target);
  assert.equal(result.success, true);
  assert.equal(result.rawAmount, 15);
  assert.equal(result.effectiveAmount, 0);
  assert.equal(result.isTargetFull, true);
}

// 6. 最大MP 0 のアクター（戦士等）に対する挙動
{
  const def = { type: 'heal_mp', params: { base: 15, variance: 0 } };
  const target = { mp: 0, maxMp: 0 };
  const result = effect.calculate(def, dummyUser, target);
  assert.equal(result.success, true);
  assert.equal(result.rawAmount, 15);
  assert.equal(result.effectiveAmount, 0);
  assert.equal(result.isTargetFull, true);
}

// 7. 戦闘不能時の挙動（target.hp <= 0）
{
  const def = { type: 'heal_mp', params: { base: 15, variance: 0 } };
  const target = { hp: 0, mp: 0, maxMp: 50 };
  const result = effect.calculate(def, dummyUser, target);
  assert.equal(result.success, false);
  assert.equal(result.isTargetDead, true);
  assert.equal(result.effectiveAmount, 0);
  assert.equal(result.reason, 'TARGET_DEAD');
}

// 8. 異常系・フェイルファスト検証
{
  const validDef = { type: 'heal_mp', params: { base: 15 } };
  const validTarget = { mp: 5, maxMp: 50 };

  assert.throws(() => effect.calculate(null, dummyUser, validTarget), TypeError);
  assert.throws(() => effect.calculate({ type: 'other' }, dummyUser, validTarget), Error);
  assert.throws(() => effect.calculate({ type: 'heal_mp' }, dummyUser, validTarget), TypeError);

  assert.throws(() => effect.calculate(validDef, dummyUser, null), TypeError);
  assert.throws(() => effect.calculate(validDef, dummyUser, { mp: '5', maxMp: 50 }), TypeError);
  assert.throws(() => effect.calculate(validDef, dummyUser, { mp: NaN, maxMp: 50 }), RangeError);
  assert.throws(() => effect.calculate(validDef, dummyUser, { mp: -1, maxMp: 50 }), RangeError);
  assert.throws(() => effect.calculate(validDef, dummyUser, { mp: 5, maxMp: -1 }), RangeError);

  assert.throws(() => effect.calculate({ type: 'heal_mp', params: { base: -5 } }, dummyUser, validTarget), RangeError);
  assert.throws(() => effect.calculate({ type: 'heal_mp', params: { base: 10, variance: -1 } }, dummyUser, validTarget), RangeError);
}

console.log('[PASS] HealMpEffect: All tests passed successfully.');