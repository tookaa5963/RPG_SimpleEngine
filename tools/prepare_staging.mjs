// FILE_ENTRY: tools/prepare_staging.mjs
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const stagingDir = path.resolve(projectRoot, 'ai_staging');

const rawEntryFiles = process.argv.slice(2);
if (rawEntryFiles.length === 0) {
  console.error('エラー: 起点となるファイルを1つ以上指定してください。');
  console.error('使用法: node tools/prepare_staging.mjs <entry_file1> [entry_file2 ...]');
  process.exit(1);
}

// パスセパレータを POSIX 形式 (/) に正規化するヘルパー
function toPosix(p) {
  return p.split(path.sep).join('/');
}

// ai_staging 内のパスが渡された場合でも、プロジェクトルート基準の相対パスに正規化する
function normalizeToProjectRelative(filePath) {
  let abs = path.resolve(projectRoot, filePath);
  let rel = path.relative(projectRoot, abs);
  const posixRel = toPosix(rel);

  if (posixRel.startsWith('ai_staging/')) {
    return posixRel.slice('ai_staging/'.length);
  }
  return posixRel;
}

const visited = new Set();
const dependencies = new Set();

const IMPORT_PATTERNS = [
  /(?:import|export)\s+(?:[\w*\s{},]*\s+from\s+)?['"](\.[^'"]+)['"]/g,
  /import\s*\(\s*['"](\.[^'"]+)['"]\s*\)/g
];

function analyzeDependencies(relPath) {
  const normRelPath = toPosix(relPath);
  if (visited.has(normRelPath)) {
    return;
  }
  visited.add(normRelPath);

  // ステージング側を優先探索し、無ければ本番ツリーを探索
  const stagingCandidate = path.resolve(stagingDir, normRelPath);
  const rootCandidate = path.resolve(projectRoot, normRelPath);
  const targetFile = fs.existsSync(stagingCandidate) ? stagingCandidate : rootCandidate;

  if (!fs.existsSync(targetFile)) {
    return;
  }

  const ext = path.extname(targetFile);
  if (ext !== '.js' && ext !== '.mjs') {
    return;
  }

  // コメント（単一行 // および 複数行 /* */）を除去して誤検出を防止
  let content = fs.readFileSync(targetFile, 'utf8');
  content = content.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '$1');

  const dir = path.dirname(normRelPath);

  for (const regex of IMPORT_PATTERNS) {
    let match;
    while ((match = regex.exec(content)) !== null) {
      const importPath = match[1];
      // 相対インポートからプロジェクトルート基準の相対パスを算出
      const resolvedAbs = path.resolve(projectRoot, dir, importPath);
      const childRelPath = toPosix(path.relative(projectRoot, resolvedAbs));

      dependencies.add(childRelPath);
      analyzeDependencies(childRelPath);
    }
  }
}

console.log('=== 依存関係の静的走査を開始 ===');
for (const rawEntry of rawEntryFiles) {
  const relEntry = normalizeToProjectRelative(rawEntry);
  dependencies.add(relEntry);
  analyzeDependencies(relEntry);
}

console.log(`検出された依存モジュール数: ${dependencies.size} 件`);

let copiedCount = 0;
let skippedCount = 0;

for (const relPath of dependencies) {
  const srcPath = path.resolve(projectRoot, relPath);
  const destPath = path.resolve(stagingDir, relPath);

  if (!fs.existsSync(srcPath)) {
    // ステージング側にのみ存在する新規ファイルの場合は正常スキップ
    if (fs.existsSync(destPath)) {
      skippedCount++;
      continue;
    }
    console.warn(`[WARN] 依存ファイルが本番環境に見つかりません: ${relPath}`);
    continue;
  }

  // ステージング側にすでにファイルが存在する場合は上書き防止（作業内容の保護）
  if (fs.existsSync(destPath)) {
    skippedCount++;
    continue;
  }

  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.copyFileSync(srcPath, destPath);
  copiedCount++;
}

console.log(`ステージングミラーリング完了: 新規配置 ${copiedCount} 件 / 既存保護 ${skippedCount} 件`);