// FILE_ENTRY: js/save.js
import { maps as mapsData } from './maps.js';
import { i18n } from './i18n.js';

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

export class SaveManager {
    static getSlotKey(slot = 1) {
        if (typeof slot !== 'number') {
            throw createProtocolError('TypeError', 'save.js:getSlotKey', 'slot', slot);
        }
        return `camino_de_leyenda_save_data_slot_${slot}`;
    }

    static formatDateTime(timestamp) {
        if (timestamp === undefined) {
            return i18n.t('slot.corrupted');
        }
        if (timestamp === null) {
            return i18n.t('slot.corrupted');
        }
        const d = new Date(timestamp);
        if (isNaN(d.getTime())) {
            return i18n.t('slot.corrupted');
        }
        const pad = (n) => String(n).padStart(2, '0');
        const year = d.getFullYear();
        const month = pad(d.getMonth() + 1);
        const day = pad(d.getDate());
        const hours = pad(d.getHours());
        const mins = pad(d.getMinutes());
        return `${year}/${month}/${day} ${hours}:${mins}`;
    }

    static getSlotSummary(slot = 1) {
        if (typeof slot !== 'number') {
            throw createProtocolError('TypeError', 'save.js:getSlotSummary', 'slot', slot);
        }
        try {
            let raw = localStorage.getItem(this.getSlotKey(slot));
            if (!raw) {
                if (slot === 1) {
                    raw = localStorage.getItem('camino_de_leyenda_save_data');
                }
            }
            if (!raw) {
                return i18n.t('slot.empty');
            }

            const data = JSON.parse(raw);
            let lv = 1;
            if (typeof data.playerStats === 'object') {
                if (data.playerStats !== null) {
                    if (typeof data.playerStats.level === 'number') {
                        lv = data.playerStats.level;
                    }
                }
            }

            let mapId = '';
            if (typeof data.location === 'object') {
                if (data.location !== null) {
                    if (typeof data.location.mapId === 'string') {
                        mapId = data.location.mapId;
                    }
                }
            }

            const mapDef = mapsData[mapId];
            let place = i18n.t('ui.none');
            if (mapDef) {
                if (mapDef.name) {
                    place = i18n.resolve(mapDef.name);
                } else {
                    place = mapId;
                }
            }

            const dateStr = this.formatDateTime(data.savedAt);
            return `${dateStr}  Lv.${lv} ${place}`;
        } catch (e) {
            console.warn('セーブデータの要約取得に失敗しました:', e);
            return i18n.t('slot.corrupted');
        }
    }

    static saveGame(player, currentMapId, maps, defeatedBosses, slot = 1) {
        if (typeof player !== 'object') {
            throw createProtocolError('TypeError', 'save.js:saveGame', 'player', player);
        }
        if (player === null) {
            throw createProtocolError('NullError', 'save.js:saveGame', 'player', player);
        }
        if (typeof player.serialize !== 'function') {
            throw createProtocolError('TypeError', 'save.js:saveGame', 'player.serialize', player.serialize);
        }
        if (typeof currentMapId !== 'string') {
            throw createProtocolError('TypeError', 'save.js:saveGame', 'currentMapId', currentMapId);
        }
        if (currentMapId.trim() === '') {
            throw createProtocolError('EmptyStringError', 'save.js:saveGame', 'currentMapId', currentMapId);
        }
        if (typeof maps !== 'object') {
            throw createProtocolError('TypeError', 'save.js:saveGame', 'maps', maps);
        }
        if (maps === null) {
            throw createProtocolError('NullError', 'save.js:saveGame', 'maps', maps);
        }
        if (!Array.isArray(defeatedBosses)) {
            throw createProtocolError('TypeError', 'save.js:saveGame', 'defeatedBosses', defeatedBosses);
        }
        if (typeof slot !== 'number') {
            throw createProtocolError('TypeError', 'save.js:saveGame', 'slot', slot);
        }

        try {
            let mapName = currentMapId;
            const targetMap = maps[currentMapId];
            if (typeof targetMap === 'object') {
                if (targetMap !== null) {
                    if (targetMap.name) {
                        mapName = i18n.resolve(targetMap.name);
                    }
                }
            }

            const saveData = {
                savedAt: Date.now(),
                playerStats: player.serialize(),
                location: {
                    mapId: currentMapId,
                    mapName: mapName,
                    gridX: player.gridX,
                    gridY: player.gridY,
                    direction: player.direction
                },
                chestStates: {},
                defeatedBosses: defeatedBosses
            };

            Object.keys(maps).forEach(mapId => {
                if (Array.isArray(maps[mapId].interactables)) {
                    saveData.chestStates[mapId] = maps[mapId].interactables.map(obj => {
                        if (obj.isOpen === true) {
                            return true;
                        }
                        return false;
                    });
                } else {
                    saveData.chestStates[mapId] = [];
                }
            });

            localStorage.setItem(this.getSlotKey(slot), JSON.stringify(saveData));
            return true;
        } catch (e) {
            console.error('セーブデータの保存に失敗しました(Cookieブロックの可能性):', e);
            return false;
        }
    }

