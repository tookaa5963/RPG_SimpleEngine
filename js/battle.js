// FILE_ENTRY: js/battle.js
import { sound } from './sound.js';
import { SPELL_DB, ITEM_DB } from './items.js';
import { MONSTER_DEFINITIONS } from './monsters.js';
import { BattleEffects } from './battleEffects.js';
import { executeBattleAction } from './battleActions.js';
import { BattleRenderer } from './drivers/battle/BattleRenderer.js';
import { i18n } from './i18n.js';
import { logFormatter } from './logFormatter.js';
import {
  calcDamage,
  calcCriticalDamage,
  calcEnemyCriticalDamage,
  calcSpellDamage,
  calcBreathDamage,
  calcSpecialPhysicalDamage,
  applyDamageRate,
  applyDamageReduction,
  checkChance,
  calcStatusTurns,
  determineFirstAttacker,
  checkEscape
} from './engine/battle/BattleCalculator.js';
import { RewardCalculator } from './engine/battle/RewardCalculator.js';
import { BattleStateMachine, BattleState } from './engine/battle/BattleStateMachine.js';

export { MONSTER_DEFINITIONS } from './monsters.js';

export class BattleManager {
  constructor(player, onEndCallback) {
    this.player = player;
    this.onEnd = onEndCallback;
    this.enemy = null;
    this.phase = 'START';
    this.commandIndex = 0;
    this.itemList = [];
    this.itemIndex = 0;
    this.messages = [];
    this.currentText = '';
    this.displayedText = '';
    this.charIndex = 0;
    this.charTimer = 0;
    this.textSpeed = 2;
    this.isTextComplete = false;
    this.enemyFlashTimer = 0;
    this.renderer = new BattleRenderer();
    this.effects = new BattleEffects();

    this.playerSleepTurns = 0;
    this.playerSpellSealed = false;

    this.pendingDropItem = null;
    this.discardList = [];
    this.discardIndex = 0;

    this.cw = 768;
    this.ch = 768;

    this.stateMachine = new BattleStateMachine();
  }

  getCommands() {
    return [
      i18n.t('battle.attack'),
      i18n.t('battle.spell'),
      i18n.t('battle.item'),
      i18n.t('battle.escape')
    ];
  }

  get enemyImage() {
    return this.renderer.enemyImage;
  }

  get isImageLoaded() {
    return this.renderer.isImageLoaded;
  }

  get enemyCenter() {
    return { x: this.cw * 0.5, y: this.ch * 0.36 };
  }

  get enemyPopupPos() {
    return { x: this.cw * 0.5, y: this.ch * 0.18 };
  }

  get playerCenter() {
    return { x: this.cw * 0.5, y: this.ch * 0.54 };
  }

  get playerPopupPos() {
    return { x: this.cw * 0.5, y: this.ch * 0.50 };
  }

startBattle(monsterId, isAmbush = false) {
    const base = MONSTER_DEFINITIONS[monsterId];
    if (!base) {
      throw new Error(`[BattleManager] Invalid monsterId "${monsterId}". Entity not found in MONSTER_DEFINITIONS.`);
    }

    this.stateMachine = new BattleStateMachine();
    this.stateMachine.init({ isAmbush: Boolean(isAmbush) });

    this.enemy = { ...base };
    this.enemy.sleepTurns = 0;
    this.enemy.spellSealed = false;
    this.playerSleepTurns = 0;
    this.playerSpellSealed = false;
    this.phase = 'MESSAGE';
    this.commandIndex = 0;
    this.itemIndex = 0;
    this.enemyFlashTimer = 0;
    this.pendingDropItem = null;
    this.discardList = [];
    this.discardIndex = 0;
    this.effects.reset();
    if (this.enemy && this.enemy.imageSrc) {
      this.renderer.loadEnemyImage(this.enemy.imageSrc);
    }

    sound.playBgm('battle');

    if (isAmbush) {
      this.queueMessages([
        logFormatter.format('battle_log.appeared', { name: this.enemy.name }),
        logFormatter.format('battle_log.enemy_ambush', { name: this.enemy.name })
      ], () => {
        this.stateMachine.proceedToTurnCheck();
        this.stateMachine.resolveTurnCheck({ canAct: false });
        this.runEnemyTurn();
      });
    } else {
      this.queueMessages([logFormatter.format('battle_log.appeared', { name: this.enemy.name })], () => {
        this.checkPlayerTurn(true);
      });
    }
  }

