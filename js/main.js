// FILE_ENTRY: js/main.js
import { maps, initMapData } from './maps.js';
import { MessageWindow } from './message.js';
import { sound } from './sound.js';
import { BattleManager } from './battle.js';
import { MenuManager } from './menu.js';
import { ShopManager, initShopData } from './shop.js';
import { InnManager, initInnData } from './inn.js';
import { ChurchManager, initChurchData } from './church.js';
import { InputManager } from './input.js';
import { SaveManager } from './save.js';
import { Renderer } from './renderer.js';
import { UIManager } from './ui.js';
import { Player } from './player.js';
import { EventManager, initEventData, getEndingText } from './events.js'; // ★ initEventDataを追加
import { SlotDialog } from './slotDialog.js';
import { TitleScene } from './titleScene.js';
import { FieldManager } from './fieldManager.js';
import { i18n, initLocaleData } from './i18n.js';
import { initLogData, logFormatter } from './logFormatter.js';
import { initItemData } from './items.js';
import { initMonsterData } from './monsters.js';

export const TILE_DB = {
  0: { id: 0, name: '草地(歩行可)', pass: true, blockLight: false, color: '#27ae60' },
  1: { id: 1, name: '壁(進入禁止)', pass: false, blockLight: true, color: '#7f8c8d' },
  2: { id: 2, name: '水/海', pass: false, blockLight: false, color: '#2980b9' },
  3: { id: 3, name: '毒の沼地', pass: true, blockLight: false, color: '#6c5ce7', isSwamp: true },
  4: { id: 4, name: 'マグマ', pass: true, blockLight: false, color: '#d63031', isMagma: true },
  5: { id: 5, name: '床(木)', pass: true, blockLight: false, color: '#d35400' },
  6: { id: 6, name: '砂浜', pass: true, blockLight: false, color: '#f1c40f' },
  7: { id: 7, name: '洞窟(床)', pass: true, blockLight: false, color: '#222222' },
  8: { id: 8, name: '洞窟(壁)', pass: false, blockLight: true, color: '#555555' },
  9: { id: 9, name: 'カウンター', pass: false, blockLight: false, isCounter: true, color: '#8e44ad' },
  10: { id: 10, name: '床(石)', pass: true, blockLight: false, color: '#95a5a6' }
};

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE_SIZE = 64;
const FLASH_DURATION = 36;

const STATE_TITLE = 'TITLE';
const STATE_EXPLORE = 'EXPLORE';
const STATE_MESSAGE = 'MESSAGE';
const STATE_FLASH = 'FLASH';
const STATE_BATTLE = 'BATTLE';
const STATE_MENU = 'MENU';
const STATE_SHOP = 'SHOP';
const STATE_INN = 'INN';
const STATE_CHURCH = 'CHURCH';
let currentState = STATE_TITLE;

const START_MAP_ID = 'lighthousekeeper_cottage';
const START_GRID_X = 3;
const START_GRID_Y = 4;
const START_DIRECTION = 'up';

// Deferred initialization for game objects
let player, flashTimer, pendingMonsterId, pendingIsAmbush, input, renderer, uiManager, messageWindow;
let btnToggleBgm, btnToggleSe, cutsceneOverlay, cutsceneVideo, isCutscenePlaying, cutsceneOnFinished, cutsceneFinishHandler;
let titleScene, slotDialog, battleManager, menuManager, shopManager, innManager, churchManager, eventManager, fieldManager;
let hasStartedBgm = false;
let lastTime, accumulator;
const FIXED_STEP = 1000 / 60;
const MAX_ACCUMULATOR = 200;


