# 汎用RPGエンジン移行 進捗台帳 (PROGRESS.md)

## 0\. 固定開発環境

- OS / シェル: Windows / PowerShell（Unix固有コマンドの提示禁止）  
- 文字コード: UTF-8（BOMなし必須 / 読み込み・書き込み時のエンコード明示必須）  
- ファイル更新規約: 既存 JSON の更新は差分プロパティのマージ処理（Node.js）を原則とし、全文上書きによるデグレを防止する

## 1. 移行運用ルールと作業規約

コンテキスト破綻、特定ゲームロジックのCore混入、およびデグレをシステム的に防ぐため、以下の運用プロトコルを厳格に適用する。

1. **ワンステップ・ワンコミット原則**
   - 1つのサブステップ（目安: 50〜150行の新規作成、または既存モジュールからの数行〜十数行の委譲・置換）ごとに単体検証（Gate 1 / Gate 2）を行い、即時コミットする。作業規模をコミット単位で局所化し、差分の肥大化を防ぐ。
2. **完全新規先行作成（受け皿先行 / Acceptor-First）**
   - 既存コードに手を入れる前に、必ず移行先となる新モジュール（`js/engine/` 配下）、新ストラテジー、または受け入れ関数（`events.js` 等）を単体で作成・検証する。受け皿が存在しない状態での既存コードの改変・削除を厳禁とする。
3. **コンテンツ分離原則（特定ゲームロジック持ち込み禁止）**
   - Core層（`js/engine/`）に特定ゲーム固有の識別子（アイテムID、シナリオフラグ名、マップID等）をハードコードすることを完全禁止する。
   - 既存コードからロジックを抽出する際、特定ゲーム依存（クエスト判定・特殊アイテム分岐等）は事前にGame Content層（`data/`、`js/events.js` 等）へ委譲・パージしてからCore化する。
4. **既存インターフェース非破壊（Adapter／影の計算機方式）**
   - 既存モジュールの外部インターフェース（メソッドシグネチャ）は維持したまま、内部ロジックのみを新Coreへ段階的に委譲（並行稼働）する。一括置換による大規模破壊を排除する。
5. **コンテキスト局所化と高凝集維持**
   - 1回の作業で参照するファイルは「対象ファイル1つ」と「接続先インターフェース定義」に限定する。
   - 単一機能（例: メニュー階層管理）のための過度なクラス・ファイル細分化を禁止し、自己完結性の高い高凝集モジュールとして実装する（LLMの参照ファイル数を最小化）。
6. **スコープ外差分の静的検知義務**
   - ステージング前およびコミット前に必ず以下のコマンドを実行し、意図しないファイル変更や対象外ロジックの改変・欠落を検知する。
     - `git diff --name-only`: 変更対象以外のファイルが含まれていないことを確認。
     - `git diff -U1 js/`: 当該ステップの対象メソッド・プロパティ以外に差分が存在しないことを確認。
7. **Gate 2 単体テストの累積実行**
   - 新規テスト追加時、過去ステップのテストケースを削除・分離せず累積実行（`test_headless_run.mjs`）し、既存の全検証項目が Exit Code 0 でパスすることを確認する（先祖返りの即時検知）。

## 2. フェーズ別詳細タスクブレークダウン

[Phase 1] イベント基盤配備 (完了)
    │
[Phase 2] 効果解決系（EffectSystem）垂直スライス抽出 (完了)
    │
[Phase 3] データ駆動・変数管理基盤（DataRepository / VariableStore / JSON外部化）構築 (完了)
    │
[Phase 4] 出力ドライバ（Audio / UI）のイベント接続・ヘッドレス検証環境配備 (完了)
    │
[Phase 5] 3大中核モジュールの疎結合化・物理分離（進行中）
    ├─ Phase 5-Pre: レガシー依存パージと events.js 先行改修
    │    ├─ Pre-1: ジャーナル（思い出す）判定の events.js 移設
    │    ├─ Pre-2: 特殊アイテム効果のデータ駆動化・EffectResolver 委譲
    │    └─ Pre-3: システム越境コールバック（マップ遷移・セーブ等）のイベント化
    ├─ Phase 5-0: 共通抽象基盤配備 (ActionTypes / GameContext)
    ├─ Phase 5-1: メニューシステムの完全データ駆動化・物理分割 (MenuController / MenuRenderer)
    ├─ Phase 5-2: フィールドシステムの空間判定・Tick分離 (MapSystem / CanvasTileRenderer)
    ├─ Phase 5-3: バトルシステムの逐次実行ステートマシン化 (BattleEngine / BattleViewRenderer)
    └─ Phase 5-4: 循環参照解体と純粋ブートストラップ化 (main.js の縮退)

