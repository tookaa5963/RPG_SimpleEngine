// FILE_ENTRY: js/battleActions.js
import { logFormatter } from './logFormatter.js';
import { sound } from './sound.js';
import { ITEM_DB, SPELL_DB } from './items.js';
import { i18n } from './i18n.js';

export function executeBattleAction(bm, selected) {
  if (selected.type === 'item') {
    executeItemAction(bm, selected.id);
  } else if (selected.type === 'magic') {
    executeMagicAction(bm, selected);
  }
}

function executeItemAction(bm, itemId) {
  const player = bm.player;
  const itemName = ITEM_DB[itemId]?.name || '';

  if (itemId === 'herb') {
    player.removeItem('herb', 1);
    player.heal(30);
    sound.playHeal();
    bm.queueMessages([i18n.t('battle_action.used_herb', { item: itemName })], () => { bm.runEnemyTurn(); });
  } else if (itemId === 'strong_herb') {
    player.removeItem('strong_herb', 1);
    player.heal(70);
    sound.playHeal();
    bm.queueMessages([i18n.t('battle_action.used_strong_herb', { item: itemName })], () => { bm.runEnemyTurn(); });
  } else if (itemId === 'special_herb') {
    player.removeItem('special_herb', 1);
    player.heal(120);
    sound.playHeal();
    bm.queueMessages([i18n.t('battle_action.used_strong_herb', { item: itemName })], () => { bm.runEnemyTurn(); });
  } else if (itemId === 'magic_water') {
    player.removeItem('magic_water', 1);
    player.healMp(15);
    sound.playHeal();
    bm.queueMessages([i18n.t('battle_action.drank_magic_water', { item: itemName, mp: '15' })], () => { bm.runEnemyTurn(); });
  } else if (itemId === 'sage_water') {
    player.removeItem('sage_water', 1);
    player.healMp(40);
    sound.playHeal();
    bm.queueMessages([i18n.t('battle_action.drank_magic_water', { item: itemName, mp: '40' })], () => { bm.runEnemyTurn(); });
  } else if (itemId === 'antidote') {
    player.removeItem('antidote', 1);
    sound.playHeal();
    if (player.isPoisoned) {
      player.curePoison();
      bm.queueMessages([i18n.t('battle_action.cured_poison')], () => { bm.runEnemyTurn(); });
    } else {
      bm.queueMessages([i18n.t('battle_action.not_poisoned')], () => { bm.runEnemyTurn(); });
    }
  }
}

