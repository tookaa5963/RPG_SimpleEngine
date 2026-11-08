// FILE_ENTRY: tools/test_headless_run.mjs
/**
 * tools/test_headless_run.mjs
 * 完全ヘッドレス実証テスト（Core層統合実行シナリオ）
 * 
 * 目的:
 * ブラウザ環境（window, document, DOM要素, AudioContext 等）が存在しない純粋な Node.js ランタイムにおいて、
 * Core層モジュール（EngineEventBus, DataRepository, Actor, Inventory, EffectResolver, GenericFlags, ActionTypes, EventTypes, BattleCalculator）が
 * 協調してゲーム進行サイクル（アクター生成、戦闘ダメージ計算、アイテム消費、効果解決、状態変更、フラグ管理、イベント通知、契約検証）を
 * 正常に完走できることを機械的に実証する。
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

import { EngineEventBus } from '../js/engine/core/EngineEventBus.js';
import { ActionTypes } from '../js/engine/core/ActionTypes.js';
import { EventTypes } from '../js/engine/core/EventTypes.js';
import { DataRepository } from '../js/engine/data/DataRepository.js';
import { Actor } from '../js/engine/entities/Actor.js';
import { EffectResolver } from '../js/engine/effects/EffectResolver.js';
import { Inventory } from '../js/engine/state/Inventory.js';
import GenericFlags from '../js/engine/state/GenericFlags.js';
import { runRewardCalculatorTests } from './test_reward_calculator.mjs';
import { runBattleStateMachineTests } from './test_battle_state_machine.mjs';
import { runBattleRendererTests } from './test_battle_renderer.mjs';
import { runNpcActiveStateTests } from './test_npc_active_state.mjs';
import { runBattleDoubleSubmitTests } from './test_battle_double_submit.mjs';
import { runNpcMovementControlTests } from './test_npc_movement_control.mjs';
import { runCollisionSystemTests } from './test_collision_system.mjs';
import { runEncounterCalculatorTests } from './test_encounter_calculator.mjs';
import { runMapTransitionEventTests } from './test_map_transition_event.mjs';
import { runFieldRendererTests } from './test_field_renderer.mjs';
import { runMenuEventDecouplingTests } from './test_menu_event_decoupling.mjs';

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

// -------------------------------------------------------------
// 10. 新規効果計算ストラテジー検証（teleport, message）
// -------------------------------------------------------------
// 10-1. TeleportEffect のディスパッチ検証（正常系: 条件一致）
const teleportDef = {
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
const teleportSuccessResult = effectResolver.resolve(teleportDef, player, player, {
  currentMap: { id: 'forest', mapType: 'forest' }
});
assert.strictEqual(teleportSuccessResult.success, true);
recordAssertion();
assert.strictEqual(teleportSuccessResult.strategy, 'teleport');
recordAssertion();
assert.strictEqual(teleportSuccessResult.targetMap, 'temple');
recordAssertion();
assert.strictEqual(teleportSuccessResult.targetX, 11);
recordAssertion();
assert.strictEqual(teleportSuccessResult.targetY, 9);
recordAssertion();
assert.strictEqual(teleportSuccessResult.direction, 'up');
recordAssertion();
assert.strictEqual(teleportSuccessResult.isTeleport, true);
recordAssertion();

// 10-2. TeleportEffect のディスパッチ検証（異常系: 条件不一致）
const teleportFailResult = effectResolver.resolve(teleportDef, player, player, {
  currentMap: { id: 'first_town', mapType: 'town' }
});
assert.strictEqual(teleportFailResult.success, false);
recordAssertion();
assert.strictEqual(teleportFailResult.strategy, 'teleport');
recordAssertion();
assert.strictEqual(teleportFailResult.reason, 'INVALID_LOCATION');
recordAssertion();

// 10-3. MessageEffect のディスパッチ検証
const messageDef = {
  type: 'message',
  params: {
    messageKeys: ['menu_action.broken_hilt_1', 'menu_action.broken_hilt_2'],
    consumeItem: false
  }
};
const messageResult = effectResolver.resolve(messageDef, player, player);
assert.strictEqual(messageResult.success, true);
recordAssertion();
assert.strictEqual(messageResult.strategy, 'message');
recordAssertion();
assert.deepStrictEqual(messageResult.messageKeys, ['menu_action.broken_hilt_1', 'menu_action.broken_hilt_2']);
recordAssertion();
assert.strictEqual(messageResult.consumeItem, false);
recordAssertion();
assert.strictEqual(messageResult.reason, null);
recordAssertion();

// 10-4. TeleportEffect のディスパッチ検証（動的解決: escape_target 成功）
const teleportEscapeDef = {
  type: 'teleport',
  params: {
    targetType: 'escape_target'
  }
};
const teleportEscapeResult = effectResolver.resolve(teleportEscapeDef, player, player, {
  currentMap: {
    id: 'cave_b1',
    escapeTarget: {
      targetMap: 'first_island',
      targetX: 6,
      targetY: 10,
      direction: 'down'
    }
  }
});
assert.strictEqual(teleportEscapeResult.success, true);
recordAssertion();
assert.strictEqual(teleportEscapeResult.strategy, 'teleport');
recordAssertion();
assert.strictEqual(teleportEscapeResult.targetMap, 'first_island');
recordAssertion();
assert.strictEqual(teleportEscapeResult.targetX, 6);
recordAssertion();
assert.strictEqual(teleportEscapeResult.targetY, 10);
recordAssertion();
assert.strictEqual(teleportEscapeResult.direction, 'down');
recordAssertion();
assert.strictEqual(teleportEscapeResult.isTeleport, true);
recordAssertion();

// 10-5. TeleportEffect のディスパッチ検証（動的解決: return_point 成功）
const teleportReturnDef = {
  type: 'teleport',
  params: {
    targetType: 'return_point',
    blockedMapProperties: ['isDark', 'escapeTarget']
  }
};
const returnPlayer = {
  returnPoint: {
    mapId: 'cottage',
    gridX: 3,
    gridY: 4,
    direction: 'up'
  }
};
const teleportReturnResult = effectResolver.resolve(teleportReturnDef, returnPlayer, returnPlayer, {
  currentMap: {
    id: 'field',
    isDark: false
  }
});
assert.strictEqual(teleportReturnResult.success, true);
recordAssertion();
assert.strictEqual(teleportReturnResult.strategy, 'teleport');
recordAssertion();
assert.strictEqual(teleportReturnResult.targetMap, 'cottage');
recordAssertion();
assert.strictEqual(teleportReturnResult.targetX, 3);
recordAssertion();
assert.strictEqual(teleportReturnResult.targetY, 4);
recordAssertion();
assert.strictEqual(teleportReturnResult.direction, 'up');
recordAssertion();
assert.strictEqual(teleportReturnResult.isTeleport, true);
recordAssertion();

// 10-6. TeleportEffect のディスパッチ検証（動的解決: blockedMapProperties 使用禁止）
const teleportBlockedResult = effectResolver.resolve(teleportReturnDef, returnPlayer, returnPlayer, {
  currentMap: {
    id: 'dark_cave',
    isDark: true
  }
});
assert.strictEqual(teleportBlockedResult.success, false);
recordAssertion();
assert.strictEqual(teleportBlockedResult.strategy, 'teleport');
recordAssertion();
assert.strictEqual(teleportBlockedResult.reason, 'BLOCKED_LOCATION');
recordAssertion();

// -------------------------------------------------------------
// 11. 通信プロトコル契約検証（ActionTypes / EventTypes）
// -------------------------------------------------------------
assert.strictEqual(
  Object.isFrozen(ActionTypes) &&
  Object.isFrozen(ActionTypes.PLAYER) &&
  Object.isFrozen(ActionTypes.MENU) &&
  Object.isFrozen(ActionTypes.BATTLE) &&
  Object.isFrozen(ActionTypes.SYSTEM) &&
  typeof EventTypes.SYSTEM.REQUEST_MAP_CHANGE === 'undefined' &&
  typeof EventTypes.SYSTEM.REQUEST_SLOT_DIALOG === 'undefined' &&
  typeof EventTypes.SYSTEM.REQUEST_RETURN_TITLE === 'undefined',
  true,
  '契約違反: 通信プロトコル（ActionTypes / EventTypes）の凍結またはクレンジング要件を満たしていません'
);
recordAssertion();

// -------------------------------------------------------------
// 12. モンスターデータ整合性および経験値計算境界値検証
// -------------------------------------------------------------
try {
  execSync('node tools/test_monster_boss_flags.mjs', { stdio: 'inherit' });
  recordAssertion();
} catch (error) {
  assert.fail('契約違反: tools/test_monster_boss_flags.mjs の検証に失敗しました');
}

// -------------------------------------------------------------
// 13. 戦闘数値計算純粋モジュール単体検証（BattleCalculator）
// -------------------------------------------------------------
try {
  execSync('node tools/test_battle_calculator.mjs', { stdio: 'inherit' });
  recordAssertion();
} catch (error) {
  assert.fail('契約違反: tools/test_battle_calculator.mjs の検証に失敗しました');
}
// -------------------------------------------------------------
// 14. 報酬計算純粋モジュール単体検証（RewardCalculator）
// -------------------------------------------------------------
try {
  runRewardCalculatorTests();
  recordAssertion();
} catch (error) {
  assert.fail('契約違反: tools/test_reward_calculator.mjs の検証に失敗しました: ' + error.message);
}
// -------------------------------------------------------------
// 15. 戦闘ステートマシン純粋モジュール単体検証（BattleStateMachine）
// -------------------------------------------------------------
try {
  runBattleStateMachineTests();
  recordAssertion();
} catch (error) {
  assert.fail('契約違反: tools/test_battle_state_machine.mjs の検証に失敗しました: ' + error.message);
}
// -------------------------------------------------------------
// 16. 戦闘描画ドライバ単体検証（BattleRenderer）
// -------------------------------------------------------------
try {
  runBattleRendererTests();
  recordAssertion();
} catch (error) {
  assert.fail('契約違反: tools/test_battle_renderer.mjs の検証に失敗しました: ' + error.message);
}
// -------------------------------------------------------------
// 17. シナリオNPCアクティブ判定純粋関数単体検証（evaluateNpcActiveState）
// -------------------------------------------------------------
try {
  runNpcActiveStateTests();
  recordAssertion();
} catch (error) {
  assert.fail('契約違反: tools/test_npc_active_state.mjs の検証に失敗しました: ' + error.message);
}
// -------------------------------------------------------------
// 18. 戦闘中コマンド二重送信抑止・ステート同期検証（BattleManager / BattleStateMachine）
// -------------------------------------------------------------
try {
  runBattleDoubleSubmitTests();
  recordAssertion();
} catch (error) {
  assert.fail('契約違反: tools/test_battle_double_submit.mjs の検証に失敗しました: ' + error.message);
}
// -------------------------------------------------------------
// 19. NPC移動例外制御純粋関数単体検証（resolveNpcPlacementAndMovement）
// -------------------------------------------------------------
try {
  runNpcMovementControlTests();
  recordAssertion();
} catch (error) {
  assert.fail('契約違反: tools/test_npc_movement_control.mjs の検証に失敗しました: ' + error.message);
}
// -------------------------------------------------------------
// 20. 衝突・移動判定純粋モジュール単体検証（CollisionSystem）
// -------------------------------------------------------------
try {
  runCollisionSystemTests();
  recordAssertion();
} catch (error) {
  assert.fail('契約違反: tools/test_collision_system.mjs の検証に失敗しました: ' + error.message);
}
// -------------------------------------------------------------
// 21. 歩数・エンカウント計算純粋モジュール単体検証（EncounterCalculator）
// -------------------------------------------------------------
try {
  runEncounterCalculatorTests();
  recordAssertion();
} catch (error) {
  assert.fail('契約違反: tools/test_encounter_calculator.mjs の検証に失敗しました: ' + error.message);
}
// -------------------------------------------------------------
// 22. マップ遷移トリガー EventBus 化・演出分離検証（FieldManager / EventTypes）
// -------------------------------------------------------------
try {
  await runMapTransitionEventTests();
  recordAssertion();
} catch (error) {
  assert.fail('契約違反: tools/test_map_transition_event.mjs の検証に失敗しました: ' + error.message);
}
// -------------------------------------------------------------
// 23. フィールド描画・入力正規化 Platform Driver 単体検証（FieldRenderer）
// -------------------------------------------------------------
try {
  runFieldRendererTests();
  recordAssertion();
} catch (error) {
  assert.fail('契約違反: tools/test_field_renderer.mjs の検証に失敗しました: ' + error.message);
}
// -------------------------------------------------------------
// 24. メニュー効果音・メッセージ枠イベント通知分離検証（MenuManager / main）
// -------------------------------------------------------------
try {
  await runMenuEventDecouplingTests();
  recordAssertion();
} catch (error) {
  assert.fail('契約違反: tools/test_menu_event_decoupling.mjs の検証に失敗しました: ' + error.message);
}

console.log(`[PASS] 全 ${totalAssertions} 項目すべてのアサーションに合格しました。`);
console.log('=== [完全ヘッドレス実行実証テスト正常終了] ===');
process.exit(0);