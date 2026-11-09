import { logFormatter } from './logFormatter.js';
import { getObjectiveText, resolveCurrentObjectiveKey, canCastFieldSpell } from './events.js';
import { maps } from './maps.js';
import { ITEM_DB, SPELL_DB } from './items.js';
import { i18n } from './i18n.js';
import { EffectResolver } from './engine/effects/EffectResolver.js';
import { EventTypes } from './engine/core/EventTypes.js';
import { ActionTypes } from './engine/core/ActionTypes.js';
import { MenuStateMachine } from './engine/menu/MenuStateMachine.js';
import { applyMenuAction } from './engine/menu/MenuActionExecutor.js';
import { MenuRenderer } from './drivers/menu/MenuRenderer.js';

const effectResolver = new EffectResolver();

export class MenuManager {
    constructor(player, messageWindow, onEndCallback, changeMap, getCurrentMap, eventBus = null) {
        this.player = player;
        this.msgWin = messageWindow;
        this.onEnd = onEndCallback;
        this.changeMap = changeMap;
        this.getCurrentMap = getCurrentMap;
        this.eventBus = eventBus;

        this.stateMachine = new MenuStateMachine();
        this.renderer = new MenuRenderer();
    }

    get phase() {
        return this.stateMachine.phase;
    }

    set phase(nextPhase) {
        this.stateMachine.setPhase(nextPhase);
    }

    get rootIndex() {
        return this.stateMachine.rootIndex;
    }

    set rootIndex(index) {
        this.stateMachine.rootIndex = index;
    }

    get itemList() {
        return this.stateMachine.itemList;
    }

    set itemList(list) {
        this.stateMachine.itemList = list;
    }

    get itemIndex() {
        return this.stateMachine.itemIndex;
    }

    set itemIndex(index) {
        this.stateMachine.itemIndex = index;
    }

    get currentMode() {
        return this.stateMachine.currentMode;
    }

    set currentMode(mode) {
        this.stateMachine.currentMode = mode;
    }

    get actionIndex() {
        return this.stateMachine.actionIndex;
    }

    set actionIndex(index) {
        this.stateMachine.actionIndex = index;
    }

    get selectedItem() {
        return this.stateMachine.selectedItem;
    }

    set selectedItem(item) {
        this.stateMachine.selectedItem = item;
    }

    get dropConfirmIndex() {
        return this.stateMachine.dropConfirmIndex;
    }

    set dropConfirmIndex(index) {
        this.stateMachine.dropConfirmIndex = index;
    }

    get quitConfirmIndex() {
        return this.stateMachine.quitConfirmIndex;
    }

    set quitConfirmIndex(index) {
        this.stateMachine.quitConfirmIndex = index;
    }

    _playSe(soundId) {
        if (this.eventBus) {
            this.eventBus.emit(EventTypes.SYSTEM.AUDIO_PLAY_SE, { se: soundId });
        }
    }

    _openMessages(messages) {
        if (this.eventBus) {
            this.eventBus.emit(EventTypes.SYSTEM.MESSAGE_LOG, { messages });
        } else if (this.msgWin) {
            this.msgWin.open(messages);
        }
    }

    _dispatchMenuAction(payload) {
        let hasListener = false;
        if (this.eventBus !== null && typeof this.eventBus.listeners !== 'undefined' && this.eventBus.listeners !== null) {
            if (typeof this.eventBus.listeners.has === 'function' && this.eventBus.listeners.has(ActionTypes.MENU.EXECUTE)) {
                const listeners = this.eventBus.listeners.get(ActionTypes.MENU.EXECUTE);
                if (Array.isArray(listeners) && listeners.length > 0) {
                    hasListener = true;
                }
            }
        }

        if (hasListener) {
            this.eventBus.emit(ActionTypes.MENU.EXECUTE, payload);
        } else {
            applyMenuAction(this.player, payload);
        }
    }

    getRootCommands() {
        return [
            i18n.t('menu.spell'),
            i18n.t('menu.item'),
            i18n.t('menu.equip'),
            i18n.t('menu.recall'),
            i18n.t('menu.load'),
            i18n.t('menu.save'),
            i18n.t('menu.quit')
        ];
    }

    getActionCommands() {
        return [
            i18n.t('menu.use'),
            i18n.t('menu.drop'),
            i18n.t('menu.back')
        ];
    }

