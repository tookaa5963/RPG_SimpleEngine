/**
 * テレポート効果計算ストラテジー
 * 純粋計算を行い、計算結果オブジェクトを返却する。
 * 対象および使用者に対するプロパティ変更（副作用）は一切行わない。
 */
export class TeleportEffect {
  /**
   * テレポート先および可否を計算し、結果オブジェクトを返却する
   * @param {Object} effectDef - 効果定義オブジェクト
   * @param {Object} user - 使用者オブジェクト
   * @param {Object} target - 対象オブジェクト
   * @param {Object} [options] - 実行コンテキスト（currentMap等）
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
    if (effectDef.type !== 'teleport') {
      throw new Error('Invalid effect type for TeleportEffect: ' + effectDef.type);
    }
    if (typeof effectDef.params !== 'object') {
      throw new TypeError('effectDef.params must be an object.');
    }
    if (effectDef.params === null) {
      throw new TypeError('effectDef.params cannot be null.');
    }

    if (typeof effectDef.params.targetMap !== 'string') {
      throw new TypeError('effectDef.params.targetMap must be a string.');
    }
    if (effectDef.params.targetMap.length === 0) {
      throw new Error('effectDef.params.targetMap cannot be empty.');
    }

    if (typeof effectDef.params.targetX !== 'number') {
      throw new TypeError('effectDef.params.targetX must be a number.');
    }
    if (Number.isNaN(effectDef.params.targetX)) {
      throw new RangeError('effectDef.params.targetX cannot be NaN.');
    }
    if (!Number.isFinite(effectDef.params.targetX)) {
      throw new RangeError('effectDef.params.targetX must be a finite number.');
    }
    if (effectDef.params.targetX < 0) {
      throw new RangeError('effectDef.params.targetX cannot be negative.');
    }

    if (typeof effectDef.params.targetY !== 'number') {
      throw new TypeError('effectDef.params.targetY must be a number.');
    }
    if (Number.isNaN(effectDef.params.targetY)) {
      throw new RangeError('effectDef.params.targetY cannot be NaN.');
    }
    if (!Number.isFinite(effectDef.params.targetY)) {
      throw new RangeError('effectDef.params.targetY must be a finite number.');
    }
    if (effectDef.params.targetY < 0) {
      throw new RangeError('effectDef.params.targetY cannot be negative.');
    }

    let direction = 'down';
    if (typeof effectDef.params.direction === 'string') {
      if (effectDef.params.direction.length > 0) {
        direction = effectDef.params.direction;
      }
    }

    let isTeleport = true;
    if (typeof effectDef.params.isTeleport === 'boolean') {
      isTeleport = effectDef.params.isTeleport;
    }

    let resolvedOptions = {};
    if (typeof options === 'object') {
      if (options !== null) {
        resolvedOptions = options;
      }
    }

    let currentMap = null;
    if (typeof resolvedOptions.currentMap === 'object') {
      if (resolvedOptions.currentMap !== null) {
        currentMap = resolvedOptions.currentMap;
      }
    }

    let currentMapType = null;
    if (currentMap !== null) {
      if (typeof currentMap.mapType === 'string') {
        currentMapType = currentMap.mapType;
      }
    }

    if (Array.isArray(effectDef.params.allowedMapTypes)) {
      let isAllowed = false;
      if (currentMapType !== null) {
        if (effectDef.params.allowedMapTypes.includes(currentMapType)) {
          isAllowed = true;
        }
      }
      if (!isAllowed) {
        return {
          success: false,
          strategy: 'teleport',
          reason: 'INVALID_LOCATION'
        };
      }
    }

    if (Array.isArray(effectDef.params.blockedMapTypes)) {
      let isBlocked = false;
      if (currentMapType !== null) {
        if (effectDef.params.blockedMapTypes.includes(currentMapType)) {
          isBlocked = true;
        }
      }
      if (isBlocked) {
        return {
          success: false,
          strategy: 'teleport',
          reason: 'BLOCKED_LOCATION'
        };
      }
    }

    return {
      success: true,
      strategy: 'teleport',
      targetMap: effectDef.params.targetMap,
      targetX: effectDef.params.targetX,
      targetY: effectDef.params.targetY,
      direction: direction,
      isTeleport: isTeleport,
      reason: null
    };
  }
}