// FILE_ENTRY: js/engine/battle/BattleCalculator.js
/**
 * js/engine/battle/BattleCalculator.js
 * 戦闘数値計算純粋ロジックモジュール
 * 
 * 準拠規約:
 * - 汎用RPGエンジン移行運用プロトコル ver 2.00
 * - Tier 1: 疎結合化・純粋関数（外部状態非保持）
 * - Tier 2: 完全ヘッドレス（ブラウザAPI非参照）
 * - Tier 3: 構文健全性・フェイルファスト（禁止演算子排除、型・境界値例外送出）
 */

/**
 * 0以上の有限数値を検証するローカルヘルパー
 * @param {*} val 検証対象値
 * @param {string} name 引数名
 * @param {string} funcName 関数名
 */
function validateNonNegativeFiniteNumber(val, name, funcName) {
  if (typeof val !== 'number') {
    throw new TypeError(`[TypeError] BattleCalculator.${funcName}: ${name} は数値である必要があります (型: ${typeof val})`);
  }
  if (!Number.isFinite(val)) {
    throw new TypeError(`[TypeError] BattleCalculator.${funcName}: ${name} は有限数値である必要があります`);
  }
  if (val < 0) {
    throw new RangeError(`[RangeError] BattleCalculator.${funcName}: ${name} は0以上である必要があります (値: ${val})`);
  }
}

/**
 * 0以上の整数を検証するローカルヘルパー
 * @param {*} val 検証対象値
 * @param {string} name 引数名
 * @param {string} funcName 関数名
 */
function validateNonNegativeInteger(val, name, funcName) {
  if (typeof val !== 'number') {
    throw new TypeError(`[TypeError] BattleCalculator.${funcName}: ${name} は数値である必要があります (型: ${typeof val})`);
  }
  if (!Number.isInteger(val)) {
    throw new TypeError(`[TypeError] BattleCalculator.${funcName}: ${name} は整数である必要があります`);
  }
  if (val < 0) {
    throw new RangeError(`[RangeError] BattleCalculator.${funcName}: ${name} は0以上である必要があります (値: ${val})`);
  }
}

/**
 * 乱数生成関数を検証するローカルヘルパー
 * @param {*} rng 検証対象値
 * @param {string} funcName 関数名
 */
function validateRng(rng, funcName) {
  if (typeof rng !== 'function') {
    throw new TypeError(`[TypeError] BattleCalculator.${funcName}: rng は関数である必要があります (型: ${typeof rng})`);
  }
}

/**
 * 通常物理ダメージ計算
 * @param {number} atk 攻撃力 (0以上の有限数値)
 * @param {number} def 防御力 (0以上の有限数値)
 * @param {() => number} [rng=Math.random] 乱数生成関数
 * @returns {number} 計算後ダメージ (最低保証 1)
 */
export function calcDamage(atk, def, rng = Math.random) {
  validateNonNegativeFiniteNumber(atk, 'atk', 'calcDamage');
  validateNonNegativeFiniteNumber(def, 'def', 'calcDamage');
  validateRng(rng, 'calcDamage');

  const base = Math.max(1, Math.floor(atk / 2 - def / 4));
  const variationRange = base * 0.25 + 1;
  const variation = Math.floor(rng() * variationRange);

  let sign = 1;
  if (rng() < 0.5) {
    sign = -1;
  } else {
    sign = 1;
  }

  return Math.max(1, base + sign * variation);
}

/**
 * プレイヤー会心ダメージ計算
 * @param {number} atk 攻撃力 (0以上の有限数値)
 * @param {() => number} [rng=Math.random] 乱数生成関数
 * @returns {number} 計算後ダメージ (最低保証 1)
 */
export function calcCriticalDamage(atk, rng = Math.random) {
  validateNonNegativeFiniteNumber(atk, 'atk', 'calcCriticalDamage');
  validateRng(rng, 'calcCriticalDamage');

  const base = Math.max(1, atk);
  const variationRange = base * 0.15 + 1;
  const variation = Math.floor(rng() * variationRange);

  let sign = 1;
  if (rng() < 0.5) {
    sign = -1;
  } else {
    sign = 1;
  }

  return Math.max(1, base + sign * variation);
}

/**
 * 敵会心ダメージ計算
 * @param {number} normalDmg 通常ダメージ (0以上の有限数値)
 * @returns {number} 計算後ダメージ (最低保証 1)
 */
export function calcEnemyCriticalDamage(normalDmg) {
  validateNonNegativeFiniteNumber(normalDmg, 'normalDmg', 'calcEnemyCriticalDamage');

  return Math.max(1, Math.floor(normalDmg * 2.0));
}

