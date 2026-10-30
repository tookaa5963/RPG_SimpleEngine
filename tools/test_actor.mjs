import path from 'path';
import { pathToFileURL } from 'url';

let rawTargetPath = './ai_staging/js/engine/entities/Actor.js';
if (process.argv[2] !== undefined && process.argv[2] !== '') {
  rawTargetPath = process.argv[2];
}

const resolvedPath = path.resolve(rawTargetPath);
const targetUrl = pathToFileURL(resolvedPath).href;

const { Actor } = await import(targetUrl);

let testsRun = 0;
let testsPassed = 0;

function assert(condition, message) {
  testsRun++;
  if (!condition) {
    console.error(`[FAIL] ${message}`);
    process.exit(1);
  }
  testsPassed++;
}

function assertThrows(fn, message) {
  testsRun++;
  let threw = false;
  try {
    fn();
  } catch (e) {
    threw = true;
  }
  if (!threw) {
    console.error(`[FAIL] Expected exception not thrown: ${message}`);
    process.exit(1);
  }
  testsPassed++;
}

// 疑似 EventBus
class MockEventBus {
  constructor() {
    this.events = [];
  }
  emit(eventName, payload) {
    this.events.push({ eventName, payload });
  }
}

console.log(`[TEST] Running Actor tests against: ${targetUrl}`);

// Test 1: 正常系 初期化と基本ゲッター
{
  const actor = new Actor({
    id: 'hero',
    name: '勇者',
    maxHp: 50,
    maxMp: 10,
    attack: 15,
    defense: 10,
    agility: 8
  });
  assert(actor.id === 'hero', 'actor.id should match');
  assert(actor.name === '勇者', 'actor.name should match');
  assert(actor.maxHp === 50, 'actor.maxHp should match');
  assert(actor.hp === 50, 'actor.hp should default to maxHp');
  assert(actor.maxMp === 10, 'actor.maxMp should match');
  assert(actor.mp === 10, 'actor.mp should default to maxMp');
  assert(actor.attack === 15, 'actor.attack should match');
  assert(actor.defense === 10, 'actor.defense should match');
  assert(actor.agility === 8, 'actor.agility should match');
  assert(actor.level === 1, 'actor.level should default to 1');
  assert(actor.exp === 0, 'actor.exp should default to 0');
  assert(actor.gold === 0, 'actor.gold should default to 0');
  assert(actor.isAlive === true, 'actor.isAlive should be true');
  assert(actor.statusEffects.length === 0, 'actor.statusEffects should default to empty');
}

// Test 2: 正常系 ダメージ・死亡・イベント通知
{
  const bus = new MockEventBus();
  const actor = new Actor({ id: 'p1', name: '戦士', maxHp: 30 }, bus);
  const dmg1 = actor.applyDamage(10);
  assert(dmg1 === 10, 'applyDamage should return actual damage');
  assert(actor.hp === 20, 'actor.hp should decrease by 10');
  assert(bus.events.length === 1, 'EventBus should receive 1 event');
  assert(bus.events[0].eventName === 'actor:hp_changed', 'Event should be actor:hp_changed');
  assert(bus.events[0].payload.delta === -10, 'Event delta should be -10');

  const dmg2 = actor.applyDamage(25);
  assert(dmg2 === 20, 'applyDamage should cap at current hp');
  assert(actor.hp === 0, 'actor.hp should reach 0');
  assert(actor.isAlive === false, 'actor.isAlive should be false');
  assert(bus.events.length === 3, 'EventBus should receive hp_changed and died');
  assert(bus.events[1].eventName === 'actor:hp_changed', 'Second event should be hp_changed');
  assert(bus.events[2].eventName === 'actor:died', 'Third event should be died');

  // 死亡後の追加ダメージ
  const dmg3 = actor.applyDamage(10);
  assert(dmg3 === 0, 'applyDamage on dead actor should return 0');
}