## 3. アーキテクチャ構成マップ (Core / Driver)

rpg_simple_engine/
├── js/
│   ├── engine/                               # 【Engine Core層】完全ヘッドレス・特定ゲーム知識ゼロ
│   │   ├── core/                             # 基盤・ループ・イベントバス
│   │   │   ├── EventBus.js                   # イベント発行・購読基盤
│   │   │   ├── EventTypes.js                 # 大域イベント識別子定義
│   │   │   ├── ActionTypes.js                # [新規] 抽象入力コマンド定義
│   │   │   ├── GameContext.js                # [新規] 包括的ゲーム状態・DIコンテナ
│   │   │   └── GameLoop.js                   # [将来] 固定デルタタイム主ループ
│   │   ├── entities/                         # 基底エンティティモデル
│   │   │   └── Actor.js                      # 汎用アクター（ステータス境界保護）
│   │   ├── state/                            # 汎用動的ステート管理
│   │   │   ├── Inventory.js                  # 所持品管理
│   │   │   ├── GenericFlags.js               # 汎用フラグ管理
│   │   │   └── VariableStore.js              # 汎用変数ストレージ
│   │   ├── effects/                          # 汎用効果解決（純粋計算・副作用なし）
│   │   │   ├── EffectResolver.js             # 効果ディスパッチャ
│   │   │   └── strategies/                   # 各種効果計算ストラテジー群
│   │   ├── systems/                          # 汎用システム制御
│   │   │   └── MenuController.js             # [新規] 汎用メニュー状態機械（スタック内包）
│   │   ├── field/                            # [将来] 汎用空間移動・衝突・Tick計算
│   │   │   └── MapSystem.js                  # グリッド座標・エンカウント・移動完了Tick統括
│   │   └── battle/                           # [将来] 汎用ターン制御・戦闘計算
│   │       ├── BattleCalculator.js           # ダメージ・命中・逃走計算純関数
│   │       └── BattleEngine.js               # 逐次実行（Generator型）戦闘ステートマシン
│   │
│   ├── drivers/                              # 【Platform Driver層】環境依存（具象I/O）
│   │   ├── renderers/                        # Canvas描画ドライバ
│   │   │   ├── MenuRenderer.js               # [新規] メニューCanvas描画・表示テキスト整形
│   │   │   ├── CanvasTileRenderer.js         # [将来] マップタイル描画・カメラ追従
│   │   │   └── BattleViewRenderer.js         # [将来] 戦闘画面描画・演出進行
│   │   ├── input/                            # 入力検知ドライバ
│   │   │   └── KeyboardDriver.js             # [将来] 生キー監視・ActionTypes変換
│   │   ├── audio/                            # 音声再生ドライバ
│   │   │   └── AudioDriver.js                # WebAudio / HTML5 Audio制御
│   │   └── storage/                          # 永続化ドライバ
│   │       └── LocalStorageDriver.js         # localStorageラッパー
│   │
│   ├── events.js                             # 【Game Content層】シナリオ・進行判定
│   ├── main.js                               # 【Bootstrap】初期化・配線・起動（段階的縮退）
│   └── (menu.js, fieldManager.js, battle.js) # 【レガシー層】移行完了に伴い順次削除
│
├── data/                                     # 【Game Content層】特定ゲーム固有JSONデータ
│   ├── items/                                # アイテム定義（効果定義含む）
│   ├── spells/                               # 呪文定義
│   ├── monsters/                             # モンスター定義
│   ├── maps/                                 # マップデータ
│   └── events/                               # クエスト・台詞・objectives.json
│
└── tools/                                    # 品質保証・検証スクリプト群
    ├── verify_gate1.mjs                      # Gate 1 静的構文・境界検証
    ├── test_objectives.mjs                   # [新規] ジャーナル判定単体テスト
    ├── test_game_context.mjs                 # [新規] GameContext 単体テスト
    ├── test_menu_controller.mjs              # [新規] MenuController 単体テスト
    └── test_headless_run.mjs                 # Gate 2 ヘッドレス総合累積検証

