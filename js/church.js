// FILE_ENTRY: js/church.js
import { i18n } from './i18n.js';

export let CHURCH_DATA = null;

export async function initChurchData() {
  try {
    const res = await fetch('data/facilities/church.json');
    if (!res.ok) {
      throw new Error(`[DataValidationError] initChurchData: HTTP error! status: ${res.status} on church.json (\u5024: ${res.status}, \u578b: ${typeof res.status})`);
    }
    CHURCH_DATA = await res.json();
    console.log('CHURCH_DATA initialized successfully from church.json.');
  } catch (error) {
    console.error('Failed to fetch church data:', error);
    throw error;
  }
}

export class ChurchManager {
  constructor(player, messageWindow, options = {}) {
    if (!player) {
      throw new Error(`[LogicValidationError] ChurchManager.constructor: \u30d7\u30ed\u30d1\u30c6\u30a3 "player" \u304c\u4e0d\u6b63\u3067\u3059 (\u5024: ${player}, \u578b: ${typeof player})`);
    }
    if (!messageWindow) {
      throw new Error(`[LogicValidationError] ChurchManager.constructor: \u30d7\u30ed\u30d1\u30c6\u30a3 "messageWindow" \u304c\u4e0d\u6b63\u3067\u3059 (\u5024: ${messageWindow}, \u578b: ${typeof messageWindow})`);
    }
    this.player = player;
    this.msgWin = messageWindow;
    this.onPlaySound = (options && typeof options.onPlaySound === 'function') ? options.onPlaySound : null;
  }

  _ensureData() {
    if (!CHURCH_DATA) {
      throw new Error('[DataValidationError] ChurchManager: CHURCH_DATA is not initialized.');
    }
  }

  getMessage(key) {
    this._ensureData();
    if (typeof key !== 'string') {
      throw new Error(`[LogicValidationError] ChurchManager.getMessage: \u30d7\u30ed\u30d1\u30c6\u30a3 "key" \u304c\u4e0d\u6b63\u3067\u3059 (\u5024: ${key}, \u578b: ${typeof key})`);
    }
    const msgObj = CHURCH_DATA.messages[key];
    if (!msgObj) {
      throw new Error(`[DataValidationError] ChurchManager.getMessage: \u30d7\u30ed\u30d1\u30c6\u30a3 "${key}" \u304c\u4e0d\u6b63\u3067\u3059 (\u5024: undefined, \u578b: undefined)`);
    }
    return i18n.resolve(msgObj);
  }

  open(npc) {
    this._ensureData();
    this.msgWin.openMenu(
      this.getMessage('greeting'),
      [
        i18n.resolve(CHURCH_DATA.commands.talk),
        i18n.resolve(CHURCH_DATA.commands.set_return),
        i18n.resolve(CHURCH_DATA.commands.leave)
      ],
      (selectedIndex) => this.handleMenuSelect(selectedIndex, npc),
      () => this.handleCancel()
    );
  }

  setReturnPoint(npc) {
    if (npc && npc.returnPoint) {
      this.player.returnPoint = { ...npc.returnPoint };
    }
    if (this.onPlaySound) {
      this.onPlaySound('victory');
    }
    return {
      success: true,
      soundId: 'victory',
      returnPoint: this.player.returnPoint
    };
  }

  handleMenuSelect(index, npc) {
    if (index === 0) {
      if (this.player.flags && !this.player.flags.talkedToScholar) {
        this.msgWin.open([
          this.getMessage('hint_scholar_1'),
          this.getMessage('hint_scholar_2')
        ]);
      } else {
        this.msgWin.open([
          this.getMessage('hint_general')
        ]);
      }
    } else if (index === 1) {
      this.setReturnPoint(npc);
      this.msgWin.open([
        this.getMessage('return_registered')
      ]);
    } else {
      this.handleCancel();
    }
  }

  handleCancel() {
    this.msgWin.open([this.getMessage('blessing')]);
  }
}