    open() {
        this.stateMachine.open();
    }

    showCurrentObjective() {
        const key = resolveCurrentObjectiveKey(this.player);
        this._openMessages([getObjectiveText(key)]);
    }

    _normalizeMenuKey(key) {
        return this.renderer.normalizeMenuInput(key);
    }

    handleKeyDown(key) {
        const command = this._normalizeMenuKey(key);
        if (!command) {
            return;
        }

        const result = this.stateMachine.handleCommand(command);
        if (result.se) {
            this._playSe(result.se);
        }

        if (result.intent === 'CLOSE_MENU') {
            this.onEnd();
            return;
        }

        if (result.intent === 'ROOT_SELECTED') {
            const idx = result.payload.index;
            if (idx === 0) {
                const items = [];
                this.player.spells.forEach(spellId => {
                    const spell = SPELL_DB[spellId];
                    if (spell && spell.fieldUsable) {
                        items.push({ name: `${spell.name}(MP${spell.cost})`, id: spell.id, cost: spell.cost, type: 'magic' });
                    }
                });
                items.push({ name: i18n.t('common.back'), id: 'cancel' });
                this.stateMachine.enterItemSelect('magic', items);
            } else if (idx === 1) {
                const items = [];
                for (const [id, count] of Object.entries(this.player.inventory)) {
                    if (count > 0 && ITEM_DB[id]) {
                        const isEquipped = (this.player.equipment.weapon === id || this.player.equipment.armor === id || this.player.equipment.shield === id);
                        items.push({ name: `${isEquipped ? 'E ' : ''}${ITEM_DB[id].name}`, id: id, type: ITEM_DB[id].type });
                    }
                }
                items.push({ name: i18n.t('common.back'), id: 'cancel' });
                this.stateMachine.enterItemSelect('item', items);
            } else if (idx === 2) {
                this.openEquipMenu();
            } else if (idx === 3) {
                this.onEnd();
                this.showCurrentObjective();
            } else if (idx === 4) {
                if (this.eventBus) this.eventBus.emit(ActionTypes.SYSTEM.OPEN_SLOT_DIALOG, { mode: 'load' });
            } else if (idx === 5) {
                if (this.eventBus) this.eventBus.emit(ActionTypes.SYSTEM.OPEN_SLOT_DIALOG, { mode: 'save' });
            }
            return;
        }

        if (result.intent === 'CONFIRM_QUIT') {
            this.onEnd();
            if (this.eventBus) {
                this.eventBus.emit(ActionTypes.SYSTEM.RETURN_TO_TITLE);
            }
            return;
        }

        if (result.intent === 'SELECT_MAGIC') {
            this.useMagic(result.payload.item);
            return;
        }

        if (result.intent === 'SELECT_EQUIP') {
            this.equipItem(result.payload.item);
            return;
        }

        if (result.intent === 'ACTION_USE') {
            const item = result.payload.item;
            const effectDef = item.effect || (ITEM_DB[item.id] ? ITEM_DB[item.id].effect : null);
            if (item.type === 'weapon' || item.type === 'armor' || item.type === 'shield') {
                this.equipItem(item);
            } else if (effectDef) {
                this.useItem(item);
            } else if (item.type === 'charm') {
                this.onEnd();
                this._openMessages([logFormatter.format('menu_action.charm_passive')]);
            } else if (item.type === 'key' || item.type === 'keyItem') {
                this.onEnd();
                this._openMessages([i18n.t('menu.cannot_use_here')]);
            } else {
                this.useItem(item);
            }
            return;
        }

        if (result.intent === 'ACTION_DROP_REQUEST') {
            const item = result.payload.item;
            const dropCheck = this.player.canDropItem(item);
            if (!dropCheck.canDrop) {
                this.onEnd();
                let msgKey = 'menu.cannot_drop_key';
                if (dropCheck.reason === 'equipped') {
                    msgKey = 'menu.cannot_drop_equipped';
                }
                this._openMessages([i18n.t(msgKey)]);
            } else {
                this.stateMachine.enterDropConfirm();
            }
            return;
        }

        if (result.intent === 'CONFIRM_DROP') {
            const item = result.payload.item;
            const payload = { actionType: 'DROP_ITEM', itemId: item.id, count: 1 };

            this.onEnd();
            this._dispatchMenuAction(payload);

            this._playSe('chest');
            const itemName = ITEM_DB[item.id].name;
            this._openMessages([i18n.t('menu.dropped', { name: itemName })]);
        }
    }

