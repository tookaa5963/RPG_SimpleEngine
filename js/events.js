// FILE_ENTRY: js/events.js
import { audioService } from './audioService.js';
import { i18n } from './i18n.js';

/**
 * プロトコル第3項準拠の高解像度例外を生成する決定論的ヘルパー
 * @param {string} type 例外種別
 * @param {string} contextId 発生箇所
 * @param {string} propName 不正を検知したプロパティ名
 * @param {*} val 実際に渡された値
 * @returns {Error}
 */
export function createProtocolError(type, contextId, propName, val) {
  return new Error(`[${type}] ${contextId}: プロパティ "${propName}" が不正です (値: ${JSON.stringify(val)}, 型: ${typeof val})`);
}

let isLoaded = false;
const rawEventDb = {};
const rawObjectivesDb = {};
const rawEndingDb = {};

function createDbProxy(name, rawTarget) {
  return new Proxy(rawTarget, {
    get(target, prop, receiver) {
      if (typeof prop === 'string') {
        if (!isLoaded) {
          throw createProtocolError('NotInitializedError', `events.js:${name}`, prop, undefined);
        }
        if (!(prop in target)) {
          throw createProtocolError('NotFoundError', `events.js:${name}`, prop, undefined);
        }
      }
      return Reflect.get(target, prop, receiver);
    },
    has(target, prop) {
      if (!isLoaded) {
        throw createProtocolError('NotInitializedError', `events.js:${name}`, prop, undefined);
      }
      return Reflect.has(target, prop);
    }
  });
}

export const EVENT_DB = createDbProxy('EVENT_DB', rawEventDb);
export const OBJECTIVES_DB = createDbProxy('OBJECTIVES_DB', rawObjectivesDb);
export const ENDING_DB = createDbProxy('ENDING_DB', rawEndingDb);

export async function initEventData() {
  if (isLoaded) {
    return;
  }

  const manifestRes = await fetch('data/events/index.json');
  if (!manifestRes.ok) {
    throw createProtocolError('NetworkError', 'events.js:initEventData', 'manifestRes.status', manifestRes.status);
  }

  const manifest = await manifestRes.json();
  if (manifest === null) {
    throw createProtocolError('NullReferenceError', 'events.js:initEventData', 'manifest', manifest);
  }
  if (typeof manifest !== 'object') {
    throw createProtocolError('TypeError', 'events.js:initEventData', 'manifest', manifest);
  }
  if (!Array.isArray(manifest.chapters)) {
    throw createProtocolError('TypeError', 'events.js:initEventData', 'manifest.chapters', manifest.chapters);
  }

  const loadPromises = manifest.chapters.map(async (filename) => {
    if (typeof filename !== 'string') {
      throw createProtocolError('TypeError', 'events.js:initEventData', 'filename', filename);
    }
    const res = await fetch(`data/events/${filename}`);
    if (!res.ok) {
      throw createProtocolError('NetworkError', 'events.js:initEventData', filename, res.status);
    }
    return await res.json();
  });

  const [chapters, objectivesRes, endingRes] = await Promise.all([
    Promise.all(loadPromises),
    fetch('data/events/objectives.json'),
    fetch('data/events/ending.json')
  ]);

  if (!objectivesRes.ok) {
    throw createProtocolError('NetworkError', 'events.js:initEventData', 'objectivesRes.status', objectivesRes.status);
  }
  const objectivesJson = await objectivesRes.json();
  if (objectivesJson === null) {
    throw createProtocolError('NullReferenceError', 'events.js:initEventData', 'objectivesJson', objectivesJson);
  }
  if (typeof objectivesJson !== 'object') {
    throw createProtocolError('TypeError', 'events.js:initEventData', 'objectivesJson', objectivesJson);
  }
  if (Array.isArray(objectivesJson)) {
    throw createProtocolError('TypeError', 'events.js:initEventData', 'objectivesJson', objectivesJson);
  }

  if (!endingRes.ok) {
    throw createProtocolError('NetworkError', 'events.js:initEventData', 'endingRes.status', endingRes.status);
  }
  const endingJson = await endingRes.json();
  if (endingJson === null) {
    throw createProtocolError('NullReferenceError', 'events.js:initEventData', 'endingJson', endingJson);
  }
  if (typeof endingJson !== 'object') {
    throw createProtocolError('TypeError', 'events.js:initEventData', 'endingJson', endingJson);
  }
  if (Array.isArray(endingJson)) {
    throw createProtocolError('TypeError', 'events.js:initEventData', 'endingJson', endingJson);
  }

  Object.assign(rawObjectivesDb, objectivesJson);
  Object.assign(rawEndingDb, endingJson);
  chapters.forEach((chapterData) => {
    Object.assign(rawEventDb, chapterData);
  });

  isLoaded = true;
  console.log("EVENT_DB, OBJECTIVES_DB, and ENDING_DB initialized successfully.");
}

