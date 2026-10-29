import assert from 'node:assert/strict';
import { Player } from '../js/player.js';

let testsPassed = 0;
function test(name, fn) {
  try {
    fn();
    testsPassed++;
  } catch (err) {
    console.error(`FAIL: ${name}`);
    console.error(err);
    process.exit(1);
  }
}

console.log('--- Player Actor & Inventory Adapter Gate 2 Test Start ---');

test('1. 初期ステータスおよび Actor 内部整合性', () => {
  const p = new Player(3, 4, 64);
  assert.equal(p.hp, 15);
  assert.equal(p.maxHp, 15);
  assert.equal(p.mp, 0);
  assert.equal(p.maxMp, 0);
  assert.equal(p.isPoisoned, false);
  assert.equal(p.actor.id, 'player');
  assert.equal(p.actor.isAlive, true);
});

test('2. damage() 正常系・超過ダメージおよび致死判定', () => {
  const p = new Player();
  const d1 = p.damage(5);
  assert.equal(d1, 5);
  assert.equal(p.hp, 10);
  assert.equal(p.actor.hp, 10);

  const d2 = p.damage(20);
  assert.equal(d2, 10);
  assert.equal(p.hp, 0);
  assert.equal(p.actor.hp, 0);
  assert.equal(p.actor.isAlive, false);

  const d3 = p.damage(10);
  assert.equal(d3, 0);
  assert.equal(p.hp, 0);
});

test('3. damage() 不正引数バリデーション', () => {
  const p = new Player();
  assert.throws(() => p.damage('10'), /TypeError/);
  assert.throws(() => p.damage(NaN), /RangeError/);
  assert.equal(p.damage(0), 0);
  assert.equal(p.damage(-5), 0);
});

test('4. heal() 正常系・上限クランプおよび死亡中防護', () => {
  const p = new Player();
  p.damage(10); // hp = 5
  const h1 = p.heal(3);
  assert.equal(h1, 3);
  assert.equal(p.hp, 8);

  const h2 = p.heal(20);
  assert.equal(h2, 7);
  assert.equal(p.hp, 15);

  p.damage(15); // 死亡
  assert.equal(p.actor.isAlive, false);
  const h3 = p.heal(10);
  assert.equal(h3, 0);
  assert.equal(p.hp, 0);
});

test('5. heal() 不正引数バリデーション', () => {
  const p = new Player();
  assert.throws(() => p.heal('5'), /TypeError/);
  assert.throws(() => p.heal(NaN), /RangeError/);
  assert.equal(p.heal(0), 0);
  assert.equal(p.heal(-3), 0);
});

test('6. hp 直接代入セッター（ダメージ・回復・蘇生）', () => {
  const p = new Player();
  p.hp = 8;
  assert.equal(p.hp, 8);
  assert.equal(p.actor.hp, 8);

  p.hp = 12;
  assert.equal(p.hp, 12);

  p.hp = 0;
  assert.equal(p.hp, 0);
  assert.equal(p.actor.isAlive, false);

  // 死亡状態からの直接代入による蘇生
  p.hp = 10;
  assert.equal(p.hp, 10);
  assert.equal(p.actor.isAlive, true);
});

test('7. maxHp 直接代入セッターおよび Actor 同期', () => {
  const p = new Player();
  p.maxHp = 25;
  assert.equal(p.maxHp, 25);
  assert.equal(p.actor.maxHp, 25);
  assert.equal(p.hp, 15);

  p.heal(10);
  assert.equal(p.hp, 25);

  // 縮小時に現在HPが上限を超えないこと
  p.maxHp = 20;
  assert.equal(p.maxHp, 20);
  assert.equal(p.hp, 20);
  assert.equal(p.actor.hp, 20);
});

test('8. MP 操作系（maxMp, healMp, consumeMp, mp setter）', () => {
  const p = new Player();
  p.maxMp = 10;
  assert.equal(p.maxMp, 10);
  assert.equal(p.mp, 0);

  const r1 = p.healMp(6);
  assert.equal(r1, 6);
  assert.equal(p.mp, 6);

  const c1 = p.consumeMp(4);
  assert.equal(c1, true);
  assert.equal(p.mp, 2);

  const c2 = p.consumeMp(5);
  assert.equal(c2, false);
  assert.equal(p.mp, 2);

  p.mp = 8;
  assert.equal(p.mp, 8);
});

