// FILE_ENTRY: js/church.js
import { sound } from './sound.js';
import { i18n } from './i18n.js';

export class ChurchManager {
  constructor(player, messageWindow) {
    this.player = player;
    this.msgWin = messageWindow;
  }

  open(npc) {
    this.msgWin.openMenu(
      i18n.t('church.greeting'),
      [
        i18n.t('church.talk'),
        i18n.t('church.set_return'),
        i18n.t('church.leave')
      ],
      (selectedIndex) => this.handleMenuSelect(selectedIndex, npc),
      () => this.handleCancel()
    );
  }

  handleMenuSelect(index, npc) {
    if (index === 0) {
      if (this.player.flags && !this.player.flags.talkedToScholar) {
        this.msgWin.open([
          i18n.t('church.hint_scholar_1'),
          i18n.t('church.hint_scholar_2')
        ]);
      } else {
        this.msgWin.open([
          i18n.t('church.hint_general')
        ]);
      }
    } else if (index === 1) {
      if (npc && npc.returnPoint) {
        this.player.returnPoint = { ...npc.returnPoint };
      }
      sound.playVictory();
      this.msgWin.open([
        i18n.t('church.return_registered')
      ]);
    } else {
      this.handleCancel();
    }
  }

  handleCancel() {
    this.msgWin.open([i18n.t('church.blessing')]);
  }
}