  checkPlayerTurn(isFirstTurn = false) {
    if (this.stateMachine.state !== BattleState.TURN_CHECK) {
      this.stateMachine.proceedToTurnCheck();
    }

    if (!isFirstTurn && this.player.isPoisoned && this.player.hp > 0) {
      const hasCharm = (this.player.inventory.poison_charm || 0) > 0;
      const rate = hasCharm ? 0.025 : 0.05;
      const poisonDmg = Math.max(1, Math.ceil(this.player.maxHp * rate));
      this.player.damage(poisonDmg);
      sound.playPoisonDamage();
      this.effects.shake(14);
      this.effects.addPopup(poisonDmg, this.playerPopupPos.x, this.playerPopupPos.y, '#ffffff', '#8854d0', true, 'shake');

      const poisonBadge = i18n.t('ui.poison_badge').trim();
      const damageMsg = logFormatter.format('battle_log.hero_damage', { dmg: String(poisonDmg) });
      const poisonMsg = `${poisonBadge} ${damageMsg}`;

      this.queueMessages([poisonMsg], () => {
        if (this.player.hp <= 0) {
          this.stateMachine.resolveDefeat();
          this.defeat();
        } else {
          this.proceedPlayerTurn();
        }
      });
      return;
    }
    this.proceedPlayerTurn();
  }

  proceedPlayerTurn() {
    if (this.playerSleepTurns > 0) {
      this.playerSleepTurns--;
      if (this.playerSleepTurns <= 0) {
        this.playerSleepTurns = 0;
        this.queueMessages([logFormatter.format('battle_log.player_awake')], () => {
          this.stateMachine.resolveTurnCheck({ canAct: true });
          this.commandIndex = 0;
          this.phase = 'COMMAND_SELECT';
        });
      } else {
        this.queueMessages([logFormatter.format('battle_log.player_sleep')], () => {
          this.stateMachine.resolveTurnCheck({ canAct: false });
          this.runEnemyTurn();
        });
      }
      return;
    }
    this.stateMachine.resolveTurnCheck({ canAct: true });
    this.commandIndex = 0;
    this.phase = 'COMMAND_SELECT';
  }

  queueMessages(lines, nextCallback) {
    this.messages = [...lines];
    this.nextCallback = nextCallback;
    this.nextMessage();
  }

  nextMessage() {
    if (this.messages.length > 0) {
      this.currentText = this.messages.shift();
      this.displayedText = '';
      this.charIndex = 0;
      this.charTimer = 0;
      this.isTextComplete = false;
      this.phase = 'MESSAGE';
    } else {
      if (this.nextCallback) {
        const cb = this.nextCallback;
        this.nextCallback = null;
        cb();
      }
    }
  }

  calcDamage(atk, def) {
    return calcDamage(atk, def);
  }

  calcCriticalDamage(atk) {
    return calcCriticalDamage(atk);
  }

  executeCommand() {
    if (this.stateMachine.state !== BattleState.COMMAND_WAIT) {
      return;
    }
    if (this.commandIndex === 0) {
      this.stateMachine.submitCommand('ATTACK');
      this.runTurn('ATTACK');
    } else if (this.commandIndex === 1) {
      this.openMagicMenu();
    } else if (this.commandIndex === 2) {
      this.openItemMenu();
    } else if (this.commandIndex === 3) {
      this.stateMachine.submitCommand('ESCAPE');
      this.runEscape();
    }
  }

  openMagicMenu() {
    if (this.playerSpellSealed) {
      this.queueMessages([i18n.t('battle.magic_sealed')], () => {
        this.commandIndex = 0;
        this.phase = 'COMMAND_SELECT';
      });
      return;
    }

    this.itemList = [];
    this.player.spells.forEach(spellId => {
      const spell = SPELL_DB[spellId];
      if (spell && spell.battleUsable) {
        this.itemList.push({ name: `${spell.name}(MP${spell.cost})`, id: spell.id, cost: spell.cost, type: 'magic' });
      }
    });

    if (this.itemList.length === 0) {
      this.queueMessages([i18n.t('battle.no_magic')], () => {
        this.commandIndex = 0;
        this.phase = 'COMMAND_SELECT';
      });
      return;
    }
    this.itemList.push({ name: i18n.t('common.back'), id: 'cancel', type: 'cancel' });
    this.itemIndex = 0;
    this.phase = 'ITEM_SELECT';
  }

