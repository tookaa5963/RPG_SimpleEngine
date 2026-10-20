// FILE_ENTRY: js/shop.js
import { sound } from './sound.js';
import { ITEM_DB } from './items.js';
import { drawListBox, drawMessageBox } from './ui.js';
import { i18n } from './i18n.js';

export class ShopManager {
  constructor(player, onEndCallback) {
    this.player = player;
    this.onEnd = onEndCallback;

    this.phase = 'HIDDEN';
    this.shopItems = [];
    this.sellItems = [];

    this.rootIndex = 0;
    this.itemIndex = 0;
    this.confirmIndex = 0;
    this.selectedItem = null;

    this.currentText = '';
    this.displayedText = '';
    this.charIndex = 0;
    this.charTimer = 0;
    this.textSpeed = 2;
    this.isTextComplete = false;
  }

  getRootCommands() {
    return [
      i18n.t('shop.buy'),
      i18n.t('shop.sell'),
      i18n.t('shop.leave')
    ];
  }

  open(npcData) {
    const itemIds = [...npcData.shopItems];
    if (npcData.id === 'port_general_shop_keeper') {
      if (!itemIds.includes('poison_charm')) itemIds.push('poison_charm');
    }
    this.shopItems = itemIds.map(id => ITEM_DB[id]).filter(item => item);
    this.phase = 'ROOT_SELECT';
    this.rootIndex = 0;
    this.itemIndex = 0;
    this.confirmIndex = 0;

    const greetingText = i18n.getShopGreeting(npcData.id);
    this.startMessage(greetingText);
  }

  startMessage(text) {
    this.currentText = text;
    this.displayedText = '';
    this.charIndex = 0;
    this.charTimer = 0;
    this.isTextComplete = false;
  }

  buildSellList() {
    this.sellItems = [];
    for (const [id, count] of Object.entries(this.player.inventory)) {
      if (count > 0 && ITEM_DB[id]) {
        if (ITEM_DB[id].type === 'key' || ITEM_DB[id].type === 'keyItem') continue;

        const isEquipped = (this.player.equipment.weapon === id || this.player.equipment.armor === id || this.player.equipment.shield === id);
        const sellPrice = Math.floor(ITEM_DB[id].price / 2);
        this.sellItems.push({
          id: id,
          name: ITEM_DB[id].name,
          sellPrice: sellPrice,
          isEquipped: isEquipped
        });
      }
    }
  }

