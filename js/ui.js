// FILE_ENTRY: js/ui.js
import { maps } from './maps.js';
import { i18n } from './i18n.js';
import { ITEM_DB } from './items.js';
import { MAX_INVENTORY_CAPACITY } from './player.js';

/**
 * プロトコル第3項準拠の高解像度例外を生成する決定論的ヘルパー
 * @param {string} type 例外種別
 * @param {string} contextId 発生箇所（ファイル名:関数名）
 * @param {string} propName 不正を検知したプロパティ名
 * @param {*} val 実際に渡された値
 * @returns {Error}
 */
export function createProtocolError(type, contextId, propName, val) {
  return new Error(`[${type}] ${contextId}: プロパティ "${propName}" が不正です (値: ${JSON.stringify(val)}, 型: ${typeof val})`);
}

/**
 * 数値型の厳格アサーション
 * @param {string} contextId 
 * @param {string} name 
 * @param {*} val 
 */
function assertNumber(contextId, name, val) {
  if (typeof val !== 'number') {
    throw createProtocolError('TypeError', contextId, name, val);
  }
  if (Number.isNaN(val)) {
    throw createProtocolError('NaNError', contextId, name, val);
  }
}

/**
 * CanvasRenderingContext2D のアサーション
 * @param {string} contextId 
 * @param {*} ctx 
 */
function assertContext(contextId, ctx) {
  if (typeof ctx !== 'object') {
    throw createProtocolError('TypeError', contextId, 'ctx', ctx);
  }
  if (ctx === null) {
    throw createProtocolError('NullContextError', contextId, 'ctx', ctx);
  }
  if (typeof ctx.fillRect !== 'function') {
    throw createProtocolError('InvalidContextError', contextId, 'ctx.fillRect', typeof ctx.fillRect);
  }
}

/**
 * タイトル要素取得用ヘルパー（フォールバック論理和の排除）
 * @param {string} id 
 * @param {string} selector 
 * @returns {Element|null}
 */
function resolveSidebarTitleElement(id, selector) {
  const elById = document.getElementById(id);
  if (elById !== null) {
    return elById;
  }
  return document.querySelector(selector);
}

export function drawFrame(ctx, x, y, w, h) {
  assertContext('ui.js:drawFrame', ctx);
  assertNumber('ui.js:drawFrame', 'x', x);
  assertNumber('ui.js:drawFrame', 'y', y);
  assertNumber('ui.js:drawFrame', 'w', w);
  assertNumber('ui.js:drawFrame', 'h', h);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, w, h);
}

export function drawMessageBox(ctx, x, y, w, h, text, showIndicator = false) {
  assertContext('ui.js:drawMessageBox', ctx);
  assertNumber('ui.js:drawMessageBox', 'x', x);
  assertNumber('ui.js:drawMessageBox', 'y', y);
  assertNumber('ui.js:drawMessageBox', 'w', w);
  assertNumber('ui.js:drawMessageBox', 'h', h);

  if (typeof showIndicator !== 'boolean') {
    throw createProtocolError('TypeError', 'ui.js:drawMessageBox', 'showIndicator', showIndicator);
  }

  drawFrame(ctx, x, y, w, h);
  ctx.fillStyle = '#ffffff';
  ctx.font = '20px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  if (typeof text !== 'string') {
    return;
  }
  if (text.length === 0) {
    return;
  }

  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x + 24, y + 24 + (i * 30));
  }

  if (showIndicator === true) {
    if (Math.floor(Date.now() / 400) % 2 === 0) {
      ctx.fillText('▼', x + w - 36, y + h - 32);
    }
  }
}

