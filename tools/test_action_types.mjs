import assert from 'node:assert/strict';
import { ActionTypes } from '../js/engine/core/ActionTypes.js';
import { EventTypes } from '../js/engine/core/EventTypes.js';

// =============================================================================
// Phase 4.5: 通信プロトコル契約テスト (ActionTypes & EventTypes)
// =============================================================================

function runActionTypesContractTest() {
  // ---------------------------------------------------------------------------
  // 1. ActionTypes 構造および必須カテゴリ検証 (正常系)
  // ---------------------------------------------------------------------------
  assert.ok(ActionTypes !== null && typeof ActionTypes === 'object', 'ActionTypes must be a non-null object');

  const requiredActionCategories = ['PLAYER', 'MENU', 'BATTLE', 'SYSTEM'];
  const actualActionCategories = Object.keys(ActionTypes);

  assert.deepStrictEqual(
    actualActionCategories.sort(),
    [...requiredActionCategories].sort(),
    'ActionTypes must contain exactly the specified categories: PLAYER, MENU, BATTLE, SYSTEM'
  );

  for (const category of requiredActionCategories) {
    assert.ok(
      ActionTypes[category] !== null && typeof ActionTypes[category] === 'object',
      `ActionTypes.${category} must be a non-null object`
    );
  }

  // ---------------------------------------------------------------------------
  // 2. ActionTypes 必須定数および命名規約検証 (正常系)
  // ---------------------------------------------------------------------------
  const expectedActionValues = {
    PLAYER: {
      MOVE: 'player:move',
      INTERACT: 'player:interact',
    },
    MENU: {
      OPEN: 'menu:open',
      CLOSE: 'menu:close',
      SELECT: 'menu:select',
      EXECUTE: 'menu:execute',
      CANCEL: 'menu:cancel',
    },
    BATTLE: {
      SELECT_COMMAND: 'battle:select_command',
      SELECT_TARGET: 'battle:select_target',
      EXECUTE_ACTION: 'battle:execute_action',
      ESCAPE: 'battle:escape',
    },
    SYSTEM: {
      CHANGE_MAP: 'system:change_map',
      OPEN_SLOT_DIALOG: 'system:open_slot_dialog',
      RETURN_TO_TITLE: 'system:return_to_title',
      SAVE_GAME: 'system:save_game',
      LOAD_GAME: 'system:load_game',
    },
  };

  const actionPattern = /^[a-z]+:[a-z]+(_[a-z]+)*$/;
  const allActionValues = [];

  for (const [category, definitions] of Object.entries(expectedActionValues)) {
    for (const [key, expectedValue] of Object.entries(definitions)) {
      const actualValue = ActionTypes[category][key];
      assert.strictEqual(
        actualValue,
        expectedValue,
        `ActionTypes.${category}.${key} must strictly equal '${expectedValue}'`
      );
      assert.strictEqual(
        typeof actualValue,
        'string',
        `ActionTypes.${category}.${key} must be a string`
      );
      assert.match(
        actualValue,
        actionPattern,
        `ActionTypes.${category}.${key} ('${actualValue}') must match format '<category>:<action_name>'`
      );
      assert.ok(
        actualValue.startsWith(`${category.toLowerCase()}:`),
        `ActionTypes.${category}.${key} must start with '${category.toLowerCase()}:'`
      );
      allActionValues.push(actualValue);
    }
  }

  // ---------------------------------------------------------------------------
  // 3. ActionTypes 完全凍結・不変性検証 (異常系 / 境界値)
  // ---------------------------------------------------------------------------
  assert.strictEqual(Object.isFrozen(ActionTypes), true, 'ActionTypes root object must be frozen');

  for (const category of requiredActionCategories) {
    assert.strictEqual(
      Object.isFrozen(ActionTypes[category]),
      true,
      `ActionTypes.${category} child object must be frozen`
    );

    // プロパティ書き換え試行に対する例外検証 (strict mode)
    assert.throws(
      () => {
        ActionTypes[category].MUTATION_ATTEMPT = 'invalid:mutation';
      },
      TypeError,
      `Adding property to ActionTypes.${category} must throw TypeError`
    );

    const firstKey = Object.keys(ActionTypes[category])[0];
    assert.throws(
      () => {
        ActionTypes[category][firstKey] = 'invalid:overwrite';
      },
      TypeError,
      `Overwriting property in ActionTypes.${category} must throw TypeError`
    );

    assert.throws(
      () => {
        delete ActionTypes[category][firstKey];
      },
      TypeError,
      `Deleting property from ActionTypes.${category} must throw TypeError`
    );
  }

  // ルートオブジェクトへの追加試行検証
  assert.throws(
    () => {
      ActionTypes.NEW_CATEGORY = {};
    },
    TypeError,
    'Adding category to ActionTypes root must throw TypeError'
  );

  // ---------------------------------------------------------------------------
  // 4. 重複・名前空間衝突の排除検証 (異常系 / 境界値)
  // ---------------------------------------------------------------------------
  const uniqueActionSet = new Set(allActionValues);
  assert.strictEqual(
    uniqueActionSet.size,
    allActionValues.length,
    `ActionTypes contains duplicate action values: size ${uniqueActionSet.size} vs length ${allActionValues.length}`
  );

  // EventTypes 全値の抽出
  const allEventValues = [];
  function extractEventValues(targetObj) {
    for (const val of Object.values(targetObj)) {
      if (typeof val === 'string') {
        allEventValues.push(val);
      } else if (val !== null && typeof val === 'object') {
        extractEventValues(val);
      }
    }
  }
  extractEventValues(EventTypes);

  // ActionTypes と EventTypes の衝突排除
  const actionSet = new Set(allActionValues);
  for (const eventValue of allEventValues) {
    assert.strictEqual(
      actionSet.has(eventValue),
      false,
      `Collision detected between ActionTypes and EventTypes: '${eventValue}' exists in both`
    );
  }

  // ---------------------------------------------------------------------------
  // 5. EventTypes クレンジングおよび既存定義健全性検証 (正常系 / 異常系)
  // ---------------------------------------------------------------------------
  // 廃止対象の REQUEST_ 系定数が存在しないこと
  assert.strictEqual(
    EventTypes.SYSTEM.REQUEST_MAP_CHANGE,
    undefined,
    'EventTypes.SYSTEM.REQUEST_MAP_CHANGE must be removed'
  );
  assert.strictEqual(
    EventTypes.SYSTEM.REQUEST_SLOT_DIALOG,
    undefined,
    'EventTypes.SYSTEM.REQUEST_SLOT_DIALOG must be removed'
  );
  assert.strictEqual(
    EventTypes.SYSTEM.REQUEST_RETURN_TITLE,
    undefined,
    'EventTypes.SYSTEM.REQUEST_RETURN_TITLE must be removed'
  );

  // EventTypes 全域における REQUEST 識別子の完全排除検証
  function verifyNoRequestInObject(targetObj, path = 'EventTypes') {
    for (const [key, val] of Object.entries(targetObj)) {
      assert.strictEqual(
        key.includes('REQUEST'),
        false,
        `Forbidden identifier found in ${path}.${key}: key must not include 'REQUEST'`
      );
      if (typeof val === 'string') {
        assert.strictEqual(
          val.includes('request'),
          false,
          `Forbidden identifier found in ${path}.${key} ('${val}'): value must not include 'request'`
        );
      } else if (val !== null && typeof val === 'object') {
        verifyNoRequestInObject(val, `${path}.${key}`);
      }
    }
  }
  verifyNoRequestInObject(EventTypes);

  // 既存必須定数が破壊されていないことの検証
  const expectedEventBaselines = {
    ACTOR: {
      HP_CHANGED: 'actor:hp_changed',
      MP_CHANGED: 'actor:mp_changed',
      STATUS_ADDED: 'actor:status_added',
      STATUS_REMOVED: 'actor:status_removed',
      DIED: 'actor:died',
    },
    INVENTORY: {
      ITEM_CONSUMED: 'inventory:item_consumed',
      ITEM_OBTAINED: 'inventory:item_obtained',
    },
    EFFECT: {
      APPLIED: 'effect:applied',
    },
    BATTLE: {
      PHASE_CHANGED: 'battle:phase_changed',
      ACTION_EXECUTED: 'battle:action_executed',
    },
    SYSTEM: {
      MESSAGE_LOG: 'system:message_log',
      AUDIO_PLAY_SE: 'system:audio_play_se',
      AUDIO_PLAY_BGM: 'system:audio_play_bgm',
      AUDIO_STOP_BGM: 'system:audio_stop_bgm',
    },
  };

  for (const [category, definitions] of Object.entries(expectedEventBaselines)) {
    assert.ok(
      EventTypes[category] !== null && typeof EventTypes[category] === 'object',
      `EventTypes.${category} must exist`
    );
    assert.strictEqual(
      Object.isFrozen(EventTypes[category]),
      true,
      `EventTypes.${category} must remain frozen`
    );
    for (const [key, expectedVal] of Object.entries(definitions)) {
      assert.strictEqual(
        EventTypes[category][key],
        expectedVal,
        `EventTypes.${category}.${key} baseline modified: expected '${expectedVal}'`
      );
    }
  }

  assert.strictEqual(Object.isFrozen(EventTypes), true, 'EventTypes root must remain frozen');

  console.log('PASS: tools/test_action_types.mjs (ActionTypes and EventTypes contract verified)');
}

runActionTypesContractTest();