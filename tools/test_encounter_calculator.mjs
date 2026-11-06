import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import {
  shouldRepelMonster,
  evaluateRandomEncounter
} from '../js/engine/field/EncounterCalculator.js';

const REAL_MONSTER_DEFINITIONS = Object.freeze({
  slime: Object.freeze({ id: 'slime', level: 1 }),
  ruby_slime: Object.freeze({ id: 'ruby_slime', level: 2 }),
  bat: Object.freeze({ id: 'bat', level: 3 }),
  wolf: Object.freeze({ id: 'wolf', level: 5 }),
  goblin: Object.freeze({ id: 'goblin', level: 7 }),
  kobold: Object.freeze({ id: 'kobold', level: 8 }),
  orc: Object.freeze({ id: 'orc', level: 8 }),
  giant_centipede: Object.freeze({ id: 'giant_centipede', level: 8 }),
  lizardman: Object.freeze({ id: 'lizardman', level: 14 }),
  gargoyle: Object.freeze({ id: 'gargoyle', level: 7, isBoss: true }),
  black_dragon: Object.freeze({ id: 'black_dragon', level: 20, isBoss: true })
});

function cloneMonsterDefinitions() {
  return JSON.parse(JSON.stringify(REAL_MONSTER_DEFINITIONS));
}

function createDungeonMap() {
  return {
    encounterRate: 0.08,
    monsters: ['goblin', 'kobold', 'orc', 'giant_centipede']
  };
}

function createFirstTownMap() {
  return {
    encounterRate: 0
  };
}

function createCaveMap() {
  return {
    encounterRate: 0.08,
    encounterZones: [
      {
        x1: 0,
        y1: 0,
        x2: 19,
        y2: 2,
        rate: 0.12,
        monsters: ['slime', 'ruby_slime', 'bat']
      },
      {
        x1: 0,
        y1: 10,
        x2: 19,
        y2: 19,
        rate: 0.08,
        monsters: ['ghost', 'skeleton', 'wolf']
      }
    ]
  };
}

function createUnderseaTunnel2Map() {
  return {
    encounterRate: 0.08,
    encounterZones: [
      {
        x1: 0,
        y1: 22,
        x2: 15,
        y2: 31,
        rate: 0.08,
        monsters: ['lizardman']
      }
    ]
  };
}