export function drawListBox(ctx, x, y, items, selectedIndex, visibleCount = 6) {
  assertContext('ui.js:drawListBox', ctx);
  assertNumber('ui.js:drawListBox', 'x', x);
  assertNumber('ui.js:drawListBox', 'y', y);
  assertNumber('ui.js:drawListBox', 'selectedIndex', selectedIndex);
  assertNumber('ui.js:drawListBox', 'visibleCount', visibleCount);

  if (!Array.isArray(items)) {
    throw createProtocolError('TypeError', 'ui.js:drawListBox', 'items', items);
  }

  const lineH = 32;
  const paddingY = 16;
  const h = paddingY * 2 + visibleCount * lineH;

  let maxLen = 0;
  items.forEach(it => {
    if (typeof it === 'string') {
      if (it.length > maxLen) {
        maxLen = it.length;
      }
    }
  });

  const isWestern = (i18n.currentLang !== 'ja');
  let charWidth = 20;
  if (isWestern === true) {
    charWidth = 11;
  }
  const w = Math.max(160, maxLen * charWidth + 56);

  drawFrame(ctx, x, y, w, h);

  ctx.fillStyle = '#ffffff';
  ctx.font = '18px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const halfVisible = Math.floor(visibleCount / 2);
  const targetOffset = selectedIndex - halfVisible;
  const maxOffset = items.length - visibleCount;
  const startIndex = Math.max(0, Math.min(targetOffset, maxOffset));
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
      inventoryTitle: resolveSidebarTitleElement('ui-label-items', '#right-sidebar h3'),
      statusTitle: resolveSidebarTitleElement('ui-label-status', '#left-sidebar h3'),
      equipLabel: document.getElementById('ui-label-equip'),
      returnPointLabel: document.getElementById('ui-label-return-point'),
      returnPointName: document.getElementById('ui-return-point-name'),
      controlsText: document.getElementById('ui-controls-text')
    };
  }

  getReturnPointLabelText() {
    if (i18n.currentLang === 'en') {
      return 'Return Point';
    }
    if (i18n.currentLang === 'es') {
      return 'Punto de retorno';
    }
    return '帰還地';
  }

  updateSidebars(playerStats) {
    if (typeof playerStats !== 'object') {
      return;
    }
    if (playerStats === null) {
      return;
    }

    if (this.elements.statusTitle !== null) {
      this.elements.statusTitle.textContent = i18n.t('ui.status');
    }
    if (this.elements.equipLabel !== null) {
      this.elements.equipLabel.textContent = i18n.t('ui.equipment');
    }
    if (this.elements.returnPointLabel !== null) {
      this.elements.returnPointLabel.textContent = this.getReturnPointLabelText();
    }
    if (this.elements.returnPointName !== null) {
      let resolvedReturnName = i18n.t('ui.none');
      if (typeof playerStats.returnPoint === 'object') {
        if (playerStats.returnPoint !== null) {
          const mapId = playerStats.returnPoint.mapId;
          if (typeof mapId === 'string') {
            if (mapId in maps) {
              const targetMap = maps[mapId];
              if (typeof targetMap.name === 'object') {
                if (targetMap.name !== null) {
                  resolvedReturnName = i18n.resolve(targetMap.name);
                } else {
                  resolvedReturnName = mapId;
                }
              } else {
                resolvedReturnName = mapId;
              }
            } else {
              resolvedReturnName = mapId;
            }
          }
        }
      }
      this.elements.returnPointName.textContent = resolvedReturnName;
    }
    if (this.elements.controlsText !== null) {
      this.elements.controlsText.innerHTML = i18n.t('ui.controls').replace(/\n/g, '<br>');
    }

    if (this.elements.lv !== null) {
      this.elements.lv.textContent = playerStats.level;
    }

    let poisonMark = '';
    if (playerStats.isPoisoned === true) {
      poisonMark = i18n.t('ui.poison_badge');
    }
    if (this.elements.hp !== null) {
      this.elements.hp.textContent = `${playerStats.hp} / ${playerStats.maxHp}${poisonMark}`;
    }

    if (this.elements.hpBar !== null) {
      let hpRatio = 0;
      if (playerStats.maxHp > 0) {
        hpRatio = Math.max(0, Math.min(1, playerStats.hp / playerStats.maxHp));
      }
      this.elements.hpBar.style.width = `${(hpRatio * 100).toFixed(1)}%`;

      if (playerStats.isPoisoned === true) {
        this.elements.hpBar.style.backgroundColor = '#9b59b6';
      } else if (hpRatio <= 0.25) {
        this.elements.hpBar.style.backgroundColor = '#e74c3c';
      } else if (hpRatio <= 0.5) {
        this.elements.hpBar.style.backgroundColor = '#f1c40f';
      } else {
        this.elements.hpBar.style.backgroundColor = '#2ecc71';
      }
    }

    if (this.elements.mp !== null) {
      this.elements.mp.textContent = `${playerStats.mp} / ${playerStats.maxMp}`;
    }

    if (this.elements.mpBar !== null) {
      let mpRatio = 0;
      if (playerStats.maxMp > 0) {
        mpRatio = Math.max(0, Math.min(1, playerStats.mp / playerStats.maxMp));
      }
      this.elements.mpBar.style.width = `${(mpRatio * 100).toFixed(1)}%`;
      this.elements.mpBar.style.backgroundColor = '#3498db';
    }

    if (this.elements.atk !== null) {
      this.elements.atk.textContent = playerStats.atk;
    }
    if (this.elements.def !== null) {
      this.elements.def.textContent = playerStats.def;
    }
    if (this.elements.spd !== null) {
      this.elements.spd.textContent = playerStats.spd;
    }
    if (this.elements.exp !== null) {
      this.elements.exp.textContent = playerStats.exp;
    }
    if (this.elements.gold !== null) {
      this.elements.gold.textContent = playerStats.gold;
    }

    const noneText = i18n.t('ui.none');
    if (this.elements.wpn !== null) {
      let wpnName = noneText;
      const wpnId = playerStats.equipment.weapon;
      if (typeof wpnId === 'string') {
        if (wpnId in ITEM_DB) {
          wpnName = ITEM_DB[wpnId].name;
        }
      }
      this.elements.wpn.textContent = wpnName;
    }
    if (this.elements.arm !== null) {
      let armName = noneText;
      const armId = playerStats.equipment.armor;
      if (typeof armId === 'string') {
        if (armId in ITEM_DB) {
          armName = ITEM_DB[armId].name;
        }
      }
      this.elements.arm.textContent = armName;
    }
    if (this.elements.sld !== null) {
      let sldName = noneText;
      const sldId = playerStats.equipment.shield;
      if (typeof sldId === 'string') {
        if (sldId in ITEM_DB) {
          sldName = ITEM_DB[sldId].name;
        }
      }
      this.elements.sld.textContent = sldName;
    }

    let count = 0;
    if (typeof playerStats.getInventoryCount === 'function') {
      count = playerStats.getInventoryCount();
    }
    if (this.elements.inventoryTitle !== null) {
      this.elements.inventoryTitle.textContent = `${i18n.t('ui.items')} (${count}/${MAX_INVENTORY_CAPACITY})`;
    }

    if (this.elements.inventoryList !== null) {
      this.elements.inventoryList.innerHTML = '';
      if (typeof playerStats.inventory === 'object') {
        if (playerStats.inventory !== null) {
          for (const [id, qty] of Object.entries(playerStats.inventory)) {
            if (qty > 0) {
              if (id in ITEM_DB) {
                let displayCount = qty;
                if (playerStats.equipment.weapon === id) {
                  displayCount -= 1;
                }
                if (playerStats.equipment.armor === id) {
                  displayCount -= 1;
                }
                if (playerStats.equipment.shield === id) {
                  displayCount -= 1;
                }

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
    }
  }
}
