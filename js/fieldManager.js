// FILE_ENTRY: js/fieldManager.js
import { maps } from './maps.js';
import { sound } from './sound.js';
import { MONSTER_DEFINITIONS } from './monsters.js';
import { ITEM_DB } from './items.js';
import { i18n } from './i18n.js';

export class FieldManager {
  constructor({
    player,
    tileDb,
    renderer,
    messageWindow,
    eventManager,
    getCanvas,
    onEncounter,
    onStateChange,
    onPlayerDeath,
    onEnterDragonsCave2 = null,
    startMapId = 'lighthousekeeper_cottage'
  }) {
    this.player = player;
    this.tileDb = tileDb;
    this.renderer = renderer;
    this.messageWindow = messageWindow;
    this.eventManager = eventManager;
    this.getCanvas = getCanvas;
    this.onEncounter = onEncounter;
    this.onStateChange = onStateChange;
    this.onPlayerDeath = onPlayerDeath;
    this.onEnterDragonsCave2 = onEnterDragonsCave2;

    this.tileSize = 64;
    this.speed = 4;
    this.turnDelayFrames = 8;
    this.minSafeSteps = 4;

    this.currentMapId = startMapId;
    this.currentMap = maps[this.currentMapId];
    this.stepsSinceLastBattle = 0;
    this.defeatedBosses = [];

    this.pendingMonsterId = null;
    this.pendingMonsterIndex = null;
    this.teleportTransition = null;
  }

  getMapBgm(mapId = this.currentMapId) {
    if (mapId === 'lighthousekeeper_cottage') {
      return this.player.flags && this.player.flags.hasLeftInitialCottage ? 'field' : null;
    }
    return maps[mapId]?.bgm || null;
  }

  isNpcActive(npc, mapId = this.currentMapId) {
    if (this.defeatedBosses.includes(npc.id)) return false;

    if (npc.id === 'talos') {
      return !this.defeatedBosses.includes('talos');
    }

    if (npc.id === 'gargoyle') {
      // 学者と話す前（依頼前）は出現しない
      if (!this.player.flags.talkedToScholar) return false;
    }
    if (npc.id === 'troll') {
      // 町長から依頼を受ける前（誘拐事件発生前）は出現しない
      if (!this.player.flags.kidnappingEventStarted) return false;
    }
    if (npc.id === 'grave_thief') {
      // エルフから依頼される前は出現しない
      if (!this.player.flags.elfQuestStarted) return false;

      if (
        this.defeatedBosses.includes('grave_thief') ||
        this.player.flags.returnedLoversRing ||
        (this.player.inventory.lovers_ring || 0) > 0
      ) {
        return false;
      }
    }

    if (npc.id === 'undine') {
      return !!this.player.flags.returnedLoversRing;
    }

    if (npc.id === 'girl') {
      if (mapId === 'first_town') {
        if (this.player.flags.kidnappingEventStarted && !this.player.flags.hasPass) {
          return false;
        }
        return true;
      }
      if (mapId === 'first_dungeon2') {
        if (this.player.flags.kidnappingEventStarted && !this.player.flags.rescuedGirl) {
          return true;
        }
        return false;
      }
    }

    if (npc.id === 'old_man') {
      if (mapId === 'cave') {
        return !this.player.flags.reportedMonumentToScholar;
      }
      if (mapId === 'port_town') {
        return !!this.player.flags.reportedMonumentToScholar;
      }
    }

    return true;
  }