  openItemMenu() {
    this.itemList = [];
    const validItems = ['herb', 'strong_herb', 'special_herb', 'magic_water', 'sage_water', 'antidote'];
    validItems.forEach(id => {
      if ((this.player.inventory[id] || 0) > 0 && ITEM_DB[id]) {
        this.itemList.push({ name: ITEM_DB[id].name, id: id, type: 'item' });
      }
    });

    if (this.itemList.length === 0) {
      this.queueMessages([i18n.t('battle.no_items')], () => {
        this.commandIndex = 0;
        this.phase = 'COMMAND_SELECT';
      });
      return;
    }
    this.itemList.push({ name: i18n.t('common.back'), id: 'cancel', type: 'cancel' });
    this.itemIndex = 0;
    this.phase = 'ITEM_SELECT';
  }

  executeSelection(selected) {
    if (this.stateMachine.state !== BattleState.COMMAND_WAIT) {
      return;
    }
    if (selected.type === 'magic') {
      this.stateMachine.submitCommand('SPELL');
    } else if (selected.type === 'item') {
      this.stateMachine.submitCommand('ITEM');
    }
    executeBattleAction(this, selected);
  }

  runTurn(actionType) {
    const playerFirst = determineFirstAttacker(this.player.spd, this.enemy.spd);
    if (playerFirst) {
      if (actionType === 'ATTACK') {
        this.playerAttack(() => {
          if (this.enemy.hp <= 0) this.victory();
          else this.runEnemyTurn();
        });
      }
    } else {
      this.enemyAttack(() => {
        if (this.player.hp <= 0) this.defeat();
        else {
          if (actionType === 'ATTACK') {
            this.playerAttack(() => {
              if (this.enemy.hp <= 0) this.victory();
              else {
                this.checkPlayerTurn();
              }
            });
          }
        }
      });
    }
  }

  runEnemyTurn() {
    this.enemyAttack(() => {
      if (this.player.hp <= 0) this.defeat();
      else {
        this.checkPlayerTurn();
      }
    });
  }

  playerAttack(onFinish) {
    const isCrit = checkChance(0.0625);
    let dmg = isCrit ? this.calcCriticalDamage(this.player.atk) : this.calcDamage(this.player.atk, this.enemy.def);

    if (this.enemy.physicalDamageRate !== undefined) {
      dmg = applyDamageRate(dmg, this.enemy.physicalDamageRate);
    }

    if (this.enemy && this.enemy.id === 'black_dragon' && this.player.equipment.weapon !== 'corrada') {
      dmg = applyDamageRate(dmg, 0.2);
    }

    sound.playAttack();

    if (isCrit) {
      this.enemyFlashTimer = 28;
      this.effects.shake(14);
      this.effects.createSparks(this.enemyCenter.x, this.enemyCenter.y, '#ffd32a', 24);
      this.effects.addPopup(dmg, this.enemyPopupPos.x, this.enemyPopupPos.y, '#ffffff', '#ff1744', true, 'bounce');
      this.queueMessages([
        logFormatter.format('battle_log.hero_attack'),
        logFormatter.format('battle_log.critical_hit'),
        logFormatter.format('battle_log.heavy_damage_dealt', { name: this.enemy.name, dmg: String(dmg) })
      ], () => {
        this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
        onFinish();
      });
    } else {
      this.enemyFlashTimer = 16;
      this.effects.createSparks(this.enemyCenter.x, this.enemyCenter.y, '#ffffff', 14);
      this.effects.addPopup(dmg, this.enemyPopupPos.x, this.enemyPopupPos.y, '#ffffff', '#e74c3c', false, 'bounce');
      this.queueMessages([
        logFormatter.format('battle_log.hero_attack'),
        logFormatter.format('battle_log.damage_dealt', { name: this.enemy.name, dmg: String(dmg) })
      ], () => {
        this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
        onFinish();
      });
    }
  }

