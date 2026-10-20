// FILE_ENTRY: js/save.js
import { i18n } from './i18n.js';

export class SaveManager {
  static getSlotKey(slot = 1) {
    return `camino_de_leyenda_save_data_slot_${slot}`;
  }

  static formatDateTime(timestamp) {
    if (!timestamp) return i18n.t('slot.corrupted');
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return i18n.t('slot.corrupted');
    const pad = (n) => String(n).padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const mins = pad(d.getMinutes());
    return `${year}/${month}/${day} ${hours}:${mins}`;
  }

  static getSlotSummary(slot = 1) {
    try {
      let raw = localStorage.getItem(this.getSlotKey(slot));
      if (!raw && slot === 1) {
        raw = localStorage.getItem('camino_de_leyenda_save_data');
      }
      if (!raw) return i18n.t('slot.empty');

      const data = JSON.parse(raw);
      const lv = data.playerStats?.level ?? 1;
      const place = i18n.getMapName(data.location?.mapId) || i18n.t('ui.none');
      const dateStr = this.formatDateTime(data.savedAt);
      return `${dateStr}  Lv.${lv} ${place}`;
    } catch (e) {
      console.warn('セーブデータの要約取得に失敗しました:', e);
      return i18n.t('slot.corrupted');
    }
  }

  static saveGame(player, currentMapId, maps, defeatedBosses, slot = 1) {
    try {
      const saveData = {
        savedAt: Date.now(),
        playerStats: player.serialize(),
        location: {
          mapId: currentMapId,
          mapName: i18n.getMapName(currentMapId) || maps[currentMapId]?.name || currentMapId,
          gridX: player.gridX,
          gridY: player.gridY,
          direction: player.direction
        },
        chestStates: {},
        defeatedBosses: defeatedBosses
      };

      Object.keys(maps).forEach(mapId => {
        saveData.chestStates[mapId] = maps[mapId].interactables.map(obj => obj.isOpen || false);
      });

      localStorage.setItem(this.getSlotKey(slot), JSON.stringify(saveData));
      return true;
    } catch (e) {
      console.error('セーブデータの保存に失敗しました(Cookieブロックの可能性):', e);
      return false;
    }
  }

  static loadGame(player, defeatedBosses, maps, changeMapCallback, slot = 1) {
    try {
      let data = localStorage.getItem(this.getSlotKey(slot));
      if (!data && slot === 1) {
        data = localStorage.getItem('camino_de_leyenda_save_data');
      }
      if (!data) return false;

      const saveData = JSON.parse(data);
      player.deserialize(saveData);

      defeatedBosses.length = 0;
      if (saveData.defeatedBosses && Array.isArray(saveData.defeatedBosses)) {
        saveData.defeatedBosses.forEach(bossId => defeatedBosses.push(bossId));
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
          if (saveData.chestStates[mapId] && maps[mapId].interactables) {
            maps[mapId].interactables.forEach((obj, idx) => {
              if (saveData.chestStates[mapId][idx] !== undefined) {
                obj.isOpen = !!saveData.chestStates[mapId][idx];
              }
            });
          }
        });
      }

      const loc = saveData.location || { mapId: 'first_town', gridX: 15, gridY: 15, direction: 'down' };
      changeMapCallback(loc.mapId, loc.gridX, loc.gridY, loc.direction);
      return true;
    } catch (e) {
      console.error('セーブデータのロードに失敗しました:', e);
      return false;
    }
  }

  // ★ 追加: 全スロットのデータをまとめてエクスポート
  static exportAllData(maxSlots = 10) {
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

  // ★ 追加: JSONデータから全スロットを復元（インポート）
  static importAllData(jsonString, maxSlots = 10) {
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