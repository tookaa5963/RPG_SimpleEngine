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
- [202610271800] Gate 1 静的検証ランナー (tools/verify_gate1.mjs) の配備
- [202610271800] .gitignore による ai_staging/ の隔離
- [202610271800] 初期動作検証（Gate 1 の正常系・異常系テスト実行）

### Phase 1: メッセージング基盤配備 (Core/core)
目的: Core が画面・音声・DOMを知らずに状態変化を通知できる「共通受け皿」を配置する。
- [202610281900]Step 1-1: js/engine/core/EventTypes.js の新規作成
  - 規模: 約 30 行（システム全体で利用するイベント名定数定義）
  - 検証: Gate 1（構文・境界検証）通過
- [202610281900] Step 1-2: js/engine/core/EngineEventBus.js の新規作成
  - 規模: 約 60 行（外部依存ゼロの純粋 Pub/Sub ハブ: on, off, emit, clear）
  - 検証: Gate 1 通過 ＋ Gate 2（単体テストスクリプトによる動作検証）
- [202610282045] Step 1-3: main.js へのグローバル/コンテキスト配線
  - 規模: 既存 main.js にインスタンス生成と保持（約 5 行追加）
  - 検証: Gate 3（ブラウザ実機起動・既存動作無影響確認）

※Phase 2（効果解決）と Phase 3（Actor）の依存関係の逆転リスク   の課題あり
再検討の上でPhase 2  に移行すること

### Phase 2: 効果解決系（EffectSystem）垂直スライス抽出 (Core/effects)
【Phase 2 固有設計制約】
1. 副作用（Mutation）の完全禁止:
   - EffectResolver および各 Effect クラスは、引数で渡された Target（Player や Monster）のプロパティを直接変更してはならない（`target.hp += x` 等の禁止）。
   - 計算結果（変動量、成否、付随情報）を含むプレーンな Result オブジェクトのみを呼び出し元へ返却すること。
2. イベント発火の分離:
   - Effect 内部で `EngineEventBus.emit()` を直接呼ばない。状態の変更およびイベントの発火は、Result を受け取った呼び出し側（menu.js, battleActions.js、将来の Actor）が担う

-[202610282231] Step 2-1: データスキーマ拡張（data/items/i_*.json, data/spells/s_*.json）
  - 規模: 回復アイテム3件、回復呪文3件への effect 定義付与（集約JSONの二重定義は排除）
  - 検証: Gate 1（JSON構文・構造検証）通過
-[202610290130] Step 2-2: js/engine/effects/EffectResolver.js の新規作成
  - 規模: 約 80 行（strategy 名を解釈し対応クラスへ委譲するディスパッチャ）
  - 検証: Gate 1 ＋ Gate 2 ＋ Gate 3 通過
- [202610290215] Step 2-3: js/engine/effects/HealHpEffect.js の新規作成
  - 規模: 約 170 行（HP回復計算ストラテジー、完全ヘッドレス・副作用ゼロ・Tier 3構文準拠）
  - 検証: Gate 1 ＋ Gate 2 通過
- [202610290245] Step 2-4a: js/engine/effects/HealMpEffect.js の新規作成
  - 規模: 約 160 行（MP回復計算ストラテジー、完全ヘッドレス・副作用ゼロ・Tier 3構文準拠）
  - 検証: Gate 1 ＋ Gate 2 通過
- [202610290333] Step 2-4b: js/engine/effects/CureStatusEffect.js の新規作成
  - 規模: 約 120 行（状態異常解除ストラテジー、完全ヘッドレス・副作用ゼロ・Tier 3構文準拠）
  - 検証: Gate 1 ＋ Gate 2 通過
- [202610291120] Step 2-4c: データスキーマ拡張（MP回復系アイテム: i_magic_water.json, i_sage_water.json）
  - 規模: MP回復アイテム2件への heal_mp effect 定義付与
  - 検証: Gate 1（JSON構文・境界検証）通過
- [202610291133] Step 2-4d: データスキーマ拡張（状態異常解除系: i_antidote.json, s_kiari.json）
  - 規模: アイテム1件、呪文1件への cure_status effect 定義付与
  - 検証: Gate 1（JSON構文・境界検証）通過
- [202610291225] Step 2-4e: EffectResolver への全ストラテジー登録配線
  - 規模: EffectResolver または初期化箇所にて HealMpEffect / CureStatusEffect を登録
  - 検証: Gate 1 ＋ Gate 2（全ストラテジーのディスパッチ疎通テスト）通過
- [202610291410] Step 2-5: menu.js（フィールド使用）の委譲切り替え
  - 規模: menu.js 内の重複分岐を削除し、EffectResolver.resolve() へ置換
  - 検証: Gate 1 ＋ Gate 3（実機フィールド上で回復アイテム・呪文使用確認）通過
- [202610291450] Step 2-6: battleActions.js（戦闘使用）の委譲切り替え
  - 規模: battleActions.js 内の重複回復ロジックを削除し、EffectResolver.resolve() へ置換
  - 検証: Gate 1 ＋ Gate 3（実機戦闘で回復アイテム・呪文使用確認）通過

### Phase 3: 汎用ステート・アクター・データ層のCore化 (Core/entities, state, data)
目的: アクターモデルの確立、フラグ・変数のヘッドレス管理、DataRepository によるデータ参照の統一。
- [202610291720] Step 3-1: js/engine/state/GenericFlags.js, VariableStore.js の新規作成
  - 規模: 各 約 110〜160 行（ブール値ストア、汎用 Key-Value ストア）
  - 検証: Gate 1 ＋ Gate 2 通過
- Step 3-2: js/engine/entities/Actor.js の新規作成
  - 規模: 約 150 行（ステータス保持、applyDamage, applyHeal の境界防護・イベント通知）
  - 検証: Gate 1 ＋ Gate 2 通過
- Step 3-3: js/engine/state/Inventory.js の新規作成
  - 規模: 約 80 行（アイテムID・数量管理、装備枠の抽象管理）
  - 検証: Gate 1 ＋ Gate 2 通過
- Step 3-4: js/engine/data/DataRepository.js の新規作成
  - 規模: 約 80 行（JSON データのロード・検証・キャッシュ）
  - 検証: Gate 1 ＋ Gate 2 通過
- Step 3-5: player.js の内部委譲リファクタリング
  - 規模: player.js の内部プロパティを Actor, GenericFlags, Inventory へ委譲
  - 検証: Gate 3（ゲーム起動、移動、セーブ・ロードで既存挙動と一致することを確認）

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
完了コミット: （8083a47）
完了内容:
- js/engine/state/GenericFlags.js および VariableStore.js を新規作成
- Gate 1（静的構文・境界検証：対象 8 件）および Gate 2（単体機能テスト）通過
- Core層におけるフラグ・変数のヘッドレス管理基盤を配備

次タスク:
- Phase 3 Step 3-2: js/engine/entities/Actor.js の新規作成
  - 規模: 約 150 行（ステータス保持、applyDamage, applyHeal の境界防護・イベント通知）
  - 検証: Gate 1 ＋ Gate 2 通過

