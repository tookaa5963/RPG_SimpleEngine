
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const targetArg = process.argv[2];
let targetDir = path.resolve('js/engine');
if (targetArg !== undefined && targetArg !== '') {
  targetDir = path.resolve(targetArg);
}

// 1. 禁止ブラウザAPIトークン (ヘッドレス境界)
const FORBIDDEN_TOKENS = [
  'window',
  'document',
  'HTMLCanvasElement',
  'AudioContext',
  'localStorage'
];

// 2. 禁止インポートパターン (Core層からの逆参照境界)
const FORBIDDEN_IMPORT_PATTERNS = [
  { pattern: /from\s+['"][^'"]*\/ui\/[^'"]*['"]/, name: 'UI層への逆参照 (ui/)' },
  { pattern: /from\s+['"][^'"]*\/renderer\/[^'"]*['"]/, name: '描画層への逆参照 (renderer/)' },
  { pattern: /from\s+['"][^'"]*\/input\/[^'"]*['"]/, name: '入力層への逆参照 (input/)' },
  { pattern: /from\s+['"][^'"]*\/audio\/[^'"]*['"]/, name: '音声層への逆参照 (audio/)' }
];

function getAllFiles(dir, fileList) {
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

console.log('=== [Gate 1: 静的構文・境界検証 開始] ===');
console.log('検証対象ディレクトリ: ' + targetDir);

const files = getAllFiles(targetDir, []);
if (files.length === 0) {
  console.log('[Gate 1: PASS] 検証対象ファイルが存在しません');
  console.log('=== [Gate 1: 正常完了] ===');
  process.exit(0);
}

let hasError = false;

for (let i = 0; i < files.length; i++) {
  const file = files[i];
  
  // 1. 構文チェック (node --check)
  try {
    execSync('node --check "' + file + '"', { stdio: 'pipe' });
  } catch (err) {
    console.error('[構文エラー]: ' + file);
    console.error(err.stderr ? err.stderr.toString() : err.message);
    hasError = true;
  }

  const content = fs.readFileSync(file, 'utf8');

  // 2. ヘッドレス境界チェック
  for (let j = 0; j < FORBIDDEN_TOKENS.length; j++) {
    const token = FORBIDDEN_TOKENS[j];
    if (content.includes(token)) {
      console.error('[ヘッドレス違反]: ' + file + ' に禁止トークン "' + token + '" が含まれています');
      hasError = true;
    }
  }

  // 3. レイヤー境界チェック (外層への逆参照 import 検知)
  const lines = content.split(/\r?\n/);
  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    for (let k = 0; k < FORBIDDEN_IMPORT_PATTERNS.length; k++) {
      const rule = FORBIDDEN_IMPORT_PATTERNS[k];
      if (rule.pattern.test(line)) {
        console.error('[境界違反 ' + (lineIdx + 1) + '行目]: ' + file + ' -> ' + rule.name);
        hasError = true;
      }
    }
  }
}

if (hasError) {
  console.error('=== [Gate 1: 検証失敗 (Exit Code 1)] ===');
  process.exit(1);
}

console.log('[Gate 1: PASS] 対象 ' + files.length + ' 件のファイル検証に成功しました');
console.log('=== [Gate 1: 正常完了] ===');
process.exit(0);
