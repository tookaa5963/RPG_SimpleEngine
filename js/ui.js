import { maps } from './maps.js';
// FILE_ENTRY: js/ui.js
import { i18n } from './i18n.js';
import { ITEM_DB } from './items.js';
import { MAX_INVENTORY_CAPACITY } from './player.js';

export function drawFrame(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, w, h);
}

export function drawMessageBox(ctx, x, y, w, h, text, showIndicator = false) {
  drawFrame(ctx, x, y, w, h);
  ctx.fillStyle = '#ffffff';
  ctx.font = '20px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  if (!text) return;
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x + 24, y + 24 + (i * 30));
  }

  if (showIndicator && Math.floor(Date.now() / 400) % 2 === 0) {
    ctx.fillText('▼', x + w - 36, y + h - 32);
  }
}

export function drawListBox(ctx, x, y, items, selectedIndex, visibleCount = 6) {
  const lineH = 32;
  const paddingY = 16;
  const h = paddingY * 2 + visibleCount * lineH;

  let maxLen = 0;
  items.forEach(it => {
    if (it && it.length > maxLen) maxLen = it.length;
  });
  const isWestern = i18n.currentLang !== 'ja';
  const charWidth = isWestern ? 11 : 20;
  const w = Math.max(160, maxLen * charWidth + 56);

  drawFrame(ctx, x, y, w, h);

  ctx.fillStyle = '#ffffff';
  ctx.font = '18px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const startIndex = Math.max(0, Math.min(selectedIndex - Math.floor(visibleCount / 2), items.length - visibleCount));
  const endIndex = Math.min(items.length, startIndex + visibleCount);

  for (let i = startIndex; i < endIndex; i++) {
    const drawY = y + paddingY + (i - startIndex) * lineH;
    ctx.fillText(items[i], x + 36, drawY);
    if (i === selectedIndex) {
      ctx.fillText('▶', x + 14, drawY);
    }
  }
}

export class UIManager {
  constructor() {
    this.elements = {
      lv: document.getElementById('ui-lv'),
      hp: document.getElementById('ui-hp'),
      mp: document.getElementById('ui-mp'),
      hpBar: document.getElementById('ui-hp-bar'),
      mpBar: document.getElementById('ui-mp-bar'),
      atk: document.getElementById('ui-atk'),
      def: document.getElementById('ui-def'),
      spd: document.getElementById('ui-spd'),
      exp: document.getElementById('ui-exp'),
      gold: document.getElementById('ui-gold'),
      wpn: document.getElementById('ui-wpn'),
      arm: document.getElementById('ui-arm'),
      sld: document.getElementById('ui-sld'),
      inventoryList: document.getElementById('ui-inventory'),
      inventoryTitle: document.getElementById('ui-label-items') || document.querySelector('#right-sidebar h3'),
      statusTitle: document.getElementById('ui-label-status') || document.querySelector('#left-sidebar h3'),
      equipLabel: document.getElementById('ui-label-equip'),
      returnPointLabel: document.getElementById('ui-label-return-point'),
      returnPointName: document.getElementById('ui-return-point-name'),
      controlsText: document.getElementById('ui-controls-text')
    };
  }

  getReturnPointLabelText() {
    if (i18n.currentLang === 'en') return 'Return Point';
    if (i18n.currentLang === 'es') return 'Punto de retorno';
    return '帰還地';
  }