/**
 * 呪文ダメージ計算
 * @param {number} minDmg 最小ダメージ (0以上の有限数値)
 * @param {number} maxDmg 最大ダメージ (0以上の有限数値 かつ minDmg <= maxDmg)
 * @param {() => number} [rng=Math.random] 乱数生成関数
 * @returns {number} 計算後ダメージ
 */
export function calcSpellDamage(minDmg, maxDmg, rng = Math.random) {
  validateNonNegativeFiniteNumber(minDmg, 'minDmg', 'calcSpellDamage');
  validateNonNegativeFiniteNumber(maxDmg, 'maxDmg', 'calcSpellDamage');
  validateRng(rng, 'calcSpellDamage');

  if (minDmg > maxDmg) {
    throw new RangeError(`[RangeError] BattleCalculator.calcSpellDamage: minDmg (${minDmg}) は maxDmg (${maxDmg}) 以下である必要があります`);
  }

  return minDmg + Math.floor(rng() * (maxDmg - minDmg + 1));
}

/**
 * ブレスダメージ計算
 * @param {number} baseDmg 基準ダメージ (0以上の有限数値)
 * @param {number} [mult=1.0] 耐性・防具倍率 (0.0 〜 10.0)
 * @param {() => number} [rng=Math.random] 乱数生成関数
 * @returns {number} 計算後ダメージ (最低保証 1)
 */
export function calcBreathDamage(baseDmg, mult = 1.0, rng = Math.random) {
  validateNonNegativeFiniteNumber(baseDmg, 'baseDmg', 'calcBreathDamage');
  if (typeof mult !== 'number') {
    throw new TypeError(`[TypeError] BattleCalculator.calcBreathDamage: mult は数値である必要があります (型: ${typeof mult})`);
  }
  if (!Number.isFinite(mult)) {
    throw new TypeError('[TypeError] BattleCalculator.calcBreathDamage: mult は有限数値である必要があります');
  }
  if (mult < 0) {
    throw new RangeError(`[RangeError] BattleCalculator.calcBreathDamage: mult は0以上である必要があります (値: ${mult})`);
  }
  if (mult > 10.0) {
    throw new RangeError(`[RangeError] BattleCalculator.calcBreathDamage: mult は10.0以下である必要があります (値: ${mult})`);
  }
  validateRng(rng, 'calcBreathDamage');

  const variationRange = Math.max(1, Math.floor(baseDmg * 0.05));
  const variation = Math.floor(rng() * (variationRange * 2 + 1)) - variationRange;
  const finalBase = Math.max(1, baseDmg + variation);

  return Math.max(1, Math.round(finalBase * mult));
}

/**
 * 特殊物理ダメージ計算
 * @param {number} baseDmg 基準ダメージ (0以上の有限数値)
 * @param {number} [mult=1.0] 防具倍率 (0.0 〜 10.0)
 * @param {() => number} [rng=Math.random] 乱数生成関数
 * @returns {number} 計算後ダメージ (最低保証 1)
 */
export function calcSpecialPhysicalDamage(baseDmg, mult = 1.0, rng = Math.random) {
  validateNonNegativeFiniteNumber(baseDmg, 'baseDmg', 'calcSpecialPhysicalDamage');
  if (typeof mult !== 'number') {
    throw new TypeError(`[TypeError] BattleCalculator.calcSpecialPhysicalDamage: mult は数値である必要があります (型: ${typeof mult})`);
  }
  if (!Number.isFinite(mult)) {
    throw new TypeError('[TypeError] BattleCalculator.calcSpecialPhysicalDamage: mult は有限数値である必要があります');
  }
  if (mult < 0) {
    throw new RangeError(`[RangeError] BattleCalculator.calcSpecialPhysicalDamage: mult は0以上である必要があります (値: ${mult})`);
  }
  if (mult > 10.0) {
    throw new RangeError(`[RangeError] BattleCalculator.calcSpecialPhysicalDamage: mult は10.0以下である必要があります (値: ${mult})`);
  }
  validateRng(rng, 'calcSpecialPhysicalDamage');

  const variationRange = Math.max(1, Math.floor(baseDmg * 0.06));
  const variation = Math.floor(rng() * (variationRange * 2 + 1)) - variationRange;
  const finalBase = Math.max(1, baseDmg + variation);

  return Math.max(1, Math.round(finalBase * mult));
}

/**
 * 割合補正計算
 * @param {number} dmg 元ダメージ (0以上の有限数値)
 * @param {number} rate 補正倍率 (0.0 〜 10.0)
 * @returns {number} 計算後ダメージ (最低保証 1)
 */