  refreshCurrentMapNpcs() {
    if (!this.currentMap || !this.currentMap.initialNpcs) return;
    this.currentMap.npcs = this.currentMap.initialNpcs
      .filter(npc => this.isNpcActive(npc, this.currentMapId))
      .map(npc => ({ ...npc }));

    if (this.currentMapId === 'first_island' && this.player.flags.hasPass) {
      const guard = this.currentMap.npcs.find(n => n.id === 'guard_port');
      if (guard) {
        guard.gridX = 29;
        guard.gridY = 14;
      }
    }

    // エルフの位置制御
    if (this.currentMapId === 'temple') {
      const elf = this.currentMap.npcs.find(n => n.id === 'elf');
      if (elf) {
        if (!this.player.flags.heardOfTizona) {
          // 学者から話を聞く前は (19, 2) に固定配置（移動不可）
          elf.gridX = 19;
          elf.gridY = 2;
          elf.moveArea = { minX: 19, maxX: 19, minY: 2, maxY: 2 };
          elf.walkTimer = 999999;
          elf.direction = 'down';
        } else {
          // 話を聞いた後は移動範囲を解放
          elf.gridX = 11;
          elf.gridY = 5;
          elf.moveArea = { minX: 9, maxX: 12, minY: 4, maxY: 6 };
          elf.walkTimer = 60;
        }
      }
    }

    this.currentMap.npcs.forEach(npc => {
      npc.pixelX = npc.gridX * this.tileSize;
      npc.pixelY = npc.gridY * this.tileSize;
      npc.targetPixelX = npc.pixelX;
      npc.targetPixelY = npc.pixelY;
      npc.isMoving = false;
    });


    this.currentMap.npcs.forEach(npc => {
      npc.pixelX = npc.gridX * this.tileSize;
      npc.pixelY = npc.gridY * this.tileSize;
      npc.targetPixelX = npc.pixelX;
      npc.targetPixelY = npc.pixelY;
      npc.isMoving = false;
    });
  }

  changeMap(targetMapId, targetGridX, targetGridY, newDirection, isTeleport = false, isLoad = false) {
    if (isTeleport) {
      if (this.onStateChange) this.onStateChange('MESSAGE');
      this.teleportTransition = {
        targetMapId,
        targetGridX,
        targetGridY,
        newDirection,
        timer: 120,
        phase: 'WAIT',
        fadeAlpha: 0
      };
      return;
    }
    this.executeChangeMap(targetMapId, targetGridX, targetGridY, newDirection, isLoad);
  }

  executeChangeMap(targetMapId, targetGridX, targetGridY, newDirection, isLoad = false) {
    if (!maps[targetMapId]) {
      console.error(`マップID [${targetMapId}] が見つかりません。はじまりのまちへ安全復帰します。`);
      targetMapId = 'first_town';
      targetGridX = 15;
      targetGridY = 15;
    }

    if (!isLoad) {
      sound.playStairs();
    }

    if (this.currentMapId === 'lighthousekeeper_cottage' && targetMapId !== 'lighthousekeeper_cottage') {
      this.player.flags.hasLeftInitialCottage = true;
    }

    if (!isLoad && this.currentMapId !== targetMapId && maps[targetMapId]?.randomEntryPoints?.length > 0) {
      const entryPoints = maps[targetMapId].randomEntryPoints;
      const selectedEntry = entryPoints[Math.floor(Math.random() * entryPoints.length)];
      targetGridX = selectedEntry.gridX;
      targetGridY = selectedEntry.gridY;
      if (selectedEntry.direction) {
        newDirection = selectedEntry.direction;
      }
    }

    this.currentMapId = targetMapId;
    this.currentMap = maps[this.currentMapId];

    const targetBgm = this.getMapBgm(this.currentMapId);
    if (targetBgm) {
      sound.playBgm(targetBgm);
    } else {
      sound.stopBgm();
    }

    this.player.setPosition(targetGridX, targetGridY, newDirection);
    this.refreshCurrentMapNpcs();

    const canvas = this.getCanvas();
    this.renderer.updateCamera(this.player, this.currentMap, canvas.width, canvas.height);

    if (!isLoad && targetMapId === 'dragons_cave2' && this.onEnterDragonsCave2) {
      this.onEnterDragonsCave2();
    }
  }

  updateTeleportTransition() {
    if (!this.teleportTransition) return false;

    if (this.teleportTransition.phase === 'WAIT') {
      if (!this.messageWindow.isComplete) {
        this.messageWindow.update();
      } else {
        this.teleportTransition.timer--;
        if (this.teleportTransition.timer <= 0) {
          this.teleportTransition.phase = 'FADE_OUT';
        }
      }
    } else if (this.teleportTransition.phase === 'FADE_OUT') {
      this.teleportTransition.fadeAlpha += 1 / 30;
      if (this.teleportTransition.fadeAlpha >= 1.0) {
        this.teleportTransition.fadeAlpha = 1.0;
        this.executeChangeMap(
          this.teleportTransition.targetMapId,
          this.teleportTransition.targetGridX,
          this.teleportTransition.targetGridY,
          this.teleportTransition.newDirection
        );
        this.messageWindow.close();
        this.teleportTransition.phase = 'FADE_IN';
      }
    } else if (this.teleportTransition.phase === 'FADE_IN') {
      this.teleportTransition.fadeAlpha -= 1 / 30;
      if (this.teleportTransition.fadeAlpha <= 0) {
        this.teleportTransition.fadeAlpha = 0;
        this.teleportTransition = null;
        if (this.onStateChange) this.onStateChange('EXPLORE');
      }
    }
    return true;
  }

