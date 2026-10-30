// FILE_ENTRY: ai_staging/tools/test_player_actor_adapter.mjs
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { Player } from '../js/player.js';
import { logFormatter } from '../js/logFormatter.js';

// Node.js テスト環境用: logFormatter の player ドメイン同期登録
const playerLogPath = path.resolve('data/logs/player.json');
const playerLogData = JSON.parse(fs.readFileSync(playerLogPath, 'utf8'));
logFormatter.registerDomain('player', playerLogData);

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

console.log('--- Player Actor, Inventory & Serialization Adapter Gate 2 Test Start ---');

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
  p.damage(15);
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

test('13. Inventory 初期状態および Proxy 互換性', () => {
  const p = new Player();
  assert.ok(p.inventoryInstance);
  assert.equal(p.inventory.herb, 1);
  assert.equal(p.inventory.stick, 1);
  assert.equal(p.inventory.cloth_armor, 1);
  assert.equal(p.inventory.unknown_item, 0);
  assert.equal('herb' in p.inventory, true);
  assert.equal('unknown_item' in p.inventory, false);

  assert.equal(p.equipment.weapon, 'stick');
  assert.equal(p.equipment.armor, 'cloth_armor');
  assert.equal(p.equipment.shield, null);

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

  assert.equal(p.removeItem('herb', 1), false);
  assert.equal(p.removeItem('stick', 5), false);
  assert.equal(p.inventory.stick, 1);

  assert.equal(p.equipment.weapon, 'stick');
  assert.equal(p.removeItem('stick', 1), true);
  assert.equal(p.inventory.stick, 0);
  assert.equal(p.equipment.weapon, null);

  p.addItem('lantern', 1);
  p.isLanternLit = true;
  assert.equal(p.isLanternLit, true);
  p.removeItem('lantern', 1);
  assert.equal(p.isLanternLit, false);
});

test('16. getInventoryCount() および isInventoryFull() の容量境界判定', () => {
  const p = new Player();
  assert.equal(p.getInventoryCount(), 1);

  p.addItem('herb', 10);
  assert.equal(p.getInventoryCount(), 11);
  assert.equal(p.isInventoryFull(1), false);
  assert.equal(p.isInventoryFull(2), true);

  p.addItem('herb', 1);
  assert.equal(p.getInventoryCount(), 12);
  assert.equal(p.isInventoryFull(1), true);

  assert.throws(() => p.isInventoryFull('1'), /TypeError/);
  assert.throws(() => p.isInventoryFull(NaN), /RangeError/);
});

