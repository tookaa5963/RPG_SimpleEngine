/**
 * tools/test_headless_run.mjs
 * 完全ヘッドレス実証テスト（Core層統合実行シナリオ）
 * 
 * 目的:
 * ブラウザ環境（window, document, DOM要素, AudioContext 等）が存在しない純粋な Node.js ランタイムにおいて、
 * Core層モジュール（EngineEventBus, DataRepository, Actor, Inventory, EffectResolver, GenericFlags）が
 * 協調してゲーム進行サイクル（アクター生成、戦闘ダメージ計算、アイテム消費、効果解決、状態変更、フラグ管理、イベント通知）を
 * 正常に完走できることを機械的に実証する。
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { EngineEventBus } from '../js/engine/core/EngineEventBus.js';
import { EventTypes } from '../js/engine/core/EventTypes.js';
import { DataRepository } from '../js/engine/data/DataRepository.js';
import { Actor } from '../js/engine/entities/Actor.js';
import { EffectResolver } from '../js/engine/effects/EffectResolver.js';
import { Inventory } from '../js/engine/state/Inventory.js';
import GenericFlags from '../js/engine/state/GenericFlags.js';

console.log('=== [完全ヘッドレス実行実証テスト開始] ===');

let totalAssertions = 0;
function recordAssertion() {
  totalAssertions += 1;
}

// -------------------------------------------------------------
// 0. Core API 契約検証: EngineEventBus（インスタンス専用・DI規約）
// -------------------------------------------------------------
// static 呼び出しの禁止保証（大域状態・誤用の遮断）
assert.strictEqual(typeof EngineEventBus.on, 'undefined', '契約違反: EngineEventBus は static 呼び出しを禁止しています');
recordAssertion();

assert.strictEqual(typeof EngineEventBus.emit, 'undefined', '契約違反: EngineEventBus は static 呼び出しを禁止しています');
recordAssertion();

// インスタンスメソッドの存在保証
const contractBus = new EngineEventBus();
assert.strictEqual(typeof contractBus.on, 'function', '契約違反: EngineEventBus.prototype.on が存在しません');
recordAssertion();

assert.strictEqual(typeof contractBus.off, 'function', '契約違反: EngineEventBus.prototype.off が存在しません');
recordAssertion();

assert.strictEqual(typeof contractBus.emit, 'function', '契約違反: EngineEventBus.prototype.emit が存在しません');
recordAssertion();

assert.strictEqual(typeof contractBus.clear, 'function', '契約違反: EngineEventBus.prototype.clear が存在しません');
recordAssertion();

// -------------------------------------------------------------
// 1. 基盤初期化およびイベント記録リスナーの配線
// -------------------------------------------------------------
const eventBus = new EngineEventBus();
const capturedEvents = [];

const trackedEventTypes = [
  EventTypes.ACTOR.HP_CHANGED,
  EventTypes.ACTOR.MP_CHANGED,
  EventTypes.ACTOR.STATUS_ADDED,
  EventTypes.ACTOR.STATUS_REMOVED,
  EventTypes.ACTOR.DIED,
  'item:added',
  'item:removed'
];

for (let i = 0; i < trackedEventTypes.length; i += 1) {
  const evType = trackedEventTypes[i];
  eventBus.on(evType, (payload) => {
    capturedEvents.push({ type: evType, payload: payload });
  });
}

// -------------------------------------------------------------
// 2. マスターデータ登録（DataRepository）
// -------------------------------------------------------------
const dataRepo = new DataRepository();

const projectRoot = process.cwd();
const herbPath = path.resolve(projectRoot, 'data/items/i_herb.json');
const magicWaterPath = path.resolve(projectRoot, 'data/items/i_magic_water.json');

const herbData = JSON.parse(fs.readFileSync(herbPath, 'utf8'));
const magicWaterData = JSON.parse(fs.readFileSync(magicWaterPath, 'utf8'));

dataRepo.register('items', 'herb', herbData);
dataRepo.register('items', 'magic_water', magicWaterData);

assert.strictEqual(dataRepo.has('items', 'herb'), true);
recordAssertion();
assert.strictEqual(dataRepo.has('items', 'magic_water'), true);
recordAssertion();
assert.strictEqual(dataRepo.get('items', 'herb').effect.type, 'heal_hp');
recordAssertion();
assert.strictEqual(dataRepo.get('items', 'magic_water').effect.type, 'heal_mp');
recordAssertion();

// -------------------------------------------------------------
// 3. アクターモデルおよびインベントリの生成
// -------------------------------------------------------------
const player = new Actor({
  id: 'hero',
  name: '勇者',
  maxHp: 50,
  hp: 20,
  maxMp: 20,
  mp: 5,
  attack: 16,
  defense: 10,
  agility: 8
}, eventBus);

const monster = new Actor({
  id: 'slime',
  name: 'スライム',
  maxHp: 30,
  hp: 30,
  attack: 8,
  defense: 4,
  agility: 3
}, eventBus);

const inventory = new Inventory({
  maxCapacity: 10,
  eventBus: eventBus,
  initialItems: {
    herb: 2,
    magic_water: 1
  }
});

assert.strictEqual(player.hp, 20);
recordAssertion();
assert.strictEqual(player.mp, 5);
recordAssertion();
assert.strictEqual(monster.hp, 30);
recordAssertion();
assert.strictEqual(monster.isAlive, true);
recordAssertion();
assert.strictEqual(inventory.getItemCount('herb'), 2);
recordAssertion();
assert.strictEqual(inventory.getItemCount('magic_water'), 1);
recordAssertion();

// -------------------------------------------------------------
// 4. 戦闘サイクル（純粋計算およびダメージ適用）
// -------------------------------------------------------------
// ターン1: プレイヤーの攻撃（敵HP減算）
const damageDealt = monster.applyDamage(12);
assert.strictEqual(damageDealt, 12);
recordAssertion();
assert.strictEqual(monster.hp, 18);
recordAssertion();
assert.strictEqual(monster.isAlive, true);
recordAssertion();

// ターン2: プレイヤーの追撃（敵HP0および死亡イベント発生）
const lethalDamage = monster.applyDamage(20);
assert.strictEqual(lethalDamage, 18);
recordAssertion();
assert.strictEqual(monster.hp, 0);
recordAssertion();
assert.strictEqual(monster.isAlive, false);
recordAssertion();

// -------------------------------------------------------------
// 5. アイテム効果解決および適用（HP回復: herb）
// -------------------------------------------------------------
const effectResolver = new EffectResolver();

// インベントリから消費
assert.strictEqual(inventory.hasItem('herb', 1), true);
recordAssertion();
const itemRemoved = inventory.removeItem('herb', 1);
assert.strictEqual(itemRemoved, true);
recordAssertion();
assert.strictEqual(inventory.getItemCount('herb'), 1);
recordAssertion();

// EffectResolver による効果純粋計算
const registeredHerb = dataRepo.get('items', 'herb');
const hpEffectResult = effectResolver.resolve(registeredHerb.effect, player, player);

assert.strictEqual(hpEffectResult.success, true);
recordAssertion();
assert.strictEqual(hpEffectResult.strategy, 'heal_hp');
recordAssertion();
assert.strictEqual(hpEffectResult.effectiveAmount, 30);
recordAssertion();

// 計算結果をアクターに適用
const actualHealed = player.applyHeal(hpEffectResult.effectiveAmount);
assert.strictEqual(actualHealed, 30);
recordAssertion();
assert.strictEqual(player.hp, 50);
recordAssertion();

// -------------------------------------------------------------
// 6. アイテム効果解決および適用（MP回復: magic_water）
// -------------------------------------------------------------
assert.strictEqual(inventory.hasItem('magic_water', 1), true);
recordAssertion();
const mwRemoved = inventory.removeItem('magic_water', 1);
assert.strictEqual(mwRemoved, true);
recordAssertion();
assert.strictEqual(inventory.getItemCount('magic_water'), 0);
recordAssertion();

const registeredMagicWater = dataRepo.get('items', 'magic_water');
const mpEffectResult = effectResolver.resolve(registeredMagicWater.effect, player, player);

assert.strictEqual(mpEffectResult.success, true);
recordAssertion();
assert.strictEqual(mpEffectResult.strategy, 'heal_mp');
recordAssertion();
assert.strictEqual(mpEffectResult.effectiveAmount, 15);
recordAssertion();

const actualRecovered = player.recoverMp(mpEffectResult.effectiveAmount);
assert.strictEqual(actualRecovered, 15);
recordAssertion();
assert.strictEqual(player.mp, 20);
recordAssertion();

// -------------------------------------------------------------
// 7. 状態異常付与および解除サイクル
// -------------------------------------------------------------
const addStatusResult = player.addStatusEffect('poison');
assert.strictEqual(addStatusResult, true);
recordAssertion();
assert.strictEqual(player.hasStatusEffect('poison'), true);
recordAssertion();

const removeStatusResult = player.removeStatusEffect('poison');
assert.strictEqual(removeStatusResult, true);
recordAssertion();
assert.strictEqual(player.hasStatusEffect('poison'), false);
recordAssertion();

// -------------------------------------------------------------
// 8. 進行フラグ管理（GenericFlags）
// -------------------------------------------------------------
const flags = new GenericFlags();
assert.strictEqual(flags.get('first_battle_won'), false);
recordAssertion();

flags.set('first_battle_won', true);
assert.strictEqual(flags.get('first_battle_won'), true);
recordAssertion();

const flagDump = flags.getAll();
assert.deepStrictEqual(flagDump, { first_battle_won: true });
recordAssertion();

// -------------------------------------------------------------
// 9. イベント整合性検証
// -------------------------------------------------------------
const hpChangeEvents = capturedEvents.filter((e) => e.type === EventTypes.ACTOR.HP_CHANGED);
assert.strictEqual(hpChangeEvents.length, 3);
recordAssertion();

const deathEvents = capturedEvents.filter((e) => e.type === EventTypes.ACTOR.DIED);
assert.strictEqual(deathEvents.length, 1);
recordAssertion();
assert.strictEqual(deathEvents[0].payload.actorId, 'slime');
recordAssertion();

const itemRemovedEvents = capturedEvents.filter((e) => e.type === 'item:removed');
assert.strictEqual(itemRemovedEvents.length, 2);
recordAssertion();

const statusAddEvents = capturedEvents.filter((e) => e.type === EventTypes.ACTOR.STATUS_ADDED);
assert.strictEqual(statusAddEvents.length, 1);
recordAssertion();
assert.strictEqual(statusAddEvents[0].payload.statusId, 'poison');
recordAssertion();

const statusRemoveEvents = capturedEvents.filter((e) => e.type === EventTypes.ACTOR.STATUS_REMOVED);
assert.strictEqual(statusRemoveEvents.length, 1);
recordAssertion();
assert.strictEqual(statusRemoveEvents[0].payload.statusId, 'poison');
recordAssertion();

console.log(`[PASS] 全 ${totalAssertions} 項目すべてのアサーションに合格しました。`);
console.log('=== [完全ヘッドレス実行実証テスト正常終了] ===');
process.exit(0);