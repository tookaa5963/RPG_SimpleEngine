// FILE_ENTRY: js/maps.js
import { i18n } from './i18n.js';

export const maps = {};
let isLoaded = false;

/**
 * プロパティに対して i18n.resolve を動的バインドするユーティリティ
 */
function bindI18nGetter(target, propKey) {
  if (target[propKey] && typeof target[propKey] === 'object' && !Array.isArray(target[propKey])) {
    const rawData = target[propKey];
    Object.defineProperty(target, propKey, {
      get: () => i18n.resolve(rawData),
      enumerable: true,
      configurable: true
    });
  }
}

/**
 * マップデータ内の多言語オブジェクトに動的ゲッターを再帰的に適用
 */
function applyI18nGetters(mapData) {
  if (mapData.name) bindI18nGetter(mapData, 'name');

  if (Array.isArray(mapData.npcs)) {
    mapData.npcs.forEach(npc => {
      if (npc.pages) bindI18nGetter(npc, 'pages');
      if (npc.greeting) bindI18nGetter(npc, 'greeting');
    });
  }

  if (Array.isArray(mapData.interactables)) {
    mapData.interactables.forEach(obj => {
      if (obj.pages) bindI18nGetter(obj, 'pages');
    });
  }
}

/**
 * 全マップデータのロードと初期化を実行する外部公開API
 */
export async function initMapData() {
  if (isLoaded) return maps;

  try {
    const manifestRes = await fetch('data/maps/index.json');
    if (!manifestRes.ok) {
      throw new Error(`[DataValidationError] maps.js: マップマニフェスト取得失敗 (status: ${manifestRes.status})`);
    }

    const manifest = await manifestRes.json();
    if (!manifest || !Array.isArray(manifest.maps)) {
      throw new Error(`[DataValidationError] maps.js: マニフェスト形式が不正です (型: ${typeof manifest})`);
    }

    const loadPromises = manifest.maps.map(async (entry) => {
      const mapId = typeof entry === 'string' ? entry : entry.id;
      const mapFile = typeof entry === 'string' ? `${entry}.json` : entry.file;

      if (!mapId || typeof mapId !== 'string') {
        throw new Error(`[DataValidationError] maps.js: マップIDが不正です (値: ${mapId})`);
      }

      const mapUrl = `data/maps/${mapFile}`;
      const res = await fetch(mapUrl);
      if (!res.ok) {
        throw new Error(`[DataValidationError] maps.js: マップデータ取得失敗: ${mapId} (status: ${res.status})`);
      }
      
      const rawMapData = await res.json();
      
      const requiredProps = ['data', 'warps', 'npcs', 'interactables'];
      for (const prop of requiredProps) {
        if (!rawMapData[prop]) {
          throw new Error(`[DataValidationError] maps.js: ${mapId} に必須プロパティ "${prop}" が存在しません。`);
        }
      }

      applyI18nGetters(rawMapData);

      return { mapId, rawMapData };
    });

    const loadedMaps = await Promise.all(loadPromises);
    loadedMaps.forEach(({ mapId, rawMapData }) => {
      maps[mapId] = rawMapData;
    });

    isLoaded = true;
    return maps;

  } catch (err) {
    console.error('[MapManager] 初期化中に致命的エラーを検知しました:', err);
    throw err;
  }
}

// 念のためトップレベルでも初期化を実行しておく
await initMapData();
