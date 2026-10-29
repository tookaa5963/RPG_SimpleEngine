import assert from 'node:assert';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const targetRelPath = process.argv[2] ? process.argv[2] : 'ai_staging/js/engine/data/DataRepository.js';
const targetFullPath = path.resolve(process.cwd(), targetRelPath);
const moduleUrl = pathToFileURL(targetFullPath).href;

console.log(`[Gate 2] Testing DataRepository from: ${targetRelPath}`);

const { DataRepository } = await import(moduleUrl);

let testCount = 0;
function test(name, fn) {
  testCount += 1;
  try {
    fn();
    console.log(`  ✓ Case ${testCount}: ${name}`);
  } catch (err) {
    console.error(`  ✗ Case ${testCount} FAILED: ${name}`);
    throw err;
  }
}

// 1. 初期状態
test('初期状態ではカテゴリが存在せず、全件取得は空配列を返す', () => {
  const repo = new DataRepository();
  assert.strictEqual(repo.getCategories().length, 0);
  assert.deepStrictEqual(repo.getAll('items'), []);
  assert.strictEqual(repo.has('items', 'herb'), false);
});

// 2. 単一登録と取得
test('単一エントリの登録と取得が正常に行える', () => {
  const repo = new DataRepository();
  const herbData = { id: 'herb', name: '薬草', price: 5 };
  repo.register('items', 'herb', herbData);

  assert.strictEqual(repo.has('items', 'herb'), true);
  assert.strictEqual(repo.get('items', 'herb'), herbData);
  assert.deepStrictEqual(repo.getCategories(), ['items']);
});

// 3. 未登録 ID のフェイルファスト例外
test('未登録 ID を取得しようとした際に例外がスローされる', () => {
  const repo = new DataRepository();
  repo.register('items', 'herb', { id: 'herb' });

  assert.throws(() => {
    repo.get('items', 'unknown_item');
  }, /Data not found for id: unknown_item/);
});

// 4. 未登録カテゴリのフェイルファスト例外
test('未登録カテゴリを取得しようとした際に例外がスローされる', () => {
  const repo = new DataRepository();
  assert.throws(() => {
    repo.get('weapons', 'sword');
  }, /Category not found: weapons/);
});

// 5. 配列形式での一括登録 (registerAll)
test('配列形式での一括登録が正常に行える', () => {
  const repo = new DataRepository();
  const spells = [
    { id: 'hoimi', mp: 3 },
    { id: 'mera', mp: 2 }
  ];
  repo.registerAll('spells', spells);

  assert.strictEqual(repo.has('spells', 'hoimi'), true);
  assert.strictEqual(repo.has('spells', 'mera'), true);
  assert.strictEqual(repo.get('spells', 'hoimi').mp, 3);
  assert.strictEqual(repo.getAll('spells').length, 2);
});

// 6. オブジェクト辞書形式での一括登録 (registerAll)
test('オブジェクト辞書形式での一括登録が正常に行える', () => {
  const repo = new DataRepository();
  const monsterDict = {
    slime: { name: 'スライム', hp: 8 },
    goblin: { name: 'ゴブリン', hp: 15 }
  };
  repo.registerAll('monsters', monsterDict);

  assert.strictEqual(repo.has('monsters', 'slime'), true);
  assert.strictEqual(repo.has('monsters', 'goblin'), true);
  assert.strictEqual(repo.get('monsters', 'slime').hp, 8);
  assert.strictEqual(repo.getAll('monsters').length, 2);
});

// 7. getAll の取得結果
test('getAll で登録済みオブジェクトの全件配列を取得できる', () => {
  const repo = new DataRepository();
  const item1 = { id: 'herb' };
  const item2 = { id: 'key' };
  repo.register('items', 'herb', item1);
  repo.register('items', 'key', item2);

  const allItems = repo.getAll('items');
  assert.strictEqual(allItems.length, 2);
  assert.strictEqual(allItems[0], item1);
  assert.strictEqual(allItems[1], item2);
});

// 8. clear による全消去
test('clear メソッドで全カテゴリおよびデータが初期化される', () => {
  const repo = new DataRepository();
  repo.register('items', 'herb', { id: 'herb' });
  repo.register('spells', 'hoimi', { id: 'hoimi' });

  assert.strictEqual(repo.getCategories().length, 2);
  repo.clear();
  assert.strictEqual(repo.getCategories().length, 0);
  assert.strictEqual(repo.has('items', 'herb'), false);
  assert.strictEqual(repo.has('spells', 'hoimi'), false);
});

// 9. 不正引数の型・境界検証（フェイルファスト）
test('不正な引数が指定された場合に即座に例外をスローする', () => {
  const repo = new DataRepository();

  // category 不正
  assert.throws(() => repo.register('', 'id', {}), /category must not be empty/);
  assert.throws(() => repo.register(null, 'id', {}), /TypeError/);

  // id 不正
  assert.throws(() => repo.register('cat', '', {}), /id must not be empty/);
  assert.throws(() => repo.register('cat', 123, {}), /TypeError/);

  // data 不正
  assert.throws(() => repo.register('cat', 'id', null), /TypeError/);
  assert.throws(() => repo.register('cat', 'id', 'not-object'), /TypeError/);

  // registerAll 不正要素
  assert.throws(() => repo.registerAll('cat', [{ no_id: true }]), /TypeError/);
  assert.throws(() => repo.registerAll('cat', null), /TypeError/);
});

console.log(`\nAll ${testCount} tests PASSED successfully.`);