  enemyAttack(onFinish) {
    if (this.enemy.sleepTurns > 0) {
      this.enemy.sleepTurns--;
      this.effects.screenShakeTimer = 0;
      if (this.enemy.sleepTurns <= 0) {
        this.enemy.sleepTurns = 0;
        this.queueMessages([logFormatter.format('battle_log.enemy_awake', { name: this.enemy.name })], () => {
          onFinish();
        });
      } else {
        this.queueMessages([logFormatter.format('battle_log.enemy_sleep', { name: this.enemy.name })], () => {
          onFinish();
        });
      }
      return;
    }

    let castSpell = null;
    if (this.enemy.spells && this.enemy.spells.length > 0) {
      for (const sp of this.enemy.spells) {
        if (checkChance(sp.chance)) {
          castSpell = sp;
          break;
        }
      }
    }

    if (castSpell) {
      if (castSpell.isBreath) {
        sound.playAttack();

        const hasWaterShield = this.player.equipment.shield === 'water_shield';
        const hasFireCharm = (this.player.inventory.fire_charm || 0) > 0;

        let mult = 1.0;
        if (hasWaterShield && hasFireCharm) {
          mult = 0.10;
        } else if (hasWaterShield) {
          mult = 0.40;
        } else if (hasFireCharm) {
          mult = 0.50;
        }

        const rawBase = Number.isFinite(castSpell.baseDmg) ? castSpell.baseDmg : 160;
        const dmg = calcBreathDamage(rawBase, mult);

        this.effects.shake(26);
        this.effects.createPlayerDamageEffect(this.playerCenter.x, this.playerCenter.y, true);
        this.effects.addPopup(dmg, this.playerPopupPos.x, this.playerPopupPos.y, '#ffffff', '#e84118', true, 'shake');

        const messages = [
          logFormatter.format('battle_log.breath_attack', { name: this.enemy.name, spell: castSpell.name }),
          logFormatter.format('battle_log.hero_damage_heavy', { dmg: String(dmg) })
        ];

        if (hasWaterShield && hasFireCharm) {
          messages.push(logFormatter.format('battle_log.breath_defended_both'));
        } else if (hasWaterShield) {
          messages.push(logFormatter.format('battle_log.breath_defended_shield'));
        } else if (hasFireCharm) {
          messages.push(logFormatter.format('battle_log.breath_defended_charm'));
        } else {
          messages.push(logFormatter.format('battle_log.breath_no_defense'));
        }

        this.player.damage(dmg);
        this.queueMessages(messages, () => { onFinish(); });
        return;
      }

      if (castSpell.isSpecialPhysical) {
        sound.playAttack();

        const hasDragonArmor = this.player.equipment.armor === 'dragon_armor';
        const rawBase = Number.isFinite(castSpell.baseDmg) ? castSpell.baseDmg : 240;
        const mult = hasDragonArmor ? 0.22 : 1.0;
        const dmg = calcSpecialPhysicalDamage(rawBase, mult);

        this.effects.shake(30);
        this.effects.createPlayerDamageEffect(this.playerCenter.x, this.playerCenter.y, true);
        this.effects.addPopup(dmg, this.playerPopupPos.x, this.playerPopupPos.y, '#ffffff', '#c0392b', true, 'shake');

        const messages = [
          logFormatter.format('battle_log.enemy_special_phys', { name: this.enemy.name, spell: castSpell.name }),
          logFormatter.format('battle_log.dragon_claw_hit'),
          logFormatter.format('battle_log.hero_damage_heavy', { dmg: String(dmg) })
        ];

        if (hasDragonArmor) {
          messages.push(logFormatter.format('battle_log.dragon_armor_defend'));
        } else {
          messages.push(logFormatter.format('battle_log.dragon_armor_penetrated'));
        }

        this.player.damage(dmg);
        this.queueMessages(messages, () => { onFinish(); });
        return;
      }

      const messages = [logFormatter.format('battle_log.enemy_cast', { name: this.enemy.name, spell: castSpell.name })];
      if (this.enemy.spellSealed) {
        messages.push(logFormatter.format('battle_log.enemy_spell_sealed'));
        this.queueMessages(messages, () => { onFinish(); });
        return;
      }

      sound.playMagic();

      if (castSpell.id === 'rariho') {
        if (this.playerSleepTurns > 0) {
          messages.push(logFormatter.format('battle_log.already_asleep'));
        } else {
          if (checkChance(0.7)) {
            this.playerSleepTurns = calcStatusTurns(2, 4);
            this.effects.addPopup('SLEEP', this.playerPopupPos.x, this.playerPopupPos.y, '#a29bfe', '#6c5ce7', false, 'bounce');
            messages.push(logFormatter.format('battle_log.hero_fell_asleep'));
          } else {
            messages.push(logFormatter.format('battle_log.spell_no_effect_hero'));
          }
        }
        this.queueMessages(messages, () => { onFinish(); });
        return;
      }

      if (castSpell.id === 'mahoton') {
        if (this.playerSpellSealed) {
          messages.push(logFormatter.format('battle_log.already_sealed'));
        } else {
          if (checkChance(0.7)) {
            this.playerSpellSealed = true;
            this.effects.addPopup('SEAL', this.playerPopupPos.x, this.playerPopupPos.y, '#00d2d3', '#0984e3', false, 'bounce');
            messages.push(logFormatter.format('battle_log.hero_spell_sealed'));
          } else {
            messages.push(logFormatter.format('battle_log.spell_no_effect_hero'));
          }
        }
        this.queueMessages(messages, () => { onFinish(); });
        return;
      }

      const minD = Number.isFinite(castSpell.minDmg) ? castSpell.minDmg : (Number.isFinite(castSpell.baseDmg) ? Math.floor(castSpell.baseDmg * 0.8) : 10);
      const maxD = Number.isFinite(castSpell.maxDmg) ? castSpell.maxDmg : (Number.isFinite(castSpell.baseDmg) ? Math.ceil(castSpell.baseDmg * 1.2) : 20);
      let dmg = calcSpellDamage(Math.min(minD, maxD), Math.max(minD, maxD));

      if ((this.player.inventory.fire_charm || 0) > 0 && ['mera', 'merami', 'gira', 'begirama'].includes(castSpell.id)) {
        dmg = applyDamageReduction(dmg, 5);
      }

      this.effects.shake(18);
      this.effects.createPlayerDamageEffect(this.playerCenter.x, this.playerCenter.y, false);
      this.effects.addPopup(dmg, this.playerPopupPos.x, this.playerPopupPos.y, '#ffffff', '#e74c3c', true, 'shake');
      messages.push(logFormatter.format('battle_log.hero_damage', { dmg: String(dmg) }));
      this.player.damage(dmg);

      this.queueMessages(messages, () => { onFinish(); });
      return;
    }

    const critRate = this.enemy.criticalChance !== undefined ? this.enemy.criticalChance : 0.05;
    const isCrit = checkChance(critRate);

    const normalDmg = this.calcDamage(this.enemy.atk, this.player.def);
    const dmg = isCrit ? calcEnemyCriticalDamage(normalDmg) : normalDmg;

    sound.playAttack();

    const messages = [logFormatter.format('battle_log.enemy_attack', { name: this.enemy.name })];

    if (isCrit) {
      this.effects.shake(28);
      this.effects.createPlayerDamageEffect(this.playerCenter.x, this.playerCenter.y, true);
      this.effects.addPopup(dmg, this.playerPopupPos.x, this.playerPopupPos.y, '#ffffff', '#e84118', true, 'shake');
      messages.push(logFormatter.format('battle_log.enemy_critical'));
      messages.push(logFormatter.format('battle_log.hero_damage_heavy', { dmg: String(dmg) }));
    } else {
      this.effects.shake(18);
      this.effects.createPlayerDamageEffect(this.playerCenter.x, this.playerCenter.y, false);
      this.effects.addPopup(dmg, this.playerPopupPos.x, this.playerPopupPos.y, '#ffffff', '#8854d0', true, 'shake');
      messages.push(logFormatter.format('battle_log.hero_damage', { dmg: String(dmg) }));
    }

    this.player.damage(dmg);

    if (this.enemy.poisonChance && !this.player.isPoisoned && this.player.hp > 0) {
      const hasCharm = (this.player.inventory.poison_charm || 0) > 0;
      if (checkChance(this.enemy.poisonChance)) {
        if (hasCharm && checkChance(0.8)) {
          messages.push(logFormatter.format('battle_log.poison_defended'));
        } else {
          this.player.isPoisoned = true;
          messages.push(logFormatter.format('battle_log.hero_poisoned'));
        }
      }
    }

    this.queueMessages(messages, () => { onFinish(); });
  }