  canPlayerMoveTo(gx, gy) {
    const mapData = this.currentMap.data;
    if (gy < 0 || gy >= mapData.length || gx < 0 || gx >= mapData[0].length) return false;

    const tile = mapData[gy][gx];
    const tileDef = this.tileDb[tile];
    if (!tileDef || !tileDef.pass) return false;

    if (this.currentMap.interactables.some(obj => obj.gridX === gx && obj.gridY === gy)) return false;

    const blockingNpc = this.currentMap.npcs.find(npc => {
      const destGx = Math.round(npc.targetPixelX / this.tileSize);
      const destGy = Math.round(npc.targetPixelY / this.tileSize);
      return (npc.gridX === gx && npc.gridY === gy) || (destGx === gx && destGy === gy);
    });
    if (blockingNpc && blockingNpc.type !== 'monster') return false;
    return true;
  }

  canNpcMoveTo(npc, gx, gy) {
    if (npc.moveArea) {
      if (gx < npc.moveArea.minX || gx > npc.moveArea.maxX ||
        gy < npc.moveArea.minY || gy > npc.moveArea.maxY) {
        return false;
      }
    }

    const mapData = this.currentMap.data;
    if (gy < 0 || gy >= mapData.length || gx < 0 || gx >= mapData[0].length) return false;
    const tile = mapData[gy][gx];
    const tileDef = this.tileDb[tile];
    if (!tileDef || !tileDef.pass) return false;
    if (this.currentMap.interactables.some(obj => obj.gridX === gx && obj.gridY === gy)) return false;

    const playerDestGx = Math.round(this.player.targetPixelX / this.tileSize);
    const playerDestGy = Math.round(this.player.targetPixelY / this.tileSize);
    if ((this.player.gridX === gx && this.player.gridY === gy) || (playerDestGx === gx && playerDestGy === gy)) {
      if (npc.type !== 'monster') return false;
    }

    const otherNpcOccupied = this.currentMap.npcs.some(other => {
      if (other === npc) return false;
      const otherDestGx = Math.round(other.targetPixelX / this.tileSize);
      const otherDestGy = Math.round(other.targetPixelY / this.tileSize);
      return (other.gridX === gx && other.gridY === gy) || (otherDestGx === gx && otherDestGy === gy);
    });
    if (otherNpcOccupied) return false;
    return true;
  }

  triggerSymbolEncounter(monsterNpc) {
    this.pendingMonsterIndex = this.currentMap.npcs.indexOf(monsterNpc);
    this.pendingMonsterId = monsterNpc.monsterId;
    sound.stopBgm();
    sound.playEncounter();
    if (this.onEncounter) this.onEncounter(monsterNpc.monsterId, this.pendingMonsterIndex);
  }

  shouldRepelMonster(monsterId) {
    if (this.player.holyWaterSteps <= 0) return false;
    const monsterDef = MONSTER_DEFINITIONS[monsterId];
    if (!monsterDef) return false;

    if (['gargoyle', 'troll', 'grave_thief', 'dungeon_boss', 'talos', 'cerberus', 'black_dragon', 'black_lizardman'].includes(monsterId)) {
      return false;
    }

    const monsterLevel = monsterDef.level || 1;

    if (this.player.level - monsterLevel >= 3) {
      return Math.random() >= 0.15;
    }

    return false;
  }

