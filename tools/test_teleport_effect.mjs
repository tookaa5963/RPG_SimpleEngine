import assert from 'node:assert/strict';
import { TeleportEffect } from '../js/engine/effects/TeleportEffect.js';

console.log('--- TeleportEffect Unit Tests ---');

const effect = new TeleportEffect();

// 1. 正常系 1: 条件一致でのテレポート成功
{
  const effectDef = {
    type: 'teleport',
    params: {
      targetMap: 'temple',
      targetX: 11,
      targetY: 9,
      direction: 'up',
      isTeleport: true,
      allowedMapTypes: ['forest']
    }
  };
  const options = { currentMap: { id: 'forest', mapType: 'forest' } };
  const result = effect.calculate(effectDef, {}, {}, options);

  assert.equal(result.success, true);
  assert.equal(result.strategy, 'teleport');
  assert.equal(result.targetMap, 'temple');
  assert.equal(result.targetX, 11);
  assert.equal(result.targetY, 9);
  assert.equal(result.direction, 'up');
  assert.equal(result.isTeleport, true);
  assert.equal(result.reason, null);
  console.log('  ✓ 正常系 1: 条件一致テレポート成功');
}

// 2. 正常系 2: マップ条件未指定でのテレポート成功（デフォルト値補完）
{
  const effectDef = {
    type: 'teleport',
    params: {
      targetMap: 'first_town',
      targetX: 5,
      targetY: 5
    }
  };
  const options = { currentMap: { id: 'cave', mapType: 'dungeon' } };
  const result = effect.calculate(effectDef, {}, {}, options);

  assert.equal(result.success, true);
  assert.equal(result.strategy, 'teleport');
  assert.equal(result.targetMap, 'first_town');
  assert.equal(result.targetX, 5);
  assert.equal(result.targetY, 5);
  assert.equal(result.direction, 'down');
  assert.equal(result.isTeleport, true);
  assert.equal(result.reason, null);
  console.log('  ✓ 正常系 2: デフォルト補完テレポート成功');
}

// 3. 異常系・境界値 1: 使用不可エリア判定（INVALID_LOCATION）
{
  const effectDef = {
    type: 'teleport',
    params: {
      targetMap: 'temple',
      targetX: 11,
      targetY: 9,
      allowedMapTypes: ['forest']
    }
  };
  const options = { currentMap: { id: 'first_town', mapType: 'town' } };
  const result = effect.calculate(effectDef, {}, {}, options);

  assert.equal(result.success, false);
  assert.equal(result.strategy, 'teleport');
  assert.equal(result.reason, 'INVALID_LOCATION');
  console.log('  ✓ 異常系 1: 使用不可エリア判定');
}

// 4. 異常系・境界値 2: 進入禁止エリア判定（BLOCKED_LOCATION）
{
  const effectDef = {
    type: 'teleport',
    params: {
      targetMap: 'first_town',
      targetX: 5,
      targetY: 5,
      blockedMapTypes: ['dungeon']
    }
  };
  const options = { currentMap: { id: 'cave', mapType: 'dungeon' } };
  const result = effect.calculate(effectDef, {}, {}, options);

  assert.equal(result.success, false);
  assert.equal(result.strategy, 'teleport');
  assert.equal(result.reason, 'BLOCKED_LOCATION');
  console.log('  ✓ 異常系 2: 進入禁止エリア判定');
}

// 5. 異常系・境界値 3: 不正引数に対するフェイルファスト検証
{
  assert.throws(() => effect.calculate(null, {}, {}), TypeError);
  assert.throws(() => effect.calculate({ type: 'other' }, {}, {}), Error);
  assert.throws(() => effect.calculate({ type: 'teleport' }, {}, {}), TypeError);
  assert.throws(() => effect.calculate({ type: 'teleport', params: null }, {}, {}), TypeError);
  assert.throws(() => effect.calculate({ type: 'teleport', params: { targetMap: '' } }, {}, {}), Error);
  assert.throws(() => effect.calculate({ type: 'teleport', params: { targetMap: 'temple', targetX: -1, targetY: 0 } }, {}, {}), RangeError);
  assert.throws(() => effect.calculate({ type: 'teleport', params: { targetMap: 'temple', targetX: 0, targetY: NaN } }, {}, {}), RangeError);
  console.log('  ✓ 異常系 3: 不正引数フェイルファスト検証');
}