  runEscape() {
    const isNoEscape = Boolean(this.enemy.dropItem || this.enemy.noEscape);
    const success = checkEscape(isNoEscape);
    this.stateMachine.resolveEscape(success);
    if (success) {
      sound.playEscape();
      this.queueMessages([logFormatter.format('battle_log.hero_escape')], () => {
        this.stateMachine.endBattle();
        this.onEnd({ result: 'ESCAPE' });
      });
    } else {
      this.queueMessages([logFormatter.format('battle_log.hero_escape'), logFormatter.format('battle_log.escape_failed')], () => {
        this.runEnemyTurn();
      });
    }
  }

  victory() {
    sound.stopBgm();
    this.stateMachine.startVictoryPending();

    if (this.enemy.id === 'black_dragon') {
      this.stateMachine.resolveVictory({ needsDiscard: false });
      this.onEnd({ result: 'DRAGON_VICTORY' });
      return;
    }

    sound.playVictory();

    const reward = RewardCalculator.calculateRewardSummary({
      playerLevel: this.player.level,
      enemy: this.enemy,
      items: this.player.inventory,
      equipment: this.player.equipment,
      itemDb: ITEM_DB,
      isInventoryFull: this.player.isInventoryFull(1)
    });

    const initialMessages = [
      logFormatter.format('battle_log.enemy_defeated', { name: this.enemy.name }),
      logFormatter.format('battle_log.exp_gold_gain', { exp: String(reward.exp), gold: String(reward.gold) })
    ];

    this.queueMessages(initialMessages, () => {
      this.player.addGold(reward.gold);
      const levelUpMessages = this.player.addExp(reward.exp);

      const afterMessages = [];

      if (levelUpMessages.length > 0) {
        sound.playVictory();
        afterMessages.push(...levelUpMessages);
      }

      if (reward.status === 'DROP_OBTAINED') {
        this.stateMachine.resolveVictory({ needsDiscard: false });
        this.player.addItem(reward.dropItemId, 1);
        const itemName = ITEM_DB[reward.dropItemId]?.name || '';
        afterMessages.push(logFormatter.format('battle_log.treasure_drop', { name: this.enemy.name, item: itemName }));
        this.proceedAfterMessages(afterMessages);
      } else if (reward.status === 'DISCARD_REQUIRED') {
        this.stateMachine.resolveVictory({ needsDiscard: true });
        this.pendingDropItem = reward.dropItemId;
        afterMessages.push(logFormatter.format('battle_log.bag_full_drop', { name: this.enemy.name }));
        this.queueMessages(afterMessages, () => {
          this.discardList = reward.discardCandidates;
          this.discardIndex = 0;
          this.phase = 'DISCARD_SELECT';
        });
      } else if (reward.status === 'DROP_ABANDONED') {
        this.stateMachine.resolveVictory({ needsDiscard: false });
        const itemName = ITEM_DB[reward.dropItemId]?.name || '';
        afterMessages.push(logFormatter.format('battle_log.bag_full_drop', { name: this.enemy.name }));
        afterMessages.push(logFormatter.format('battle_log.gave_up_item', { item: itemName }));
        this.proceedAfterMessages(afterMessages);
      } else {
        // NO_DROP
        this.stateMachine.resolveVictory({ needsDiscard: false });
        this.proceedAfterMessages(afterMessages);
      }
    });
  }

