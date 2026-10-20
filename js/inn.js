// FILE_ENTRY: js/inn.js
import { sound } from './sound.js';
import { i18n } from './i18n.js';

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

  open(npc) {
    const cost = npc.cost || 10;
    this.msgWin.openMenu(
      i18n.t('inn.greeting', { cost: String(cost) }),
      [i18n.t('common.yes'), i18n.t('common.no')],
      (selectedIndex) => {
        if (selectedIndex === 0) {
          if (!this.player.useGold(cost)) {
            sound.playBump();
            this.msgWin.open([i18n.t('inn.gold_shortage')]);
          } else {
            this.msgWin.close();
            this.startStaying();
          }
        } else {
          this.msgWin.open([i18n.t('inn.goodbye')]);
        }
      },
      () => {
        this.msgWin.open([i18n.t('inn.goodbye')]);
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
      this.msgWin.open([i18n.t('inn.morning')]);
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