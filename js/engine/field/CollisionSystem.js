// FILE_ENTRY: js/engine/field/CollisionSystem.js

function isPlainObject(value) {
  if (typeof value !== 'object') {
    return false;
  }
  if (value === null) {
    return false;
  }
  if (Array.isArray(value)) {
    return false;
  }
  return true;
}

function validateCommonArgs(args, callerName) {
  if (!isPlainObject(args)) {
    throw new Error(`${callerName}: 引数はオブジェクトである必要があります。`);
  }

  const map = args.map;
  if (!isPlainObject(map)) {
    throw new Error(`${callerName}: map は有効なオブジェクトである必要があります。`);
  }
  if (!Array.isArray(map.data)) {
    throw new Error(`${callerName}: map.data は配列である必要があります。`);
  }
  if (!Array.isArray(map.interactables)) {
    throw new Error(`${callerName}: map.interactables は配列である必要があります。`);
  }
  if (!Array.isArray(map.npcs)) {
    throw new Error(`${callerName}: map.npcs は配列である必要があります。`);
  }

  if (!isPlainObject(args.tileDb)) {
    throw new Error(`${callerName}: tileDb は有効なオブジェクトである必要があります。`);
  }

  if (typeof args.gx !== 'number') {
    throw new Error(`${callerName}: gx は有限数値である必要があります。`);
  }
  if (!Number.isFinite(args.gx)) {
    throw new Error(`${callerName}: gx は有限数値である必要があります。`);
  }

  if (typeof args.gy !== 'number') {
    throw new Error(`${callerName}: gy は有限数値である必要があります。`);
  }
  if (!Number.isFinite(args.gy)) {
    throw new Error(`${callerName}: gy は有限数値である必要があります。`);
  }

  if (typeof args.tileSize !== 'number') {
    throw new Error(`${callerName}: tileSize は正の有限数値である必要があります。`);
  }
  if (!Number.isFinite(args.tileSize)) {
    throw new Error(`${callerName}: tileSize は正の有限数値である必要があります。`);
  }
  if (args.tileSize <= 0) {
    throw new Error(`${callerName}: tileSize は正の有限数値である必要があります。`);
  }
}

function isOutOfMapBounds(mapData, gx, gy) {
  if (gy < 0) {
    return true;
  }
  if (gy >= mapData.length) {
    return true;
  }
  const row = mapData[gy];
  if (!Array.isArray(row)) {
    return true;
  }
  if (gx < 0) {
    return true;
  }
  if (gx >= row.length) {
    return true;
  }
  return false;
}

function isTilePassable(mapData, tileDb, gx, gy) {
  const tileId = mapData[gy][gx];
  const tileDef = tileDb[tileId];
  if (!isPlainObject(tileDef)) {
    return false;
  }
  if (tileDef.pass !== true) {
    return false;
  }
  return true;
}

function isInteractableBlocking(interactables, gx, gy) {
  for (let i = 0; i < interactables.length; i += 1) {
    const obj = interactables[i];
    if (isPlainObject(obj)) {
      if (obj.gridX === gx) {
        if (obj.gridY === gy) {
          return true;
        }
      }
    }
  }
  return false;
}

function isEntityOccupyingGrid(entity, gx, gy, tileSize) {
  if (entity.gridX === gx) {
    if (entity.gridY === gy) {
      return true;
    }
  }
  const destGx = Math.round(entity.targetPixelX / tileSize);
  const destGy = Math.round(entity.targetPixelY / tileSize);
  if (destGx === gx) {
    if (destGy === gy) {
      return true;
    }
  }
  return false;
}

export function canPlayerMoveTo(args) {
  validateCommonArgs(args, 'canPlayerMoveTo');

  const map = args.map;
  const tileDb = args.tileDb;
  const gx = args.gx;
  const gy = args.gy;
  const tileSize = args.tileSize;

  if (isOutOfMapBounds(map.data, gx, gy)) {
    return false;
  }

  if (!isTilePassable(map.data, tileDb, gx, gy)) {
    return false;
  }

  if (isInteractableBlocking(map.interactables, gx, gy)) {
    return false;
  }

  for (let i = 0; i < map.npcs.length; i += 1) {
    const npc = map.npcs[i];
    if (isPlainObject(npc)) {
      if (isEntityOccupyingGrid(npc, gx, gy, tileSize)) {
        if (npc.type !== 'monster') {
          return false;
        }
      }
    }
  }

  return true;
}

export function canNpcMoveTo(args) {
  validateCommonArgs(args, 'canNpcMoveTo');

  const npc = args.npc;
  if (!isPlainObject(npc)) {
    throw new Error('canNpcMoveTo: npc は有効なオブジェクトである必要があります。');
  }

  const player = args.player;
  if (!isPlainObject(player)) {
    throw new Error('canNpcMoveTo: player は有効なオブジェクトである必要があります。');
  }

  const map = args.map;
  const tileDb = args.tileDb;
  const gx = args.gx;
  const gy = args.gy;
  const tileSize = args.tileSize;

  if (isPlainObject(npc.moveArea)) {
    if (gx < npc.moveArea.minX) {
      return false;
    }
    if (gx > npc.moveArea.maxX) {
      return false;
    }
    if (gy < npc.moveArea.minY) {
      return false;
    }
    if (gy > npc.moveArea.maxY) {
      return false;
    }
  }

  if (isOutOfMapBounds(map.data, gx, gy)) {
    return false;
  }

  if (!isTilePassable(map.data, tileDb, gx, gy)) {
    return false;
  }

  if (isInteractableBlocking(map.interactables, gx, gy)) {
    return false;
  }

  if (isEntityOccupyingGrid(player, gx, gy, tileSize)) {
    if (npc.type !== 'monster') {
      return false;
    }
  }

  for (let i = 0; i < map.npcs.length; i += 1) {
    const other = map.npcs[i];
    if (isPlainObject(other)) {
      if (other !== npc) {
        if (isEntityOccupyingGrid(other, gx, gy, tileSize)) {
          return false;
        }
      }
    }
  }

  return true;
}