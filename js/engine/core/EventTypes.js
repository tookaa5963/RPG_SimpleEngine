/**
 * EventTypes.js
 * システム全体で送受信されるイベント識別子の定数定義。
 * Core層・Driver層の双方が参照する共通定義であり、外部依存を持たない純粋データ構造です。
 */

export const EventTypes = Object.freeze({
  ACTOR: Object.freeze({
    HP_CHANGED: 'actor:hp_changed',
    MP_CHANGED: 'actor:mp_changed',
    STATUS_ADDED: 'actor:status_added',
    STATUS_REMOVED: 'actor:status_removed',
    DIED: 'actor:died',
  }),
  INVENTORY: Object.freeze({
    ITEM_CONSUMED: 'inventory:item_consumed',
    ITEM_OBTAINED: 'inventory:item_obtained',
  }),
  EFFECT: Object.freeze({
    APPLIED: 'effect:applied',
  }),
  BATTLE: Object.freeze({
    PHASE_CHANGED: 'battle:phase_changed',
    ACTION_EXECUTED: 'battle:action_executed',
  }),
  SYSTEM: Object.freeze({
    MESSAGE_LOG: 'system:message_log',
    AUDIO_PLAY_SE: 'system:audio_play_se',
    AUDIO_PLAY_BGM: 'system:audio_play_bgm',
    AUDIO_STOP_BGM: 'system:audio_stop_bgm',
    REQUEST_MAP_CHANGE: 'system:request_map_change',
    REQUEST_SLOT_DIALOG: 'system:request_slot_dialog',
    REQUEST_RETURN_TITLE: 'system:request_return_title',
  }),
});