const fs = require('fs');
const path = require('path');

// --- プロジェクトルートの動的判定 ---
// スクリプトが置かれているディレクトリ（__dirname）またはカレントディレクトリ（process.cwd()）から
// 'data' と 'js' フォルダが存在する階層を探索する
function findProjectRoot() {
    let currentDir = __dirname;
    // 最大3階層上まで探索
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
const OUT_DIR = path.join(PROJECT_ROOT, 'ai_staging', 'data'); // ai_staging 配下に固定
const OUT_ITEMS_DIR = path.join(OUT_DIR, 'items');
const OUT_SPELLS_DIR = path.join(OUT_DIR, 'spells');

// --- 準備 ---
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
if (!fs.existsSync(OUT_ITEMS_DIR)) fs.mkdirSync(OUT_ITEMS_DIR, { recursive: true });
if (!fs.existsSync(OUT_SPELLS_DIR)) fs.mkdirSync(OUT_SPELLS_DIR, { recursive: true });

// --- i18n.js のパース処理 (簡易実装) ---
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

// 辞書からキーに対応するテキストを取得する関数
function getI18nText(dict, lang, keyPath) {
    if (!keyPath) return undefined;
    const keys = keyPath.split('.');
    let current = dict[lang];
    for (const key of keys) {
        if (current === undefined) return undefined;
        current = current[key];
    }
    return current;
}

// --- メイン処理 ---
function migrate() {
    console.log("移行処理を開始します...");
    console.log(`プロジェクトルート: ${PROJECT_ROOT}`);
    console.log(`出力先ディレクトリ: ${OUT_DIR}`);
    
    const i18nDict = loadI18nDict();
    const targetLangs = Object.keys(i18nDict);
    console.log(`対応言語: ${targetLangs.join(', ')}`);

    // --- 1. アイテムの移行 ---
    const itemsPath = path.join(DATA_DIR, 'items.json');
    if (!fs.existsSync(itemsPath)) throw new Error(`items.json が見つかりません: ${itemsPath}`);
    const itemsData = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
    
    const itemIds = [];
    for (const [id, item] of Object.entries(itemsData)) {
        itemIds.push(id);
        const newItem = { ...item };
        
        newItem.name = {};
        if (newItem.descKey) newItem.description = {};

        for (const lang of targetLangs) {
             const nameText = getI18nText(i18nDict, lang, item.nameKey);
             if (nameText === undefined) throw new Error(`アイテム名テキストが見つかりません。 言語: ${lang}, キー: ${item.nameKey}`);
             newItem.name[lang] = nameText;

             if (item.descKey) {
                 const descText = getI18nText(i18nDict, lang, item.descKey);
                 if (descText === undefined) throw new Error(`アイテム説明テキストが見つかりません。 言語: ${lang}, キー: ${item.descKey}`);
                 newItem.description[lang] = descText;
             }
        }
        
        // 旧キーを削除
        delete newItem.nameKey;
        delete newItem.descKey;
        
        const outPath = path.join(OUT_ITEMS_DIR, `i_${id}.json`);
        fs.writeFileSync(outPath, JSON.stringify(newItem, null, 2), 'utf8');
    }
    
    // アイテムマニフェスト出力
    fs.writeFileSync(path.join(OUT_ITEMS_DIR, 'index.json'), JSON.stringify(itemIds, null, 2), 'utf8');
    console.log(`アイテムの移行完了: ${itemIds.length}件`);


    // --- 2. 魔法の移行 ---
    const spellsPath = path.join(DATA_DIR, 'spells.json');
    if (!fs.existsSync(spellsPath)) throw new Error(`spells.json が見つかりません: ${spellsPath}`);
    const spellsData = JSON.parse(fs.readFileSync(spellsPath, 'utf8'));
    
    const spellIds = [];
    for (const [id, spell] of Object.entries(spellsData)) {
        spellIds.push(id);
        const newSpell = { ...spell };
        
        newSpell.name = {};

        for (const lang of targetLangs) {
             const nameText = getI18nText(i18nDict, lang, spell.nameKey);
             if (nameText === undefined) throw new Error(`魔法名テキストが見つかりません。 言語: ${lang}, キー: ${spell.nameKey}`);
             newSpell.name[lang] = nameText;
        }
        
        delete newSpell.nameKey;
        
        const outPath = path.join(OUT_SPELLS_DIR, `s_${id}.json`);
        fs.writeFileSync(outPath, JSON.stringify(newSpell, null, 2), 'utf8');
    }
    
    // 魔法マニフェスト出力
    fs.writeFileSync(path.join(OUT_SPELLS_DIR, 'index.json'), JSON.stringify(spellIds, null, 2), 'utf8');
    console.log(`魔法の移行完了: ${spellIds.length}件`);
    
    console.log("フェーズ4-A (ステップ1-A) のデータ生成が完了しました。");
}

try {
    migrate();
} catch(e) {
    console.error("移行スクリプト実行中にエラーが発生しました:", e);
    process.exit(1);
}