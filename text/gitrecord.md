202610281956/3ec821d6de00e454af294fbedb818cb163b61438
202610282026/Phase 1 Step 1-2 完了（EngineEventBus.js の配備・Gate 1 および Gate 2 通過）/cad1687
202610282046/Phase 1 完了（EventTypes, EngineEventBus の配備および main.js への配線完了）/c6c3bc2
202610282231/Phase 2　Step 2-1: データスキーマ拡張（data/items/i_*.json, data/spells/s_*.json）/a886eaa
202610290130/Step 2-2: js/engine/effects/EffectResolver.js の新規作成/cf51492d50940a7f09068e590d1541bb1411e35e
202610290222/js/engine/effects/HealHpEffect.js の新規配備・tools/test_heal_hp_effect.mjs の配備/8d7147351098ec753cf08a1da4a49cf133cdb8bf
202610290306/js/engine/effects/HealMpEffect.js の新規配備/bb04b0712a6813757dd0a06b92ebf80b315fb225
202610291120/data/items/i_magic_water.json および i_sage_water.json への heal_mp effect 定義付与/8d53028b58aa39c37cf7b3248a333991d62f021b
[202610291133] Step 2-4d: データスキーマ拡張（状態異常解除系: i_antidote.json, s_kiari.json）/1dc99023e3d1a8e4a1bdff8cf797652ddb0cf3a3
[202610291225] Step 2-4e: EffectResolver への全ストラテジー登録配線/4793415432042df3fc90a3bd805e0bb222a9ef35
[202610291450] Step 2-6: battleActions.js（戦闘使用）の委譲切り替え/b30a355e17b99875b5a51987e92629cff6d29907
[202610291720] Step 3-1: js/engine/state/GenericFlags.js, VariableStore.js の新規作成/8083a47ed302047935efe0057f6e0639d1afc00e
[202610291956] Step 3-2: js/engine/entities/Actor.js の新規作成e67c4650fb8b863449f9f3551eef2812731f0743
[202610292020] Step 3-3: js/engine/state/Inventory.js の新規作成/14fe435be2a24ccb0bb79902bf07594e3db0a78b
[202610292115] Step 3-4: js/engine/data/DataRepository.js の新規作成/0ecf08cfeeed2b5f66807bab4ba2c97a21c62a50
[202610300145] Step 3-5a: player.js の基本ステータス・回復/ダメージ系の Actor 委譲/d3a2298b2f6af28c4a1164a0879b61b12206bf5a
[202610300326] Step 3-5b: player.js のインベントリ・装備系の Inventory 委譲/03a252591fed43c17084133eae6763e04a5cc051
[202610302053] Step 3-5c: player.js の経験値・成長・ゴールド系の委譲/e465ca1cc7e28e6e42d9c5898a20ae775ff795d3
[202610310230] Step 3-5d: player.js のステータス・インベントリ系シリアライズ統合/e7ca30a0b57887b3fd7093b5e64b7d79854a5002
[202610311200] Step 4-1: js/drivers/audio/WebAudioDriver.js の配線（Gate 1, 2, 3 通過）/9a09b8197fe9498a53f6dae0f068399f8fadde67
- [202610311515] Step 4-2: js/drivers/ui/DomUiDriver.js の配線（Gate 1, 2, 3 通過）/dae57268c25cc552d101e9dc20cd559b295d0839
- [202610311915] Step 4-3: tools/test_headless_run.mjs の新規作成（完全ヘッドレス実証テスト配備 / Gate 1, 2 通過）/fb22b4ebbaee3c2ba3f4d6669065d76a3133ca45
- [202610311915]Step5-1直前検討後の書類更新/
4729a9a48bb97d561045190039d2b5f3a42d0dad
- [202611011622]Step Pre-1a [受け皿先行]**: `js/events.js` にジャーナル判定純粋関数 `resolveCurrentObjectiveKey(player)` を新設。`tools/test_objectives.mjs` を配備/ab2aa554926b8c3c8fc4c9a4818b5d2a6adb645b