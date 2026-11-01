import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// 1. レガシー依存（sound.js）のトップレベル初期化を通過させるための最小限ブラウザAPIモック
if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  };
}

if (typeof globalThis.document === 'undefined') {
  globalThis.document = {
    createElement: (tag) => {
      return {
        tagName: tag.toUpperCase(),
        loop: false,
        volume: 1,
        src: '',
        type: '',
        children: [],
        appendChild(child) {
          this.children.push(child);
          return child;
        }
      };
    }
  };
}

// 2. モック初期化完了後に動的インポートでモジュールを解決
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const targetRelPath = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(__dirname, '../js/events.js');
const moduleUrl = pathToFileURL(targetRelPath).href;
const { resolveCurrentObjectiveKey } = await import(moduleUrl);

let testCount = 0;
let failCount = 0;

function assertEqual(actual, expected, description) {
  testCount++;
  if (actual !== expected) {
    console.error(`[FAIL] ${description} -> 期待値: "${expected}", 実際値: "${actual}"`);
    failCount++;
  } else {
    console.log(`[PASS] ${description}`);
  }
}

function assertThrows(fn, description) {
  testCount++;
  let threw = false;
  try {
    fn();
  } catch (e) {
    threw = true;
  }
  if (!threw) {
    console.error(`[FAIL] ${description} -> 例外がスローされませんでした`);
    failCount++;
  } else {
    console.log(`[PASS] ${description}`);
  }
}

console.log(`=== Step Pre-1a: resolveCurrentObjectiveKey 単体テスト開始 (対象: ${targetRelPath}) ===`);

// 1. 初期状態
assertEqual(
  resolveCurrentObjectiveKey({ flags: {}, inventory: {}, equipment: {} }),
  'talk_sister',
  'Case 01: 初期状態（姉未会話）'
);

// 2. 姉会話後
assertEqual(
  resolveCurrentObjectiveKey({ flags: { talkedToSister: true }, inventory: {}, equipment: {} }),
  'find_scholar',
  'Case 02: 姉会話済み・学者未会話'
);

// 3. 記念碑調査（鍵未所持）
assertEqual(
  resolveCurrentObjectiveKey({
    flags: { talkedToSister: true, talkedToScholar: true },
    inventory: {},
    equipment: {}
  }),
  'investigate_monument',
  'Case 03: 学者会話済み・記念碑報告前（鍵なし）'
);

// 4. 記念碑報告（antique_key 所持）
assertEqual(
  resolveCurrentObjectiveKey({
    flags: { talkedToSister: true, talkedToScholar: true },
    inventory: { antique_key: 1 },
    equipment: {}
  }),
  'report_scholar',
  'Case 04a: 学者会話済み・記念碑報告前（antique_key 所持）'
);

// 4b. 記念碑報告（key 所持）
assertEqual(
  resolveCurrentObjectiveKey({
    flags: { talkedToSister: true, talkedToScholar: true },
    inventory: { key: 1 },
    equipment: {}
  }),
  'report_scholar',
  'Case 04b: 学者会話済み・記念碑報告前（key 所持）'
);

// 5. 検問所・少女救出分岐（hasPass: false）
const basePassFlags = { talkedToSister: true, talkedToScholar: true, reportedMonumentToScholar: true };

assertEqual(
  resolveCurrentObjectiveKey({ flags: { ...basePassFlags }, inventory: {}, equipment: {} }),
  'cross_checkpoint',
  'Case 05a: 通行手形なし（初期）'
);

assertEqual(
  resolveCurrentObjectiveKey({ flags: { ...basePassFlags, heardPassRequirement: true }, inventory: {}, equipment: {} }),
  'consult_mayor',
  'Case 05b: 通行手形要件聴取済み（町長に相談）'
);

