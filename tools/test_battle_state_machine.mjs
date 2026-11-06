/**
 * tools/test_battle_state_machine.mjs
 * Step 5-1c: BattleStateMachine 単体テストスイート
 * 
 * 状態遷移、ターン進行、フェイルファスト検証、境界値検証を網羅。
 */

import assert from 'node:assert/strict';
import { BattleStateMachine, BattleState } from '../js/engine/battle/BattleStateMachine.js';

export function runBattleStateMachineTests() {
  // =========================================================================
  // 1. 定数・初期状態の検証
  // =========================================================================

  // TC-CONST-01: BattleState 定数の完全凍結検証
  {
    assert.ok(Object.isFrozen(BattleState), 'TC-CONST-01: BattleState は Object.freeze されている必要があります');
    assert.strictEqual(BattleState.UNINITIALIZED, 'UNINITIALIZED');
    assert.strictEqual(BattleState.INITIALIZING, 'INITIALIZING');
    assert.strictEqual(BattleState.TURN_CHECK, 'TURN_CHECK');
    assert.strictEqual(BattleState.COMMAND_WAIT, 'COMMAND_WAIT');
    assert.strictEqual(BattleState.ACTION_RESOLVING, 'ACTION_RESOLVING');
    assert.strictEqual(BattleState.VICTORY_PENDING, 'VICTORY_PENDING');
    assert.strictEqual(BattleState.DISCARD_WAIT, 'DISCARD_WAIT');
    assert.strictEqual(BattleState.ESCAPE_SUCCESS, 'ESCAPE_SUCCESS');
    assert.strictEqual(BattleState.DEFEAT, 'DEFEAT');
    assert.strictEqual(BattleState.BATTLE_END, 'BATTLE_END');
  }

  // TC-INIT-01: インスタンス初期状態の検証
  {
    const sm = new BattleStateMachine();
    assert.strictEqual(sm.state, BattleState.UNINITIALIZED, 'TC-INIT-01: 初期状態は UNINITIALIZED であること');
    assert.strictEqual(sm.turnCount, 0, 'TC-INIT-01: 初期ターン数は 0 であること');
    assert.strictEqual(sm.isAmbush, false, 'TC-INIT-01: 初期 isAmbush は false であること');
  }

  // =========================================================================
  // 2. 正常系: 初期化およびターン遷移
  // =========================================================================

  // TC-NORM-01: 通常エンカウント初期化
  {
    const sm = new BattleStateMachine();
    const payload = sm.init({ isAmbush: false });
    assert.strictEqual(sm.state, BattleState.INITIALIZING, 'TC-NORM-01: 状態が INITIALIZING に遷移すること');
    assert.strictEqual(sm.isAmbush, false, 'TC-NORM-01: isAmbush が false であること');
    assert.strictEqual(sm.turnCount, 0, 'TC-NORM-01: 初期化直後のターン数は 0 であること');
    assert.deepStrictEqual(payload, {
      fromState: BattleState.UNINITIALIZED,
      toState: BattleState.INITIALIZING,
      context: { isAmbush: false }
    }, 'TC-NORM-01: 遷移Payloadが正しいこと');
  }

  // TC-NORM-02: 不意打ちエンカウント初期化
  {
    const sm = new BattleStateMachine();
    const payload = sm.init({ isAmbush: true });
    assert.strictEqual(sm.state, BattleState.INITIALIZING, 'TC-NORM-02: 状態が INITIALIZING に遷移すること');
    assert.strictEqual(sm.isAmbush, true, 'TC-NORM-02: isAmbush が true であること');
    assert.deepStrictEqual(payload, {
      fromState: BattleState.UNINITIALIZED,
      toState: BattleState.INITIALIZING,
      context: { isAmbush: true }
    }, 'TC-NORM-02: 遷移Payloadが正しいこと');
  }

  // TC-NORM-03: ターン開始チェック遷移（プレイヤー覚醒・行動可能）
  {
    const sm = new BattleStateMachine();
    sm.init({ isAmbush: false });
    const p1 = sm.proceedToTurnCheck();
    assert.strictEqual(sm.state, BattleState.TURN_CHECK, 'TC-NORM-03: TURN_CHECK へ遷移すること');
    assert.strictEqual(sm.turnCount, 1, 'TC-NORM-03: ターン数が 1 にインクリメントされること');
    assert.deepStrictEqual(p1, {
      fromState: BattleState.INITIALIZING,
      toState: BattleState.TURN_CHECK,
      context: { turnCount: 1 }
    });

    const p2 = sm.resolveTurnCheck({ canAct: true });
    assert.strictEqual(sm.state, BattleState.COMMAND_WAIT, 'TC-NORM-03: 行動可能時は COMMAND_WAIT へ遷移すること');
    assert.deepStrictEqual(p2, {
      fromState: BattleState.TURN_CHECK,
      toState: BattleState.COMMAND_WAIT,
      context: { canAct: true }
    });
  }

  // TC-NORM-04: ターン開始チェック遷移（プレイヤー睡眠・行動不能）
  {
    const sm = new BattleStateMachine();
    sm.init({ isAmbush: false });
    sm.proceedToTurnCheck();
    const payload = sm.resolveTurnCheck({ canAct: false });
    assert.strictEqual(sm.state, BattleState.ACTION_RESOLVING, 'TC-NORM-04: 行動不能時は ACTION_RESOLVING へ遷移すること');
    assert.deepStrictEqual(payload, {
      fromState: BattleState.TURN_CHECK,
      toState: BattleState.ACTION_RESOLVING,
      context: { canAct: false }
    });
  }

  // TC-NORM-05: 有効コマンドの受付（ATTACK, SPELL, ITEM, ESCAPE）
  {
    const commands = ['ATTACK', 'SPELL', 'ITEM', 'ESCAPE'];
    for (const cmd of commands) {
      const sm = new BattleStateMachine();
      sm.init({ isAmbush: false });
      sm.proceedToTurnCheck();
      sm.resolveTurnCheck({ canAct: true });
      const payload = sm.submitCommand(cmd);
      assert.strictEqual(sm.state, BattleState.ACTION_RESOLVING, `TC-NORM-05: ${cmd} 選択で ACTION_RESOLVING へ遷移すること`);
      assert.deepStrictEqual(payload, {
        fromState: BattleState.COMMAND_WAIT,
        toState: BattleState.ACTION_RESOLVING,
        context: { actionType: cmd }
      });
    }
  }

  // TC-NORM-06: 逃走成功フロー
  {
    const sm = new BattleStateMachine();
    sm.init({ isAmbush: false });
    sm.proceedToTurnCheck();
    sm.resolveTurnCheck({ canAct: true });
    sm.submitCommand('ESCAPE');
    const p1 = sm.resolveEscape(true);
    assert.strictEqual(sm.state, BattleState.ESCAPE_SUCCESS, 'TC-NORM-06: 逃走成功時は ESCAPE_SUCCESS へ遷移すること');
    assert.deepStrictEqual(p1, {
      fromState: BattleState.ACTION_RESOLVING,
      toState: BattleState.ESCAPE_SUCCESS,
      context: { success: true }
    });
    const p2 = sm.endBattle();
    assert.strictEqual(sm.state, BattleState.BATTLE_END, 'TC-NORM-06: endBattle で BATTLE_END へ遷移すること');
    assert.deepStrictEqual(p2, {
      fromState: BattleState.ESCAPE_SUCCESS,
      toState: BattleState.BATTLE_END,
      context: {}
    });
  }

  // TC-NORM-07: 逃走失敗フロー
  {
    const sm = new BattleStateMachine();
    sm.init({ isAmbush: false });
    sm.proceedToTurnCheck();
    sm.resolveTurnCheck({ canAct: true });
    sm.submitCommand('ESCAPE');
    const payload = sm.resolveEscape(false);
    assert.strictEqual(sm.state, BattleState.ACTION_RESOLVING, 'TC-NORM-07: 逃走失敗時は敵ターン解決のため ACTION_RESOLVING を維持すること');
    assert.deepStrictEqual(payload, {
      fromState: BattleState.ACTION_RESOLVING,
      toState: BattleState.ACTION_RESOLVING,
      context: { success: false }
    });
  }

  // TC-NORM-08: 勝利フロー（ドロップ破棄なし）
  {
    const sm = new BattleStateMachine();
    sm.init({ isAmbush: false });
    sm.proceedToTurnCheck();
    sm.resolveTurnCheck({ canAct: true });
    sm.submitCommand('ATTACK');
    const p1 = sm.startVictoryPending();
    assert.strictEqual(sm.state, BattleState.VICTORY_PENDING, 'TC-NORM-08: VICTORY_PENDING へ遷移すること');
    assert.deepStrictEqual(p1, {
      fromState: BattleState.ACTION_RESOLVING,
      toState: BattleState.VICTORY_PENDING,
      context: {}
    });
    const p2 = sm.resolveVictory({ needsDiscard: false });
    assert.strictEqual(sm.state, BattleState.BATTLE_END, 'TC-NORM-08: 破棄なし勝利時は直ちに BATTLE_END へ遷移すること');
    assert.deepStrictEqual(p2, {
      fromState: BattleState.VICTORY_PENDING,
      toState: BattleState.BATTLE_END,
      context: { needsDiscard: false }
    });
  }

  // TC-NORM-09: 勝利フロー（ドロップ破棄あり）
  {
    const sm = new BattleStateMachine();
    sm.init({ isAmbush: false });
    sm.proceedToTurnCheck();
    sm.resolveTurnCheck({ canAct: true });
    sm.submitCommand('ATTACK');
    sm.startVictoryPending();
    const p1 = sm.resolveVictory({ needsDiscard: true });
    assert.strictEqual(sm.state, BattleState.DISCARD_WAIT, 'TC-NORM-09: 破棄必要時は DISCARD_WAIT へ遷移すること');
    assert.deepStrictEqual(p1, {
      fromState: BattleState.VICTORY_PENDING,
      toState: BattleState.DISCARD_WAIT,
      context: { needsDiscard: true }
    });
    const p2 = sm.resolveDiscard();
    assert.strictEqual(sm.state, BattleState.BATTLE_END, 'TC-NORM-09: 破棄完了後に BATTLE_END へ遷移すること');
    assert.deepStrictEqual(p2, {
      fromState: BattleState.DISCARD_WAIT,
      toState: BattleState.BATTLE_END,
      context: {}
    });
  }

  // TC-NORM-10: 敗北フロー
  {
    const sm = new BattleStateMachine();
    sm.init({ isAmbush: false });
    sm.proceedToTurnCheck();
    sm.resolveTurnCheck({ canAct: true });
    sm.submitCommand('ATTACK');
    const p1 = sm.resolveDefeat();
    assert.strictEqual(sm.state, BattleState.DEFEAT, 'TC-NORM-10: DEFEAT へ遷移すること');
    assert.deepStrictEqual(p1, {
      fromState: BattleState.ACTION_RESOLVING,
      toState: BattleState.DEFEAT,
      context: {}
    });
    const p2 = sm.endBattle();
    assert.strictEqual(sm.state, BattleState.BATTLE_END, 'TC-NORM-10: endBattle で BATTLE_END へ遷移すること');
    assert.deepStrictEqual(p2, {
      fromState: BattleState.DEFEAT,
      toState: BattleState.BATTLE_END,
      context: {}
    });
  }

  // TC-NORM-11: 複数ターン進行のターンカウント整合性
  {
    const sm = new BattleStateMachine();
    sm.init({ isAmbush: false });
    assert.strictEqual(sm.turnCount, 0);

    // Turn 1
    sm.proceedToTurnCheck();
    assert.strictEqual(sm.turnCount, 1);
    sm.resolveTurnCheck({ canAct: true });
    sm.submitCommand('ATTACK');

    // Turn 2
    sm.proceedToTurnCheck();
    assert.strictEqual(sm.turnCount, 2);
    sm.resolveTurnCheck({ canAct: true });
    sm.submitCommand('ATTACK');

    // Turn 3
    sm.proceedToTurnCheck();
    assert.strictEqual(sm.turnCount, 3);
  }

  // =========================================================================
  // 3. 異常系・境界値・フェイルファスト検証
  // =========================================================================

  // TC-ERR-01: UNINITIALIZED 状態での不正操作
  {
    const sm = new BattleStateMachine();
    assert.throws(() => sm.proceedToTurnCheck(), /Invalid state transition/, 'TC-ERR-01: 未初期化でのターン開始は例外');
    assert.throws(() => sm.submitCommand('ATTACK'), /Invalid state transition/, 'TC-ERR-01: 未初期化でのコマンド送信は例外');
    assert.throws(() => sm.resolveVictory({ needsDiscard: false }), /Invalid state transition/, 'TC-ERR-01: 未初期化での勝利解決は例外');
    assert.throws(() => sm.resolveDiscard(), /Invalid state transition/, 'TC-ERR-01: 未初期化での破棄解決は例外');
    assert.throws(() => sm.endBattle(), /Invalid state transition/, 'TC-ERR-01: 未初期化での終了は例外');
  }

  // TC-ERR-02: init 引数の厳格検証
  {
    const sm = new BattleStateMachine();
    assert.throws(() => sm.init(null), /Invalid parameters/, 'TC-ERR-02: null 引数は例外');
    assert.throws(() => sm.init(undefined), /Invalid parameters/, 'TC-ERR-02: undefined 引数は例外');
    assert.throws(() => sm.init({}), /Invalid parameters/, 'TC-ERR-02: isAmbush 欠損は例外');
    assert.throws(() => sm.init({ isAmbush: 'true' }), /Invalid parameters/, 'TC-ERR-02: isAmbush 非boolean は例外');
  }

  // TC-ERR-03: init の多重実行拒否
  {
    const sm = new BattleStateMachine();
    sm.init({ isAmbush: false });
    assert.throws(() => sm.init({ isAmbush: false }), /Invalid state transition/, 'TC-ERR-03: 初期化済みの再初期化は例外');
  }

  // TC-ERR-04: resolveTurnCheck の引数および状態検証
  {
    const sm = new BattleStateMachine();
    sm.init({ isAmbush: false });
    assert.throws(() => sm.resolveTurnCheck({ canAct: true }), /Invalid state transition/, 'TC-ERR-04: TURN_CHECK 以外での解決は例外');
    sm.proceedToTurnCheck();
    assert.throws(() => sm.resolveTurnCheck(null), /Invalid parameters/, 'TC-ERR-04: null 引数は例外');
    assert.throws(() => sm.resolveTurnCheck({}), /Invalid parameters/, 'TC-ERR-04: canAct 欠損は例外');
    assert.throws(() => sm.resolveTurnCheck({ canAct: 'true' }), /Invalid parameters/, 'TC-ERR-04: canAct 非boolean は例外');
  }

  // TC-ERR-05: submitCommand のコマンド名および状態検証
  {
    const sm = new BattleStateMachine();
    sm.init({ isAmbush: false });
    sm.proceedToTurnCheck();
    sm.resolveTurnCheck({ canAct: true });

    assert.throws(() => sm.submitCommand(''), /Invalid actionType/, 'TC-ERR-05: 空文字列コマンドは例外');
    assert.throws(() => sm.submitCommand('INVALID_CMD'), /Invalid actionType/, 'TC-ERR-05: 未定義コマンドは例外');
    assert.throws(() => sm.submitCommand(123), /Invalid actionType/, 'TC-ERR-05: 数値コマンドは例外');
    assert.throws(() => sm.submitCommand(null), /Invalid actionType/, 'TC-ERR-05: null コマンドは例外');

    // 1回実行した後は ACTION_RESOLVING になるため、再度の submitCommand は拒絶されること
    sm.submitCommand('ATTACK');
    assert.throws(() => sm.submitCommand('ATTACK'), /Invalid state transition/, 'TC-ERR-05: ACTION_RESOLVING 中の連続コマンド受付は例外');
  }

  // TC-ERR-06: resolveEscape の引数および状態検証
  {
    const sm = new BattleStateMachine();
    sm.init({ isAmbush: false });
    assert.throws(() => sm.resolveEscape(true), /Invalid state transition/, 'TC-ERR-06: ACTION_RESOLVING 以外での逃走判定は例外');
    sm.proceedToTurnCheck();
    sm.resolveTurnCheck({ canAct: true });
    sm.submitCommand('ESCAPE');
    assert.throws(() => sm.resolveEscape('true'), /Invalid parameters/, 'TC-ERR-06: 非boolean引数は例外');
    assert.throws(() => sm.resolveEscape(null), /Invalid parameters/, 'TC-ERR-06: null引数は例外');
  }

  // TC-ERR-07: resolveVictory および resolveDiscard の状態・引数検証
  {
    const sm = new BattleStateMachine();
    sm.init({ isAmbush: false });
    assert.throws(() => sm.startVictoryPending(), /Invalid state transition/, 'TC-ERR-07: ACTION_RESOLVING 以外での勝利開始は例外');
    assert.throws(() => sm.resolveDiscard(), /Invalid state transition/, 'TC-ERR-07: DISCARD_WAIT 以外での破棄完了は例外');

    sm.proceedToTurnCheck();
    sm.resolveTurnCheck({ canAct: true });
    sm.submitCommand('ATTACK');
    sm.startVictoryPending();
    assert.throws(() => sm.resolveVictory(null), /Invalid parameters/, 'TC-ERR-07: resolveVictory の null 引数は例外');
    assert.throws(() => sm.resolveVictory({}), /Invalid parameters/, 'TC-ERR-07: needsDiscard 欠損は例外');
    assert.throws(() => sm.resolveVictory({ needsDiscard: 'false' }), /Invalid parameters/, 'TC-ERR-07: needsDiscard 非boolean は例外');
  }

  // TC-ERR-08: BATTLE_END 到達後の状態変更拒絶（完全閉鎖）
  {
    const sm = new BattleStateMachine();
    sm.init({ isAmbush: false });
    sm.proceedToTurnCheck();
    sm.resolveTurnCheck({ canAct: true });
    sm.submitCommand('ESCAPE');
    sm.resolveEscape(true);
    sm.endBattle();
    assert.strictEqual(sm.state, BattleState.BATTLE_END);

    assert.throws(() => sm.proceedToTurnCheck(), /Invalid state transition/, 'TC-ERR-08: 終了後のターン開始は例外');
    assert.throws(() => sm.submitCommand('ATTACK'), /Invalid state transition/, 'TC-ERR-08: 終了後のコマンドは例外');
    assert.throws(() => sm.resolveDefeat(), /Invalid state transition/, 'TC-ERR-08: 終了後の敗北は例外');
  }

  // =========================================================================
  // 8. コマンドキャンセル・差し戻し遷移の検証（cancelCommand）
  // =========================================================================

  // TC-BSM-CANCEL-01: ACTION_RESOLVING からのコマンド差し戻し
  {
    const sm = new BattleStateMachine();
    sm.init({ isAmbush: false });
    sm.proceedToTurnCheck();
    sm.resolveTurnCheck({ canAct: true });
    sm.submitCommand('SPELL');
    assert.strictEqual(sm.state, BattleState.ACTION_RESOLVING);

    const payload = sm.cancelCommand();
    assert.strictEqual(sm.state, BattleState.COMMAND_WAIT, 'TC-BSM-CANCEL-01: COMMAND_WAIT へ復帰する必要があります');
    assert.deepStrictEqual(
      payload,
      {
        fromState: BattleState.ACTION_RESOLVING,
        toState: BattleState.COMMAND_WAIT,
        context: {}
      },
      'TC-BSM-CANCEL-01: 遷移 Payload が完全一致する必要があります'
    );

    const resubmitPayload = sm.submitCommand('ATTACK');
    assert.strictEqual(sm.state, BattleState.ACTION_RESOLVING, 'TC-BSM-CANCEL-01: 差し戻し後の再コマンド送信が正常遷移する必要があります');
    assert.strictEqual(resubmitPayload.toState, BattleState.ACTION_RESOLVING);
  }

  // TC-BSM-CANCEL-02: ACTION_RESOLVING 以外からの差し戻し拒絶
  {
    // 1. UNINITIALIZED
    const smUninitialized = new BattleStateMachine();
    assert.throws(
      () => smUninitialized.cancelCommand(),
      /Invalid state transition/,
      'TC-BSM-CANCEL-02: UNINITIALIZED からの cancelCommand は例外'
    );

    // 2. INITIALIZING
    const smInitializing = new BattleStateMachine();
    smInitializing.init({ isAmbush: false });
    assert.throws(
      () => smInitializing.cancelCommand(),
      /Invalid state transition/,
      'TC-BSM-CANCEL-02: INITIALIZING からの cancelCommand は例外'
    );

    // 3. TURN_CHECK
    const smTurnCheck = new BattleStateMachine();
    smTurnCheck.init({ isAmbush: false });
    smTurnCheck.proceedToTurnCheck();
    assert.throws(
      () => smTurnCheck.cancelCommand(),
      /Invalid state transition/,
      'TC-BSM-CANCEL-02: TURN_CHECK からの cancelCommand は例外'
    );

    // 4. COMMAND_WAIT
    const smCommandWait = new BattleStateMachine();
    smCommandWait.init({ isAmbush: false });
    smCommandWait.proceedToTurnCheck();
    smCommandWait.resolveTurnCheck({ canAct: true });
    assert.throws(
      () => smCommandWait.cancelCommand(),
      /Invalid state transition/,
      'TC-BSM-CANCEL-02: COMMAND_WAIT からの cancelCommand は例外'
    );

    // 5. VICTORY_PENDING
    const smVictory = new BattleStateMachine();
    smVictory.init({ isAmbush: false });
    smVictory.proceedToTurnCheck();
    smVictory.resolveTurnCheck({ canAct: true });
    smVictory.submitCommand('ATTACK');
    smVictory.startVictoryPending();
    assert.throws(
      () => smVictory.cancelCommand(),
      /Invalid state transition/,
      'TC-BSM-CANCEL-02: VICTORY_PENDING からの cancelCommand は例外'
    );

    // 6. DISCARD_WAIT
    const smDiscard = new BattleStateMachine();
    smDiscard.init({ isAmbush: false });
    smDiscard.proceedToTurnCheck();
    smDiscard.resolveTurnCheck({ canAct: true });
    smDiscard.submitCommand('ATTACK');
    smDiscard.startVictoryPending();
    smDiscard.resolveVictory({ needsDiscard: true });
    assert.throws(
      () => smDiscard.cancelCommand(),
      /Invalid state transition/,
      'TC-BSM-CANCEL-02: DISCARD_WAIT からの cancelCommand は例外'
    );

    // 7. ESCAPE_SUCCESS
    const smEscape = new BattleStateMachine();
    smEscape.init({ isAmbush: false });
    smEscape.proceedToTurnCheck();
    smEscape.resolveTurnCheck({ canAct: true });
    smEscape.submitCommand('ESCAPE');
    smEscape.resolveEscape(true);
    assert.throws(
      () => smEscape.cancelCommand(),
      /Invalid state transition/,
      'TC-BSM-CANCEL-02: ESCAPE_SUCCESS からの cancelCommand は例外'
    );

    // 8. DEFEAT
    const smDefeat = new BattleStateMachine();
    smDefeat.init({ isAmbush: false });
    smDefeat.proceedToTurnCheck();
    smDefeat.resolveTurnCheck({ canAct: true });
    smDefeat.submitCommand('ATTACK');
    smDefeat.resolveDefeat();
    assert.throws(
      () => smDefeat.cancelCommand(),
      /Invalid state transition/,
      'TC-BSM-CANCEL-02: DEFEAT からの cancelCommand は例外'
    );

    // 9. BATTLE_END
    const smEnd = new BattleStateMachine();
    smEnd.init({ isAmbush: false });
    smEnd.proceedToTurnCheck();
    smEnd.resolveTurnCheck({ canAct: true });
    smEnd.submitCommand('ESCAPE');
    smEnd.resolveEscape(true);
    smEnd.endBattle();
    assert.throws(
      () => smEnd.cancelCommand(),
      /Invalid state transition/,
      'TC-BSM-CANCEL-02: BATTLE_END からの cancelCommand は例外'
    );
  }
}

// 直接実行時のエントリポイント
if (process.argv[1] && process.argv[1].endsWith('test_battle_state_machine.mjs')) {
  runBattleStateMachineTests();
  console.log('BattleStateMachine: 全テスト項目が正常にパスしました。');
}