test('9. 毒フラグ（isPoisoned, curePoison）および Actor 状態異常連動', () => {
  const p = new Player();
  assert.equal(p.isPoisoned, false);
  assert.equal(p.actor.hasStatusEffect('poison'), false);

  p.isPoisoned = true;
  assert.equal(p.isPoisoned, true);
  assert.equal(p.actor.hasStatusEffect('poison'), true);

  p.curePoison();
  assert.equal(p.isPoisoned, false);
  assert.equal(p.actor.hasStatusEffect('poison'), false);
});

test('10. fullRecovery() による HP/MP 全快および死亡復帰', () => {
  const p = new Player();
  p.maxMp = 10;
  p.damage(15); // 死亡
  p.consumeMp(0);
  assert.equal(p.actor.isAlive, false);

  p.fullRecovery();
  assert.equal(p.hp, 15);
  assert.equal(p.mp, 10);
  assert.equal(p.actor.isAlive, true);
});

test('11. updateSteps() との毒ダメージ連携', () => {
  const p = new Player();
  p.isPoisoned = true;
  const res = p.updateSteps();
  assert.equal(res.poisonDamage >= 1, true);
  assert.equal(p.hp < 15, true);
});

test('12. serialize() および deserialize() の双方向復元性', () => {
  const p = new Player();
  p.maxHp = 30;
  p.hp = 22;
  p.maxMp = 12;
  p.mp = 8;
  p.isPoisoned = true;

  const data = p.serialize();
  assert.equal(data.maxHp, 30);
  assert.equal(data.hp, 22);
  assert.equal(data.maxMp, 12);
  assert.equal(data.mp, 8);
  assert.equal(data.isPoisoned, true);

  const p2 = new Player();
  p2.deserialize(data);
  assert.equal(p2.maxHp, 30);
  assert.equal(p2.hp, 22);
  assert.equal(p2.maxMp, 12);
  assert.equal(p2.mp, 8);
  assert.equal(p2.isPoisoned, true);
  assert.equal(p2.actor.maxHp, 30);
  assert.equal(p2.actor.hp, 22);
  assert.equal(p2.actor.hasStatusEffect('poison'), true);
});

// --- Step 3-5b: Inventory 委譲累積テスト ---

test('13. Inventory 初期状態および Proxy 互換性', () => {
  const p = new Player();
  assert.ok(p.inventoryInstance);
  assert.equal(p.inventory.herb, 1);
  assert.equal(p.inventory.stick, 1);
  assert.equal(p.inventory.cloth_armor, 1);
  assert.equal(p.inventory.unknown_item, 0);
  assert.equal('herb' in p.inventory, true);
  assert.equal('unknown_item' in p.inventory, false);

  // 装備の初期状態
  assert.equal(p.equipment.weapon, 'stick');
  assert.equal(p.equipment.armor, 'cloth_armor');
  assert.equal(p.equipment.shield, null);

  // バッグ占有数: 所持総数3 - 装備中2 = 1 (herbのみ)
  assert.equal(p.getInventoryCount(), 1);
  assert.equal(p.isInventoryFull(1), false);
});

test('14. addItem() 正常系・引数検証および Proxy 反映', () => {
  const p = new Player();
  const c1 = p.addItem('herb', 2);
  assert.equal(c1, 3);
  assert.equal(p.inventory.herb, 3);
  assert.equal(p.inventoryInstance.getItemCount('herb'), 3);

  const c2 = p.addItem('potion', 1);
  assert.equal(c2, 1);
  assert.equal(p.inventory.potion, 1);
  assert.equal('potion' in p.inventory, true);

  // バリデーション
  assert.throws(() => p.addItem(123), /TypeError/);
  assert.throws(() => p.addItem(''), /EmptyStringError/);
  assert.throws(() => p.addItem('herb', '1'), /TypeError/);
  assert.throws(() => p.addItem('herb', NaN), /RangeError/);
});

