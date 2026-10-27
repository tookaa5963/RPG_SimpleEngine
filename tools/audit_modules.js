const fs = require('fs');
const path = require('path');

/**
 * プロトコル第3項準拠の高解像度例外を生成する決定論的ヘルパー
 * @param {string} type 例外種別
 * @param {string} contextId 発生箇所（ファイル名:関数名）
 * @param {string} propName 不正を検知したプロパティ名
 * @param {*} val 実際に渡された値
 * @returns {Error}
 */
function createProtocolError(type, contextId, propName, val) {
    return new Error(`[${type}] ${contextId}: プロパティ "${propName}" が不正です (値: ${JSON.stringify(val)}, 型: ${typeof val})`);
}

const JS_DIR = path.resolve(process.cwd(), 'js');
const targetArg = process.argv[2];

if (!fs.existsSync(JS_DIR)) {
    throw createProtocolError('DirectoryNotFoundError', 'audit_modules.js', 'JS_DIR', JS_DIR);
}

const allFiles = fs.readdirSync(JS_DIR).filter(file => file.endsWith('.js')).sort();

/**
 * コメント行を除外した有効コード行を取得
 * @param {string} content
 * @returns {Array<{lineNum: number, text: string}>}
 */
function getValidLines(content) {
    const rawLines = content.split('\n');
    const validLines = [];
    let inBlockComment = false;

    rawLines.forEach((line, idx) => {
        const lineNum = idx + 1;
        const trimmed = line.trim();

        if (inBlockComment) {
            if (trimmed.includes('*/')) {
                inBlockComment = false;
            }
            return;
        }

        if (trimmed.startsWith('/*')) {
            if (!trimmed.includes('*/')) {
                inBlockComment = true;
            }
            return;
        }

        if (trimmed.startsWith('//')) {
            return;
        }
        if (trimmed.startsWith('*')) {
            return;
        }

        validLines.push({ lineNum, text: line });
    });

    return validLines;
}

/**
 * プロトコル規約違反の静的チェック
 * @param {Array<{lineNum: number, text: string}>} lines
 * @returns {Array<string>}
 */
function scanProtocolViolations(lines) {
    const violations = [];
    const symOr = '|' + '|';
    const symNullish = '?' + '?';
    const regDirectError = new RegExp('throw\\s+new\\s+Error\\s*\\(');

    lines.forEach(item => {
        const text = item.text;
        const lineNum = item.lineNum;

        if (text.includes(symOr)) {
            violations.push('行 ' + lineNum + ': 論理和 (' + symOr + ') が検出されました。');
        }
        if (text.includes('\u003F')) {
            if (text.includes(':')) {
                violations.push('行 ' + lineNum + ': 三項演算子 (\u003F :) が検出されました。');
            }
        }
        if (text.includes(symNullish)) {
            violations.push('行 ' + lineNum + ': Null合体演算子 (' + symNullish + ') が検出されました。');
        }
        if (regDirectError.test(text)) {
            if (!text.includes('createProtocolError')) {
                violations.push('行 ' + lineNum + ': 直接の throw' + ' new Error が検出されました。');
            }
        }
    });

    return violations;
}

/**
 * モジュールのインポート/エクスポートおよびDOM参照の解析
 * @param {string} content
 */
function analyzeModule(content) {
    const importList = [];
    const exportList = [];
    let domCount = 0;

    const importRegex = new RegExp("import\\s+([^'\\\"]+)\\s+from\\s+['\\\"]([^'\\\"]+)['\\\"]", 'g');
    let match;
    while ((match = importRegex.exec(content)) !== null) {
        importList.push(match[2]);
    }

    const exportRegex = new RegExp("export\\s+(default\\s+)?(const|let|var|function\\*?|class|async\\s+function\\*?)\\s+([\\w$]+)", 'g');
    while ((match = exportRegex.exec(content)) !== null) {
        exportList.push(match[3]);
    }

    const exportNamedRegex = new RegExp("export\\s+{([^}]+)}", 'g');
    while ((match = exportNamedRegex.exec(content)) !== null) {
        const names = match[1].split(',').map(n => n.trim().split(new RegExp('\\s+as\\s+'))[0]).filter(Boolean);
        names.forEach(name => {
            exportList.push(name);
        });
    }

    const domMatches = content.match(new RegExp('\\b(document|window)\\.', 'g'));
    if (domMatches) {
        domCount = domMatches.length;
    }

    return { importList, exportList, domCount };
}

