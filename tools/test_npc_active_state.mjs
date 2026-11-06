import assert from 'node:assert/strict';
import { evaluateNpcActiveState } from '../js/events.js';

/**
 * Step 5-2-Pre-a: シナリオNPCアクティブ判定の Game Content 化 単体テスト
 */
export function runNpcActiveStateTests() {
  let assertionsCount = 0;
  const pass = () => { assertionsCount++; };

  // =========================================================================
  // 実在マスターデータ定義に基づくNPCサンプル
  // =========================================================================
  const npcTalos = { id: 'talos', type: 'monster', monsterId: 'talos', name: 'タロス', gridX: 10, gridY: 2 };
  const npcGargoyle = { id: 'gargoyle', type: 'monster', monsterId: 'gargoyle', name: 'ガーゴイル', gridX: 5, gridY: 14 };
  const npcTroll = { id: 'troll', type: 'monster', monsterId: 'troll', name: 'トロール', gridX: 16, gridY: 2 };
  const npcGraveThief = { id: 'grave_thief', type: 'monster', monsterId: 'grave_thief', name: 'スカルコレクター', gridX: 15, gridY: 1 };
  const npcUndine = { id: 'undine', type: 'human', name: 'ウンディーネ', gridX: 37, gridY: 6 };
  const npcGirl = { id: 'girl', type: 'human', name: '女の子', gridX: 20, gridY: 6 };
  const npcOldMan = { id: 'old_man', type: 'human', name: '老人', gridX: 1, gridY: 7 };
  const npcGuardPort = { id: 'guard_port', type: 'human', name: '衛兵', gridX: 28, gridY: 14 };

  // =========================================================================
  // A. 正常系・シナリオ分岐仕様（非破壊要件）
  // =========================================================================

  // 1. 撃破済みボス共通除外 (defeatedBosses.includes(npc.id))
  {
    const player = { flags: { talkedToScholar: true, kidnappingEventStarted: true }, inventory: {} };
    assert.equal(
      evaluateNpcActiveState(npcGargoyle, 'cave', player, ['gargoyle']),
      false,
      'A-1-1: 撃破済みボスリストに含まれるNPCは常にfalseでなければなりません'
    );
    pass();

    assert.equal(
      evaluateNpcActiveState(npcTroll, 'first_dungeon2', player, ['troll']),
      false,
      'A-1-2: 撃破済みボスリストに含まれるNPCは常にfalseでなければなりません'
    );
    pass();
  }

  // 2. talos (temple3)
  {
    const player = { flags: {}, inventory: {} };
    assert.equal(
      evaluateNpcActiveState(npcTalos, 'temple3', player, []),
      true,
      'A-2-1: 未撃破のタロスは出現しなければなりません'
    );
    pass();

    assert.equal(
      evaluateNpcActiveState(npcTalos, 'temple3', player, ['talos']),
      false,
      'A-2-2: 撃破済みのタロスは出現してはなりません'
    );
    pass();
  }

  // 3. gargoyle (cave)
  {
    const playerBeforeScholar = { flags: { talkedToScholar: false }, inventory: {} };
    assert.equal(
      evaluateNpcActiveState(npcGargoyle, 'cave', playerBeforeScholar, []),
      false,
      'A-3-1: 学者と話す前のガーゴイルは出現してはなりません'
    );
    pass();

    const playerAfterScholar = { flags: { talkedToScholar: true }, inventory: {} };
    assert.equal(
      evaluateNpcActiveState(npcGargoyle, 'cave', playerAfterScholar, []),
      true,
      'A-3-2: 学者と話した後の未撃破ガーゴイルは出現しなければなりません'
    );
    pass();

    assert.equal(
      evaluateNpcActiveState(npcGargoyle, 'cave', playerAfterScholar, ['gargoyle']),
      false,
      'A-3-3: 撃破済みのガーゴイルは出現してはなりません'
    );
    pass();
  }

  // 4. troll (first_dungeon2)
  {
    const playerBeforeKidnap = { flags: { kidnappingEventStarted: false }, inventory: {} };
    assert.equal(
      evaluateNpcActiveState(npcTroll, 'first_dungeon2', playerBeforeKidnap, []),
      false,
      'A-4-1: 誘拐事件発生前のトロールは出現してはなりません'
    );
    pass();

    const playerAfterKidnap = { flags: { kidnappingEventStarted: true }, inventory: {} };
    assert.equal(
      evaluateNpcActiveState(npcTroll, 'first_dungeon2', playerAfterKidnap, []),
      true,
      'A-4-2: 誘拐事件発生後の未撃破トロールは出現しなければなりません'
    );
    pass();

    assert.equal(
      evaluateNpcActiveState(npcTroll, 'first_dungeon2', playerAfterKidnap, ['troll']),
      false,
      'A-4-3: 撃破済みのトロールは出現してはなりません'
    );
    pass();
  }

  // 5. grave_thief (temple11)
  {
    const playerBeforeElf = { flags: { elfQuestStarted: false }, inventory: {} };
    assert.equal(
      evaluateNpcActiveState(npcGraveThief, 'temple11', playerBeforeElf, []),
      false,
      'A-5-1: エルフ依頼前のスカルコレクターは出現してはなりません'
    );
    pass();

    const playerActive = { flags: { elfQuestStarted: true, returnedLoversRing: false }, inventory: { lovers_ring: 0 } };
    assert.equal(
      evaluateNpcActiveState(npcGraveThief, 'temple11', playerActive, []),
      true,
      'A-5-2: エルフ依頼後・未撃破・指輪未返却・未所持時は出現しなければなりません'
    );
    pass();

    assert.equal(
      evaluateNpcActiveState(npcGraveThief, 'temple11', playerActive, ['grave_thief']),
      false,
      'A-5-3: 撃破済みのスカルコレクターは出現してはなりません'
    );
    pass();

    const playerReturnedRing = { flags: { elfQuestStarted: true, returnedLoversRing: true }, inventory: {} };
    assert.equal(
      evaluateNpcActiveState(npcGraveThief, 'temple11', playerReturnedRing, []),
      false,
      'A-5-4: 指輪返却済みの場合はスカルコレクターは出現してはなりません'
    );
    pass();

    const playerHavingRing = { flags: { elfQuestStarted: true, returnedLoversRing: false }, inventory: { lovers_ring: 1 } };
    assert.equal(
      evaluateNpcActiveState(npcGraveThief, 'temple11', playerHavingRing, []),
      false,
      'A-5-5: 指輪所持時はスカルコレクターは出現してはなりません'
    );
    pass();
  }

  // 6. undine (deep_forest)
  {
    const playerBeforeRing = { flags: { returnedLoversRing: false }, inventory: {} };
    assert.equal(
      evaluateNpcActiveState(npcUndine, 'deep_forest', playerBeforeRing, []),
      false,
      'A-6-1: 恋人の指輪返却前はウンディーネは出現してはなりません'
    );
    pass();

    const playerAfterRing = { flags: { returnedLoversRing: true }, inventory: {} };
    assert.equal(
      evaluateNpcActiveState(npcUndine, 'deep_forest', playerAfterRing, []),
      true,
      'A-6-2: 恋人の指輪返却後はウンディーネが出現しなければなりません'
    );
    pass();
  }

  // 7. girl (first_town / first_dungeon2)
  {
    // first_town
    const townInitial = { flags: { kidnappingEventStarted: false, hasPass: false }, inventory: {} };
    assert.equal(
      evaluateNpcActiveState(npcGirl, 'first_town', townInitial, []),
      true,
      'A-7-1: 最初の町では誘拐前は女の子が出現しなければなりません'
    );
    pass();

    const townKidnapped = { flags: { kidnappingEventStarted: true, hasPass: false }, inventory: {} };
    assert.equal(
      evaluateNpcActiveState(npcGirl, 'first_town', townKidnapped, []),
      false,
      'A-7-2: 最初の町では誘拐中（通行証なし）は女の子が出現してはなりません'
    );
    pass();

    const townRescued = { flags: { kidnappingEventStarted: true, hasPass: true }, inventory: {} };
    assert.equal(
      evaluateNpcActiveState(npcGirl, 'first_town', townRescued, []),
      true,
      'A-7-3: 最初の町では救出後（通行証所持）は女の子が出現しなければなりません'
    );
    pass();

    // first_dungeon2
    const dungeonInitial = { flags: { kidnappingEventStarted: false, rescuedGirl: false }, inventory: {} };
    assert.equal(
      evaluateNpcActiveState(npcGirl, 'first_dungeon2', dungeonInitial, []),
      false,
      'A-7-4: ダンジョンでは誘拐前は女の子が出現してはなりません'
    );
    pass();

    const dungeonKidnapped = { flags: { kidnappingEventStarted: true, rescuedGirl: false }, inventory: {} };
    assert.equal(
      evaluateNpcActiveState(npcGirl, 'first_dungeon2', dungeonKidnapped, []),
      true,
      'A-7-5: ダンジョンでは誘拐中（未救出）は女の子が出現しなければなりません'
    );
    pass();

    const dungeonRescued = { flags: { kidnappingEventStarted: true, rescuedGirl: true }, inventory: {} };
    assert.equal(
      evaluateNpcActiveState(npcGirl, 'first_dungeon2', dungeonRescued, []),
      false,
      'A-7-6: ダンジョンでは救出後は女の子が出現してはなりません'
    );
    pass();
  }

  // 8. old_man (cave / port_town)
  {
    // cave
    const caveBeforeReport = { flags: { reportedMonumentToScholar: false }, inventory: {} };
    assert.equal(
      evaluateNpcActiveState(npcOldMan, 'cave', caveBeforeReport, []),
      true,
      'A-8-1: 洞窟では石碑報告前は老人が出現しなければなりません'
    );
    pass();

    const caveAfterReport = { flags: { reportedMonumentToScholar: true }, inventory: {} };
    assert.equal(
      evaluateNpcActiveState(npcOldMan, 'cave', caveAfterReport, []),
      false,
      'A-8-2: 洞窟では石碑報告後は老人が出現してはなりません'
    );
    pass();

    // port_town
    const portBeforeReport = { flags: { reportedMonumentToScholar: false }, inventory: {} };
    assert.equal(
      evaluateNpcActiveState(npcOldMan, 'port_town', portBeforeReport, []),
      false,
      'A-8-3: 港町では石碑報告前は学者は出現してはなりません'
    );
    pass();

    const portAfterReport = { flags: { reportedMonumentToScholar: true }, inventory: {} };
    assert.equal(
      evaluateNpcActiveState(npcOldMan, 'port_town', portAfterReport, []),
      true,
      'A-8-4: 港町では石碑報告後は学者が出現しなければなりません'
    );
    pass();
  }

  // 9. 汎用NPC（固有分岐なし）
  {
    const player = { flags: {}, inventory: {} };
    assert.equal(
      evaluateNpcActiveState(npcGuardPort, 'first_island', player, []),
      true,
      'A-9-1: 固有分岐のないNPCは未撃破であればtrueを返さなければなりません'
    );
    pass();

    assert.equal(
      evaluateNpcActiveState(npcGuardPort, 'first_island', player, ['guard_port']),
      false,
      'A-9-2: 固有分岐のないNPCでも撃破リストにあればfalseを返さなければなりません'
    );
    pass();
  }

  // =========================================================================
  // B. 境界値テスト
  // =========================================================================

  // 1. player.flags / player.inventory の欠損またはnull
  {
    const emptyPlayer = {};
    assert.equal(
      evaluateNpcActiveState(npcGargoyle, 'cave', emptyPlayer, []),
      false,
      'B-1-1: player.flags欠損時は安全に未達成判定されなければなりません'
    );
    pass();

    const nullPropsPlayer = { flags: null, inventory: null };
    assert.equal(
      evaluateNpcActiveState(npcGraveThief, 'temple11', nullPropsPlayer, []),
      false,
      'B-1-2: player.flags/inventoryがnullの場合は安全に未達成判定されなければなりません'
    );
    pass();
  }

  // 2. lovers_ring 所持数が 0 の境界値
  {
    const playerWithZeroRing = { flags: { elfQuestStarted: true, returnedLoversRing: false }, inventory: { lovers_ring: 0 } };
    assert.equal(
      evaluateNpcActiveState(npcGraveThief, 'temple11', playerWithZeroRing, []),
      true,
      'B-2: lovers_ringの所持数が0の場合は未所持として扱われなければなりません'
    );
    pass();
  }

  // 3. 対象外マップでの分岐対象NPC（フォールバック）
  {
    const player = { flags: {}, inventory: {} };
    assert.equal(
      evaluateNpcActiveState(npcGirl, 'first_island', player, []),
      true,
      'B-3-1: 対象外マップでのgirlはフォールバックとしてtrueを返さなければなりません'
    );
    pass();

    assert.equal(
      evaluateNpcActiveState(npcOldMan, 'first_island', player, []),
      true,
      'B-3-2: 対象外マップでのold_manはフォールバックとしてtrueを返さなければなりません'
    );
    pass();
  }

  // =========================================================================
  // C. 異常系テスト（フェイルファスト検証）
  // =========================================================================

  const validNpc = { id: 'guard_port' };
  const validMapId = 'first_island';
  const validPlayer = { flags: {}, inventory: {} };
  const validDefeated = [];

  // 1. 不正な npc
  [null, undefined, 123, 'guard_port', []].forEach((invalidNpc, idx) => {
    assert.throws(
      () => evaluateNpcActiveState(invalidNpc, validMapId, validPlayer, validDefeated),
      Error,
      `C-1-${idx + 1}: 不正なnpc引数は例外をスローしなければなりません`
    );
    pass();
  });

  // 2. 不正な npc.id
  [{}, { id: null }, { id: undefined }, { id: 123 }, { id: '' }].forEach((invalidNpc, idx) => {
    assert.throws(
      () => evaluateNpcActiveState(invalidNpc, validMapId, validPlayer, validDefeated),
      Error,
      `C-2-${idx + 1}: 不正なnpc.idは例外をスローしなければなりません`
    );
    pass();
  });

  // 3. 不正な mapId
  [null, undefined, 123, '', {}].forEach((invalidMapId, idx) => {
    assert.throws(
      () => evaluateNpcActiveState(validNpc, invalidMapId, validPlayer, validDefeated),
      Error,
      `C-3-${idx + 1}: 不正なmapId引数は例外をスローしなければなりません`
    );
    pass();
  });

  // 4. 不正な player
  [null, undefined, 123, 'player'].forEach((invalidPlayer, idx) => {
    assert.throws(
      () => evaluateNpcActiveState(validNpc, validMapId, invalidPlayer, validDefeated),
      Error,
      `C-4-${idx + 1}: 不正なplayer引数は例外をスローしなければなりません`
    );
    pass();
  });

  // 5. 不正な defeatedBosses
  [null, undefined, 'talos', {}, 123].forEach((invalidDefeated, idx) => {
    assert.throws(
      () => evaluateNpcActiveState(validNpc, validMapId, validPlayer, invalidDefeated),
      Error,
      `C-5-${idx + 1}: 不正なdefeatedBosses引数は例外をスローしなければなりません`
    );
    pass();
  });

  return assertionsCount;
}

// 直接実行時のエントリポイント
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('tools/test_npc_active_state.mjs')) {
  const count = runNpcActiveStateTests();
  console.log(`[PASS] tools/test_npc_active_state.mjs: 全 ${count} 項目すべてのアサーションに合格しました。`);
}