// 6. [TC-TP-DYN-01] 動的解決: escape_target 解決成功（リレミト正常系）
{
  const effectDef = {
    type: 'teleport',
    params: {
      targetType: 'escape_target'
    }
  };
  const options = {
    currentMap: {
      id: 'cave_b1',
      escapeTarget: {
        targetMap: 'first_island',
        targetX: 6,
        targetY: 10,
        direction: 'down'
      }
    }
  };
  const result = effect.calculate(effectDef, {}, {}, options);

  assert.equal(result.success, true);
  assert.equal(result.strategy, 'teleport');
  assert.equal(result.targetMap, 'first_island');
  assert.equal(result.targetX, 6);
  assert.equal(result.targetY, 10);
  assert.equal(result.direction, 'down');
  assert.equal(result.isTeleport, true);
  assert.equal(result.reason, null);
  console.log('  ✓ [TC-TP-DYN-01] escape_target 解決成功');
}

// 7. [TC-TP-DYN-02] 動的解決: return_point 解決成功（ルーラ正常系）
{
  const effectDef = {
    type: 'teleport',
    params: {
      targetType: 'return_point',
      blockedMapProperties: ['isDark', 'escapeTarget']
    }
  };
  const user = {
    returnPoint: {
      mapId: 'cottage',
      gridX: 3,
      gridY: 4,
      direction: 'up'
    }
  };
  const options = {
    currentMap: {
      id: 'field',
      isDark: false
    }
  };
  const result = effect.calculate(effectDef, user, {}, options);

  assert.equal(result.success, true);
  assert.equal(result.strategy, 'teleport');
  assert.equal(result.targetMap, 'cottage');
  assert.equal(result.targetX, 3);
  assert.equal(result.targetY, 4);
  assert.equal(result.direction, 'up');
  assert.equal(result.isTeleport, true);
  assert.equal(result.reason, null);
  console.log('  ✓ [TC-TP-DYN-02] return_point 解決成功');
}

// 8. [TC-TP-DYN-03] 動的解決: return_point direction 省略時の補完
{
  const effectDef = {
    type: 'teleport',
    params: {
      targetType: 'return_point'
    }
  };
  const user = {
    returnPoint: {
      mapId: 'cottage',
      gridX: 3,
      gridY: 4
    }
  };
  const options = { currentMap: {} };
  const result = effect.calculate(effectDef, user, {}, options);

  assert.equal(result.success, true);
  assert.equal(result.targetMap, 'cottage');
  assert.equal(result.targetX, 3);
  assert.equal(result.targetY, 4);
  assert.equal(result.direction, 'down');
  assert.equal(result.isTeleport, true);
  assert.equal(result.reason, null);
  console.log('  ✓ [TC-TP-DYN-03] return_point direction 省略時の補完');
}

// 9. [TC-TP-DYN-04] 動的解決: escape_target 未存在時の判定（NO_ESCAPE_TARGET）
{
  const effectDef = {
    type: 'teleport',
    params: {
      targetType: 'escape_target'
    }
  };
  // escapeTarget が null
  const res1 = effect.calculate(effectDef, {}, {}, { currentMap: { id: 'field', escapeTarget: null } });
  assert.equal(res1.success, false);
  assert.equal(res1.strategy, 'teleport');
  assert.equal(res1.reason, 'NO_ESCAPE_TARGET');

  // escapeTarget プロパティなし
  const res2 = effect.calculate(effectDef, {}, {}, { currentMap: { id: 'field' } });
  assert.equal(res2.success, false);
  assert.equal(res2.strategy, 'teleport');
  assert.equal(res2.reason, 'NO_ESCAPE_TARGET');

  // options 未指定 / currentMap なし
  const res3 = effect.calculate(effectDef, {}, {}, {});
  assert.equal(res3.success, false);
  assert.equal(res3.strategy, 'teleport');
  assert.equal(res3.reason, 'NO_ESCAPE_TARGET');
  console.log('  ✓ [TC-TP-DYN-04] escape_target 未存在時判定');
}

