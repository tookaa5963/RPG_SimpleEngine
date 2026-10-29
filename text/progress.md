# 汎用RPGエンジン移行 進捗台帳 (PROGRESS.md)
## 0. 固定開発環境

- OS / シェル: Windows / PowerShell（Unix固有コマンドの提示禁止）
- 文字コード: UTF-8（BOMなし必須 / 読み込み・書き込み時のエンコード明示必須）
- ファイル更新規約: 既存 JSON の更新は差分プロパティのマージ処理（Node.js）を原則とし、全文上書きによるデグレを防止する

## 1. 移行運用ルールと作業規約

コンテキスト破綻とデグレをシステム的に防ぐため、以下の運用プロトコルを厳格に適用します。

1. **ワンステップ・ワンコミット原則**
   - 1つのサブステップ（目安: 50〜150行の新規作成、または既存モジュールからの1〜5行の委譲）ごとに単体検証を行い、即時コミットする。
2. **完全新規先行作成（受け皿先行）**
   - 既存コードに手を入れる前に、必ず移行先となる新モジュール（js/engine/ 配下）を単体で作成・検証する。
3. **既存インターフェース非破壊（Adapterパターンの維持）**
   - 既存の呼び出し元（例: player.heal(30)）のシグネチャは維持し、内部実装のみを新コアへ委譲する。呼び出し元の全体書き換えは行わない。
4. **コンテキスト局所化**
   - 1回の作業でプロンプトに読み込むファイルは「新規作成する対象ファイル 1 つ」と「接続先のインターフェース定義（数行）」のみに限定する。
5. **スコープ外差分の静的検知義務:**
     ステージングから本番反映後、コミット前に必ず以下のコマンドを実行し、意図しないファイル変更および対象外ロジックの改変・欠落が混入していないことを確認する。
     1. `git diff --name-only`: 変更対象以外のファイルが含まれていないことを確認。
     2. `git diff -U1 js/`: 当該ステップの対象メソッド・プロパティ以外に差分が存在しないことを確認。
   - **Gate 2 単体テストの累積実行:**
     新規テストを追加する際、過去ステップのテストケースを削除・分離せず累積させ、既存の全検証項目が Exit Code 0 でパスすることを確認する（先祖返りの即時検知）。

## 2. フェーズ別詳細タスクブレークダウン

[Phase 1] イベント基盤配備 │ [Phase 2] 効果解決系（EffectSystem）垂直スライス抽出 │ [Phase 3] 汎用ステート（GameContext / Actor）構築 │ [Phase 4] 出力ドライバ（Audio / UI）のイベント接続 │ [Phase 5] 3大中核モジュールの物理分離と Bootstrap 化

## 3. アーキテクチャ構成マップ (Core / Driver)

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

## 4. フェーズ別チェックリスト

### Phase 0: 環境準備
- [202610271800] Gate 1 静的検証ランナー (tools/verify_gate1.mjs) の配備・初期検証完了
- [202610271800] .gitignore による ai_staging/ の隔離完了

### Phase 1: メッセージング基盤配備 (Core/core)
- [202610281900] Step 1-1: js/engine/core/EventTypes.js 新規作成（イベント定数定義 / Gate 1通過）
- [202610281900] Step 1-2: js/engine/core/EngineEventBus.js 新規作成（Pub/Subハブ / Gate 1, 2通過）
- [202610282045] Step 1-3: main.js へのグローバル/コンテキスト配線（Gate 3通過）

### Phase 2: 効果解決系（EffectSystem）垂直スライス抽出 (Core/effects)
- [202610282231] Step 2-1: データスキーマ拡張（回復アイテム3件・呪文3件へのeffect定義 / Gate 1通過）
- [202610290130] Step 2-2: js/engine/effects/EffectResolver.js 新規作成（ディスパッチャ / Gate 1, 2, 3通過）
- [202610290215] Step 2-3: js/engine/effects/HealHpEffect.js 新規作成（HP回復計算ストラテジー / Gate 1, 2通過）
- [202610290245] Step 2-4a: js/engine/effects/HealMpEffect.js 新規作成（MP回復計算ストラテジー / Gate 1, 2通過）
- [202610290333] Step 2-4b: js/engine/effects/CureStatusEffect.js 新規作成（状態異常解除ストラテジー / Gate 1, 2通過）
- [202610291120] Step 2-4c: データスキーマ拡張（MP回復アイテム2件 / Gate 1通過）
- [202610291133] Step 2-4d: データスキーマ拡張（状態異常解除アイテム・呪文各1件 / Gate 1通過）
- [202610291225] Step 2-4e: EffectResolver への全ストラテジー登録配線（Gate 1, 2通過）
- [202610291410] Step 2-5: menu.js のフィールド使用委譲切り替え（Gate 1, 3通過）
- [202610291450] Step 2-6: battleActions.js の戦闘使用委譲切り替え（Gate 1, 3通過）

### Phase 3: 汎用ステート・アクター・データ層のCore化 (Core/entities, state, data)
目的: アクターモデルの確立、フラグ・変数のヘッドレス管理、DataRepository によるデータ参照の統一。
- [202610291720] Step 3-1: js/engine/state/GenericFlags.js, VariableStore.js の新規作成
  - 規模: 各 約 110〜160 行（ブール値ストア、汎用 Key-Value ストア）
  - 検証: Gate 1 ＋ Gate 2 通過
