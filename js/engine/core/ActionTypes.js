/**
 * ActionTypes.js
 * プラットフォームドライバ（入力・UI）からコアエンジンへの操作要求識別子の定数定義。
 * 外部依存を持たない純粋データ構造であり、完全な不変性（ディープフリーズ）を保証します。
 */

export const ActionTypes = Object.freeze({
  PLAYER: Object.freeze({
    MOVE: 'player:move',
    INTERACT: 'player:interact',
  }),
  MENU: Object.freeze({
    OPEN: 'menu:open',
    CLOSE: 'menu:close',
    SELECT: 'menu:select',
    EXECUTE: 'menu:execute',
    CANCEL: 'menu:cancel',
  }),
  BATTLE: Object.freeze({
    SELECT_COMMAND: 'battle:select_command',
    SELECT_TARGET: 'battle:select_target',
    EXECUTE_ACTION: 'battle:execute_action',
    ESCAPE: 'battle:escape',
  }),
  SYSTEM: Object.freeze({
    CHANGE_MAP: 'system:change_map',
    OPEN_SLOT_DIALOG: 'system:open_slot_dialog',
    RETURN_TO_TITLE: 'system:return_to_title',
    SAVE_GAME: 'system:save_game',
    LOAD_GAME: 'system:load_game',
  }),
});