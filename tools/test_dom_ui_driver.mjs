import assert from 'assert';
import path from 'path';
import { pathToFileURL } from 'url';
import { EngineEventBus } from '../js/engine/core/EngineEventBus.js';
import { EventTypes } from '../js/engine/core/EventTypes.js';

let targetPath = '../js/drivers/ui/DomUiDriver.js';
if (process.argv[2]) {
  targetPath = path.resolve(process.argv[2]);
}

const moduleUrl = targetPath.startsWith('file:') ? targetPath : pathToFileURL(path.resolve(targetPath)).href;
const { DomUiDriver } = await import(moduleUrl);

console.log('[Test] DomUiDriver 単体機能検証を開始します: ' + targetPath);

function createMockElements() {
  return {
    hp: { textContent: '' },
    hpBar: { style: { width: '', backgroundColor: '' } },
    mp: { textContent: '' },
    mpBar: { style: { width: '', backgroundColor: '' } }
  };
}

let testCount = 0;

// Test 1: コンストラクタの型検証
{
  assert.throws(() => new DomUiDriver(null, {}), TypeError);
  assert.throws(() => new DomUiDriver({}, {}), TypeError);
  const bus = new EngineEventBus();
  assert.throws(() => new DomUiDriver(bus, null), TypeError);
  assert.throws(() => new DomUiDriver(bus, 123), TypeError);
  testCount += 1;
}

// Test 2: 正常生成および elements の展開検証
{
  const bus = new EngineEventBus();
  const mockElements = createMockElements();
  const driverDirect = new DomUiDriver(bus, mockElements);
  assert.strictEqual(driverDirect.elements, mockElements);

  const mockUiManager = { elements: mockElements };
  const driverFromManager = new DomUiDriver(bus, mockUiManager);
  assert.strictEqual(driverFromManager.elements, mockElements);
  testCount += 1;
}

// Test 3: HP変更イベントの購読とDOM更新
{
  const bus = new EngineEventBus();
  const elements = createMockElements();
  const driver = new DomUiDriver(bus, elements);
  driver.subscribe();

  bus.emit(EventTypes.ACTOR.HP_CHANGED, {
    actorId: 'player',
    currentHp: 80,
    maxHp: 100,
    delta: -20
  });

  assert.strictEqual(elements.hp.textContent, '80 / 100');
  assert.strictEqual(elements.hpBar.style.width, '80.0%');
  assert.strictEqual(elements.hpBar.style.backgroundColor, '#2ecc71');
  testCount += 1;
}

// Test 4: HP減少時のカラー閾値（イエロー・レッド）検証
{
  const bus = new EngineEventBus();
  const elements = createMockElements();
  const driver = new DomUiDriver(bus, elements);
  driver.subscribe();

  // 50% (黄色)
  bus.emit(EventTypes.ACTOR.HP_CHANGED, { actorId: 'player', currentHp: 50, maxHp: 100, delta: -30 });
  assert.strictEqual(elements.hpBar.style.width, '50.0%');
  assert.strictEqual(elements.hpBar.style.backgroundColor, '#f1c40f');

  // 25% (赤色)
  bus.emit(EventTypes.ACTOR.HP_CHANGED, { actorId: 'player', currentHp: 25, maxHp: 100, delta: -25 });
  assert.strictEqual(elements.hpBar.style.width, '25.0%');
  assert.strictEqual(elements.hpBar.style.backgroundColor, '#e74c3c');
  testCount += 1;
}

// Test 5: MP変更イベントの購読とDOM更新
{
  const bus = new EngineEventBus();
  const elements = createMockElements();
  const driver = new DomUiDriver(bus, elements);
  driver.subscribe();

  bus.emit(EventTypes.ACTOR.MP_CHANGED, {
    actorId: 'player',
    currentMp: 15,
    maxMp: 30,
    delta: -5
  });

  assert.strictEqual(elements.mp.textContent, '15 / 30');
  assert.strictEqual(elements.mpBar.style.width, '50.0%');
  assert.strictEqual(elements.mpBar.style.backgroundColor, '#3498db');
  testCount += 1;
}

// Test 6: 状態異常（毒）付与および解除のハンドリング
{
  const bus = new EngineEventBus();
  const elements = createMockElements();
  const driver = new DomUiDriver(bus, elements);
  driver.subscribe();

  // 毒付与
  bus.emit(EventTypes.ACTOR.STATUS_ADDED, { actorId: 'player', statusId: 'poison' });
  assert.strictEqual(driver.isPoisoned, true);
  assert.strictEqual(elements.hpBar.style.backgroundColor, '#9b59b6');

  // 毒状態でのHP更新（バッジ反映）
  bus.emit(EventTypes.ACTOR.HP_CHANGED, { actorId: 'player', currentHp: 70, maxHp: 100, delta: -10 });
  assert.strictEqual(elements.hp.textContent, '70 / 100 [毒]');
  assert.strictEqual(elements.hpBar.style.backgroundColor, '#9b59b6');

  // 毒解除
  bus.emit(EventTypes.ACTOR.STATUS_REMOVED, { actorId: 'player', statusId: 'poison' });
  assert.strictEqual(driver.isPoisoned, false);
  assert.strictEqual(elements.hpBar.style.backgroundColor, '#2ecc71');
  testCount += 1;
}

// Test 7: 死亡イベント（DIED）のハンドリング
{
  const bus = new EngineEventBus();
  const elements = createMockElements();
  const driver = new DomUiDriver(bus, elements);
  driver.subscribe();

  bus.emit(EventTypes.ACTOR.DIED, { actorId: 'player' });
  assert.strictEqual(elements.hp.textContent, '0 / 1');
  assert.strictEqual(elements.hpBar.style.width, '0.0%');
  assert.strictEqual(elements.hpBar.style.backgroundColor, '#e74c3c');
  testCount += 1;
}

// Test 8: unsubscribe による購読解除の検証
{
  const bus = new EngineEventBus();
  const elements = createMockElements();
  const driver = new DomUiDriver(bus, elements);
  driver.subscribe();
  driver.unsubscribe();

  bus.emit(EventTypes.ACTOR.HP_CHANGED, { actorId: 'player', currentHp: 99, maxHp: 100, delta: 0 });
  assert.strictEqual(elements.hp.textContent, '');
  testCount += 1;
}

console.log(`[Pass] DomUiDriver 全 ${testCount} 項目をクリアしました (Exit Code 0)`);