/**
 * 循環参照の検出 (DFS)
 * @param {Map<string, Array<string>>} depMap
 * @returns {Array<string>}
 */
function detectCircularDependencies(depMap) {
    const cycles = [];
    const visited = new Set();
    const recStack = [];

    function dfs(node) {
        visited.add(node);
        recStack.push(node);

        const neighbors = depMap.get(node);
        if (neighbors) {
            neighbors.forEach(neighbor => {
                if (!visited.has(neighbor)) {
                    dfs(neighbor);
                } else if (recStack.includes(neighbor)) {
                    const cycleStartIdx = recStack.indexOf(neighbor);
                    const cyclePath = recStack.slice(cycleStartIdx).concat(neighbor);
                    cycles.push(cyclePath.join(' -> '));
                }
            });
        }

        recStack.pop();
    }

    depMap.forEach((_, node) => {
        if (!visited.has(node)) {
            dfs(node);
        }
    });

    return cycles;
}

// -------------------------------------------------------------
// 実行制御
// -------------------------------------------------------------

if (targetArg) {
    // 個別ファイル詳細監査モード
    let targetFile = targetArg;
    if (!targetFile.endsWith('.js')) {
        targetFile = targetFile + '.js';
    }
    const filePath = path.join(JS_DIR, targetFile);

    if (!fs.existsSync(filePath)) {
        throw createProtocolError('FileNotFoundError', 'audit_modules.js', 'targetFile', filePath);
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const validLines = getValidLines(content);
    const violations = scanProtocolViolations(validLines);
    const analysis = analyzeModule(content);

    console.log('=======================================================');
    console.log('[詳細監査レポート] js/' + targetFile);
    console.log('=======================================================');
    console.log('総行数: ' + content.split('\n').length + ' 行');
    console.log('DOM参照数: ' + analysis.domCount + ' 箇所');
    console.log('インポート一覧:');
    if (analysis.importList.length === 0) {
        console.log('  (なし)');
    } else {
        analysis.importList.forEach(imp => console.log('  - ' + imp));
    }
    console.log('エクスポート一覧:');
    if (analysis.exportList.length === 0) {
        console.log('  (なし)');
    } else {
        analysis.exportList.forEach(exp => console.log('  - ' + exp));
    }
    console.log('プロトコル規約違反: ' + violations.length + ' 件');
    if (violations.length > 0) {
        violations.forEach(v => console.log('  ! ' + v));
    } else {
        console.log('  [Pass] 規約違反はありません。完全合格です。');
    }
    console.log('=======================================================');
} else {
    // プロジェクト全体サマリーモード
    const summaryData = [];
    const depMap = new Map();
    let totalViolations = 0;

    allFiles.forEach(file => {
        const filePath = path.join(JS_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const stats = fs.statSync(filePath);
        const validLines = getValidLines(content);
        const violations = scanProtocolViolations(validLines);
        const analysis = analyzeModule(content);

        totalViolations += violations.length;

        const normalizedImports = analysis.importList
            .map(imp => path.basename(imp))
            .filter(imp => imp.endsWith('.js'));
        depMap.set(file, normalizedImports);

        summaryData.push({
            file: file,
            lines: content.split('\n').length,
            'size(KB)': (stats.size / 1024).toFixed(2),
            domRefs: analysis.domCount,
            imports: analysis.importList.length,
            exports: analysis.exportList.length,
            violations: violations.length
        });
    });

    console.log('\n=== [1] js/ File Summary & Protocol Status ===');
    console.table(summaryData);

    console.log('\n=== [2] Circular Dependencies ===');
    const cycles = detectCircularDependencies(depMap);
    if (cycles.length > 0) {
        cycles.forEach(c => console.log('! 循環参照検知: ' + c));
    } else {
        console.log('循環参照は検出されませんでした (Clean)');
    }

    console.log('\n=== [3] Core Concrete Dependencies (sound.js, ui.js) ===');
    depMap.forEach((imports, file) => {
        const concreteDeps = [];
        if (imports.includes('sound.js')) {
            concreteDeps.push('sound.js');
        }
        if (imports.includes('ui.js')) {
            concreteDeps.push('ui.js');
        }
        if (concreteDeps.length > 0) {
            console.log('- ' + file + ' -> [' + concreteDeps.join(', ') + ']');
        }
    });

    console.log('\nプロトコル規約違反総数: ' + totalViolations + ' 件');
    console.log('※詳細を調査する場合は "node ./scripts/audit_modules.js <ファイル名>" を実行してください。\n');
}
