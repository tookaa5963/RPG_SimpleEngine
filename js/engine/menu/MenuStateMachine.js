// FILE_ENTRY: js/engine/menu/MenuStateMachine.js
/**
 * js/engine/menu/MenuStateMachine.js
 * メニュー階層・カーソル位置・選択遷移を管理する純粋ステートマシン（Core層）
 */

const VALID_PHASES = [
  'ROOT',
  'ITEM_SELECT',
  'ITEM_ACTION',
  'DROP_CONFIRM',
  'QUIT_CONFIRM'
];

const VALID_COMMANDS = [
  'UP',
  'DOWN',
  'LEFT',
  'RIGHT',
  'CONFIRM',
  'CANCEL'
];

const VALID_ITEM_MODES = [
  'magic',
  'item',
  'equip'
];

function isPositiveInteger(value) {
  if (typeof value !== 'number') {
    return false;
  }
  if (!Number.isInteger(value)) {
    return false;
  }
  if (value < 1) {
    return false;
  }
  return true;
}

export class MenuStateMachine {
  constructor(options) {
    let rootCount = 7;
    let actionCount = 3;

    if (options !== undefined) {
      if (typeof options !== 'object') {
        throw new Error('MenuStateMachine: options はオブジェクトである必要があります');
      }
      if (options === null) {
        throw new Error('MenuStateMachine: options に null は指定できません');
      }
      if (Array.isArray(options)) {
        throw new Error('MenuStateMachine: options に配列は指定できません');
      }

      if (options.rootCommandCount !== undefined) {
        if (!isPositiveInteger(options.rootCommandCount)) {
          throw new Error('MenuStateMachine: rootCommandCount は正の整数である必要があります');
        }
        rootCount = options.rootCommandCount;
      }

      if (options.actionCommandCount !== undefined) {
        if (!isPositiveInteger(options.actionCommandCount)) {
          throw new Error('MenuStateMachine: actionCommandCount は正の整数である必要があります');
        }
        actionCount = options.actionCommandCount;
      }
    }

    this.rootCommandCount = rootCount;
    this.actionCommandCount = actionCount;
    this._resetState();
  }

  _resetState() {
    this.phase = 'ROOT';
    this.rootIndex = 0;
    this.itemList = [];
    this.itemIndex = 0;
    this.currentMode = null;
    this.actionIndex = 0;
    this.selectedItem = null;
    this.dropConfirmIndex = 1;
    this.quitConfirmIndex = 1;
  }

  open() {
    this._resetState();
    return {
      phase: 'ROOT',
      se: null,
      intent: 'OPENED',
      payload: null
    };
  }

  setPhase(nextPhase) {
    if (typeof nextPhase !== 'string') {
      throw new Error('MenuStateMachine.setPhase: nextPhase は文字列である必要があります');
    }
    if (!VALID_PHASES.includes(nextPhase)) {
      throw new Error('MenuStateMachine.setPhase: 不正なフェーズが指定されました: ' + nextPhase);
    }
    this.phase = nextPhase;
  }

  enterItemSelect(mode, items) {
    if (typeof mode !== 'string') {
      throw new Error('MenuStateMachine.enterItemSelect: mode は文字列である必要があります');
    }
    if (!VALID_ITEM_MODES.includes(mode)) {
      throw new Error('MenuStateMachine.enterItemSelect: 不正なモードが指定されました: ' + mode);
    }
    if (!Array.isArray(items)) {
      throw new Error('MenuStateMachine.enterItemSelect: items は配列である必要があります');
    }
    if (items.length === 0) {
      throw new Error('MenuStateMachine.enterItemSelect: items に空配列は指定できません');
    }

    for (let i = 0; i < items.length; i += 1) {
      const entry = items[i];
      if (typeof entry !== 'object') {
        throw new Error('MenuStateMachine.enterItemSelect: items の要素はオブジェクトである必要があります');
      }
      if (entry === null) {
        throw new Error('MenuStateMachine.enterItemSelect: items の要素に null は指定できません');
      }
      if (typeof entry.id !== 'string') {
        throw new Error('MenuStateMachine.enterItemSelect: items の要素には文字列の id プロパティが必要です');
      }
      if (entry.id.length === 0) {
        throw new Error('MenuStateMachine.enterItemSelect: items の要素の id は空文字にできません');
      }
    }

    this.currentMode = mode;
    this.itemList = items.slice();
    this.itemIndex = 0;
    this.phase = 'ITEM_SELECT';

    return {
      phase: 'ITEM_SELECT',
      se: null,
      intent: 'ENTERED_ITEM_SELECT',
      payload: { mode: mode }
    };
  }

