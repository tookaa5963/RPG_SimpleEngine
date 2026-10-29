// FILE_ENTRY: tools/test_inventory.mjs
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

let targetRelPath = './ai_staging/js/engine/state/Inventory.js';
if (process.argv.length > 2) {
  targetRelPath = process.argv[2];
}

const resolvedPath = path.resolve(process.cwd(), targetRelPath);
const moduleUrl = pathToFileURL(resolvedPath).href;

console.log(`[TEST RUNNER] Loading Inventory from: ${moduleUrl}`);

const { Inventory, DEFAULT_MAX_CAPACITY } = await import(moduleUrl);

let testsPassed = 0;
function test(name, fn) {
  try {
    fn();
    testsPassed += 1;
    console.log(`  OK: ${name}`);
  } catch (err) {
    console.error(`  FAIL: ${name}`);
    console.error(err);
    process.exit(1);
  }
}

console.log('[TEST SUITE] Starting Inventory Unit Tests...');

// 1. 初期化とデフォルト値
test('1.1: 初期化とデフォルト値', () => {
  const inv = new Inventory();
  assert.equal(inv.maxCapacity, DEFAULT_MAX_CAPACITY);
  assert.equal(inv.getTotalItemCount(), 0);
  assert.equal(inv.getBagCount(), 0);
  assert.equal(inv.getEquippedCount(), 0);
  assert.deepEqual(inv.getItems(), {});
  assert.deepEqual(inv.getEquipment(), { weapon: null, armor: null, shield: null });
});

test('1.2: オプション指定初期化', () => {
  const inv = new Inventory({
    maxCapacity: 20,
    initialItems: { herb: 3, stick: 1 },
    initialEquipment: { weapon: 'stick' }
  });
  assert.equal(inv.maxCapacity, 20);
  assert.equal(inv.getItemCount('herb'), 3);
  assert.equal(inv.getItemCount('stick'), 1);
  assert.equal(inv.getEquipment('weapon'), 'stick');
  assert.equal(inv.getEquippedCount(), 1);
  assert.equal(inv.getTotalItemCount(), 4);
  assert.equal(inv.getBagCount(), 3); // 4 - 1
});

// 2. 引数バリデーション（Tier 3）
test('2.1: constructor 引数型検証', () => {
  assert.throws(() => new Inventory('invalid'), TypeError);
  assert.throws(() => new Inventory(null), TypeError);
  assert.throws(() => new Inventory([]), TypeError);
  assert.throws(() => new Inventory({ maxCapacity: '12' }), TypeError);
  assert.throws(() => new Inventory({ maxCapacity: NaN }), RangeError);
  assert.throws(() => new Inventory({ maxCapacity: 12.5 }), RangeError);
  assert.throws(() => new Inventory({ maxCapacity: 0 }), RangeError);
  assert.throws(() => new Inventory({ maxCapacity: -1 }), RangeError);
  assert.throws(() => new Inventory({ eventBus: 'invalid' }), TypeError);
  assert.throws(() => new Inventory({ initialItems: null }), TypeError);
  assert.throws(() => new Inventory({ initialEquipment: [] }), TypeError);
});

// 3. addItem
test('3.1: addItem 正常系', () => {
  const inv = new Inventory();
  const c1 = inv.addItem('herb');
  assert.equal(c1, 1);
  assert.equal(inv.getItemCount('herb'), 1);

  const c2 = inv.addItem('herb', 2);
  assert.equal(c2, 3);
  assert.equal(inv.getItemCount('herb'), 3);

  inv.addItem('stick', 1);
  assert.equal(inv.getItemCount('stick'), 1);
  assert.equal(inv.getTotalItemCount(), 4);
});

