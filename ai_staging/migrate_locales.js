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
const JS_DIR = path.join(PROJECT_ROOT, 'js');
const OUT_DIR = path.join(PROJECT_ROOT, 'ai_staging', 'data', 'locales');

// --- 準備 ---
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

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

// --- 再帰的な言語構造の変換 ---
// { category: { key: "text" } } -> { category: { key: { lang: "text" } } }
function transformCategory(i18nDict, targetLangs, categoryKey) {
    const result = {};
    
    // 基準となる言語（通常は 'ja'）の構造をベースに走査する
    const baseLang = targetLangs[0]; 
    if (!i18nDict[baseLang] || !i18nDict[baseLang][categoryKey]) {
        return undefined; // カテゴリが存在しない場合はスキップ
    }

    function traverse(baseObj, currentResultPath) {
        for (const [key, value] of Object.entries(baseObj)) {
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                // オブジェクトの場合は再帰
                currentResultPath[key] = {};
                traverse(value, currentResultPath[key]);
            } else {
                // 文字列または配列の場合は各言語から取得してまとめる
                currentResultPath[key] = {};
                for (const lang of targetLangs) {
                    // 他の言語で該当キーが欠落している場合は undefined になるのを許容
                    let langValue = undefined;
                    try {
                        langValue = i18nDict[lang]?.[categoryKey];
                        // 再帰的なパス解決 (簡易的)
                        // traverse が実行されているスコープの情報をどう伝えるかが課題
                    } catch(e) {}
                }
            }
        }
    }
    
    // 上記の再帰よりもシンプルで確実なアプローチ: 
    // すべての言語のキーを集約して再構築する
    function buildMergedStructure(baseObj, pathArray) {
        if (typeof baseObj === 'string' || Array.isArray(baseObj)) {
            const merged = {};
            for (const lang of targetLangs) {
                let current = i18nDict[lang]?.[categoryKey];
                for (const p of pathArray) {
                    if (current === undefined) break;
                    current = current[p];
                }
                if (current !== undefined) {
                    merged[lang] = current;
                }
            }
            return merged;
        } else if (typeof baseObj === 'object' && baseObj !== null) {
            const resultNode = {};
            for (const key of Object.keys(baseObj)) {
                resultNode[key] = buildMergedStructure(baseObj[key], [...pathArray, key]);
            }
            return resultNode;
        }
        return baseObj;
    }

    return buildMergedStructure(i18nDict[baseLang][categoryKey], []);
}


// --- メイン処理 ---
function migrateLocales() {
    console.log("ロケールデータの移行処理を開始します...");
    console.log(`プロジェクトルート: ${PROJECT_ROOT}`);
    console.log(`出力先ディレクトリ: ${OUT_DIR}`);
    
    const i18nDict = loadI18nDict();
    const targetLangs = Object.keys(i18nDict);
    console.log(`対応言語: ${targetLangs.join(', ')}`);

    // グループ定義
    const fileMappings = {
        'system.json': ['common', 'title', 'system', 'ui', 'menu', 'menu_action', 'shop', 'inn', 'church', 'slot', 'field', 'player'],
        'events_battle.json': ['battle', 'battle_log', 'battle_action'],
        'events_main.json': ['objectives', 'ending', 'events'],
        'events_map.json': ['map_names', 'map_objects', 'map_npcs']
    };

    let totalCategories = 0;

    for (const [filename, categories] of Object.entries(fileMappings)) {
        const fileData = {};
        let addedCount = 0;
        
        for (const category of categories) {
            const transformed = transformCategory(i18nDict, targetLangs, category);
            if (transformed) {
                fileData[category] = transformed;
                addedCount++;
                totalCategories++;
            } else {
                console.warn(`警告: カテゴリ '${category}' は元の辞書に存在しません。スキップします。`);
            }
        }

        if (addedCount > 0) {
            const outPath = path.join(OUT_DIR, filename);
            fs.writeFileSync(outPath, JSON.stringify(fileData, null, 2), 'utf8');
            console.log(`- ${filename} を出力しました (${addedCount} カテゴリ)`);
        }
    }
    
    console.log(`合計 ${totalCategories} カテゴリの移行が完了しました。`);
    console.log("フェーズ4-A (ステップ1-C) のデータ生成が完了しました。");
}

try {
    migrateLocales();
} catch(e) {
    console.error("移行スクリプト実行中にエラーが発生しました:", e);
    process.exit(1);
}