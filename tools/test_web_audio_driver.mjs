import { WebAudioDriver } from '../js/drivers/audio/WebAudioDriver.js';
import { EventTypes } from '../js/engine/core/EventTypes.js';
import { EngineEventBus } from '../js/engine/core/EngineEventBus.js';

let testsRun = 0;
let testsPassed = 0;

function assert(condition, message) {
  testsRun = testsRun + 1;
  if (!condition) {
    console.error(`[FAIL] ${message}`);
    process.exit(1);
  }
  testsPassed = testsPassed + 1;
  console.log(`[PASS] ${message}`);
}

function assertThrows(fn, expectedErrorType, message) {
  testsRun = testsRun + 1;
  let threw = false;
  try {
    fn();
  } catch (err) {
    threw = true;
    if (expectedErrorType !== undefined && !(err instanceof expectedErrorType)) {
      console.error(`[FAIL] ${message} (期待された型: ${expectedErrorType.name}, 実際: ${err.constructor.name})`);
      process.exit(1);
    }
  }
  if (!threw) {
    console.error(`[FAIL] ${message} (例外がスローされませんでした)`);
    process.exit(1);
  }
  testsPassed = testsPassed + 1;
  console.log(`[PASS] ${message}`);
}

/**
 * モック SoundSystem の作成ヘルパー
 */
function createMockSound() {
  const callLog = [];
  const seList = [
    'playFootstep', 'playBump', 'playTextChar', 'playCursor', 'playCancel',
    'playSubmit', 'playStairs', 'playChest', 'playEncounter', 'playAttack',
    'playPoisonDamage', 'playEscape', 'playVictory', 'playHeal', 'playInn',
    'playBuy', 'playMagic'
  ];

  const mock = {
    callLog: callLog,
    playBgm: (key) => callLog.push({ method: 'playBgm', arg: key }),
    stopBgm: () => callLog.push({ method: 'stopBgm' }),
  };

  for (let i = 0; i < seList.length; i = i + 1) {
    const method = seList[i];
    mock[method] = () => callLog.push({ method: method });
  }

  return mock;
}

console.log('=== [Gate 2: WebAudioDriver 単体テスト 開始] ===');

// 1. コンストラクタ引数の型検証（異常系）
assertThrows(() => new WebAudioDriver(null, {}), TypeError, 'null の eventBus は拒絶される');
assertThrows(() => new WebAudioDriver({}, {}), TypeError, 'on メソッドのない eventBus は拒絶される');
assertThrows(() => new WebAudioDriver({ on: () => {} }, null), TypeError, 'null の soundInstance は拒絶される');

// 2. 購読とBGM再生・停止
{
  const bus = new EngineEventBus();
  const sound = createMockSound();
  const driver = new WebAudioDriver(bus, sound);

  driver.subscribe();

  // 文字列指定による BGM 再生
  bus.emit(EventTypes.SYSTEM.AUDIO_PLAY_BGM, 'battle');
  assert(sound.callLog.length === 1, 'BGM再生イベントが発火した');
  assert(sound.callLog[0].method === 'playBgm' && sound.callLog[0].arg === 'battle', 'playBgm("battle") が呼び出された');

  // オブジェクト指定（bgm プロパティ）による BGM 再生
  bus.emit(EventTypes.SYSTEM.AUDIO_PLAY_BGM, { bgm: 'field' });
  assert(sound.callLog.length === 2, 'オブジェクト形式のBGM再生イベントが発火した');
  assert(sound.callLog[1].method === 'playBgm' && sound.callLog[1].arg === 'field', 'playBgm("field") が呼び出された');

  // BGM 停止
  bus.emit(EventTypes.SYSTEM.AUDIO_STOP_BGM);
  assert(sound.callLog.length === 3, 'BGM停止イベントが発火した');
  assert(sound.callLog[2].method === 'stopBgm', 'stopBgm() が呼び出された');

  driver.unsubscribe();
}