  updateSidebars(playerStats) {
    if (!playerStats) return;

    if (this.elements.statusTitle) {
      this.elements.statusTitle.textContent = i18n.t('ui.status');
    }
    if (this.elements.equipLabel) {
      this.elements.equipLabel.textContent = i18n.t('ui.equipment');
    }
    if (this.elements.returnPointLabel) {
      this.elements.returnPointLabel.textContent = this.getReturnPointLabelText();
    }
    if (this.elements.returnPointName) {
      const mapId = playerStats.returnPoint ? playerStats.returnPoint.mapId : null;
      this.elements.returnPointName.textContent = mapId ? ((maps[mapId]?.name || mapId) || mapId) : i18n.t('ui.none');
    }
    if (this.elements.controlsText) {
      this.elements.controlsText.innerHTML = i18n.t('ui.controls').replace(/\n/g, '<br>');
    }

    if (this.elements.lv) this.elements.lv.textContent = playerStats.level;

    const poisonMark = playerStats.isPoisoned ? i18n.t('ui.poison_badge') : '';
    if (this.elements.hp) {
      this.elements.hp.textContent = `${playerStats.hp} / ${playerStats.maxHp}${poisonMark}`;
    }

    if (this.elements.hpBar) {
      const hpRatio = playerStats.maxHp > 0 ? Math.max(0, Math.min(1, playerStats.hp / playerStats.maxHp)) : 0;
      this.elements.hpBar.style.width = `${(hpRatio * 100).toFixed(1)}%`;

      if (playerStats.isPoisoned) {
        this.elements.hpBar.style.backgroundColor = '#9b59b6';
      } else if (hpRatio <= 0.25) {
        this.elements.hpBar.style.backgroundColor = '#e74c3c';
      } else if (hpRatio <= 0.5) {
        this.elements.hpBar.style.backgroundColor = '#f1c40f';
      } else {
        this.elements.hpBar.style.backgroundColor = '#2ecc71';
      }
    }

    if (this.elements.mp) {
      this.elements.mp.textContent = `${playerStats.mp} / ${playerStats.maxMp}`;
    }

    if (this.elements.mpBar) {
      const mpRatio = playerStats.maxMp > 0 ? Math.max(0, Math.min(1, playerStats.mp / playerStats.maxMp)) : 0;
      this.elements.mpBar.style.width = `${(mpRatio * 100).toFixed(1)}%`;
      this.elements.mpBar.style.backgroundColor = '#3498db';
    }

    if (this.elements.atk) this.elements.atk.textContent = playerStats.atk;
    if (this.elements.def) this.elements.def.textContent = playerStats.def;
    if (this.elements.spd) this.elements.spd.textContent = playerStats.spd;
    if (this.elements.exp) this.elements.exp.textContent = playerStats.exp;
    if (this.elements.gold) this.elements.gold.textContent = playerStats.gold;

    const noneText = i18n.t('ui.none');
    if (this.elements.wpn) {
      this.elements.wpn.textContent = playerStats.equipment.weapon && ITEM_DB[playerStats.equipment.weapon] ? ITEM_DB[playerStats.equipment.weapon].name : noneText;
    }
    if (this.elements.arm) {
      this.elements.arm.textContent = playerStats.equipment.armor && ITEM_DB[playerStats.equipment.armor] ? ITEM_DB[playerStats.equipment.armor].name : noneText;
    }
    if (this.elements.sld) {
      this.elements.sld.textContent = playerStats.equipment.shield && ITEM_DB[playerStats.equipment.shield] ? ITEM_DB[playerStats.equipment.shield].name : noneText;
    }

    const count = typeof playerStats.getInventoryCount === 'function' ? playerStats.getInventoryCount() : 0;
    if (this.elements.inventoryTitle) {
      this.elements.inventoryTitle.textContent = `${i18n.t('ui.items')} (${count}/${MAX_INVENTORY_CAPACITY})`;
    }

    if (this.elements.inventoryList) {
      this.elements.inventoryList.innerHTML = '';
      for (const [id, qty] of Object.entries(playerStats.inventory)) {
        if (qty > 0 && ITEM_DB[id]) {
          let displayCount = qty;
          if (playerStats.equipment.weapon === id) displayCount--;
          if (playerStats.equipment.armor === id) displayCount--;
          if (playerStats.equipment.shield === id) displayCount--;

          if (displayCount > 0) {
            const li = document.createElement('li');
            const nameSpan = document.createElement('span');
            nameSpan.textContent = ITEM_DB[id].name;
            const countSpan = document.createElement('span');
            countSpan.textContent = displayCount;
            li.appendChild(nameSpan);
            li.appendChild(countSpan);
            this.elements.inventoryList.appendChild(li);
          }
        }
      }
    }
  }
}