test('17. equip() / unequip() および equipment プロパティ直接アクセス・連動', () => {
  const p = new Player();
  p.addItem('bronze_sword', 1);
  p.addItem('leather_shield', 1);

  assert.equal(p.equip('weapon', 'bronze_sword'), true);
  assert.equal(p.equipment.weapon, 'bronze_sword');
  assert.equal(p.inventoryInstance.getEquipment('weapon'), 'bronze_sword');

  assert.equal(p.unequip('weapon'), 'bronze_sword');
  assert.equal(p.equipment.weapon, null);

  assert.equal(p.unequip('shield'), null);

  p.equipment.shield = 'leather_shield';
  assert.equal(p.equipment.shield, 'leather_shield');
  assert.equal(p.inventoryInstance.getEquipment('shield'), 'leather_shield');

  p.equipment.shield = null;
  assert.equal(p.equipment.shield, null);

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

test('19. ゴールド操作（addGold / useGold / gold setter / getter）および Actor 連動', () => {
  const p = new Player();
  assert.equal(p.gold, 0);
  assert.equal(p.actor.gold, 0);

  const g1 = p.addGold(150);
  assert.equal(g1, 150);
  assert.equal(p.gold, 150);
  assert.equal(p.actor.gold, 150);

  p.addGold(20.9);
  assert.equal(p.gold, 170);

  p.addGold(-50);
  assert.equal(p.gold, 170);

  assert.equal(p.useGold(70), true);
  assert.equal(p.gold, 100);
  assert.equal(p.actor.gold, 100);

  assert.equal(p.useGold(200), false);
  assert.equal(p.gold, 100);

  p.gold = 500;
  assert.equal(p.gold, 500);
  assert.equal(p.actor.gold, 500);

  assert.throws(() => p.addGold('100'), /TypeError/);
  assert.throws(() => p.addGold(NaN), /RangeError/);
  assert.throws(() => p.useGold('50'), /TypeError/);
  assert.throws(() => p.useGold(NaN), /RangeError/);
});

test('20. getRequiredExpForLevel() の委譲計算および境界バリデーション', () => {
  const p = new Player();
  assert.equal(p.getRequiredExpForLevel(1), 0);
  assert.equal(p.getRequiredExpForLevel(2), 10);
  assert.equal(p.getRequiredExpForLevel(3), 20);
  assert.equal(p.getRequiredExpForLevel(9), 1280);
  assert.equal(p.getRequiredExpForLevel(10), 2480);

  assert.throws(() => p.getRequiredExpForLevel('2'), /TypeError/);
  assert.throws(() => p.getRequiredExpForLevel(NaN), /RangeError/);
});

test('21. applyExpDeathPenalty() の委譲計算および境界バリデーション', () => {
  const p = new Player();
  p.level = 2;
  p.exp = 18;
  const lost = p.applyExpDeathPenalty(0.5);
  assert.equal(lost, 4);
  assert.equal(p.exp, 14);
  assert.equal(p.actor.exp, 14);

  assert.throws(() => p.applyExpDeathPenalty('0.5'), /TypeError/);
  assert.throws(() => p.applyExpDeathPenalty(NaN), /RangeError/);
});

test('22. addExp() によるレベルアップ、能力値成長、全快・毒解除、およびメッセージ返却', () => {
  const p = new Player();
  p.damage(10);
  p.isPoisoned = true;

  const msgs1 = p.addExp(5);
  assert.equal(msgs1.length, 0);
  assert.equal(p.exp, 5);
  assert.equal(p.level, 1);
  assert.equal(p.isPoisoned, true);

  const oldMaxHp = p.maxHp;
  const oldMaxMp = p.maxMp;
  const msgs2 = p.addExp(10);
  assert.equal(p.level, 2);
  assert.equal(p.actor.level, 2);
  assert.equal(p.maxHp > oldMaxHp, true);
  assert.equal(p.maxMp > oldMaxMp, true);

  assert.equal(p.hp, p.maxHp);
  assert.equal(p.mp, p.maxMp);
  assert.equal(p.isPoisoned, false);
  assert.equal(p.actor.hasStatusEffect('poison'), false);

  assert.equal(msgs2.length >= 2, true);
});

test('23. serialize() / deserialize() による level, exp, gold の完全復元', () => {
  const p = new Player();
  p.level = 4;
  p.exp = 350;
  p.gold = 1200;

  const data = p.serialize();
  assert.equal(data.level, 4);
  assert.equal(data.exp, 350);
  assert.equal(data.gold, 1200);

  const p2 = new Player();
  p2.deserialize(data);
  assert.equal(p2.level, 4);
  assert.equal(p2.exp, 350);
  assert.equal(p2.gold, 1200);
  assert.equal(p2.actor.level, 4);
  assert.equal(p2.actor.exp, 350);
  assert.equal(p2.actor.gold, 1200);
});

// --- Step 3-5d: 実機セーブデータによるシリアライズ統合累積テスト ---

const fixtureSlot1 = {
  level: 3, hp: 25, maxHp: 25, mp: 4, maxMp: 4, baseAtk: 10, baseDef: 7, spd: 8, exp: 21, gold: 6,
  spells: ["hoimi"],
  inventory: { herb: 2, stick: 1, cloth_armor: 1, torch: 5 },
  equipment: { weapon: "stick", armor: "cloth_armor", shield: null },
  remiraSteps: 0, torchSteps: 0, holyWaterSteps: 0, isLanternLit: false, isPoisoned: false,
  returnPoint: { mapId: "first_church", gridX: 3, gridY: 5, direction: "up" },
  flags: { talkedToSister: true, receivedSisterHerb: true }
};

const fixtureSlot2 = {
  level: 19, hp: 93, maxHp: 116, mp: 48, maxMp: 54, baseAtk: 52, baseDef: 33, spd: 29, exp: 26305, gold: 16419,
  spells: ["hoimi", "mera", "remira", "kiari", "rariho", "gira", "liremito", "mahoton", "behoimi", "toherosu", "rula", "begirama", "behoma"],
  inventory: { lantern: 1, pass: 1, sage_water: 7, forest_guide: 1, water_shield: 1, poison_charm: 1, corrada: 1, fire_charm: 1, dragon_armor: 1 },
  equipment: { weapon: "corrada", armor: "dragon_armor", shield: "water_shield" },
  remiraSteps: 0, torchSteps: 0, holyWaterSteps: 0, isLanternLit: true, isPoisoned: false,
  returnPoint: { mapId: "port_church", gridX: 3, gridY: 5, direction: "up" },
  flags: { talkedToSister: true, defeatedDragon: false }
};

test('24. 実機データ (序盤 slot_1) のデシリアライズと Actor/Inventory 整合性', () => {
  const p = new Player();
  p.deserialize(fixtureSlot1);

  assert.equal(p.level, 3);
  assert.equal(p.hp, 25);
  assert.equal(p.inventory.torch, 5);
  assert.equal(p.equipment.weapon, 'stick');

  assert.equal(p.actor.level, 3);
  assert.equal(p.actor.hp, 25);
  assert.equal(p.inventoryInstance.getItemCount('torch'), 5);
  assert.equal(p.inventoryInstance.getEquipment('weapon'), 'stick');
  assert.ok(p.spells.includes('hoimi'));
});

test('25. 実機データ (終盤 slot_2) のデシリアライズと Actor/Inventory 整合性', () => {
  const p = new Player();
  p.deserialize(fixtureSlot2);

  assert.equal(p.level, 19);
  assert.equal(p.hp, 93);
  assert.equal(p.maxHp, 116);
  assert.equal(p.inventory.sage_water, 7);
  assert.equal(p.equipment.shield, 'water_shield');

  assert.equal(p.actor.exp, 26305);
  assert.equal(p.inventoryInstance.getItemCount('corrada'), 1);
  assert.equal(p.inventoryInstance.getEquipment('armor'), 'dragon_armor');
  assert.equal(p.isLanternLit, true);
});

test('26. 再シリアライズ時の整合性検証', () => {
  const p = new Player();
  p.deserialize(fixtureSlot1);
  const data = p.serialize();

  assert.equal(data.level, fixtureSlot1.level);
  assert.equal(data.hp, fixtureSlot1.hp);
  assert.equal(data.maxHp, fixtureSlot1.maxHp);
  assert.equal(data.mp, fixtureSlot1.mp);
  assert.equal(data.maxMp, fixtureSlot1.maxMp);
  assert.equal(data.gold, fixtureSlot1.gold);
  assert.equal(data.exp, fixtureSlot1.exp);
  assert.equal(data.inventory.torch, 5);
  assert.equal(data.inventory.herb, 2);
  assert.equal(data.equipment.weapon, fixtureSlot1.equipment.weapon);
  assert.equal(data.equipment.armor, fixtureSlot1.equipment.armor);
  assert.equal(data.equipment.shield, fixtureSlot1.equipment.shield);
  assert.equal(data.isLanternLit, fixtureSlot1.isLanternLit);
  assert.equal(data.returnPoint.mapId, fixtureSlot1.returnPoint.mapId);
});

console.log(`--- All ${testsPassed} Tests Passed Successfully ---`);