  enterDropConfirm() {
    if (this.phase !== 'ITEM_ACTION') {
      throw new Error('MenuStateMachine.enterDropConfirm: ITEM_ACTION 以外のフェーズでは遷移できません');
    }
    if (this.selectedItem === null) {
      throw new Error('MenuStateMachine.enterDropConfirm: selectedItem が未選択の状態では遷移できません');
    }
    if (this.selectedItem === undefined) {
      throw new Error('MenuStateMachine.enterDropConfirm: selectedItem が未定義の状態では遷移できません');
    }

    this.dropConfirmIndex = 1;
    this.phase = 'DROP_CONFIRM';

    return {
      phase: 'DROP_CONFIRM',
      se: null,
      intent: 'ENTERED_DROP_CONFIRM',
      payload: { item: this.selectedItem }
    };
  }

  handleCommand(command) {
    if (typeof command !== 'string') {
      throw new Error('MenuStateMachine.handleCommand: command は文字列である必要があります');
    }
    if (!VALID_COMMANDS.includes(command)) {
      throw new Error('MenuStateMachine.handleCommand: 未知のコマンドが指定されました: ' + command);
    }

    if (this.phase === 'ROOT') {
      return this._handleRootCommand(command);
    }
    if (this.phase === 'QUIT_CONFIRM') {
      return this._handleQuitConfirmCommand(command);
    }
    if (this.phase === 'ITEM_SELECT') {
      return this._handleItemSelectCommand(command);
    }
    if (this.phase === 'ITEM_ACTION') {
      return this._handleItemActionCommand(command);
    }
    if (this.phase === 'DROP_CONFIRM') {
      return this._handleDropConfirmCommand(command);
    }

    throw new Error('MenuStateMachine.handleCommand: 不正な内部フェーズです: ' + String(this.phase));
  }

  _handleRootCommand(command) {
    if (command === 'UP') {
      this.rootIndex = (this.rootIndex - 1 + this.rootCommandCount) % this.rootCommandCount;
      return {
        phase: 'ROOT',
        se: 'submit',
        intent: 'CURSOR_MOVED',
        payload: { index: this.rootIndex }
      };
    }

    if (command === 'DOWN') {
      this.rootIndex = (this.rootIndex + 1) % this.rootCommandCount;
      return {
        phase: 'ROOT',
        se: 'submit',
        intent: 'CURSOR_MOVED',
        payload: { index: this.rootIndex }
      };
    }

    if (command === 'LEFT') {
      return {
        phase: 'ROOT',
        se: null,
        intent: 'NONE',
        payload: null
      };
    }

    if (command === 'RIGHT') {
      return {
        phase: 'ROOT',
        se: null,
        intent: 'NONE',
        payload: null
      };
    }

    if (command === 'CANCEL') {
      return {
        phase: 'ROOT',
        se: 'submit',
        intent: 'CLOSE_MENU',
        payload: null
      };
    }

    if (command === 'CONFIRM') {
      if (this.rootIndex === this.rootCommandCount - 1) {
        this.quitConfirmIndex = 1;
        this.phase = 'QUIT_CONFIRM';
        return {
          phase: 'QUIT_CONFIRM',
          se: 'submit',
          intent: 'ENTERED_QUIT_CONFIRM',
          payload: null
        };
      }
      return {
        phase: 'ROOT',
        se: 'submit',
        intent: 'ROOT_SELECTED',
        payload: { index: this.rootIndex }
      };
    }

    throw new Error('MenuStateMachine._handleRootCommand: 未処理のコマンドです');
  }

