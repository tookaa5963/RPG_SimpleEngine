# 汎用RPGエンジン移行 進捗台帳 (PROGRESS.md)

## 0\. 固定開発環境

- OS / シェル: Windows / PowerShell（Unix固有コマンドの提示禁止）  
- 文字コード: UTF-8（BOMなし必須 / 読み込み・書き込み時のエンコード明示必須）  
- ファイル更新規約: 既存 JSON の更新は差分プロパティのマージ処理（Node.js）を原則とし、全文上書きによるデグレを防止する

## 1\. 移行運用ルールと作業規約

コンテキスト破綻とデグレをシステム的に防ぐため、以下の運用プロトコルを厳格に適用します。

1. **ワンステップ・ワンコミット原則**  
   - 1つのサブステップ（目安: 50〜150行の新規作成、または既存モジュールからの1〜5行の委譲）ごとに単体検証を行い、即時コミットする。  
2. **完全新規先行作成（受け皿先行）**  
   - 既存コードに手を入れる前に、必ず移行先となる新モジュール（js/engine/ 配下）を単体で作成・検証する。  
3. **既存インターフェース非破壊（Adapterパターンの維持）**  
   - 既存の呼び出し元（例: player.heal(30)）のシグネチャは維持し、内部実装のみを新コアへ委譲する。呼び出し元の全体書き換えは行わない。  
4. **コンテキスト局所化**  
   - 1回の作業でプロンプトに読み込むファイルは「新規作成する対象ファイル 1 つ」と「接続先のインターフェース定義（数行）」のみに限定する。  
5. **スコープ外差分の静的検知義務:** ステージングから本番反映後、コミット前に必ず以下のコマンドを実行し、意図しないファイル変更および対象外ロジックの改変・欠落が混入していないことを確認する。  
   1. `git diff --name-only`: 変更対象以外のファイルが含まれていないことを確認。  
   2. `git diff -U1 js/`: 当該ステップの対象メソッド・プロパティ以外に差分が存在しないことを確認。  
   - **Gate 2 単体テストの累積実行:** 新規テストを追加する際、過去ステップのテストケースを削除・分離せず累積させ、既存の全検証項目が Exit Code 0 でパスすることを確認する（先祖返りの即時検知）。

## 2\. フェーズ別詳細タスクブレークダウン

\[Phase 1\] イベント基盤配備 │ \[Phase 2\] 効果解決系（EffectSystem）垂直スライス抽出 │ \[Phase 3\] 汎用ステート（GameContext / Actor）構築 │ \[Phase 4\] 出力ドライバ（Audio / UI）のイベント接続 │ \[Phase 5\] 3大中核モジュールの物理分離と Bootstrap 化

## 3\. アーキテクチャ構成マップ (Core / Driver)

- js/engine/ (Core層: 完全ヘッドレス・DOM/ブラウザAPI禁止・禁止構文スキャン対象)  
  - core/: 基盤・ループ・イベントバス  
  - data/: DataRepository (JSON管理・参照)  
  - entities/: Actor, Player, Monster (基底モデル・ステータス境界防護)  
  - effects/: EffectResolver, 戦略クラス群 (アイテム・呪文効果の純粋計算)  
  - state/: Inventory, GenericFlags, VariableStore (動的ステート・所持品・変数)  
  - save/: SaveManager (セーブデータ生成・復元)  
  - event/: EventManager (フラグ連関・シナリオ進行)  
  - message/: MessageFormatter (動的テキスト置換)  
  - field/: 移動・当たり判定・エンカウント計算  
  - facilities/: 店・宿・教会の計算ルール  
  - battle/: ターン制御・ダメージ計算・勝敗判定  
- js/drivers/ (Driver層: 環境依存処理)  
  - storage/, input/, audio/, canvas/, ui/  
- js/ (レガシー層: 既存の24ファイル。段階的にCore/Driverへ縮退)

## 4\. フェーズ別チェックリスト

### Phase 0: 環境準備

- \[202610271800\] Gate 1 静的検証ランナー (tools/verify\_gate1.mjs) の配備・初期検証完了  
- \[202610271800\] .gitignore による ai\_staging/ の隔離完了

### Phase 1: メッセージング基盤配備 (Core/core)

- \[202610281900\] Step 1-1: js/engine/core/EventTypes.js 新規作成（イベント定数定義 / Gate 1通過）  
- \[202610281900\] Step 1-2: js/engine/core/EngineEventBus.js 新規作成（Pub/Subハブ / Gate 1, 2通過）  
- \[202610282045\] Step 1-3: main.js へのグローバル/コンテキスト配線（Gate 3通過）

### Phase 2: 効果解決系（EffectSystem）垂直スライス抽出 (Core/effects)

