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

    if (Array.isArray(effectDef.params.blockedMapProperties)) {
      if (currentMap !== null) {
        for (let i = 0; i < effectDef.params.blockedMapProperties.length; i = i + 1) {
          const propName = effectDef.params.blockedMapProperties[i];
          if (typeof propName === 'string') {
            const propValue = currentMap[propName];
            if (typeof propValue !== 'undefined') {
              if (propValue !== null) {
                if (propValue !== false) {
                  return {
                    success: false,
                    strategy: 'teleport',
                    reason: 'BLOCKED_LOCATION'
                  };
                }
              }
            }
          }
        }
      }
    }

    let targetMap = null;
    let targetX = null;
    let targetY = null;
    let direction = 'down';

    if (typeof effectDef.params.targetType !== 'undefined') {
      if (typeof effectDef.params.targetType !== 'string') {
        throw new TypeError('effectDef.params.targetType must be a string.');
      }
      if (effectDef.params.targetType === 'escape_target') {
        if (currentMap === null) {
          return {
            success: false,
            strategy: 'teleport',
            reason: 'NO_ESCAPE_TARGET'
          };
        }
        if (typeof currentMap.escapeTarget !== 'object') {
          return {
            success: false,
            strategy: 'teleport',
            reason: 'NO_ESCAPE_TARGET'
          };
        }
        if (currentMap.escapeTarget === null) {
          return {
            success: false,
            strategy: 'teleport',
            reason: 'NO_ESCAPE_TARGET'
          };
        }
        const escapeTarget = currentMap.escapeTarget;
        if (typeof escapeTarget.targetMap !== 'string') {
          return {
            success: false,
            strategy: 'teleport',
            reason: 'NO_ESCAPE_TARGET'
          };
        }
        if (escapeTarget.targetMap.length === 0) {
          return {
            success: false,
            strategy: 'teleport',
            reason: 'NO_ESCAPE_TARGET'
          };
        }
        if (typeof escapeTarget.targetX !== 'number') {
          return {
            success: false,
            strategy: 'teleport',
            reason: 'NO_ESCAPE_TARGET'
          };
        }
        if (typeof escapeTarget.targetY !== 'number') {
          return {
            success: false,
            strategy: 'teleport',
            reason: 'NO_ESCAPE_TARGET'
          };
        }
        targetMap = escapeTarget.targetMap;
        targetX = escapeTarget.targetX;
        targetY = escapeTarget.targetY;
        if (typeof escapeTarget.direction === 'string') {
          if (escapeTarget.direction.length > 0) {
            direction = escapeTarget.direction;
          }
        }
      } else if (effectDef.params.targetType === 'return_point') {
        let resolvedUser = {};
        if (typeof user === 'object') {
          if (user !== null) {
            resolvedUser = user;
          }
        }
        if (typeof resolvedUser.returnPoint !== 'object') {
          return {
            success: false,
            strategy: 'teleport',
            reason: 'NO_RETURN_POINT'
          };
        }
        if (resolvedUser.returnPoint === null) {
          return {
            success: false,
            strategy: 'teleport',
            reason: 'NO_RETURN_POINT'
          };
        }
        const returnPoint = resolvedUser.returnPoint;
        if (typeof returnPoint.mapId !== 'string') {
          return {
            success: false,
            strategy: 'teleport',
            reason: 'NO_RETURN_POINT'
          };
        }
        if (returnPoint.mapId.length === 0) {
          return {
            success: false,
            strategy: 'teleport',
            reason: 'NO_RETURN_POINT'
          };
        }
        if (typeof returnPoint.gridX !== 'number') {
          return {
            success: false,
            strategy: 'teleport',
            reason: 'NO_RETURN_POINT'
          };
        }
        if (typeof returnPoint.gridY !== 'number') {
          return {
            success: false,
            strategy: 'teleport',
            reason: 'NO_RETURN_POINT'
          };
        }
        targetMap = returnPoint.mapId;
        targetX = returnPoint.gridX;
        targetY = returnPoint.gridY;
        if (typeof returnPoint.direction === 'string') {
          if (returnPoint.direction.length > 0) {
            direction = returnPoint.direction;
          }
        }
      } else {
        throw new Error('Unknown targetType: ' + effectDef.params.targetType);
      }
    } else {
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

      targetMap = effectDef.params.targetMap;
      targetX = effectDef.params.targetX;
      targetY = effectDef.params.targetY;

      if (typeof effectDef.params.direction === 'string') {
        if (effectDef.params.direction.length > 0) {
          direction = effectDef.params.direction;
        }
      }
    }

    let isTeleport = true;
    if (typeof effectDef.params.isTeleport === 'boolean') {
      isTeleport = effectDef.params.isTeleport;
    }

    return {
      success: true,
      strategy: 'teleport',
      targetMap: targetMap,
      targetX: targetX,
      targetY: targetY,
      direction: direction,
      isTeleport: isTeleport,
      reason: null
    };
  }
}