  _handleQuitConfirmCommand(command) {
    if (command === 'UP') {
      this._toggleQuitConfirmIndex();
      return {
        phase: 'QUIT_CONFIRM',
        se: 'submit',
        intent: 'CURSOR_MOVED',
        payload: { index: this.quitConfirmIndex }
      };
    }

    if (command === 'DOWN') {
      this._toggleQuitConfirmIndex();
      return {
        phase: 'QUIT_CONFIRM',
        se: 'submit',
        intent: 'CURSOR_MOVED',
        payload: { index: this.quitConfirmIndex }
      };
    }

    if (command === 'LEFT') {
      this._toggleQuitConfirmIndex();
      return {
        phase: 'QUIT_CONFIRM',
        se: 'submit',
        intent: 'CURSOR_MOVED',
        payload: { index: this.quitConfirmIndex }
      };
    }

    if (command === 'RIGHT') {
      this._toggleQuitConfirmIndex();
      return {
        phase: 'QUIT_CONFIRM',
        se: 'submit',
        intent: 'CURSOR_MOVED',
        payload: { index: this.quitConfirmIndex }
      };
    }

    if (command === 'CANCEL') {
      this.phase = 'ROOT';
      return {
        phase: 'ROOT',
        se: 'cancel',
        intent: 'BACK_TO_ROOT',
        payload: null
      };
    }

    if (command === 'CONFIRM') {
      if (this.quitConfirmIndex === 0) {
        return {
          phase: 'QUIT_CONFIRM',
          se: 'submit',
          intent: 'CONFIRM_QUIT',
          payload: null
        };
      }
      this.phase = 'ROOT';
      return {
        phase: 'ROOT',
        se: 'submit',
        intent: 'BACK_TO_ROOT',
        payload: null
      };
    }

    throw new Error('MenuStateMachine._handleQuitConfirmCommand: 未処理のコマンドです');
  }

  _toggleQuitConfirmIndex() {
    if (this.quitConfirmIndex === 0) {
      this.quitConfirmIndex = 1;
    } else {
      this.quitConfirmIndex = 0;
    }
  }

  _handleItemSelectCommand(command) {
    if (!Array.isArray(this.itemList)) {
      throw new Error('MenuStateMachine._handleItemSelectCommand: itemList が配列ではありません');
    }
    if (this.itemList.length === 0) {
      throw new Error('MenuStateMachine._handleItemSelectCommand: itemList が空の状態で操作されました');
    }

    if (command === 'UP') {
      this.itemIndex = (this.itemIndex - 1 + this.itemList.length) % this.itemList.length;
      return {
        phase: 'ITEM_SELECT',
        se: 'submit',
        intent: 'CURSOR_MOVED',
        payload: { index: this.itemIndex }
      };
    }

    if (command === 'DOWN') {
      this.itemIndex = (this.itemIndex + 1) % this.itemList.length;
      return {
        phase: 'ITEM_SELECT',
        se: 'submit',
        intent: 'CURSOR_MOVED',
        payload: { index: this.itemIndex }
      };
    }

    if (command === 'LEFT') {
      return {
        phase: 'ITEM_SELECT',
        se: null,
        intent: 'NONE',
        payload: null
      };
    }

    if (command === 'RIGHT') {
      return {
        phase: 'ITEM_SELECT',
        se: null,
        intent: 'NONE',
        payload: null
      };
    }

    if (command === 'CANCEL') {
      this.phase = 'ROOT';
      return {
        phase: 'ROOT',
        se: 'submit',
        intent: 'BACK_TO_ROOT',
        payload: null
      };
    }

    if (command === 'CONFIRM') {
      const selected = this.itemList[this.itemIndex];
      if (typeof selected !== 'object') {
        throw new Error('MenuStateMachine._handleItemSelectCommand: 選択項目が不正です');
      }
      if (selected === null) {
        throw new Error('MenuStateMachine._handleItemSelectCommand: 選択項目が null です');
      }

      if (selected.id === 'cancel') {
        this.phase = 'ROOT';
        return {
          phase: 'ROOT',
          se: 'submit',
          intent: 'BACK_TO_ROOT',
          payload: null
        };
      }

      if (this.currentMode === 'magic') {
        return {
          phase: 'ITEM_SELECT',
          se: 'submit',
          intent: 'SELECT_MAGIC',
          payload: { item: selected }
        };
      }

      if (this.currentMode === 'equip') {
        return {
          phase: 'ITEM_SELECT',
          se: 'submit',
          intent: 'SELECT_EQUIP',
          payload: { item: selected }
        };
      }

      if (this.currentMode === 'item') {
        this.selectedItem = selected;
        this.actionIndex = 0;
        this.phase = 'ITEM_ACTION';
        return {
          phase: 'ITEM_ACTION',
          se: 'submit',
          intent: 'ENTERED_ITEM_ACTION',
          payload: { item: selected }
        };
      }

      throw new Error('MenuStateMachine._handleItemSelectCommand: 不正な currentMode です');
    }

    throw new Error('MenuStateMachine._handleItemSelectCommand: 未処理のコマンドです');
  }