- \[202610282231\] Step 2-1: データスキーマ拡張（回復アイテム3件・呪文3件へのeffect定義 / Gate 1通過）  
- \[202610290130\] Step 2-2: js/engine/effects/EffectResolver.js 新規作成（ディスパッチャ / Gate 1, 2, 3通過）  
- \[202610290215\] Step 2-3: js/engine/effects/HealHpEffect.js 新規作成（HP回復計算ストラテジー / Gate 1, 2通過）  
- \[202610290245\] Step 2-4a: js/engine/effects/HealMpEffect.js 新規作成（MP回復計算ストラテジー / Gate 1, 2通過）  
- \[202610290333\] Step 2-4b: js/engine/effects/CureStatusEffect.js 新規作成（状態異常解除ストラテジー / Gate 1, 2通過）  
- \[202610291120\] Step 2-4c: データスキーマ拡張（MP回復アイテム2件 / Gate 1通過）  
- \[202610291133\] Step 2-4d: データスキーマ拡張（状態異常解除アイテム・呪文各1件 / Gate 1通過）  
- \[202610291225\] Step 2-4e: EffectResolver への全ストラテジー登録配線（Gate 1, 2通過）  
- \[202610291410\] Step 2-5: menu.js のフィールド使用委譲切り替え（Gate 1, 3通過）  
- \[202610291450\] Step 2-6: battleActions.js の戦闘使用委譲切り替え（Gate 1, 3通過）

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

- [202610311200] Step 4-1: js/drivers/audio/WebAudioDriver.js の配線（Gate 1, 2, 3 通過）
- [202610311515] Step 4-2: js/drivers/ui/DomUiDriver.js の配線（Gate 1, 2, 3 通過）
- [202610311600] Step 4-3 探査: ロジック層残存出力依存の静的特定完了（Core層のヘッドレス健全性を確認、案Aを採用）
- [202610311915] Step 4-3: tools/test_headless_run.mjs の新規作成（完全ヘッドレス実証テスト配備 / Gate 1, 2 通過）


※Phase 5は極めて難易度が上がります。Phase5に入る前に、battle.js の中をさらに「ターン進行キュー」「行動選択UI」「演出アニメーション」といった細かいサブステップへあらかじめ再分解しておく必要あり。

### Phase 5: 3大中核モジュール物理分割と Bootstrap 化 (Core/systems, field, battle)

目的: menu.js, battle.js, fieldManager.js を Core（純粋計算・状態機械）と Driver（描画）へ分割し、main.js を純粋ブートストラップ化。

- Step 5-1: menu.js の物理分割  
  - Core: js/engine/systems/MenuController.js（カーソル・コマンド判定）  
  - Driver: js/drivers/ui/MenuRenderer.js（描画）  
  - 検証: Gate 1 通過 ＋ 実機メニュー操作確認  
- Step 5-2: battle.js の物理分割  
  - Core: js/engine/battle/BattleEngine.js（ターン進行・勝敗判定）  
  - Driver: js/drivers/canvas/BattleViewRenderer.js（演出・描画）  
  - 検証: Gate 1 通過 ＋ 実機戦闘サイクル確認  
- Step 5-3: fieldManager.js の物理分割  
  - Core: js/engine/field/MapSystem.js（移動・当たり判定・エンカウント）  
  - Driver: js/drivers/canvas/CanvasTileRenderer.js（マップ描画）  
  - 検証: Gate 1 通過 ＋ 実機マップ探索確認  
- Step 5-4: 循環参照解消・main.js の純粋ブートストラップ化  
  - 規模: main.js からロジックを排除し、Core/Driver の配線・初期化のみに圧縮  
  - 検証: Gate 1, 2, 3 全通過（全モジュールの完全独立実証）

## 5. 引き継ぎ部

完了コミット: <fb22b4e> (test(headless): add complete headless integration run test)
直近完了内容:
- Step 4-3 完全ヘッドレス実証テスト（tools/test_headless_run.mjs）配備完了:
  - ブラウザAPI（window/document/AudioContext）が一切存在しない Node.js ランタイム下で、Core層（Actor, Inventory, EffectResolver, DataRepository, GenericFlags, EngineEventBus）が協調動作するゲーム進行シナリオ（47項目）が Exit Code 0 で完走することを実証。
  - Phase 4 の全工程が完了。Core層の完全ヘッドレス化および疎結合性が担保された。

次タスク:
- Phase 5: 3大中核モジュール物理分割と Bootstrap 化
  - 次回作業: Step 5-1 探査セッション
    - menu.js の物理分割（MenuController.js と MenuRenderer.js）に向けた事前静的探査
    - menu.js 内の純粋ロジック（カーソル移動・インデックス計算・コマンド決定判定）と DOM描画処理（drawListBox / drawMessageBox / sound呼び出し）の境界特定および最小コードブロックの抽出