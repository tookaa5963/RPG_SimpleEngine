import assert from 'node:assert/strict';
import { MessageEffect } from '../js/engine/effects/MessageEffect.js';

console.log('--- MessageEffect Unit Tests ---');

const effect = new MessageEffect();

// 1. 正常系 1: 単一メッセージキーの解決
{
  const effectDef = {
    type: 'message',
    params: {
      messageKey: 'menu_action.charm_passive',
      consumeItem: false
    }
  };
  const result = effect.calculate(effectDef, {}, {});

  assert.equal(result.success, true);
  assert.equal(result.strategy, 'message');
  assert.deepEqual(result.messageKeys, ['menu_action.charm_passive']);
  assert.equal(result.consumeItem, false);
  assert.equal(result.reason, null);
  console.log('  ✓ 正常系 1: 単一メッセージキー解決');
}

// 2. 正常系 2: 複数行メッセージキーの解決
{
  const effectDef = {
    type: 'message',
    params: {
      messageKeys: ['menu_action.broken_hilt_1', 'menu_action.broken_hilt_2'],
      consumeItem: false
    }
  };
  const result = effect.calculate(effectDef, {}, {});

  assert.equal(result.success, true);
  assert.equal(result.strategy, 'message');
  assert.deepEqual(result.messageKeys, ['menu_action.broken_hilt_1', 'menu_action.broken_hilt_2']);
  assert.equal(result.consumeItem, false);
  assert.equal(result.reason, null);
  console.log('  ✓ 正常系 2: 複数行メッセージキー解決');
}

// 3. 正常系 3: consumeItem のデフォルト値（未指定時は false）
{
  const effectDef = {
    type: 'message',
    params: {
      messageKey: 'menu_action.charm_passive'
    }
  };
  const result = effect.calculate(effectDef, {}, {});

  assert.equal(result.consumeItem, false);
  console.log('  ✓ 正常系 3: consumeItem デフォルト値検証');
}

// 4. 異常系・境界値 1: メッセージ未指定に対するフェイルファスト
{
  assert.throws(() => effect.calculate({ type: 'message', params: {} }, {}, {}), Error);
  assert.throws(() => effect.calculate({ type: 'message', params: { messageKeys: [] } }, {}, {}), Error);
  console.log('  ✓ 異常系 1: メッセージ未指定フェイルファスト検証');
}

// 5. 異常系・境界値 2: 不正型に対するフェイルファスト
{
  assert.throws(() => effect.calculate(null, {}, {}), TypeError);
  assert.throws(() => effect.calculate({ type: 'invalid' }, {}, {}), Error);
  assert.throws(() => effect.calculate({ type: 'message', params: null }, {}, {}), TypeError);
  console.log('  ✓ 異常系 2: 不正型フェイルファスト検証');
}

console.log('MessageEffect tests passed.\n');