    openEquipMenu() {
        const items = [];

        for (const [id, count] of Object.entries(this.player.inventory)) {
            if (count > 0 && ITEM_DB[id] && (ITEM_DB[id].type === 'weapon' || ITEM_DB[id].type === 'armor' || ITEM_DB[id].type === 'shield')) {
                const isEquipped = (this.player.equipment.weapon === id || this.player.equipment.armor === id || this.player.equipment.shield === id);
                const mark = isEquipped ? 'E ' : ' ';
                items.push({ name: `${mark}${ITEM_DB[id].name}`, id: id, type: ITEM_DB[id].type });
            }
        }

        items.push({ name: i18n.t('common.back'), id: 'cancel' });
        this.stateMachine.enterItemSelect('equip', items);
    }

    equipItem(item) {
        const slotMap = { weapon: 'weapon', armor: 'armor', shield: 'shield' };
        const slot = slotMap[item.type];
        if (!slot) {
            return;
        }

        const itemName = ITEM_DB[item.id].name;
        const isEquipped = this.player.isEquipped(item.id);

        if (isEquipped) {
            if (this.player.isInventoryFull(1)) {
                this.onEnd();
                this._playSe('bump');
                this._openMessages([i18n.t('menu.inventory_full_unequip')]);
                return;
            }
            const payload = { actionType: 'EQUIP_ITEM', slot: slot, operation: 'unequip', itemId: item.id };
            this.onEnd();
            this._dispatchMenuAction(payload);

            this._playSe('chest');
            this._openMessages([i18n.t('menu.unequipped', { name: itemName })]);
            return;
        }

        const payload = { actionType: 'EQUIP_ITEM', slot: slot, operation: 'equip', itemId: item.id };
        this.onEnd();
        this._dispatchMenuAction(payload);

        this._playSe('chest');
        this._openMessages([i18n.t('menu.equipped', { name: itemName })]);
    }