// Test 3: 正常系 回復・最大値キャップ・死亡時挙動
{
  const bus = new MockEventBus();
  const actor = new Actor({ id: 'p2', name: '僧侶', maxHp: 40, hp: 10 }, bus);
  const heal1 = actor.applyHeal(15);
  assert(heal1 === 15, 'applyHeal should return healed amount');
  assert(actor.hp === 25, 'actor.hp should increase to 25');
  assert(bus.events[0].payload.delta === 15, 'Event delta should be 15');

  const heal2 = actor.applyHeal(50);
  assert(heal2 === 15, 'applyHeal should cap at maxHp');
  assert(actor.hp === 40, 'actor.hp should be maxHp');

  // 死亡時は回復不可
  actor.applyDamage(40);
  bus.events = [];
  const healDead = actor.applyHeal(20);
  assert(healDead === 0, 'applyHeal on dead actor should return 0');
  assert(actor.hp === 0, 'dead actor hp should remain 0');
}

// Test 4: 正常系 MP消費・回復
{
  const bus = new MockEventBus();
  const actor = new Actor({ id: 'm1', name: '魔法使い', maxHp: 20, maxMp: 15 }, bus);
  const consumeOk = actor.consumeMp(5);
  assert(consumeOk === true, 'consumeMp with sufficient mp should return true');
  assert(actor.mp === 10, 'actor.mp should be 10');

  const consumeFail = actor.consumeMp(15);
  assert(consumeFail === false, 'consumeMp with insufficient mp should return false');
  assert(actor.mp === 10, 'actor.mp should remain unchanged on failure');

  const rec = actor.recoverMp(10);
  assert(rec === 5, 'recoverMp should cap at maxMp');
  assert(actor.mp === 15, 'actor.mp should be restored to maxMp');
}

// Test 5: 正常系 蘇生 (revive)
{
  const actor = new Actor({ id: 'p3', name: '騎士', maxHp: 50, hp: 0 });
  assert(actor.isAlive === false, 'Initial state should be dead');
  const revOk = actor.revive(30);
  assert(revOk === true, 'revive on dead actor should succeed');
  assert(actor.isAlive === true, 'actor should now be alive');
  assert(actor.hp === 30, 'actor.hp should be 30');

  const revFail = actor.revive(20);
  assert(revFail === false, 'revive on alive actor should fail');
}

// Test 6: 正常系 状態異常
{
  const bus = new MockEventBus();
  const actor = new Actor({ id: 'p4', name: '盗賊', maxHp: 30 }, bus);
  assert(actor.addStatusEffect('poison') === true, 'addStatusEffect should return true');
  assert(actor.hasStatusEffect('poison') === true, 'hasStatusEffect should return true');
  assert(actor.addStatusEffect('poison') === false, 'duplicate status should return false');
  assert(bus.events[0].eventName === 'actor:status_added', 'Event should be status_added');

  assert(actor.removeStatusEffect('poison') === true, 'removeStatusEffect should return true');
  assert(actor.hasStatusEffect('poison') === false, 'hasStatusEffect should return false');
  assert(actor.removeStatusEffect('poison') === false, 'removing non-existent status should return false');

  actor.addStatusEffect('sleep');
  actor.addStatusEffect('paralysis');
  actor.clearStatusEffects();
  assert(actor.statusEffects.length === 0, 'clearStatusEffects should empty list');
}

// Test 7: 正常系 toJSON / fromJSON
{
  const actor = new Actor({
    id: 'save_test',
    name: '記録者',
    maxHp: 100,
    hp: 80,
    maxMp: 20,
    mp: 15,
    attack: 30,
    defense: 25,
    agility: 12,
    level: 3,
    exp: 150,
    gold: 320,
    statusEffects: ['curse']
  });
  const json = actor.toJSON();
  const restored = Actor.fromJSON(json);
  assert(restored.id === 'save_test', 'Restored id should match');
  assert(restored.name === '記録者', 'Restored name should match');
  assert(restored.hp === 80, 'Restored hp should match');
  assert(restored.mp === 15, 'Restored mp should match');
  assert(restored.level === 3, 'Restored level should match');
  assert(restored.exp === 150, 'Restored exp should match');
  assert(restored.gold === 320, 'Restored gold should match');
  assert(restored.hasStatusEffect('curse') === true, 'Restored status should match');
}