## 4. フェーズ別チェックリスト

### Phase 0: 環境準備
- \[202610271800\] Gate 1 静的検証ランナー (tools/verify\_gate1.mjs) の配備・初期検証完了  
- \[202610271800\] .gitignore による ai\_staging/ の隔離完了

### Phase 1: メッセージング基盤配備 (Core/core)
- \[202610281900\] Step 1-1: js/engine/core/EventTypes.js 新規作成
- \[202610281900\] Step 1-2: js/engine/core/EngineEventBus.js 新規作成
- \[202610282045\] Step 1-3: main.js へのグローバル/コンテキスト配線

### Phase 2: 効果解決系（EffectSystem）垂直スライス抽出 (Core/effects)
- \[202610282231\] Step 2-1: データスキーマ拡張（回復アイテム3件・呪文3件へのeffect定義） 
- \[202610290130\] Step 2-2: js/engine/effects/EffectResolver.js 新規作成（ディスパッチャ）  
- \[202610290215\] Step 2-3: js/engine/effects/HealHpEffect.js 新規作成（HP回復計算ストラテジー）  
- \[202610290245\] Step 2-4a: js/engine/effects/HealMpEffect.js 新規作成（MP回復計算ストラテジー）  
- \[202610290333\] Step 2-4b: js/engine/effects/CureStatusEffect.js 新規作成（状態異常解除ストラテジー）  
- \[202610291120\] Step 2-4c: データスキーマ拡張（MP回復アイテム2件）  
- \[202610291133\] Step 2-4d: データスキーマ拡張（状態異常解除アイテム・呪文各1件）  
- \[202610291225\] Step 2-4e: EffectResolver への全ストラテジー登録配線
- \[202610291410\] Step 2-5: menu.js のフィールド使用委譲切り替え
- \[202610291450\] Step 2-6: battleActions.js の戦闘使用委譲切り替え

### Phase 3: 汎用ステート・アクター・データ層のCore化 (Core/entities, state, data)
目的: アクターモデルの確立、フラグ・変数のヘッドレス管理、DataRepository によるデータ参照の統一。
- \[202610291720\] Step 3-1: js/engine/state/GenericFlags.js, VariableStore.js の新規作成  
- \[202610291956\] Step 3-2: js/engine/entities/Actor.js の新規作成  
- \[202610292020\] Step 3-3: js/engine/state/Inventory.js の新規作成  
- \[202610292115\] Step 3-4: js/engine/data/DataRepository.js の新規作成  
- \[202610300145\] Step 3-5a: player.js の基本ステータス・回復/ダメージ系の Actor 委譲  
- \[202610300326\] Step 3-5b: player.js のインベントリ・装備系の Inventory 委譲  
- \[202610302053\] Step 3-5c: player.js の経験値・成長・ゴールド系の委譲  
- \[202610310230\] Step 3-5d: player.js のステータス・インベントリ系シリアライズ統合  
- \[202610310425\] Step 3-5e: player.js のシナリオフラグ系の GenericFlags 委譲

### Phase 4: 出力ドライバの配線とヘッドレス実証 (Drivers/audio, ui)
目的: ロジック層から sound.js / ui.js の直接インポートを物理削除し、イベント駆動へ完全置換。
- [202610311200] Step 4-1: js/drivers/audio/WebAudioDriver.js の配線
- [202610311515] Step 4-2: js/drivers/ui/DomUiDriver.js の配線
- [202610311600] Step 4-3 探査: ロジック層残存出力依存の静的特定完了
- [202610311915] Step 4-3: tools/test_headless_run.mjs の新規作成（完全ヘッドレス実証テスト配備 ）

## Phase 5: 中核モジュール疎結合化・データ駆動アーキテクチャ移行計画