  checkRandomEncounter() {
    this.stepsSinceLastBattle++;
    if (this.stepsSinceLastBattle <= this.minSafeSteps) return;

    let activeRate = this.currentMap.encounterRate || 0;
    let activePool = this.currentMap.monsters || ['slime'];

    if (this.currentMap.encounterZones && this.currentMap.encounterZones.length > 0) {
      const zone = this.currentMap.encounterZones.find(z =>
        this.player.gridX >= z.x1 && this.player.gridX <= z.x2 &&
        this.player.gridY >= z.y1 && this.player.gridY <= z.y2
      );

      if (zone) {
        activeRate = zone.rate !== undefined ? zone.rate : activeRate;
        activePool = zone.monsters || activePool;
      } else {
        return;
      }
    }

    if (Math.random() < activeRate) {
      const monsterId = activePool[Math.floor(Math.random() * activePool.length)];
      if (this.shouldRepelMonster(monsterId)) {
        return;
      }

      this.pendingMonsterId = monsterId;
      this.pendingMonsterIndex = null;
      sound.stopBgm();
      sound.playEncounter();
      if (this.onEncounter) this.onEncounter(monsterId, null);
    }
  }

  interactFacingObject() {
    let targetX = this.player.gridX;
    let targetY = this.player.gridY;
    if (this.player.direction === 'up') targetY--;
    else if (this.player.direction === 'down') targetY++;
    else if (this.player.direction === 'left') targetX--;
    else if (this.player.direction === 'right') targetX++;

    const mapData = this.currentMap.data;
    if (targetY >= 0 && targetY < mapData.length && targetX >= 0 && targetX < mapData[0].length) {
      const frontTile = mapData[targetY][targetX];
      if (frontTile === 9 || (this.tileDb[frontTile] && this.tileDb[frontTile].isCounter)) {
        if (this.player.direction === 'up') targetY--;
        else if (this.player.direction === 'down') targetY++;
        else if (this.player.direction === 'left') targetX--;
        else if (this.player.direction === 'right') targetX++;
      }
    }

    const targetObj = this.currentMap.interactables.find(obj => obj.gridX === targetX && obj.gridY === targetY);
    if (targetObj) {
      if (this.onStateChange) this.onStateChange('MESSAGE');
      if (targetObj.type === 'sign' || targetObj.type === 'monument' || targetObj.type === 'bookshelf' || targetObj.type === 'notebook') {
        const localizedObjText = i18n.getInteractableText(this.currentMapId, targetObj);
        this.messageWindow.open(localizedObjText || targetObj.pages);
} else if (targetObj.type === 'chest') {
        if (!targetObj.isOpen) {
          if (targetObj.itemId === 'corrada') {
            const hasAntique = (this.player.inventory['antique_key'] || 0) > 0;
            const hasBronze = (this.player.inventory['bronze_key'] || 0) > 0;

            if (!hasAntique || !hasBronze) {
              sound.playBump();
              this.messageWindow.open([i18n.t('field.chest_locked_altar')]);
              return;
            }
            this.player.removeItem('antique_key', 1);
            this.player.removeItem('bronze_key', 1);

            targetObj.isOpen = true;
            this.player.addItem(targetObj.itemId, 1);
            sound.playChest();
            this.messageWindow.open([
              i18n.t('field.chest_open_corrada_1'),
              i18n.t('field.chest_open_corrada_2'),
              i18n.t('field.chest_open_corrada_3'),
              i18n.t('field.chest_open_corrada_4')
            ]);
            return;
          } else {
            // ★itemNameをここで1度だけ宣言
            const itemName = ITEM_DB[targetObj.itemId]?.name || '';
            let netGain = 1;
            
            if (targetObj.requiredKey) {
              const hasKey = (this.player.inventory[targetObj.requiredKey] || 0) > 0;
              if (!hasKey) {
                sound.playBump();
                this.messageWindow.open([i18n.t('field.chest_locked')]);
                return;
              }
              if (targetObj.consumeKey) {
                netGain = 0;
              }
            }

            if (this.player.isInventoryFull(netGain)) {
              sound.playChest();
              
              const candidates = [];
              for (const [id, count] of Object.entries(this.player.inventory)) {
                if (count > 0 && ITEM_DB[id]) {
                  if (ITEM_DB[id].type === 'key' || ITEM_DB[id].type === 'keyItem') continue;
                  let avail = count;
                  if (this.player.equipment.weapon === id) avail--;
                  if (this.player.equipment.armor === id) avail--;
                  if (this.player.equipment.shield === id) avail--;
                  if (avail > 0) {
                    candidates.push({ id: id, name: ITEM_DB[id].name });
                  }
                }
              }

              if (candidates.length === 0) {
                this.messageWindow.open([
                  i18n.t('field.chest_open', { item: itemName }),
                  i18n.t('field.chest_inventory_full_give_up', { item: itemName })
                ]);
              } else {
                const promptMsg = i18n.currentLang === 'ja' 
                  ? `宝箱を開けた！\nなんと ${itemName} が入っていた！\n\nしかし 荷物がいっぱいで持てない。\n代わりに 何かを捨てますか？`
                  : `Opened the chest!\nFound ${itemName}!\nBut your bag is full.\nDiscard something else?`;

                this.messageWindow.openMenu(
                  promptMsg,
                  [i18n.t('common.yes'), i18n.t('common.no')],
                  (selectedIndex) => {
                    if (selectedIndex === 0) {
                      const discardNames = candidates.map(c => c.name);
                      discardNames.push(i18n.t('common.back'));
                      
                      this.messageWindow.openMenu(
                        i18n.t('battle_log.discard_select_msg'),
                        discardNames,
                        (discardIdx) => {
                          if (discardIdx === candidates.length) {
                            this.messageWindow.open([i18n.t('field.chest_give_up', { item: itemName })]);
                          } else {
                            const discarded = candidates[discardIdx];
                            this.player.removeItem(discarded.id, 1);
                            
                            if (targetObj.requiredKey && targetObj.consumeKey) {
                              this.player.removeItem(targetObj.requiredKey, 1);
                            }
                            targetObj.isOpen = true;
                            this.player.addItem(targetObj.itemId, 1);
                            sound.playChest();
                            
                            const msg = i18n.currentLang === 'ja'
                              ? `${discarded.name} を捨てて\n${itemName} を手に入れた！`
                              : `Discarded ${discarded.name} and\nacquired ${itemName}!`;
                            this.messageWindow.open([msg]);
                          }
                        },
                        () => {
                          this.messageWindow.open([i18n.t('field.chest_give_up', { item: itemName })]);
                        }
                      );
                    } else {
                      this.messageWindow.open([i18n.t('field.chest_give_up', { item: itemName })]);
                    }
                  },
                  () => {
                    this.messageWindow.open([i18n.t('field.chest_give_up', { item: itemName })]);
                  }
                );
              }
              return;
            }

            if (targetObj.requiredKey && targetObj.consumeKey) {
              this.player.removeItem(targetObj.requiredKey, 1);
            }
            targetObj.isOpen = true;
            this.player.addItem(targetObj.itemId, 1);
            sound.playChest();
            // ★ここでは itemName を再宣言せず、上部で取得したものを使い回す
            this.messageWindow.open([i18n.t('field.chest_open', { item: itemName })]);
          }
        } else {
          const emptyMsg = targetObj.itemId === 'corrada' ? i18n.t('field.chest_altar_empty') : i18n.t('field.chest_empty');
          this.messageWindow.open([emptyMsg]);
        }
      }
      return;
    }

    const targetNpc = this.currentMap.npcs.find(npc =>
      (npc.gridX === targetX && npc.gridY === targetY) ||
      (Math.round(npc.pixelX / this.tileSize) === targetX && Math.round(npc.pixelY / this.tileSize) === targetY)
    );

    if (targetNpc) {
      if (targetNpc.type === 'monster') {
        this.triggerSymbolEncounter(targetNpc);
        return;
      }

      const oppDirections = { up: 'down', down: 'up', left: 'right', right: 'left' };
      targetNpc.direction = oppDirections[this.player.direction];

      const newState = this.eventManager.handleInteract(targetNpc, this.currentMap);
      if (newState && this.onStateChange) {
        this.onStateChange(newState);
      }
    }
  }

