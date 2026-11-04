/**
 * js/engine/battle/BattleStateMachine.js
 * 
 * 戦闘進行・状態遷移管理ステートマシン（純粋Core層）
 * 
 * 責務:
 * - 戦闘フェーズの厳格な遷移制御および不正遷移の遮断（フェイルファスト）
 * - ターン数、不意打ち状態の保持
 * - 純粋データ Payload の生成
 */

/**
 * 戦闘状態列挙型（完全凍結）
 */
export const BattleState = Object.freeze({
  UNINITIALIZED: 'UNINITIALIZED',
  INITIALIZING: 'INITIALIZING',
  TURN_CHECK: 'TURN_CHECK',
  COMMAND_WAIT: 'COMMAND_WAIT',
  ACTION_RESOLVING: 'ACTION_RESOLVING',
  VICTORY_PENDING: 'VICTORY_PENDING',
  DISCARD_WAIT: 'DISCARD_WAIT',
  ESCAPE_SUCCESS: 'ESCAPE_SUCCESS',
  DEFEAT: 'DEFEAT',
  BATTLE_END: 'BATTLE_END'
});

const VALID_COMMANDS = ['ATTACK', 'SPELL', 'ITEM', 'ESCAPE'];

export class BattleStateMachine {
  #state;
  #turnCount;
  #isAmbush;

  constructor() {
    this.#state = BattleState.UNINITIALIZED;
    this.#turnCount = 0;
    this.#isAmbush = false;
  }

  get state() {
    return this.#state;
  }

  get turnCount() {
    return this.#turnCount;
  }

  get isAmbush() {
    return this.#isAmbush;
  }

  /**
   * 戦闘初期化
   * @param {{ isAmbush: boolean }} params 
   */
  init(params) {
    if (this.#state !== BattleState.UNINITIALIZED) {
      throw new Error('Invalid state transition: already initialized');
    }
    if (params === null) {
      throw new TypeError('Invalid parameters: params must not be null');
    }
    if (typeof params !== 'object') {
      throw new TypeError('Invalid parameters: params must be an object');
    }
    if (typeof params.isAmbush !== 'boolean') {
      throw new TypeError('Invalid parameters: isAmbush must be boolean');
    }

    const fromState = this.#state;
    this.#isAmbush = params.isAmbush;
    this.#state = BattleState.INITIALIZING;

    return {
      fromState: fromState,
      toState: this.#state,
      context: {
        isAmbush: this.#isAmbush
      }
    };
  }

