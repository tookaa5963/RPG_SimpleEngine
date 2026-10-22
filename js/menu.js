// FILE_ENTRY: js/menu.js
import { logFormatter } from './logFormatter.js';
import { sound } from './sound.js';
import { maps } from './maps.js';
import { ITEM_DB, SPELL_DB } from './items.js';
import { drawListBox, drawMessageBox } from './ui.js';
import { i18n } from './i18n.js';

export class MenuManager {
  constructor(player, messageWindow, onEndCallback, onOpenSlot, changeMap, getCurrentMap, onReturnToTitle = null) {
    this.player = player;
    this.msgWin = messageWindow;
    this.onEnd = onEndCallback;
    this.onOpenSlot = onOpenSlot;
    this.changeMap = changeMap;
    this.getCurrentMap = getCurrentMap;
    this.onReturnToTitle = onReturnToTitle;

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
    const p = this.player;
    const flags = p.flags || {};
    let key = '';

    if (!flags.talkedToSister) {
      key = 'talk_sister';
    } else if (!flags.talkedToScholar) {
      key = 'find_scholar';
    } else if (!flags.reportedMonumentToScholar) {
      const hasKey = (p.inventory.antique_key || 0) > 0 || (p.inventory.key || 0) > 0;
      key = hasKey ? 'report_scholar' : 'investigate_monument';
    } else if (!flags.hasPass) {
      if (flags.rescuedGirl) {
        key = 'return_girl';
      } else if (flags.kidnappingEventStarted) {
        key = 'rescue_girl';
      } else if (flags.heardPassRequirement) {
        key = 'consult_mayor';
      } else {
        key = 'cross_checkpoint';
      }
    } else if (!flags.heardOfTizona) {
      key = 'go_library';
    } else if (!flags.returnedLoversRing) {
      if (!flags.elfQuestStarted) {
        key = 'find_temple';
      } else {
        const hasRing = (p.inventory.lovers_ring || 0) > 0;
        key = hasRing ? 'deliver_ring' : 'recover_ring';
      }
    } else if (!flags.receivedWaterShield && (p.inventory.water_shield || 0) === 0 && p.equipment.shield !== 'water_shield') {
      key = 'obtain_water_shield';
    } else if ((p.inventory.corrada || 0) === 0 && p.equipment.weapon !== 'corrada') {
      key = 'obtain_corrada';
    } else if ((p.inventory.dragon_armor || 0) === 0 && p.equipment.armor !== 'dragon_armor') {
      if (!flags.blackLizardQuestStarted) {
        key = flags.heardOfDwarf ? 'seek_dwarf_village' : 'seek_armor_clues';
      } else if (!flags.blackLizardDefeated) {
        key = 'defeat_black_lizard';
      } else if (!flags.blackLizardQuestCompleted) {
        key = 'report_black_lizard';
      } else if (!flags.cerberusQuestStarted) {
        key = 'consult_blacksmith';
      } else if ((p.inventory.cerberus_mane || 0) > 0) {
        key = 'deliver_mane';
      } else {
        key = 'defeat_cerberus';
      }
    } else {
      key = 'defeat_black_dragon';
    }

    this.msgWin.open([i18n.t(`objectives.${key}`)]);
  }

handleKeyDown(key) {
    const rootCommands = this.getRootCommands();
    const actionCommands = this.getActionCommands();

    if (this.phase === 'ROOT') {
      if (key === 'ArrowUp' || key === 'w' || key === 'W') {
        this.rootIndex = (this.rootIndex - 1 + rootCommands.length) % rootCommands.length;
        sound.playSubmit();
      } else if (key === 'ArrowDown' || key === 's' || key === 'S') {
        this.rootIndex = (this.rootIndex + 1) % rootCommands.length;
        sound.playSubmit();
      } else if (key === ' ' || key === 'Enter') {
        sound.playSubmit();
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
          if (this.onOpenSlot) this.onOpenSlot('load');
        } else if (this.rootIndex === 5) {
          if (this.onOpenSlot) this.onOpenSlot('save');
        } else if (this.rootIndex === 6) {
          this.quitConfirmIndex = 1;
          this.phase = 'QUIT_CONFIRM';
        }
      } else if (key === 'Escape' || key === 'x' || key === 'X') {
        sound.playSubmit();
        this.onEnd();
      }

    } else if (this.phase === 'QUIT_CONFIRM') {
      if (
        key === 'ArrowUp' || key === 'ArrowDown' || key === 'w' || key === 's' ||
        key === 'ArrowLeft' || key === 'ArrowRight' || key === 'a' || key === 'd'
      ) {
        this.quitConfirmIndex = this.quitConfirmIndex === 0 ? 1 : 0;
        sound.playSubmit();
      } else if (key === ' ' || key === 'Enter') {
        sound.playSubmit();
        if (this.quitConfirmIndex === 0) {
          this.onEnd();
          if (this.onReturnToTitle) {
            this.onReturnToTitle();
          }
        } else {
          this.phase = 'ROOT';
        }
      } else if (key === 'Escape' || key === 'x' || key === 'X') {
        sound.playCancel();
        this.phase = 'ROOT';
      }

    } else if (this.phase === 'ITEM_SELECT') {
      if (key === 'ArrowUp' || key === 'w' || key === 'W') {
        this.itemIndex = (this.itemIndex - 1 + this.itemList.length) % this.itemList.length;
        sound.playSubmit();
      } else if (key === 'ArrowDown' || key === 's' || key === 'S') {
        this.itemIndex = (this.itemIndex + 1) % this.itemList.length;
        sound.playSubmit();
      } else if (key === ' ' || key === 'Enter') {
        sound.playSubmit();
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
        sound.playSubmit();
        this.phase = 'ROOT';
      }

    } else if (this.phase === 'ITEM_ACTION') {
      if (key === 'ArrowUp' || key === 'w' || key === 'W') {
        this.actionIndex = (this.actionIndex - 1 + actionCommands.length) % actionCommands.length;
        sound.playSubmit();
      } else if (key === 'ArrowDown' || key === 's' || key === 'S') {
        this.actionIndex = (this.actionIndex + 1) % actionCommands.length;
        sound.playSubmit();
      } else if (key === ' ' || key === 'Enter') {
        sound.playSubmit();
        if (this.actionIndex === 0) {
          if (this.selectedItem.type === 'weapon' || this.selectedItem.type === 'armor' || this.selectedItem.type === 'shield') {
            this.equipItem(this.selectedItem);
          } else if (this.selectedItem.id === 'forest_guide') {
            this.useItem(this.selectedItem);
          } else if (this.selectedItem.id === 'broken_corrada_hilt') {
            this.onEnd();
            this.msgWin.open([
              logFormatter.format('menu_action.broken_hilt_1'),
              logFormatter.format('menu_action.broken_hilt_2')
            ]);
          } else if (this.selectedItem.type === 'charm') {
            this.onEnd();
            this.msgWin.open([logFormatter.format('menu_action.charm_passive')]);
          } else if (this.selectedItem.type === 'key' || this.selectedItem.type === 'keyItem') {
            this.onEnd();
            this.msgWin.open([i18n.t('menu.cannot_use_here')]);
          } else {
            this.useItem(this.selectedItem);
          }
        } else if (this.actionIndex === 1) {
          const isEquipped = (this.player.equipment.weapon === this.selectedItem.id || this.player.equipment.armor === this.selectedItem.id || this.player.equipment.shield === this.selectedItem.id);

          if (isEquipped) {
            this.onEnd();
            this.msgWin.open([i18n.t('menu.cannot_drop_equipped')]);
          } else if (this.selectedItem.type === 'key' || this.selectedItem.type === 'keyItem') {
            this.onEnd();
            this.msgWin.open([i18n.t('menu.cannot_drop_key')]);
          } else {
            this.dropConfirmIndex = 1;
            this.phase = 'DROP_CONFIRM';
          }
        } else {
          this.phase = 'ITEM_SELECT';
        }
      } else if (key === 'Escape' || key === 'x' || key === 'X') {
        sound.playSubmit();
        this.phase = 'ITEM_SELECT';
      }

    } else if (this.phase === 'DROP_CONFIRM') {
      if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'w' || key === 's') {
        this.dropConfirmIndex = this.dropConfirmIndex === 0 ? 1 : 0;
        sound.playSubmit();
      } else if (key === ' ' || key === 'Enter') {
        sound.playSubmit();
        if (this.dropConfirmIndex === 0) {
          this.player.removeItem(this.selectedItem.id, 1);
          sound.playChest();
          this.onEnd();
          const itemName = ITEM_DB[this.selectedItem.id].name;
          this.msgWin.open([i18n.t('menu.dropped', { name: itemName })]);
        } else {
          this.phase = 'ITEM_ACTION';
        }
      } else if (key === 'Escape' || key === 'x' || key === 'X') {
        sound.playSubmit();
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
    const isEquipped = (
      this.player.equipment.weapon === item.id ||
      this.player.equipment.armor === item.id ||
      this.player.equipment.shield === item.id
    );
    const itemName = ITEM_DB[item.id].name;

    if (isEquipped) {
      if (this.player.isInventoryFull(1)) {
        sound.playBump();
        this.onEnd();
        this.msgWin.open([i18n.t('menu.inventory_full_unequip')]);
        return;
      }
      if (item.type === 'weapon') this.player.equipment.weapon = null;
      else if (item.type === 'armor') this.player.equipment.armor = null;
      else if (item.type === 'shield') this.player.equipment.shield = null;

      sound.playChest();
      this.onEnd();
      this.msgWin.open([i18n.t('menu.unequipped', { name: itemName })]);
      return;
    }

    if (item.type === 'weapon') this.player.equipment.weapon = item.id;
    else if (item.type === 'armor') this.player.equipment.armor = item.id;
    else if (item.type === 'shield') this.player.equipment.shield = item.id;

    sound.playChest();
    this.onEnd();
    this.msgWin.open([i18n.t('menu.equipped', { name: itemName })]);
  }