### 1. 3層境界および設計規約
- **Engine Core (`js/engine/`)**: 完全ヘッドレス。ブラウザAPIおよび特定ゲーム固有の識別子（アイテムID、フラグ名、マップID）の混入を厳禁。
- **Game Content (`data/`, `js/events.js`)**: シナリオ進行ルール、特殊アイテム効果、マップ定義を保持。
- **Platform Driver (`js/drivers/`)**: Canvas描画、WebAudio再生、入力検知を担当。
- **受け皿先行原則 (Acceptor-First)**: 既存コード変更前に必ず新関数・新モジュールと単体テストを配備し、Gate 1/Gate 2 通過後に委譲。
- **ワンステップ・ワンコミット**: 1コミットの差分規模を新規50〜150行、委譲数行〜十数行に制限。
---

### 2. 詳細実行ステップ（Phase 5-1完了まで）

#### Phase 5-Pre: レガシー依存パージと events.js 先行改修
- [202611011617] **Step Pre-1a [受け皿先行]**: `js/events.js` にジャーナル判定純粋関数 `resolveCurrentObjectiveKey(player)` を新設。`tools/test_objectives.mjs` を配備し Gate 1, Gate 2 検証。
- [202611011655] **Step Pre-1b [既存委譲]**: `js/menu.js` の `showCurrentObjective()` を `resolveCurrentObjectiveKey(this.player)` の呼び出し1行へ置換。Gate 1, Gate 2, Gate 3 検証完了。

- [202611011939] **Step Pre-2a [既存委譲]**: `js/menu.js` の `equipItem()` 内にあるスロット直弄り（`VALID_EQUIP_SLOTS` 等）を排除し、`this.player.equip()` / `this.player.unequip()` / `this.player.isEquipped()` 経由へ委譲。Gate 1, Gate 2, Gate 3 検証。
- [202611012010] **Step Pre-2b-1 [受け皿先行]**: `js/player.js` にアイテム破棄可否判定メソッド `canDropItem(item)`（装備中・貴重品判定）を新設。`tools/test_player_candrop.mjs` を配備し Gate 1, Gate 2 検証完了。
- [202611012030] **Step Pre-2b-2 [既存委譲]**: `js/menu.js` の破棄可否判定を `this.player.canDropItem()` 呼び出しへ集約。Gate 1, Gate 2, Gate 3 検証完了。
- [202611020110] **Step Pre-3a [受け皿先行]**: `js/engine/core/EventTypes.js` にシステム要求イベント定数（SYSTEM:`REQUEST_MAP_CHANGE`, SYSTEM:`REQUEST_SLOT_DIALOG`, SYSTEM:`REQUEST_RETURN_TITLE`）を追加。Gate 1, Gate 2 検証完了。

- [ ] **Step Pre-3bc**
 **Step Pre-3b [既存委譲]**: `js/menu.js` 内の直接コールバック呼び出し（`onOpenSlot`, `onReturnToTitle`）を `EngineEventBus.emit`（`REQUEST_SLOT_DIALOG`, `REQUEST_RETURN_TITLE`）へ置換。Gate 1, Gate 2 検証。
 **Step Pre-3c [配線・引数削減]**: `js/main.js` で各要求イベントを購読・配線し、`MenuManager` コンストラクタ引数から外部コールバックを削除して縮退。Gate 1, Gate 2, Gate 3 検証。
 ※Step Pre-3bと3cは1セッションで行う。

- [ ] **Step Pre-4a [受け皿先行]**: `data/items/i_forest_guide.json` および `data/spells/s_rula.json`, `s_liremito.json` に effect 定義を付与し、`EffectResolver` にマップ遷移・メッセージ用の解決ストラテジーを配備。Gate 1, Gate 2 検証。
- [ ] **Step Pre-4b [既存委譲]**: `js/menu.js` の `useItem()` 内にある個別アイテムID分岐（`forest_guide`, `broken_corrada_hilt` 等）を撤廃し、`EffectResolver` 経由へ統一。Gate 1, Gate 2, Gate 3 検証。
- [ ] **Step Pre-4c [既存委譲]**: `js/menu.js` の `useMagic()` 内にある呪文個別分岐（rula, liremito, 回復呪文）を撤廃し、`EffectResolver` 経由へ統一。Gate 1, Gate 2, Gate 3 検証。

