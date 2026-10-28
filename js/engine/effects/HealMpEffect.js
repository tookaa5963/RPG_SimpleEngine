/**
 * MP回復効果計算ストラテジー
 * 純粋計算を行い、計算結果オブジェクトを返却する。
 * 対象（target）および使用者（user）に対するプロパティ変更（副作用）は一切行わない。
 */
export class HealMpEffect {
  /**
   * MP回復量を計算し、結果オブジェクトを返却する
   * @param {Object} effectDef - 効果定義オブジェクト
   * @param {Object} user - 使用者オブジェクト
   * @param {Object} target - 対象オブジェクト
   * @param {Object} [options] - オプション（乱数関数等）
   * @returns {Object} 計算結果オブジェクト
   */
  calculate(effectDef, user, target, options) {
    if (typeof effectDef !== 'object') {
      throw new TypeError('effectDef must be an object.');
    }
    if (effectDef === null) {
      throw new TypeError('effectDef cannot be null.');
    }
    if (typeof effectDef.type !== 'string') {
      throw new TypeError('effectDef.type must be a string.');
    }
    if (effectDef.type !== 'heal_mp') {
      throw new Error('Invalid effect type for HealMpEffect: ' + effectDef.type);
    }
    if (typeof effectDef.params !== 'object') {
      throw new TypeError('effectDef.params must be an object.');
    }
    if (effectDef.params === null) {
      throw new TypeError('effectDef.params cannot be null.');
    }

    if (typeof user !== 'object') {
      throw new TypeError('user must be an object.');
    }
    if (user === null) {
      throw new TypeError('user cannot be null.');
    }

    if (typeof target !== 'object') {
      throw new TypeError('target must be an object.');
    }
    if (target === null) {
      throw new TypeError('target cannot be null.');
    }

    if (typeof target.mp !== 'number') {
      throw new TypeError('target.mp must be a number.');
    }
    if (Number.isNaN(target.mp)) {
      throw new RangeError('target.mp cannot be NaN.');
    }
    if (!Number.isFinite(target.mp)) {
      throw new RangeError('target.mp must be a finite number.');
    }
    if (target.mp < 0) {
      throw new RangeError('target.mp cannot be negative.');
    }

    if (typeof target.maxMp !== 'number') {
      throw new TypeError('target.maxMp must be a number.');
    }
    if (Number.isNaN(target.maxMp)) {
      throw new RangeError('target.maxMp cannot be NaN.');
    }
    if (!Number.isFinite(target.maxMp)) {
      throw new RangeError('target.maxMp must be a finite number.');
    }
    if (target.maxMp < 0) {
      throw new RangeError('target.maxMp cannot be negative.');
    }

    if (typeof target.hp === 'number') {
      if (target.hp <= 0) {
        return {
          success: false,
          strategy: 'heal_mp',
          rawAmount: 0,
          effectiveAmount: 0,
          isTargetFull: false,
          isTargetDead: true,
          reason: 'TARGET_DEAD'
        };
      }
    }

    let resolvedOptions = {};
    if (typeof options === 'object') {
      if (options !== null) {
        resolvedOptions = options;
      }
    }

    const isFullHeal = effectDef.params.full === true;
    let rawAmount = 0;

    if (isFullHeal) {
      rawAmount = target.maxMp;
    } else {
      if (typeof effectDef.params.base !== 'number') {
        throw new TypeError('effectDef.params.base must be a number when full is not true.');
      }
      if (Number.isNaN(effectDef.params.base)) {
        throw new RangeError('effectDef.params.base cannot be NaN.');
      }
      if (!Number.isFinite(effectDef.params.base)) {
        throw new RangeError('effectDef.params.base must be a finite number.');
      }
      if (effectDef.params.base < 0) {
        throw new RangeError('effectDef.params.base cannot be negative.');
      }

      let variance = 0;
      if (typeof effectDef.params.variance === 'number') {
        if (Number.isNaN(effectDef.params.variance)) {
          throw new RangeError('effectDef.params.variance cannot be NaN.');
        }
        if (!Number.isFinite(effectDef.params.variance)) {
          throw new RangeError('effectDef.params.variance must be a finite number.');
        }
        if (effectDef.params.variance < 0) {
          throw new RangeError('effectDef.params.variance cannot be negative.');
        }
        variance = effectDef.params.variance;
      }

      let rand = 0;
      if (typeof resolvedOptions.random === 'function') {
        const val = resolvedOptions.random();
        if (typeof val !== 'number') {
          throw new TypeError('options.random() must return a number.');
        }
        if (Number.isNaN(val)) {
          throw new RangeError('options.random() returned NaN.');
        }
        rand = val;
      } else if (typeof resolvedOptions.random === 'number') {
        if (Number.isNaN(resolvedOptions.random)) {
          throw new RangeError('options.random cannot be NaN.');
        }
        rand = resolvedOptions.random;
      } else {
        rand = Math.random();
      }

      if (rand < 0) {
        rand = 0;
      } else if (rand >= 1) {
        rand = 0.999999999999;
      }

      const varianceAdd = Math.floor(rand * variance);
      rawAmount = Math.floor(effectDef.params.base) + varianceAdd;
    }

    const isTargetFull = target.mp >= target.maxMp;
    const missingMp = Math.max(0, target.maxMp - target.mp);
    const effectiveAmount = Math.min(missingMp, rawAmount);

    return {
      success: true,
      strategy: 'heal_mp',
      rawAmount: rawAmount,
      effectiveAmount: effectiveAmount,
      isTargetFull: isTargetFull,
      isTargetDead: false,
      reason: null
    };
  }
}