// FILE_ENTRY: js/shop.js
import { audioService } from './audioService.js';
import { ITEM_DB } from './items.js';
import { drawListBox, drawMessageBox } from './ui.js';
import { i18n } from './i18n.js';

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

let rawShopData = null;

const shopDataHandler = {
    get(target, prop) {
        if (rawShopData === null) {
            throw createProtocolError('UninitializedError', 'shop.js:SHOP_DATA', 'rawShopData', rawShopData);
        }
        if (typeof prop === 'symbol') {
            return Reflect.get(rawShopData, prop);
        }
        if (!(prop in rawShopData)) {
            throw createProtocolError('NotFoundError', 'shop.js:SHOP_DATA', prop, undefined);
        }
        return rawShopData[prop];
    }
};

export const SHOP_DATA = new Proxy({}, shopDataHandler);

export async function initShopData() {
    const res = await fetch('data/facilities/shop.json');
    if (!res.ok) {
        throw createProtocolError('HttpError', 'shop.js:initShopData', 'res.status', res.status);
    }
    rawShopData = await res.json();
    console.log("SHOP_DATA initialized successfully from shop.json.");
}

function isUpKey(key) {
    if (key === 'ArrowUp') {
        return true;
    }
    if (key === 'w') {
        return true;
    }
    if (key === 'W') {
        return true;
    }
    return false;
}

function isDownKey(key) {
    if (key === 'ArrowDown') {
        return true;
    }
    if (key === 's') {
        return true;
    }
    if (key === 'S') {
        return true;
    }
    return false;
}

function isConfirmKey(key) {
    if (key === ' ') {
        return true;
    }
    if (key === 'Enter') {
        return true;
    }
    return false;
}

function isCancelKey(key) {
    if (key === 'Escape') {
        return true;
    }
    if (key === 'x') {
        return true;
    }
    if (key === 'X') {
        return true;
    }
    return false;
}

