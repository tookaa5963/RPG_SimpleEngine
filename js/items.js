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

export const ITEM_DB = {};
export const SPELL_DB = {};

/**
 * items/index.json と spells/index.json をフェッチし、
 * 個別のモジュール化された JSON を Promise.all で並行ロードして DB を構築する。
 */
export async function initItemData() {
    const [itemsManifestRes, spellsManifestRes] = await Promise.all([
        fetch('data/items/index.json'),
        fetch('data/spells/index.json')
    ]);

    if (!itemsManifestRes.ok) {
        throw createProtocolError('HttpError', 'items.js:initItemData', 'itemsManifestRes.status', itemsManifestRes.status);
    }
    if (!spellsManifestRes.ok) {
        throw createProtocolError('HttpError', 'items.js:initItemData', 'spellsManifestRes.status', spellsManifestRes.status);
    }

    const itemIds = await itemsManifestRes.json();
    const spellIds = await spellsManifestRes.json();

    const itemPromises = itemIds.map(id => fetch(`data/items/i_${id}.json`).then(r => {
        if (!r.ok) {
            throw createProtocolError('HttpError', 'items.js:initItemData', `item_${id}.status`, r.status);
        }
        return r.json();
    }));

    const spellPromises = spellIds.map(id => fetch(`data/spells/s_${id}.json`).then(r => {
        if (!r.ok) {
            throw createProtocolError('HttpError', 'items.js:initItemData', `spell_${id}.status`, r.status);
        }
        return r.json();
    }));

    const itemsRaw = await Promise.all(itemPromises);
    const spellsRaw = await Promise.all(spellPromises);

    for (const item of itemsRaw) {
        const itemObj = {
            ...item,
            get name() {
                return i18n.resolve(item.name);
            }
        };

        if (typeof item.description !== 'undefined') {
            Object.defineProperty(itemObj, 'description', {
                get() {
                    return i18n.resolve(item.description);
                },
                enumerable: true,
                configurable: true
            });
        }

        ITEM_DB[item.id] = itemObj;
    }

    for (const spell of spellsRaw) {
        SPELL_DB[spell.id] = {
            ...spell,
            get name() {
                return i18n.resolve(spell.name);
            }
        };
    }

    console.log("ITEM_DB and SPELL_DB initialized successfully from module JSONs.");
}
