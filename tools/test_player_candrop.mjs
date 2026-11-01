/**
 * test_player_candrop.mjs
 * Gate 2: Player.canDropItem() の単体テスト
 */
import assert from 'node:assert/strict';
import { Player } from '../js/player.js';

console.log('--- Starting Gate 2: Player.canDropItem() Tests ---');

// 1. 初期化と基本インスタンス生成
const player = new Player();

// 2. 正常系: 通常アイテム（herb）の破棄可否
{
  const resultStr = player.canDropItem('herb');
  assert.equal(resultStr.canDrop, true, '通常アイテム（ID文字列）は破棄可能であること');
  assert.equal(resultStr.reason, null, '破棄可能時は reason が null であること');

  const resultObj = player.canDropItem({ id: 'herb', type: 'consumable' });
  assert.equal(resultObj.canDrop, true, '通常アイテム（オブジェクト）は破棄可能であること');
  assert.equal(resultObj.reason, null, '破棄可能時は reason が null であること');
}

// 3. 貴重品判定: key / keyItem
{
  const resultKey1 = player.canDropItem({ id: 'silver_key', type: 'key' });
  assert.equal(resultKey1.canDrop, false, 'type=key のアイテムは破棄不可であること');
  assert.equal(resultKey1.reason, 'key_item', '理由が key_item であること');

  const resultKey2 = player.canDropItem({ id: 'quest_item', type: 'keyItem' });
  assert.equal(resultKey2.canDrop, false, 'type=keyItem のアイテムは破棄不可であること');
  assert.equal(resultKey2.reason, 'key_item', '理由が key_item であること');
}

// 4. 装備中判定: 装備中のアイテムは破棄不可
{
  player.addItem('copper_sword', 1);
  player.equip('weapon', 'copper_sword');

  assert.equal(player.isEquipped('copper_sword'), true, 'copper_sword が装備中であること');

  const resultEquippedStr = player.canDropItem('copper_sword');
  assert.equal(resultEquippedStr.canDrop, false, '装備中のアイテム（ID文字列）は破棄不可であること');
  assert.equal(resultEquippedStr.reason, 'equipped', '理由が equipped であること');

  const resultEquippedObj = player.canDropItem({ id: 'copper_sword', type: 'weapon' });
  assert.equal(resultEquippedObj.canDrop, false, '装備中のアイテム（オブジェクト）は破棄不可であること');
  assert.equal(resultEquippedObj.reason, 'equipped', '理由が equipped であること');

  // 装備解除後は破棄可能
  player.unequip('weapon');
  assert.equal(player.isEquipped('copper_sword'), false, '装備解除されていること');

  const resultUnequipped = player.canDropItem({ id: 'copper_sword', type: 'weapon' });
  assert.equal(resultUnequipped.canDrop, true, '装備解除後は破棄可能であること');
  assert.equal(resultUnequipped.reason, null, '理由が null であること');
}

// 5. 異常系: 不正な引数の検証
{
  assert.throws(() => player.canDropItem(null), /TypeError/, 'null は TypeError となること');
  assert.throws(() => player.canDropItem(123), /TypeError/, 'number は TypeError となること');
  assert.throws(() => player.canDropItem([]), /TypeError/, '配列は TypeError となること');
  assert.throws(() => player.canDropItem(''), /EmptyStringError/, '空文字列は EmptyStringError となること');
  assert.throws(() => player.canDropItem({ id: 123 }), /TypeError/, 'item.id が文字列以外は TypeError となること');
  assert.throws(() => player.canDropItem({ id: '   ' }), /EmptyStringError/, 'item.id が空文字は EmptyStringError となること');
}

console.log('All Player.canDropItem() tests passed successfully (Exit Code 0).');