// Test 8: 異常系 バリデーション検証
{
  assertThrows(() => new Actor(null), 'null params should throw');
  assertThrows(() => new Actor({ id: '', name: 'test', maxHp: 10 }), 'empty id should throw');
  assertThrows(() => new Actor({ id: 't', name: '', maxHp: 10 }), 'empty name should throw');
  assertThrows(() => new Actor({ id: 't', name: 't', maxHp: 0 }), 'maxHp <= 0 should throw');
  assertThrows(() => new Actor({ id: 't', name: 't', maxHp: 10, hp: -1 }), 'negative hp should throw');
  assertThrows(() => new Actor({ id: 't', name: 't', maxHp: 10, hp: 20 }), 'hp > maxHp should throw');
  assertThrows(() => new Actor({ id: 't', name: 't', maxHp: 10 }, { emit: 'not a function' }), 'invalid eventBus should throw');

  const actor = new Actor({ id: 'v', name: 'valid', maxHp: 20 });
  assertThrows(() => actor.applyDamage(0), 'damage <= 0 should throw');
  assertThrows(() => actor.applyDamage('10'), 'damage string should throw');
  assertThrows(() => actor.applyHeal(-5), 'heal < 0 should throw');
  assertThrows(() => actor.consumeMp(-1), 'consume negative mp should throw');
  assertThrows(() => actor.addStatusEffect(''), 'empty statusId should throw');
}

// Test 9: 正常系 ゴールド操作（addGold / useGold）
{
  const actor = new Actor({ id: 'gold_test', name: '商人', maxHp: 20, gold: 100 });
  assert(actor.gold === 100, 'initial gold should match');

  const g1 = actor.addGold(50);
  assert(g1 === 150, 'addGold should return new total');
  assert(actor.gold === 150, 'actor.gold should be updated');

  // 小数点の切り捨て加算
  actor.addGold(10.8);
  assert(actor.gold === 160, 'addGold should floor amount');

  // 負数加算は0扱い
  actor.addGold(-20);
  assert(actor.gold === 160, 'negative addGold should be clamped to 0');

  // 消費成功
  const ok1 = actor.useGold(60);
  assert(ok1 === true, 'useGold should succeed when funds are sufficient');
  assert(actor.gold === 100, 'gold should decrease after useGold');

  // 残高不足
  const ok2 = actor.useGold(150);
  assert(ok2 === false, 'useGold should return false when funds are insufficient');
  assert(actor.gold === 100, 'gold should remain unchanged on insufficient funds');

  // setGold による直接更新
  actor.setGold(500);
  assert(actor.gold === 500, 'setGold should update gold');
}

// Test 10: 正常系 必要経験値計算およびデスペナルティ計算
{
  const actor = new Actor({ id: 'exp_test', name: '見習い', maxHp: 20, level: 1, exp: 0 });
  assert(actor.getRequiredExpForLevel(1) === 0, 'reqExp level 1 should be 0');
  assert(actor.getRequiredExpForLevel(2) === 10, 'reqExp level 2 should be 10');
  assert(actor.getRequiredExpForLevel(3) === 20, 'reqExp level 3 should be 20');
  assert(actor.getRequiredExpForLevel(9) === 1280, 'reqExp level 9 should be 1280');
  assert(actor.getRequiredExpForLevel(10) === 2480, 'reqExp level 10 should be 2480');

  // デスペナルティ計算
  actor.setLevel(2);
  actor.setExp(18); // level 2 base is 10. surplus = 8. lost = floor(8 * 0.5) = 4
  const lost = actor.applyExpDeathPenalty(0.5);
  assert(lost === 4, 'lostExp should be 4');
  assert(actor.exp === 14, 'exp after penalty should be 14');
}

