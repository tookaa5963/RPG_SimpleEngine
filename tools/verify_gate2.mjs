import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const TARGET_ENGINE_DIR = path.resolve('js/engine');
const FORBIDDEN_TOKENS = [
  'window',
  'document',
  'HTMLCanvasElement',
  'AudioContext',
  'localStorage',
  '||',
  '??',
  '?' // 三項演算子検知（正規表現で精査）
];

function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    return fileList;
  }
  const files = fs.readdirSync(dir);
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (file.endsWith('.js') || file.endsWith('.mjs')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

function verifySyntax(filePath) {
  try {
    execSync(`node --check "${filePath}"`, { stdio: 'pipe' });
    return true;
  } catch (error) {
    console.error(`[Gate 1: Syntax Error] ${filePath}`);
    console.error(error.stderr ? error.stderr.toString() : error.message);
    return false;
  }
}

function verifyCoreRules(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  let hasError = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;
    const trimmed = line.trim();

    // コメント行のスキップ
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      continue;
    }

    // ブラウザAPI検知
    const browserApis = ['window', 'document', 'HTMLCanvasElement', 'AudioContext', 'localStorage'];
    for (let j = 0; j < browserApis.length; j++) {
      const api = browserApis[j];
      const regex = new RegExp(`\\b${api}\\b`);
      if (regex.test(line)) {
        console.error(`[Gate 1: Headless Violation] ${filePath}:${lineNumber} - 禁止ブラウザAPI '${api}' の直接参照`);
        hasError = true;
      }
    }

    // 禁止演算子検知 (||, ??)
    if (line.includes('||')) {
      console.error(`[Gate 1: Syntax Violation] ${filePath}:${lineNumber} - 論理和演算子 '||' の使用禁止 (明示的な if/else を使用してください)`);
      hasError = true;
    }
    if (line.includes('??')) {
      console.error(`[Gate 1: Syntax Violation] ${filePath}:${lineNumber} - Null合体演算子 '??' の使用禁止 (明示的な if/else を使用してください)`);
      hasError = true;
    }

    // 三項演算子検知 (簡易パターン: ' ? ' かつ行内に ':' が存在)
    if (line.includes('?') && line.includes(':') && !trimmed.startsWith('case ')) {
      console.error(`[Gate 1: Syntax Violation] ${filePath}:${lineNumber} - 三項演算子 '?:' の使用禁止 (明示的な if/else を使用してください)`);
      hasError = true;
    }
  }

  return !hasError;
}

function runGate1() {
  console.log('=== [Gate 1: 静的構文・境界検証 開始] ===');
  const files = getAllFiles(TARGET_ENGINE_DIR);

  if (files.length === 0) {
    console.log(`[Gate 1: PASS] 検証対象の Core ファイルが存在しません (${TARGET_ENGINE_DIR})`);
    console.log('=== [Gate 1: 正常完了] ===');
    process.exit(0);
  }

  let totalErrors = 0;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    console.log(`スキャン中: ${file}`);
    const isSyntaxValid = verifySyntax(file);
    const isCoreValid = verifyCoreRules(file);
    if (!isSyntaxValid || !isCoreValid) {
      totalErrors++;
    }
  }

  if (totalErrors > 0) {
    console.error(`\n[Gate 1: FAIL] 合計 ${totalErrors} 件のファイルで違反が検出されました。`);
    process.exit(1);
  }

  console.log('\n[Gate 1: PASS] すべてのファイルが構文・境界規約を満たしています。');
  console.log('=== [Gate 1: 正常完了] ===');
  process.exit(0);
}

runGate1();