assertEqual(
  resolveCurrentObjectiveKey({
    flags: { ...basePassFlags, heardPassRequirement: true, kidnappingEventStarted: true },
    inventory: {},
    equipment: {}
  }),
  'rescue_girl',
  'Case 05c: 誘拐事件発生（少女救出）'
);

assertEqual(
  resolveCurrentObjectiveKey({
    flags: { ...basePassFlags, heardPassRequirement: true, kidnappingEventStarted: true, rescuedGirl: true },
    inventory: {},
    equipment: {}
  }),
  'return_girl',
  'Case 05d: 少女救出完了（町長宅へ送還）'
);

// 6. 図書館へ（hasPass: true）
const baseLibraryFlags = { ...basePassFlags, hasPass: true };

assertEqual(
  resolveCurrentObjectiveKey({ flags: { ...baseLibraryFlags }, inventory: {}, equipment: {} }),
  'go_library',
  'Case 06: 通行手形所持・ティソナ未聴取（図書館へ）'
);

// 7. 神殿・恋人の指輪分岐（heardOfTizona: true）
const baseRingFlags = { ...baseLibraryFlags, heardOfTizona: true };

assertEqual(
  resolveCurrentObjectiveKey({ flags: { ...baseRingFlags }, inventory: {}, equipment: {} }),
  'find_temple',
  'Case 07a: ティソナ聴取済み・エルフクエスト未開始（神殿捜索）'
);

assertEqual(
  resolveCurrentObjectiveKey({ flags: { ...baseRingFlags, elfQuestStarted: true }, inventory: {}, equipment: {} }),
  'recover_ring',
  'Case 07b: エルフクエスト開始・指輪未所持（指輪奪還）'
);

assertEqual(
  resolveCurrentObjectiveKey({
    flags: { ...baseRingFlags, elfQuestStarted: true },
    inventory: { lovers_ring: 1 },
    equipment: {}
  }),
  'deliver_ring',
  'Case 07c: エルフクエスト開始・指輪所持（指輪届出）'
);

// 8. 水の盾入手
const baseShieldFlags = { ...baseRingFlags, returnedLoversRing: true };

assertEqual(
  resolveCurrentObjectiveKey({ flags: { ...baseShieldFlags }, inventory: {}, equipment: {} }),
  'obtain_water_shield',
  'Case 08: 指輪返却完了・水の盾未所持/未装備'
);

// 9. コラーダ入手（水の盾所持・装備バイパス）
assertEqual(
  resolveCurrentObjectiveKey({
    flags: { ...baseShieldFlags, receivedWaterShield: true },
    inventory: {},
    equipment: {}
  }),
  'obtain_corrada',
  'Case 09a: 水の盾受領フラグあり・コラーダ未所持'
);

assertEqual(
  resolveCurrentObjectiveKey({
    flags: { ...baseShieldFlags },
    inventory: { water_shield: 1 },
    equipment: {}
  }),
  'obtain_corrada',
  'Case 09b: 水の盾インベントリ所持・コラーダ未所持'
);

assertEqual(
  resolveCurrentObjectiveKey({
    flags: { ...baseShieldFlags },
    inventory: {},
    equipment: { shield: 'water_shield' }
  }),
  'obtain_corrada',
  'Case 09c: 水の盾装備中・コラーダ未所持'
);

// 10. ドラゴンアーマー・黒リザードマン・ケルベロス分岐
const baseArmorFlags = { ...baseShieldFlags, receivedWaterShield: true };
const baseArmorInv = { corrada: 1 };

assertEqual(
  resolveCurrentObjectiveKey({ flags: { ...baseArmorFlags }, inventory: { ...baseArmorInv }, equipment: {} }),
  'seek_armor_clues',
  'Case 10a: コラーダ所持・黒リザードマン未開始・ドワーフ未聴取'
);

assertEqual(
  resolveCurrentObjectiveKey({
    flags: { ...baseArmorFlags, heardOfDwarf: true },
    inventory: { ...baseArmorInv },
    equipment: {}
  }),
  'seek_dwarf_village',
  'Case 10b: コラーダ所持・ドワーフ聴取済み（ドワーフの村へ）'
);