function playCutsceneVideo(videoSrc, onFinished) {
  sound.stopBgm();
  isCutscenePlaying = true;
  cutsceneOnFinished = onFinished;
  if (cutsceneOverlay) cutsceneOverlay.style.display = 'flex';
  if (cutsceneVideo) {
    cutsceneVideo.src = videoSrc;
    cutsceneVideo.currentTime = 0;
    cutsceneVideo.muted = !sound.bgmEnabled;
    cutsceneVideo.volume = sound.bgmVolume ? Math.min(1.0, sound.bgmVolume * 5) : 0.5;

    cutsceneFinishHandler = () => {
      if (!isCutscenePlaying) return;
      isCutscenePlaying = false;
      cutsceneVideo.pause();
      cutsceneVideo.onended = null;
      cutsceneFinishHandler = null;
      if (cutsceneOverlay) cutsceneOverlay.style.display = 'none';

      input.actionJustPressed = false;
      input.cancelJustPressed = false;
      input.action = false;
      input.cancel = false;
      input._prevAction = true;
      input._prevCancel = true;

      if (cutsceneOnFinished) {
        const cb = cutsceneOnFinished;
        cutsceneOnFinished = null;
        cb();
      }
    };

    cutsceneVideo.onended = cutsceneFinishHandler;

    cutsceneVideo.play().then(() => {
      sound.unlock();
    }).catch(e => {
      console.warn(`動画 [${videoSrc}] 再生待機/スキップ:`, e);
      if (cutsceneFinishHandler) cutsceneFinishHandler();
    });
  } else {
    isCutscenePlaying = false;
    if (onFinished) onFinished();
  }
}

function updateSoundUI() {
  if (btnToggleBgm) {
    btnToggleBgm.textContent = `BGM: ${sound.bgmEnabled ? 'ON' : 'OFF'}`;
    if (sound.bgmEnabled) btnToggleBgm.classList.remove('off');
    else btnToggleBgm.classList.add('off');
  }
  if (btnToggleSe) {
    btnToggleSe.textContent = `SE: ${sound.seEnabled ? 'ON' : 'OFF'}`;
    if (sound.seEnabled) btnToggleSe.classList.remove('off');
    else btnToggleSe.classList.add('off');
  }
}

function toggleBgmAction() {
  sound.unlock();
  const enabled = sound.toggleBgm();
  if (enabled) {
    if (currentState === STATE_TITLE) {
      sound.playBgm('opening');
    } else if (currentState === STATE_BATTLE) {
      sound.playBgm('battle');
    } else {
      const bgmKey = fieldManager.getMapBgm(fieldManager.currentMapId);
      if (bgmKey) sound.playBgm(bgmKey);
    }
  }
  updateSoundUI();
}

function toggleSeAction() {
  sound.unlock();
  sound.toggleSe();
  updateSoundUI();
}

function resetAllChests() {
  Object.keys(maps).forEach(mapId => {
    if (maps[mapId].interactables) {
      maps[mapId].interactables.forEach(obj => {
        if (obj.type === 'chest') {
          obj.isOpen = false;
        }
      });
    }
  });
}

const saveGame = (slot = 1) => {
  SaveManager.saveGame(player, fieldManager.currentMapId, maps, fieldManager.defeatedBosses, slot);
};

const loadGame = (slot = 1) => {
  const changeMapForLoad = (mapId, gx, gy, dir) => {
    fieldManager.changeMap(mapId, gx, gy, dir, false, true);
  };
  const success = SaveManager.loadGame(player, fieldManager.defeatedBosses, maps, changeMapForLoad, slot);
  if (success) {
    player.flags.hasLeftInitialCottage = true;
    syncPlayerToManagers(player);
    const targetBgm = fieldManager.getMapBgm(fieldManager.currentMapId);
    if (targetBgm) {
      sound.playBgm(targetBgm);
    } else {
      sound.stopBgm();
    }
  }
  return success;
};

function handlePlayerDeath(isPoison = false) {
  player.gold = Math.floor(player.gold / 2);
  const lostExp = player.applyExpDeathPenalty(0.5);
  player.hp = player.maxHp;
  player.mp = player.maxMp;
  player.curePoison();

  let lostGirl = false;
  if (!player.flags.hasPass) {
    if (player.flags.rescuedGirl) {
      player.flags.rescuedGirl = false;
      lostGirl = true;
    }
    const bossIndex = fieldManager.defeatedBosses.indexOf('dungeon_boss');
    if (bossIndex !== -1) {
      fieldManager.defeatedBosses.splice(bossIndex, 1);
    }
    const trollIndex = fieldManager.defeatedBosses.indexOf('troll');
    if (trollIndex !== -1) {
      fieldManager.defeatedBosses.splice(trollIndex, 1);
    }
  }

  // フォールバック先を灯台守の小屋に変更
  const rp = player.returnPoint || { mapId: 'lighthousekeeper_cottage', gridX: 3, gridY: 4, direction: 'up' };

  let deathMsg = isPoison
    ? logFormatter.format('field.death_poison')
    : logFormatter.format('field.death_normal');

  if (lostExp > 0) {
    deathMsg += '\n' + logFormatter.format('field.death_exp_lost', { exp: String(lostExp) });
  }

  if (lostGirl) {
    deathMsg += logFormatter.format('field.death_girl_lost');
  }

  messageWindow.open([deathMsg]);
  fieldManager.changeMap(rp.mapId, rp.gridX, rp.gridY, rp.direction, true);
}