export class EventManager {
  constructor(player, messageWindow, shopManager, innManager, churchManager, onStateChange = null, getCurrentMapId = null) {
    if (player === null) {
      throw createProtocolError('NullReferenceError', 'events.js:EventManager.constructor', 'player', player);
    }
    if (typeof player !== 'object') {
      throw createProtocolError('TypeError', 'events.js:EventManager.constructor', 'player', player);
    }
    if (messageWindow === null) {
      throw createProtocolError('NullReferenceError', 'events.js:EventManager.constructor', 'messageWindow', messageWindow);
    }
    if (typeof messageWindow !== 'object') {
      throw createProtocolError('TypeError', 'events.js:EventManager.constructor', 'messageWindow', messageWindow);
    }

    this.player = player;
    this.msgWin = messageWindow;
    this.shopManager = shopManager;
    this.innManager = innManager;
    this.churchManager = churchManager;
    this.onStateChange = onStateChange;
    this.getCurrentMapId = getCurrentMapId;

    this.currentQueue = null;
    this.queueIndex = 0;
    this.activeNpc = null;
    this.activeMap = null;
    this.isRunning = false;
  }

  handleInteract(npc, currentMap) {
    if (npc === null) {
      throw createProtocolError('NullReferenceError', 'events.js:handleInteract', 'npc', npc);
    }
    if (typeof npc !== 'object') {
      throw createProtocolError('TypeError', 'events.js:handleInteract', 'npc', npc);
    }

    if (this.isRunning) {
      return 'MESSAGE';
    }

    if (npc.isShop) {
      this.shopManager.open(npc);
      return 'SHOP';
    }
    if (npc.isInn) {
      this.innManager.open(npc);
      return 'MESSAGE';
    }

    if (typeof npc.id === 'string') {
      if (npc.id in EVENT_DB) {
        const script = EVENT_DB[npc.id];
        this.startQueue(script, npc, currentMap);
        return 'MESSAGE';
      }
    }

    // デフォルト挙動（汎用メッセージ）
    if (npc.isChurch) {
      this.churchManager.open(npc);
      return 'MESSAGE';
    }

    let currentMapId = '';
    if (typeof this.getCurrentMapId === 'function') {
      currentMapId = this.getCurrentMapId();
    }

    if (npc.pages) {
      const resolved = i18n.resolve(npc.pages);
      let textArray = [resolved];
      if (Array.isArray(resolved)) {
        textArray = resolved;
      }
      if (textArray.length > 0) {
        this.msgWin.open(textArray);
        return 'MESSAGE';
      }
    }

    return null;
  }

  startQueue(script, npc, currentMap) {
    if (!Array.isArray(script)) {
      throw createProtocolError('TypeError', 'events.js:startQueue', 'script', script);
    }
    this.currentQueue = script;
    this.queueIndex = 0;
    this.activeNpc = npc;
    this.activeMap = currentMap;
    this.isRunning = true;
    this.processNextCommand();
  }

  jumpToLabel(label) {
    if (typeof label !== 'string') {
      throw createProtocolError('TypeError', 'events.js:jumpToLabel', 'label', label);
    }
    if (this.currentQueue === null) {
      throw createProtocolError('NullReferenceError', 'events.js:jumpToLabel', 'currentQueue', this.currentQueue);
    }

    const targetIndex = this.currentQueue.findIndex(cmd => cmd.label === label);
    if (targetIndex !== -1) {
      this.queueIndex = targetIndex;
      this.processNextCommand();
      return;
    }

    console.warn(`Label '${label}' not found in event script.`);
    this.endQueue();
  }

