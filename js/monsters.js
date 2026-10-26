import { i18n } from './i18n.js';
import { SPELL_DB } from './items.js';

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

export const MONSTER_DEFINITIONS = {};

/**
 * IDによるモンスター定義の取得
 * @param {string} id
 * @returns {object|null}
 */
export function getMonsterById(id) {
    if (typeof id !== 'string') {
        throw createProtocolError('TypeError', 'monsters.js:getMonsterById', 'id', id);
    }
    if (id.trim() === '') {
        throw createProtocolError('EmptyStringError', 'monsters.js:getMonsterById', 'id', id);
    }

    if (typeof MONSTER_DEFINITIONS[id] !== 'undefined') {
        return MONSTER_DEFINITIONS[id];
    }
    return null;
}

/**
 * monsters/index.json をフェッチし、
 * 個別のモジュール化された JSON を Promise.all で並行ロードして初期化する。
 */
export async function initMonsterData() {
    const manifestRes = await fetch('data/monsters/index.json');
    if (!manifestRes.ok) {
        throw createProtocolError('HttpError', 'monsters.js:initMonsterData', 'manifestRes.status', manifestRes.status);
    }

    const monsterIds = await manifestRes.json();
    const monsterPromises = monsterIds.map(id => fetch(`data/monsters/m_${id}.json`).then(r => {
        if (!r.ok) {
            throw createProtocolError('HttpError', 'monsters.js:initMonsterData', `monster_${id}.status`, r.status);
        }
        return r.json();
    }));

    const monstersRaw = await Promise.all(monsterPromises);

    for (const raw of monstersRaw) {
        const monster = {
            ...raw,
            get name() {
                return i18n.resolve(raw.name);
            }
        };

        if (typeof raw.spells !== 'undefined') {
            if (Array.isArray(raw.spells)) {
                monster.spells = raw.spells.map(sp => {
                    return {
                        ...sp,
                        get name() {
                            if (typeof sp.name !== 'undefined') {
                                return i18n.resolve(sp.name);
                            }
                            if (typeof SPELL_DB[sp.id] !== 'undefined') {
                                return SPELL_DB[sp.id].name;
                            }
                            throw createProtocolError('ResolveError', 'monsters.js:initMonsterData:get name', 'spell.id', sp.id);
                        }
                    };
                });
            }
        }

        MONSTER_DEFINITIONS[raw.id] = monster;
    }

    console.log("MONSTER_DEFINITIONS initialized successfully from module JSONs.");
}
