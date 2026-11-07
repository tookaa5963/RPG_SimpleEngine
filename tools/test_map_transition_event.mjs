// FILE_ENTRY: tools/test_map_transition_event.mjs
/**
 * tools/test_map_transition_event.mjs
 * Step 5-2c: マップ遷移トリガーの EventBus 化と演出分離 単体テスト
 *
 * 検証項目:
 * - TC-01: EventTypes.FIELD.MAP_TRANSITION_TRIGGERED の定義および Object.freeze 契約
 * - TC-02: 通常マップ遷移時のイベント発行（TRIGGERED / EXECUTED）、状態更新、Payload 純粋性
 * - TC-03: テレポート遷移トリガー時の即時切替抑止、フェード状態分離、executeChangeMap 実行後の切替完了
 * - TC-04: セーブデータロード遷移（isLoad = true）のイベント通知
 * - TC-05: 未定義マップID指定時の安全フォールバック（first_town: 15, 15）および補正後 Payload 通知
 * - TC-06: eventBus 未注入（後方互換）時の安全動作
 */

import './setup_headless_env.mjs';
import assert from 'node:assert/strict';
import { initMapData } from '../js/maps.js';
import { EventTypes } from '../js/engine/core/EventTypes.js';
import { EngineEventBus } from '../js/engine/core/EngineEventBus.js';
import { FieldManager } from '../js/fieldManager.js';

/**
 * Payload が純粋データ（JSON化可能・プリミティブ値のみ）であることを検証するヘルパー
 * @param {object} payload
 * @param {string} label
 */
function assertPurePrimitivePayload(payload, label) {
  assert.strictEqual(typeof payload, 'object', `${label}: Payload はオブジェクトでなければなりません`);
  assert.notStrictEqual(payload, null, `${label}: Payload は null であってはなりません`);

  const requiredKeys = [
    'phase',
    'fromMapId',
    'targetMapId',
    'targetGridX',
    'targetGridY',
    'direction',
    'isTeleport',
    'isLoad'
  ];

  for (let i = 0; i < requiredKeys.length; i += 1) {
    const key = requiredKeys[i];
    assert.strictEqual(
      Object.prototype.hasOwnProperty.call(payload, key),
      true,
      `${label}: 必須プロパティ "${key}" が欠落しています`
    );
    const val = payload[key];
    const valType = typeof val;
    const isPrimitive = valType === 'string' || valType === 'number' || valType === 'boolean';
    assert.strictEqual(
      isPrimitive,
      true,
      `${label}: プロパティ "${key}" はプリミティブ値でなければなりません (実際の型: ${valType})`
    );
  }

  assert.strictEqual(typeof payload.phase, 'string', `${label}: phase は文字列でなければなりません`);
  assert.strictEqual(
    payload.phase === 'TRIGGERED' || payload.phase === 'EXECUTED',
    true,
    `${label}: phase は 'TRIGGERED' または 'EXECUTED' でなければなりません (値: ${payload.phase})`
  );
  assert.strictEqual(typeof payload.fromMapId, 'string', `${label}: fromMapId は文字列でなければなりません`);
  assert.strictEqual(typeof payload.targetMapId, 'string', `${label}: targetMapId は文字列でなければなりません`);
  assert.strictEqual(Number.isFinite(payload.targetGridX), true, `${label}: targetGridX は有限数値でなければなりません`);
  assert.strictEqual(Number.isFinite(payload.targetGridY), true, `${label}: targetGridY は有限数値でなければなりません`);
  assert.strictEqual(typeof payload.direction, 'string', `${label}: direction は文字列でなければなりません`);
  assert.strictEqual(typeof payload.isTeleport, 'boolean', `${label}: isTeleport は boolean でなければなりません`);
  assert.strictEqual(typeof payload.isLoad, 'boolean', `${label}: isLoad は boolean でなければなりません`);

  // JSON.stringify / JSON.parse 往復による完全復元性の保証
  const serialized = JSON.stringify(payload);
  const deserialized = JSON.parse(serialized);
  assert.deepStrictEqual(
    deserialized,
    payload,
    `${label}: JSON シリアライズ往復後にデータ欠落または変化が発生しました`
  );
}

/**
 * テスト用の最小プレイヤー状態を生成するヘルパー
 * @returns {object}
 */
function createMockPlayer() {
  return {
    gridX: 5,
    gridY: 5,
    pixelX: 5 * 64,
    pixelY: 5 * 64,
    targetPixelX: 5 * 64,
    targetPixelY: 5 * 64,
    direction: 'down',
    isMoving: false,
    moveProgress: 0,
    steps: 0,
    flags: {
      hasLeftInitialCottage: false
    },
    inventory: {},
    statusEffects: []
  };
}

