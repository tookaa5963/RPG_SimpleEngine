 得られた知見をここに集積してください。
 
  - ai_staging は作業一時領域のため、恒久的な文書は置かないこと。

  - tools/verify_gate1.mjs の引数には単一ファイルではなくディレクトリパスを指定すること

  - main.js の更新時は局所適用スクリプトを用い、全体再生成によるデグレを防止すること。
  
  -アイテムおよび呪文の実行時マスターデータは data/items/i_${id}.json および data/spells/s_${id}.json の個別ファイル群である。

  -ルート直下の data/items.json および data/spells.json はコードから参照されていないため、変更対象から除外してSSOTを維持する。
