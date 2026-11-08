// FILE_ENTRY: js/menu.js
import { logFormatter } from './logFormatter.js';
import { getObjectiveText, resolveCurrentObjectiveKey, canCastFieldSpell } from './events.js';
import { maps } from './maps.js';
import { ITEM_DB, SPELL_DB } from './items.js';
import { drawListBox, drawMessageBox } from './ui.js';
import { i18n } from './i18n.js';
import { EffectResolver } from './engine/effects/EffectResolver.js';
import { EventTypes } from './engine/core/EventTypes.js';
import { ActionTypes } from './engine/core/ActionTypes.js';
import { MenuStateMachine } from './engine/menu/MenuStateMachine.js';

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
    if (key === 'ArrowUp' || key === 'w' || key === 'W') {
      return 'UP';
    }
    if (key === 'ArrowDown' || key === 's' || key === 'S') {
      return 'DOWN';
    }
    if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
      return 'LEFT';
    }
    if (key === 'ArrowRight' || key === 'd' || key === 'D') {
      return 'RIGHT';
    }
    if (key === ' ' || key === 'Enter') {
      return 'CONFIRM';
    }
    if (key === 'Escape' || key === 'x' || key === 'X') {
      return 'CANCEL';
    }
    return null;
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
      if (!dropCheck.success) {
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
      this.player.removeItem(item.id, 1);
      this.onEnd();
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
        const mark = isEquipped ? 'E ' : '  ';
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
      this.player.unequip(slot);
      this.onEnd();
      this._playSe('chest');
      this._openMessages([i18n.t('menu.unequipped', { name: itemName })]);
      return;
    }

    this.player.equip(slot, item.id);
    this.onEnd();
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
      if (shouldConsume) {
        this.player.removeItem(item.id, 1);
      }

      this.onEnd();

      if (result.strategy === 'heal_hp') {
        this.player.heal(result.effectiveAmount);
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
        this.player.healMp(result.effectiveAmount);
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
          this.player.curePoison();
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
      this.player.removeItem('holy_water', 1);
      this.player.holyWaterSteps = 128;
      this.onEnd();
      this._playSe('magic');
      this._openMessages([logFormatter.format('menu_action.holy_water_1'), logFormatter.format('menu_action.holy_water_2')]);
    } else if (item.id === 'torch') {
      this.player.removeItem('torch', 1);
      this.player.torchSteps = Math.max(this.player.torchSteps || 0, 60);
      this.onEnd();
      this._playSe('magic');
      this._openMessages([logFormatter.format('menu_action.torch_1'), logFormatter.format('menu_action.torch_2')]);
    } else if (item.id === 'lantern') {
      this.player.isLanternLit = !this.player.isLanternLit;
      this.onEnd();
      this._playSe('magic');
      if (this.player.isLanternLit) {
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

    if (!this.player.consumeMp(spell.cost)) {
      this.onEnd();
      this._openMessages([i18n.t('menu.mp_shortage')]);
      return;
    }

    this._playSe('magic');

    const spellName = SPELL_DB[spell.id]?.name || spell.name;
    const castMsg = logFormatter.format('menu_action.spell_cast', { spell: spellName });

    if (effectDef && (effectDef.type === 'heal_hp' || effectDef.type === 'cure_status')) {
      const result = effectResolver.resolve(effectDef, this.player, this.player);
      this.onEnd();

      if (result.strategy === 'heal_hp') {
        this.player.heal(result.effectiveAmount);
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
          this.player.curePoison();
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
      this.onEnd();
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
      this.player.remiraSteps = 120;
      this.onEnd();
      this._openMessages([castMsg, logFormatter.format('menu_action.remira_shine')]);
    } else if (spell.id === 'toherosu') {
      this.player.holyWaterSteps = 128;
      this.onEnd();
      this._openMessages([castMsg, logFormatter.format('menu_action.holy_water_2')]);
    }
  }

  draw(ctx, canvas) {
    const cw = canvas ? canvas.width : 768;
    const ch = canvas ? canvas.height : 768;
    const margin = Math.floor(cw * 0.04);
    const winX = margin;
    const winWidth = cw - (margin * 2);
    const winHeight = Math.floor(ch * 0.28);
    const winY = ch - winHeight - margin;

    drawListBox(ctx, 32, 32, this.getRootCommands(), this.rootIndex, 7);

    if (this.phase === 'QUIT_CONFIRM') {
      drawMessageBox(ctx, winX, winY, winWidth, winHeight, i18n.t('menu.quit_confirm'));
      drawListBox(ctx, cw - margin - 150, winY - 96, [i18n.t('common.yes'), i18n.t('common.no')], this.quitConfirmIndex, 2);
    }

    if (this.phase === 'ITEM_SELECT' || this.phase === 'ITEM_ACTION' || this.phase === 'DROP_CONFIRM') {
      const displayItems = this.itemList.map(i => i.name);
      const cursor = (this.phase === 'ITEM_SELECT') ? this.itemIndex : -1;
      drawListBox(ctx, 160, 32, displayItems, cursor, 11);
    }

    if (this.phase === 'ITEM_ACTION' || this.phase === 'DROP_CONFIRM') {
      const cursor = (this.phase === 'ITEM_ACTION') ? this.actionIndex : -1;
      drawListBox(ctx, 400, 64, this.getActionCommands(), cursor, 3);
    }

    if (this.phase === 'DROP_CONFIRM') {
      const itemName = ITEM_DB[this.selectedItem.id].name;
      drawMessageBox(ctx, winX, winY, winWidth, winHeight, i18n.t('menu.drop_confirm', { name: itemName }));
      drawListBox(ctx, cw - margin - 150, winY - 96, [i18n.t('common.yes'), i18n.t('common.no')], this.dropConfirmIndex, 2);
    }
  }
}