function executeMagicAction(bm, spell) {
  const player = bm.player;
  const enemy = bm.enemy;

  if (!player.consumeMp(spell.cost)) {
    bm.queueMessages([i18n.t('menu.mp_shortage')], () => {
      bm.commandIndex = 0;
      bm.phase = 'COMMAND_SELECT';
    });
    return;
  }
  sound.playMagic();

  const spellName = SPELL_DB[spell.id]?.name || spell.name;
  const castMsg = i18n.t('battle_action.cast_spell', { spell: spellName });

  if (spell.id === 'hoimi') {
    const healAmount = Math.floor(Math.random() * 8) + 25;
    player.heal(healAmount);
    sound.playHeal();
    bm.queueMessages([castMsg, i18n.t('battle_action.healed')], () => { bm.runEnemyTurn(); });
  } else if (spell.id === 'behoimi') {
    const healAmount = Math.floor(Math.random() * 16) + 75;
    player.heal(healAmount);
    sound.playHeal();
    bm.queueMessages([castMsg, i18n.t('battle_action.greatly_healed')], () => { bm.runEnemyTurn(); });
  } else if (spell.id === 'behoma') {
    player.heal(player.maxHp);
    sound.playHeal();
    bm.queueMessages([castMsg, i18n.t('battle_action.fully_healed')], () => { bm.runEnemyTurn(); });
  } else if (spell.id === 'mera') {
    let magicDmg = Math.floor(Math.random() * 5) + 10;
    if (enemy && enemy.id === 'black_dragon') {
      magicDmg = Math.max(1, Math.floor(magicDmg * 0.2));
    }
    bm.effects.createSparks(bm.enemyCenter.x, bm.enemyCenter.y, '#ff3838', 14);
    bm.effects.addPopup(magicDmg, bm.enemyPopupPos.x, bm.enemyPopupPos.y, '#ffffff', '#e74c3c', false, 'bounce');
    bm.queueMessages([castMsg, logFormatter.format('battle_log.damage_dealt', { name: enemy.name, dmg: String(magicDmg) })], () => {
      enemy.hp = Math.max(0, enemy.hp - magicDmg);
      bm.enemyFlashTimer = 16;
      if (enemy.hp <= 0) bm.victory();
      else bm.runEnemyTurn();
    });
  } else if (spell.id === 'merami') {
    let magicDmg = Math.floor(Math.random() * 21) + 70;
    if (enemy && enemy.id === 'black_dragon') {
      magicDmg = Math.max(1, Math.floor(magicDmg * 0.2));
    }
    bm.effects.createSparks(bm.enemyCenter.x, bm.enemyCenter.y, '#ff1744', 24);
    bm.effects.addPopup(magicDmg, bm.enemyPopupPos.x, bm.enemyPopupPos.y, '#ffffff', '#c0392b', true, 'bounce');
    bm.queueMessages([castMsg, logFormatter.format('battle_log.heavy_damage_dealt', { name: enemy.name, dmg: String(magicDmg) })], () => {
      enemy.hp = Math.max(0, enemy.hp - magicDmg);
      bm.enemyFlashTimer = 20;
      bm.effects.shake(10);
      if (enemy.hp <= 0) bm.victory();
      else bm.runEnemyTurn();
    });
  } else if (spell.id === 'gira') {
    let magicDmg = Math.floor(Math.random() * 9) + 20;
    if (enemy && enemy.id === 'black_dragon') {
      magicDmg = Math.max(1, Math.floor(magicDmg * 0.2));
    }
    bm.effects.createSparks(bm.enemyCenter.x, bm.enemyCenter.y, '#00d2d3', 16);
    bm.effects.addPopup(magicDmg, bm.enemyPopupPos.x, bm.enemyPopupPos.y, '#ffffff', '#e74c3c', false, 'bounce');
    bm.queueMessages([castMsg, logFormatter.format('battle_log.damage_dealt', { name: enemy.name, dmg: String(magicDmg) })], () => {
      enemy.hp = Math.max(0, enemy.hp - magicDmg);
      bm.enemyFlashTimer = 16;
      if (enemy.hp <= 0) bm.victory();
      else bm.runEnemyTurn();
    });
  } else if (spell.id === 'begirama') {
    let magicDmg = Math.floor(Math.random() * 16) + 50;
    if (enemy && enemy.id === 'black_dragon') {
      magicDmg = Math.max(1, Math.floor(magicDmg * 0.2));
    }
    bm.effects.createSparks(bm.enemyCenter.x, bm.enemyCenter.y, '#54a0ff', 24);
    bm.effects.addPopup(magicDmg, bm.enemyPopupPos.x, bm.enemyPopupPos.y, '#ffffff', '#c0392b', true, 'bounce');
    bm.queueMessages([castMsg, logFormatter.format('battle_log.heavy_damage_dealt', { name: enemy.name, dmg: String(magicDmg) })], () => {
      enemy.hp = Math.max(0, enemy.hp - magicDmg);
      bm.enemyFlashTimer = 24;
      bm.effects.shake(12);
      if (enemy.hp <= 0) bm.victory();
      else bm.runEnemyTurn();
    });
  } else if (spell.id === 'rariho') {
    const messages = [castMsg];
    if (enemy.sleepTurns > 0) {
      messages.push(i18n.t('battle_action.enemy_already_asleep', { name: enemy.name }));
    } else {
      const successChance = enemy.sleepResist !== undefined ? (1 - enemy.sleepResist) : 0.75;
      if (Math.random() < successChance) {
        enemy.sleepTurns = Math.floor(Math.random() * 3) + 2;
        bm.effects.addPopup('SLEEP', bm.enemyPopupPos.x, bm.enemyPopupPos.y, '#a29bfe', '#6c5ce7', false, 'bounce');
        messages.push(i18n.t('battle_action.enemy_asleep', { name: enemy.name }));
      } else {
        messages.push(i18n.t('battle_action.spell_no_effect'));
      }
    }
    bm.queueMessages(messages, () => {
      bm.runEnemyTurn();
    });
  } else if (spell.id === 'mahoton') {
    const messages = [castMsg];
    if (enemy.spellSealed) {
      messages.push(i18n.t('battle_action.enemy_already_sealed'));
    } else {
      const successChance = enemy.sealResist !== undefined ? (1 - enemy.sealResist) : 0.75;
      if (Math.random() < successChance) {
        enemy.spellSealed = true;
        bm.effects.addPopup('SEAL', bm.enemyPopupPos.x, bm.enemyPopupPos.y, '#00d2d3', '#0984e3', false, 'bounce');
        messages.push(i18n.t('battle_action.enemy_spell_sealed', { name: enemy.name }));
      } else {
        messages.push(i18n.t('battle_action.spell_no_effect'));
      }
    }
    bm.queueMessages(messages, () => {
      bm.runEnemyTurn();
    });
  } else if (spell.id === 'kiari') {
    if (player.isPoisoned) {
      player.curePoison();
      sound.playHeal();
      bm.queueMessages([castMsg, logFormatter.format('menu_action.antidote_2')], () => { bm.runEnemyTurn(); });
    } else {
      bm.queueMessages([castMsg, logFormatter.format('menu_action.antidote_not_poisoned')], () => { bm.runEnemyTurn(); });
    }
  }
}