function getVideoPath(baseName) {
  return `video/${baseName}_${i18n.currentLang}.mp4`;
}

export function playTheaterVideo(type) {
  if (type === 'fall') {
    playCutsceneVideo(getVideoPath('blackdragon_fall'), () => {
      currentState = STATE_TITLE;
      titleScene.startSequence();
    });
  } else if (type === 'ending') {
    playCutsceneVideo(getVideoPath('ending'), () => {
      currentState = STATE_TITLE;
      titleScene.startSequence();
    });
  }
}

function runEndingSequence() {
  // ★ 黒竜討伐動画の再生直前にクリアフラグを先行保存
  try {
    localStorage.setItem('camino_game_cleared', 'true');
  } catch (e) {
    console.warn('クリアフラグの保存に失敗しました:', e);
  }

  playCutsceneVideo(getVideoPath('blackdragon_fall'), () => {
    player.removeItem('corrada', 1);
    if (player.equipment.weapon === 'corrada') {
      player.equipment.weapon = null;
    }
    player.addItem('broken_corrada_hilt', 1);

    fieldManager.changeMap('dwarf_village', 4, 12, 'down', false);
    const blacksmith = fieldManager.currentMap.npcs.find(n => n.id === 'dwarf_blacksmith');
    if (blacksmith) {
      blacksmith.direction = 'up';
    }
    currentState = STATE_MESSAGE;

    const dwarfMessages = [
      getEndingText('corrada_broken_1'),
      getEndingText('corrada_broken_2'),
      getEndingText('dwarf_1'),
      getEndingText('dwarf_2'),
      getEndingText('dwarf_3'),
      getEndingText('dwarf_4'),
      getEndingText('dwarf_5')
    ];

    messageWindow.open(dwarfMessages, () => {
      if (player.equipment.armor === 'dragon_armor') {
        player.equipment.armor = null;
      }
      player.removeItem('dragon_armor', player.inventory.dragon_armor || 1);

      fieldManager.changeMap('deep_forest', 36, 6, 'right', false);
      currentState = STATE_MESSAGE;

      const forestMessages = [
        getEndingText('undine_1'),
        getEndingText('undine_2'),
        getEndingText('undine_3'),
        getEndingText('undine_4'),
        getEndingText('undine_5')
      ];

      messageWindow.open(forestMessages, () => {
        if (player.equipment.shield === 'water_shield') {
          player.equipment.shield = null;
        }
        player.removeItem('water_shield', player.inventory.water_shield || 1);

        fieldManager.changeMap('port_town', 10, 6, 'up', false);
        currentState = STATE_MESSAGE;

        const currentNpcs = fieldManager.currentMap.npcs;

        const captain = currentNpcs.find(n => n.id === 'captain');
        if (captain) {
          captain.gridX = 9; captain.gridY = 5;
          captain.pixelX = 9 * 64; captain.pixelY = 5 * 64;
          captain.targetPixelX = 9 * 64; captain.targetPixelY = 5 * 64;
          captain.direction = 'down';
        }

        const scholar = currentNpcs.find(n => n.id === 'old_man');
        if (scholar) {
          scholar.gridX = 11; scholar.gridY = 5;
          scholar.pixelX = 11 * 64; scholar.pixelY = 5 * 64;
          scholar.targetPixelX = 11 * 64; scholar.targetPixelY = 5 * 64;
          scholar.direction = 'down';
        }

        let mayor = currentNpcs.find(n => n.id === 'town_mayor');
        if (!mayor) {
          mayor = {
            id: 'town_mayor', sprite: 'town_mayor', type: 'human', name: '町長',
            gridX: 10, gridY: 5, pixelX: 10 * 64, pixelY: 5 * 64,
            targetPixelX: 10 * 64, targetPixelY: 5 * 64, direction: 'down',
            animFrame: 0, isMoving: false, color: '#f39c12', walkTimer: 999999
          };
          currentNpcs.push(mayor);
        } else {
          mayor.gridX = 10; mayor.gridY = 5;
          mayor.pixelX = 10 * 64; mayor.pixelY = 5 * 64;
          mayor.targetPixelX = 10 * 64; mayor.targetPixelY = 5 * 64;
          mayor.direction = 'down';
        }

        let girl = currentNpcs.find(n => n.id === 'girl');
        if (!girl) {
          girl = {
            id: 'girl', sprite: 'girl', type: 'human', name: '女の子',
            gridX: 11, gridY: 6, pixelX: 11 * 64, pixelY: 6 * 64,
            targetPixelX: 11 * 64, targetPixelY: 6 * 64, direction: 'left',
            animFrame: 0, isMoving: false, color: '#e74c3c', walkTimer: 999999
          };
          currentNpcs.push(girl);
        } else {
          girl.gridX = 11; girl.gridY = 6;
          girl.pixelX = 11 * 64; girl.pixelY = 6 * 64;
          girl.targetPixelX = 11 * 64; girl.targetPixelY = 6 * 64;
          girl.direction = 'left';
        }

        const portMessages = [
          getEndingText('port_1'),
          getEndingText('port_2'),
          getEndingText('port_3'),
          getEndingText('port_4'),
          getEndingText('port_5'),
          getEndingText('port_6'),
          getEndingText('port_7')
        ];

        messageWindow.open(portMessages, () => {
          sound.stopBgm();
          playCutsceneVideo(getVideoPath('ending'), () => {
            currentState = STATE_MESSAGE;
            messageWindow.open([
              i18n.t('system.theater_unlocked')
            ], () => {
              returnToTitle();
            });
          });
        });
      });
    });
  });
}