  processNextCommand() {
    if (!this.isRunning) {
      this.endQueue();
      return;
    }
    if (this.currentQueue === null) {
      this.endQueue();
      return;
    }
    if (this.queueIndex >= this.currentQueue.length) {
      this.endQueue();
      return;
    }

    const cmd = this.currentQueue[this.queueIndex];
    if (cmd === null) {
      throw createProtocolError('NullReferenceError', 'events.js:processNextCommand', 'cmd', cmd);
    }
    if (typeof cmd !== 'object') {
      throw createProtocolError('TypeError', 'events.js:processNextCommand', 'cmd', cmd);
    }
    this.queueIndex++;

    switch (cmd.type) {
      case 'show_dialog':
        let text = [];
        if (cmd.text !== undefined && cmd.text !== null) {
          let resolved = cmd.text;
          if (typeof cmd.text === 'object') {
            if (!Array.isArray(cmd.text)) {
              resolved = i18n.resolve(cmd.text);
            }
          }
          if (Array.isArray(resolved)) {
            text = resolved;
          } else {
            text = [resolved];
          }
        } else if (typeof cmd.textKey === 'string') {
          text = i18n.tArray(cmd.textKey);
        } else {
          throw createProtocolError('DataValidationError', 'events.js:processNextCommand', 'show_dialog.text', cmd);
        }

        this.msgWin.open(text, () => {
          if (cmd.onComplete === 'refresh_map') {
            if (typeof this.onStateChange === 'function') {
              this.onStateChange();
            }
          }
          this.processNextCommand();
        });
        break;

      case 'give_item':
        let giveCount = 1;
        if (typeof cmd.count === 'number') {
          giveCount = cmd.count;
        }
        this.player.addItem(cmd.itemId, giveCount);
        this.processNextCommand();
        break;

      case 'remove_item':
        let removeCount = 1;
        if (typeof cmd.count === 'number') {
          removeCount = cmd.count;
        }
        this.player.removeItem(cmd.itemId, removeCount);
        this.processNextCommand();
        break;

      case 'set_flag':
        if (!this.player.flags) {
          this.player.flags = {};
        }
        this.player.flags[cmd.flag] = cmd.value;
        this.processNextCommand();
        break;

      case 'check_flag':
        let flagValue = false;
        if (this.player.flags !== null) {
          if (typeof this.player.flags === 'object') {
            if (cmd.flag in this.player.flags) {
              flagValue = Boolean(this.player.flags[cmd.flag]);
            }
          }
        }
        if (flagValue) {
          if (typeof cmd.if_true === 'string') {
            this.jumpToLabel(cmd.if_true);
            break;
          }
        }
        if (!flagValue) {
          if (typeof cmd.if_false === 'string') {
            this.jumpToLabel(cmd.if_false);
            break;
          }
        }
        this.processNextCommand();
        break;

      case 'check_item':
        let hasItem = false;
        if (this.player.inventory !== null) {
          if (typeof this.player.inventory === 'object') {
            const invCount = this.player.inventory[cmd.itemId];
            if (typeof invCount === 'number') {
              if (invCount > 0) {
                hasItem = true;
              }
            }
          }
        }
        if (this.player.equipment !== null) {
          if (typeof this.player.equipment === 'object') {
            if (this.player.equipment.weapon === cmd.itemId) {
              hasItem = true;
            }
            if (this.player.equipment.armor === cmd.itemId) {
              hasItem = true;
            }
            if (this.player.equipment.shield === cmd.itemId) {
              hasItem = true;
            }
          }
        }

        if (hasItem) {
          if (typeof cmd.if_true === 'string') {
            this.jumpToLabel(cmd.if_true);
            break;
          }
        }
        if (!hasItem) {
          if (typeof cmd.if_false === 'string') {
            this.jumpToLabel(cmd.if_false);
            break;
          }
        }
        this.processNextCommand();
        break;

      case 'check_inventory_full':
        let addCount = 1;
        if (typeof cmd.additional === 'number') {
          addCount = cmd.additional;
        }
        if (this.player.isInventoryFull(addCount)) {
          if (typeof cmd.if_true === 'string') {
            this.jumpToLabel(cmd.if_true);
            break;
          }
        } else {
          if (typeof cmd.if_false === 'string') {
            this.jumpToLabel(cmd.if_false);
            break;
          }
        }
        this.processNextCommand();
        break;

      case 'check_map':
        let mapCheckId = '';
        if (typeof this.getCurrentMapId === 'function') {
          mapCheckId = this.getCurrentMapId();
        }
        if (mapCheckId === cmd.mapId) {
          if (typeof cmd.if_true === 'string') {
            this.jumpToLabel(cmd.if_true);
            break;
          }
        } else {
          if (typeof cmd.if_false === 'string') {
            this.jumpToLabel(cmd.if_false);
            break;
          }
        }
        this.processNextCommand();
        break;

      case 'check_npc_exists':
        let npcIds = [cmd.npcId];
        if (Array.isArray(cmd.npcId)) {
          npcIds = cmd.npcId;
        }
        let npcExists = false;
        if (this.activeMap !== null) {
          if (typeof this.activeMap === 'object') {
            if (Array.isArray(this.activeMap.npcs)) {
              npcExists = this.activeMap.npcs.some(n => npcIds.includes(n.id));
            }
          }
        }
        if (npcExists) {
          if (typeof cmd.if_true === 'string') {
            this.jumpToLabel(cmd.if_true);
            break;
          }
        } else {
          if (typeof cmd.if_false === 'string') {
            this.jumpToLabel(cmd.if_false);
            break;
          }
        }
        this.processNextCommand();
        break;

      case 'set_return_point':
        if (this.activeNpc !== null) {
          if (this.activeNpc.returnPoint !== undefined && this.activeNpc.returnPoint !== null) {
            this.player.returnPoint = { ...this.activeNpc.returnPoint };
          }
        }
        this.processNextCommand();
        break;

      case 'set_npc_position':
        if (this.activeNpc !== null) {
          this.activeNpc.gridX = cmd.gridX;
          this.activeNpc.gridY = cmd.gridY;
          this.activeNpc.pixelX = cmd.gridX * 64;
          this.activeNpc.pixelY = cmd.gridY * 64;
          this.activeNpc.targetPixelX = cmd.gridX * 64;
          this.activeNpc.targetPixelY = cmd.gridY * 64;
        }
        this.processNextCommand();
        break;

      case 'open_church':
        this.churchManager.open(this.activeNpc);
        this.endQueue();
        break;

      case 'play_sound':
        if (typeof cmd.se !== 'string') {
          throw createProtocolError('TypeError', 'events.js:processNextCommand', 'play_sound.se', cmd.se);
        }
        audioService.playSe(cmd.se);
        this.processNextCommand();
        break;

      case 'end':
      default:
        this.endQueue();
        break;
    }
  }