#### Phase 5-0: 共通抽象基盤配備
- [ ] **Step 5-0a [基盤新設]**: `js/engine/core/ActionTypes.js`（抽象入力コマンド定数）を新規配備。Gate 1 検証。
- [ ] **Step 5-0b [基盤新設]**: `js/engine/core/GameContext.js`（包括的状態コンテナ）を配備し `tools/test_game_context.mjs` で Gate 1, Gate 2 検証。

#### Phase 5-1: メニューシステムの完全データ駆動化・物理分割
- [ ] **Step 5-1a [受け皿先行]**: `js/engine/systems/MenuController.js`（スタック内包・高凝集モデル）を新設。`tools/test_menu_controller.mjs` で Gate 1, Gate 2 検証。
- [ ] **Step 5-1b [並行稼働]**: `js/menu.js` 内部で `MenuController` をインスタンス化し、カーソル・階層計算を委譲（影の計算機）。Gate 1, Gate 2, Gate 3 検証。
- [ ] **Step 5-1c [物理分割]**: Canvas描画部を `js/drivers/renderers/MenuRenderer.js` へ切り出し、旧 `menu.js` を物理削除。`main.js` 配線を更新し Gate 1, Gate 2, Gate 3 検証。

---

### 3. 後続フェーズ概要（案）
- **Phase 5-2**: `fieldManager.js` 解体（`MapSystem.js` と `CanvasTileRenderer.js` への分離、Tickパイプライン確立）。
- **Phase 5-3**: `battle.js` 解体（`BattleEngine.js` のジェネレータ型逐次実行化と `BattleViewRenderer.js` への分離）。
- **Phase 5-4**: `main.js` 解体（`titleScene.js` 循環参照解消、`KeyboardDriver.js` / `InputRouter.js` 導入、100行規模ブートストラップ化）。

## 5. 引き継ぎ部

**Step Pre-3bc**を実施する前に下記仕様のテストコードを作成するセッションとします。

### tools/test_menu_callbacks.mjs 単体テスト・回帰検証仕様書

1. 文書概要
1.1 目的
汎用RPGエンジン移行運用プロトコル ver 1.36 に基づき、MenuManager（js/menu.js）が保持する画面遷移用コールバック（onOpenSlot, onReturnToTitle）を廃止し、EngineEventBus による要求イベント発行へと疎結合化する改修（Step Pre-3bc）において、機能の退行（リグレッション）防止および新仕様の正常動作を機械的・決定論的に検証するためのテスト仕様を定義する。
1.2 適用範囲
検証対象モジュール: js/menu.js（MenuManager クラス）
結合対象実在モジュール: js/player.js（Player クラス）、js/engine/core/EngineEventBus.js、js/engine/core/EventTypes.js
テストランナー配置: tools/test_menu_callbacks.mjs
2. アーキテクチャおよび前提制約
2.1 テスト設計原則
推測・手製モックの完全排除（第0条第1項準拠）:
mockPlayer 等の独自スタブオブジェクトの作成を禁止する。アクター状態、所持品、装備判定には必ず Player クラス（js/player.js）の正規インスタンスを使用する。
ブラックボックス操作の徹底:
menu.rootIndex や menu.quitConfirmIndex などの内部状態プロパティへの直接代入による状態変更を禁止する。初期状態からの遷移はすべて menu.handleKeyDown(key) によるキー入力シーケンスのみで行う。
フェイルファストと契約検証:
イベントバスが未注入、または emit メソッドを持たない不正オブジェクトが渡された状態で操作が行われた場合、直ちに例外を送出して停止することを確認する。
2.2 ヘッドレス実行環境エミュレーション仕様
js/menu.js の依存先であるレガシーモジュール（sound.js, maps.js, ui.js）がモジュール評価時に実行するブラウザAPIアクセスを吸収するため、テストスクリプトの最上位で以下のグローバルスタブを注入する。
対象オブジェクト
提供メソッド / プロパティ
戻り値 / 挙動
目的
globalThis.localStorage
getItem, setItem, removeItem, clear
空関数 / null
sound.js:loadSettings の初期化エラー抑止
globalThis.document
createElement(tag)
{ appendChild: () => {}, addEventListener: () => {} }
sound.js:createBgmElement の初期化エラー抑止
globalThis.document
getElementById(id), querySelector(sel)
null
ui.js 内のDOM参照エラー抑止
globalThis.fetch
fetch(url)
Promise.resolve({ ok: true, json: () => ({ maps: [] }) })
maps.js:initMapData の相対パス解決エラー抑止

