# 汎用RPGエンジン移行 進捗台帳 (PROGRESS.md)

- **最終更新**: 2026-10-27
- **準拠規約**: 汎用RPGエンジン移行運用プロトコル ver 1.2
- **設計仕様**: 汎用RPGエンジン 完全アーキテクチャ青写真 v1.0
- **現在地**: Phase 0 (環境準備)

---

## 運用プロトコル要約 (ver 1.2)
1. **Tier原則**: 疎結合化 (Tier 1) ＞ ヘッドレス化 (Tier 2) ＞ 構文制限 (Tier 3)
2. **承認ゲート**: 方針合意前にコードを出力しない。推測による実装禁止。
3. **隔離環境**: `./ai_staging/` 経由でのみ本番へ配置する。
4. **3段階検証 (DoD)**: Gate 1 (静的スキャン) → Gate 2 (単体テスト) → Gate 3 (実機動作確認)。
5. **セッション境界**: 1タスク完了でセッション破棄・外部台帳で引継ぎ。

---

## アーキテクチャ構成マップ (Core / Driver)
- `js/engine/` (Core層: 完全ヘッドレス・DOM/ブラウザAPI禁止・禁止構文スキャン対象)
  - `core/`: 基盤・ループ・イベントバス
  - `data/`: DataRepository (JSON管理・参照)
  - `save/`: SaveManager (セーブデータ生成・復元)
  - `event/`: EventManager (フラグ連関・シナリオ進行)
  - `message/`: MessageFormatter (動的テキスト置換)
  - `field/`: 移動・当たり判定・エンカウント計算
  - `facilities/`: 店・宿・教会の計算ルール
  - `battle/`: ターン制御・ダメージ計算・勝敗判定
- `js/drivers/` (Driver層: 環境依存処理)
  - `storage/`, `input/`, `audio/`, `canvas/`, `ui/`
- `js/` (レガシー層: 既存の24ファイル。段階的にCore/Driverへ縮退)

---

## フェーズ別チェックリスト

### Phase 0: 環境準備
- [ ] Gate 1 静的検証ランナー (`tools/verify_gate1.mjs`) の配備
- [ ] `.gitignore` による `ai_staging/` の隔離
- [ ] 初期動作検証（Gate 1 の正常系・異常系テスト実行）

### Phase 1: データ取得層のCore化 (DataRepository)
- [ ] `engine/data/DataRepository.js` の設計・単体テスト
- [ ] `items.js`, `monsters.js` からの参照切り替え

### Phase 2: 純粋計算ロジックのCore抽出
- [ ] `battle.js` の計算関数分離 (`engine/battle/BattleCalculator.js`)
- [ ] `fieldManager.js` の当たり判定分離 (`engine/field/CollisionCalculator.js`)

### Phase 3: ステート管理の導入 (SceneManager)
- [ ] `engine/core/SceneManager.js` の配備
- [ ] `main.js` のオーケストレーション解体

### Phase 4: Driver層の完全分離
- [ ] レンダラー・UI・オーディオ・入力の完全委譲