  updateNpcs(currentState) {
    this.currentMap.npcs.forEach(npc => {
      if (!npc.isMoving) {
        npc.idleAnimTimer = (npc.idleAnimTimer || 0) + 1;
        if (npc.idleAnimTimer >= 30) {
          npc.idleAnimTimer = 0;
          npc.animFrame = npc.animFrame === 0 ? 1 : 0;
        }
      }

      if (npc.isMoving) {
        const npcSpeed = 2;
        if (npc.pixelX < npc.targetPixelX) npc.pixelX += npcSpeed;
        if (npc.pixelX > npc.targetPixelX) npc.pixelX -= npcSpeed;
        if (npc.pixelY < npc.targetPixelY) npc.pixelY += npcSpeed;
        if (npc.pixelY > npc.targetPixelY) npc.pixelY -= npcSpeed;

        if (npc.pixelX === npc.targetPixelX && npc.pixelY === npc.targetPixelY) {
          npc.isMoving = false;
          npc.gridX = npc.pixelX / this.tileSize;
          npc.gridY = npc.pixelY / this.tileSize;
          npc.animFrame = npc.animFrame === 0 ? 1 : 0;
          npc.walkTimer = Math.floor(Math.random() * 90) + 60;

          if (npc.type === 'monster' && currentState === 'EXPLORE' && !this.player.isMoving) {
            if (npc.gridX === this.player.gridX && npc.gridY === this.player.gridY) {
              if (!this.shouldRepelMonster(npc.monsterId)) {
                this.triggerSymbolEncounter(npc);
              }
            }
          }
        }
      } else {
        if (npc.walkTimer > 0) { npc.walkTimer--; return; }

        const moveChance = npc.type === 'monster' ? 0.6 : 0.4;
        if (Math.random() > moveChance) { npc.walkTimer = Math.floor(Math.random() * 60) + 30; return; }

        const dirs = ['up', 'down', 'left', 'right'];
        let randomDir = dirs[Math.floor(Math.random() * dirs.length)];
        if (npc.type === 'monster') {
          if (!this.shouldRepelMonster(npc.monsterId)) {
            const dx = this.player.gridX - npc.gridX;
            const dy = this.player.gridY - npc.gridY;
            if (Math.abs(dx) + Math.abs(dy) <= 4) {
              if (Math.abs(dx) > Math.abs(dy)) randomDir = dx > 0 ? 'right' : 'left';
              else randomDir = dy > 0 ? 'down' : 'up';
            }
          }
        }

        npc.direction = randomDir;
        let nextGx = npc.gridX;
        let nextGy = npc.gridY;
        if (randomDir === 'up') nextGy--;
        else if (randomDir === 'down') nextGy++;
        else if (randomDir === 'left') nextGx--;
        else if (randomDir === 'right') nextGx++;

        if (this.canNpcMoveTo(npc, nextGx, nextGy)) {
          npc.targetPixelX = nextGx * this.tileSize;
          npc.targetPixelY = nextGy * this.tileSize;
          npc.isMoving = true;
        } else {
          npc.walkTimer = 30;
        }
      }
    });
  }

updatePlayer(input) {
    if (this.player.bumpCoolDown > 0) this.player.bumpCoolDown--;
    if (this.player.poisonFlashTimer > 0) this.player.poisonFlashTimer--;
    if (this.player.poisonShakeTimer > 0) this.player.poisonShakeTimer--;
    if (this.player.magmaFlashTimer > 0) this.player.magmaFlashTimer--;

    if (this.player.isMoving) {
      if (this.player.pixelX < this.player.targetPixelX) this.player.pixelX += this.speed;
      if (this.player.pixelX > this.player.targetPixelX) this.player.pixelX -= this.speed;
      if (this.player.pixelY < this.player.targetPixelY) this.player.pixelY += this.speed;
      if (this.player.pixelY > this.player.targetPixelY) this.player.pixelY -= this.speed;

      if (this.player.pixelX === this.player.targetPixelX && this.player.pixelY === this.player.targetPixelY) {
        this.player.isMoving = false;
        this.player.gridX = this.player.pixelX / this.tileSize;
        this.player.gridY = this.player.pixelY / this.tileSize;
        this.player.animFrame = this.player.animFrame === 0 ? 1 : 0;
        sound.playFootstep();

        const stepResults = this.player.updateSteps();
        if (stepResults.poisonDamage > 0) {
          sound.playPoisonDamage();
        }

        const currentTile = this.currentMap.data[this.player.gridY][this.player.gridX];
        const tileDef = this.tileDb[currentTile];
        if (tileDef) {
          if (tileDef.isSwamp) {
            const hasCharm = (this.player.inventory.poison_charm || 0) > 0;
            const swampDamage = hasCharm ? 1 : Math.max(4, Math.floor(this.player.maxHp * 0.04));
            const actualDamage = Math.min(swampDamage, Math.max(0, this.player.hp - 1));
            if (actualDamage > 0) {
              this.player.hp -= actualDamage;
              this.player.poisonFlashTimer = 16;
              this.player.poisonShakeTimer = 6;
              sound.playPoisonDamage();
            }
          } else if (tileDef.isMagma) {
            const hasWaterShield = this.player.equipment.shield === 'water_shield';
            const hasFireCharm = (this.player.inventory.fire_charm || 0) > 0;

            let magmaDamage = hasWaterShield ? 4 : 10;
            if (hasFireCharm) {
              magmaDamage = Math.floor(magmaDamage / 2);
            }

            const actualDamage = Math.min(magmaDamage, Math.max(0, this.player.hp - 1));
            if (actualDamage > 0) {
              this.player.hp -= actualDamage;
              this.player.magmaFlashTimer = 16;
              this.player.poisonShakeTimer = 8;
              sound.playAttack();
            }
          }
        }

        if (stepResults.poisonDamage > 0 && this.player.hp <= 0) {
          if (this.onPlayerDeath) this.onPlayerDeath(true);
          return;
        }

        if (stepResults.remiraExpired && this.currentMap.isDark) {
          this.messageWindow.open([i18n.t('field.light_expired')]);
          if (this.onStateChange) this.onStateChange('MESSAGE');
          return;
        }
        if (stepResults.holyWaterExpired) {
          this.messageWindow.open([i18n.t('field.holy_water_expired')]);
          if (this.onStateChange) this.onStateChange('MESSAGE');
          return;
        }

        const warp = this.currentMap.warps.find(w => w.gridX === this.player.gridX && w.gridY === this.player.gridY);
        if (warp) {
          this.changeMap(warp.targetMap, warp.targetX, warp.targetY, warp.direction);
          return;
        }

        // 黒リザードマンの固定奇襲エンカウント
        if (
          this.currentMapId === 'undersea_tunnel2' &&
          this.player.gridX === 13 &&
          this.player.gridY === 16 &&
          this.player.flags.blackLizardQuestStarted &&
          !this.player.flags.blackLizardDefeated &&
          !this.defeatedBosses.includes('black_lizardman')
        ) {
          this.pendingMonsterId = 'black_lizardman';
          this.pendingMonsterIndex = null;
          sound.stopBgm();
          sound.playEncounter();
          if (this.onEncounter) this.onEncounter('black_lizardman', null, true);
          return;
        }

        if (
          this.currentMapId === 'dragons_cave2' &&
          (this.player.gridX === 7 || this.player.gridX === 8) &&
          this.player.gridY === 10 &&
          !this.defeatedBosses.includes('black_dragon')
        ) {
          this.pendingMonsterId = 'black_dragon';
          this.pendingMonsterIndex = null;
          sound.stopBgm();
          sound.playEncounter();
          if (this.onEncounter) this.onEncounter('black_dragon', null);
          return;
        }

        const hitMonster = this.currentMap.npcs.find(npc => npc.type === 'monster' && npc.gridX === this.player.gridX && npc.gridY === this.player.gridY);
        if (hitMonster) {
          if (!this.shouldRepelMonster(hitMonster.monsterId)) {
            this.triggerSymbolEncounter(hitMonster);
          }
        } else {
          this.checkRandomEncounter();
        }
      }
    } else {
      let inputDir = null;
      let nextGridX = this.player.gridX;
      let nextGridY = this.player.gridY;
      if (input.up) { inputDir = 'up'; nextGridY--; }
      else if (input.down) { inputDir = 'down'; nextGridY++; }
      else if (input.left) { inputDir = 'left'; nextGridX--; }
      else if (input.right) { inputDir = 'right'; nextGridX++; }

      if (inputDir) {
        if (this.player.direction !== inputDir) {
          this.player.direction = inputDir;
          this.player.turnDelay = this.turnDelayFrames;
          return;
        }
        if (this.player.turnDelay > 0) {
          this.player.turnDelay--;
          return;
        }
        if (this.canPlayerMoveTo(nextGridX, nextGridY)) {
          this.player.targetPixelX = nextGridX * this.tileSize;
          this.player.targetPixelY = nextGridY * this.tileSize;
          this.player.isMoving = true;
        } else {
          if (this.player.bumpCoolDown === 0) {
            sound.playBump();
            this.player.bumpCoolDown = 20;
          }
        }
      } else {
        this.player.turnDelay = 0;
      }
    }

    const canvas = this.getCanvas();
    this.renderer.updateCamera(this.player, this.currentMap, canvas.width, canvas.height);
  }
}