test('3.2: addItem 異常系型・境界検証', () => {
  const inv = new Inventory();
  assert.throws(() => inv.addItem(123), TypeError);
  assert.throws(() => inv.addItem(''), Error);
  assert.throws(() => inv.addItem('   '), Error);
  assert.throws(() => inv.addItem('herb', '1'), TypeError);
  assert.throws(() => inv.addItem('herb', NaN), RangeError);
  assert.throws(() => inv.addItem('herb', 1.5), RangeError);
  assert.throws(() => inv.addItem('herb', 0), RangeError);
  assert.throws(() => inv.addItem('herb', -1), RangeError);
});

// 4. removeItem
test('4.1: removeItem 正常系', () => {
  const inv = new Inventory({ initialItems: { herb: 3 } });
  const r1 = inv.removeItem('herb', 1);
  assert.equal(r1, true);
  assert.equal(inv.getItemCount('herb'), 2);

  const r2 = inv.removeItem('herb', 2);
  assert.equal(r2, true);
  assert.equal(inv.getItemCount('herb'), 0);
  assert.equal('herb' in inv.getItems(), false); // 0でキー削除
});

test('4.2: removeItem 異常系・不足系', () => {
  const inv = new Inventory({ initialItems: { herb: 1 } });
  assert.equal(inv.removeItem('unknown', 1), false);
  assert.equal(inv.removeItem('herb', 2), false); // 不足
  assert.equal(inv.getItemCount('herb'), 1); // 変動なし

  assert.throws(() => inv.removeItem(null), TypeError);
  assert.throws(() => inv.removeItem(''), Error);
  assert.throws(() => inv.removeItem('herb', NaN), RangeError);
  assert.throws(() => inv.removeItem('herb', 0), RangeError);
  assert.throws(() => inv.removeItem('herb', -1), RangeError);
});

// 5. hasItem / getItemCount / getItems
test('5.1: 照会系メソッドと防御的コピー', () => {
  const inv = new Inventory({ initialItems: { herb: 2 } });
  assert.equal(inv.hasItem('herb', 1), true);
  assert.equal(inv.hasItem('herb', 2), true);
  assert.equal(inv.hasItem('herb', 3), false);
  assert.equal(inv.hasItem('stick', 1), false);

  const items = inv.getItems();
  items.herb = 999;
  items.fake = 100;
  assert.equal(inv.getItemCount('herb'), 2); // 内部が書き換わらないこと
  assert.equal(inv.getItemCount('fake'), 0);
});

// 6. 装備操作 (equip / unequip / getEquipment / isEquipped)
test('6.1: equip / unequip 正常系', () => {
  const inv = new Inventory({
    initialItems: { stick: 1, cloth_armor: 1, bronze_shield: 1 }
  });

  assert.equal(inv.equip('weapon', 'stick'), true);
  assert.equal(inv.equip('armor', 'cloth_armor'), true);
  assert.equal(inv.equip('shield', 'bronze_shield'), true);

  assert.equal(inv.getEquipment('weapon'), 'stick');
  assert.equal(inv.getEquipment('armor'), 'cloth_armor');
  assert.equal(inv.getEquipment('shield'), 'bronze_shield');
  assert.equal(inv.isEquipped('stick'), true);
  assert.equal(inv.isEquipped('cloth_armor'), true);
  assert.equal(inv.getEquippedCount(), 3);

  const prev = inv.unequip('weapon');
  assert.equal(prev, 'stick');
  assert.equal(inv.getEquipment('weapon'), null);
  assert.equal(inv.isEquipped('stick'), false);
  assert.equal(inv.getEquippedCount(), 2);
});

test('6.2: equip 異常系（未所持、不正スロット、多重装備不可）', () => {
  const inv = new Inventory({ initialItems: { stick: 1 } });

  assert.throws(() => inv.equip('weapon', 'legend_sword'), Error); // 未所持
  assert.throws(() => inv.equip('helmet', 'stick'), RangeError); // 不正スロット
  assert.throws(() => inv.equip(123, 'stick'), TypeError);
  assert.throws(() => inv.equip('weapon', ''), Error);

  inv.equip('weapon', 'stick');
  // stick は 1 つしか持っていないため shield に重複装備できない
  assert.throws(() => inv.equip('shield', 'stick'), Error);
});