  useItem(item) {
    if (item.id === 'herb') {
      if (this.player.hp >= this.player.maxHp) {
        this.onEnd();
        this.msgWin.open([i18n.t('menu.full_hp')]);
        return;
      }
      this.player.removeItem('herb', 1);
      this.player.heal(30);
      sound.playHeal();
      this.onEnd();
      this.msgWin.open([logFormatter.format('menu_action.used_herb_1'), logFormatter.format('menu_action.used_herb_2')]);
    } else if (item.id === 'strong_herb') {
      if (this.player.hp >= this.player.maxHp) {
        this.onEnd();
        this.msgWin.open([i18n.t('menu.full_hp')]);
        return;
      }
      this.player.removeItem('strong_herb', 1);
      this.player.heal(70);
      sound.playHeal();
      this.onEnd();
      this.msgWin.open([logFormatter.format('menu_action.used_strong_herb_1'), logFormatter.format('menu_action.used_strong_herb_2')]);
    } else if (item.id === 'special_herb') {
      if (this.player.hp >= this.player.maxHp) {
        this.onEnd();
        this.msgWin.open([i18n.t('menu.full_hp')]);
        return;
      }
      this.player.removeItem('special_herb', 1);
      this.player.heal(120);
      sound.playHeal();
      this.onEnd();
      this.msgWin.open([logFormatter.format('menu_action.used_special_herb_1'), logFormatter.format('menu_action.used_strong_herb_2')]);
    } else if (item.id === 'magic_water') {
      if (this.player.mp >= this.player.maxMp) {
        this.onEnd();
        this.msgWin.open([i18n.t('menu.full_mp')]);
        return;
      }
      this.player.removeItem('magic_water', 1);
      this.player.healMp(15);
      sound.playHeal();
      this.onEnd();
      this.msgWin.open([logFormatter.format('menu_action.drank_magic_water_1'), logFormatter.format('menu_action.drank_magic_water_2')]);
    } else if (item.id === 'sage_water') {
      if (this.player.mp >= this.player.maxMp) {
        this.onEnd();
        this.msgWin.open([i18n.t('menu.full_mp')]);
        return;
      }
      this.player.removeItem('sage_water', 1);
      this.player.healMp(40);
      sound.playHeal();
      this.onEnd();
      this.msgWin.open([logFormatter.format('menu_action.drank_sage_water_1'), logFormatter.format('menu_action.drank_sage_water_2')]);
    } else if (item.id === 'holy_water') {
      this.player.removeItem('holy_water', 1);
      this.player.holyWaterSteps = 128;
      sound.playMagic();
      this.onEnd();
      this.msgWin.open([logFormatter.format('menu_action.holy_water_1'), logFormatter.format('menu_action.holy_water_2')]);
    } else if (item.id === 'torch') {
      this.player.removeItem('torch', 1);
      this.player.torchSteps = Math.max(this.player.torchSteps || 0, 60);
      sound.playMagic();
      this.onEnd();
      this.msgWin.open([logFormatter.format('menu_action.torch_1'), logFormatter.format('menu_action.torch_2')]);
    } else if (item.id === 'lantern') {
      this.player.isLanternLit = !this.player.isLanternLit;
      sound.playMagic();
      this.onEnd();
      if (this.player.isLanternLit) {
        this.msgWin.open([logFormatter.format('menu_action.lantern_on')]);
      } else {
        this.msgWin.open([logFormatter.format('menu_action.lantern_off')]);
      }
    } else if (item.id === 'antidote') {
      this.player.removeItem('antidote', 1);
      this.onEnd();
      if (this.player.isPoisoned) {
        this.player.curePoison();
        sound.playHeal();
        this.msgWin.open([logFormatter.format('menu_action.antidote_1'), logFormatter.format('menu_action.antidote_2')]);
      } else {
        sound.playHeal();
        this.msgWin.open([logFormatter.format('menu_action.antidote_1'), logFormatter.format('menu_action.antidote_not_poisoned')]);
      }
    } else if (item.id === 'forest_guide') {
      const currentMap = this.getCurrentMap ? this.getCurrentMap() : null;
      const isForest = (currentMap === maps.forest || currentMap === maps.forest2 || currentMap === maps.forest3 || currentMap === maps.deep_forest);

      if (!isForest) {
        this.onEnd();
        this.msgWin.open([i18n.t('menu.cannot_use_here')]);
        return;
      }

      sound.playMagic();
      this.onEnd();
      this.msgWin.open([logFormatter.format('menu_action.forest_guide')]);
      if (this.changeMap) {
        this.changeMap('temple', 11, 9, 'up', true);
      }
    }
  }

useMagic(spell) {
    if (spell.id === 'hoimi' || spell.id === 'behoimi' || spell.id === 'behoma') {
      if (this.player.hp >= this.player.maxHp) {
        this.onEnd();
        this.msgWin.open([i18n.t('menu.full_hp')]);
        return;
      }
    }

    if (spell.id === 'liremito') {
      const currentMap = this.getCurrentMap ? this.getCurrentMap() : null;
      if (!currentMap || !currentMap.escapeTarget) {
        this.onEnd();
        this.msgWin.open([i18n.t('menu.cannot_use_here')]);
        return;
      }
    }

    if (spell.id === 'rula') {
      const currentMap = this.getCurrentMap ? this.getCurrentMap() : null;
      if (currentMap && (currentMap.isDark || currentMap.escapeTarget)) {
        this.onEnd();
        this.msgWin.open([i18n.t('menu.cannot_use_here')]);
        return;
      }
      if (!this.player.returnPoint || !this.player.returnPoint.mapId) {
        this.onEnd();
        this.msgWin.open([i18n.t('menu.no_return_point')]);
        return;
      }
    }

    if ((spell.id === 'liremito' || spell.id === 'rula') && this.player.flags.rescuedGirl && !this.player.flags.hasPass) {
      this.onEnd();
      this.msgWin.open([i18n.t('menu.girl_priority')]);
      return;
    }

    if (!this.player.consumeMp(spell.cost)) {
      this.onEnd();
      this.msgWin.open([i18n.t('menu.mp_shortage')]);
      return;
    }

    sound.playMagic();

    const spellName = SPELL_DB[spell.id]?.name || spell.name;
    const castMsg = logFormatter.format('menu_action.spell_cast', { spell: spellName });

    if (spell.id === 'hoimi') {
      const healAmount = Math.floor(Math.random() * 8) + 25;
      this.player.heal(healAmount);
      sound.playHeal();
      this.onEnd();
      this.msgWin.open([castMsg, logFormatter.format('menu_action.healed')]);
    } else if (spell.id === 'behoimi') {
      const healAmount = Math.floor(Math.random() * 16) + 75;
      this.player.heal(healAmount);
      sound.playHeal();
      this.onEnd();
      this.msgWin.open([castMsg, logFormatter.format('menu_action.greatly_healed')]);
    } else if (spell.id === 'behoma') {
      this.player.heal(this.player.maxHp);
      sound.playHeal();
      this.onEnd();
      this.msgWin.open([castMsg, logFormatter.format('menu_action.fully_healed')]);
    } else if (spell.id === 'remira') {
      this.player.remiraSteps = 120;
      this.onEnd();
      this.msgWin.open([castMsg, logFormatter.format('menu_action.remira_shine')]);
    } else if (spell.id === 'toherosu') {
      this.player.holyWaterSteps = 128;
      this.onEnd();
      this.msgWin.open([castMsg, logFormatter.format('menu_action.holy_water_2')]);
    } else if (spell.id === 'kiari') {
      this.onEnd();
      if (this.player.isPoisoned) {
        this.player.curePoison();
        sound.playHeal();
        this.msgWin.open([castMsg, logFormatter.format('menu_action.antidote_2')]);
      } else {
        this.msgWin.open([castMsg, logFormatter.format('menu_action.antidote_not_poisoned')]);
      }
    } else if (spell.id === 'liremito') {
      const escape = this.getCurrentMap().escapeTarget;
      this.onEnd();
      this.msgWin.open([castMsg]);
      if (this.changeMap) {
        this.changeMap(escape.targetMap, escape.targetX, escape.targetY, escape.direction, true);
      }
    } else if (spell.id === 'rula') {
      const returnPt = this.player.returnPoint;
      this.onEnd();
      this.msgWin.open([castMsg]);
      if (this.changeMap) {
        this.changeMap(returnPt.mapId, returnPt.gridX, returnPt.gridY, returnPt.direction || 'down', true);
      }
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