  handleKeyDown(key) {
    const rootCommands = this.getRootCommands();

    if (key === 'Escape' || key === 'x' || key === 'X') {
      sound.playCancel();
      if (this.phase === 'ROOT_SELECT') {
        this.onEnd();
      } else if (this.phase === 'BUY_SELECT' || this.phase === 'SELL_SELECT') {
        this.rootIndex = 0;
        this.itemIndex = 0;
        this.confirmIndex = 0;
        this.phase = 'ROOT_SELECT';
        this.startMessage(i18n.t('shop.anything_else'));
      } else if (this.phase === 'BUY_CONFIRM') {
        this.phase = 'BUY_SELECT';
        this.startMessage(i18n.t('shop.what_to_buy'));
      } else if (this.phase === 'SELL_CONFIRM') {
        this.phase = 'SELL_SELECT';
        this.startMessage(i18n.t('shop.what_to_sell'));
      }
      return;
    }

    if (!this.isTextComplete) {
      if (key === ' ' || key === 'Enter') {
        this.displayedText = this.currentText;
        this.charIndex = this.currentText.length;
        this.isTextComplete = true;
      }
      return;
    }

    if (this.phase === 'ROOT_SELECT') {
      if (key === 'ArrowUp' || key === 'w' || key === 'W') {
        this.rootIndex = (this.rootIndex - 1 + rootCommands.length) % rootCommands.length;
        sound.playCursor();
      } else if (key === 'ArrowDown' || key === 's' || key === 'S') {
        this.rootIndex = (this.rootIndex + 1) % rootCommands.length;
        sound.playCursor();
      } else if (key === ' ' || key === 'Enter') {
        sound.playSubmit();
        if (this.rootIndex === 0) {
          this.itemIndex = 0;
          this.confirmIndex = 0;
          this.phase = 'BUY_SELECT';
          this.startMessage(i18n.t('shop.what_to_buy'));
        } else if (this.rootIndex === 1) {
          this.buildSellList();
          this.itemIndex = 0;
          this.confirmIndex = 0;
          this.phase = 'SELL_SELECT';
          this.startMessage(i18n.t('shop.what_to_sell'));
        } else {
          this.onEnd();
        }
      }

    } else if (this.phase === 'BUY_SELECT') {
      const listSize = this.shopItems.length + 1;
      if (key === 'ArrowUp' || key === 'w' || key === 'W') {
        this.itemIndex = (this.itemIndex - 1 + listSize) % listSize;
        sound.playCursor();
      } else if (key === 'ArrowDown' || key === 's' || key === 'S') {
        this.itemIndex = (this.itemIndex + 1) % listSize;
        sound.playCursor();
      } else if (key === ' ' || key === 'Enter') {
        sound.playSubmit();
        if (this.itemIndex === this.shopItems.length) {
          this.rootIndex = 0;
          this.itemIndex = 0;
          this.confirmIndex = 0;
          this.phase = 'ROOT_SELECT';
          this.startMessage(i18n.t('shop.anything_else'));
        } else {
          this.selectedItem = this.shopItems[this.itemIndex];
          this.confirmIndex = 0;
          this.phase = 'BUY_CONFIRM';
          this.startMessage(i18n.t('shop.buy_confirm', {
            name: this.selectedItem.name,
            price: String(this.selectedItem.price)
          }));
        }
      }

    } else if (this.phase === 'SELL_SELECT') {
      const listSize = this.sellItems.length + 1;
      if (key === 'ArrowUp' || key === 'w' || key === 'W') {
        this.itemIndex = (this.itemIndex - 1 + listSize) % listSize;
        sound.playCursor();
      } else if (key === 'ArrowDown' || key === 's' || key === 'S') {
        this.itemIndex = (this.itemIndex + 1) % listSize;
        sound.playCursor();
      } else if (key === ' ' || key === 'Enter') {
        sound.playSubmit();
        if (this.itemIndex === this.sellItems.length) {
          this.rootIndex = 0;
          this.itemIndex = 0;
          this.confirmIndex = 0;
          this.phase = 'ROOT_SELECT';
          this.startMessage(i18n.t('shop.anything_else'));
        } else {
          this.selectedItem = this.sellItems[this.itemIndex];
          if (this.selectedItem.isEquipped) {
            this.startMessage(i18n.t('shop.cannot_sell_equipped'));
          } else {
            this.confirmIndex = 0;
            this.phase = 'SELL_CONFIRM';
            this.startMessage(i18n.t('shop.sell_confirm', {
              name: this.selectedItem.name,
              price: String(this.selectedItem.sellPrice)
            }));
          }
        }
      }

    } else if (this.phase === 'BUY_CONFIRM') {
      if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'w' || key === 's') {
        this.confirmIndex = this.confirmIndex === 0 ? 1 : 0;
        sound.playCursor();
      } else if (key === ' ' || key === 'Enter') {
        sound.playSubmit();
        if (this.confirmIndex === 0) {
          this.buyItem();
        } else {
          this.confirmIndex = 0;
          this.phase = 'BUY_SELECT';
          this.startMessage(i18n.t('shop.what_to_buy'));
        }
      }

    } else if (this.phase === 'SELL_CONFIRM') {
      if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'w' || key === 's') {
        this.confirmIndex = this.confirmIndex === 0 ? 1 : 0;
        sound.playCursor();
      } else if (key === ' ' || key === 'Enter') {
        sound.playSubmit();
        if (this.confirmIndex === 0) {
          this.sellItem();
        } else {
          this.confirmIndex = 0;
          this.phase = 'SELL_SELECT';
          this.startMessage(i18n.t('shop.what_to_sell'));
        }
      }
    }
  }

  buyItem() {
    if (this.player.isInventoryFull(1)) {
      sound.playBump();
      this.phase = 'BUY_SELECT';
      this.startMessage(i18n.t('shop.inventory_full'));
      return;
    }

    if (this.player.useGold(this.selectedItem.price)) {
      this.player.addItem(this.selectedItem.id, 1);
      sound.playBuy();
      this.phase = 'BUY_SELECT';
      this.startMessage(i18n.t('shop.thank_you_buy'));
    } else {
      sound.playBump();
      this.phase = 'BUY_SELECT';
      this.startMessage(i18n.t('shop.gold_shortage'));
    }
  }

  sellItem() {
    this.player.addGold(this.selectedItem.sellPrice);
    this.player.removeItem(this.selectedItem.id, 1);

    sound.playBuy();
    this.buildSellList();

    const listSize = this.sellItems.length + 1;
    if (this.itemIndex >= listSize) {
      this.itemIndex = listSize - 1;
    }

    this.phase = 'SELL_SELECT';
    this.startMessage(i18n.t('shop.thank_you_sell'));
  }

  update() {
    if (!this.isTextComplete) {
      this.charTimer++;
      if (this.charTimer >= this.textSpeed) {
        this.charTimer = 0;
        if (this.charIndex < this.currentText.length) {
          const char = this.currentText[this.charIndex];
          this.displayedText += char;
          this.charIndex++;
          if (char !== ' ' && char !== '\n') {
            sound.playTextChar();
          }
        } else {
          this.isTextComplete = true;
        }
      }
    }
  }

  draw(ctx, canvas) {
    if (this.phase === 'HIDDEN') return;

    const cw = canvas ? canvas.width : 768;
    const ch = canvas ? canvas.height : 768;

    const margin = Math.floor(cw * 0.04);
    const winX = margin;
    const winWidth = cw - (margin * 2);
    const winHeight = Math.floor(ch * 0.28);
    const winY = ch - winHeight - margin;

    drawMessageBox(ctx, winX, winY, winWidth, winHeight, this.displayedText, false);

    const rootX = cw - margin - 150;
    const rootY = margin;

    if (this.phase === 'ROOT_SELECT') {
      drawListBox(ctx, rootX, rootY, this.getRootCommands(), this.rootIndex, 3);
    }

    if (this.phase === 'BUY_SELECT' || this.phase === 'BUY_CONFIRM') {
      const displayTexts = this.shopItems.map(item => `${item.name} ${item.price}G`);
      displayTexts.push(i18n.t('common.back'));
      drawListBox(ctx, Math.floor(cw * 0.42), rootY, displayTexts, this.itemIndex, Math.min(12, displayTexts.length));
    }

    if (this.phase === 'SELL_SELECT' || this.phase === 'SELL_CONFIRM') {
      const displayTexts = this.sellItems.map(item => `${item.isEquipped ? 'E ' : ''}${item.name} ${item.sellPrice}G`);
      displayTexts.push(i18n.t('common.back'));
      drawListBox(ctx, Math.floor(cw * 0.42), rootY, displayTexts, this.itemIndex, Math.min(12, displayTexts.length));
    }

    if ((this.phase === 'BUY_CONFIRM' || this.phase === 'SELL_CONFIRM') && this.isTextComplete) {
      drawListBox(ctx, margin, winY - 96, [i18n.t('common.yes'), i18n.t('common.no')], this.confirmIndex, 2);
    }
  }
}