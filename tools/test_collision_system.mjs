import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { canPlayerMoveTo, canNpcMoveTo } from '../js/engine/field/CollisionSystem.js';

const TILE_SIZE = 64;

const REAL_TILE_DB = Object.freeze({
  0: Object.freeze({ id: 0, name: '草地(歩行可)', pass: true, blockLight: false, color: '#27ae60' }),
  1: Object.freeze({ id: 1, name: '壁(進入禁止)', pass: false, blockLight: true, color: '#7f8c8d' }),
  2: Object.freeze({ id: 2, name: '水/海', pass: false, blockLight: false, color: '#2980b9' }),
  3: Object.freeze({ id: 3, name: '毒の沼地', pass: true, blockLight: false, color: '#6c5ce7', isSwamp: true }),
  4: Object.freeze({ id: 4, name: 'マグマ', pass: true, blockLight: false, color: '#d63031', isMagma: true }),
  5: Object.freeze({ id: 5, name: '床(木)', pass: true, blockLight: false, color: '#d35400' }),
  6: Object.freeze({ id: 6, name: '砂浜', pass: true, blockLight: false, color: '#f1c40f' }),
  7: Object.freeze({ id: 7, name: '洞窟(床)', pass: true, blockLight: false, color: '#222222' }),
  8: Object.freeze({ id: 8, name: '洞窟(壁)', pass: false, blockLight: true, color: '#555555' }),
  9: Object.freeze({ id: 9, name: 'カウンター', pass: false, blockLight: false, isCounter: true, color: '#8e44ad' }),
  10: Object.freeze({ id: 10, name: '床(石)', pass: true, blockLight: false, color: '#95a5a6' })
});

function cloneTileDb() {
  return JSON.parse(JSON.stringify(REAL_TILE_DB));
}

function createGridMap(width, height, fillTileId = 0) {
  const data = [];
  for (let y = 0; y < height; y += 1) {
    const row = new Array(width).fill(fillTileId);
    data.push(row);
  }
  return {
    width,
    height,
    data,
    interactables: [],
    npcs: []
  };
}

function createLighthousekeeper(overrides = {}) {
  return {
    id: 'lighthousekeeper',
    type: 'human',
    gridX: 2,
    gridY: 3,
    targetPixelX: 2 * TILE_SIZE,
    targetPixelY: 3 * TILE_SIZE,
    moveArea: { minX: 1, maxX: 4, minY: 2, maxY: 5 },
    ...overrides
  };
}

function createGuardPort(overrides = {}) {
  return {
    id: 'guard_port',
    type: 'human',
    gridX: 3,
    gridY: 3,
    targetPixelX: 3 * TILE_SIZE,
    targetPixelY: 3 * TILE_SIZE,
    ...overrides
  };
}

function createMonsterBat1(overrides = {}) {
  return {
    id: 'monster_bat_1',
    type: 'monster',
    monsterId: 'bat',
    gridX: 16,
    gridY: 14,
    targetPixelX: 16 * TILE_SIZE,
    targetPixelY: 14 * TILE_SIZE,
    moveArea: { minX: 14, maxX: 22, minY: 12, maxY: 17 },
    ...overrides
  };
}

function createPlayer(gridX = 1, gridY = 1, targetGridX = gridX, targetGridY = gridY) {
  return {
    gridX,
    gridY,
    targetPixelX: targetGridX * TILE_SIZE,
    targetPixelY: targetGridY * TILE_SIZE
  };
}

