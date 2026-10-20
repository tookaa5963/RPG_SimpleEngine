export const MAP_LIST = [
  'first_island',
  'lighthousekeeper_cottage',
  'cave',
  'dungeon',
  'first_dungeon2',
  'first_town',
  'first_church',
  'inn',
  'armor_shop',
  'general_shop',
  'port_town',
  'port_church',
  'port_inn',
  'port_armor_shop',
  'port_general_shop',
  'forest',
  'forest2',
  'forest3',
  'temple',
  'deep_forest',
  'temple11',
  'temple21',
  'temple22',
  'temple3',
  'undersea_tunnel1',
  'undersea_tunnel2',
  'undersea_tunnel3',
  'dwarf_village',
  'dwarf_village_general_shop',
  'dragonera_island',
  'dragons_cave1',
  'dragons_cave2'
];

export let maps = {};

export async function initMapData() {
  try {
    const mapPromises = MAP_LIST.map(async (mapId) => {
      const response = await fetch(`data/maps/${mapId}.json`);
      if (!response.ok) {
        throw new Error(`マップデータ ${mapId}.json の取得に失敗しました (ステータスコード: ${response.status})`);
      }
      const data = await response.json();
      return { id: mapId, data: data };
    });

    const loadedMaps = await Promise.all(mapPromises);
    loadedMaps.forEach(map => {
      maps[map.id] = map.data;
    });

    console.log("マップデータのロードが完了しました。");

  } catch (error) {
    console.error("マップデータの初期化中に致命的なエラーが発生しました:", error);
    throw new Error("マップデータの初期化に失敗したため、エンジンを停止します。");
  }
}
