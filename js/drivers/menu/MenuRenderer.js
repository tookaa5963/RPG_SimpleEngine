import { drawListBox, drawMessageBox } from '../../ui.js';
import { i18n } from '../../i18n.js';
import { ITEM_DB } from '../../items.js';

export function normalizeMenuInput(key) {
    if (key === 'ArrowUp' || key === 'w' || key === 'W') return 'UP';
    if (key === 'ArrowDown' || key === 's' || key === 'S') return 'DOWN';
    if (key === 'ArrowLeft' || key === 'a' || key === 'A') return 'LEFT';
    if (key === 'ArrowRight' || key === 'd' || key === 'D') return 'RIGHT';
    if (key === ' ' || key === 'Enter') return 'CONFIRM';
    if (key === 'Escape' || key === 'x' || key === 'X') return 'CANCEL';
    return null;
}

export class MenuRenderer {
    normalizeMenuInput(key) {
        return normalizeMenuInput(key);
    }

    render(ctx, canvas, menuState) {
        if (typeof ctx !== 'object' || ctx === null || typeof ctx.fillRect !== 'function') {
            throw new TypeError("Invalid ctx");
        }
        if (typeof canvas !== 'object' || canvas === null) {
            throw new TypeError("Invalid canvas");
        }
        if (typeof canvas.width !== 'number' || Number.isNaN(canvas.width) || canvas.width <= 0 ||
            typeof canvas.height !== 'number' || Number.isNaN(canvas.height) || canvas.height <= 0) {
            throw new RangeError("Invalid canvas dimensions");
        }
        if (typeof menuState !== 'object' || menuState === null || typeof menuState.phase !== 'string' || typeof menuState.rootIndex !== 'number' || Number.isNaN(menuState.rootIndex)) {
            throw new TypeError("Invalid menuState");
        }

        const phase = menuState.phase;

        if (phase === 'ITEM_SELECT' || phase === 'ITEM_ACTION' || phase === 'DROP_CONFIRM') {
            if (!Array.isArray(menuState.itemList)) {
                throw new TypeError("itemList must be an array");
            }
        }

        if (phase === 'DROP_CONFIRM') {
            if (typeof menuState.selectedItem !== 'object' || menuState.selectedItem === null || typeof menuState.selectedItem.id !== 'string' || !ITEM_DB[menuState.selectedItem.id]) {
                throw new TypeError("Invalid selectedItem");
            }
        }

        const cw = canvas.width;
        const ch = canvas.height;
        const margin = Math.floor(cw * 0.04);
        const winX = margin;
        const winWidth = cw - (margin * 2);
        const winHeight = Math.floor(ch * 0.28);
        const winY = ch - winHeight - margin;

        const rootCommands = typeof menuState.getRootCommands === 'function' 
            ? menuState.getRootCommands() 
            : [i18n.t('menu.spell'), i18n.t('menu.item'), i18n.t('menu.equip'), i18n.t('menu.recall'), i18n.t('menu.load'), i18n.t('menu.save'), i18n.t('menu.quit')];
        
        const actionCommands = typeof menuState.getActionCommands === 'function'
            ? menuState.getActionCommands()
            : [i18n.t('menu.use'), i18n.t('menu.drop'), i18n.t('menu.back')];

        drawListBox(ctx, 32, 32, rootCommands, menuState.rootIndex, 7);

        if (phase === 'QUIT_CONFIRM') {
            drawMessageBox(ctx, winX, winY, winWidth, winHeight, i18n.t('menu.quit_confirm'));
            drawListBox(ctx, cw - margin - 150, winY - 96, [i18n.t('common.yes'), i18n.t('common.no')], menuState.quitConfirmIndex, 2);
        }

        if (phase === 'ITEM_SELECT' || phase === 'ITEM_ACTION' || phase === 'DROP_CONFIRM') {
            const displayItems = menuState.itemList.map(i => i.name);
            const cursor = (phase === 'ITEM_SELECT') ? menuState.itemIndex : -1;
            drawListBox(ctx, 160, 32, displayItems, cursor, 11);
        }

        if (phase === 'ITEM_ACTION' || phase === 'DROP_CONFIRM') {
            const cursor = (phase === 'ITEM_ACTION') ? menuState.actionIndex : -1;
            drawListBox(ctx, 400, 64, actionCommands, cursor, 3);
        }

        if (phase === 'DROP_CONFIRM') {
            const itemName = ITEM_DB[menuState.selectedItem.id].name;
            drawMessageBox(ctx, winX, winY, winWidth, winHeight, i18n.t('menu.drop_confirm', { name: itemName }));
            drawListBox(ctx, cw - margin - 150, winY - 96, [i18n.t('common.yes'), i18n.t('common.no')], menuState.dropConfirmIndex, 2);
        }
    }
}