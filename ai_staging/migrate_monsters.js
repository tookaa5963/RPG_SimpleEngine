const fs = require('fs');
const path = require('path');

// --- プロジェクトルートの動的判定 ---
function findProjectRoot() {
    let currentDir = __dirname;
    for (let i = 0; i < 3; i++) {
        if (fs.existsSync(path.join(currentDir, 'data')) && fs.existsSync(path.join(currentDir, 'js'))) {
            return currentDir;
        }
        currentDir = path.dirname(currentDir);
    }
    
    currentDir = process.cwd();
    for (let i = 0; i < 3; i++) {
        if (fs.existsSync(path.join(currentDir, 'data')) && fs.existsSync(path.join(currentDir, 'js'))) {
            return currentDir;
        }
        currentDir = path.dirname(currentDir);
    }
    throw new Error('プロジェクトのルートディレクトリ（data, jsフォルダを含む階層）が見つかりません。');
}

const PROJECT_ROOT = findProjectRoot();

// --- 設定 ---
const DATA_DIR = path.join(PROJECT_ROOT, 'data');
const JS_DIR = path.join(PROJECT_ROOT, 'js');
const OUT_DIR = path.join(PROJECT_ROOT, 'ai_staging', 'data');
const OUT_MONSTERS_DIR = path.join(OUT_DIR, 'monsters');

// --- 準備 ---
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
if (!fs.existsSync(OUT_MONSTERS_DIR)) fs.mkdirSync(OUT_MONSTERS_DIR, { recursive: true });

// --- i18n.js のパース処理 ---
function loadI18nDict() {
    const i18nPath = path.join(JS_DIR, 'i18n.js');
    if (!fs.existsSync(i18nPath)) {
        throw new Error(`i18n.js が見つかりません: ${i18nPath}`);
    }
    const content = fs.readFileSync(i18nPath, 'utf8');
    
    const match = content.match(/export\s+const\s+I18N_DICT\s*=\s*(\{[\s\S]+\});/);
    if (!match) {
        throw new Error("I18N_DICT の定義が見つかりませんでした。");
    }

    try {
        let dictStr = match[1];
        const dict = new Function('return ' + dictStr)();
        return dict;
    } catch (e) {
        throw new Error(`I18N_DICT のパースに失敗しました: ${e.message}`);
    }
}

// 敵専用特技の定義（本番 js/i18n.js が既にパージ済みである場合に備えた定義）
const ENEMY_SPELL_I18N = {
    'spells.petrifying_gaze.name': { ja: '石化の熱視線', en: 'Petrifying Gaze', es: 'Mirada petrificante' },
    'spells.bronze_wind.name': { ja: '青銅の熱風', en: 'Bronze Wind', es: 'Viento de bronce' },
    'spells.fire_breath.name': { ja: '炎の息', en: 'Flame Breath', es: 'Aliento de fuego' },
    'spells.hellfire_breath.name': { ja: '黒炎の息', en: 'Hellfire Breath', es: 'Aliento de llamas oscuras' },
    'spells.dragon_claw.name': { ja: '切り裂く爪', en: 'Rending Claw', es: 'Garra desgarradora' }
};

function getI18nText(dict, lang, keyPath) {
    if (!keyPath) return undefined;
    const keys = keyPath.split('.');
    let current = dict[lang];
    for (const key of keys) {
        if (current === undefined) break;
        current = current[key];
    }
    if (current !== undefined) return current;

    // パージ済みの場合、敵特技辞書を参照
    if (ENEMY_SPELL_I18N[keyPath] && ENEMY_SPELL_I18N[keyPath][lang]) {
        return ENEMY_SPELL_I18N[keyPath][lang];
    }
    return undefined;
}

// --- メイン処理 ---
function migrateMonsters() {
    console.log("モンスターデータの移行処理を開始します（特技多言語カプセル化対応）...");
    console.log(`プロジェクトルート: ${PROJECT_ROOT}`);
    console.log(`出力先ディレクトリ: ${OUT_MONSTERS_DIR}`);
    
    const i18nDict = loadI18nDict();
    const targetLangs = ['ja', 'en', 'es'];
    
    const monstersPath = path.join(DATA_DIR, 'monsters.json');
    if (!fs.existsSync(monstersPath)) throw new Error(`monsters.json が見つかりません: ${monstersPath}`);
    const monstersData = JSON.parse(fs.readFileSync(monstersPath, 'utf8'));
    
    const monsterIds = [];
    for (const [id, monster] of Object.entries(monstersData)) {
        monsterIds.push(id);
        const newMonster = { ...monster };
        
        // モンスター名称の多言語カプセル化
        if (monster.nameKey) {
            newMonster.name = {};
            for (const lang of targetLangs) {
                const nameText = getI18nText(i18nDict, lang, monster.nameKey);
                if (nameText === undefined) {
                    throw new Error(`モンスター名テキストが見つかりません。 言語: ${lang}, キー: ${monster.nameKey}`);
                }
                newMonster.name[lang] = nameText;
            }
            delete newMonster.nameKey;
        }

        // モンスター特技・呪文（spells）の多言語カプセル化
        if (newMonster.spells && Array.isArray(newMonster.spells)) {
            newMonster.spells = newMonster.spells.map(sp => {
                const newSp = { ...sp };
                if (newSp.nameKey) {
                    newSp.name = {};
                    for (const lang of targetLangs) {
                        const spellNameText = getI18nText(i18nDict, lang, newSp.nameKey);
                        if (spellNameText === undefined) {
                            throw new Error(`モンスター特技名テキストが見つかりません。 モンスター: ${id}, 言語: ${lang}, キー: ${newSp.nameKey}`);
                        }
                        newSp.name[lang] = spellNameText;
                    }
                    delete newSp.nameKey;
                }
                return newSp;
            });
        }
        
        const outPath = path.join(OUT_MONSTERS_DIR, `m_${id}.json`);
        fs.writeFileSync(outPath, JSON.stringify(newMonster, null, 2), 'utf8');
    }
    
    // マニフェスト出力
    fs.writeFileSync(path.join(OUT_MONSTERS_DIR, 'index.json'), JSON.stringify(monsterIds, null, 2), 'utf8');
    console.log(`モンスターの移行完了: ${monsterIds.length}件`);
    console.log("フェーズ4-A (ステップ1-B) のデータ再生成が完了しました。");
}

try {
    migrateMonsters();
} catch(e) {
    console.error("移行スクリプト実行中にエラーが発生しました:", e);
    process.exit(1);
}