// Test 11: 正常系 経験値加算・レベルアップ・ステータス成長・全快・毒解除
{
  const actor = new Actor({
    id: 'hero_growth',
    name: '成長勇者',
    maxHp: 20,
    hp: 5,
    maxMp: 10,
    mp: 2,
    attack: 8,
    defense: 6,
    agility: 4,
    level: 1,
    exp: 0,
    statusEffects: ['poison']
  });

  // レベルアップしない経験値加算
  const res1 = actor.addExp(5);
  assert(res1.leveledUp === false, 'should not level up yet');
  assert(actor.exp === 5, 'exp should be 5');
  assert(actor.level === 1, 'level should remain 1');

  // 固定成長関数を用いたレベルアップ（level 2への必要累積expは10）
  const fixedGrowth = (lvl) => ({
    hp: 6,
    mp: 4,
    attack: 3,
    defense: 2,
    agility: 1
  });
  const res2 = actor.addExp(10, fixedGrowth); // exp becomes 15 (>= 10)
  assert(res2.leveledUp === true, 'should level up');
  assert(res2.oldLevel === 1, 'oldLevel should be 1');
  assert(res2.newLevel === 2, 'newLevel should be 2');
  assert(res2.statGains.hp === 6, 'statGains.hp should match fixedGrowth');
  assert(actor.maxHp === 26, 'maxHp should increase by 6');
  assert(actor.maxMp === 14, 'maxMp should increase by 4');
  assert(actor.attack === 11, 'attack should increase by 3');
  assert(actor.defense === 8, 'defense should increase by 2');
  assert(actor.agility === 5, 'agility should increase by 1');

  // 副作用: HP・MP全快および毒解除
  assert(actor.hp === 26, 'hp should be fully restored to maxHp');
  assert(actor.mp === 14, 'mp should be fully restored to maxMp');
  assert(actor.hasStatusEffect('poison') === false, 'poison should be cured upon level up');
}

// Test 12: 正常系 連続レベルアップ
{
  const actor = new Actor({ id: 'fast_hero', name: '俊足', maxHp: 20, level: 1, exp: 0 });
  // level 3 への到達必要expは20。一気に25投入
  const fixedGrowth = () => ({ hp: 5, mp: 3, attack: 2, defense: 1, agility: 1 });
  const res = actor.addExp(25, fixedGrowth);
  assert(res.leveledUp === true, 'should level up');
  assert(res.newLevel === 3, 'newLevel should be 3');
  assert(res.statGains.hp === 10, 'statGains.hp should be 10 (2 levels)');
  assert(actor.maxHp === 30, 'maxHp should be 30');
}

// Test 13: 異常系 バリデーション
{
  assertThrows(() => new Actor({ id: 't', name: 't', maxHp: 10, level: 0 }), 'level < 1 should throw');
  assertThrows(() => new Actor({ id: 't', name: 't', maxHp: 10, exp: -1 }), 'negative exp should throw');
  assertThrows(() => new Actor({ id: 't', name: 't', maxHp: 10, gold: -1 }), 'negative gold should throw');

  const actor = new Actor({ id: 't', name: 't', maxHp: 10 });
  assertThrows(() => actor.setLevel(0), 'setLevel < 1 should throw');
  assertThrows(() => actor.setExp(-1), 'setExp < 0 should throw');
  assertThrows(() => actor.setGold(-1), 'setGold < 0 should throw');
  assertThrows(() => actor.addGold('10'), 'addGold non-number should throw');
  assertThrows(() => actor.addGold(NaN), 'addGold NaN should throw');
  assertThrows(() => actor.useGold(-5), 'useGold negative should throw');
  assertThrows(() => actor.getRequiredExpForLevel('2'), 'getRequiredExpForLevel non-number should throw');
  assertThrows(() => actor.applyExpDeathPenalty('0.5'), 'applyExpDeathPenalty non-number should throw');
  assertThrows(() => actor.addExp('10'), 'addExp non-number should throw');
}

console.log(`[PASS] All ${testsPassed}/${testsRun} assertions passed.`);
process.exit(0);