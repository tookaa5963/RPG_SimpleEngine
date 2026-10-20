// FILE_ENTRY: js/events.js
import { sound } from './sound.js';
import { i18n } from './i18n.js';

export let EVENT_DB = {};

export async function initEventData() {
  try {
    const res = await fetch('data/events.json');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status} on events.json`);
    EVENT_DB = await res.json();
    console.log("EVENT_DB initialized successfully from JSON.");
  } catch (error) {
    console.error("Failed to fetch event data:", error);
    throw error;
  }
}

export class EventManager {
  constructor(player, messageWindow, shopManager, innManager, churchManager, onStateChange = null, getCurrentMapId = null) {
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
    if (this.isRunning) return 'MESSAGE';

    if (npc.isShop) {
      this.shopManager.open(npc);
      return 'SHOP';
    }
    if (npc.isInn) {
      this.innManager.open(npc);
      return 'MESSAGE';
    }

    const script = EVENT_DB[npc.id];
    if (script) {
      this.startQueue(script, npc, currentMap);
      return 'MESSAGE';
    }

    // デフォルト挙動（汎用メッセージ）
    if (npc.isChurch) {
      this.churchManager.open(npc);
      return 'MESSAGE';
    }

    const currentMapId = this.getCurrentMapId ? this.getCurrentMapId() : '';
    const localizedNpcText = i18n.getNpcText(currentMapId, npc.id);
    if (localizedNpcText) {
      this.msgWin.open(localizedNpcText);
      return 'MESSAGE';
    }

    if (npc.pages && npc.pages.length > 0) {
      this.msgWin.open(npc.pages);
      return 'MESSAGE';
    }

    return null;
  }

  startQueue(script, npc, currentMap) {
    this.currentQueue = script;
    this.queueIndex = 0;
    this.activeNpc = npc;
    this.activeMap = currentMap;
    this.isRunning = true;
    this.processNextCommand();
  }

  jumpToLabel(label) {
    const targetIndex = this.currentQueue.findIndex(cmd => cmd.label === label);
    if (targetIndex !== -1) {
      this.queueIndex = targetIndex;
      this.processNextCommand();
    } else {
      console.warn(`Label '${label}' not found in event script.`);
      this.endQueue();
    }
  }

  processNextCommand() {
    if (!this.isRunning || !this.currentQueue || this.queueIndex >= this.currentQueue.length) {
      this.endQueue();
      return;
    }

    const cmd = this.currentQueue[this.queueIndex];
    this.queueIndex++;

    switch (cmd.type) {
      case 'show_dialog':
        let text = [];
        if (cmd.textKey) {
          text = i18n.tArray(cmd.textKey);
        } else if (cmd.text) {
          text = [cmd.text];
        }
        
        // メッセージ終了後に次のコマンドへ進むようコールバック設定
        this.msgWin.open(text, () => {
          if (cmd.onComplete === 'refresh_map' && this.onStateChange) {
            this.onStateChange();
          }
          this.processNextCommand();
        });
        break;

      case 'give_item':
        this.player.addItem(cmd.itemId, cmd.count || 1);
        this.processNextCommand();
        break;

      case 'remove_item':
        this.player.removeItem(cmd.itemId, cmd.count || 1);
        this.processNextCommand();
        break;

      case 'set_flag':
        if (!this.player.flags) this.player.flags = {};
        this.player.flags[cmd.flag] = cmd.value;
        this.processNextCommand();
        break;

      case 'check_flag':
        const flagValue = this.player.flags && this.player.flags[cmd.flag];
        if (flagValue && cmd.if_true) {
          this.jumpToLabel(cmd.if_true);
        } else if (!flagValue && cmd.if_false) {
          this.jumpToLabel(cmd.if_false);
        } else {
          this.processNextCommand();
        }
        break;

      case 'check_item':
        const hasItem = (this.player.inventory[cmd.itemId] || 0) > 0 ||
                        this.player.equipment.weapon === cmd.itemId ||
                        this.player.equipment.armor === cmd.itemId ||
                        this.player.equipment.shield === cmd.itemId;
        if (hasItem && cmd.if_true) {
          this.jumpToLabel(cmd.if_true);
        } else if (!hasItem && cmd.if_false) {
          this.jumpToLabel(cmd.if_false);
        } else {
          this.processNextCommand();
        }
        break;

      case 'check_inventory_full':
        const addCount = cmd.additional || 1;
        if (this.player.isInventoryFull(addCount)) {
          if (cmd.if_true) this.jumpToLabel(cmd.if_true);
          else this.processNextCommand();
        } else {
          if (cmd.if_false) this.jumpToLabel(cmd.if_false);
          else this.processNextCommand();
        }
        break;

      case 'check_map':
        const currentMapId = this.getCurrentMapId ? this.getCurrentMapId() : '';
        if (currentMapId === cmd.mapId) {
          if (cmd.if_true) this.jumpToLabel(cmd.if_true);
          else this.processNextCommand();
        } else {
          if (cmd.if_false) this.jumpToLabel(cmd.if_false);
          else this.processNextCommand();
        }
        break;

      case 'check_npc_exists':
        const npcIds = Array.isArray(cmd.npcId) ? cmd.npcId : [cmd.npcId];
        const npcExists = this.activeMap && this.activeMap.npcs.some(n => npcIds.includes(n.id));
        if (npcExists) {
          if (cmd.if_true) this.jumpToLabel(cmd.if_true);
          else this.processNextCommand();
        } else {
          if (cmd.if_false) this.jumpToLabel(cmd.if_false);
          else this.processNextCommand();
        }
        break;

      case 'set_return_point':
        if (this.activeNpc && this.activeNpc.returnPoint) {
          this.player.returnPoint = { ...this.activeNpc.returnPoint };
        }
        this.processNextCommand();
        break;
        
      case 'set_npc_position':
        if (this.activeNpc) {
          this.activeNpc.gridX = cmd.gridX;
          this.activeNpc.gridY = cmd.gridY;
          this.activeNpc.pixelX = cmd.gridX * 64; // tileSize assumed 64
          this.activeNpc.pixelY = cmd.gridY * 64;
          this.activeNpc.targetPixelX = cmd.gridX * 64;
          this.activeNpc.targetPixelY = cmd.gridY * 64;
        }
        this.processNextCommand();
        break;

      case 'open_church':
        this.churchManager.open(this.activeNpc);
        this.endQueue(); // 教会メニューが開くためキューはここで終了
        break;

      case 'play_sound':
        if (cmd.se === 'victory') sound.playVictory();
        else if (cmd.se === 'heal') sound.playHeal();
        else if (cmd.se === 'bump') sound.playBump();
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