export function runCollisionSystemTests() {
  // ---------------------------------------------------------------------------
  // A. canPlayerMoveTo 正常系・境界値ケース
  // ---------------------------------------------------------------------------

  // 1. 通行可能タイルへの移動許可（実在 pass: true タイル全種）
  {
    const tileDb = cloneTileDb();
    const map = createGridMap(7, 7, 0);
    const passableIds = [0, 3, 4, 5, 6, 7, 10];
    for (let x = 0; x < passableIds.length; x += 1) {
      map.data[0][x] = passableIds[x];
      const result = canPlayerMoveTo({
        map,
        tileDb,
        gx: x,
        gy: 0,
        tileSize: TILE_SIZE
      });
      assert.strictEqual(
        result,
        true,
        `Passable tile ID ${passableIds[x]} at (${x}, 0) must allow player movement`
      );
    }
  }

  // 2. 通行不可タイルへの移動拒否（実在 pass: false タイル全種）
  {
    const tileDb = cloneTileDb();
    const map = createGridMap(7, 7, 0);
    const impassableIds = [1, 2, 8, 9];
    for (let x = 0; x < impassableIds.length; x += 1) {
      map.data[1][x] = impassableIds[x];
      const result = canPlayerMoveTo({
        map,
        tileDb,
        gx: x,
        gy: 1,
        tileSize: TILE_SIZE
      });
      assert.strictEqual(
        result,
        false,
        `Impassable tile ID ${impassableIds[x]} at (${x}, 1) must block player movement`
      );
    }
  }

  // 3. 未定義タイルIDの移動拒否
  {
    const tileDb = cloneTileDb();
    const map = createGridMap(7, 7, 0);
    map.data[2][2] = 999;
    assert.strictEqual(
      canPlayerMoveTo({ map, tileDb, gx: 2, gy: 2, tileSize: TILE_SIZE }),
      false,
      'Undefined tile ID must block player movement'
    );
  }

  // 4. マップ境界値チェック（lighthousekeeper_cottage 準拠 7x7 グリッド）
  {
    const tileDb = cloneTileDb();
    const map = createGridMap(7, 7, 5);

    assert.strictEqual(canPlayerMoveTo({ map, tileDb, gx: 0, gy: 0, tileSize: TILE_SIZE }), true);
    assert.strictEqual(canPlayerMoveTo({ map, tileDb, gx: 6, gy: 0, tileSize: TILE_SIZE }), true);
    assert.strictEqual(canPlayerMoveTo({ map, tileDb, gx: 0, gy: 6, tileSize: TILE_SIZE }), true);
    assert.strictEqual(canPlayerMoveTo({ map, tileDb, gx: 6, gy: 6, tileSize: TILE_SIZE }), true);

    assert.strictEqual(canPlayerMoveTo({ map, tileDb, gx: -1, gy: 0, tileSize: TILE_SIZE }), false);
    assert.strictEqual(canPlayerMoveTo({ map, tileDb, gx: 0, gy: -1, tileSize: TILE_SIZE }), false);
    assert.strictEqual(canPlayerMoveTo({ map, tileDb, gx: 7, gy: 0, tileSize: TILE_SIZE }), false);
    assert.strictEqual(canPlayerMoveTo({ map, tileDb, gx: 0, gy: 7, tileSize: TILE_SIZE }), false);
  }

  // 5. インタラクトオブジェクト衝突判定（armor_shop の看板）
  {
    const tileDb = cloneTileDb();
    const map = createGridMap(7, 7, 5);
    map.interactables.push({
      type: 'sign',
      gridX: 2,
      gridY: 1,
      text: 'ここは ぶぐや です。'
    });

    assert.strictEqual(
      canPlayerMoveTo({ map, tileDb, gx: 2, gy: 1, tileSize: TILE_SIZE }),
      false,
      'Interactable object tile must block player movement'
    );
    assert.strictEqual(
      canPlayerMoveTo({ map, tileDb, gx: 3, gy: 1, tileSize: TILE_SIZE }),
      true,
      'Adjacent empty floor tile must allow player movement'
    );
  }

  // 6. 人間NPC（type: 'human'）との衝突判定（現在位置・移動目標位置）
  {
    const tileDb = cloneTileDb();
    const map = createGridMap(7, 7, 5);
    const keeper = createLighthousekeeper({
      gridX: 2,
      gridY: 3,
      targetPixelX: 3 * TILE_SIZE,
      targetPixelY: 3 * TILE_SIZE
    });
    map.npcs.push(keeper);

    assert.strictEqual(
      canPlayerMoveTo({ map, tileDb, gx: 2, gy: 3, tileSize: TILE_SIZE }),
      false,
      'Current grid of human NPC must block player'
    );
    assert.strictEqual(
      canPlayerMoveTo({ map, tileDb, gx: 3, gy: 3, tileSize: TILE_SIZE }),
      false,
      'Target grid of moving human NPC must block player'
    );
    assert.strictEqual(
      canPlayerMoveTo({ map, tileDb, gx: 4, gy: 3, tileSize: TILE_SIZE }),
      true,
      'Unoccupied grid next to human NPC must allow player'
    );
  }

  // 7. モンスターNPC（type: 'monster'）との重複進入許可（シンボルエンカウント）
  {
    const tileDb = cloneTileDb();
    const map = createGridMap(25, 25, 7);
    const bat = createMonsterBat1({
      gridX: 16,
      gridY: 14,
      targetPixelX: 17 * TILE_SIZE,
      targetPixelY: 14 * TILE_SIZE
    });
    map.npcs.push(bat);

    assert.strictEqual(
      canPlayerMoveTo({ map, tileDb, gx: 16, gy: 14, tileSize: TILE_SIZE }),
      true,
      'Current grid of monster NPC must allow player overlap for encounter'
    );
    assert.strictEqual(
      canPlayerMoveTo({ map, tileDb, gx: 17, gy: 14, tileSize: TILE_SIZE }),
      true,
      'Target grid of moving monster NPC must allow player overlap for encounter'
    );
  }

  // ---------------------------------------------------------------------------
  // B. canNpcMoveTo 正常系・境界値ケース
  // ---------------------------------------------------------------------------

  // 8. 移動範囲（npc.moveArea）境界値チェックおよび未定義時の無制限許可
  {
    const tileDb = cloneTileDb();
    const map = createGridMap(7, 7, 5);
    const keeper = createLighthousekeeper({
      gridX: 2,
      gridY: 3,
      targetPixelX: 2 * TILE_SIZE,
      targetPixelY: 3 * TILE_SIZE,
      moveArea: { minX: 1, maxX: 4, minY: 2, maxY: 5 }
    });
    const guard = createGuardPort({
      gridX: 3,
      gridY: 3,
      targetPixelX: 3 * TILE_SIZE,
      targetPixelY: 3 * TILE_SIZE
    });
    const player = createPlayer(6, 6);
    map.npcs.push(keeper, guard);

    // moveArea 4辺の境界上は許可
    assert.strictEqual(canNpcMoveTo({ npc: keeper, map, tileDb, player, gx: 1, gy: 2, tileSize: TILE_SIZE }), true);
    assert.strictEqual(canNpcMoveTo({ npc: keeper, map, tileDb, player, gx: 4, gy: 2, tileSize: TILE_SIZE }), true);
    assert.strictEqual(canNpcMoveTo({ npc: keeper, map, tileDb, player, gx: 1, gy: 5, tileSize: TILE_SIZE }), true);
    assert.strictEqual(canNpcMoveTo({ npc: keeper, map, tileDb, player, gx: 4, gy: 5, tileSize: TILE_SIZE }), true);

    // moveArea 1マス外側は拒否
    assert.strictEqual(canNpcMoveTo({ npc: keeper, map, tileDb, player, gx: 0, gy: 2, tileSize: TILE_SIZE }), false);
    assert.strictEqual(canNpcMoveTo({ npc: keeper, map, tileDb, player, gx: 5, gy: 2, tileSize: TILE_SIZE }), false);
    assert.strictEqual(canNpcMoveTo({ npc: keeper, map, tileDb, player, gx: 1, gy: 1, tileSize: TILE_SIZE }), false);
    assert.strictEqual(canNpcMoveTo({ npc: keeper, map, tileDb, player, gx: 1, gy: 6, tileSize: TILE_SIZE }), false);

    // moveArea 未定義（guard_port）はマップ境界内であれば許可
    assert.strictEqual(canNpcMoveTo({ npc: guard, map, tileDb, player, gx: 0, gy: 0, tileSize: TILE_SIZE }), true);
    assert.strictEqual(canNpcMoveTo({ npc: guard, map, tileDb, player, gx: 6, gy: 0, tileSize: TILE_SIZE }), true);

    // moveArea が null の場合も無制限許可
    const guardWithNullArea = createGuardPort({ moveArea: null });
    assert.strictEqual(
      canNpcMoveTo({ npc: guardWithNullArea, map, tileDb, player, gx: 0, gy: 6, tileSize: TILE_SIZE }),
      true
    );
  }

  // 9. マップ境界・タイル通行可否・未定義タイル・インタラクトオブジェクト判定
  {
    const tileDb = cloneTileDb();
    const map = createGridMap(7, 7, 5);
    map.data[0][1] = 1; // 壁
    map.data[0][2] = 2; // 水/海
    map.data[0][3] = 8; // 洞窟(壁)
    map.data[0][4] = 9; // カウンター
    map.data[0][5] = 999; // 未定義タイル
    map.interactables.push({
      type: 'sign',
      gridX: 2,
      gridY: 1,
      text: 'ここは ぶぐや です。'
    });

    const guard = createGuardPort({ gridX: 3, gridY: 3, targetPixelX: 3 * TILE_SIZE, targetPixelY: 3 * TILE_SIZE });
    const player = createPlayer(6, 6);
    map.npcs.push(guard);

    // マップ外座標
    assert.strictEqual(canNpcMoveTo({ npc: guard, map, tileDb, player, gx: -1, gy: 3, tileSize: TILE_SIZE }), false);
    assert.strictEqual(canNpcMoveTo({ npc: guard, map, tileDb, player, gx: 7, gy: 3, tileSize: TILE_SIZE }), false);
    assert.strictEqual(canNpcMoveTo({ npc: guard, map, tileDb, player, gx: 3, gy: -1, tileSize: TILE_SIZE }), false);
    assert.strictEqual(canNpcMoveTo({ npc: guard, map, tileDb, player, gx: 3, gy: 7, tileSize: TILE_SIZE }), false);

    // 通行不可タイルおよび未定義タイル
    assert.strictEqual(canNpcMoveTo({ npc: guard, map, tileDb, player, gx: 1, gy: 0, tileSize: TILE_SIZE }), false);
    assert.strictEqual(canNpcMoveTo({ npc: guard, map, tileDb, player, gx: 2, gy: 0, tileSize: TILE_SIZE }), false);
    assert.strictEqual(canNpcMoveTo({ npc: guard, map, tileDb, player, gx: 3, gy: 0, tileSize: TILE_SIZE }), false);
    assert.strictEqual(canNpcMoveTo({ npc: guard, map, tileDb, player, gx: 4, gy: 0, tileSize: TILE_SIZE }), false);
    assert.strictEqual(canNpcMoveTo({ npc: guard, map, tileDb, player, gx: 5, gy: 0, tileSize: TILE_SIZE }), false);

    // インタラクトオブジェクト座標
    assert.strictEqual(canNpcMoveTo({ npc: guard, map, tileDb, player, gx: 2, gy: 1, tileSize: TILE_SIZE }), false);
  }

  // 10. プレイヤー占有マスへの進入判定（人間NPC vs モンスターNPC）
  {
    const tileDb = cloneTileDb();
    const map = createGridMap(25, 25, 7);
    const keeper = createLighthousekeeper({
      gridX: 2,
      gridY: 3,
      targetPixelX: 2 * TILE_SIZE,
      targetPixelY: 3 * TILE_SIZE,
      moveArea: { minX: 1, maxX: 4, minY: 2, maxY: 5 }
    });
    const bat = createMonsterBat1({
      gridX: 16,
      gridY: 14,
      targetPixelX: 16 * TILE_SIZE,
      targetPixelY: 14 * TILE_SIZE,
      moveArea: { minX: 14, maxX: 22, minY: 12, maxY: 17 }
    });
    map.npcs.push(keeper, bat);

    // 人間NPC: プレイヤーの現在座標(2, 2)と移動目標座標(3, 2)の双方を拒否
    const playerNearKeeper = createPlayer(2, 2, 3, 2);
    assert.strictEqual(
      canNpcMoveTo({ npc: keeper, map, tileDb, player: playerNearKeeper, gx: 2, gy: 2, tileSize: TILE_SIZE }),
      false,
      'Human NPC must not enter player current grid'
    );
    assert.strictEqual(
      canNpcMoveTo({ npc: keeper, map, tileDb, player: playerNearKeeper, gx: 3, gy: 2, tileSize: TILE_SIZE }),
      false,
      'Human NPC must not enter player target grid'
    );

    // モンスターNPC: プレイヤーの現在座標(17, 14)と移動目標座標(18, 14)の双方を許可
    const playerNearBat = createPlayer(17, 14, 18, 14);
    assert.strictEqual(
      canNpcMoveTo({ npc: bat, map, tileDb, player: playerNearBat, gx: 17, gy: 14, tileSize: TILE_SIZE }),
      true,
      'Monster NPC must be allowed to enter player current grid'
    );
    assert.strictEqual(
      canNpcMoveTo({ npc: bat, map, tileDb, player: playerNearBat, gx: 18, gy: 14, tileSize: TILE_SIZE }),
      true,
      'Monster NPC must be allowed to enter player target grid'
    );
  }

  // 11. 他NPC占有マスへの進入拒否および自身除外
  {
    const tileDb = cloneTileDb();
    const map = createGridMap(25, 25, 7);
    const keeper = createLighthousekeeper({
      gridX: 2,
      gridY: 3,
      targetPixelX: 2 * TILE_SIZE,
      targetPixelY: 3 * TILE_SIZE
    });
    const guard = createGuardPort({
      gridX: 3,
      gridY: 3,
      targetPixelX: 3 * TILE_SIZE,
      targetPixelY: 4 * TILE_SIZE
    });
    const bat = createMonsterBat1({
      gridX: 16,
      gridY: 14,
      targetPixelX: 16 * TILE_SIZE,
      targetPixelY: 14 * TILE_SIZE
    });
    const guardNearBat = createGuardPort({
      id: 'guard_port_2',
      gridX: 17,
      gridY: 14,
      targetPixelX: 18 * TILE_SIZE,
      targetPixelY: 14 * TILE_SIZE
    });
    const player = createPlayer(0, 0);
    map.npcs.push(keeper, guard, bat, guardNearBat);

    // 人間NPC -> 他NPCの現在座標・移動目標座標は拒否
    assert.strictEqual(
      canNpcMoveTo({ npc: keeper, map, tileDb, player, gx: 3, gy: 3, tileSize: TILE_SIZE }),
      false,
      'Human NPC must not enter another NPC current grid'
    );
    assert.strictEqual(
      canNpcMoveTo({ npc: keeper, map, tileDb, player, gx: 3, gy: 4, tileSize: TILE_SIZE }),
      false,
      'Human NPC must not enter another NPC target grid'
    );

    // モンスターNPC -> 他NPCの現在座標・移動目標座標は拒否
    assert.strictEqual(
      canNpcMoveTo({ npc: bat, map, tileDb, player, gx: 17, gy: 14, tileSize: TILE_SIZE }),
      false,
      'Monster NPC must not enter another NPC current grid'
    );
    assert.strictEqual(
      canNpcMoveTo({ npc: bat, map, tileDb, player, gx: 18, gy: 14, tileSize: TILE_SIZE }),
      false,
      'Monster NPC must not enter another NPC target grid'
    );

    // 判定対象自身（other === npc）の現在座標・移動目標座標は衝突対象から除外される
    const movingKeeper = createLighthousekeeper({
      gridX: 2,
      gridY: 3,
      targetPixelX: 3 * TILE_SIZE,
      targetPixelY: 3 * TILE_SIZE
    });
    const singleMap = createGridMap(7, 7, 5);
    singleMap.npcs.push(movingKeeper);

    assert.strictEqual(
      canNpcMoveTo({ npc: movingKeeper, map: singleMap, tileDb, player, gx: 2, gy: 3, tileSize: TILE_SIZE }),
      true,
      'Self current grid must not block self'
    );
    assert.strictEqual(
      canNpcMoveTo({ npc: movingKeeper, map: singleMap, tileDb, player, gx: 3, gy: 3, tileSize: TILE_SIZE }),
      true,
      'Self target grid must not block self'
    );
  }

  // ---------------------------------------------------------------------------
  // C. フェイルファスト・異常系・純粋性検証ケース
  // ---------------------------------------------------------------------------

  // 12. 不正引数に対する即時例外スロー（canPlayerMoveTo / canNpcMoveTo 共通）
  {
    const tileDb = cloneTileDb();
    const map = createGridMap(7, 7, 5);
    const npc = createLighthousekeeper();
    const player = createPlayer(0, 0);

    // 引数オブジェクト自体が不正
    assert.throws(() => canPlayerMoveTo(null));
    assert.throws(() => canPlayerMoveTo(undefined));
    assert.throws(() => canPlayerMoveTo('invalid'));
    assert.throws(() => canPlayerMoveTo(123));

    assert.throws(() => canNpcMoveTo(null));
    assert.throws(() => canNpcMoveTo(undefined));
    assert.throws(() => canNpcMoveTo('invalid'));
    assert.throws(() => canNpcMoveTo(123));

    // map が不正（null / 非オブジェクト / data, interactables, npcs が非配列）
    assert.throws(() => canPlayerMoveTo({ map: null, tileDb, gx: 1, gy: 1, tileSize: TILE_SIZE }));
    assert.throws(() => canPlayerMoveTo({ map: 'invalid', tileDb, gx: 1, gy: 1, tileSize: TILE_SIZE }));
    assert.throws(() => canPlayerMoveTo({ map: { ...map, data: null }, tileDb, gx: 1, gy: 1, tileSize: TILE_SIZE }));
    assert.throws(() => canPlayerMoveTo({ map: { ...map, interactables: {} }, tileDb, gx: 1, gy: 1, tileSize: TILE_SIZE }));
    assert.throws(() => canPlayerMoveTo({ map: { ...map, npcs: null }, tileDb, gx: 1, gy: 1, tileSize: TILE_SIZE }));

    assert.throws(() => canNpcMoveTo({ npc, map: null, tileDb, player, gx: 2, gy: 2, tileSize: TILE_SIZE }));
    assert.throws(() => canNpcMoveTo({ npc, map: { ...map, data: 'bad' }, tileDb, player, gx: 2, gy: 2, tileSize: TILE_SIZE }));
    assert.throws(() => canNpcMoveTo({ npc, map: { ...map, interactables: null }, tileDb, player, gx: 2, gy: 2, tileSize: TILE_SIZE }));
    assert.throws(() => canNpcMoveTo({ npc, map: { ...map, npcs: {} }, tileDb, player, gx: 2, gy: 2, tileSize: TILE_SIZE }));

    // tileDb が不正（null / 非オブジェクト / 配列）
    assert.throws(() => canPlayerMoveTo({ map, tileDb: null, gx: 1, gy: 1, tileSize: TILE_SIZE }));
    assert.throws(() => canPlayerMoveTo({ map, tileDb: 'invalid', gx: 1, gy: 1, tileSize: TILE_SIZE }));
    assert.throws(() => canPlayerMoveTo({ map, tileDb: [], gx: 1, gy: 1, tileSize: TILE_SIZE }));

    assert.throws(() => canNpcMoveTo({ npc, map, tileDb: null, player, gx: 2, gy: 2, tileSize: TILE_SIZE }));
    assert.throws(() => canNpcMoveTo({ npc, map, tileDb: 42, player, gx: 2, gy: 2, tileSize: TILE_SIZE }));
    assert.throws(() => canNpcMoveTo({ npc, map, tileDb: [], player, gx: 2, gy: 2, tileSize: TILE_SIZE }));

    // gx / gy が不正（文字列 / NaN / Infinity / undefined）
    for (const badCoord of ['1', NaN, Infinity, -Infinity, undefined, null]) {
      assert.throws(() => canPlayerMoveTo({ map, tileDb, gx: badCoord, gy: 1, tileSize: TILE_SIZE }));
      assert.throws(() => canPlayerMoveTo({ map, tileDb, gx: 1, gy: badCoord, tileSize: TILE_SIZE }));
      assert.throws(() => canNpcMoveTo({ npc, map, tileDb, player, gx: badCoord, gy: 2, tileSize: TILE_SIZE }));
      assert.throws(() => canNpcMoveTo({ npc, map, tileDb, player, gx: 2, gy: badCoord, tileSize: TILE_SIZE }));
    }

    // tileSize が不正（非数値 / 0以下）
    for (const badSize of ['64', NaN, Infinity, undefined, null, 0, -64]) {
      assert.throws(() => canPlayerMoveTo({ map, tileDb, gx: 1, gy: 1, tileSize: badSize }));
      assert.throws(() => canNpcMoveTo({ npc, map, tileDb, player, gx: 2, gy: 2, tileSize: badSize }));
    }

    // canNpcMoveTo 固有の npc / player 不正
    assert.throws(() => canNpcMoveTo({ npc: null, map, tileDb, player, gx: 2, gy: 2, tileSize: TILE_SIZE }));
    assert.throws(() => canNpcMoveTo({ npc: 'npc', map, tileDb, player, gx: 2, gy: 2, tileSize: TILE_SIZE }));
    assert.throws(() => canNpcMoveTo({ npc, map, tileDb, player: null, gx: 2, gy: 2, tileSize: TILE_SIZE }));
    assert.throws(() => canNpcMoveTo({ npc, map, tileDb, player: 123, gx: 2, gy: 2, tileSize: TILE_SIZE }));
  }

  // 13. 引数非破壊性（イミュータブル検証）
  {
    const tileDb = cloneTileDb();
    const map = createGridMap(7, 7, 5);
    map.interactables.push({
      type: 'sign',
      gridX: 2,
      gridY: 1,
      text: 'ここは ぶぐや です。'
    });
    const npc = createLighthousekeeper();
    const guard = createGuardPort();
    map.npcs.push(npc, guard);
    const player = createPlayer(1, 1);

    const tileDbBefore = JSON.parse(JSON.stringify(tileDb));
    const mapBefore = JSON.parse(JSON.stringify(map));
    const npcBefore = JSON.parse(JSON.stringify(npc));
    const playerBefore = JSON.parse(JSON.stringify(player));

    canPlayerMoveTo({ map, tileDb, gx: 3, gy: 3, tileSize: TILE_SIZE });
    canNpcMoveTo({ npc, map, tileDb, player, gx: 2, gy: 2, tileSize: TILE_SIZE });

    assert.deepStrictEqual(tileDb, tileDbBefore, 'tileDb must not be mutated');
    assert.deepStrictEqual(map, mapBefore, 'map must not be mutated');
    assert.deepStrictEqual(npc, npcBefore, 'npc must not be mutated');
    assert.deepStrictEqual(player, playerBefore, 'player must not be mutated');
  }
}

const isDirectExecution =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  typeof process.argv[1] === 'string' &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectExecution) {
  runCollisionSystemTests();
  console.log('[PASS] CollisionSystem unit tests succeeded.');
}