  _handleItemActionCommand(command) {
    if (command === 'UP') {
      this.actionIndex = (this.actionIndex - 1 + this.actionCommandCount) % this.actionCommandCount;
      return {
        phase: 'ITEM_ACTION',
        se: 'submit',
        intent: 'CURSOR_MOVED',
        payload: { index: this.actionIndex }
      };
    }

    if (command === 'DOWN') {
      this.actionIndex = (this.actionIndex + 1) % this.actionCommandCount;
      return {
        phase: 'ITEM_ACTION',
        se: 'submit',
        intent: 'CURSOR_MOVED',
        payload: { index: this.actionIndex }
      };
    }

    if (command === 'LEFT') {
      return {
        phase: 'ITEM_ACTION',
        se: null,
        intent: 'NONE',
        payload: null
      };
    }

    if (command === 'RIGHT') {
      return {
        phase: 'ITEM_ACTION',
        se: null,
        intent: 'NONE',
        payload: null
      };
    }

    if (command === 'CANCEL') {
      this.phase = 'ITEM_SELECT';
      return {
        phase: 'ITEM_SELECT',
        se: 'submit',
        intent: 'BACK_TO_ITEM_SELECT',
        payload: null
      };
    }

    if (command === 'CONFIRM') {
      if (this.actionIndex === 0) {
        return {
          phase: 'ITEM_ACTION',
          se: 'submit',
          intent: 'ACTION_USE',
          payload: { item: this.selectedItem }
        };
      }
      if (this.actionIndex === 1) {
        return {
          phase: 'ITEM_ACTION',
          se: 'submit',
          intent: 'ACTION_DROP_REQUEST',
          payload: { item: this.selectedItem }
        };
      }
      if (this.actionIndex === 2) {
        this.phase = 'ITEM_SELECT';
        return {
          phase: 'ITEM_SELECT',
          se: 'submit',
          intent: 'BACK_TO_ITEM_SELECT',
          payload: null
        };
      }
      throw new Error('MenuStateMachine._handleItemActionCommand: 不正な actionIndex です');
    }

    throw new Error('MenuStateMachine._handleItemActionCommand: 未処理のコマンドです');
  }

  _handleDropConfirmCommand(command) {
    if (command === 'UP') {
      this._toggleDropConfirmIndex();
      return {
        phase: 'DROP_CONFIRM',
        se: 'submit',
        intent: 'CURSOR_MOVED',
        payload: { index: this.dropConfirmIndex }
      };
    }

    if (command === 'DOWN') {
      this._toggleDropConfirmIndex();
      return {
        phase: 'DROP_CONFIRM',
        se: 'submit',
        intent: 'CURSOR_MOVED',
        payload: { index: this.dropConfirmIndex }
      };
    }

    if (command === 'LEFT') {
      return {
        phase: 'DROP_CONFIRM',
        se: null,
        intent: 'NONE',
        payload: null
      };
    }

    if (command === 'RIGHT') {
      return {
        phase: 'DROP_CONFIRM',
        se: null,
        intent: 'NONE',
        payload: null
      };
    }

    if (command === 'CANCEL') {
      this.phase = 'ITEM_ACTION';
      return {
        phase: 'ITEM_ACTION',
        se: 'submit',
        intent: 'BACK_TO_ITEM_ACTION',
        payload: null
      };
    }

    if (command === 'CONFIRM') {
      if (this.dropConfirmIndex === 0) {
        return {
          phase: 'DROP_CONFIRM',
          se: 'submit',
          intent: 'CONFIRM_DROP',
          payload: { item: this.selectedItem }
        };
      }
      this.phase = 'ITEM_ACTION';
      return {
        phase: 'ITEM_ACTION',
        se: 'submit',
        intent: 'BACK_TO_ITEM_ACTION',
        payload: null
      };
    }

    throw new Error('MenuStateMachine._handleDropConfirmCommand: 未処理のコマンドです');
  }

  _toggleDropConfirmIndex() {
    if (this.dropConfirmIndex === 0) {
      this.dropConfirmIndex = 1;
    } else {
      this.dropConfirmIndex = 0;
    }
  }
}