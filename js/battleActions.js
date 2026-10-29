// FILE_ENTRY: js/battleActions.js
import { logFormatter } from './logFormatter.js';
import { audioService } from './audioService.js';
import { ITEM_DB, SPELL_DB } from './items.js';
import { i18n } from './i18n.js';
import { EffectResolver } from './engine/effects/EffectResolver.js';

const effectResolver = new EffectResolver();

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

export function executeBattleAction(bm, selected) {
    if (typeof bm !== 'object') {
        throw createProtocolError('TypeError', 'battleActions.js:executeBattleAction', 'bm', bm);
    }
    if (bm === null) {
        throw createProtocolError('NullError', 'battleActions.js:executeBattleAction', 'bm', bm);
    }
    if (typeof selected !== 'object') {
        throw createProtocolError('TypeError', 'battleActions.js:executeBattleAction', 'selected', selected);
    }
    if (selected === null) {
        throw createProtocolError('NullError', 'battleActions.js:executeBattleAction', 'selected', selected);
    }
    if (typeof selected.type !== 'string') {
        throw createProtocolError('TypeError', 'battleActions.js:executeBattleAction', 'selected.type', selected.type);
    }

    if (selected.type === 'item') {
        executeItemAction(bm, selected.id);
        return;
    }
    if (selected.type === 'magic') {
        executeMagicAction(bm, selected);
        return;
    }

    throw createProtocolError('NotFoundError', 'battleActions.js:executeBattleAction', 'selected.type', selected.type);
}

function executeItemAction(bm, itemId) {
    if (typeof itemId !== 'string') {
        throw createProtocolError('TypeError', 'battleActions.js:executeItemAction', 'itemId', itemId);
    }
    if (itemId.trim() === '') {
        throw createProtocolError('EmptyStringError', 'battleActions.js:executeItemAction', 'itemId', itemId);
    }

    const player = bm.player;
    const itemDef = ITEM_DB[itemId];
    if (typeof itemDef !== 'object') {
        throw createProtocolError('TypeError', 'battleActions.js:executeItemAction', 'itemDef', itemDef);
    }
    if (itemDef === null) {
        throw createProtocolError('NullError', 'battleActions.js:executeItemAction', 'itemDef', itemDef);
    }
    if (typeof itemDef.name !== 'string') {
        throw createProtocolError('TypeError', 'battleActions.js:executeItemAction', 'itemDef.name', itemDef.name);
    }
    const itemName = itemDef.name;

    const effectDef = itemDef.effect;
    if (typeof effectDef === 'object' && effectDef !== null) {
        player.removeItem(itemId, 1);
        const result = effectResolver.resolve(effectDef, player, player);

        if (result.strategy === 'heal_hp') {
            player.heal(result.effectiveAmount);
            audioService.playSe('heal');
            let msgKey = 'battle_action.used_herb';
            if (itemId === 'strong_herb' || itemId === 'special_herb') {
                msgKey = 'battle_action.used_strong_herb';
            }
            bm.queueMessages([i18n.t(msgKey, { item: itemName })], () => {
                bm.runEnemyTurn();
            });
            return;
        }

        if (result.strategy === 'heal_mp') {
            player.healMp(result.effectiveAmount);
            audioService.playSe('heal');
            bm.queueMessages([i18n.t('battle_action.drank_magic_water', { item: itemName, mp: String(result.effectiveAmount) })], () => {
                bm.runEnemyTurn();
            });
            return;
        }

        if (result.strategy === 'cure_status') {
            audioService.playSe('heal');
            if (result.cured) {
                player.curePoison();
                bm.queueMessages([i18n.t('battle_action.cured_poison')], () => {
                    bm.runEnemyTurn();
                });
            } else {
                bm.queueMessages([i18n.t('battle_action.not_poisoned')], () => {
                    bm.runEnemyTurn();
                });
            }
            return;
        }
    }

    throw createProtocolError('NotFoundError', 'battleActions.js:executeItemAction', 'itemId', itemId);
}

