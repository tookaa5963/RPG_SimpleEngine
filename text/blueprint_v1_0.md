# 汎用RPGエンジン 完全アーキテクチャ青写真 (v1.0)

**作成日時**: 2026年10月27日 18:20

---

### 1. ディレクトリ構造と既存ファイルの全対応表

```text
rpg_simple_engine/
├── data/                      # 静的データ（JSON：アイテム、敵、マップ、イベント等）
│
├── js/
│   ├── engine/                # 【Core層】完全ヘッドレス・純粋ロジック（DOM/ブラウザAPI禁止）
│   │   ├── core/              # 基盤（ゲームループ、イベントバス、状態管理）
│   │   ├── data/              # DataRepository（JSONデータのロード・検証・キャッシュ）
│   │   ├── save/              # SaveManager（セーブデータの生成・復元ロジック）←【save.jsのロジック】
│   │   ├── event/             # EventManager（フラグ台帳、NPCイベント進行）←【events.js】
│   │   ├── message/           # MessageFormatter（動的テキスト置換）←【logFormatter.js, message.js】
│   │   ├── field/             # フィールド移動、当たり判定、エンカウント←【fieldManager.js】
│   │   ├── facilities/        # 店・宿・教会の取引・回復計算ルール←【shop.js, inn.js, church.js】
│   │   └── battle/            # ターン制御、ダメージ計算、勝敗判定←【battle.js, battleActions.js】
│   │
│   ├── drivers/               # 【Driver層】ブラウザ・環境依存処理
│   │   ├── storage/           # LocalStorageDriver（セーブデータの保存・読出）←【save.jsのI/O】
│   │   ├── input/             # Keyboard/TouchDriver（入力検知）←【input.js】
│   │   ├── audio/             # WebAudioDriver（BGM/SE再生）←【sound.js】
│   │   ├── canvas/            # CanvasRenderer（マップ・キャラ描画）←【renderer.js, battleEffects.js】
│   │   └── ui/                # DomUiDriver（HTMLテキスト表示、ダイアログ）←【ui.js, slotDialog.js, locale.js】
│   │
│   └── (既存JS群)             # 移行期間中、Core/Driverへ中身を委譲しながら段階的に削ぎ落とす