/**
 * テスト用の FieldManager インスタンスを生成するヘルパー
 * @param {object} options
 * @returns {{ fieldManager: FieldManager, player: object, capturedEvents: Array<object>, eventBus: EngineEventBus | undefined }}
 */
function createTestFieldManager({ startMapId = 'lighthousekeeper_cottage', withEventBus = true } = {}) {
  const player = createMockPlayer();
  const capturedEvents = [];
  const eventBus = withEventBus ? new EngineEventBus() : undefined;

  const eventName = EventTypes.FIELD
    ? EventTypes.FIELD.MAP_TRANSITION_TRIGGERED
    : 'field:map_transition_triggered';

  if (eventBus && typeof eventName === 'string' && eventName.length > 0) {
    eventBus.on(eventName, (payload) => {
      capturedEvents.push(payload);
    });
  }

  const fieldManager = new FieldManager({
    player,
    tileDb: {},
    renderer: {
      resetCamera: () => {},
      centerCameraOn: () => {}
    },
    messageWindow: {
      isVisible: false,
      update: () => {},
      showMessage: () => {}
    },
    eventManager: {
      checkAutoEvents: () => {}
    },
    getCanvas: () => ({ width: 800, height: 600 }),
    onEncounter: () => {},
    onStateChange: () => {},
    onPlayerDeath: () => {},
    onEnterDragonsCave2: () => {},
    startMapId,
    eventBus
  });

  return { fieldManager, player, capturedEvents, eventBus };
}

/**
 * Step 5-2c 単体テストスイート実行エントリポイント
 * @returns {Promise<number>} 合格したアサーション数
 */