  /**
   * ターン開始フェーズへの進行
   */
  proceedToTurnCheck() {
    let isValid = false;
    if (this.#state === BattleState.INITIALIZING) {
      isValid = true;
    } else if (this.#state === BattleState.ACTION_RESOLVING) {
      isValid = true;
    }

    if (isValid === false) {
      throw new Error('Invalid state transition: cannot proceed to turn check from ' + this.#state);
    }

    const fromState = this.#state;
    this.#turnCount += 1;
    this.#state = BattleState.TURN_CHECK;

    return {
      fromState: fromState,
      toState: this.#state,
      context: {
        turnCount: this.#turnCount
      }
    };
  }

  /**
   * ターン開始時判定の解決
   * @param {{ canAct: boolean }} params 
   */
  resolveTurnCheck(params) {
    if (this.#state !== BattleState.TURN_CHECK) {
      throw new Error('Invalid state transition: cannot resolve turn check from ' + this.#state);
    }
    if (params === null) {
      throw new TypeError('Invalid parameters: params must not be null');
    }
    if (typeof params !== 'object') {
      throw new TypeError('Invalid parameters: params must be an object');
    }
    if (typeof params.canAct !== 'boolean') {
      throw new TypeError('Invalid parameters: canAct must be boolean');
    }

    const fromState = this.#state;
    if (params.canAct === true) {
      this.#state = BattleState.COMMAND_WAIT;
    } else {
      this.#state = BattleState.ACTION_RESOLVING;
    }

    return {
      fromState: fromState,
      toState: this.#state,
      context: {
        canAct: params.canAct
      }
    };
  }

  /**
   * コマンド受理
   * @param {string} actionType 
   */
  submitCommand(actionType) {
    if (this.#state !== BattleState.COMMAND_WAIT) {
      throw new Error('Invalid state transition: cannot submit command from ' + this.#state);
    }
    if (typeof actionType !== 'string') {
      throw new TypeError('Invalid actionType: must be a string');
    }

    let isKnown = false;
    for (let i = 0; i < VALID_COMMANDS.length; i += 1) {
      if (VALID_COMMANDS[i] === actionType) {
        isKnown = true;
        break;
      }
    }

    if (isKnown === false) {
      throw new TypeError('Invalid actionType: unknown command ' + actionType);
    }

    const fromState = this.#state;
    this.#state = BattleState.ACTION_RESOLVING;

    return {
      fromState: fromState,
      toState: this.#state,
      context: {
        actionType: actionType
      }
    };
  }

  /**
   * 逃走判定の解決
   * @param {boolean} success 
   */
  resolveEscape(success) {
    if (this.#state !== BattleState.ACTION_RESOLVING) {
      throw new Error('Invalid state transition: cannot resolve escape from ' + this.#state);
    }
    if (typeof success !== 'boolean') {
      throw new TypeError('Invalid parameters: success must be boolean');
    }

    const fromState = this.#state;
    if (success === true) {
      this.#state = BattleState.ESCAPE_SUCCESS;
    } else {
      this.#state = BattleState.ACTION_RESOLVING;
    }

    return {
      fromState: fromState,
      toState: this.#state,
      context: {
        success: success
      }
    };
  }

  /**
   * 勝利処理開始
   */
  startVictoryPending() {
    if (this.#state !== BattleState.ACTION_RESOLVING) {
      throw new Error('Invalid state transition: cannot start victory pending from ' + this.#state);
    }

    const fromState = this.#state;
    this.#state = BattleState.VICTORY_PENDING;

    return {
      fromState: fromState,
      toState: this.#state,
      context: {}
    };
  }

  /**
   * 勝利確定・破棄判定の解決
   * @param {{ needsDiscard: boolean }} params 
   */
  resolveVictory(params) {
    if (this.#state !== BattleState.VICTORY_PENDING) {
      throw new Error('Invalid state transition: cannot resolve victory from ' + this.#state);
    }
    if (params === null) {
      throw new TypeError('Invalid parameters: params must not be null');
    }
    if (typeof params !== 'object') {
      throw new TypeError('Invalid parameters: params must be an object');
    }
    if (typeof params.needsDiscard !== 'boolean') {
      throw new TypeError('Invalid parameters: needsDiscard must be boolean');
    }

    const fromState = this.#state;
    if (params.needsDiscard === true) {
      this.#state = BattleState.DISCARD_WAIT;
    } else {
      this.#state = BattleState.BATTLE_END;
    }

    return {
      fromState: fromState,
      toState: this.#state,
      context: {
        needsDiscard: params.needsDiscard
      }
    };
  }

  /**
   * アイテム破棄の完了
   */
  resolveDiscard() {
    if (this.#state !== BattleState.DISCARD_WAIT) {
      throw new Error('Invalid state transition: cannot resolve discard from ' + this.#state);
    }

    const fromState = this.#state;
    this.#state = BattleState.BATTLE_END;

    return {
      fromState: fromState,
      toState: this.#state,
      context: {}
    };
  }

  /**
   * 敗北判定の解決
   */
  resolveDefeat() {
    let isValid = false;
    if (this.#state === BattleState.ACTION_RESOLVING) {
      isValid = true;
    } else if (this.#state === BattleState.TURN_CHECK) {
      isValid = true;
    }

    if (isValid === false) {
      throw new Error('Invalid state transition: cannot resolve defeat from ' + this.#state);
    }

    const fromState = this.#state;
    this.#state = BattleState.DEFEAT;

    return {
      fromState: fromState,
      toState: this.#state,
      context: {}
    };
  }

  /**
   * 戦闘終了（逃走成功または全滅後の決着）
   */
  endBattle() {
    let isValid = false;
    if (this.#state === BattleState.ESCAPE_SUCCESS) {
      isValid = true;
    } else if (this.#state === BattleState.DEFEAT) {
      isValid = true;
    }

    if (isValid === false) {
      throw new Error('Invalid state transition: cannot end battle from ' + this.#state);
    }

    const fromState = this.#state;
    this.#state = BattleState.BATTLE_END;

    return {
      fromState: fromState,
      toState: this.#state,
      context: {}
    };
  }
}