    static loadGame(player, defeatedBosses, maps, changeMapCallback, slot = 1) {
        if (typeof player !== 'object') {
            throw createProtocolError('TypeError', 'save.js:loadGame', 'player', player);
        }
        if (player === null) {
            throw createProtocolError('NullError', 'save.js:loadGame', 'player', player);
        }
        if (typeof player.deserialize !== 'function') {
            throw createProtocolError('TypeError', 'save.js:loadGame', 'player.deserialize', player.deserialize);
        }
        if (!Array.isArray(defeatedBosses)) {
            throw createProtocolError('TypeError', 'save.js:loadGame', 'defeatedBosses', defeatedBosses);
        }
        if (typeof maps !== 'object') {
            throw createProtocolError('TypeError', 'save.js:loadGame', 'maps', maps);
        }
        if (maps === null) {
            throw createProtocolError('NullError', 'save.js:loadGame', 'maps', maps);
        }
        if (typeof changeMapCallback !== 'function') {
            throw createProtocolError('TypeError', 'save.js:loadGame', 'changeMapCallback', changeMapCallback);
        }
        if (typeof slot !== 'number') {
            throw createProtocolError('TypeError', 'save.js:loadGame', 'slot', slot);
        }

        try {
            let data = localStorage.getItem(this.getSlotKey(slot));
            if (!data) {
                if (slot === 1) {
                    data = localStorage.getItem('camino_de_leyenda_save_data');
                }
            }
            if (!data) {
                return false;
            }

            const saveData = JSON.parse(data);
            player.deserialize(saveData);

            defeatedBosses.length = 0;
            if (saveData.defeatedBosses) {
                if (Array.isArray(saveData.defeatedBosses)) {
                    saveData.defeatedBosses.forEach(bossId => defeatedBosses.push(bossId));
                }
            }

            Object.keys(maps).forEach(mapId => {
                if (maps[mapId].interactables) {
                    maps[mapId].interactables.forEach(obj => {
                        if (obj.type === 'chest') {
                            obj.isOpen = false;
                        }
                    });
                }
            });

            if (saveData.chestStates) {
                Object.keys(maps).forEach(mapId => {
                    if (saveData.chestStates[mapId]) {
                        if (maps[mapId].interactables) {
                            maps[mapId].interactables.forEach((obj, idx) => {
                                if (saveData.chestStates[mapId][idx] !== undefined) {
                                    if (saveData.chestStates[mapId][idx] === true) {
                                        obj.isOpen = true;
                                    } else {
                                        obj.isOpen = false;
                                    }
                                }
                            });
                        }
                    }
                });
            }

            let loc = { mapId: 'first_town', gridX: 15, gridY: 15, direction: 'down' };
            if (typeof saveData.location === 'object') {
                if (saveData.location !== null) {
                    loc = saveData.location;
                }
            }

            changeMapCallback(loc.mapId, loc.gridX, loc.gridY, loc.direction);
            return true;
        } catch (e) {
            console.error('セーブデータのロードに失敗しました:', e);
            return false;
        }
    }

    static exportAllData(maxSlots = 10) {
        if (typeof maxSlots !== 'number') {
            throw createProtocolError('TypeError', 'save.js:exportAllData', 'maxSlots', maxSlots);
        }
        try {
            const allData = {};
            for (let i = 1; i <= maxSlots; i++) {
                const raw = localStorage.getItem(this.getSlotKey(i));
                if (raw) {
                    allData[`slot_${i}`] = JSON.parse(raw);
                }
            }
            return JSON.stringify(allData);
        } catch (e) {
            console.error('バックアップ作成に失敗しました:', e);
            return null;
        }
    }

    static importAllData(jsonString, maxSlots = 10) {
        if (typeof jsonString !== 'string') {
            throw createProtocolError('TypeError', 'save.js:importAllData', 'jsonString', jsonString);
        }
        if (typeof maxSlots !== 'number') {
            throw createProtocolError('TypeError', 'save.js:importAllData', 'maxSlots', maxSlots);
        }
        try {
            const allData = JSON.parse(jsonString);
            for (let i = 1; i <= maxSlots; i++) {
                const key = `slot_${i}`;
                if (allData[key]) {
                    localStorage.setItem(this.getSlotKey(i), JSON.stringify(allData[key]));
                }
            }
            return true;
        } catch (e) {
            console.error('バックアップの復元に失敗しました:', e);
            return false;
        }
    }
}