export function applyDamageRate(dmg, rate) {
  validateNonNegativeFiniteNumber(dmg, 'dmg', 'applyDamageRate');
  if (typeof rate !== 'number') {
    throw new TypeError(`[TypeError] BattleCalculator.applyDamageRate: rate は数値である必要があります (型: ${typeof rate})`);
  }
  if (!Number.isFinite(rate)) {
    throw new TypeError('[TypeError] BattleCalculator.applyDamageRate: rate は有限数値である必要があります');
  }
  if (rate < 0) {
    throw new RangeError(`[RangeError] BattleCalculator.applyDamageRate: rate は0以上である必要があります (値: ${rate})`);
  }
  if (rate > 10.0) {
    throw new RangeError(`[RangeError] BattleCalculator.applyDamageRate: rate は10.0以下である必要があります (値: ${rate})`);
  }

  return Math.max(1, Math.floor(dmg * rate));
}

/**
 * 固定値減算補正計算
 * @param {number} dmg 元ダメージ (0以上の有限数値)
 * @param {number} reduction 軽減量 (0以上の有限数値)
 * @returns {number} 計算後ダメージ (最低保証 1)
 */
export function applyDamageReduction(dmg, reduction) {
  validateNonNegativeFiniteNumber(dmg, 'dmg', 'applyDamageReduction');
  validateNonNegativeFiniteNumber(reduction, 'reduction', 'applyDamageReduction');

  return Math.max(1, Math.floor(dmg - reduction));
}

/**
 * 確率成否判定
 * @param {number} chance 成功率 (0.0 〜 1.0)
 * @param {() => number} [rng=Math.random] 乱数生成関数
 * @returns {boolean} 成否結果
 */
export function checkChance(chance, rng = Math.random) {
  if (typeof chance !== 'number') {
    throw new TypeError(`[TypeError] BattleCalculator.checkChance: chance は数値である必要があります (型: ${typeof chance})`);
  }
  if (!Number.isFinite(chance)) {
    throw new TypeError('[TypeError] BattleCalculator.checkChance: chance は有限数値である必要があります');
  }
  if (chance < 0) {
    throw new RangeError(`[RangeError] BattleCalculator.checkChance: chance は0以上である必要があります (値: ${chance})`);
  }
  if (chance > 1.0) {
    throw new RangeError(`[RangeError] BattleCalculator.checkChance: chance は1.0以下である必要があります (値: ${chance})`);
  }
  validateRng(rng, 'checkChance');

  return rng() < chance;
}

/**
 * 状態異常持続ターン計算
 * @param {number} minTurns 最小ターン数 (0以上の整数)
 * @param {number} maxTurns 最大ターン数 (0以上の整数 かつ minTurns <= maxTurns)
 * @param {() => number} [rng=Math.random] 乱数生成関数
 * @returns {number} 計算後ターン数
 */
export function calcStatusTurns(minTurns, maxTurns, rng = Math.random) {
  validateNonNegativeInteger(minTurns, 'minTurns', 'calcStatusTurns');
  validateNonNegativeInteger(maxTurns, 'maxTurns', 'calcStatusTurns');
  validateRng(rng, 'calcStatusTurns');

  if (minTurns > maxTurns) {
    throw new RangeError(`[RangeError] BattleCalculator.calcStatusTurns: minTurns (${minTurns}) は maxTurns (${maxTurns}) 以下である必要があります`);
  }

  return minTurns + Math.floor(rng() * (maxTurns - minTurns + 1));
}

/**
 * 先行判定
 * @param {number} playerSpd プレイヤー素早さ (0以上の有限数値)
 * @param {number} enemySpd 敵素早さ (0以上の有限数値)
 * @param {() => number} [rng=Math.random] 乱数生成関数
 * @returns {boolean} プレイヤーが先行なら true
 */
export function determineFirstAttacker(playerSpd, enemySpd, rng = Math.random) {
  validateNonNegativeFiniteNumber(playerSpd, 'playerSpd', 'determineFirstAttacker');
  validateNonNegativeFiniteNumber(enemySpd, 'enemySpd', 'determineFirstAttacker');
  validateRng(rng, 'determineFirstAttacker');

  if (playerSpd >= enemySpd) {
    return true;
  }
  return rng() < 0.6;
}

/**
 * 逃走成否判定
 * @param {boolean} noEscape 逃走不可フラグ
 * @param {() => number} [rng=Math.random] 乱数生成関数
 * @returns {boolean} 逃走成功なら true
 */
export function checkEscape(noEscape, rng = Math.random) {
  if (typeof noEscape !== 'boolean') {
    throw new TypeError(`[TypeError] BattleCalculator.checkEscape: noEscape は boolean である必要があります (型: ${typeof noEscape})`);
  }
  validateRng(rng, 'checkEscape');

  if (noEscape) {
    return false;
  }
  return rng() < 0.65;
}