2.3 ステージングツール（prepare_staging.mjs）適合仕様
tools/prepare_staging.mjs の静的依存抽出パーサーは静的 import ... from ... 構文のみを対象とするため、動的インポート（await import(...)）を使用する場合は明示的な依存追跡が行われない。
したがって、環境スタブ初期化とモジュールロードの順序制御を行うにあたっては、以下のいずれかの整合措置を必須とする。
方式A: テスト冒頭にダミーの静的インポート文を記述せず、prepare_staging.mjs 実行時に js/player.js および js/menu.js が自動コピーされるよう、トップレベル静的インポート可能な設計への分離。
方式B: モック初期化専用のブートストラップモジュール（tools/setup_headless_env.mjs）を先行静的インポートし、続けてテスト対象を静的インポートする構造への統一。
3. テストケース詳細仕様
3.1 Phase 1: 回帰防止テスト群（現行コールバック方式の検証）
現行コード（7引数コンストラクタ）に対し、キー入力シーケンスによる画面遷移要求が正確にコールバック関数へ伝達されることを検証する。
Case 1-1: ルートカーソルの境界巡回（ブラックボックス操作保証）
前提条件: createMenuHarness() により menu インスタンスを生成し、menu.open() を呼び出す（phase === 'ROOT'、カーソル位置 0）。
入力シーケンス:
handleKeyDown('ArrowUp')
handleKeyDown('Enter')
検証項目:
カーソルが最末尾（インデックス 6: 冒険を中断する）へ逆巡回し、menu.phase === 'QUIT_CONFIRM' となること。
入力シーケンス（キャンセル復帰）: 3. handleKeyDown('Escape')
検証項目:
menu.phase === 'ROOT' に復帰すること。
Case 1-2: ロードダイアログ要求のキーストローク伝達
前提条件: menu.open() 完了状態。
入力シーケンス:
handleKeyDown('ArrowDown')（道具）
handleKeyDown('ArrowDown')（装備）
handleKeyDown('ArrowDown')（思い出す）
handleKeyDown('ArrowDown')（冒険の書を読む: インデックス 4）
handleKeyDown('Enter')
検証項目:
onOpenSlot が厳密に 1 回呼び出されること。
onOpenSlot に渡された第1引数が文字列 'load' であること。
Case 1-3: セーブダイアログ要求のキーストローク伝達
前提条件: menu.open() 完了状態。
入力シーケンス:
handleKeyDown('ArrowDown') × 5回（冒険の書を記録する: インデックス 5）
handleKeyDown('Enter')
検証項目:
onOpenSlot が厳密に 1 回呼び出されること。
onOpenSlot に渡された第1引数が文字列 'save' であること。
Case 1-4: 中断メニューの「いいえ」選択（キャンセル）
前提条件: menu.open() 完了状態。
入力シーケンス:
handleKeyDown('ArrowDown') × 6回（冒険を中断する）
handleKeyDown('Enter')（QUIT_CONFIRM 突入、初期カーソルは 1: 「いいえ」）
handleKeyDown('Enter')
検証項目:
menu.phase === 'ROOT' に戻ること。
onReturnToTitle が呼び出されていないこと（呼び出し回数 0）。
onEnd が呼び出されていないこと（呼び出し回数 0）。
Case 1-5: 中断メニューのトグル反転と「はい」確定
前提条件: menu.open() 完了状態。
入力シーケンス:
handleKeyDown('ArrowDown') × 6回
handleKeyDown('Enter')
handleKeyDown('ArrowLeft')（トグル反転により 0: 「はい」へ移動）
handleKeyDown('Enter')
検証項目:
onEnd が厳密に 1 回呼び出されること。
onReturnToTitle が厳密に 1 回呼び出されること。
3.2 Phase 2: イベント駆動移行後テスト群（Step Pre-3bc 疎通検証）
js/menu.js のコールバック引数が物理削除され、eventBus が注入された新シグネチャに対する検証。
JavaScript
// 新コンストラクタシグネチャ
new MenuManager(player, messageWindow, onEndCallback, changeMap, getCurrentMap, eventBus)

