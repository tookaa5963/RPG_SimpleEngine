// FILE_ENTRY: ai_staging/js/monsters.js
import { i18n } from './i18n.js';
import { SPELL_DB } from './items.js';

export const MONSTER_DEFINITIONS = {};

/**
 * IDによるモンスター定義の取得
 * @param {string} id
 * @returns {object|null}
 */
export function getMonsterById(id) {
    return MONSTER_DEFINITIONS[id] || null;
}

/**
 * monsters/index.json をフェッチし、
 * 個別のモジュール化された JSON を Promise.all で並行ロードして初期化する。
 */
export async function initMonsterData() {
    try {
        const manifestRes = await fetch('data/monsters/index.json');
        if (!manifestRes.ok) throw new Error(`HTTP error! status: ${manifestRes.status} on monsters/index.json`);
        
        const monsterIds = await manifestRes.json();
        const monsterPromises = monsterIds.map(id => fetch(`data/monsters/m_${id}.json`).then(r => {
             if (!r.ok) throw new Error(`HTTP error! status: ${r.status} on m_${id}.json`);
             return r.json();
        }));

        const monstersRaw = await Promise.all(monsterPromises);

        for (const raw of monstersRaw) {
            const monster = {
                ...raw,
                // 新しい resolve API で多言語オブジェクトを解決 (Fail-Fast)
                get name() { return i18n.resolve(raw.name); }
            };

            if (raw.spells && Array.isArray(raw.spells)) {
                monster.spells = raw.spells.map(sp => {
                    return {
                        ...sp,
                        get name() {
                            // 1. 特技固有の多言語オブジェクトがあれば解決
                            if (sp.name) return i18n.resolve(sp.name);
                            // 2. プレイヤー呪文DBにあれば解決
                            if (SPELL_DB[sp.id]) return SPELL_DB[sp.id].name;
                            // 3. どちらでも解決できない場合はサイレントフェイルさせず例外送出 (Fail-Fast)
                            throw new Error(`[Monster: ${raw.id}] 呪文・特技名を解決できません: id="${sp.id}"`);
                        }
                    };
                });
            }

            MONSTER_DEFINITIONS[raw.id] = monster;
        }
        console.log("MONSTER_DEFINITIONS initialized successfully from module JSONs.");
    } catch (error) {
        console.error("Failed to fetch monster data:", error);
        throw error;
    }
}