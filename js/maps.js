/**
 * プロトコル第3項準拠の高解像度例外を生成する決定論的ヘルパー
 * @param {string} type 例外種別
 * @param {string} contextId 発生箇所（ファイル名:関数名）
 * @param {string} propName 不正を検知したプロパティ名
 * @param {*} val 実際に渡された値
 * @returns {Error}
 */
export function createProtocolError(type, contextId, propName, val) {
    return new Error(`[${type}] ${contextId}: プロパティ "${propName}" が不正です (値: ${JSON.stringify(val)}, 型: ${typeof val})`);
}

export const maps = {};
let isLoaded = false;

/**
 * 全マップデータのロードと初期化を実行する外部公開API
 */
export async function initMapData() {
    if (isLoaded) {
        return maps;
    }

    const manifestRes = await fetch('data/maps/index.json');
    if (!manifestRes.ok) {
        throw createProtocolError('HttpError', 'maps.js:initMapData', 'manifestRes.status', manifestRes.status);
    }

    const manifest = await manifestRes.json();
    if (typeof manifest !== 'object') {
        throw createProtocolError('TypeError', 'maps.js:initMapData', 'manifest', manifest);
    }
    if (manifest === null) {
        throw createProtocolError('NullValueError', 'maps.js:initMapData', 'manifest', manifest);
    }
    if (!Array.isArray(manifest.maps)) {
        throw createProtocolError('TypeError', 'maps.js:initMapData', 'manifest.maps', manifest.maps);
    }

    const loadPromises = manifest.maps.map(async (entry) => {
        let mapId = '';
        let mapFile = '';

        if (typeof entry === 'string') {
            mapId = entry;
            mapFile = `${entry}.json`;
        } else {
            if (typeof entry !== 'object') {
                throw createProtocolError('TypeError', 'maps.js:initMapData', 'entry', entry);
            }
            if (entry === null) {
                throw createProtocolError('NullValueError', 'maps.js:initMapData', 'entry', entry);
            }
            if (typeof entry.id !== 'string') {
                throw createProtocolError('TypeError', 'maps.js:initMapData', 'entry.id', entry.id);
            }
            if (typeof entry.file !== 'string') {
                throw createProtocolError('TypeError', 'maps.js:initMapData', 'entry.file', entry.file);
            }
            mapId = entry.id;
            mapFile = entry.file;
        }

        if (typeof mapId !== 'string') {
            throw createProtocolError('TypeError', 'maps.js:initMapData', 'mapId', mapId);
        }
        if (mapId.trim() === '') {
            throw createProtocolError('EmptyStringError', 'maps.js:initMapData', 'mapId', mapId);
        }

        const mapUrl = `data/maps/${mapFile}`;
        const res = await fetch(mapUrl);
        if (!res.ok) {
            throw createProtocolError('HttpError', 'maps.js:initMapData', `map_${mapId}.status`, res.status);
        }

        const rawMapData = await res.json();
        if (typeof rawMapData !== 'object') {
            throw createProtocolError('TypeError', 'maps.js:initMapData', `rawMapData_${mapId}`, rawMapData);
        }
        if (rawMapData === null) {
            throw createProtocolError('NullValueError', 'maps.js:initMapData', `rawMapData_${mapId}`, rawMapData);
        }

        const requiredProps = ['data', 'warps', 'npcs', 'interactables'];
        for (const prop of requiredProps) {
            if (typeof rawMapData[prop] === 'undefined') {
                throw createProtocolError('MissingPropertyError', 'maps.js:initMapData', `${mapId}.${prop}`, undefined);
            }
            if (rawMapData[prop] === null) {
                throw createProtocolError('NullValueError', 'maps.js:initMapData', `${mapId}.${prop}`, null);
            }
        }

        return { mapId, rawMapData };
    });

    const loadedMaps = await Promise.all(loadPromises);
    loadedMaps.forEach(({ mapId, rawMapData }) => {
        maps[mapId] = rawMapData;
    });

    isLoaded = true;
    return maps;
}

// 念のためトップレベルでも初期化を実行しておく
await initMapData();