    useItem(item) {
        const effectDef = item.effect || (ITEM_DB[item.id] ? ITEM_DB[item.id].effect : null);

        if (effectDef) {
            if (effectDef.type === 'heal_hp') {
                if (this.player.hp >= this.player.maxHp) {
                    this.onEnd();
                    this._openMessages([i18n.t('menu.full_hp')]);
                    return;
                }
            } else if (effectDef.type === 'heal_mp') {
                if (this.player.mp >= this.player.maxMp) {
                    this.onEnd();
                    this._openMessages([i18n.t('menu.full_mp')]);
                    return;
                }
            }

            const currentMap = this.getCurrentMap ? this.getCurrentMap() : null;
            const result = effectResolver.resolve(effectDef, this.player, this.player, { currentMap });

            if (result.success === false) {
                this.onEnd();
                this._openMessages([i18n.t('menu.cannot_use_here')]);
                return;
            }

            const isKey = (item.type === 'key' || item.type === 'keyItem');
            let shouldConsume = !isKey;
            if (typeof result.consumeItem === 'boolean') {
                shouldConsume = result.consumeItem;
            }

            const payload = {
                actionType: 'USE_ITEM',
                itemId: item.id,
                consumeCount: shouldConsume ? 1 : 0
            };

            if (result.strategy === 'heal_hp') {
                payload.healHp = result.rawAmount;
            } else if (result.strategy === 'heal_mp') {
                payload.healMp = result.rawAmount;
            } else if (result.strategy === 'cure_status') {
                if (result.cured) {
                    payload.curePoison = true;
                }
            }

            this.onEnd();

            if (result.strategy === 'heal_hp' || result.strategy === 'heal_mp' || result.strategy === 'cure_status') {
                this._dispatchMenuAction(payload);
            } else if (result.strategy === 'teleport' || result.strategy === 'message') {
                if (shouldConsume) {
                    this._dispatchMenuAction(payload);
                }
            }

            if (result.strategy === 'heal_hp') {
                this._playSe('heal');
                if (item.id === 'herb') {
                    this._openMessages([logFormatter.format('menu_action.used_herb_1'), logFormatter.format('menu_action.used_herb_2')]);
                } else if (item.id === 'strong_herb') {
                    this._openMessages([logFormatter.format('menu_action.used_strong_herb_1'), logFormatter.format('menu_action.used_strong_herb_2')]);
                } else if (item.id === 'special_herb') {
                    this._openMessages([logFormatter.format('menu_action.used_special_herb_1'), logFormatter.format('menu_action.used_strong_herb_2')]);
                } else {
                    this._openMessages([logFormatter.format('menu_action.used_herb_1'), logFormatter.format('menu_action.used_herb_2')]);
                }
            } else if (result.strategy === 'heal_mp') {
                this._playSe('heal');
                if (item.id === 'magic_water') {
                    this._openMessages([logFormatter.format('menu_action.drank_magic_water_1'), logFormatter.format('menu_action.drank_magic_water_2')]);
                } else if (item.id === 'sage_water') {
                    this._openMessages([logFormatter.format('menu_action.drank_sage_water_1'), logFormatter.format('menu_action.drank_sage_water_2')]);
                } else {
                    this._openMessages([logFormatter.format('menu_action.drank_magic_water_1'), logFormatter.format('menu_action.drank_magic_water_2')]);
                }
            } else if (result.strategy === 'cure_status') {
                this._playSe('heal');
                if (result.cured) {
                    this._openMessages([logFormatter.format('menu_action.antidote_1'), logFormatter.format('menu_action.antidote_2')]);
                } else {
                    this._openMessages([logFormatter.format('menu_action.antidote_1'), logFormatter.format('menu_action.antidote_not_poisoned')]);
                }
            } else if (result.strategy === 'teleport') {
                this._playSe('magic');
                const msgKey = (effectDef.params && effectDef.params.messageKey) ? effectDef.params.messageKey : 'menu_action.forest_guide';
                this._openMessages([logFormatter.format(msgKey)]);
                if (this.eventBus) {
                    this.eventBus.emit(ActionTypes.SYSTEM.CHANGE_MAP, {
                        targetMap: result.targetMap,
                        targetX: result.targetX,
                        targetY: result.targetY,
                        direction: result.direction,
                        isTeleport: result.isTeleport
                    });
                } else if (this.changeMap) {
                    this.changeMap(result.targetMap, result.targetX, result.targetY, result.direction, result.isTeleport);
                }
            } else if (result.strategy === 'message') {
                const msgs = result.messageKeys.map((k) => logFormatter.format(k));
                this._openMessages(msgs);
            }
            return;
        }

        if (item.id === 'holy_water') {
            const payload = {
                actionType: 'USE_ITEM',
                itemId: 'holy_water',
                consumeCount: 1,
                holyWaterSteps: 128
            };

            this.onEnd();
            this._dispatchMenuAction(payload);

            this._playSe('magic');
            this._openMessages([logFormatter.format('menu_action.holy_water_1'), logFormatter.format('menu_action.holy_water_2')]);
        } else if (item.id === 'torch') {
            let currentTorch = this.player.torchSteps;
            if (typeof currentTorch !== 'number') {
                currentTorch = 0;
            }
            const nextTorch = Math.max(currentTorch, 60);
            const payload = {
                actionType: 'USE_ITEM',
                itemId: 'torch',
                consumeCount: 1,
                torchSteps: nextTorch
            };

            this.onEnd();
            this._dispatchMenuAction(payload);

            this._playSe('magic');
            this._openMessages([logFormatter.format('menu_action.torch_1'), logFormatter.format('menu_action.torch_2')]);
        } else if (item.id === 'lantern') {
            const nextLitState = !this.player.isLanternLit;
            const payload = {
                actionType: 'USE_ITEM',
                itemId: 'lantern',
                consumeCount: 0,
                isLanternLit: nextLitState
            };

            this.onEnd();
            this._dispatchMenuAction(payload);

            this._playSe('magic');
            if (nextLitState) {
                this._openMessages([logFormatter.format('menu_action.lantern_on')]);
            } else {
                this._openMessages([logFormatter.format('menu_action.lantern_off')]);
            }
        }
    }