function syncPlayerToManagers(activePlayer) {
  if (battleManager) battleManager.player = activePlayer;
  if (menuManager) menuManager.player = activePlayer;
  if (shopManager) shopManager.player = activePlayer;
  if (innManager) innManager.player = activePlayer;
  if (churchManager) churchManager.player = activePlayer;
  if (eventManager) eventManager.player = activePlayer;
  if (fieldManager) fieldManager.player = activePlayer;
}

function startNewGame() {
  sound.stopBgm();
  slotDialog.currentLoadedSlot = null;
  try {
    localStorage.removeItem('camino_de_leyenda_current_loaded_slot');
  } catch (e) {
    // Ignored
  }
  player = new Player(START_GRID_X, START_GRID_Y, TILE_SIZE);
  player.direction = START_DIRECTION;
  player.flags.hasLeftInitialCottage = false;
  syncPlayerToManagers(player);

  fieldManager.currentMapId = START_MAP_ID;
  fieldManager.currentMap = maps[START_MAP_ID];
  fieldManager.defeatedBosses = [];

  resetAllChests();

  Object.keys(maps).forEach(mapId => {
    if(maps[mapId].npcs) {
      maps[mapId].initialNpcs = maps[mapId].npcs.map(npc => ({ ...npc }));
    }
  });
  fieldManager.refreshCurrentMapNpcs();
  renderer.updateCamera(player, fieldManager.currentMap, canvas.width, canvas.height);

  enterGameFromTitle();

  const targetBgm = fieldManager.getMapBgm(fieldManager.currentMapId);
  if (targetBgm) {
    sound.playBgm(targetBgm);
  } else {
    sound.stopBgm();
  }

  input.actionJustPressed = false;
  input.action = false;
  input._prevAction = true;

  const keeper = fieldManager.currentMap.npcs.find(n => n.id === 'lighthousekeeper');
  if (keeper) {
    currentState = STATE_MESSAGE;
    eventManager.handleInteract(keeper, fieldManager.currentMap);
  }
}

function enterGameFromTitle() {
  titleScene.hide();
  currentState = STATE_EXPLORE;
}

function returnToTitle() {
  sound.stopBgm();
  player = new Player(START_GRID_X, START_GRID_Y, TILE_SIZE);
  player.direction = START_DIRECTION;
  syncPlayerToManagers(player);

  fieldManager.currentMapId = START_MAP_ID;
  fieldManager.currentMap = maps[START_MAP_ID];
  fieldManager.defeatedBosses = [];

  resetAllChests();

  slotDialog.dialog.style.display = 'none';
  slotDialog.isOpen = false;
  currentState = STATE_TITLE;
  titleScene.startSequence();
}

