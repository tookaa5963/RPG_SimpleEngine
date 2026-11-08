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

const effectResolver = new EffectResolver();

export class MenuManager {
  constructor(player, messageWindow, onEndCallback, changeMap, getCurrentMap, eventBus = null) {
    this.player = player;
    this.msgWin = messageWindow;
    this.onEnd = onEndCallback;
    this.changeMap = changeMap;
    this.getCurrentMap = getCurrentMap;
    this.eventBus = eventBus;

    this.phase = 'ROOT';
    this.rootIndex = 0;

    this.itemList = [];
    this.itemIndex = 0;
    this.currentMode = null;

    this.actionIndex = 0;
    this.selectedItem = null;
    this.dropConfirmIndex = 1;
    this.quitConfirmIndex = 1;
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
    this.phase = 'ROOT';
    this.rootIndex = 0;
  }

  showCurrentObjective() {
    const key = resolveCurrentObjectiveKey(this.player);
    this._openMessages([getObjectiveText(key)]);
  }

  handleKeyDown(key) {
    const rootCommands = this.getRootCommands();
    const actionCommands = this.getActionCommands();

    if (this.phase === 'ROOT') {
      if (key === 'ArrowUp' || key === 'w' || key === 'W') {
        this.rootIndex = (this.rootIndex - 1 + rootCommands.length) % rootCommands.length;
        this._playSe('submit');
      } else if (key === 'ArrowDown' || key === 's' || key === 'S') {
        this.rootIndex = (this.rootIndex + 1) % rootCommands.length;
        this._playSe('submit');
      } else if (key === ' ' || key === 'Enter') {
        this._playSe('submit');
        if (this.rootIndex === 0) {
          this.currentMode = 'magic';
          this.itemList = [];
          this.player.spells.forEach(spellId => {
            const spell = SPELL_DB[spellId];
            if (spell && spell.fieldUsable) {
              this.itemList.push({ name: `${spell.name}(MP${spell.cost})`, id: spell.id, cost: spell.cost, type: 'magic' });
            }
          });
          this.itemList.push({ name: i18n.t('common.back'), id: 'cancel' });
          this.itemIndex = 0;
          this.phase = 'ITEM_SELECT';
        } else if (this.rootIndex === 1) {
          this.currentMode = 'item';
          this.itemList = [];
          for (const [id, count] of Object.entries(this.player.inventory)) {
            if (count > 0 && ITEM_DB[id]) {
              const isEquipped = (this.player.equipment.weapon === id || this.player.equipment.armor === id || this.player.equipment.shield === id);
              this.itemList.push({ name: `${isEquipped ? 'E ' : ''}${ITEM_DB[id].name}`, id: id, type: ITEM_DB[id].type });
            }
          }
          this.itemList.push({ name: i18n.t('common.back'), id: 'cancel' });
          this.itemIndex = 0;
          this.phase = 'ITEM_SELECT';
        } else if (this.rootIndex === 2) {
          this.openEquipMenu();
        } else if (this.rootIndex === 3) {
          this.onEnd();
          this.showCurrentObjective();
        } else if (this.rootIndex === 4) {
          if (this.eventBus) this.eventBus.emit(ActionTypes.SYSTEM.OPEN_SLOT_DIALOG, { mode: 'load' });
        } else if (this.rootIndex === 5) {
          if (this.eventBus) this.eventBus.emit(ActionTypes.SYSTEM.OPEN_SLOT_DIALOG, { mode: 'save' });
        } else if (this.rootIndex === 6) {
          this.quitConfirmIndex = 1;
          this.phase = 'QUIT_CONFIRM';
        }
      } else if (key === 'Escape' || key === 'x' || key === 'X') {
        this.onEnd();
        this._playSe('submit');
      }

    } else if (this.phase === 'QUIT_CONFIRM') {
      if (
        key === 'ArrowUp' || key === 'ArrowDown' || key === 'w' || key === 's' ||
        key === 'ArrowLeft' || key === 'ArrowRight' || key === 'a' || key === 'd'
      ) {
        this.quitConfirmIndex = this.quitConfirmIndex === 0 ? 1 : 0;
        this._playSe('submit');
      } else if (key === ' ' || key === 'Enter') {
        if (this.quitConfirmIndex === 0) {
          this.onEnd();
          this._playSe('submit');
          if (this.eventBus) {
            this.eventBus.emit(ActionTypes.SYSTEM.RETURN_TO_TITLE);
          }
        } else {
          this._playSe('submit');
          this.phase = 'ROOT';
        }
      } else if (key === 'Escape' || key === 'x' || key === 'X') {
        this._playSe('cancel');
        this.phase = 'ROOT';
      }

    } else if (this.phase === 'ITEM_SELECT') {
      if (key === 'ArrowUp' || key === 'w' || key === 'W') {
        this.itemIndex = (this.itemIndex - 1 + this.itemList.length) % this.itemList.length;
        this._playSe('submit');
      } else if (key === 'ArrowDown' || key === 's' || key === 'S') {
        this.itemIndex = (this.itemIndex + 1) % this.itemList.length;
        this._playSe('submit');
      } else if (key === ' ' || key === 'Enter') {
        this._playSe('submit');
        const selected = this.itemList[this.itemIndex];
        if (selected.id === 'cancel') {
          this.phase = 'ROOT';
        } else {
          if (this.currentMode === 'magic') {
            this.useMagic(selected);
          } else if (this.currentMode === 'equip') {
            this.equipItem(selected);
          } else {
            this.selectedItem = selected;
            this.actionIndex = 0;
            this.phase = 'ITEM_ACTION';
          }
        }
      } else if (key === 'Escape' || key === 'x' || key === 'X') {
        this._playSe('submit');
        this.phase = 'ROOT';
      }

    } else if (this.phase === 'ITEM_ACTION') {
      if (key === 'ArrowUp' || key === 'w' || key === 'W') {
        this.actionIndex = (this.actionIndex - 1 + actionCommands.length) % actionCommands.length;
        this._playSe('submit');
      } else if (key === 'ArrowDown' || key === 's' || key === 'S') {
        this.actionIndex = (this.actionIndex + 1) % actionCommands.length;
        this._playSe('submit');
      } else if (key === ' ' || key === 'Enter') {
        this._playSe('submit');
        if (this.actionIndex === 0) {
          const effectDef = this.selectedItem.effect || (ITEM_DB[this.selectedItem.id] ? ITEM_DB[this.selectedItem.id].effect : null);
          if (this.selectedItem.type === 'weapon' || this.selectedItem.type === 'armor' || this.selectedItem.type === 'shield') {
            this.equipItem(this.selectedItem);
          } else if (effectDef) {
            this.useItem(this.selectedItem);
          } else if (this.selectedItem.type === 'charm') {
            this.onEnd();
            this._openMessages([logFormatter.format('menu_action.charm_passive')]);
          } else if (this.selectedItem.type === 'key' || this.selectedItem.type === 'keyItem') {
            this.onEnd();
            this._openMessages([i18n.t('menu.cannot_use_here')]);
          } else {
            this.useItem(this.selectedItem);
          }
        } else if (this.actionIndex === 1) {
          const dropCheck = this.player.canDropItem(this.selectedItem);
          if (!dropCheck.success) {
            this.onEnd();
            let msgKey = 'menu.cannot_drop_key';
            if (dropCheck.reason === 'equipped') {
              msgKey = 'menu.cannot_drop_equipped';
            }
            this._openMessages([i18n.t(msgKey)]);
          } else {
            this.dropConfirmIndex = 1;
            this.phase = 'DROP_CONFIRM';
          }
        } else {
          this.phase = 'ITEM_SELECT';
        }
      } else if (key === 'Escape' || key === 'x' || key === 'X') {
        this._playSe('submit');
        this.phase = 'ITEM_SELECT';
      }

    } else if (this.phase === 'DROP_CONFIRM') {
      if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'w' || key === 's') {
        this.dropConfirmIndex = this.dropConfirmIndex === 0 ? 1 : 0;
        this._playSe('submit');
      } else if (key === ' ' || key === 'Enter') {
        if (this.dropConfirmIndex === 0) {
          this.player.removeItem(this.selectedItem.id, 1);
          this.onEnd();
          this._playSe('submit');
          this._playSe('chest');
          const itemName = ITEM_DB[this.selectedItem.id].name;
          this._openMessages([i18n.t('menu.dropped', { name: itemName })]);
        } else {
          this._playSe('submit');
          this.phase = 'ITEM_ACTION';
        }
      } else if (key === 'Escape' || key === 'x' || key === 'X') {
        this._playSe('submit');
        this.phase = 'ITEM_ACTION';
      }
    }
  }

  openEquipMenu() {
    this.currentMode = 'equip';
    this.itemList = [];

    for (const [id, count] of Object.entries(this.player.inventory)) {
      if (count > 0 && ITEM_DB[id] && (ITEM_DB[id].type === 'weapon' || ITEM_DB[id].type === 'armor' || ITEM_DB[id].type === 'shield')) {
        const isEquipped = (this.player.equipment.weapon === id || this.player.equipment.armor === id || this.player.equipment.shield === id);
        const mark = isEquipped ? 'E ' : '  ';
        this.itemList.push({ name: `${mark}${ITEM_DB[id].name}`, id: id, type: ITEM_DB[id].type });
      }
    }

    this.itemList.push({ name: i18n.t('common.back'), id: 'cancel' });
    this.itemIndex = 0;
    this.phase = 'ITEM_SELECT';
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