  endQueue() {
    this.isRunning = false;
    this.currentQueue = null;
    this.activeNpc = null;
    this.activeMap = null;
  }
}

/**
 * プレイヤーの状態から現在の進行目標キーを決定論的に解決する純粋関数
 * @param {Object} player
 * @returns {string} objectives.json に登録されているキー
 */
export function resolveCurrentObjectiveKey(player) {
  if (player === null) {
    throw createProtocolError('NullReferenceError', 'events.js:resolveCurrentObjectiveKey', 'player', player);
  }
  if (typeof player !== 'object') {
    throw createProtocolError('TypeError', 'events.js:resolveCurrentObjectiveKey', 'player', player);
  }

  let flags = {};
  if (player.flags !== null && typeof player.flags === 'object') {
    flags = player.flags;
  }

  let inventory = {};
  if (player.inventory !== null && typeof player.inventory === 'object') {
    inventory = player.inventory;
  }

  let equipment = {};
  if (player.equipment !== null && typeof player.equipment === 'object') {
    equipment = player.equipment;
  }

  const getItemCount = (itemId) => {
    if (typeof inventory[itemId] === 'number') {
      return inventory[itemId];
    }
    return 0;
  };

  let key = '';

  if (!flags.talkedToSister) {
    key = 'talk_sister';
  } else if (!flags.talkedToScholar) {
    key = 'find_scholar';
  } else if (!flags.reportedMonumentToScholar) {
    const hasKey = getItemCount('antique_key') > 0 || getItemCount('key') > 0;
    if (hasKey) {
      key = 'report_scholar';
    } else {
      key = 'investigate_monument';
    }
  } else if (!flags.hasPass) {
    if (flags.rescuedGirl) {
      key = 'return_girl';
    } else if (flags.kidnappingEventStarted) {
      key = 'rescue_girl';
    } else if (flags.heardPassRequirement) {
      key = 'consult_mayor';
    } else {
      key = 'cross_checkpoint';
    }
  } else if (!flags.heardOfTizona) {
    key = 'go_library';
  } else if (!flags.returnedLoversRing) {
    if (!flags.elfQuestStarted) {
      key = 'find_temple';
    } else {
      const hasRing = getItemCount('lovers_ring') > 0;
      if (hasRing) {
        key = 'deliver_ring';
      } else {
        key = 'recover_ring';
      }
    }
  } else if (!flags.receivedWaterShield && getItemCount('water_shield') === 0 && equipment.shield !== 'water_shield') {
    key = 'obtain_water_shield';
  } else if (getItemCount('corrada') === 0 && equipment.weapon !== 'corrada') {
    key = 'obtain_corrada';
  } else if (getItemCount('dragon_armor') === 0 && equipment.armor !== 'dragon_armor') {
    if (!flags.blackLizardQuestStarted) {
      if (flags.heardOfDwarf) {
        key = 'seek_dwarf_village';
      } else {
        key = 'seek_armor_clues';
      }
    } else if (!flags.blackLizardDefeated) {
      key = 'defeat_black_lizard';
    } else if (!flags.blackLizardQuestCompleted) {
      key = 'report_black_lizard';
    } else if (!flags.cerberusQuestStarted) {
      key = 'consult_blacksmith';
    } else if (getItemCount('cerberus_mane') > 0) {
      key = 'deliver_mane';
    } else {
      key = 'defeat_cerberus';
    }
  } else {
    key = 'defeat_black_dragon';
  }

  return key;
}