assertEqual(
  resolveCurrentObjectiveKey({
    flags: { ...baseArmorFlags, heardOfDwarf: true, blackLizardQuestStarted: true },
    inventory: { ...baseArmorInv },
    equipment: {}
  }),
  'defeat_black_lizard',
  'Case 10c: 黒リザードマン討伐クエスト開始（討伐要請）'
);

assertEqual(
  resolveCurrentObjectiveKey({
    flags: { ...baseArmorFlags, heardOfDwarf: true, blackLizardQuestStarted: true, blackLizardDefeated: true },
    inventory: { ...baseArmorInv },
    equipment: {}
  }),
  'report_black_lizard',
  'Case 10d: 黒リザードマン討伐済み・未報告（討伐報告）'
);

assertEqual(
  resolveCurrentObjectiveKey({
    flags: {
      ...baseArmorFlags,
      heardOfDwarf: true,
      blackLizardQuestStarted: true,
      blackLizardDefeated: true,
      blackLizardQuestCompleted: true
    },
    inventory: { ...baseArmorInv },
    equipment: {}
  }),
  'consult_blacksmith',
  'Case 10e: 黒リザードマン報告完了・ケルベロス未開始（鍛冶屋相談）'
);

assertEqual(
  resolveCurrentObjectiveKey({
    flags: {
      ...baseArmorFlags,
      heardOfDwarf: true,
      blackLizardQuestStarted: true,
      blackLizardDefeated: true,
      blackLizardQuestCompleted: true,
      cerberusQuestStarted: true
    },
    inventory: { ...baseArmorInv },
    equipment: {}
  }),
  'defeat_cerberus',
  'Case 10f: ケルベロスクエスト開始・たてがみ未所持（ケルベロス討伐）'
);

assertEqual(
  resolveCurrentObjectiveKey({
    flags: {
      ...baseArmorFlags,
      heardOfDwarf: true,
      blackLizardQuestStarted: true,
      blackLizardDefeated: true,
      blackLizardQuestCompleted: true,
      cerberusQuestStarted: true
    },
    inventory: { ...baseArmorInv, cerberus_mane: 1 },
    equipment: {}
  }),
  'deliver_mane',
  'Case 10g: ケルベロス討伐・たてがみ所持（たてがみ納品）'
);

// 11. 最終決戦（黒竜討伐）
assertEqual(
  resolveCurrentObjectiveKey({
    flags: { ...baseArmorFlags },
    inventory: { corrada: 1, dragon_armor: 1 },
    equipment: {}
  }),
  'defeat_black_dragon',
  'Case 11a: 全装備インベントリ所持（黒竜討伐）'
);

assertEqual(
  resolveCurrentObjectiveKey({
    flags: { ...baseArmorFlags },
    inventory: {},
    equipment: { shield: 'water_shield', weapon: 'corrada', armor: 'dragon_armor' }
  }),
  'defeat_black_dragon',
  'Case 11b: 全装備装備中（黒竜討伐）'
);

// 12. 異常系（フェイルファスト検証）
assertThrows(
  () => resolveCurrentObjectiveKey(null),
  'Case 12a: null 引数に対する例外スロー'
);

assertThrows(
  () => resolveCurrentObjectiveKey(undefined),
  'Case 12b: undefined 引数に対する例外スロー'
);

assertThrows(
  () => resolveCurrentObjectiveKey('invalid_string'),
  'Case 12c: 文字列引数に対する例外スロー'
);

assertThrows(
  () => resolveCurrentObjectiveKey(12345),
  'Case 12d: 数値引数に対する例外スロー'
);

console.log(`\n=== テスト完了: 全 ${testCount} 項目中 失敗: ${failCount} 件 ===`);

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}