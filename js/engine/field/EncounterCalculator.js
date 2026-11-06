function assertPlainObject(value, name) {
  if (typeof value !== 'object') {
    throw new TypeError(name + ' must be a plain object');
  }
  if (value === null) {
    throw new TypeError(name + ' must not be null');
  }
  if (Array.isArray(value)) {
    throw new TypeError(name + ' must not be an array');
  }
}

function assertFiniteNumber(value, name) {
  if (typeof value !== 'number') {
    throw new TypeError(name + ' must be a finite number');
  }
  if (!Number.isFinite(value)) {
    throw new RangeError(name + ' must be a finite number');
  }
}

function assertNonNegativeNumber(value, name) {
  assertFiniteNumber(value, name);
  if (value < 0) {
    throw new RangeError(name + ' must be greater than or equal to 0');
  }
}

function assertUnitRoll(value, name) {
  assertFiniteNumber(value, name);
  if (value < 0) {
    throw new RangeError(name + ' must be in range [0, 1)');
  }
  if (value >= 1) {
    throw new RangeError(name + ' must be in range [0, 1)');
  }
}

export function shouldRepelMonster(params) {
  assertPlainObject(params, 'params');
  assertNonNegativeNumber(params.holyWaterSteps, 'holyWaterSteps');
  assertFiniteNumber(params.playerLevel, 'playerLevel');
  if (params.playerLevel < 1) {
    throw new RangeError('playerLevel must be greater than or equal to 1');
  }
  assertUnitRoll(params.repelRoll, 'repelRoll');

  if (params.holyWaterSteps <= 0) {
    return false;
  }

  if (params.monsterDef === undefined) {
    return false;
  }
  if (params.monsterDef === null) {
    return false;
  }

  assertPlainObject(params.monsterDef, 'monsterDef');

  if (params.monsterDef.isBoss === true) {
    return false;
  }

  let monsterLevel = 1;
  if (typeof params.monsterDef.level === 'number') {
    if (Number.isFinite(params.monsterDef.level)) {
      monsterLevel = params.monsterDef.level;
    }
  }

  if (params.playerLevel - monsterLevel >= 3) {
    if (params.repelRoll >= 0.15) {
      return true;
    }
  }

  return false;
}

export function evaluateRandomEncounter(params) {
  assertPlainObject(params, 'params');
  assertNonNegativeNumber(params.stepsSinceLastBattle, 'stepsSinceLastBattle');
  assertNonNegativeNumber(params.minSafeSteps, 'minSafeSteps');
  assertPlainObject(params.map, 'map');
  assertFiniteNumber(params.playerX, 'playerX');
  assertFiniteNumber(params.playerY, 'playerY');
  assertUnitRoll(params.encounterRoll, 'encounterRoll');
  assertUnitRoll(params.poolRoll, 'poolRoll');
  assertNonNegativeNumber(params.holyWaterSteps, 'holyWaterSteps');
  assertFiniteNumber(params.playerLevel, 'playerLevel');
  if (params.playerLevel < 1) {
    throw new RangeError('playerLevel must be greater than or equal to 1');
  }
  assertUnitRoll(params.repelRoll, 'repelRoll');
  assertPlainObject(params.monsterDefinitions, 'monsterDefinitions');

  const nextStepsSinceLastBattle = params.stepsSinceLastBattle + 1;

  if (nextStepsSinceLastBattle <= params.minSafeSteps) {
    return {
      nextStepsSinceLastBattle: nextStepsSinceLastBattle,
      encountered: false,
      monsterId: null,
      repelled: false
    };
  }

  let activeRate = 0;
  if (typeof params.map.encounterRate === 'number') {
    if (Number.isFinite(params.map.encounterRate)) {
      activeRate = params.map.encounterRate;
    }
  }

  let activePool = ['slime'];
  if (Array.isArray(params.map.monsters)) {
    activePool = params.map.monsters;
  }

  if (Array.isArray(params.map.encounterZones)) {
    if (params.map.encounterZones.length > 0) {
      let matchedZone = null;
      for (let i = 0; i < params.map.encounterZones.length; i += 1) {
        const zone = params.map.encounterZones[i];
        if (typeof zone === 'object') {
          if (zone !== null) {
            if (params.playerX >= zone.x1) {
              if (params.playerX <= zone.x2) {
                if (params.playerY >= zone.y1) {
                  if (params.playerY <= zone.y2) {
                    matchedZone = zone;
                    break;
                  }
                }
              }
            }
          }
        }
      }

      if (matchedZone === null) {
        return {
          nextStepsSinceLastBattle: nextStepsSinceLastBattle,
          encountered: false,
          monsterId: null,
          repelled: false
        };
      }

      if (matchedZone.rate !== undefined) {
        if (typeof matchedZone.rate === 'number') {
          if (Number.isFinite(matchedZone.rate)) {
            activeRate = matchedZone.rate;
          }
        }
      }

      if (Array.isArray(matchedZone.monsters)) {
        activePool = matchedZone.monsters;
      }
    }
  }

  if (activeRate <= 0) {
    return {
      nextStepsSinceLastBattle: nextStepsSinceLastBattle,
      encountered: false,
      monsterId: null,
      repelled: false
    };
  }

  if (activePool.length === 0) {
    return {
      nextStepsSinceLastBattle: nextStepsSinceLastBattle,
      encountered: false,
      monsterId: null,
      repelled: false
    };
  }

  if (params.encounterRoll < activeRate) {
    const poolIndex = Math.floor(params.poolRoll * activePool.length);
    const monsterId = activePool[poolIndex];

    let monsterDef = undefined;
    if (Object.prototype.hasOwnProperty.call(params.monsterDefinitions, monsterId)) {
      monsterDef = params.monsterDefinitions[monsterId];
    }

    const repelled = shouldRepelMonster({
      holyWaterSteps: params.holyWaterSteps,
      playerLevel: params.playerLevel,
      monsterDef: monsterDef,
      repelRoll: params.repelRoll
    });

    if (repelled) {
      return {
        nextStepsSinceLastBattle: nextStepsSinceLastBattle,
        encountered: false,
        monsterId: null,
        repelled: true
      };
    }

    return {
      nextStepsSinceLastBattle: nextStepsSinceLastBattle,
      encountered: true,
      monsterId: monsterId,
      repelled: false
    };
  }

  return {
    nextStepsSinceLastBattle: nextStepsSinceLastBattle,
    encountered: false,
    monsterId: null,
    repelled: false
  };
}