export class ShopManager {
    constructor(player, onEndCallback) {
        if (!player) {
            throw createProtocolError('TypeError', 'shop.js:constructor', 'player', player);
        }
        if (typeof onEndCallback !== 'function') {
            throw createProtocolError('TypeError', 'shop.js:constructor', 'onEndCallback', onEndCallback);
        }

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

    _ensureData() {
        if (rawShopData === null) {
            throw createProtocolError('DataValidationError', 'shop.js:_ensureData', 'rawShopData', rawShopData);
        }
    }

    getMessage(key, params = {}) {
        this._ensureData();
        if (typeof key !== 'string') {
            throw createProtocolError('TypeError', 'shop.js:getMessage', 'key', key);
        }
        const msgObj = rawShopData.messages[key];
        if (!msgObj) {
            throw createProtocolError('DataValidationError', 'shop.js:getMessage', key, msgObj);
        }
        let text = i18n.resolve(msgObj);
        for (const [k, v] of Object.entries(params)) {
            text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
        }
        return text;
    }

    getRootCommands() {
        this._ensureData();
        return [
            i18n.resolve(rawShopData.commands.buy),
            i18n.resolve(rawShopData.commands.sell),
            i18n.resolve(rawShopData.commands.leave)
        ];
    }

    open(npcData) {
        this._ensureData();
        if (!npcData) {
            throw createProtocolError('TypeError', 'shop.js:open', 'npcData', npcData);
        }
        if (!Array.isArray(npcData.shopItems)) {
            throw createProtocolError('TypeError', 'shop.js:open', 'npcData.shopItems', npcData.shopItems);
        }

        const itemIds = [...npcData.shopItems];
        if (npcData.id === 'port_general_shop_keeper') {
            if (!itemIds.includes('poison_charm')) {
                itemIds.push('poison_charm');
            }
        }
        this.shopItems = itemIds.map(id => ITEM_DB[id]).filter(item => item);
        this.phase = 'ROOT_SELECT';
        this.rootIndex = 0;
        this.itemIndex = 0;
        this.confirmIndex = 0;

        let greetingType = 'default';
        if (rawShopData.npcGreetingMapping) {
            if (rawShopData.npcGreetingMapping[npcData.id]) {
                greetingType = rawShopData.npcGreetingMapping[npcData.id];
            }
        }
        let greetingObj = rawShopData.greetings.default;
        if (rawShopData.greetings[greetingType]) {
            greetingObj = rawShopData.greetings[greetingType];
        }
        const greetingText = i18n.resolve(greetingObj);
        this.startMessage(greetingText);
    }

    startMessage(text) {
        if (typeof text !== 'string') {
            throw createProtocolError('TypeError', 'shop.js:startMessage', 'text', text);
        }
        this.currentText = text;
        this.displayedText = '';
        this.charIndex = 0;
        this.charTimer = 0;
        this.isTextComplete = false;
    }

    buildSellList() {
        this.sellItems = [];
        for (const [id, count] of Object.entries(this.player.inventory)) {
            if (count > 0) {
                if (ITEM_DB[id]) {
                    if (ITEM_DB[id].type === 'key') {
                        continue;
                    }
                    if (ITEM_DB[id].type === 'keyItem') {
                        continue;
                    }
                    let isEquipped = false;
                    if (this.player.equipment.weapon === id) {
                        isEquipped = true;
                    } else if (this.player.equipment.armor === id) {
                        isEquipped = true;
                    } else if (this.player.equipment.shield === id) {
                        isEquipped = true;
                    }
                    const sellPrice = Math.floor(ITEM_DB[id].price / 2);
                    this.sellItems.push({ id, name: ITEM_DB[id].name, sellPrice, isEquipped });
                }
            }
        }
    }

    handleKeyDown(key) {
        if (typeof key !== 'string') {
            throw createProtocolError('TypeError', 'shop.js:handleKeyDown', 'key', key);
        }
        const rootCommands = this.getRootCommands();
        if (isCancelKey(key)) {
            audioService.playSe('cancel');
            if (this.phase === 'ROOT_SELECT') {
                this.onEnd();
                return;
            }
            if (this.phase === 'BUY_SELECT') {
                this.rootIndex = 0;
                this.itemIndex = 0;
                this.confirmIndex = 0;
                this.phase = 'ROOT_SELECT';
                this.startMessage(this.getMessage('anything_else'));
                return;
            }
            if (this.phase === 'SELL_SELECT') {
                this.rootIndex = 0;
                this.itemIndex = 0;
                this.confirmIndex = 0;
                this.phase = 'ROOT_SELECT';
                this.startMessage(this.getMessage('anything_else'));
                return;
            }
            if (this.phase === 'BUY_CONFIRM') {
                this.phase = 'BUY_SELECT';
                this.startMessage(this.getMessage('what_to_buy'));
                return;
            }
            if (this.phase === 'SELL_CONFIRM') {
                this.phase = 'SELL_SELECT';
                this.startMessage(this.getMessage('what_to_sell'));
                return;
            }
            return;
        }

        if (!this.isTextComplete) {
            if (isConfirmKey(key)) {
                this.displayedText = this.currentText;
                this.charIndex = this.currentText.length;
                this.isTextComplete = true;
            }
            return;
        }

        if (this.phase === 'ROOT_SELECT') {
            if (isUpKey(key)) {
                this.rootIndex = (this.rootIndex - 1 + rootCommands.length) % rootCommands.length;
                audioService.playSe('cursor');
            } else if (isDownKey(key)) {
                this.rootIndex = (this.rootIndex + 1) % rootCommands.length;
                audioService.playSe('cursor');
            } else if (isConfirmKey(key)) {
                audioService.playSe('submit');
                if (this.rootIndex === 0) {
                    this.itemIndex = 0;
                    this.confirmIndex = 0;
                    this.phase = 'BUY_SELECT';
                    this.startMessage(this.getMessage('what_to_buy'));
                } else if (this.rootIndex === 1) {
                    this.buildSellList();
                    this.itemIndex = 0;
                    this.confirmIndex = 0;
                    this.phase = 'SELL_SELECT';
                    this.startMessage(this.getMessage('what_to_sell'));
                } else {
                    this.onEnd();
                }
            }
        } else if (this.phase === 'BUY_SELECT') {
            const listSize = this.shopItems.length + 1;
            if (isUpKey(key)) {
                this.itemIndex = (this.itemIndex - 1 + listSize) % listSize;
                audioService.playSe('cursor');
            } else if (isDownKey(key)) {
                this.itemIndex = (this.itemIndex + 1) % listSize;
                audioService.playSe('cursor');
            } else if (isConfirmKey(key)) {
                audioService.playSe('submit');
                if (this.itemIndex === this.shopItems.length) {
                    this.rootIndex = 0;
                    this.itemIndex = 0;
                    this.confirmIndex = 0;
                    this.phase = 'ROOT_SELECT';
                    this.startMessage(this.getMessage('anything_else'));
                } else {
                    this.selectedItem = this.shopItems[this.itemIndex];
                    this.confirmIndex = 0;
                    this.phase = 'BUY_CONFIRM';
                    this.startMessage(this.getMessage('buy_confirm', { name: this.selectedItem.name, price: String(this.selectedItem.price) }));
                }
            }
        } else if (this.phase === 'SELL_SELECT') {
            const listSize = this.sellItems.length + 1;
            if (isUpKey(key)) {
                this.itemIndex = (this.itemIndex - 1 + listSize) % listSize;
                audioService.playSe('cursor');
            } else if (isDownKey(key)) {
                this.itemIndex = (this.itemIndex + 1) % listSize;
                audioService.playSe('cursor');
            } else if (isConfirmKey(key)) {
                audioService.playSe('submit');
                if (this.itemIndex === this.sellItems.length) {
                    this.rootIndex = 0;
                    this.itemIndex = 0;
                    this.confirmIndex = 0;
                    this.phase = 'ROOT_SELECT';
                    this.startMessage(this.getMessage('anything_else'));
                } else {
                    this.selectedItem = this.sellItems[this.itemIndex];
                    if (this.selectedItem.isEquipped) {
                        this.startMessage(this.getMessage('cannot_sell_equipped'));
                    } else {
                        this.confirmIndex = 0;
                        this.phase = 'SELL_CONFIRM';
                        this.startMessage(this.getMessage('sell_confirm', { name: this.selectedItem.name, price: String(this.selectedItem.sellPrice) }));
                    }
                }
            }
        } else if (this.phase === 'BUY_CONFIRM') {
            if (isUpKey(key)) {
                if (this.confirmIndex === 0) {
                    this.confirmIndex = 1;
                } else {
                    this.confirmIndex = 0;
                }
                audioService.playSe('cursor');
            } else if (isDownKey(key)) {
                if (this.confirmIndex === 0) {
                    this.confirmIndex = 1;
                } else {
                    this.confirmIndex = 0;
                }
                audioService.playSe('cursor');
            } else if (isConfirmKey(key)) {
                audioService.playSe('submit');
                if (this.confirmIndex === 0) {
                    this.buyItem();
                } else {
                    this.confirmIndex = 0;
                    this.phase = 'BUY_SELECT';
                    this.startMessage(this.getMessage('what_to_buy'));
                }
            }
        } else if (this.phase === 'SELL_CONFIRM') {
            if (isUpKey(key)) {
                if (this.confirmIndex === 0) {
                    this.confirmIndex = 1;
                } else {
                    this.confirmIndex = 0;
                }
                audioService.playSe('cursor');
            } else if (isDownKey(key)) {
                if (this.confirmIndex === 0) {
                    this.confirmIndex = 1;
                } else {
                    this.confirmIndex = 0;
                }
                audioService.playSe('cursor');
            } else if (isConfirmKey(key)) {
                audioService.playSe('submit');
                if (this.confirmIndex === 0) {
                    this.sellItem();
                } else {
                    this.confirmIndex = 0;
                    this.phase = 'SELL_SELECT';
                    this.startMessage(this.getMessage('what_to_sell'));
                }
            }
        }
    }

    buyItem() {
        if (this.player.isInventoryFull(1)) {
            audioService.playSe('bump');
            this.phase = 'BUY_SELECT';
            this.startMessage(this.getMessage('inventory_full'));
            return;
        }
        if (this.player.useGold(this.selectedItem.price)) {
            this.player.addItem(this.selectedItem.id, 1);
            audioService.playSe('buy');
            this.phase = 'BUY_SELECT';
            this.startMessage(this.getMessage('thank_you_buy'));
        } else {
            audioService.playSe('bump');
            this.phase = 'BUY_SELECT';
            this.startMessage(this.getMessage('gold_shortage'));
        }
    }

    sellItem() {
        this.player.addGold(this.selectedItem.sellPrice);
        this.player.removeItem(this.selectedItem.id, 1);
        audioService.playSe('buy');
        this.buildSellList();
        const listSize = this.sellItems.length + 1;
        if (this.itemIndex >= listSize) {
            this.itemIndex = listSize - 1;
        }
        this.phase = 'SELL_SELECT';
        this.startMessage(this.getMessage('thank_you_sell'));
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
                    if (char !== ' ') {
                        if (char !== '\n') {
                            audioService.playSe('textChar');
                        }
                    }
                } else {
                    this.isTextComplete = true;
                }
            }
        }
    }

    draw(ctx, canvas) {
        if (this.phase === 'HIDDEN') {
            return;
        }
        let cw = 768;
        let ch = 768;
        if (canvas) {
            cw = canvas.width;
            ch = canvas.height;
        }
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
        if (this.phase === 'BUY_SELECT') {
            const displayTexts = this.shopItems.map(item => `${item.name} ${item.price}G`);
            displayTexts.push(i18n.t('common.back'));
            drawListBox(ctx, Math.floor(cw * 0.42), rootY, displayTexts, this.itemIndex, Math.min(12, displayTexts.length));
        } else if (this.phase === 'BUY_CONFIRM') {
            const displayTexts = this.shopItems.map(item => `${item.name} ${item.price}G`);
            displayTexts.push(i18n.t('common.back'));
            drawListBox(ctx, Math.floor(cw * 0.42), rootY, displayTexts, this.itemIndex, Math.min(12, displayTexts.length));
        }

        if (this.phase === 'SELL_SELECT') {
            const displayTexts = this.sellItems.map(item => {
                let prefix = '';
                if (item.isEquipped) {
                    prefix = 'E ';
                }
                return `${prefix}${item.name} ${item.sellPrice}G`;
            });
            displayTexts.push(i18n.t('common.back'));
            drawListBox(ctx, Math.floor(cw * 0.42), rootY, displayTexts, this.itemIndex, Math.min(12, displayTexts.length));
        } else if (this.phase === 'SELL_CONFIRM') {
            const displayTexts = this.sellItems.map(item => {
                let prefix = '';
                if (item.isEquipped) {
                    prefix = 'E ';
                }
                return `${prefix}${item.name} ${item.sellPrice}G`;
            });
            displayTexts.push(i18n.t('common.back'));
            drawListBox(ctx, Math.floor(cw * 0.42), rootY, displayTexts, this.itemIndex, Math.min(12, displayTexts.length));
        }

        let isConfirmPhase = false;
        if (this.phase === 'BUY_CONFIRM') {
            isConfirmPhase = true;
        } else if (this.phase === 'SELL_CONFIRM') {
            isConfirmPhase = true;
        }

        if (isConfirmPhase) {
            if (this.isTextComplete) {
                drawListBox(ctx, margin, winY - 96, [i18n.t('common.yes'), i18n.t('common.no')], this.confirmIndex, 2);
            }
        }
    }
}