export function getObjectiveText(key) {
  if (typeof key !== 'string') {
    throw createProtocolError('TypeError', 'events.js:getObjectiveText', 'key', key);
  }
  if (!isLoaded) {
    throw createProtocolError('NotInitializedError', 'events.js:getObjectiveText', 'isLoaded', isLoaded);
  }
  if (!(key in OBJECTIVES_DB)) {
    throw createProtocolError('NotFoundError', 'events.js:getObjectiveText', 'key', key);
  }
  const entry = OBJECTIVES_DB[key];
  const text = i18n.resolve(entry);
  if (typeof text !== 'string') {
    throw createProtocolError('TypeError', 'events.js:getObjectiveText', 'text', text);
  }
  if (text.trim() === '') {
    throw createProtocolError('EmptyStringError', 'events.js:getObjectiveText', 'text', text);
  }
  return text;
}

export function getEndingText(key) {
  if (typeof key !== 'string') {
    throw createProtocolError('TypeError', 'events.js:getEndingText', 'key', key);
  }
  if (!isLoaded) {
    throw createProtocolError('NotInitializedError', 'events.js:getEndingText', 'isLoaded', isLoaded);
  }
  if (!(key in ENDING_DB)) {
    throw createProtocolError('NotFoundError', 'events.js:getEndingText', 'key', key);
  }
  const entry = ENDING_DB[key];
  const text = i18n.resolve(entry);
  if (typeof text !== 'string') {
    throw createProtocolError('TypeError', 'events.js:getEndingText', 'text', text);
  }
  if (text.trim() === '') {
    throw createProtocolError('EmptyStringError', 'events.js:getEndingText', 'text', text);
  }
  return text;
}