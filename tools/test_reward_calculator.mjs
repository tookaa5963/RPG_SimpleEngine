import assert from 'node:assert/strict';
import { RewardCalculator } from '../js/engine/battle/RewardCalculator.js';

export function runRewardCalculatorTests() {
  // =========================================================================
  // 1. calculateExp テストスイート
  // =========================================================================

  // TC-EXP-01 [正常系・通常敵・同格/格上]
  {
    const exp = RewardCalculator.calculateExp(1, { exp: 2, level: 1, isBoss: false });
    assert.strictEqual(exp, 2, 'TC-EXP-01: 同格時は等倍で2EXPとなること');
  }

  // TC-EXP-02 [正常系・境界値: レベル差2（減衰なし境界）]
  {
    const exp = RewardCalculator.calculateExp(3, { exp: 100, level: 1, isBoss: false });
    assert.strictEqual(exp, 100, 'TC-EXP-02: レベル差2までは減衰せず100EXPとなること');
  }

  // TC-EXP-03 [正常系・境界値: レベル差3（減衰発動境界）]
  {
    const exp = RewardCalculator.calculateExp(4, { exp: 100, level: 1, isBoss: false });
    assert.strictEqual(exp, 25, 'TC-EXP-03: レベル差3以上で25%減衰（100 * 0.25 = 25）となること');
  }

  // TC-EXP-04 [正常系・境界値: 最低保証1EXP]
  {
    const exp = RewardCalculator.calculateExp(10, { exp: 2, level: 1, isBoss: false });
    assert.strictEqual(exp, 1, 'TC-EXP-04: 減衰計算結果が0でも最低保証1EXPとなること');
  }

  // TC-EXP-05 [正常系・ボス敵特例]
  {
    const exp = RewardCalculator.calculateExp(99, { exp: 250, level: 8, isBoss: true });
    assert.strictEqual(exp, 250, 'TC-EXP-05: ボス敵はレベル差に関わらず減衰しないこと');
  }

  // TC-EXP-06 [正常系・防御的デフォルト]
  {
    const exp = RewardCalculator.calculateExp(4, { exp: 100 });
    assert.strictEqual(exp, 25, 'TC-EXP-06: level・isBoss未定義時はlevel:1, isBoss:falseとして減衰すること');
  }

  // TC-EXP-07 [異常系・型・境界検証 (playerLevel)]
  {
    const invalidLevels = ['4', NaN, 0, -1, 1.5, Infinity, null, undefined];
    for (const invalidLevel of invalidLevels) {
      assert.throws(
        () => RewardCalculator.calculateExp(invalidLevel, { exp: 100, level: 1, isBoss: false }),
        (err) => err instanceof TypeError || err instanceof RangeError,
        `TC-EXP-07: 不正なplayerLevel (${invalidLevel}) でTypeErrorまたはRangeErrorがスローされること`
      );
    }
  }

  // TC-EXP-08 [異常系・型検証 (enemy)]
  {
    const invalidEnemies = [null, undefined, 123, 'slime', []];
    for (const invalidEnemy of invalidEnemies) {
      assert.throws(
        () => RewardCalculator.calculateExp(1, invalidEnemy),
        TypeError,
        `TC-EXP-08: 不正なenemy (${invalidEnemy}) でTypeErrorがスローされること`
      );
    }
  }

  // TC-EXP-09 [異常系・型・境界検証 (enemy.exp)]
  {
    const invalidExps = [-10, '100', NaN, Infinity, -1, null, undefined];
    for (const invalidExp of invalidExps) {
      assert.throws(
        () => RewardCalculator.calculateExp(1, { exp: invalidExp, level: 1, isBoss: false }),
        (err) => err instanceof TypeError || err instanceof RangeError,
        `TC-EXP-09: 不正なenemy.exp (${invalidExp}) でTypeErrorまたはRangeErrorがスローされること`
      );
    }
  }

  // =========================================================================
  // 2. calculateGold テストスイート
  // =========================================================================

  // TC-GLD-01 [正常系]
  {
    const gold = RewardCalculator.calculateGold({ gold: 3 });
    assert.strictEqual(gold, 3, 'TC-GLD-01: 設定されたゴールド値（3）が返ること');
  }

  // TC-GLD-02 [正常系・境界値（0ゴールド）]
  {
    const gold = RewardCalculator.calculateGold({ gold: 0 });
    assert.strictEqual(gold, 0, 'TC-GLD-02: 0ゴールドが正常に返ること');
  }

  // TC-GLD-03 [異常系・型検証 (enemy)]
  {
    const invalidEnemies = [null, undefined, 100, 'gold', []];
    for (const invalidEnemy of invalidEnemies) {
      assert.throws(
        () => RewardCalculator.calculateGold(invalidEnemy),
        TypeError,
        `TC-GLD-03: 不正なenemy (${invalidEnemy}) でTypeErrorがスローされること`
      );
    }
  }

  // TC-GLD-04 [異常系・型・境界検証 (enemy.gold)]
  {
    const invalidGolds = [-1, '100', NaN, Infinity, null, undefined];
    for (const invalidGold of invalidGolds) {
      assert.throws(
        () => RewardCalculator.calculateGold({ gold: invalidGold }),
        (err) => err instanceof TypeError || err instanceof RangeError,
        `TC-GLD-04: 不正なenemy.gold (${invalidGold}) でTypeErrorまたはRangeErrorがスローされること`
      );
    }
  }

  // =========================================================================
  // 3. determineDropItem テストスイート
  // =========================================================================

  // TC-DRP-01 [正常系・ドロップあり]
  {
    const dropItem = RewardCalculator.determineDropItem({ dropItem: 'herb' });
    assert.strictEqual(dropItem, 'herb', 'TC-DRP-01: dropItemに指定されたIDが返ること');
  }

  // TC-DRP-02 [正常系・ドロップなし]
  {
    const dropNull = RewardCalculator.determineDropItem({ dropItem: null });
    assert.strictEqual(dropNull, null, 'TC-DRP-02: dropItemがnullの場合はnullが返ること');

    const dropEmpty = RewardCalculator.determineDropItem({});
    assert.strictEqual(dropEmpty, null, 'TC-DRP-02: dropItem未定義の場合はnullが返ること');
  }

  // TC-DRP-03 [異常系・型検証 (enemy)]
  {
    const invalidEnemies = [null, undefined, 'slime', 123, []];
    for (const invalidEnemy of invalidEnemies) {
      assert.throws(
        () => RewardCalculator.determineDropItem(invalidEnemy),
        TypeError,
        `TC-DRP-03: 不正なenemy (${invalidEnemy}) でTypeErrorがスローされること`
      );
    }
  }

  // =========================================================================
  // 4. getDiscardCandidates テストスイート
  // =========================================================================

  // TC-DSC-01 [正常系・非装備通常アイテム]
  {
    const items = { herb: 2 };
    const equipment = { weapon: null, armor: null, shield: null };
    const itemDb = { herb: { name: '薬草', type: 'item' } };

    const candidates = RewardCalculator.getDiscardCandidates(items, equipment, itemDb);
    assert.deepStrictEqual(
      candidates,
      [{ id: 'herb', name: '薬草' }],
      'TC-DSC-01: 非装備通常アイテムが破棄候補に含まれること'
    );
  }

  // TC-DSC-02 [正常系・重要アイテム（破棄不可）の除外]
  {
    const items = { key: 1 };
    const equipment = { weapon: null, armor: null, shield: null };
    const itemDb = { key: { name: '鍵', type: 'key' } };

    const candidates = RewardCalculator.getDiscardCandidates(items, equipment, itemDb);
    assert.deepStrictEqual(
      candidates,
      [],
      'TC-DSC-02: type: key の重要アイテムは破棄候補から除外されること'
    );
  }

  // TC-DSC-03 [正常系・装備中アイテムの除外（余剰なし）]
  {
    const items = { copper_sword: 1 };
    const equipment = { weapon: 'copper_sword', armor: null, shield: null };
    const itemDb = { copper_sword: { name: '銅の剣', type: 'weapon' } };

    const candidates = RewardCalculator.getDiscardCandidates(items, equipment, itemDb);
    assert.deepStrictEqual(
      candidates,
      [],
      'TC-DSC-03: 装備中の1点のみ所持アイテムは破棄候補から除外されること'
    );
  }

  // TC-DSC-04 [正常系・装備中アイテムの余剰分抽出]
  {
    const items = { copper_sword: 2 };
    const equipment = { weapon: 'copper_sword', armor: null, shield: null };
    const itemDb = { copper_sword: { name: '銅の剣', type: 'weapon' } };

    const candidates = RewardCalculator.getDiscardCandidates(items, equipment, itemDb);
    assert.deepStrictEqual(
      candidates,
      [{ id: 'copper_sword', name: '銅の剣' }],
      'TC-DSC-04: 装備中であっても所持数が装備枠数を超過している場合は破棄候補に含まれること'
    );
  }

  // TC-DSC-05 [正常系・複数装備スロット同時相殺]
  {
    const items = { copper_sword: 1, iron_armor: 1, iron_shield: 1 };
    const equipment = { weapon: 'copper_sword', armor: 'iron_armor', shield: 'iron_shield' };
    const itemDb = {
      copper_sword: { name: '銅の剣', type: 'weapon' },
      iron_armor: { name: '鉄の鎧', type: 'armor' },
      iron_shield: { name: '鉄の盾', type: 'shield' }
    };

    const candidates = RewardCalculator.getDiscardCandidates(items, equipment, itemDb);
    assert.deepStrictEqual(
      candidates,
      [],
      'TC-DSC-05: 全装備スロットと1対1で相殺され破棄候補が空であること'
    );
  }

  // TC-DSC-06 [異常系・型検証]
  {
    const validItems = { herb: 1 };
    const validEquipment = { weapon: null };
    const validDb = { herb: { name: '薬草', type: 'item' } };

    assert.throws(() => RewardCalculator.getDiscardCandidates(null, validEquipment, validDb), TypeError, 'TC-DSC-06: itemsがnull');
    assert.throws(() => RewardCalculator.getDiscardCandidates(validItems, null, validDb), TypeError, 'TC-DSC-06: equipmentがnull');
    assert.throws(() => RewardCalculator.getDiscardCandidates(validItems, validEquipment, null), TypeError, 'TC-DSC-06: itemDbがnull');
    assert.throws(() => RewardCalculator.getDiscardCandidates('items', validEquipment, validDb), TypeError, 'TC-DSC-06: itemsが非オブジェクト');
  }

  // =========================================================================
  // 5. calculateRewardSummary テストスイート
  // =========================================================================

  // TC-SMR-01 [正常系・インベントリ空きあり]
  {
    const summary = RewardCalculator.calculateRewardSummary({
      playerLevel: 1,
      enemy: { exp: 2, gold: 3, level: 1, isBoss: false, dropItem: 'herb' },
      items: { herb: 1 },
      equipment: { weapon: null, armor: null, shield: null },
      itemDb: { herb: { name: '薬草', type: 'item' } },
      isInventoryFull: false
    });

    assert.strictEqual(summary.exp, 2, 'TC-SMR-01: 正確なexpが返ること');
    assert.strictEqual(summary.gold, 3, 'TC-SMR-01: 正確なgoldが返ること');
    assert.strictEqual(summary.dropItemId, 'herb', 'TC-SMR-01: 正確なdropItemIdが返ること');
    assert.strictEqual(summary.status, 'DROP_OBTAINED', 'TC-SMR-01: statusがDROP_OBTAINEDであること');
    assert.deepStrictEqual(summary.discardCandidates, [], 'TC-SMR-01: discardCandidatesが空配列であること');
  }

  // TC-SMR-02 [正常系・インベントリ満杯・破棄候補あり]
  {
    const summary = RewardCalculator.calculateRewardSummary({
      playerLevel: 1,
      enemy: { exp: 2, gold: 3, level: 1, isBoss: false, dropItem: 'herb' },
      items: { herb: 8 },
      equipment: { weapon: null, armor: null, shield: null },
      itemDb: { herb: { name: '薬草', type: 'item' } },
      isInventoryFull: true
    });

    assert.strictEqual(summary.status, 'DISCARD_REQUIRED', 'TC-SMR-02: statusがDISCARD_REQUIREDであること');
    assert.strictEqual(summary.dropItemId, 'herb', 'TC-SMR-02: 正確なdropItemIdが返ること');
    assert.strictEqual(summary.discardCandidates.length > 0, true, 'TC-SMR-02: discardCandidatesが存在すること');
    assert.strictEqual(summary.discardCandidates[0].id, 'herb', 'TC-SMR-02: 破棄候補が抽出されていること');
  }

  // TC-SMR-03 [正常系・インベントリ満杯・破棄候補なし]
  {
    const summary = RewardCalculator.calculateRewardSummary({
      playerLevel: 1,
      enemy: { exp: 2, gold: 3, level: 1, isBoss: false, dropItem: 'herb' },
      items: { key: 1, copper_sword: 1 },
      equipment: { weapon: 'copper_sword', armor: null, shield: null },
      itemDb: {
        key: { name: '鍵', type: 'key' },
        copper_sword: { name: '銅の剣', type: 'weapon' }
      },
      isInventoryFull: true
    });

    assert.strictEqual(summary.status, 'DROP_ABANDONED', 'TC-SMR-03: statusがDROP_ABANDONEDであること');
    assert.strictEqual(summary.dropItemId, 'herb', 'TC-SMR-03: 正確なdropItemIdが返ること');
    assert.deepStrictEqual(summary.discardCandidates, [], 'TC-SMR-03: discardCandidatesが空配列であること');
  }

  // TC-SMR-04 [正常系・ドロップ品なし]
  {
    const summary = RewardCalculator.calculateRewardSummary({
      playerLevel: 1,
      enemy: { exp: 2, gold: 3, level: 1, isBoss: false, dropItem: null },
      items: { herb: 1 },
      equipment: { weapon: null, armor: null, shield: null },
      itemDb: { herb: { name: '薬草', type: 'item' } },
      isInventoryFull: false
    });

    assert.strictEqual(summary.status, 'NO_DROP', 'TC-SMR-04: statusがNO_DROPであること');
    assert.strictEqual(summary.dropItemId, null, 'TC-SMR-04: dropItemIdがnullであること');
    assert.deepStrictEqual(summary.discardCandidates, [], 'TC-SMR-04: discardCandidatesが空配列であること');
  }

  // TC-SMR-05 [異常系・引数型検証]
  {
    assert.throws(() => RewardCalculator.calculateRewardSummary(null), TypeError, 'TC-SMR-05: optionsがnull');
    assert.throws(() => RewardCalculator.calculateRewardSummary({}), TypeError, 'TC-SMR-05: optionsが空オブジェクト');

    assert.throws(
      () => RewardCalculator.calculateRewardSummary({
        playerLevel: '1',
        enemy: { exp: 2, gold: 3, level: 1, isBoss: false },
        items: {},
        equipment: {},
        itemDb: {},
        isInventoryFull: false
      }),
      (err) => err instanceof TypeError || err instanceof RangeError,
      'TC-SMR-05: playerLevelの型不正'
    );

    assert.throws(
      () => RewardCalculator.calculateRewardSummary({
        playerLevel: 1,
        enemy: { exp: 2, gold: 3, level: 1, isBoss: false },
        items: {},
        equipment: {},
        itemDb: {},
        isInventoryFull: 'false'
      }),
      TypeError,
      'TC-SMR-05: isInventoryFullの型不正（boolean以外）'
    );
  }
}

// コマンドラインからの直接実行判定
if (process.argv[1] && process.argv[1].endsWith('test_reward_calculator.mjs')) {
  try {
    runRewardCalculatorTests();
    console.log('RewardCalculator: 全テスト合格 (Exit Code 0)');
  } catch (error) {
    console.error('RewardCalculator: テスト失敗', error);
    process.exit(1);
  }
}