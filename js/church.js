// FILE_ENTRY: js/church.js
import { sound } from './sound.js';
import { i18n } from './i18n.js';

export let CHURCH_DATA = null;

export async function initChurchData() {
  try {
    const res = await fetch('data/facilities/church.json');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status} on church.json`);
    CHURCH_DATA = await res.json();
    console.log("CHURCH_DATA initialized successfully from church.json.");
  } catch (error) {
    console.error("Failed to fetch church data:", error);
    throw error;
  }
}

export class ChurchManager {
  constructor(player, messageWindow) {
    this.player = player;
    this.msgWin = messageWindow;
  }

  _ensureData() {
    if (!CHURCH_DATA) throw new Error('[DataValidationError] ChurchManager: CHURCH_DATA is not initialized.');
  }

  getMessage(key) {
    this._ensureData();
    const msgObj = CHURCH_DATA.messages[key];
    if (!msgObj) throw new Error(`[DataValidationError] ChurchManager: message key "${key}" not found.`);
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
      if (npc && npc.returnPoint) {
        this.player.returnPoint = { ...npc.returnPoint };
      }
      sound.playVictory();
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