function emitVirtualKey(keyName) {
  if (currentState === STATE_MENU) menuManager.handleKeyDown(keyName);
  else if (currentState === STATE_SHOP) shopManager.handleKeyDown(keyName);
  else if (currentState === STATE_BATTLE) battleManager.handleKeyDown(keyName);
  else if (currentState === STATE_MESSAGE) {
    messageWindow.handleKeyDown(keyName);
  }
}

function update() {
  input.update();

  if (isCutscenePlaying) {
    if (input.cancelJustPressed && cutsceneFinishHandler) {
      sound.playCancel();
      cutsceneFinishHandler();
    }
    return;
  }

  if (input.keys['m'] || input.keys['M']) {
    input.keys['m'] = false;
    input.keys['M'] = false;
    toggleBgmAction();
  }
  if (input.keys['n'] || input.keys['N']) {
    input.keys['n'] = false;
    input.keys['N'] = false;
    toggleSeAction();
  }

  if (slotDialog.isOpen) {
    slotDialog.updateInput(input);
    return;
  }

  if (titleScene.isActive) {
    titleScene.updateInput(input, slotDialog.isOpen);
    return;
  }

  if (fieldManager.teleportTransition) {
    fieldManager.updateTeleportTransition();
    return;
  }

  if (innManager.isStaying) {
    innManager.update();
    return;
  }

  if (messageWindow.isOpen && currentState !== STATE_MESSAGE) {
    currentState = STATE_MESSAGE;
  }

  if (!hasStartedBgm && input.isAnyKeyPressed) {
    sound.unlock();
    hasStartedBgm = true;
    const targetBgm = fieldManager.getMapBgm(fieldManager.currentMapId);
    if (targetBgm && !sound.currentBgmKey) {
      sound.playBgm(targetBgm);
    }
  }

  if (currentState === STATE_SHOP) { input.updateUIInput(emitVirtualKey); shopManager.update(); return; }
  if (currentState === STATE_MENU) { input.updateUIInput(emitVirtualKey); return; }
  if (currentState === STATE_FLASH) {
    flashTimer--;
    if (flashTimer <= 0) {
      currentState = STATE_BATTLE;
      battleManager.startBattle(pendingMonsterId, pendingIsAmbush);
      pendingIsAmbush = false;
    }
    return;
  }
  if (currentState === STATE_BATTLE) { input.updateUIInput(emitVirtualKey); battleManager.update(); return; }
  if (currentState === STATE_MESSAGE) { input.updateUIInput(emitVirtualKey); messageWindow.update(); return; }

  fieldManager.updateNpcs(currentState);

  if (input.cancelJustPressed && !player.isMoving) { sound.playSubmit(); menuManager.open(); currentState = STATE_MENU; return; }
  if (input.actionJustPressed && !player.isMoving) { fieldManager.interactFacingObject(); return; }

  fieldManager.updatePlayer(input);
}

function draw() {
  if (titleScene.isActive) {
    return;
  }
  if (currentState === STATE_BATTLE) { battleManager.draw(ctx, canvas); return; }

  renderer.drawField(ctx, canvas, fieldManager.currentMap, fieldManager.currentMapId, player, TILE_DB);

  innManager.draw(ctx, canvas);

  if (currentState === STATE_MESSAGE) {
    const playerScreenY = player.pixelY - renderer.camera.y;
    messageWindow.isTop = playerScreenY > (canvas.height * 0.45);
    messageWindow.draw(ctx, canvas);
  }
  if (currentState === STATE_MENU) menuManager.draw(ctx, canvas);
  if (currentState === STATE_SHOP) shopManager.draw(ctx, canvas);
  if (currentState === STATE_FLASH) {
    ctx.fillStyle = (Math.floor(flashTimer / 4) % 2 === 0) ? '#ffffff' : '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  if (fieldManager.teleportTransition && fieldManager.teleportTransition.fadeAlpha > 0) {
    ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(1.0, Math.max(0.0, fieldManager.teleportTransition.fadeAlpha))})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

function gameLoop(currentTime) {
  let deltaTime = currentTime - lastTime;
  lastTime = currentTime;
  if (deltaTime > MAX_ACCUMULATOR) deltaTime = MAX_ACCUMULATOR;
  accumulator += deltaTime;
  while (accumulator >= FIXED_STEP) { update(); accumulator -= FIXED_STEP; }

  draw();
  if (!titleScene.isActive) {
    uiManager.updateSidebars(player);
  }

  requestAnimationFrame(gameLoop);
}

