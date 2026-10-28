import assert from 'node:assert/strict';
import fs from 'node:fs';

let targetModulePath = '../ai_staging/js/engine/effects/CureStatusEffect.js';
if (!fs.existsSync(new URL(targetModulePath, import.meta.url))) {
  targetModulePath = '../js/engine/effects/CureStatusEffect.js';
}

const { CureStatusEffect } = await import(targetModulePath);
const effect = new CureStatusEffect();

console.log(`[TEST] Testing CureStatusEffect from: ${targetModulePath}`);

const dummyUser = { id: 'hero' };

// 1. 毒解除成功ケース（isPoisoned: true）
{
  const def = { type: 'cure_status', params: { status: 'poison' } };
  const target = { hp: 50, isPoisoned: true };
  const result = effect.calculate(def, dummyUser, target);
  assert.equal(result.success, true);
  assert.equal(result.strategy, 'cure_status');
  assert.equal(result.cured, true);
  assert.equal(result.status, 'poison');
  assert.equal(result.isTargetDead, false);
  assert.equal(result.reason, null);
  assert.equal(target.isPoisoned, true, 'Target isPoisoned must not be mutated by effect strategy');
}

// 2. 毒未感染ケース（isPoisoned: false）
{
  const def = { type: 'cure_status', params: { status: 'poison' } };
  const target = { hp: 50, isPoisoned: false };
  const result = effect.calculate(def, dummyUser, target);
  assert.equal(result.success, true);
  assert.equal(result.strategy, 'cure_status');
  assert.equal(result.cured, false);
  assert.equal(result.status, 'poison');
  assert.equal(result.isTargetDead, false);
  assert.equal(result.reason, 'NOT_AFFECTED');
}

// 3. hasStatus メソッド経由の判定（将来のアクターモデル互換）
{
  const def = { type: 'cure_status', params: { status: 'poison' } };
  const targetWithMethod = {
    hp: 30,
    hasStatus(st) {
      if (st === 'poison') {
        return true;
      }
      return false;
    }
  };
  const result = effect.calculate(def, dummyUser, targetWithMethod);
  assert.equal(result.success, true);
  assert.equal(result.cured, true);
}

// 4. status: 'all' による全状態異常解除判定
{
  const def = { type: 'cure_status', params: { status: 'all' } };
  const targetPoisoned = { hp: 50, isPoisoned: true };
  const resCured = effect.calculate(def, dummyUser, targetPoisoned);
  assert.equal(resCured.success, true);
  assert.equal(resCured.cured, true);

  const targetHealthy = { hp: 50, isPoisoned: false };
  const resNotAffected = effect.calculate(def, dummyUser, targetHealthy);
  assert.equal(resNotAffected.success, true);
  assert.equal(resNotAffected.cured, false);
  assert.equal(resNotAffected.reason, 'NOT_AFFECTED');
}

// 5. 対象が戦闘不能（hp <= 0）
{
  const def = { type: 'cure_status', params: { status: 'poison' } };
  const deadTarget = { hp: 0, isPoisoned: true };
  const result = effect.calculate(def, dummyUser, deadTarget);
  assert.equal(result.success, false);
  assert.equal(result.cured, false);
  assert.equal(result.isTargetDead, true);
  assert.equal(result.reason, 'TARGET_DEAD');
}

// 6. 異常系・フェイルファスト検証
{
  const validDef = { type: 'cure_status', params: { status: 'poison' } };
  const validTarget = { hp: 50, isPoisoned: true };

  assert.throws(() => effect.calculate(null, dummyUser, validTarget), TypeError);
  assert.throws(() => effect.calculate({ type: 'other', params: { status: 'poison' } }, dummyUser, validTarget), Error);
  assert.throws(() => effect.calculate({ type: 'cure_status' }, dummyUser, validTarget), TypeError);
  assert.throws(() => effect.calculate({ type: 'cure_status', params: null }, dummyUser, validTarget), TypeError);
  assert.throws(() => effect.calculate({ type: 'cure_status', params: { status: 123 } }, dummyUser, validTarget), TypeError);
  assert.throws(() => effect.calculate({ type: 'cure_status', params: { status: '' } }, dummyUser, validTarget), Error);

  assert.throws(() => effect.calculate(validDef, null, validTarget), TypeError);
  assert.throws(() => effect.calculate(validDef, dummyUser, null), TypeError);
  assert.throws(() => effect.calculate(validDef, dummyUser, 'invalidTarget'), TypeError);
}

console.log('[PASS] CureStatusEffect: All tests passed successfully.');