export async function runMapTransitionEventTests() {
  let assertionsCount = 0;
  const pass = () => {
    assertionsCount += 1;
  };

  // 実在マスターマップデータのロード
  await initMapData();

  // =========================================================================
  // TC-01: 正常系 - EventTypes 契約検証
  // =========================================================================
  {
    assert.strictEqual(
      typeof EventTypes.FIELD,
      'object',
      'TC-01-1: EventTypes.FIELD 名前空間が定義されていなければなりません'
    );
    pass();

    assert.notStrictEqual(
      EventTypes.FIELD,
      null,
      'TC-01-2: EventTypes.FIELD は null であってはなりません'
    );
    pass();

    assert.strictEqual(
      EventTypes.FIELD.MAP_TRANSITION_TRIGGERED,
      'field:map_transition_triggered',
      'TC-01-3: EventTypes.FIELD.MAP_TRANSITION_TRIGGERED は "field:map_transition_triggered" でなければなりません'
    );
    pass();

    assert.strictEqual(
      Object.isFrozen(EventTypes),
      true,
      'TC-01-4: EventTypes は Object.freeze により凍結されていなければなりません'
    );
    pass();

    assert.strictEqual(
      Object.isFrozen(EventTypes.FIELD),
      true,
      'TC-01-5: EventTypes.FIELD は Object.freeze により凍結されていなければなりません'
    );
    pass();
  }

  // =========================================================================
  // TC-02: 正常系 - 通常マップ遷移（isTeleport = false, isLoad = false）のイベント発火と状態更新
  // =========================================================================
  {
    const { fieldManager, player, capturedEvents } = createTestFieldManager({
      startMapId: 'lighthousekeeper_cottage',
      withEventBus: true
    });

    fieldManager.changeMap('first_town', 15, 15, 'down', false, false);

    assert.strictEqual(
      fieldManager.currentMapId,
      'first_town',
      'TC-02-1: 通常マップ遷移後に currentMapId が "first_town" へ更新されていなければなりません'
    );
    pass();

    assert.strictEqual(
      player.gridX,
      15,
      'TC-02-2: プレイヤーの X 座標が 15 に更新されていなければなりません'
    );
    pass();

    assert.strictEqual(
      player.gridY,
      15,
      'TC-02-3: プレイヤーの Y 座標が 15 に更新されていなければなりません'
    );
    pass();

    assert.strictEqual(
      player.direction,
      'down',
      'TC-02-4: プレイヤーの向きが "down" に更新されていなければなりません'
    );
    pass();

    assert.strictEqual(
      player.flags.hasLeftInitialCottage,
      true,
      'TC-02-5: lighthousekeeper_cottage からの出発フラグ hasLeftInitialCottage が true に更新されていなければなりません'
    );
    pass();

    assert.strictEqual(
      capturedEvents.length >= 1,
      true,
      'TC-02-6: MAP_TRANSITION_TRIGGERED イベントが少なくとも1回以上発行されていなければなりません'
    );
    pass();

    const executedEvent = capturedEvents.find((ev) => ev.phase === 'EXECUTED');
    assert.notStrictEqual(
      typeof executedEvent,
      'undefined',
      'TC-02-7: phase: "EXECUTED" のイベントが発行されていなければなりません'
    );
    pass();

    assertPurePrimitivePayload(executedEvent, 'TC-02-8');
    pass();

    assert.strictEqual(executedEvent.fromMapId, 'lighthousekeeper_cottage', 'TC-02-9: fromMapId が一致しません');
    pass();
    assert.strictEqual(executedEvent.targetMapId, 'first_town', 'TC-02-10: targetMapId が一致しません');
    pass();
    assert.strictEqual(executedEvent.targetGridX, 15, 'TC-02-11: targetGridX が一致しません');
    pass();
    assert.strictEqual(executedEvent.targetGridY, 15, 'TC-02-12: targetGridY が一致しません');
    pass();
    assert.strictEqual(executedEvent.direction, 'down', 'TC-02-13: direction が一致しません');
    pass();
    assert.strictEqual(executedEvent.isTeleport, false, 'TC-02-14: isTeleport は false でなければなりません');
    pass();
    assert.strictEqual(executedEvent.isLoad, false, 'TC-02-15: isLoad は false でなければなりません');
    pass();
  }

  // =========================================================================
  // TC-03: 正常系 - テレポート遷移トリガー（isTeleport = true）のイベント発火と即時切替抑止
  // =========================================================================
  {
    const { fieldManager, player, capturedEvents } = createTestFieldManager({
      startMapId: 'first_town',
      withEventBus: true
    });

    fieldManager.changeMap('lighthousekeeper_cottage', 3, 4, 'up', true, false);

    assert.strictEqual(
      capturedEvents.length,
      1,
      'TC-03-1: テレポート遷移要求直後は TRIGGERED イベントが1件のみ発行されていなければなりません'
    );
    pass();

    const triggeredEvent = capturedEvents[0];
    assertPurePrimitivePayload(triggeredEvent, 'TC-03-2');
    pass();

    assert.strictEqual(triggeredEvent.phase, 'TRIGGERED', 'TC-03-3: phase は "TRIGGERED" でなければなりません');
    pass();
    assert.strictEqual(triggeredEvent.fromMapId, 'first_town', 'TC-03-4: fromMapId が一致しません');
    pass();
    assert.strictEqual(triggeredEvent.targetMapId, 'lighthousekeeper_cottage', 'TC-03-5: targetMapId が一致しません');
    pass();
    assert.strictEqual(triggeredEvent.targetGridX, 3, 'TC-03-6: targetGridX が一致しません');
    pass();
    assert.strictEqual(triggeredEvent.targetGridY, 4, 'TC-03-7: targetGridY が一致しません');
    pass();
    assert.strictEqual(triggeredEvent.direction, 'up', 'TC-03-8: direction が一致しません');
    pass();
    assert.strictEqual(triggeredEvent.isTeleport, true, 'TC-03-9: isTeleport は true でなければなりません');
    pass();
    assert.strictEqual(triggeredEvent.isLoad, false, 'TC-03-10: isLoad は false でなければなりません');
    pass();

    // フェードアウト完了前であるため、まだマップは切り替わっていないこと
    assert.strictEqual(
      fieldManager.currentMapId,
      'first_town',
      'TC-03-11: テレポート要求直後は currentMapId が "first_town" のまま維持されなければなりません'
    );
    pass();

    // 演出状態の分離検証: FieldManager がフェード進行状態を保持していないこと
    assert.strictEqual(
      fieldManager.teleportTransition === null || typeof fieldManager.teleportTransition === 'undefined',
      true,
      'TC-03-12: FieldManager は画面フェード演出用状態（teleportTransition）を保持してはなりません'
    );
    pass();

    // ドライバ側のフェードアウト完了を模した実マップ切替の実行
    fieldManager.executeChangeMap('lighthousekeeper_cottage', 3, 4, 'up', false);

    assert.strictEqual(
      fieldManager.currentMapId,
      'lighthousekeeper_cottage',
      'TC-03-13: executeChangeMap 実行後に currentMapId が "lighthousekeeper_cottage" へ切り替わらなければなりません'
    );
    pass();

    assert.strictEqual(player.gridX, 3, 'TC-03-14: プレイヤー X 座標が 3 に更新されていなければなりません');
    pass();
    assert.strictEqual(player.gridY, 4, 'TC-03-15: プレイヤー Y 座標が 4 に更新されていなければなりません');
    pass();

    assert.strictEqual(
      capturedEvents.length,
      2,
      'TC-03-16: executeChangeMap 完了後に2件目のイベント（EXECUTED）が発行されていなければなりません'
    );
    pass();

    const executedEvent = capturedEvents[1];
    assertPurePrimitivePayload(executedEvent, 'TC-03-17');
    pass();
    assert.strictEqual(executedEvent.phase, 'EXECUTED', 'TC-03-18: 2件目のイベント phase は "EXECUTED" でなければなりません');
    pass();
  }

  // =========================================================================
  // TC-04: 正常系 - セーブデータロード遷移（isLoad = true）のイベント発火
  // =========================================================================
  {
    const { fieldManager, capturedEvents } = createTestFieldManager({
      startMapId: 'lighthousekeeper_cottage',
      withEventBus: true
    });

    fieldManager.changeMap('port_town', 10, 6, 'up', false, true);

    assert.strictEqual(
      fieldManager.currentMapId,
      'port_town',
      'TC-04-1: ロード遷移後に currentMapId が "port_town" へ更新されていなければなりません'
    );
    pass();

    const executedEvent = capturedEvents.find((ev) => ev.phase === 'EXECUTED');
    assert.notStrictEqual(
      typeof executedEvent,
      'undefined',
      'TC-04-2: ロード遷移時に phase: "EXECUTED" のイベントが発行されていなければなりません'
    );
    pass();

    assertPurePrimitivePayload(executedEvent, 'TC-04-3');
    pass();

    assert.strictEqual(executedEvent.targetMapId, 'port_town', 'TC-04-4: targetMapId が一致しません');
    pass();
    assert.strictEqual(executedEvent.isLoad, true, 'TC-04-5: isLoad は true でなければなりません');
    pass();
    assert.strictEqual(executedEvent.isTeleport, false, 'TC-04-6: isTeleport は false でなければなりません');
    pass();
  }

  // =========================================================================
  // TC-05: 境界値・異常系 - 未定義マップID指定時の安全フォールバック
  // =========================================================================
  {
    const { fieldManager, player, capturedEvents } = createTestFieldManager({
      startMapId: 'port_town',
      withEventBus: true
    });

    assert.doesNotThrow(
      () => {
        fieldManager.executeChangeMap('non_existent_map_id', 99, 99, 'left', false);
      },
      'TC-05-1: 未定義マップID指定時に例外でクラッシュしてはなりません'
    );
    pass();

    assert.strictEqual(
      fieldManager.currentMapId,
      'first_town',
      'TC-05-2: 未定義マップID指定時は "first_town" へフォールバックしなければなりません'
    );
    pass();

    assert.strictEqual(player.gridX, 15, 'TC-05-3: フォールバック後のプレイヤー X 座標は 15 でなければなりません');
    pass();
    assert.strictEqual(player.gridY, 15, 'TC-05-4: フォールバック後のプレイヤー Y 座標は 15 でなければなりません');
    pass();

    const executedEvent = capturedEvents.find((ev) => ev.phase === 'EXECUTED');
    assert.notStrictEqual(
      typeof executedEvent,
      'undefined',
      'TC-05-5: フォールバック遷移時も phase: "EXECUTED" イベントが発行されていなければなりません'
    );
    pass();

    assertPurePrimitivePayload(executedEvent, 'TC-05-6');
    pass();

    assert.strictEqual(
      executedEvent.targetMapId,
      'first_town',
      'TC-05-7: 通知される targetMapId は補正後の "first_town" でなければなりません'
    );
    pass();

    assert.strictEqual(
      executedEvent.targetGridX,
      15,
      'TC-05-8: 通知される targetGridX は補正後の 15 でなければなりません'
    );
    pass();

    assert.strictEqual(
      executedEvent.targetGridY,
      15,
      'TC-05-9: 通知される targetGridY は補正後の 15 でなければなりません'
    );
    pass();
  }

  // =========================================================================
  // TC-06: 異常系 - eventBus 未注入（後方互換）時の安全動作
  // =========================================================================
  {
    const { fieldManager, player } = createTestFieldManager({
      startMapId: 'first_town',
      withEventBus: false
    });

    assert.doesNotThrow(
      () => {
        fieldManager.changeMap('dwarf_village', 4, 12, 'down', false);
      },
      'TC-06-1: eventBus 未注入時でも例外を発生させずマップ遷移できなければなりません'
    );
    pass();

    assert.strictEqual(
      fieldManager.currentMapId,
      'dwarf_village',
      'TC-06-2: eventBus 未注入時でも currentMapId が "dwarf_village" に更新されていなければなりません'
    );
    pass();

    assert.strictEqual(player.gridX, 4, 'TC-06-3: プレイヤー X 座標が 4 に更新されていなければなりません');
    pass();
    assert.strictEqual(player.gridY, 12, 'TC-06-4: プレイヤー Y 座標が 12 に更新されていなければなりません');
    pass();
  }

  return assertionsCount;
}

// 直接実行時のエントリポイント
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('tools/test_map_transition_event.mjs')) {
  runMapTransitionEventTests()
    .then((count) => {
      console.log(`[PASS] tools/test_map_transition_event.mjs: 全 ${count} 項目すべてのアサーションに合格しました。`);
      process.exit(0);
    })
    .catch((err) => {
      console.error('[FAIL] tools/test_map_transition_event.mjs:', err);
      process.exit(1);
    });
}