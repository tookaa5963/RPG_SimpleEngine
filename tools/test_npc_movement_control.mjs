import assert from 'node:assert/strict';
import { resolveNpcPlacementAndMovement } from '../js/events.js';

/**
 * Step 5-2-Pre-b: NPC移動例外制御の Game Content 化 単体テスト
 */
export function runNpcMovementControlTests() {
  let assertionsCount = 0;
  const pass = () => { assertionsCount++; };

  // =========================================================================
  // 実在マスターデータ定義に基づくNPCサンプル生成ヘルパー
  // =========================================================================
  const createGuardPortSample = () => ({
    id: 'guard_port',
    type: 'human',
    name: '兵士',
    gridX: 28,
    gridY: 15,
    direction: 'down',
    walkTimer: 999999
  });

  const createElfSample = () => ({
    id: 'elf',
    sprite: 'elf',
    type: 'human',
    name: 'エルフ',
    gridX: 11,
    gridY: 5,
    direction: 'down',
    walkTimer: 60,
    moveArea: { minX: 9, maxX: 12, minY: 4, maxY: 6 }
  });

  // =========================================================================
  // A. 正常系・シナリオ分岐仕様（非破壊要件）
  // =========================================================================

  // 1. first_island の guard_port（通行証未所持時）
  {
    const npc = createGuardPortSample();
    const player = { flags: { hasPass: false } };
    const result = resolveNpcPlacementAndMovement(npc, 'first_island', player);

    assert.equal(result.gridX, 28, 'A-1-1: 通行証未所持時の guard_port は gridX=28 を維持しなければなりません');
    pass();
    assert.equal(result.gridY, 15, 'A-1-2: 通行証未所持時の guard_port は gridY=15 を維持しなければなりません');
    pass();
    assert.equal(result.walkTimer, 999999, 'A-1-3: 通行証未所持時の guard_port は walkTimer=999999 を維持しなければなりません');
    pass();
    assert.equal(result.direction, 'down', 'A-1-4: 通行証未所持時の guard_port は direction="down" を維持しなければなりません');
    pass();
  }

  // 2. first_island の guard_port（通行証所持時）
  {
    const npc = createGuardPortSample();
    const player = { flags: { hasPass: true } };
    const result = resolveNpcPlacementAndMovement(npc, 'first_island', player);

    assert.equal(result.gridX, 29, 'A-2-1: 通行証所持時の guard_port は gridX=29 へ移動しなければなりません');
    pass();
    assert.equal(result.gridY, 14, 'A-2-2: 通行証所持時の guard_port は gridY=14 へ移動しなければなりません');
    pass();
    assert.equal(result.walkTimer, 999999, 'A-2-3: 通行証所持時の guard_port は walkTimer=999999 を維持しなければなりません');
    pass();
    assert.equal(result.direction, 'down', 'A-2-4: 通行証所持時の guard_port は direction="down" を維持しなければなりません');
    pass();
  }

  // 3. temple の elf（ティソーナの話を聞く前）
  {
    const npc = createElfSample();
    const player = { flags: { heardOfTizona: false } };
    const result = resolveNpcPlacementAndMovement(npc, 'temple', player);

    assert.equal(result.gridX, 19, 'A-3-1: ティソーナ聴取前の elf は gridX=19 に固定されなければなりません');
    pass();
    assert.equal(result.gridY, 2, 'A-3-2: ティソーナ聴取前の elf は gridY=2 に固定されなければなりません');
    pass();
    assert.deepEqual(
      result.moveArea,
      { minX: 19, maxX: 19, minY: 2, maxY: 2 },
      'A-3-3: ティソーナ聴取前の elf は moveArea が (19,2) 固定範囲でなければなりません'
    );
    pass();
    assert.equal(result.walkTimer, 999999, 'A-3-4: ティソーナ聴取前の elf は walkTimer=999999 でなければなりません');
    pass();
    assert.equal(result.direction, 'down', 'A-3-5: ティソーナ聴取前の elf は direction="down" でなければなりません');
    pass();
  }

  // 4. temple の elf（ティソーナの話を聞いた後）
  {
    const npc = createElfSample();
    const player = { flags: { heardOfTizona: true } };
    const result = resolveNpcPlacementAndMovement(npc, 'temple', player);

    assert.equal(result.gridX, 11, 'A-4-1: ティソーナ聴取後の elf は初期配置 gridX=11 でなければなりません');
    pass();
    assert.equal(result.gridY, 5, 'A-4-2: ティソーナ聴取後の elf は初期配置 gridY=5 でなければなりません');
    pass();
    assert.deepEqual(
      result.moveArea,
      { minX: 9, maxX: 12, minY: 4, maxY: 6 },
      'A-4-3: ティソーナ聴取後の elf は元の moveArea 範囲が維持されなければなりません'
    );
    pass();
    assert.equal(result.walkTimer, 60, 'A-4-4: ティソーナ聴取後の elf は walkTimer=60 が維持されなければなりません');
    pass();
    assert.equal(result.direction, 'down', 'A-4-5: ティソーナ聴取後の elf は direction="down" が維持されなければなりません');
    pass();
  }

  // 5. 汎用NPC（例外ルール対象外）
  {
    const guardOnOtherMap = createGuardPortSample();
    const player = { flags: { hasPass: true, heardOfTizona: true } };
    const res1 = resolveNpcPlacementAndMovement(guardOnOtherMap, 'temple', player);

    assert.equal(res1.gridX, 28, 'A-5-1: 例外対象外マップでは gridX が変更されてはなりません');
    pass();
    assert.equal(res1.gridY, 15, 'A-5-2: 例外対象外マップでは gridY が変更されてはなりません');
    pass();
    assert.equal(res1.walkTimer, 999999, 'A-5-3: 例外対象外マップでは walkTimer が変更されてはなりません');
    pass();

    const elfOnOtherMap = createElfSample();
    const res2 = resolveNpcPlacementAndMovement(elfOnOtherMap, 'first_town', player);

    assert.equal(res2.gridX, 11, 'A-5-4: 例外対象外マップの elf は gridX が変更されてはなりません');
    pass();
    assert.equal(res2.gridY, 5, 'A-5-5: 例外対象外マップの elf は gridY が変更されてはなりません');
    pass();
    assert.deepEqual(
      res2.moveArea,
      { minX: 9, maxX: 12, minY: 4, maxY: 6 },
      'A-5-6: 例外対象外マップの elf は moveArea が変更されてはなりません'
    );
    pass();
    assert.equal(res2.walkTimer, 60, 'A-5-7: 例外対象外マップの elf は walkTimer が変更されてはなりません');
    pass();
    assert.equal(res2.direction, 'down', 'A-5-8: 例外対象外マップの elf は direction が変更されてはなりません');
    pass();
  }

  // =========================================================================
  // B. 境界値・不変性テスト
  // =========================================================================

  // 1. player.flags の欠損または null
  {
    const elf1 = createElfSample();
    const resMissingFlags = resolveNpcPlacementAndMovement(elf1, 'temple', {});
    assert.equal(resMissingFlags.gridX, 19, 'B-1-1: player.flags 欠損時は安全に未達成扱い（gridX=19）にならなければなりません');
    pass();
    assert.equal(resMissingFlags.gridY, 2, 'B-1-2: player.flags 欠損時は安全に未達成扱い（gridY=2）にならなければなりません');
    pass();

    const elf2 = createElfSample();
    const resNullFlags = resolveNpcPlacementAndMovement(elf2, 'temple', { flags: null });
    assert.equal(resNullFlags.gridX, 19, 'B-1-3: player.flags が null の場合は安全に未達成扱い（gridX=19）にならなければなりません');
    pass();
    assert.equal(resNullFlags.gridY, 2, 'B-1-4: player.flags が null の場合は安全に未達成扱い（gridY=2）にならなければなりません');
    pass();

    const guard = createGuardPortSample();
    const resGuardNullFlags = resolveNpcPlacementAndMovement(guard, 'first_island', { flags: null });
    assert.equal(resGuardNullFlags.gridX, 28, 'B-1-5: player.flags が null の場合の guard_port は未達成扱い（gridX=28）にならなければなりません');
    pass();
    assert.equal(resGuardNullFlags.gridY, 15, 'B-1-6: player.flags が null の場合の guard_port は未達成扱い（gridY=15）にならなければなりません');
    pass();
  }

  // 2. 元の npc オブジェクトの非破壊性（イミュータビリティ）と moveArea 参照分離
  {
    const originalGuard = createGuardPortSample();
    const resGuard = resolveNpcPlacementAndMovement(originalGuard, 'first_island', { flags: { hasPass: true } });

    assert.notEqual(resGuard, originalGuard, 'B-2-1: 戻り値は元の npc オブジェクトと別参照でなければなりません');
    pass();
    assert.equal(originalGuard.gridX, 28, 'B-2-2: 呼び出し元の originalGuard.gridX が書き換えられてはなりません');
    pass();
    assert.equal(originalGuard.gridY, 15, 'B-2-3: 呼び出し元の originalGuard.gridY が書き換えられてはなりません');
    pass();

    const originalElf = createElfSample();
    const originalMoveAreaRef = originalElf.moveArea;
    const resElfFixed = resolveNpcPlacementAndMovement(originalElf, 'temple', { flags: { heardOfTizona: false } });

    assert.notEqual(resElfFixed, originalElf, 'B-2-4: 戻り値は元の elf オブジェクトと別参照でなければなりません');
    pass();
    assert.notEqual(resElfFixed.moveArea, originalMoveAreaRef, 'B-2-5: 戻り値の moveArea は元の参照と分離されていなければなりません');
    pass();
    assert.equal(originalElf.gridX, 11, 'B-2-6: 呼び出し元の originalElf.gridX が書き換えられてはなりません');
    pass();
    assert.equal(originalElf.gridY, 5, 'B-2-7: 呼び出し元の originalElf.gridY が書き換えられてはなりません');
    pass();
    assert.equal(originalElf.walkTimer, 60, 'B-2-8: 呼び出し元の originalElf.walkTimer が書き換えられてはなりません');
    pass();
    assert.deepEqual(
      originalElf.moveArea,
      { minX: 9, maxX: 12, minY: 4, maxY: 6 },
      'B-2-9: 呼び出し元の originalElf.moveArea の値が書き換えられてはなりません'
    );
    pass();

    const resElfFreed = resolveNpcPlacementAndMovement(originalElf, 'temple', { flags: { heardOfTizona: true } });
    assert.notEqual(
      resElfFreed.moveArea,
      originalMoveAreaRef,
      'B-2-10: moveArea が変更されない分岐でも参照共有防止のため複製された新オブジェクトでなければなりません'
    );
    pass();
  }

  // =========================================================================
  // C. 異常系テスト（フェイルファスト検証）
  // =========================================================================

  const validNpc = createGuardPortSample();
  const validMapId = 'first_island';
  const validPlayer = { flags: {} };

  // 1. 不正な npc 引数
  [null, undefined, 123, 'guard_port', []].forEach((invalidNpc, idx) => {
    assert.throws(
      () => resolveNpcPlacementAndMovement(invalidNpc, validMapId, validPlayer),
      Error,
      `C-1-${idx + 1}: 不正な npc 引数は Error をスローしなければなりません`
    );
    pass();
  });

  // 2. 不正な npc.id
  [
    { gridX: 0, gridY: 0 },
    { id: null, gridX: 0, gridY: 0 },
    { id: undefined, gridX: 0, gridY: 0 },
    { id: 123, gridX: 0, gridY: 0 },
    { id: '', gridX: 0, gridY: 0 }
  ].forEach((invalidNpc, idx) => {
    assert.throws(
      () => resolveNpcPlacementAndMovement(invalidNpc, validMapId, validPlayer),
      Error,
      `C-2-${idx + 1}: 不正な npc.id は Error をスローしなければなりません`
    );
    pass();
  });

  // 3. 不正な npc.gridX / npc.gridY
  [
    { id: 'elf', gridX: '11', gridY: 5 },
    { id: 'elf', gridX: 11, gridY: NaN },
    { id: 'elf', gridX: Infinity, gridY: 5 },
    { id: 'elf', gridX: 11, gridY: -Infinity },
    { id: 'elf', gridX: null, gridY: 5 },
    { id: 'elf', gridX: 11 }
  ].forEach((invalidNpc, idx) => {
    assert.throws(
      () => resolveNpcPlacementAndMovement(invalidNpc, validMapId, validPlayer),
      Error,
      `C-3-${idx + 1}: 不正な npc.gridX / npc.gridY は Error をスローしなければなりません`
    );
    pass();
  });

  // 4. 不正な mapId 引数
  [null, undefined, 123, '', {}].forEach((invalidMapId, idx) => {
    assert.throws(
      () => resolveNpcPlacementAndMovement(validNpc, invalidMapId, validPlayer),
      Error,
      `C-4-${idx + 1}: 不正な mapId 引数は Error をスローしなければなりません`
    );
    pass();
  });

  // 5. 不正な player 引数
  [null, undefined, 123, 'player', []].forEach((invalidPlayer, idx) => {
    assert.throws(
      () => resolveNpcPlacementAndMovement(validNpc, validMapId, invalidPlayer),
      Error,
      `C-5-${idx + 1}: 不正な player 引数は Error をスローしなければなりません`
    );
    pass();
  });

  return assertionsCount;
}

// 直接実行時のエントリポイント
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('tools/test_npc_movement_control.mjs')) {
  const count = runNpcMovementControlTests();
  console.log(`[PASS] tools/test_npc_movement_control.mjs: 全 ${count} 項目すべてのアサーションに合格しました。`);
}