    useMagic(spell) {
        const effectDef = spell.effect || (SPELL_DB[spell.id] ? SPELL_DB[spell.id].effect : null);
        if (effectDef && effectDef.type === 'heal_hp') {
            if (this.player.hp >= this.player.maxHp) {
                this.onEnd();
                this._openMessages([i18n.t('menu.full_hp')]);
                return;
            }
        }

        const spellCheck = canCastFieldSpell(spell.id, this.player);
        if (!spellCheck.allowed) {
            this.onEnd();
            if (spellCheck.reason === 'girl_priority') {
                this._openMessages([i18n.t('menu.girl_priority')]);
            } else {
                this._openMessages([i18n.t('menu.cannot_use_here')]);
            }
            return;
        }

        if (effectDef && effectDef.type === 'teleport') {
            const currentMap = this.getCurrentMap ? this.getCurrentMap() : null;
            const preCheck = effectResolver.resolve(effectDef, this.player, this.player, { currentMap });
            if (!preCheck.success) {
                this.onEnd();
                if (preCheck.reason === 'NO_RETURN_POINT') {
                    this._openMessages([i18n.t('menu.no_return_point')]);
                } else {
                    this._openMessages([i18n.t('menu.cannot_use_here')]);
                }
                return;
            }
        }

        if (this.player.mp < spell.cost) {
            this.onEnd();
            this._openMessages([i18n.t('menu.mp_shortage')]);
            return;
        }

        this._playSe('magic');
        this.onEnd();

        const spellName = SPELL_DB[spell.id]?.name || spell.name;
        const castMsg = logFormatter.format('menu_action.spell_cast', { spell: spellName });

        if (effectDef && (effectDef.type === 'heal_hp' || effectDef.type === 'cure_status')) {
            const result = effectResolver.resolve(effectDef, this.player, this.player);

            const payload = { actionType: 'USE_MAGIC', spellId: spell.id, mpCost: spell.cost };
            if (result.strategy === 'heal_hp') {
                payload.healHp = result.rawAmount;
            } else if (result.strategy === 'cure_status') {
                if (result.cured) {
                    payload.curePoison = true;
                }
            }

            this._dispatchMenuAction(payload);

            if (result.strategy === 'heal_hp') {
                this._playSe('heal');
                if (spell.id === 'hoimi') {
                    this._openMessages([castMsg, logFormatter.format('menu_action.healed')]);
                } else if (spell.id === 'behoimi') {
                    this._openMessages([castMsg, logFormatter.format('menu_action.greatly_healed')]);
                } else if (spell.id === 'behoma') {
                    this._openMessages([castMsg, logFormatter.format('menu_action.fully_healed')]);
                } else {
                    this._openMessages([castMsg, logFormatter.format('menu_action.healed')]);
                }
            } else if (result.strategy === 'cure_status') {
                if (result.cured) {
                    this._playSe('heal');
                    this._openMessages([castMsg, logFormatter.format('menu_action.antidote_2')]);
                } else {
                    this._openMessages([castMsg, logFormatter.format('menu_action.antidote_not_poisoned')]);
                }
            }
            return;
        }

        if (effectDef && effectDef.type === 'teleport') {
            const currentMap = this.getCurrentMap ? this.getCurrentMap() : null;
            const result = effectResolver.resolve(effectDef, this.player, this.player, { currentMap });

            const payload = { actionType: 'USE_MAGIC', spellId: spell.id, mpCost: spell.cost };
            this._dispatchMenuAction(payload);

            this._openMessages([castMsg]);
            if (this.eventBus) {
                this.eventBus.emit(ActionTypes.SYSTEM.CHANGE_MAP, {
                    targetMap: result.targetMap,
                    targetX: result.targetX,
                    targetY: result.targetY,
                    direction: result.direction,
                    isTeleport: result.isTeleport
                });
            } else if (this.changeMap) {
                this.changeMap(result.targetMap, result.targetX, result.targetY, result.direction, result.isTeleport);
            }
            return;
        }

        if (spell.id === 'remira') {
            const payload = { actionType: 'USE_MAGIC', spellId: spell.id, mpCost: spell.cost, remiraSteps: 120 };
            this._dispatchMenuAction(payload);
            this._openMessages([castMsg, logFormatter.format('menu_action.remira_shine')]);
        } else if (spell.id === 'toherosu') {
            const payload = { actionType: 'USE_MAGIC', spellId: spell.id, mpCost: spell.cost, holyWaterSteps: 128 };
            this._dispatchMenuAction(payload);
            this._openMessages([castMsg, logFormatter.format('menu_action.holy_water_2')]);
        }
    }

    draw(ctx, canvas) {
        this.renderer.render(ctx, canvas, this);
    }
}