// 10. [TC-TP-DYN-05] 動的解決: return_point 未設定時の判定（NO_RETURN_POINT）
{
  const effectDef = {
    type: 'teleport',
    params: {
      targetType: 'return_point'
    }
  };
  // user.returnPoint が null
  const res1 = effect.calculate(effectDef, { returnPoint: null }, {}, { currentMap: {} });
  assert.equal(res1.success, false);
  assert.equal(res1.strategy, 'teleport');
  assert.equal(res1.reason, 'NO_RETURN_POINT');

  // user.returnPoint が未定義
  const res2 = effect.calculate(effectDef, {}, {}, { currentMap: {} });
  assert.equal(res2.success, false);
  assert.equal(res2.strategy, 'teleport');
  assert.equal(res2.reason, 'NO_RETURN_POINT');

  // user.returnPoint.mapId が空文字または未定義
  const res3 = effect.calculate(effectDef, { returnPoint: { mapId: '', gridX: 0, gridY: 0 } }, {}, { currentMap: {} });
  assert.equal(res3.success, false);
  assert.equal(res3.strategy, 'teleport');
  assert.equal(res3.reason, 'NO_RETURN_POINT');
  console.log('  ✓ [TC-TP-DYN-05] return_point 未設定時判定');
}

// 11. [TC-TP-DYN-06] 動的解決: blockedMapProperties 判定（暗闇マップでの使用禁止）
{
  const effectDef = {
    type: 'teleport',
    params: {
      targetType: 'return_point',
      blockedMapProperties: ['isDark', 'escapeTarget']
    }
  };
  const user = { returnPoint: { mapId: 'cottage', gridX: 3, gridY: 4 } };
  const options = { currentMap: { id: 'dark_cave', isDark: true } };
  const result = effect.calculate(effectDef, user, {}, options);

  assert.equal(result.success, false);
  assert.equal(result.strategy, 'teleport');
  assert.equal(result.reason, 'BLOCKED_LOCATION');
  console.log('  ✓ [TC-TP-DYN-06] blockedMapProperties 判定（isDark）');
}

// 12. [TC-TP-DYN-07] 動的解決: blockedMapProperties 判定（脱出先ありダンジョンでの使用禁止）
{
  const effectDef = {
    type: 'teleport',
    params: {
      targetType: 'return_point',
      blockedMapProperties: ['isDark', 'escapeTarget']
    }
  };
  const user = { returnPoint: { mapId: 'cottage', gridX: 3, gridY: 4 } };
  const options = {
    currentMap: {
      id: 'cave',
      escapeTarget: { targetMap: 'first_island', targetX: 6, targetY: 10 }
    }
  };
  const result = effect.calculate(effectDef, user, {}, options);

  assert.equal(result.success, false);
  assert.equal(result.strategy, 'teleport');
  assert.equal(result.reason, 'BLOCKED_LOCATION');
  console.log('  ✓ [TC-TP-DYN-07] blockedMapProperties 判定（escapeTarget）');
}

// 13. [TC-TP-DYN-08] 不正 targetType 指定時のフェイルファスト検証
{
  assert.throws(
    () => effect.calculate({ type: 'teleport', params: { targetType: 'unknown_type' } }, {}, {}),
    Error
  );
  console.log('  ✓ [TC-TP-DYN-08] 不正 targetType フェイルファスト検証');
}

console.log('TeleportEffect tests passed.\n');