test('6.3: アイテム全消費時の装備自動解除', () => {
  const inv = new Inventory({ initialItems: { stick: 1 } });
  inv.equip('weapon', 'stick');
  assert.equal(inv.getEquipment('weapon'), 'stick');

  inv.removeItem('stick', 1);
  assert.equal(inv.getItemCount('stick'), 0);
  assert.equal(inv.getEquipment('weapon'), null); // 自動解除されること
  assert.equal(inv.getEquippedCount(), 0);
});

test('6.4: getEquipment 防御的コピー', () => {
  const inv = new Inventory({ initialItems: { stick: 1 }, initialEquipment: { weapon: 'stick' } });
  const eq = inv.getEquipment();
  eq.weapon = 'hacked';
  assert.equal(inv.getEquipment('weapon'), 'stick');
});

// 7. 計算ロジック (getBagCount / isFull)
test('7.1: getBagCount 計算（装備品減算）', () => {
  // アイテム合計4個、装備2個 => バッグ占有数は 2
  const inv = new Inventory({
    initialItems: { herb: 2, stick: 1, cloth_armor: 1 },
    initialEquipment: { weapon: 'stick', armor: 'cloth_armor' }
  });
  assert.equal(inv.getTotalItemCount(), 4);
  assert.equal(inv.getEquippedCount(), 2);
  assert.equal(inv.getBagCount(), 2);
});

test('7.2: isFull 境界値検証 (maxCapacity = 12)', () => {
  const inv = new Inventory({
    maxCapacity: 12,
    initialItems: { herb: 12 }
  });
  // 未装備 12 個 => 占有数 12
  assert.equal(inv.getBagCount(), 12);
  assert.equal(inv.isFull(0), false); // 12 + 0 > 12 は false
  assert.equal(inv.isFull(1), true);  // 12 + 1 > 12 は true

  // 1個装備（杖）を追加
  inv.addItem('stick', 1);
  inv.equip('weapon', 'stick');
  // 総数 13, 装備 1 => 占有数は 12 のまま
  assert.equal(inv.getBagCount(), 12);
  assert.equal(inv.isFull(1), true);

  assert.throws(() => inv.isFull('1'), TypeError);
  assert.throws(() => inv.isFull(NaN), RangeError);
  assert.throws(() => inv.isFull(-1), RangeError);
});

// 8. シリアライズ (toJSON / fromJSON)
test('8.1: toJSON と fromJSON の完全復元', () => {
  const inv = new Inventory({
    maxCapacity: 15,
    initialItems: { herb: 5, stick: 2 },
    initialEquipment: { weapon: 'stick' }
  });

  const serialized = inv.toJSON();
  assert.deepEqual(serialized, {
    maxCapacity: 15,
    items: { herb: 5, stick: 2 },
    equipment: { weapon: 'stick', armor: null, shield: null }
  });

  const restored = new Inventory();
  restored.fromJSON(serialized);

  assert.equal(restored.maxCapacity, 15);
  assert.equal(restored.getItemCount('herb'), 5);
  assert.equal(restored.getItemCount('stick'), 2);
  assert.equal(restored.getEquipment('weapon'), 'stick');
  assert.equal(restored.getBagCount(), 6); // 7 - 1
});

// 9. イベント通知 (eventBus)
test('9.1: eventBus イベント発行検証', () => {
  const events = [];
  const dummyBus = {
    emit(event, payload) {
      events.push({ event, payload });
    }
  };

  const inv = new Inventory({ eventBus: dummyBus });
  inv.addItem('herb', 2);
  inv.equip('weapon', 'herb');
  inv.unequip('weapon');
  inv.removeItem('herb', 2);

  assert.equal(events.length, 4);
  assert.equal(events[0].event, 'item:added');
  assert.equal(events[1].event, 'equipment:equipped');
  assert.equal(events[2].event, 'equipment:unequipped');
  assert.equal(events[3].event, 'item:removed');
});

console.log(`\nAll ${testsPassed} Inventory unit tests passed successfully.`);