function executeMagicAction(bm, spell) {
    if (typeof spell !== 'object') {
        throw createProtocolError('TypeError', 'battleActions.js:executeMagicAction', 'spell', spell);
    }
    if (spell === null) {
        throw createProtocolError('NullError', 'battleActions.js:executeMagicAction', 'spell', spell);
    }
    if (typeof spell.id !== 'string') {
        throw createProtocolError('TypeError', 'battleActions.js:executeMagicAction', 'spell.id', spell.id);
    }
    if (spell.id.trim() === '') {
        throw createProtocolError('EmptyStringError', 'battleActions.js:executeMagicAction', 'spell.id', spell.id);
    }
    if (typeof spell.cost !== 'number') {
        throw createProtocolError('TypeError', 'battleActions.js:executeMagicAction', 'spell.cost', spell.cost);
    }

    const player = bm.player;
    const enemy = bm.enemy;

    if (!player.consumeMp(spell.cost)) {
        bm.queueMessages([i18n.t('menu.mp_shortage')], () => {
            bm.commandIndex = 0;
            bm.phase = 'COMMAND_SELECT';
        });
        return;
    }
    audioService.playSe('magic');

    let spellName = '';
    const spellDef = SPELL_DB[spell.id];
    if (typeof spellDef === 'object') {
        if (spellDef !== null) {
            if (typeof spellDef.name === 'string') {
                spellName = spellDef.name;
            }
        }
    }
    if (spellName === '') {
        if (typeof spell.name === 'string') {
            if (spell.name.trim() !== '') {
                spellName = spell.name;
            }
        }
    }
    if (spellName === '') {
        throw createProtocolError('NotFoundError', 'battleActions.js:executeMagicAction', 'spellName', spell);
    }

    const castMsg = i18n.t('battle_action.cast_spell', { spell: spellName });

    let effectDef = null;
    if (typeof spellDef === 'object' && spellDef !== null && spellDef.effect) {
        effectDef = spellDef.effect;
    } else if (typeof spell.effect === 'object' && spell.effect !== null) {
        effectDef = spell.effect;
    }

    if (effectDef !== null && typeof effectDef === 'object') {
        if (effectDef.type === 'heal_hp') {
            const result = effectResolver.resolve(effectDef, player, player);
            player.heal(result.effectiveAmount);
            audioService.playSe('heal');

            let healMsgKey = 'battle_action.healed';
            if (spell.id === 'behoimi') {
                healMsgKey = 'battle_action.greatly_healed';
            } else if (spell.id === 'behoma') {
                healMsgKey = 'battle_action.fully_healed';
            }

            bm.queueMessages([castMsg, i18n.t(healMsgKey)], () => {
                bm.runEnemyTurn();
            });
            return;
        }

        if (effectDef.type === 'cure_status') {
            const result = effectResolver.resolve(effectDef, player, player);
            if (result.cured) {
                player.curePoison();
                audioService.playSe('heal');
                bm.queueMessages([castMsg, logFormatter.format('menu_action.antidote_2')], () => {
                    bm.runEnemyTurn();
                });
            } else {
                bm.queueMessages([castMsg, logFormatter.format('menu_action.antidote_not_poisoned')], () => {
                    bm.runEnemyTurn();
                });
            }
            return;
        }
    }

    if (spell.id === 'mera') {
        let magicDmg = Math.floor(Math.random() * 5) + 10;
        if (enemy) {
            if (enemy.id === 'black_dragon') {
                magicDmg = Math.max(1, Math.floor(magicDmg * 0.2));
            }
        }
        bm.effects.createSparks(bm.enemyCenter.x, bm.enemyCenter.y, '#ff3838', 14);
        bm.effects.addPopup(magicDmg, bm.enemyPopupPos.x, bm.enemyPopupPos.y, '#ffffff', '#e74c3c', false, 'bounce');
        bm.queueMessages([castMsg, logFormatter.format('battle_log.damage_dealt', { name: enemy.name, dmg: String(magicDmg) })], () => {
            enemy.hp = Math.max(0, enemy.hp - magicDmg);
            bm.enemyFlashTimer = 16;
            if (enemy.hp <= 0) {
                bm.victory();
            } else {
                bm.runEnemyTurn();
            }
        });
        return;
    }
    if (spell.id === 'merami') {
        let magicDmg = Math.floor(Math.random() * 21) + 70;
        if (enemy) {
            if (enemy.id === 'black_dragon') {
                magicDmg = Math.max(1, Math.floor(magicDmg * 0.2));
            }
        }
        bm.effects.createSparks(bm.enemyCenter.x, bm.enemyCenter.y, '#ff1744', 24);
        bm.effects.addPopup(magicDmg, bm.enemyPopupPos.x, bm.enemyPopupPos.y, '#ffffff', '#c0392b', true, 'bounce');
        bm.queueMessages([castMsg, logFormatter.format('battle_log.heavy_damage_dealt', { name: enemy.name, dmg: String(magicDmg) })], () => {
            enemy.hp = Math.max(0, enemy.hp - magicDmg);
            bm.enemyFlashTimer = 20;
            bm.effects.shake(10);
            if (enemy.hp <= 0) {
                bm.victory();
            } else {
                bm.runEnemyTurn();
            }
        });
        return;
    }
    if (spell.id === 'gira') {
        let magicDmg = Math.floor(Math.random() * 9) + 20;
        if (enemy) {
            if (enemy.id === 'black_dragon') {
                magicDmg = Math.max(1, Math.floor(magicDmg * 0.2));
            }
        }
        bm.effects.createSparks(bm.enemyCenter.x, bm.enemyCenter.y, '#00d2d3', 16);
        bm.effects.addPopup(magicDmg, bm.enemyPopupPos.x, bm.enemyPopupPos.y, '#ffffff', '#e74c3c', false, 'bounce');
        bm.queueMessages([castMsg, logFormatter.format('battle_log.damage_dealt', { name: enemy.name, dmg: String(magicDmg) })], () => {
            enemy.hp = Math.max(0, enemy.hp - magicDmg);
            bm.enemyFlashTimer = 16;
            if (enemy.hp <= 0) {
                bm.victory();
            } else {
                bm.runEnemyTurn();
            }
        });
        return;
    }
    if (spell.id === 'begirama') {
        let magicDmg = Math.floor(Math.random() * 16) + 50;
        if (enemy) {
            if (enemy.id === 'black_dragon') {
                magicDmg = Math.max(1, Math.floor(magicDmg * 0.2));
            }
        }
        bm.effects.createSparks(bm.enemyCenter.x, bm.enemyCenter.y, '#54a0ff', 24);
        bm.effects.addPopup(magicDmg, bm.enemyPopupPos.x, bm.enemyPopupPos.y, '#ffffff', '#c0392b', true, 'bounce');
        bm.queueMessages([castMsg, logFormatter.format('battle_log.heavy_damage_dealt', { name: enemy.name, dmg: String(magicDmg) })], () => {
            enemy.hp = Math.max(0, enemy.hp - magicDmg);
            bm.enemyFlashTimer = 24;
            bm.effects.shake(12);
            if (enemy.hp <= 0) {
                bm.victory();
            } else {
                bm.runEnemyTurn();
            }
        });
        return;
    }
    if (spell.id === 'rariho') {
        const messages = [castMsg];
        if (enemy.sleepTurns > 0) {
            messages.push(i18n.t('battle_action.enemy_already_asleep', { name: enemy.name }));
        } else {
            let successChance = 0.75;
            if (enemy.sleepResist !== undefined) {
                successChance = 1 - enemy.sleepResist;
            }
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
        return;
    }
    if (spell.id === 'mahoton') {
        const messages = [castMsg];
        if (enemy.spellSealed) {
            messages.push(i18n.t('battle_action.enemy_already_sealed'));
        } else {
            let successChance = 0.75;
            if (enemy.sealResist !== undefined) {
                successChance = 1 - enemy.sealResist;
            }
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
        return;
    }

    throw createProtocolError('NotFoundError', 'battleActions.js:executeMagicAction', 'spell.id', spell.id);
}