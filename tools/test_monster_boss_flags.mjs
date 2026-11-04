import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const monstersDir = path.resolve(projectRoot, 'data', 'monsters');

/**
 * 確定仕様に基づく経験値計算ロジック（純粋関数）
 * @param {number} playerLevel 
 * @param {object} enemy 
 * @returns {number}
 */
function calculateEarnedExp(playerLevel, enemy) {
  let earnedExp = enemy.exp;
  const isBoss = Boolean(enemy.isBoss);
  if (!isBoss) {
    const monsterLevel = (typeof enemy.level === 'number') ? enemy.level : 1;
    if (playerLevel - monsterLevel >= 3) {
      earnedExp = Math.max(1, Math.floor(earnedExp * 0.25));
    }
  }
  return earnedExp;
}

let testCount = 0;

function runTest(testName, testFn) {
  testCount += 1;
  try {
    testFn();
    console.log(`[PASS] ${testName}`);
  } catch (error) {
    console.error(`[FAIL] ${testName}`);
    throw error;
  }
}

console.log('=== Monster Boss Flags & Exp Logic Tests ===\n');

// -----------------------------------------------------------------------------
// ブロックA: 実在マスターデータ整合性検証（ファイル直接読み込み）
// -----------------------------------------------------------------------------

const targetBossIds = [
  'gargoyle',
  'troll',
  'grave_thief',
  'talos',
  'cerberus',
  'black_dragon',
  'black_lizardman'
];

targetBossIds.forEach((id) => {
  runTest(`Block A: Boss monster [${id}] must have isBoss === true`, () => {
    const filePath = path.join(monstersDir, `m_${id}.json`);
    assert.ok(fs.existsSync(filePath), `File does not exist: ${filePath}`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    const monsterData = JSON.parse(content);
    
    assert.strictEqual(
      monsterData.isBoss,
      true,
      `Monster [${id}] in ${filePath} must have isBoss explicitly set to true. Current: ${monsterData.isBoss}`
    );
  });
});

const normalMonsterIds = [
  'slime',
  'goblin',
  'wolf'
];

normalMonsterIds.forEach((id) => {
  runTest(`Block A: Normal monster [${id}] must not have isBoss === true`, () => {
    const filePath = path.join(monstersDir, `m_${id}.json`);
    assert.ok(fs.existsSync(filePath), `File does not exist: ${filePath}`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    const monsterData = JSON.parse(content);
    
    assert.notStrictEqual(
      monsterData.isBoss,
      true,
      `Monster [${id}] in ${filePath} must not have isBoss === true. Current: ${monsterData.isBoss}`
    );
  });
});

// -----------------------------------------------------------------------------
// ブロックB: 経験値計算境界値ロジック検証
// -----------------------------------------------------------------------------

runTest('Block B: Boss defeated - no exp reduction regardless of level difference', () => {
  const playerLevel = 99;
  const enemy = { level: 1, exp: 100, isBoss: true };
  const result = calculateEarnedExp(playerLevel, enemy);
  assert.strictEqual(result, 100);
});

runTest('Block B: Normal enemy - level difference 2 (no reduction boundary)', () => {
  const playerLevel = 4;
  const enemy = { level: 2, exp: 100, isBoss: false };
  const result = calculateEarnedExp(playerLevel, enemy);
  assert.strictEqual(result, 100);
});

runTest('Block B: Normal enemy - level difference 3 (reduction applied boundary)', () => {
  const playerLevel = 4;
  const enemy = { level: 1, exp: 100, isBoss: false };
  const result = calculateEarnedExp(playerLevel, enemy);
  assert.strictEqual(result, 25);
});

runTest('Block B: Normal enemy - minimum 1 exp guarantee boundary', () => {
  const playerLevel = 10;
  const enemy = { level: 1, exp: 2, isBoss: false };
  const result = calculateEarnedExp(playerLevel, enemy);
  assert.strictEqual(result, 1);
});

runTest('Block B: Defense - isBoss undefined defaults to normal enemy (reduction applied)', () => {
  const playerLevel = 4;
  const enemy = { level: 1, exp: 100 };
  const result = calculateEarnedExp(playerLevel, enemy);
  assert.strictEqual(result, 25);
});

runTest('Block B: Defense - isBoss: 0 (falsy) defaults to normal enemy (reduction applied)', () => {
  const playerLevel = 4;
  const enemy = { level: 1, exp: 100, isBoss: 0 };
  const result = calculateEarnedExp(playerLevel, enemy);
  assert.strictEqual(result, 25);
});

runTest('Block B: Defense - isBoss: "" (falsy) defaults to normal enemy (reduction applied)', () => {
  const playerLevel = 4;
  const enemy = { level: 1, exp: 100, isBoss: '' };
  const result = calculateEarnedExp(playerLevel, enemy);
  assert.strictEqual(result, 25);
});

runTest('Block B: Defense - enemy.level undefined defaults to level 1 (reduction applied)', () => {
  const playerLevel = 4;
  const enemy = { exp: 100, isBoss: false };
  const result = calculateEarnedExp(playerLevel, enemy);
  assert.strictEqual(result, 25);
});

runTest('Block B: Defense - enemy.level undefined defaults to level 1 (no reduction under diff 3)', () => {
  const playerLevel = 3;
  const enemy = { exp: 100, isBoss: false };
  const result = calculateEarnedExp(playerLevel, enemy);
  assert.strictEqual(result, 100);
});

console.log(`\nAll ${testCount} assertions defined in test specifications completed successfully.`);