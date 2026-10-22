// FILE_ENTRY: js/inn.js
import { sound } from './sound.js';
import { i18n } from './i18n.js';

export let INN_DATA = null;

export async function initInnData() {
  try {
    const res = await fetch('data/facilities/inn.json');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status} on inn.json`);
    INN_DATA = await res.json();
    console.log("INN_DATA initialized successfully from inn.json.");
  } catch (error) {
    console.error("Failed to fetch inn data:", error);
    throw error;
  }
}

export class InnManager {
  constructor(player, messageWindow, getCurrentMap, onFinish) {
    this.player = player;
    this.msgWin = messageWindow;
    this.getCurrentMap = getCurrentMap;
    this.onFinish = onFinish;

    this.isStaying = false;
    this.fadeTimer = 0;
    this.FADE_MAX = 150;
  }

  _ensureData() {
    if (!INN_DATA) throw new Error('[DataValidationError] InnManager: INN_DATA is not initialized.');
  }

  getMessage(key, params = {}) {
    this._ensureData();
    const msgObj = INN_DATA.messages[key];
    if (!msgObj) throw new Error(`[DataValidationError] InnManager: message key "${key}" not found.`);
    let text = i18n.resolve(msgObj);
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
    return text;
  }

  open(npc) {
    this._ensureData();
    const cost = npc.cost || INN_DATA.defaultCost || 10;
    this.msgWin.openMenu(
      this.getMessage('greeting', { cost: String(cost) }),
      [i18n.t('common.yes'), i18n.t('common.no')],
      (selectedIndex) => {
        if (selectedIndex === 0) {
          if (!this.player.useGold(cost)) {
            sound.playBump();
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
    sound.stopBgm();
    sound.playInn();
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
        sound.playBgm(currentMap.bgm);
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
