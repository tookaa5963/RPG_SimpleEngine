// FILE_ENTRY: ai_staging/js/items.js
import { i18n } from './i18n.js';

export const ITEM_DB = {};
export const SPELL_DB = {};

/**
 * items/index.json と spells/index.json をフェッチし、
 * 個別のモジュール化された JSON を Promise.all で並行ロードして DB を構築する。
 */
export async function initItemData() {
    try {
        const [itemsManifestRes, spellsManifestRes] = await Promise.all([
            fetch('data/items/index.json'),
            fetch('data/spells/index.json')
        ]);

        if (!itemsManifestRes.ok) throw new Error(`HTTP error! status: ${itemsManifestRes.status} on items/index.json`);
        if (!spellsManifestRes.ok) throw new Error(`HTTP error! status: ${spellsManifestRes.status} on spells/index.json`);

        const itemIds = await itemsManifestRes.json();
        const spellIds = await spellsManifestRes.json();

        const itemPromises = itemIds.map(id => fetch(`data/items/i_${id}.json`).then(r => {
             if (!r.ok) throw new Error(`HTTP error! status: ${r.status} on i_${id}.json`);
             return r.json();
        }));
        
        const spellPromises = spellIds.map(id => fetch(`data/spells/s_${id}.json`).then(r => {
             if (!r.ok) throw new Error(`HTTP error! status: ${r.status} on s_${id}.json`);
             return r.json();
        }));

        const itemsRaw = await Promise.all(itemPromises);
        const spellsRaw = await Promise.all(spellPromises);

        for (const item of itemsRaw) {
            ITEM_DB[item.id] = {
                ...item,
                // 新しい resolve API で多言語オブジェクトを解決 (Fail-Fast)
                get name() { return i18n.resolve(item.name); },
                ...(item.description ? { get description() { return i18n.resolve(item.description); } } : {})
            };
        }

        for (const spell of spellsRaw) {
            SPELL_DB[spell.id] = {
                ...spell,
                get name() { return i18n.resolve(spell.name); }
            };
        }

        console.log("ITEM_DB and SPELL_DB initialized successfully from module JSONs.");
    } catch (error) {
        console.error("Failed to fetch item/spell data:", error);
        throw error; 
    }
}