// 3. 全17種 SE の完全マッピング検証
{
  const seKeys = [
    { key: 'footstep', expectedMethod: 'playFootstep' },
    { key: 'bump', expectedMethod: 'playBump' },
    { key: 'textChar', expectedMethod: 'playTextChar' },
    { key: 'cursor', expectedMethod: 'playCursor' },
    { key: 'cancel', expectedMethod: 'playCancel' },
    { key: 'submit', expectedMethod: 'playSubmit' },
    { key: 'stairs', expectedMethod: 'playStairs' },
    { key: 'chest', expectedMethod: 'playChest' },
    { key: 'encounter', expectedMethod: 'playEncounter' },
    { key: 'attack', expectedMethod: 'playAttack' },
    { key: 'poisonDamage', expectedMethod: 'playPoisonDamage' },
    { key: 'escape', expectedMethod: 'playEscape' },
    { key: 'victory', expectedMethod: 'playVictory' },
    { key: 'heal', expectedMethod: 'playHeal' },
    { key: 'inn', expectedMethod: 'playInn' },
    { key: 'buy', expectedMethod: 'playBuy' },
    { key: 'magic', expectedMethod: 'playMagic' },
  ];

  const bus = new EngineEventBus();
  const sound = createMockSound();
  const driver = new WebAudioDriver(bus, sound);
  driver.subscribe();

  for (let i = 0; i < seKeys.length; i = i + 1) {
    const item = seKeys[i];
    sound.callLog.length = 0;

    // 文字列ペイロード
    bus.emit(EventTypes.SYSTEM.AUDIO_PLAY_SE, item.key);
    assert(sound.callLog.length === 1 && sound.callLog[0].method === item.expectedMethod, `SE "${item.key}" が ${item.expectedMethod} を呼び出した (文字列形式)`);

    sound.callLog.length = 0;

    // オブジェクトペイロード ({ se: key })
    bus.emit(EventTypes.SYSTEM.AUDIO_PLAY_SE, { se: item.key });
    assert(sound.callLog.length === 1 && sound.callLog[0].method === item.expectedMethod, `SE "${item.key}" が ${item.expectedMethod} を呼び出した (オブジェクト形式)`);
  }

  driver.unsubscribe();
}

// 4. unsubscribe 後の動作検証（イベントが遮断されること）
{
  const bus = new EngineEventBus();
  const sound = createMockSound();
  const driver = new WebAudioDriver(bus, sound);

  driver.subscribe();
  driver.unsubscribe();

  bus.emit(EventTypes.SYSTEM.AUDIO_PLAY_SE, 'attack');
  bus.emit(EventTypes.SYSTEM.AUDIO_PLAY_BGM, 'battle');
  bus.emit(EventTypes.SYSTEM.AUDIO_STOP_BGM);

  assert(sound.callLog.length === 0, 'unsubscribe 後はイベントを受信しない');
}

// 5. 異常系（未定義 SE・不正引数の例外送出）
{
  const bus = new EngineEventBus();
  const sound = createMockSound();
  const driver = new WebAudioDriver(bus, sound);
  driver.subscribe();

  assertThrows(() => bus.emit(EventTypes.SYSTEM.AUDIO_PLAY_SE, 'unknown_se_key'), Error, '未定義の SE キーは Error をスローする');
  assertThrows(() => bus.emit(EventTypes.SYSTEM.AUDIO_PLAY_SE, 12345), TypeError, '不正な型の SE ペイロードは TypeError をスローする');
  assertThrows(() => bus.emit(EventTypes.SYSTEM.AUDIO_PLAY_BGM, null), TypeError, '不正な型の BGM ペイロードは TypeError をスローする');

  driver.unsubscribe();
}

console.log(`\n=== [Gate 2: PASS] 全 ${testsRun} 件中 ${testsPassed} 件のテストに成功しました ===`);
process.exit(0);