function initializeGameEntities() {
  player = new Player(START_GRID_X, START_GRID_Y, TILE_SIZE);
  player.direction = START_DIRECTION;

  flashTimer = 0;
  pendingMonsterId = null;
  pendingIsAmbush = false;

  input = new InputManager();
  renderer = new Renderer(TILE_SIZE);
  uiManager = new UIManager();
  messageWindow = new MessageWindow(() => { currentState = STATE_EXPLORE; });

  btnToggleBgm = document.getElementById('btn-toggle-bgm');
  btnToggleSe = document.getElementById('btn-toggle-se');

  cutsceneOverlay = document.getElementById('cutscene-overlay');
  cutsceneVideo = document.getElementById('cutscene-video');
  isCutscenePlaying = false;
  cutsceneOnFinished = null;
  cutsceneFinishHandler = null;

  if (btnToggleBgm) btnToggleBgm.addEventListener('click', toggleBgmAction);
  if (btnToggleSe) btnToggleSe.addEventListener('click', toggleSeAction);
  updateSoundUI();

  titleScene = new TitleScene({
    onNewGame: () => {
      startNewGame();
    },
    onLoadGame: () => {
      slotDialog.open('load', true);
    }
  });

  slotDialog = new SlotDialog({
    onSave: (slot) => {
      saveGame(slot);
      slotDialog.currentLoadedSlot = slot;
      try {
        localStorage.setItem('camino_de_leyenda_current_loaded_slot', String(slot));
      } catch (e) {
        // Ignored
      }
      sound.playVictory();
      const prevMode = slotDialog.mode;
      slotDialog.close();
      if (prevMode === 'menu_save') {
        menuManager.onEnd();
      }
      currentState = STATE_MESSAGE;
      messageWindow.open([logFormatter.format('field.saved_slot', { slot: String(slot) })]);
    },
    onLoad: (slot, mode) => {
      const success = loadGame(slot);
      if (success) {
        slotDialog.currentLoadedSlot = slot;
        try {
          localStorage.setItem('camino_de_leyenda_current_loaded_slot', String(slot));
        } catch (e) {
          // Ignored
        }
        sound.playHeal();
        slotDialog.close();
        if (mode === 'title_load') {
          enterGameFromTitle();
        } else {
          menuManager.onEnd();
          currentState = STATE_MESSAGE;
        }
        input.actionJustPressed = false;
        input._prevAction = true;
        messageWindow.open([logFormatter.format('field.loaded_slot', { slot: String(slot) })]);
      } else {
        sound.playBump();
        const currentInfo = document.getElementById('slot-current-info');
        if (currentInfo) {
          currentInfo.textContent = logFormatter.format('field.data_not_found', { slot: String(slot) });
          currentInfo.style.color = '#ff4d4f';
        }
      }
    },
    onClose: (closedMode) => {
      if (closedMode === 'title_load') {
        titleScene.titleMenuIndex = 1;
        titleScene.updateButtonsUI();
      } else if (closedMode === 'auto_save') {
        currentState = STATE_EXPLORE;
      } else {
        menuManager.phase = 'ROOT';
      }
    }
  });

  battleManager = new BattleManager(player, (result) => {
    if (result.result === 'DEFEAT') {
      handlePlayerDeath(false);
    } else if (result.result === 'DRAGON_VICTORY') {
      runEndingSequence();
    } else if (result.result === 'VICTORY') {
      if (fieldManager.pendingMonsterId === 'black_lizardman') {
        player.flags.blackLizardDefeated = true;
        if (!fieldManager.defeatedBosses.includes('black_lizardman')) {
          fieldManager.defeatedBosses.push('black_lizardman');
        }
      }
      if (fieldManager.pendingMonsterIndex !== null) {
        const deadNpc = fieldManager.currentMap.npcs[fieldManager.pendingMonsterIndex];
        if (
          deadNpc.id === 'gargoyle' ||
          deadNpc.id === 'dungeon_boss' ||
          deadNpc.id === 'troll' ||
          deadNpc.id === 'grave_thief' ||
          deadNpc.id === 'talos' ||
          deadNpc.id === 'cerberus'
        ) {
          fieldManager.defeatedBosses.push(deadNpc.id);
        }
        fieldManager.currentMap.npcs.splice(fieldManager.pendingMonsterIndex, 1);
      }
      const bgmKey = fieldManager.getMapBgm(fieldManager.currentMapId);
      if (bgmKey) sound.playBgm(bgmKey);
      else sound.stopBgm();
    } else {
      const bgmKey = fieldManager.getMapBgm(fieldManager.currentMapId);
      if (bgmKey) sound.playBgm(bgmKey);
      else sound.stopBgm();
    }
    fieldManager.pendingMonsterIndex = null;
    fieldManager.stepsSinceLastBattle = 0;

    if (result.result !== 'DEFEAT' && result.result !== 'DRAGON_VICTORY') {
      currentState = STATE_EXPLORE;
    }
  });

  menuManager = new MenuManager(
    player,
    messageWindow,
    () => { currentState = STATE_EXPLORE; },
    (mode) => { slotDialog.open(mode, false); },
    (targetMap, gx, gy, dir, isTeleport) => { fieldManager.changeMap(targetMap, gx, gy, dir, isTeleport); },
    () => fieldManager.currentMap,
    returnToTitle
  );
  shopManager = new ShopManager(player, () => { currentState = STATE_EXPLORE; });
  innManager = new InnManager(
    player,
    messageWindow,
    () => fieldManager.currentMap,
    () => {
      currentState = STATE_EXPLORE;
    },
    {
      onAudio: (action, payload) => {
        if (action === 'bump') sound.playBump();
        else if (action === 'stopBgm') sound.stopBgm();
        else if (action === 'inn') sound.playInn();
        else if (action === 'playBgm') sound.playBgm(payload);
      }
    }
  );
  churchManager = new ChurchManager(player, messageWindow, {
    onPlaySound: (soundId) => {
      if (soundId === 'victory') sound.playVictory();
    }
  });
  eventManager = new EventManager(
    player,
    messageWindow,
    shopManager,
    innManager,
    churchManager,
    () => { fieldManager.refreshCurrentMapNpcs(); },
    () => fieldManager.currentMapId
  );

  fieldManager = new FieldManager({
    player,
    tileDb: TILE_DB,
    renderer,
    messageWindow,
    eventManager,
    getCanvas: () => canvas,
    onEncounter: (monsterId, index = null, isAmbush = false) => {
      pendingMonsterId = monsterId;
      pendingIsAmbush = isAmbush;
      flashTimer = FLASH_DURATION;
      currentState = STATE_FLASH;
    },
    onStateChange: (newState) => {
      currentState = newState;
    },
    onPlayerDeath: handlePlayerDeath,
    onEnterDragonsCave2: () => {
      currentState = STATE_MESSAGE;
      messageWindow.open([
        logFormatter.format('field.dragons_cave_warn_1'),
        logFormatter.format('field.dragons_cave_warn_2')
      ], () => {
        slotDialog.open('auto_save');
      });
    },
    startMapId: START_MAP_ID
  });

  Object.keys(maps).forEach(mapId => {
    if(maps[mapId].npcs) {
      maps[mapId].initialNpcs = maps[mapId].npcs.map(npc => ({ ...npc }));
    }
  });
  fieldManager.refreshCurrentMapNpcs();
  renderer.init(maps, TILE_DB);
  renderer.updateCamera(player, fieldManager.currentMap, canvas.width, canvas.height);
}

async function bootstrapEngine() {
  try {
    console.log("Starting engine bootstrap...");
    await Promise.all([
      initLocaleData(),
      initItemData(),
    initMonsterData(),
    initMapData(),
    initEventData(),
    initShopData(),
    initInnData(),
    initChurchData()
      , initLogData()
  ]);
    console.log("JSON data loaded (items, spells, monsters, maps, events). Initializing entities...");

    initializeGameEntities();

    lastTime = performance.now();
    accumulator = 0;
    currentState = STATE_TITLE;
    titleScene.startSequence();

    requestAnimationFrame(gameLoop);
    console.log("Engine bootstrap complete. Game loop started.");
  } catch (error) {
    console.error("Engine Bootstrap Failed:", error);
  }
}

// ★ 追加: itch.io iframe等のフォーカス外れ対策
window.addEventListener('click', () => {
  window.focus();
});

// ★ 追加: プレイ中の不用意なページ離脱（リロード・戻る・閉じる）防止
window.addEventListener('beforeunload', (e) => {
  // タイトル画面以外（プレイ中）のみ警告ダイアログを出す
  if (currentState !== STATE_TITLE) {
    e.preventDefault();
    e.returnValue = '';
  }
});

window.onload = bootstrapEngine;
