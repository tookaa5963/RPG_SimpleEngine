/**
 * 状態異常解除効果計算ストラテジー
 * 純粋計算を行い、計算結果オブジェクトを返却する。
 * 対象（target）および使用者（user）に対するプロパティ変更（副作用）は一切行わない。
 */
export class CureStatusEffect {
  /**
   * 状態異常解除結果を計算し、結果オブジェクトを返却する
   * @param {Object} effectDef - 効果定義オブジェクト
   * @param {Object} user - 使用者オブジェクト
   * @param {Object} target - 対象オブジェクト
   * @param {Object} [options] - オプション
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
    if (effectDef.type !== 'cure_status') {
      throw new Error('Invalid effect type for CureStatusEffect: ' + effectDef.type);
    }
    if (typeof effectDef.params !== 'object') {
      throw new TypeError('effectDef.params must be an object.');
    }
    if (effectDef.params === null) {
      throw new TypeError('effectDef.params cannot be null.');
    }
    if (typeof effectDef.params.status !== 'string') {
      throw new TypeError('effectDef.params.status must be a string.');
    }
    if (effectDef.params.status.length === 0) {
      throw new Error('effectDef.params.status cannot be empty.');
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

    if (typeof target.hp === 'number') {
      if (target.hp <= 0) {
        return {
          success: false,
          strategy: 'cure_status',
          cured: false,
          status: effectDef.params.status,
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

    const targetStatus = effectDef.params.status;
    let hasStatusToCure = false;

    if (targetStatus === 'poison') {
      if (typeof target.hasStatus === 'function') {
        const has = target.hasStatus('poison');
        if (typeof has === 'boolean') {
          hasStatusToCure = has;
        }
      } else if (typeof target.isPoisoned === 'boolean') {
        hasStatusToCure = target.isPoisoned;
      }
    } else if (targetStatus === 'all') {
      if (typeof target.hasStatus === 'function') {
        const hasPoison = target.hasStatus('poison');
        if (typeof hasPoison === 'boolean') {
          if (hasPoison === true) {
            hasStatusToCure = true;
          }
        }
      } else if (typeof target.isPoisoned === 'boolean') {
        if (target.isPoisoned === true) {
          hasStatusToCure = true;
        }
      }
    } else {
      if (typeof target.hasStatus === 'function') {
        const has = target.hasStatus(targetStatus);
        if (typeof has === 'boolean') {
          hasStatusToCure = has;
        }
      }
    }

    if (hasStatusToCure === true) {
      return {
        success: true,
        strategy: 'cure_status',
        cured: true,
        status: targetStatus,
        isTargetDead: false,
        reason: null
      };
    } else {
      return {
        success: true,
        strategy: 'cure_status',
        cured: false,
        status: targetStatus,
        isTargetDead: false,
        reason: 'NOT_AFFECTED'
      };
    }
  }
}
