// FILE_ENTRY: tools/test_menu_state_machine.mjs
/**
 * tools/test_menu_state_machine.mjs
 * Step 5-3a: MenuStateMachine（メニュー階層・カーソル純粋ステートマシン）単体・契約検証テスト
 *
 * 検証項目（全8項目）:
 *  1. 静的契約検証（Core層規約: ブラウザAPI禁止・Driver依存禁止・禁止演算子排除・固有名詞ハードコード禁止）
 *  2. 正常系: 初期状態および open() による完全リセット
 *  3. 正常系: ROOT フェーズのカーソル循環・選択・終了確認遷移・閉じる要求
 *  4. 正常系: QUIT_CONFIRM フェーズの4方向トグルおよび CANCEL 時 SE ('cancel') 検証
 *  5. 正常系: ITEM_SELECT フェーズのモード別分岐（magic / equip / item）およびキャンセル復帰
 *  6. 正常系: ITEM_ACTION および DROP_CONFIRM フェーズの階層往復と左右キー無視検証
 *  7. 正常系: setPhase() による外部フェーズ復元
 *  8. 異常系・境界値: 不正引数・不正状態遷移・空リスト操作に対するフェイルファスト例外検証
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { MenuStateMachine } from '../js/engine/menu/MenuStateMachine.js';

/**
 * コメントおよび文字列リテラルを除去して実コードの演算子・識別子を検証するためのヘルパー
 */
function stripCommentsAndStrings(source) {
  let result = '';
  let i = 0;
  const len = source.length;
  let state = 'NORMAL';
  let quoteChar = '';

  while (i < len) {
    const ch = source[i];
    const next = i + 1 < len ? source[i + 1] : '';

    if (state === 'NORMAL') {
      if (ch === '/' && next === '/') {
        state = 'LINE_COMMENT';
        i += 2;
      } else if (ch === '/' && next === '*') {
        state = 'BLOCK_COMMENT';
        i += 2;
      } else if (ch === '\'' || ch === '"' || ch === '`') {
        state = 'STRING';
        quoteChar = ch;
        result += '""';
        i += 1;
      } else {
        result += ch;
        i += 1;
      }
    } else if (state === 'LINE_COMMENT') {
      if (ch === '\n') {
        state = 'NORMAL';
        result += '\n';
      }
      i += 1;
    } else if (state === 'BLOCK_COMMENT') {
      if (ch === '*' && next === '/') {
        state = 'NORMAL';
        i += 2;
      } else {
        i += 1;
      }
    } else if (state === 'STRING') {
      if (ch === '\\') {
        i += 2;
      } else if (ch === quoteChar) {
        state = 'NORMAL';
        i += 1;
      } else {
        i += 1;
      }
    }
  }
  return result;
}

