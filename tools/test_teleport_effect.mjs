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

console.log('TeleportEffect tests passed.\n');