Case 2-1: ロード要求イベントの発行検証
入力シーケンス: open() → ArrowDown × 4回 → Enter。
検証項目:
eventBus.emit 経由で EventTypes.SYSTEM.REQUEST_SLOT_DIALOG が 1 回発行されること。
ペイロードが { mode: 'load' } であること。
Case 2-2: セーブ要求イベントの発行検証
入力シーケンス: open() → ArrowDown × 5回 → Enter。
検証項目:
eventBus.emit 経由で EventTypes.SYSTEM.REQUEST_SLOT_DIALOG が 1 回発行されること。
ペイロードが { mode: 'save' } であること。
Case 2-3: タイトル復帰要求イベントの発行検証
入力シーケンス: open() → ArrowDown × 6回 → Enter → ArrowLeft → Enter。
検証項目:
eventBus.emit 経由で EventTypes.SYSTEM.REQUEST_RETURN_TITLE が 1 回発行されること。
ペイロードが {} であること。
onEnd が 1 回実行されること。
3.3 Phase 3: 契約違反・フェイルファスト検証群
Case 3-1: 無効な EventBus に対する防御
条件: eventBus に null, undefined, または emit メソッドを持たないオブジェクトを渡してインスタンス化し、イベント発行を伴う操作（ロード/セーブ/中断確定）を実行する。
検証項目:
処理が黙殺（サイレントフェイル）されず、TypeError またはプロトコル規定の高解像度例外が確実に送出されること。
Case 3-2: クラス静的呼び出しの不使用保証
検証項目:
EngineEventBus.emit（静的メソッド）への呼び出しが一切行われず、必ずコンストラクタ経由で注入されたインスタンスの emit が実行されていること。
4. セッション別実行ロードマップと合格基準（DoD）
[Session 1: テスト環境・回帰検証の配備]
  │
  ├─ 1. tools/setup_headless_env.mjs の新設（ブラウザAPIモックの共通化）
  ├─ 2. tools/test_menu_callbacks.mjs の配備（Phase 1 回帰テスト実装）
  ├─ 3. tools/prepare_staging.mjs による依存解決の正常性確認
  ├─ 4. Gate 1（構文検査）および Gate 2（Exit Code 0）の通過確認
  └─ 成果物コミット（未改修の本番コードに対する完全互換性の保証）

[Session 2: Step Pre-3bc 本体改修およびイベント配線]
  │
  ├─ 1. js/menu.js の改修（コールバック引数の削除、EventTypes.SYSTEM の emit 発行）
  ├─ 2. js/main.js の改修（EventTypes 購読ハンドラ設置、MenuManager への eventBus 注入）
  ├─ 3. tools/test_menu_callbacks.mjs のアサーションを Phase 2・3 へ更新
  ├─ 4. Gate 1・Gate 2（Exit Code 0）の通過確認
  ├─ 5. 本番ツリーへの昇格
  ├─ 6. Gate 3（実機ブラウザでのセーブ/ロード/タイトル復帰の動作およびエラー0件確認）
  └─ 成果物コミット

4.1 Session 1 合格判定条件
tools/test_menu_callbacks.mjs が既存の js/menu.js および js/player.js に対して実行され、全 7 項目以上のアサーションが assert.strictEqual により Exit Code 0 で完走すること。
テストコード内に mockPlayer や手製データオブジェクトが存在せず、すべて実クラスから生成されていること。
tools/test_headless_run.mjs を含む既存の累積テストランナーが破壊されていないこと。
4.2 Session 2 合格判定条件
js/menu.js 内に旧コールバック（this.onOpenSlot, this.onReturnToTitle）への参照およびフォールバック分岐が 1 行も残存していないこと。
Phase 2 および Phase 3 の全テストケースが Exit Code 0 で通過すること。
実機ブラウザ検証（Gate 3）において、メニューからのスロット起動および中断復帰が実行可能であり、コンソールエラーが 0 件であること。