export function runMenuStateMachineTests() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const projectRoot = path.resolve(__dirname, '..');
  const targetPath = path.resolve(projectRoot, 'js/engine/menu/MenuStateMachine.js');

  // ---------------------------------------------------------------------------
  // 1. 静的契約検証（Core層規約）
  // ---------------------------------------------------------------------------
  assert.strictEqual(
    fs.existsSync(targetPath),
    true,
    '契約違反: js/engine/menu/MenuStateMachine.js が存在しません'
  );

  const rawSource = fs.readFileSync(targetPath, 'utf8');
  const codeOnly = stripCommentsAndStrings(rawSource);

  // 1-1. ブラウザAPI直接参照の禁止
  const forbiddenBrowserApis = [
    /\bwindow\b/,
    /\bdocument\b/,
    /\bHTMLCanvasElement\b/,
    /\bAudioContext\b/,
    /\blocalStorage\b/,
    /\bsessionStorage\b/,
    /\bnavigator\b/
  ];
  for (let i = 0; i < forbiddenBrowserApis.length; i += 1) {
    const pattern = forbiddenBrowserApis[i];
    assert.strictEqual(
      pattern.test(codeOnly),
      false,
      `契約違反: Core層で禁止されているブラウザAPIパターン (${pattern}) が検出されました`
    );
  }

  // 1-2. Platform Driver への依存禁止
  assert.strictEqual(
    /drivers\//.test(rawSource),
    false,
    '契約違反: Core層から js/drivers/ への参照・import は禁止されています'
  );

  // 1-3. 禁止演算子（||, ?:, ??）の排除
  assert.strictEqual(
    codeOnly.includes('||'),
    false,
    '契約違反: Core層で禁止されている論理和演算子 (||) が検出されました'
  );
  assert.strictEqual(
    codeOnly.includes('??'),
    false,
    '契約違反: Core層で禁止されているNull合体演算子 (??) が検出されました'
  );
  assert.strictEqual(
    codeOnly.includes('?'),
    false,
    '契約違反: Core層で禁止されている三項演算子 (?:) または ? 演算子が検出されました'
  );

  // 1-4. 特定ゲーム固有名詞IDのハードコード禁止
  const forbiddenGameIds = ['herb', 'magic_water', 'hoimi', 'copper_sword'];
  for (let i = 0; i < forbiddenGameIds.length; i += 1) {
    const gameId = forbiddenGameIds[i];
    assert.strictEqual(
      rawSource.includes(`'${gameId}'`) || rawSource.includes(`"${gameId}"`),
      false,
      `契約違反: Core層に特定ゲーム識別子 (${gameId}) がハードコードされています`
    );
  }

  // ---------------------------------------------------------------------------
  // 2. 正常系: 初期状態および open() による完全リセット
  // ---------------------------------------------------------------------------
  const sm = new MenuStateMachine();
  assert.strictEqual(sm.phase, 'ROOT');
  assert.strictEqual(sm.rootIndex, 0);
  assert.deepStrictEqual(sm.itemList, []);
  assert.strictEqual(sm.itemIndex, 0);
  assert.strictEqual(sm.currentMode, null);
  assert.strictEqual(sm.actionIndex, 0);
  assert.strictEqual(sm.selectedItem, null);
  assert.strictEqual(sm.dropConfirmIndex, 1);
  assert.strictEqual(sm.quitConfirmIndex, 1);

  // 状態を深く変更した後に open() で全項目が初期状態へ戻ることを検証
  sm.handleCommand('DOWN');
  sm.enterItemSelect('item', [
    { id: 'herb', name: 'やくそう' },
    { id: 'cancel', name: 'もどる' }
  ]);
  sm.handleCommand('CONFIRM'); // ITEM_ACTION へ遷移
  sm.enterDropConfirm(); // DROP_CONFIRM へ遷移
  sm.handleCommand('UP'); // dropConfirmIndex -> 0

  const openRes = sm.open();
  assert.deepStrictEqual(openRes, {
    phase: 'ROOT',
    se: null,
    intent: 'OPENED',
    payload: null
  });
  assert.strictEqual(sm.phase, 'ROOT');
  assert.strictEqual(sm.rootIndex, 0);
  assert.deepStrictEqual(sm.itemList, []);
  assert.strictEqual(sm.itemIndex, 0);
  assert.strictEqual(sm.currentMode, null);
  assert.strictEqual(sm.actionIndex, 0);
  assert.strictEqual(sm.selectedItem, null);
  assert.strictEqual(sm.dropConfirmIndex, 1);
  assert.strictEqual(sm.quitConfirmIndex, 1);

  // ---------------------------------------------------------------------------
  // 3. 正常系: ROOT フェーズのカーソル循環と選択・終了
  // ---------------------------------------------------------------------------
  // UP で 0 -> 6 ラップアラウンド
  const rootUpRes = sm.handleCommand('UP');
  assert.deepStrictEqual(rootUpRes, {
    phase: 'ROOT',
    se: 'submit',
    intent: 'CURSOR_MOVED',
    payload: { index: 6 }
  });
  assert.strictEqual(sm.rootIndex, 6);

  // DOWN で 6 -> 0 ラップアラウンド
  const rootDownRes = sm.handleCommand('DOWN');
  assert.deepStrictEqual(rootDownRes, {
    phase: 'ROOT',
    se: 'submit',
    intent: 'CURSOR_MOVED',
    payload: { index: 0 }
  });
  assert.strictEqual(sm.rootIndex, 0);

  // LEFT / RIGHT は無視（状態不変・SEなし）
  assert.deepStrictEqual(sm.handleCommand('LEFT'), {
    phase: 'ROOT',
    se: null,
    intent: 'NONE',
    payload: null
  });
  assert.deepStrictEqual(sm.handleCommand('RIGHT'), {
    phase: 'ROOT',
    se: null,
    intent: 'NONE',
    payload: null
  });
  assert.strictEqual(sm.rootIndex, 0);

  // rootIndex === 0..5 各位置での CONFIRM -> ROOT_SELECTED
  for (let idx = 0; idx <= 5; idx += 1) {
    const selRes = sm.handleCommand('CONFIRM');
    assert.deepStrictEqual(selRes, {
      phase: 'ROOT',
      se: 'submit',
      intent: 'ROOT_SELECTED',
      payload: { index: idx }
    });
    assert.strictEqual(sm.phase, 'ROOT');
    sm.handleCommand('DOWN');
  }

  // rootIndex === 6（やめる）での CONFIRM -> QUIT_CONFIRM 遷移
  assert.strictEqual(sm.rootIndex, 6);
  const enterQuitRes = sm.handleCommand('CONFIRM');
  assert.deepStrictEqual(enterQuitRes, {
    phase: 'QUIT_CONFIRM',
    se: 'submit',
    intent: 'ENTERED_QUIT_CONFIRM',
    payload: null
  });
  assert.strictEqual(sm.phase, 'QUIT_CONFIRM');
  assert.strictEqual(sm.quitConfirmIndex, 1);

  // ---------------------------------------------------------------------------
  // 4. 正常系: QUIT_CONFIRM フェーズのトグルとキャンセルSE
  // ---------------------------------------------------------------------------
  // UP / DOWN / LEFT / RIGHT 全方向で 1 <-> 0 トグル
  assert.deepStrictEqual(sm.handleCommand('UP'), {
    phase: 'QUIT_CONFIRM',
    se: 'submit',
    intent: 'CURSOR_MOVED',
    payload: { index: 0 }
  });
  assert.deepStrictEqual(sm.handleCommand('DOWN'), {
    phase: 'QUIT_CONFIRM',
    se: 'submit',
    intent: 'CURSOR_MOVED',
    payload: { index: 1 }
  });
  assert.deepStrictEqual(sm.handleCommand('LEFT'), {
    phase: 'QUIT_CONFIRM',
    se: 'submit',
    intent: 'CURSOR_MOVED',
    payload: { index: 0 }
  });
  assert.deepStrictEqual(sm.handleCommand('RIGHT'), {
    phase: 'QUIT_CONFIRM',
    se: 'submit',
    intent: 'CURSOR_MOVED',
    payload: { index: 1 }
  });

  // quitConfirmIndex === 1（いいえ）で CONFIRM -> ROOT 復帰（SE: 'submit'）
  const quitNoRes = sm.handleCommand('CONFIRM');
  assert.deepStrictEqual(quitNoRes, {
    phase: 'ROOT',
    se: 'submit',
    intent: 'BACK_TO_ROOT',
    payload: null
  });
  assert.strictEqual(sm.phase, 'ROOT');

  // ROOT で CANCEL -> CLOSE_MENU
  const closeMenuRes = sm.handleCommand('CANCEL');
  assert.deepStrictEqual(closeMenuRes, {
    phase: 'ROOT',
    se: 'submit',
    intent: 'CLOSE_MENU',
    payload: null
  });

  // 再度 QUIT_CONFIRM へ入り、CANCEL 押下時は SE が 'cancel' であることを検証
  sm.handleCommand('CONFIRM');
  assert.strictEqual(sm.phase, 'QUIT_CONFIRM');
  const quitCancelRes = sm.handleCommand('CANCEL');
  assert.deepStrictEqual(quitCancelRes, {
    phase: 'ROOT',
    se: 'cancel',
    intent: 'BACK_TO_ROOT',
    payload: null
  });
  assert.strictEqual(sm.phase, 'ROOT');

  // 再度 QUIT_CONFIRM へ入り、quitConfirmIndex === 0（はい）で CONFIRM -> CONFIRM_QUIT
  sm.handleCommand('CONFIRM');
  sm.handleCommand('LEFT'); // 1 -> 0
  assert.strictEqual(sm.quitConfirmIndex, 0);
  const quitYesRes = sm.handleCommand('CONFIRM');
  assert.deepStrictEqual(quitYesRes, {
    phase: 'QUIT_CONFIRM',
    se: 'submit',
    intent: 'CONFIRM_QUIT',
    payload: null
  });

  // ---------------------------------------------------------------------------
  // 5. 正常系: ITEM_SELECT のモード別分岐（magic / equip / item）
  // ---------------------------------------------------------------------------
  sm.open();

  // 5-1. magic モード（実在キー: hoimi）
  const magicItems = [
    { id: 'hoimi', name: 'ホイミ' },
    { id: 'cancel', name: 'もどる' }
  ];
  const enterMagicRes = sm.enterItemSelect('magic', magicItems);
  assert.deepStrictEqual(enterMagicRes, {
    phase: 'ITEM_SELECT',
    se: null,
    intent: 'ENTERED_ITEM_SELECT',
    payload: { mode: 'magic' }
  });
  assert.strictEqual(sm.phase, 'ITEM_SELECT');
  assert.strictEqual(sm.currentMode, 'magic');
  assert.strictEqual(sm.itemIndex, 0);

  // LEFT / RIGHT 無視
  assert.deepStrictEqual(sm.handleCommand('LEFT'), {
    phase: 'ITEM_SELECT',
    se: null,
    intent: 'NONE',
    payload: null
  });
  assert.deepStrictEqual(sm.handleCommand('RIGHT'), {
    phase: 'ITEM_SELECT',
    se: null,
    intent: 'NONE',
    payload: null
  });

  // 呪文決定 -> SELECT_MAGIC（フェーズ維持）
  const selectMagicRes = sm.handleCommand('CONFIRM');
  assert.deepStrictEqual(selectMagicRes, {
    phase: 'ITEM_SELECT',
    se: 'submit',
    intent: 'SELECT_MAGIC',
    payload: { item: { id: 'hoimi', name: 'ホイミ' } }
  });
  assert.strictEqual(sm.phase, 'ITEM_SELECT');

  // カーソル移動で末尾 cancel を選択して決定 -> ROOT 復帰
  assert.deepStrictEqual(sm.handleCommand('DOWN'), {
    phase: 'ITEM_SELECT',
    se: 'submit',
    intent: 'CURSOR_MOVED',
    payload: { index: 1 }
  });
  assert.deepStrictEqual(sm.handleCommand('CONFIRM'), {
    phase: 'ROOT',
    se: 'submit',
    intent: 'BACK_TO_ROOT',
    payload: null
  });
  assert.strictEqual(sm.phase, 'ROOT');

  // 5-2. equip モード（実在キー: copper_sword）
  const equipItems = [
    { id: 'copper_sword', name: 'どうのつるぎ' },
    { id: 'cancel', name: 'もどる' }
  ];
  const enterEquipRes = sm.enterItemSelect('equip', equipItems);
  assert.deepStrictEqual(enterEquipRes, {
    phase: 'ITEM_SELECT',
    se: null,
    intent: 'ENTERED_ITEM_SELECT',
    payload: { mode: 'equip' }
  });
  const selectEquipRes = sm.handleCommand('CONFIRM');
  assert.deepStrictEqual(selectEquipRes, {
    phase: 'ITEM_SELECT',
    se: 'submit',
    intent: 'SELECT_EQUIP',
    payload: { item: { id: 'copper_sword', name: 'どうのつるぎ' } }
  });

  // CANCEL 入力による ROOT 復帰
  assert.deepStrictEqual(sm.handleCommand('CANCEL'), {
    phase: 'ROOT',
    se: 'submit',
    intent: 'BACK_TO_ROOT',
    payload: null
  });
  assert.strictEqual(sm.phase, 'ROOT');

  // 5-3. item モード（実在キー: herb, magic_water）
  const bagItems = [
    { id: 'herb', name: 'やくそう' },
    { id: 'magic_water', name: 'まほうのせいすい' },
    { id: 'cancel', name: 'もどる' }
  ];
  sm.enterItemSelect('item', bagItems);
  // UP で 0 -> 2 ラップアラウンド、DOWN で 2 -> 0 -> 1
  assert.deepStrictEqual(sm.handleCommand('UP'), {
    phase: 'ITEM_SELECT',
    se: 'submit',
    intent: 'CURSOR_MOVED',
    payload: { index: 2 }
  });
  assert.deepStrictEqual(sm.handleCommand('DOWN'), {
    phase: 'ITEM_SELECT',
    se: 'submit',
    intent: 'CURSOR_MOVED',
    payload: { index: 0 }
  });
  assert.deepStrictEqual(sm.handleCommand('DOWN'), {
    phase: 'ITEM_SELECT',
    se: 'submit',
    intent: 'CURSOR_MOVED',
    payload: { index: 1 }
  });

  // magic_water 決定 -> ITEM_ACTION へ遷移
  const enterActionRes = sm.handleCommand('CONFIRM');
  assert.deepStrictEqual(enterActionRes, {
    phase: 'ITEM_ACTION',
    se: 'submit',
    intent: 'ENTERED_ITEM_ACTION',
    payload: { item: { id: 'magic_water', name: 'まほうのせいすい' } }
  });
  assert.strictEqual(sm.phase, 'ITEM_ACTION');
  assert.strictEqual(sm.actionIndex, 0);
  assert.deepStrictEqual(sm.selectedItem, { id: 'magic_water', name: 'まほうのせいすい' });

  // ---------------------------------------------------------------------------
  // 6. 正常系: ITEM_ACTION および DROP_CONFIRM の階層往復
  // ---------------------------------------------------------------------------
  // LEFT / RIGHT 無視
  assert.deepStrictEqual(sm.handleCommand('LEFT'), {
    phase: 'ITEM_ACTION',
    se: null,
    intent: 'NONE',
    payload: null
  });
  assert.deepStrictEqual(sm.handleCommand('RIGHT'), {
    phase: 'ITEM_ACTION',
    se: null,
    intent: 'NONE',
    payload: null
  });

  // actionIndex === 0（つかう）決定
  assert.deepStrictEqual(sm.handleCommand('CONFIRM'), {
    phase: 'ITEM_ACTION',
    se: 'submit',
    intent: 'ACTION_USE',
    payload: { item: { id: 'magic_water', name: 'まほうのせいすい' } }
  });

  // DOWN で actionIndex === 1（すてる）へ移動し決定 -> ACTION_DROP_REQUEST
  assert.deepStrictEqual(sm.handleCommand('DOWN'), {
    phase: 'ITEM_ACTION',
    se: 'submit',
    intent: 'CURSOR_MOVED',
    payload: { index: 1 }
  });
  assert.deepStrictEqual(sm.handleCommand('CONFIRM'), {
    phase: 'ITEM_ACTION',
    se: 'submit',
    intent: 'ACTION_DROP_REQUEST',
    payload: { item: { id: 'magic_water', name: 'まほうのせいすい' } }
  });

  // DOWN で actionIndex === 2（もどる）へ移動し決定 -> ITEM_SELECT 復帰
  assert.deepStrictEqual(sm.handleCommand('DOWN'), {
    phase: 'ITEM_ACTION',
    se: 'submit',
    intent: 'CURSOR_MOVED',
    payload: { index: 2 }
  });
  // さらに DOWN で 2 -> 0 ラップアラウンド、UP で 0 -> 2 ラップアラウンド確認
  assert.deepStrictEqual(sm.handleCommand('DOWN'), {
    phase: 'ITEM_ACTION',
    se: 'submit',
    intent: 'CURSOR_MOVED',
    payload: { index: 0 }
  });
  assert.deepStrictEqual(sm.handleCommand('UP'), {
    phase: 'ITEM_ACTION',
    se: 'submit',
    intent: 'CURSOR_MOVED',
    payload: { index: 2 }
  });
  assert.deepStrictEqual(sm.handleCommand('CONFIRM'), {
    phase: 'ITEM_SELECT',
    se: 'submit',
    intent: 'BACK_TO_ITEM_SELECT',
    payload: null
  });
  assert.strictEqual(sm.phase, 'ITEM_SELECT');

  // 再度 ITEM_ACTION へ入り、CANCEL による ITEM_SELECT 復帰を確認
  sm.handleCommand('CONFIRM');
  assert.strictEqual(sm.phase, 'ITEM_ACTION');
  assert.deepStrictEqual(sm.handleCommand('CANCEL'), {
    phase: 'ITEM_SELECT',
    se: 'submit',
    intent: 'BACK_TO_ITEM_SELECT',
    payload: null
  });

  // 再度 ITEM_ACTION へ入り、enterDropConfirm() による DROP_CONFIRM 遷移を検証
  sm.handleCommand('CONFIRM');
  const enterDropRes = sm.enterDropConfirm();
  assert.deepStrictEqual(enterDropRes, {
    phase: 'DROP_CONFIRM',
    se: null,
    intent: 'ENTERED_DROP_CONFIRM',
    payload: { item: { id: 'magic_water', name: 'まほうのせいすい' } }
  });
  assert.strictEqual(sm.phase, 'DROP_CONFIRM');
  assert.strictEqual(sm.dropConfirmIndex, 1);

  // DROP_CONFIRM で LEFT / RIGHT は無視される（現行仕様: 上下のみ反応）
  assert.deepStrictEqual(sm.handleCommand('LEFT'), {
    phase: 'DROP_CONFIRM',
    se: null,
    intent: 'NONE',
    payload: null
  });
  assert.deepStrictEqual(sm.handleCommand('RIGHT'), {
    phase: 'DROP_CONFIRM',
    se: null,
    intent: 'NONE',
    payload: null
  });
  assert.strictEqual(sm.dropConfirmIndex, 1);

  // UP / DOWN で 1 <-> 0 トグル
  assert.deepStrictEqual(sm.handleCommand('UP'), {
    phase: 'DROP_CONFIRM',
    se: 'submit',
    intent: 'CURSOR_MOVED',
    payload: { index: 0 }
  });
  assert.deepStrictEqual(sm.handleCommand('DOWN'), {
    phase: 'DROP_CONFIRM',
    se: 'submit',
    intent: 'CURSOR_MOVED',
    payload: { index: 1 }
  });

  // dropConfirmIndex === 1（いいえ）で CONFIRM -> ITEM_ACTION 復帰
  assert.deepStrictEqual(sm.handleCommand('CONFIRM'), {
    phase: 'ITEM_ACTION',
    se: 'submit',
    intent: 'BACK_TO_ITEM_ACTION',
    payload: null
  });
  assert.strictEqual(sm.phase, 'ITEM_ACTION');

  // 再度 DROP_CONFIRM へ入り、CANCEL -> ITEM_ACTION 復帰
  sm.enterDropConfirm();
  assert.deepStrictEqual(sm.handleCommand('CANCEL'), {
    phase: 'ITEM_ACTION',
    se: 'submit',
    intent: 'BACK_TO_ITEM_ACTION',
    payload: null
  });

  // 再度 DROP_CONFIRM へ入り、dropConfirmIndex === 0（はい）で CONFIRM -> CONFIRM_DROP
  sm.enterDropConfirm();
  sm.handleCommand('UP'); // 1 -> 0
  assert.deepStrictEqual(sm.handleCommand('CONFIRM'), {
    phase: 'DROP_CONFIRM',
    se: 'submit',
    intent: 'CONFIRM_DROP',
    payload: { item: { id: 'magic_water', name: 'まほうのせいすい' } }
  });

  // ---------------------------------------------------------------------------
  // 7. 正常系: setPhase() による外部フェーズ復元
  // ---------------------------------------------------------------------------
  const validPhases = ['ROOT', 'ITEM_SELECT', 'ITEM_ACTION', 'DROP_CONFIRM', 'QUIT_CONFIRM'];
  for (let i = 0; i < validPhases.length; i += 1) {
    const p = validPhases[i];
    sm.setPhase(p);
    assert.strictEqual(sm.phase, p);
  }

  // ---------------------------------------------------------------------------
  // 8. 異常系・境界値テスト（フェイルファスト検証）
  // ---------------------------------------------------------------------------
  // 8-1. コンストラクタへの不正なオプション値
  assert.throws(() => new MenuStateMachine({ rootCommandCount: 0 }), Error);
  assert.throws(() => new MenuStateMachine({ rootCommandCount: -1 }), Error);
  assert.throws(() => new MenuStateMachine({ rootCommandCount: '7' }), Error);
  assert.throws(() => new MenuStateMachine({ rootCommandCount: 1.5 }), Error);
  assert.throws(() => new MenuStateMachine({ actionCommandCount: 0 }), Error);
  assert.throws(() => new MenuStateMachine({ actionCommandCount: -3 }), Error);
  assert.throws(() => new MenuStateMachine({ actionCommandCount: '3' }), Error);
  assert.throws(() => new MenuStateMachine('invalid'), Error);

  // 8-2. handleCommand() への未知コマンド文字列・不正型
  const errSm = new MenuStateMachine();
  assert.throws(() => errSm.handleCommand('INVALID'), Error);
  assert.throws(() => errSm.handleCommand(''), Error);
  assert.throws(() => errSm.handleCommand(null), Error);
  assert.throws(() => errSm.handleCommand(undefined), Error);
  assert.throws(() => errSm.handleCommand(123), Error);

  // 8-3. enterItemSelect() への不正 mode / 空配列 / 非配列 / id 欠落要素
  assert.throws(
    () => errSm.enterItemSelect('unknown', [{ id: 'herb', name: 'やくそう' }]),
    Error
  );
  assert.throws(
    () => errSm.enterItemSelect('', [{ id: 'herb', name: 'やくそう' }]),
    Error
  );
  assert.throws(() => errSm.enterItemSelect('item', []), Error);
  assert.throws(() => errSm.enterItemSelect('item', null), Error);
  assert.throws(() => errSm.enterItemSelect('item', 'herb'), Error);
  assert.throws(() => errSm.enterItemSelect('item', [{ name: 'no_id' }]), Error);

  // 8-4. ITEM_ACTION 以外のフェーズまたは selectedItem === null での enterDropConfirm()
  errSm.open();
  assert.throws(() => errSm.enterDropConfirm(), Error); // phase === 'ROOT'
  errSm.enterItemSelect('item', [{ id: 'herb', name: 'やくそう' }]);
  assert.throws(() => errSm.enterDropConfirm(), Error); // phase === 'ITEM_SELECT'
  errSm.setPhase('ITEM_ACTION'); // selectedItem が null のまま強行
  assert.throws(() => errSm.enterDropConfirm(), Error);

  // 8-5. ITEM_SELECT フェーズで itemList が空の異常状態での操作
  const brokenListSm = new MenuStateMachine();
  brokenListSm.setPhase('ITEM_SELECT');
  assert.throws(() => brokenListSm.handleCommand('DOWN'), Error);
  assert.throws(() => brokenListSm.handleCommand('CONFIRM'), Error);

  // 8-6. setPhase() への不正フェーズ名
  assert.throws(() => errSm.setPhase('INVALID_PHASE'), Error);
  assert.throws(() => errSm.setPhase(''), Error);
  assert.throws(() => errSm.setPhase(null), Error);
  assert.throws(() => errSm.setPhase(123), Error);
}

// 単体直接実行エントリポイント
const isDirectExecution =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  process.argv.length > 1 &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectExecution) {
  runMenuStateMachineTests();
  console.log('[PASS] tools/test_menu_state_machine.mjs: 全検証項目に合格しました。');
}