export function runEncounterCalculatorTests() {
  // ---------------------------------------------------------------------------
  // A. shouldRepelMonster（聖水撃退判定）正常系・境界値ケース
  // ---------------------------------------------------------------------------

  // 1. 聖水効果なし（境界値 holyWaterSteps: 0）
  {
    const defs = cloneMonsterDefinitions();
    const result = shouldRepelMonster({
      holyWaterSteps: 0,
      playerLevel: 10,
      monsterDef: defs.slime,
      repelRoll: 0.99
    });
    assert.strictEqual(result, false, 'holyWaterSteps === 0 must not repel monsters');
  }

  // 2. 聖水有効・レベル差3以上・撃退成功境界（repelRoll: 0.15）
  {
    const defs = cloneMonsterDefinitions();
    const result = shouldRepelMonster({
      holyWaterSteps: 50,
      playerLevel: 4,
      monsterDef: defs.slime,
      repelRoll: 0.15
    });
    assert.strictEqual(
      result,
      true,
      'Level diff === 3 and repelRoll === 0.15 must repel monster'
    );
  }

  // 3. 聖水有効・レベル差3以上・撃退突破境界（repelRoll: 0.1499）
  {
    const defs = cloneMonsterDefinitions();
    const result = shouldRepelMonster({
      holyWaterSteps: 50,
      playerLevel: 4,
      monsterDef: defs.slime,
      repelRoll: 0.1499
    });
    assert.strictEqual(
      result,
      false,
      'repelRoll === 0.1499 (< 0.15) must fail to repel monster'
    );
  }

  // 4. 聖水有効・レベル差不足（境界値 playerLevel - monsterLevel === 2）
  {
    const defs = cloneMonsterDefinitions();
    const result = shouldRepelMonster({
      holyWaterSteps: 50,
      playerLevel: 3,
      monsterDef: defs.slime,
      repelRoll: 0.99
    });
    assert.strictEqual(
      result,
      false,
      'Level diff === 2 (< 3) must not repel monster'
    );
  }

  // 5. 聖水有効・ボス属性無効化（isBoss: true）
  {
    const defs = cloneMonsterDefinitions();
    const result = shouldRepelMonster({
      holyWaterSteps: 128,
      playerLevel: 20,
      monsterDef: defs.gargoyle,
      repelRoll: 0.99
    });
    assert.strictEqual(
      result,
      false,
      'Boss monster (isBoss: true) must never be repelled by holy water'
    );
  }

  // 6. 未定義モンスター定義（monsterDef: undefined）
  {
    const result = shouldRepelMonster({
      holyWaterSteps: 50,
      playerLevel: 10,
      monsterDef: undefined,
      repelRoll: 0.99
    });
    assert.strictEqual(
      result,
      false,
      'Undefined monsterDef must return false without throwing'
    );
  }

  // ---------------------------------------------------------------------------
  // B. evaluateRandomEncounter（歩数加算・エンカウント判定）正常系・境界値ケース
  // ---------------------------------------------------------------------------

  // 7. 安全歩数境界（stepsSinceLastBattle: 3, minSafeSteps: 4 -> 4歩目）
  {
    const defs = cloneMonsterDefinitions();
    const map = createDungeonMap();
    const result = evaluateRandomEncounter({
      stepsSinceLastBattle: 3,
      minSafeSteps: 4,
      map,
      playerX: 5,
      playerY: 5,
      encounterRoll: 0.0,
      poolRoll: 0.0,
      holyWaterSteps: 0,
      playerLevel: 10,
      repelRoll: 0.5,
      monsterDefinitions: defs
    });
    assert.deepStrictEqual(result, {
      nextStepsSinceLastBattle: 4,
      encountered: false,
      monsterId: null,
      repelled: false
    });
  }

  // 8. 安全歩数超過・エンカウント成立境界（stepsSinceLastBattle: 4 -> 5歩目, encounterRoll: 0.0799 < 0.08）
  {
    const defs = cloneMonsterDefinitions();
    const map = createDungeonMap();
    const result = evaluateRandomEncounter({
      stepsSinceLastBattle: 4,
      minSafeSteps: 4,
      map,
      playerX: 5,
      playerY: 5,
      encounterRoll: 0.0799,
      poolRoll: 0.0,
      holyWaterSteps: 0,
      playerLevel: 10,
      repelRoll: 0.5,
      monsterDefinitions: defs
    });
    assert.deepStrictEqual(result, {
      nextStepsSinceLastBattle: 5,
      encountered: true,
      monsterId: 'goblin',
      repelled: false
    });
  }

  // 9. エンカウント確率上限境界（encounterRoll: 0.08 === activeRate: 0.08）
  {
    const defs = cloneMonsterDefinitions();
    const map = createDungeonMap();
    const result = evaluateRandomEncounter({
      stepsSinceLastBattle: 4,
      minSafeSteps: 4,
      map,
      playerX: 5,
      playerY: 5,
      encounterRoll: 0.08,
      poolRoll: 0.0,
      holyWaterSteps: 0,
      playerLevel: 10,
      repelRoll: 0.5,
      monsterDefinitions: defs
    });
    assert.deepStrictEqual(result, {
      nextStepsSinceLastBattle: 5,
      encountered: false,
      monsterId: null,
      repelled: false
    });
  }

  // 10. 安全エリア（first_town / encounterRate: 0）での不発
  {
    const defs = cloneMonsterDefinitions();
    const map = createFirstTownMap();
    const result = evaluateRandomEncounter({
      stepsSinceLastBattle: 10,
      minSafeSteps: 4,
      map,
      playerX: 5,
      playerY: 5,
      encounterRoll: 0.0,
      poolRoll: 0.0,
      holyWaterSteps: 0,
      playerLevel: 10,
      repelRoll: 0.5,
      monsterDefinitions: defs
    });
    assert.deepStrictEqual(result, {
      nextStepsSinceLastBattle: 11,
      encountered: false,
      monsterId: null,
      repelled: false
    });
  }

  // 11. ゾーン別出現率・プール適用（cave 座標 (10, 1) -> rate: 0.12, 3体目の 'bat' 抽選）
  {
    const defs = cloneMonsterDefinitions();
    const map = createCaveMap();
    const result = evaluateRandomEncounter({
      stepsSinceLastBattle: 5,
      minSafeSteps: 4,
      map,
      playerX: 10,
      playerY: 1,
      encounterRoll: 0.10,
      poolRoll: 0.70,
      holyWaterSteps: 0,
      playerLevel: 10,
      repelRoll: 0.5,
      monsterDefinitions: defs
    });
    assert.deepStrictEqual(result, {
      nextStepsSinceLastBattle: 6,
      encountered: true,
      monsterId: 'bat',
      repelled: false
    });
  }

  // 12. ゾーン定義ありマップにおけるゾーン外座標での不発（undersea_tunnel2 座標 (13, 16)）
  {
    const defs = cloneMonsterDefinitions();
    const map = createUnderseaTunnel2Map();
    const result = evaluateRandomEncounter({
      stepsSinceLastBattle: 5,
      minSafeSteps: 4,
      map,
      playerX: 13,
      playerY: 16,
      encounterRoll: 0.0,
      poolRoll: 0.0,
      holyWaterSteps: 0,
      playerLevel: 10,
      repelRoll: 0.5,
      monsterDefinitions: defs
    });
    assert.deepStrictEqual(result, {
      nextStepsSinceLastBattle: 6,
      encountered: false,
      monsterId: null,
      repelled: false
    });
  }

  // 13. ランダムエンカウント成立後の聖水撃退連動
  {
    const defs = cloneMonsterDefinitions();
    const map = createCaveMap();
    const result = evaluateRandomEncounter({
      stepsSinceLastBattle: 4,
      minSafeSteps: 4,
      map,
      playerX: 1,
      playerY: 1,
      encounterRoll: 0.01,
      poolRoll: 0.0,
      holyWaterSteps: 10,
      playerLevel: 5,
      repelRoll: 0.50,
      monsterDefinitions: defs
    });
    assert.deepStrictEqual(result, {
      nextStepsSinceLastBattle: 5,
      encountered: false,
      monsterId: null,
      repelled: true
    });
  }

  // ---------------------------------------------------------------------------
  // C. 異常系・フェイルファスト・純粋性検証ケース
  // ---------------------------------------------------------------------------

  // 14. 非オブジェクト引数エラー
  {
    assert.throws(() => shouldRepelMonster(null));
    assert.throws(() => shouldRepelMonster(undefined));
    assert.throws(() => shouldRepelMonster('invalid'));
    assert.throws(() => shouldRepelMonster(123));

    assert.throws(() => evaluateRandomEncounter(null));
    assert.throws(() => evaluateRandomEncounter(undefined));
    assert.throws(() => evaluateRandomEncounter('invalid'));
    assert.throws(() => evaluateRandomEncounter(123));
  }

  // 15. 不正な数値引数（NaN / 文字列 / 負の歩数）エラー
  {
    const defs = cloneMonsterDefinitions();
    const map = createDungeonMap();
    const validParams = {
      stepsSinceLastBattle: 4,
      minSafeSteps: 4,
      map,
      playerX: 5,
      playerY: 5,
      encounterRoll: 0.05,
      poolRoll: 0.0,
      holyWaterSteps: 0,
      playerLevel: 10,
      repelRoll: 0.5,
      monsterDefinitions: defs
    };

    assert.throws(() => evaluateRandomEncounter({ ...validParams, stepsSinceLastBattle: -1 }));
    assert.throws(() => evaluateRandomEncounter({ ...validParams, stepsSinceLastBattle: NaN }));
    assert.throws(() => evaluateRandomEncounter({ ...validParams, minSafeSteps: -1 }));
    assert.throws(() => evaluateRandomEncounter({ ...validParams, playerX: NaN }));
    assert.throws(() => evaluateRandomEncounter({ ...validParams, playerY: Infinity }));
    assert.throws(() => evaluateRandomEncounter({ ...validParams, encounterRoll: '0.05' }));
    assert.throws(() => evaluateRandomEncounter({ ...validParams, holyWaterSteps: -1 }));
    assert.throws(() => evaluateRandomEncounter({ ...validParams, playerLevel: NaN }));

    assert.throws(() =>
      shouldRepelMonster({
        holyWaterSteps: -1,
        playerLevel: 10,
        monsterDef: defs.slime,
        repelRoll: 0.5
      })
    );
    assert.throws(() =>
      shouldRepelMonster({
        holyWaterSteps: 10,
        playerLevel: '10',
        monsterDef: defs.slime,
        repelRoll: 0.5
      })
    );
  }

  // 16. 乱数範囲外（< 0 または >= 1）エラー
  {
    const defs = cloneMonsterDefinitions();
    const map = createDungeonMap();
    const validParams = {
      stepsSinceLastBattle: 4,
      minSafeSteps: 4,
      map,
      playerX: 5,
      playerY: 5,
      encounterRoll: 0.05,
      poolRoll: 0.0,
      holyWaterSteps: 0,
      playerLevel: 10,
      repelRoll: 0.5,
      monsterDefinitions: defs
    };

    assert.throws(() =>
      shouldRepelMonster({
        holyWaterSteps: 10,
        playerLevel: 10,
        monsterDef: defs.slime,
        repelRoll: 1.0
      })
    );
    assert.throws(() =>
      shouldRepelMonster({
        holyWaterSteps: 10,
        playerLevel: 10,
        monsterDef: defs.slime,
        repelRoll: -0.01
      })
    );

    assert.throws(() => evaluateRandomEncounter({ ...validParams, encounterRoll: -0.1 }));
    assert.throws(() => evaluateRandomEncounter({ ...validParams, encounterRoll: 1.0 }));
    assert.throws(() => evaluateRandomEncounter({ ...validParams, poolRoll: 1.0 }));
    assert.throws(() => evaluateRandomEncounter({ ...validParams, poolRoll: -0.01 }));
    assert.throws(() => evaluateRandomEncounter({ ...validParams, repelRoll: 1.0 }));
    assert.throws(() => evaluateRandomEncounter({ ...validParams, repelRoll: -0.01 }));
  }

  // 17. 不正な map / monsterDefinitions 型エラー
  {
    const defs = cloneMonsterDefinitions();
    const map = createDungeonMap();
    const validParams = {
      stepsSinceLastBattle: 4,
      minSafeSteps: 4,
      map,
      playerX: 5,
      playerY: 5,
      encounterRoll: 0.05,
      poolRoll: 0.0,
      holyWaterSteps: 0,
      playerLevel: 10,
      repelRoll: 0.5,
      monsterDefinitions: defs
    };

    assert.throws(() => evaluateRandomEncounter({ ...validParams, map: null }));
    assert.throws(() => evaluateRandomEncounter({ ...validParams, map: 'invalid' }));
    assert.throws(() => evaluateRandomEncounter({ ...validParams, map: [] }));
    assert.throws(() => evaluateRandomEncounter({ ...validParams, monsterDefinitions: null }));
    assert.throws(() => evaluateRandomEncounter({ ...validParams, monsterDefinitions: [] }));
    assert.throws(() => evaluateRandomEncounter({ ...validParams, monsterDefinitions: 'invalid' }));
  }

  // 18. 引数非破壊性（イミュータブル検証）
  {
    const defs = cloneMonsterDefinitions();
    const map = createCaveMap();
    const defsBefore = JSON.parse(JSON.stringify(defs));
    const mapBefore = JSON.parse(JSON.stringify(map));

    evaluateRandomEncounter({
      stepsSinceLastBattle: 5,
      minSafeSteps: 4,
      map,
      playerX: 10,
      playerY: 1,
      encounterRoll: 0.05,
      poolRoll: 0.5,
      holyWaterSteps: 10,
      playerLevel: 10,
      repelRoll: 0.5,
      monsterDefinitions: defs
    });

    assert.deepStrictEqual(defs, defsBefore, 'monsterDefinitions must not be mutated');
    assert.deepStrictEqual(map, mapBefore, 'map must not be mutated');
  }
}

const isDirectExecution =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  typeof process.argv[1] === 'string' &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectExecution) {
  runEncounterCalculatorTests();
  console.log('[PASS] EncounterCalculator unit tests succeeded.');
}