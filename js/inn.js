// FILE_ENTRY: js/inn.js
import { i18n } from './i18n.js';

export let INN_DATA = null;

export async function initInnData() {
  try {
    const res = await fetch('data/facilities/inn.json');
    if (!res.ok) {
      throw new Error(`[DataValidationError] initInnData: HTTP error! status: ${res.status} on inn.json (\u5024: ${res.status}, \u578b: ${typeof res.status})`);
    }
    INN_DATA = await res.json();
    console.log('INN_DATA initialized successfully from inn.json.');
  } catch (error) {
    console.error('Failed to fetch inn data:', error);
    throw error;
  }
}

export class InnManager {
  constructor(player, messageWindow, getCurrentMap, onFinish, options = {}) {
    if (!player) {
      throw new Error(`[LogicValidationError] InnManager.constructor: \u30d7\u30ed\u30d1\u30c6\u30a3 "player" \u304c\u4e0d\u6b63\u3067\u3059 (\u5024: ${player}, \u578b: ${typeof player})`);
    }
    if (!messageWindow) {
      throw new Error(`[LogicValidationError] InnManager.constructor: \u30d7\u30ed\u30d1\u30c6\u30a3 "messageWindow" \u304c\u4e0d\u6b63\u3067\u3059 (\u5024: ${messageWindow}, \u578b: ${typeof messageWindow})`);
    }
    this.player = player;
    this.msgWin = messageWindow;
    this.getCurrentMap = (typeof getCurrentMap === 'function') ? getCurrentMap : null;
    this.onFinish = (typeof onFinish === 'function') ? onFinish : null;
    this.onAudio = (options && typeof options.onAudio === 'function') ? options.onAudio : null;

    this.isStaying = false;
    this.fadeTimer = 0;
    this.FADE_MAX = 150;
  }

  _ensureData() {
    if (!INN_DATA) {
      throw new Error('[DataValidationError] InnManager: INN_DATA is not initialized.');
    }
  }

  emitAudio(action, payload = null) {
    if (this.onAudio) {
      this.onAudio(action, payload);
    }
  }

  getMessage(key, params = {}) {
    this._ensureData();
    if (typeof key !== 'string') {
      throw new Error(`[LogicValidationError] InnManager.getMessage: \u30d7\u30ed\u30d1\u30c6\u30a3 "key" \u304c\u4e0d\u6b63\u3067\u3059 (\u5024: ${key}, \u578b: ${typeof key})`);
    }
    const msgObj = INN_DATA.messages[key];
    if (!msgObj) {
      throw new Error(`[DataValidationError] InnManager.getMessage: \u30d7\u30ed\u30d1\u30c6\u30a3 "${key}" \u304c\u4e0d\u6b63\u3067\u3059 (\u5024: undefined, \u578b: undefined)`);
    }
    let text = i18n.resolve(msgObj);
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
    return text;
  }

  open(npc) {
    this._ensureData();
    const cost = (npc && typeof npc.cost === 'number') ? npc.cost : (INN_DATA.defaultCost || 10);
    this.msgWin.openMenu(
      this.getMessage('greeting', { cost: String(cost) }),
      [i18n.t('common.yes'), i18n.t('common.no')],
      (selectedIndex) => {
        if (selectedIndex === 0) {
          if (!this.player.useGold(cost)) {
            this.emitAudio('bump');
            this.msgWin.open([this.getMessage('gold_shortage')]);
          } else {
            this.msgWin.close();
            this.startStaying();
          }
        } else {
          this.msgWin.open([this.getMessage('goodbye')]);
        }
      },
      () => {
        this.msgWin.open([this.getMessage('goodbye')]);
      }
    );
  }

  startStaying() {
    this.isStaying = true;
    this.fadeTimer = this.FADE_MAX;
    this.emitAudio('stopBgm');
    this.emitAudio('inn');
  }

  update() {
    if (!this.isStaying) return;
    this.fadeTimer--;
    if (this.fadeTimer === Math.floor(this.FADE_MAX / 2)) {
      this.player.fullRecovery();
    }
    if (this.fadeTimer <= 0) {
      this.isStaying = false;
      const currentMap = this.getCurrentMap ? this.getCurrentMap() : null;
      if (currentMap && currentMap.bgm) {
        this.emitAudio('playBgm', currentMap.bgm);
      }
      if (this.onFinish) this.onFinish();
      this.msgWin.open([this.getMessage('morning')]);
    }
  }

  draw(ctx, canvas) {
    if (!this.isStaying) return;
    const half = this.FADE_MAX / 2;
    let alpha = 1.0;
    if (this.fadeTimer > half) {
      alpha = (this.FADE_MAX - this.fadeTimer) / half;
    } else {
      alpha = this.fadeTimer / half;
    }
    ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(1.0, Math.max(0.0, alpha))})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}
