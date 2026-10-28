import assert from 'node:assert/strict';
import fs from 'node:fs';

let targetModulePath = '../ai_staging/js/engine/effects/HealHpEffect.js';
if (!fs.existsSync(new URL(targetModulePath, import.meta.url))) {
  targetModulePath = '../js/engine/effects/HealHpEffect.js';
}

const { HealHpEffect } = await import(targetModulePath);
const effect = new HealHpEffect();

console.log(`[TEST] Testing HealHpEffect from: ${targetModulePath}`);

const dummyUser = { id: 'hero' };

// 1. 固定値回復（薬草: base 30, variance 0）
{
  const def = { type: 'heal_hp', params: { base: 30, variance: 0 } };
  const target = { hp: 40, maxHp: 100 };
  const result = effect.calculate(def, dummyUser, target);
  assert.equal(result.success, true);
  assert.equal(result.rawAmount, 30);
  assert.equal(result.effectiveAmount, 30);
  assert.equal(result.isTargetFull, false);
  assert.equal(result.isTargetDead, false);
  assert.equal(target.hp, 40, 'Target HP must not be mutated');
}

// 2. 乱数幅回復（ホイミ: base 25, variance 8）
{
  const def = { type: 'heal_hp', params: { base: 25, variance: 8 } };
  const target = { hp: 10, maxHp: 100 };

  const resMin = effect.calculate(def, dummyUser, target, { random: 0 });
  assert.equal(resMin.rawAmount, 25);
  assert.equal(resMin.effectiveAmount, 25);

  const resMid = effect.calculate(def, dummyUser, target, { random: 0.5 });
  assert.equal(resMid.rawAmount, 29);
  assert.equal(resMid.effectiveAmount, 29);

  const resMax = effect.calculate(def, dummyUser, target, { random: 0.999 });
  assert.equal(resMax.rawAmount, 32);
  assert.equal(resMax.effectiveAmount, 32);
}

// 3. 全回復（ベホマ: full: true）
{
  const def = { type: 'heal_hp', params: { full: true } };
  const target = { hp: 15, maxHp: 120 };
  const result = effect.calculate(def, dummyUser, target);
  assert.equal(result.success, true);
  assert.equal(result.rawAmount, 120);
  assert.equal(result.effectiveAmount, 105);
}

// 4. HP上限クリッピング
{
  const def = { type: 'heal_hp', params: { base: 50, variance: 0 } };
  const target = { hp: 80, maxHp: 100 };
  const result = effect.calculate(def, dummyUser, target);
  assert.equal(result.rawAmount, 50);
  assert.equal(result.effectiveAmount, 20);
}

// 5. HP満タン時の挙動
{
  const def = { type: 'heal_hp', params: { base: 30, variance: 0 } };
  const target = { hp: 100, maxHp: 100 };
  const result = effect.calculate(def, dummyUser, target);
  assert.equal(result.success, true);
  assert.equal(result.rawAmount, 30);
  assert.equal(result.effectiveAmount, 0);
  assert.equal(result.isTargetFull, true);
}

// 6. 戦闘不能時の挙動
{
  const def = { type: 'heal_hp', params: { base: 30, variance: 0 } };
  const target = { hp: 0, maxHp: 100 };
  const result = effect.calculate(def, dummyUser, target);
  assert.equal(result.success, false);
  assert.equal(result.isTargetDead, true);
  assert.equal(result.effectiveAmount, 0);
  assert.equal(result.reason, 'TARGET_DEAD');
}

// 7. 異常系・フェイルファスト検証
{
  const validDef = { type: 'heal_hp', params: { base: 30 } };
  const validTarget = { hp: 10, maxHp: 100 };

  assert.throws(() => effect.calculate(null, dummyUser, validTarget), TypeError);
  assert.throws(() => effect.calculate({ type: 'other' }, dummyUser, validTarget), Error);
  assert.throws(() => effect.calculate({ type: 'heal_hp' }, dummyUser, validTarget), TypeError);

  assert.throws(() => effect.calculate(validDef, dummyUser, null), TypeError);
  assert.throws(() => effect.calculate(validDef, dummyUser, { hp: '10', maxHp: 100 }), TypeError);
  assert.throws(() => effect.calculate(validDef, dummyUser, { hp: NaN, maxHp: 100 }), RangeError);
  assert.throws(() => effect.calculate(validDef, dummyUser, { hp: 10, maxHp: 0 }), RangeError);

  assert.throws(() => effect.calculate({ type: 'heal_hp', params: { base: -10 } }, dummyUser, validTarget), RangeError);
}

console.log('[PASS] HealHpEffect: All tests passed successfully.');