- [202610291956] Step 3-2: js/engine/entities/Actor.js の新規作成
  - 規模: 約 360 行（ステータス保持、境界防護、状態遷移、イベント通知、toJSON/fromJSON）
  - 検証: Gate 1 ＋ Gate 2 通過
- [202610292020] Step 3-3: js/engine/state/Inventory.js の新規作成
  - 規模: 約 330 行（アイテムID・数量管理、装備スロット抽象管理、容量境界防護、イベント通知）
  - 検証: Gate 1 ＋ Gate 2（16件の単体テスト）通過  
- [202610292115] Step 3-4: js/engine/data/DataRepository.js の新規作成
  - 規模: 約 190 行（マスタデータのインメモリ保持・バリデーション・高速検索、完全ヘッドレス・Tier 3構文準拠）
  - 検証: Gate 1 ＋ Gate 2（9件の単体テスト）通過
- [202610300145] Step 3-5a: player.js の基本ステータス・回復/ダメージ系の Actor 委譲
  - 規模: player.js の hp, mp, maxHp, maxMp, isPoisoned および関連メソッドを Actor へ委譲。getter/setter による後方互換性維持
  - 検証: Gate 1 ＋ Gate 2（全12件単体テスト）＋ Gate 3（実機での戦闘被弾・回復・全滅動作確認）通過
 
- Step 3-5b: player.js のインベントリ・装備系の Inventory 委譲
  - 規模: addItem, removeItem, getInventoryCount, isInventoryFull, equipment を Inventory インスタンスへ委譲
  - 検証: Gate 1 ＋ Gate 2 ＋ Gate 3（アイテム入手・消費・装備変更の実機確認）
- Step 3-5c: player.js の経験値・成長・ゴールド系の委譲
  - 規模: addExp, addGold, useGold の委譲とレベルアップ時の Actor ステータス同期
  - 検証: Gate 1 ＋ Gate 2 ＋ Gate 3（戦闘勝利後の経験値・ゴールド獲得・レベルアップ確認）
- Step 3-5d: player.js のシリアライズ・デシリアライズ統合
  - 規模: serialize, deserialize を各 Core（Actor, Inventory, GenericFlags）の toJSON/fromJSON と統合
  - 検証: Gate 1 ＋ Gate 2 ＋ Gate 3（セーブデータの保存・復元・境界互換性検証）

### Phase 4: 出力ドライバの配線とヘッドレス実証 (Drivers/audio, ui)
目的: ロジック層から sound.js / ui.js の直接インポートを物理削除し、イベント駆動へ完全置換。
- Step 4-1: js/drivers/audio/WebAudioDriver.js の配線
  - 規模: 約 80 行（EventBus の音声再生要求イベントを購読して再生）
  - 検証: Gate 1 通過 ＋ 実機SE/BGM発火確認
- Step 4-2: js/drivers/ui/DomUiDriver.js（または HtmlSidebarDriver.js）の配線
  - 規模: 約 100 行（アクター状態変化イベントを購読してDOM更新）
  - 検証: Gate 1 通過 ＋ 実機サイドバーUI追従確認
- Step 4-3: ロジック層からの出力インポート完全撤廃
  - 規模: player.js, EffectResolver 等から DOM / Audio の参照を削除
  - 検証: Gate 1（境界違反ゼロ確認）＋ Driver を無効化してもロジックが 100% 走ることを実証

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
完了コミット: aeb29c2 (Step 3-5a: player.js の基本ステータス・回復/ダメージ系の Actor 委譲)
完了内容:
- js/player.js に Actor インスタンスを配備し、基本ステータス（hp, mp, maxHp, maxMp, isPoisoned）および関連メソッドを Core層へ委譲
- tools/test_player_actor_adapter.mjs を配備（全12項目の単体機能テスト合格）
- Gate 1, Gate 2, Gate 3 全件通過、クリーン状態を確認済み

次タスク:
- Phase 3 Step 3-5b: player.js のインベントリ・装備系の Inventory 委譲
  - 対象メソッド: addItem, removeItem, getInventoryCount, isInventoryFull, equipment
  - 対象プロパティ: inventory, equipment（getter/setter または Inventory 連携）
  - 前提制約: 外部コード（menu.js, battleActions.js, shop.js 等）の後方互換性維持
  - 運用必須要件:
    1. 事前探査（Inventory.js の公開IF、外部からの .inventory/.equipment 参照箇所の静的特定）
    2. 反映時の `git diff -U1 js/player.js` による差分局所性の検証
    3. tools/test_player_actor_adapter.mjs へのテスト累積追加（全テスト一括パス確認）

進捗台帳（progress.md）を提示します。
プロトコル第6条4に基づき、Phase 3 Step 3-5b（インベントリ・装備系の Inventory 委譲）の探査フェーズを開始してください。
800行規模コードの運用要件（git diff -U1 によるスコープ外改変検知、Gate 2 テストの累積検証）を厳格に適用してください。