  proceedAfterMessages(afterMessages) {
    if (afterMessages.length > 0) {
      this.queueMessages(afterMessages, () => {
        this.onEnd({ result: 'VICTORY' });
      });
    } else {
      this.onEnd({ result: 'VICTORY' });
    }
  }

  defeat() {
    if (this.stateMachine.state !== BattleState.DEFEAT && this.stateMachine.state !== BattleState.BATTLE_END) {
      this.stateMachine.resolveDefeat();
    }
    this.queueMessages([logFormatter.format('battle_log.hero_defeated')], () => {
      this.stateMachine.endBattle();
      this.onEnd({ result: 'DEFEAT' });
    });
  }

  handleKeyDown(key) {
    const commands = this.getCommands();

    if (this.phase === 'COMMAND_SELECT') {
      if (key === 'ArrowUp' || key === 'w' || key === 'W') {
        this.commandIndex = (this.commandIndex - 1 + commands.length) % commands.length;
        sound.playSubmit();
      } else if (key === 'ArrowDown' || key === 's' || key === 'S') {
        this.commandIndex = (this.commandIndex + 1) % commands.length;
        sound.playSubmit();
      } else if (key === ' ' || key === 'Enter') {
        sound.playSubmit();
        this.executeCommand();
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
          this.commandIndex = 0;
          this.phase = 'COMMAND_SELECT';
        } else {
          this.executeSelection(selected);
        }
      } else if (key === 'Escape' || key === 'x' || key === 'X') {
        sound.playSubmit();
        this.commandIndex = 0;
        this.phase = 'COMMAND_SELECT';
      }
    } else if (this.phase === 'DISCARD_SELECT') {
      if (key === 'ArrowUp' || key === 'w' || key === 'W') {
        this.discardIndex = (this.discardIndex - 1 + this.discardList.length) % this.discardList.length;
        sound.playCursor();
      } else if (key === 'ArrowDown' || key === 's' || key === 'S') {
        this.discardIndex = (this.discardIndex + 1) % this.discardList.length;
        sound.playCursor();
      } else if (key === ' ' || key === 'Enter') {
        const discarded = this.discardList[this.discardIndex];
        this.player.removeItem(discarded.id, 1);
        this.player.addItem(this.pendingDropItem, 1);
        const droppedName = ITEM_DB[this.pendingDropItem]?.name || '';
        sound.playChest();
        this.stateMachine.resolveDiscard();
        this.queueMessages([
          logFormatter.format('battle_log.hero_discarded_item', { discarded: discarded.name, dropped: droppedName })
        ], () => {
          this.onEnd({ result: 'VICTORY' });
        });
      } else if (key === 'Escape' || key === 'x' || key === 'X') {
        sound.playBump();
      }
    } else if (this.phase === 'MESSAGE') {
      if (key === ' ' || key === 'Enter') {
        if (!this.isTextComplete) {
          this.displayedText = this.currentText;
          this.charIndex = this.currentText.length;
          this.isTextComplete = true;
        } else {
          sound.playSubmit();
          this.nextMessage();
        }
      }
    }
  }

  update() {
    if (this.enemyFlashTimer > 0) this.enemyFlashTimer--;
    this.effects.update();

    if (this.phase === 'MESSAGE' && !this.isTextComplete) {
      this.charTimer++;
      if (this.charTimer >= this.textSpeed) {
        this.charTimer = 0;
        if (this.charIndex < this.currentText.length) {
          const char = this.currentText[this.charIndex];
          this.displayedText += char;
          this.charIndex++;
          if (char !== ' ' && char !== '\n') sound.playTextChar();
        } else {
          this.isTextComplete = true;
        }
      }
    }
  }

  draw(ctx, canvas) {
    this.cw = canvas.width;
    this.ch = canvas.height;

    const renderState = {
      enemy: this.enemy,
      enemyFlashTimer: this.enemyFlashTimer,
      isImageLoaded: this.renderer.isImageLoaded,
      enemyImage: this.renderer.enemyImage,
      charIndex: this.charIndex,
      phase: this.phase,
      commands: this.getCommands(),
      commandIndex: this.commandIndex,
      itemList: this.itemList,
      itemIndex: this.itemIndex,
      discardList: this.discardList,
      discardIndex: this.discardIndex,
      displayedText: this.displayedText,
      isTextComplete: this.isTextComplete,
      discardSelectMsg: logFormatter.format('battle_log.discard_select_msg'),
      effects: this.effects,
      isWestern: Boolean(i18n.currentLang !== 'ja')
    };

    this.renderer.render(ctx, canvas, renderState);
  }
}