test('15. removeItem() 正常系・異常系・所持数0時装備自動解除・ランタン副作用', () => {
  const p = new Player();
  assert.equal(p.removeItem('herb', 1), true);
  assert.equal(p.inventory.herb, 0);
  assert.equal('herb' in p.inventory, false);

  // 未所持削除
  assert.equal(p.removeItem('herb', 1), false);

  // 数量超過削除
  assert.equal(p.removeItem('stick', 5), false);
  assert.equal(p.inventory.stick, 1);

  // 装備中アイテム（stick）を削除して個数0にした場合、装備が自動解除されること
  assert.equal(p.equipment.weapon, 'stick');
  assert.equal(p.removeItem('stick', 1), true);
  assert.equal(p.inventory.stick, 0);
  assert.equal(p.equipment.weapon, null);

  // ランタンの灯火連動
  p.addItem('lantern', 1);
  p.isLanternLit = true;
  assert.equal(p.isLanternLit, true);
  p.removeItem('lantern', 1);
  assert.equal(p.isLanternLit, false);
});

test('16. getInventoryCount() および isInventoryFull() の容量境界判定', () => {
  const p = new Player();
  // 初期: herb(1), stick(1, 装備中), cloth_armor(1, 装備中) -> bagCount = 1
  assert.equal(p.getInventoryCount(), 1);

  // 上限12個まで追加（残り11個空き）
  p.addItem('herb', 10); // herb合計11個 -> bagCount = 11
  assert.equal(p.getInventoryCount(), 11);
  assert.equal(p.isInventoryFull(1), false);
  assert.equal(p.isInventoryFull(2), true);

  p.addItem('herb', 1); // bagCount = 12 (満杯)
  assert.equal(p.getInventoryCount(), 12);
  assert.equal(p.isInventoryFull(1), true);

  // バリデーション
  assert.throws(() => p.isInventoryFull('1'), /TypeError/);
  assert.throws(() => p.isInventoryFull(NaN), /RangeError/);
});

test('17. equip() / unequip() および equipment プロパティ直接アクセス・連動', () => {
  const p = new Player();
  p.addItem('bronze_sword', 1);
  p.addItem('leather_shield', 1);

  // equip メソッド経由（成功時 true を返却）
  assert.equal(p.equip('weapon', 'bronze_sword'), true);
  assert.equal(p.equipment.weapon, 'bronze_sword');
  assert.equal(p.inventoryInstance.getEquipment('weapon'), 'bronze_sword');

  // unequip メソッド経由（解除されたアイテムID 'bronze_sword' を返却）
  assert.equal(p.unequip('weapon'), 'bronze_sword');
  assert.equal(p.equipment.weapon, null);

  // 未装備スロットの unequip（null を返却）
  assert.equal(p.unequip('shield'), null);

  // equipment Proxy 経由の直接代入
  p.equipment.shield = 'leather_shield';
  assert.equal(p.equipment.shield, 'leather_shield');
  assert.equal(p.inventoryInstance.getEquipment('shield'), 'leather_shield');

  p.equipment.shield = null;
  assert.equal(p.equipment.shield, null);

  // 未所持アイテムの装備試行（Proxy経由代入時は自動追加されて装備）
  p.equipment.weapon = 'iron_blade';
  assert.equal(p.equipment.weapon, 'iron_blade');
  assert.equal(p.inventory.iron_blade, 1);
});

test('18. serialize() / deserialize() によるインベントリ・装備完全復帰', () => {
  const p = new Player();
  p.addItem('magic_potion', 3);
  p.addItem('iron_shield', 1);
  p.equip('shield', 'iron_shield');

  const serialized = p.serialize();
  assert.equal(serialized.inventory.magic_potion, 3);
  assert.equal(serialized.equipment.shield, 'iron_shield');

  const p2 = new Player();
  p2.deserialize(serialized);

  assert.equal(p2.inventory.magic_potion, 3);
  assert.equal(p2.equipment.shield, 'iron_shield');
  assert.equal(p2.inventoryInstance.getItemCount('magic_potion'), 3);
  assert.equal(p2.inventoryInstance.getEquipment('shield'), 'iron_shield');
});

console.log(`--- All ${testsPassed} Tests Passed Successfully ---`);