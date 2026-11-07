// FILE_ENTRY: js/drivers/field/FieldRenderer.js
export class FieldRenderer {
  constructor(tileSize = 64) {
    if (typeof tileSize !== 'number' || !Number.isFinite(tileSize)) {
      throw new TypeError('tileSize must be a finite number');
    }
    if (tileSize <= 0) {
      throw new RangeError('tileSize must be greater than 0');
    }

    this.tileSize = tileSize;
    this.camera = { x: 0, y: 0 };

    this.tileImages = {};
    this.mapBgImages = {};

    // 暗闇マスク・光くり抜き・プレイヤー着色用オフスクリーンキャンバス
    this.darknessCanvas = null;
    this.darknessCtx = null;
    this.lightCanvas = null;
    this.lightCtx = null;
    this.playerTintCanvas = null;
    this.playerTintCtx = null;

    this.images = {};
    if (typeof Image !== 'undefined') {
      const createDirectionalImages = () => ({
        down: [new Image(), new Image()],
        up: [new Image(), new Image()],
        left: [new Image(), new Image()],
        right: [new Image(), new Image()]
      });

      this.images = {
        player: createDirectionalImages(),
        guard_port: createDirectionalImages(),
        bard: createDirectionalImages(),
        lighthousekeeper: createDirectionalImages(),
        old_man: createDirectionalImages(),
        soldier: createDirectionalImages(),
        merchant: createDirectionalImages(),
        youngman: createDirectionalImages(),
        inn_keeper: createDirectionalImages(),
        woman: createDirectionalImages(),
        girl: createDirectionalImages(),
        town_mayor: createDirectionalImages(),
        weapon_merchant: createDirectionalImages(),
        item_merchant: createDirectionalImages(),
        sister: createDirectionalImages(),
        elf: createDirectionalImages(),
        captain: createDirectionalImages(),
        slime: createDirectionalImages(),
        bat: createDirectionalImages(),
        gargoyle: createDirectionalImages(),
        troll: createDirectionalImages(),
        killer_bee: createDirectionalImages(),
        man_eater_plant: createDirectionalImages(),
        treant: createDirectionalImages(),
        undine: createDirectionalImages(),
        grave_thief: createDirectionalImages(),
        talos: createDirectionalImages(),
        cerberus: createDirectionalImages(),
        dwarf_shopper: createDirectionalImages(),
        dwarf_blacksmith: createDirectionalImages(),
        dwarf_soldier: createDirectionalImages(),

        chest: { closed: new Image(), open: new Image() },
        monument: new Image(),
        notebook: new Image()
      };
    }

    this.imageSources = {
      player: { down: ['images/main_down_0.png', 'images/main_down_1.png'], up: ['images/main_up_0.png', 'images/main_up_1.png'], left: ['images/main_left_0.png', 'images/main_left_1.png'], right: ['images/main_right_0.png', 'images/main_right_1.png'] },
      guard_port: { down: ['images/guard_port_down_0.png', 'images/guard_port_down_1.png'], up: ['images/guard_port_up_0.png', 'images/guard_port_up_1.png'], left: ['images/guard_port_left_0.png', 'images/guard_port_left_1.png'], right: ['images/guard_port_right_0.png', 'images/guard_port_right_1.png'] },
      bard: { down: ['images/bard_down_0.png', 'images/bard_down_1.png'], up: ['images/bard_up_0.png', 'images/bard_up_1.png'], left: ['images/bard_left_0.png', 'images/bard_left_1.png'], right: ['images/bard_right_0.png', 'images/bard_right_1.png'] },
      lighthousekeeper: { down: ['images/lighthousekeeper_down_0.png', 'images/lighthousekeeper_down_1.png'], up: ['images/lighthousekeeper_up_0.png', 'images/lighthousekeeper_up_1.png'], left: ['images/lighthousekeeper_left_0.png', 'images/lighthousekeeper_left_1.png'], right: ['images/lighthousekeeper_right_0.png', 'images/lighthousekeeper_right_1.png'] },
      old_man: { down: ['images/oldman_down_0.png', 'images/oldman_down_1.png'], up: ['images/oldman_up_0.png', 'images/oldman_up_1.png'], left: ['images/oldman_left_0.png', 'images/oldman_left_1.png'], right: ['images/oldman_right_0.png', 'images/oldman_right_1.png'] },
      soldier: { down: ['images/soldier_down_0.png', 'images/soldier_down_1.png'], up: ['images/soldier_up_0.png', 'images/soldier_up_1.png'], left: ['images/soldier_left_0.png', 'images/soldier_left_1.png'], right: ['images/soldier_right_0.png', 'images/soldier_right_1.png'] },
      merchant: { down: ['images/merchant_down_0.png', 'images/merchant_down_1.png'], up: ['images/merchant_up_0.png', 'images/merchant_up_1.png'], left: ['images/merchant_left_0.png', 'images/merchant_left_1.png'], right: ['images/merchant_right_0.png', 'images/merchant_right_1.png'] },
      youngman: { down: ['images/youngman_down_0.png', 'images/youngman_down_1.png'], up: ['images/youngman_up_0.png', 'images/youngman_up_1.png'], left: ['images/youngman_left_0.png', 'images/youngman_left_1.png'], right: ['images/youngman_right_0.png', 'images/youngman_right_1.png'] },
      inn_keeper: { down: ['images/innkeeper_down_0.png', 'images/innkeeper_down_1.png'], up: ['images/innkeeper_up_0.png', 'images/innkeeper_up_1.png'], left: ['images/innkeeper_left_0.png', 'images/innkeeper_left_1.png'], right: ['images/innkeeper_right_0.png', 'images/innkeeper_right_1.png'] },
      woman: { down: ['images/woman_down_0.png', 'images/woman_down_1.png'], up: ['images/woman_up_0.png', 'images/woman_up_1.png'], left: ['images/woman_left_0.png', 'images/woman_left_1.png'], right: ['images/woman_right_0.png', 'images/woman_right_1.png'] },
      girl: { down: ['images/girl_down_0.png', 'images/girl_down_1.png'], up: ['images/girl_up_0.png', 'images/girl_up_1.png'], left: ['images/girl_left_0.png', 'images/girl_left_1.png'], right: ['images/girl_right_0.png', 'images/girl_right_1.png'] },
      town_mayor: { down: ['images/town_mayor_down_0.png', 'images/town_mayor_down_1.png'], up: ['images/town_mayor_up_0.png', 'images/town_mayor_up_1.png'], left: ['images/town_mayor_left_0.png', 'images/town_mayor_left_1.png'], right: ['images/town_mayor_right_0.png', 'images/town_mayor_right_1.png'] },
      weapon_merchant: { down: ['images/weapon_merchant_down_0.png', 'images/weapon_merchant_down_1.png'], up: ['images/weapon_merchant_up_0.png', 'images/weapon_merchant_up_1.png'], left: ['images/weapon_merchant_left_0.png', 'images/weapon_merchant_left_1.png'], right: ['images/weapon_merchant_right_0.png', 'images/weapon_merchant_right_1.png'] },
      item_merchant: { down: ['images/item_merchant_down_0.png', 'images/item_merchant_down_1.png'], up: ['images/item_merchant_up_0.png', 'images/item_merchant_up_1.png'], left: ['images/item_merchant_left_0.png', 'images/item_merchant_left_1.png'], right: ['images/item_merchant_right_0.png', 'images/item_merchant_right_1.png'] },
      sister: { down: ['images/sister_down_0.png', 'images/sister_down_1.png'], up: ['images/sister_up_0.png', 'images/sister_up_1.png'], left: ['images/sister_left_0.png', 'images/sister_left_1.png'], right: ['images/sister_right_0.png', 'images/sister_right_1.png'] },
      elf: { down: ['images/elf_down_0.png', 'images/elf_down_1.png'], up: ['images/elf_up_0.png', 'images/elf_up_1.png'], left: ['images/elf_left_0.png', 'images/elf_left_1.png'], right: ['images/elf_right_0.png', 'images/elf_right_1.png'] },
      captain: { down: ['images/captain_down_0.png', 'images/captain_down_1.png'], up: ['images/captain_up_0.png', 'images/captain_up_1.png'], left: ['images/captain_left_0.png', 'images/captain_left_1.png'], right: ['images/captain_right_0.png', 'images/captain_right_1.png'] },
      gargoyle: { down: ['images/gargoyle_down_0.png', 'images/gargoyle_down_1.png'], up: ['images/gargoyle_up_0.png', 'images/gargoyle_up_1.png'], left: ['images/gargoyle_left_0.png', 'images/gargoyle_left_1.png'], right: ['images/gargoyle_right_0.png', 'images/gargoyle_right_1.png'] },
      troll: { down: ['images/troll_down_0.png', 'images/troll_down_1.png'], up: ['images/troll_up_0.png', 'images/troll_up_1.png'], left: ['images/troll_left_0.png', 'images/troll_left_1.png'], right: ['images/troll_right_0.png', 'images/troll_right_1.png'] },
      grave_thief: { down: ['images/grave_thief_down_0.png', 'images/grave_thief_down_1.png'], up: ['images/grave_thief_up_0.png', 'images/grave_thief_up_1.png'], left: ['images/grave_thief_left_0.png', 'images/grave_thief_left_1.png'], right: ['images/grave_thief_right_0.png', 'images/grave_thief_right_1.png'] },
      talos: { down: ['images/talos_down_0.png', 'images/talos_down_1.png'], up: ['images/talos_up_0.png', 'images/talos_up_1.png'], left: ['images/talos_left_0.png', 'images/talos_left_1.png'], right: ['images/talos_right_0.png', 'images/talos_right_1.png'] },
      cerberus: { down: ['images/cerberus_down_0.png', 'images/cerberus_down_1.png'], up: ['images/cerberus_up_0.png', 'images/cerberus_up_1.png'], left: ['images/cerberus_left_0.png', 'images/cerberus_left_1.png'], right: ['images/cerberus_right_0.png', 'images/cerberus_right_1.png'] },
      dwarf_shopper: { down: ['images/dwarf_shopper_down_0.png', 'images/dwarf_shopper_down_1.png'], up: ['images/dwarf_shopper_up_0.png', 'images/dwarf_shopper_up_1.png'], left: ['images/dwarf_shopper_left_0.png', 'images/dwarf_shopper_left_1.png'], right: ['images/dwarf_shopper_right_0.png', 'images/dwarf_shopper_right_1.png'] },
      dwarf_blacksmith: { down: ['images/dwarf_blacksmith_down_0.png', 'images/dwarf_blacksmith_down_1.png'], up: ['images/dwarf_blacksmith_up_0.png', 'images/dwarf_blacksmith_up_1.png'], left: ['images/dwarf_blacksmith_left_0.png', 'images/dwarf_blacksmith_left_1.png'], right: ['images/dwarf_blacksmith_right_0.png', 'images/dwarf_blacksmith_right_1.png'] },
      dwarf_soldier: { down: ['images/dwarf_soldier_down_0.png', 'images/dwarf_soldier_down_1.png'], up: ['images/dwarf_soldier_up_0.png', 'images/dwarf_soldier_up_1.png'], left: ['images/dwarf_soldier_left_0.png', 'images/dwarf_soldier_left_1.png'], right: ['images/dwarf_soldier_right_0.png', 'images/dwarf_soldier_right_1.png'] },
      undine: { down: ['images/undine_down_0.png', 'images/undine_down_1.png'], up: ['images/undine_up_0.png', 'images/undine_up_1.png'], left: ['images/undine_left_0.png', 'images/undine_left_1.png'], right: ['images/undine_right_0.png', 'images/undine_right_1.png'] }
    };
  }

  static normalizeFieldInput(rawInput) {
    if (typeof rawInput !== 'object' || rawInput === null) {
      return {
        up: false,
        down: false,
        left: false,
        right: false,
        actionJustPressed: false,
        cancelJustPressed: false
      };
    }
    return {
      up: Boolean(rawInput.up),
      down: Boolean(rawInput.down),
      left: Boolean(rawInput.left),
      right: Boolean(rawInput.right),
      actionJustPressed: Boolean(rawInput.actionJustPressed),
      cancelJustPressed: Boolean(rawInput.cancelJustPressed)
    };
  }

  normalizeFieldInput(rawInput) {
    return FieldRenderer.normalizeFieldInput(rawInput);
  }

  init(maps, tileDb) {
    if (typeof Image === 'undefined') {
      return;
    }
    if (typeof maps !== 'object' || maps === null || typeof tileDb !== 'object' || tileDb === null) {
      throw new TypeError('maps and tileDb must be non-null objects');
    }

    Object.keys(maps).forEach(mapId => {
      const bgSrc = maps[mapId].backgroundImage;
      if (bgSrc) {
        const img = new Image();
        img.onerror = () => { };
        img.src = bgSrc;
        this.mapBgImages[mapId] = img;
      }
    });

    Object.keys(tileDb).forEach(id => {
      const tileDef = tileDb[id];
      if (tileDef && tileDef.imageSrc) {
        const img = new Image();
        img.onerror = () => { };
        img.src = tileDef.imageSrc;
        this.tileImages[id] = img;
      }
    });

    if (this.images.chest) {
      this.images.chest.closed.src = 'images/chest_closed.png';
      this.images.chest.open.src = 'images/chest_open.png';
    }
    if (this.images.monument) {
      this.images.monument.src = 'images/stone_monument.png';
      this.images.monument.onerror = () => { this.images.monument._loadFailed = true; };
      this.images.monument.onload = () => { this.images.monument._loadFailed = false; };
    }
    if (this.images.notebook) {
      this.images.notebook.src = 'images/notebook.png';
    }

    Object.keys(this.imageSources).forEach(entityKey => {
      if (!this.images[entityKey]) return;
      Object.keys(this.imageSources[entityKey]).forEach(dir => {
        this.imageSources[entityKey][dir].forEach((srcPath, index) => {
          const img = this.images[entityKey][dir][index];
          if (img) {
            img.onerror = () => { img._loadFailed = true; };
            img.onload = () => { img._loadFailed = false; };
            img.src = srcPath;
          }
        });
      });
    });
  }

  _validateMapData(currentMap) {
    if (typeof currentMap !== 'object' || currentMap === null) {
      throw new TypeError('currentMap must be a non-null object');
    }
    if (!Array.isArray(currentMap.data) || currentMap.data.length === 0 || !Array.isArray(currentMap.data[0]) || currentMap.data[0].length === 0) {
      throw new TypeError('currentMap.data must be a non-empty 2D array');
    }
  }

  _validatePlayer(player) {
    if (typeof player !== 'object' || player === null) {
      throw new TypeError('player must be a non-null object');
    }
    if (typeof player.pixelX !== 'number' || !Number.isFinite(player.pixelX) || typeof player.pixelY !== 'number' || !Number.isFinite(player.pixelY)) {
      throw new TypeError('player.pixelX and player.pixelY must be finite numbers');
    }
  }

  _validateRenderContextAndCanvas(ctx, canvas) {
    if (
      typeof ctx !== 'object' ||
      ctx === null ||
      typeof ctx.fillRect !== 'function' ||
      typeof ctx.save !== 'function' ||
      typeof ctx.restore !== 'function' ||
      typeof ctx.translate !== 'function'
    ) {
      throw new TypeError('ctx must be a valid CanvasRenderingContext2D-like object');
    }
    if (typeof canvas !== 'object' || canvas === null) {
      throw new TypeError('canvas must be a non-null object');
    }
    if (typeof canvas.width !== 'number' || !Number.isFinite(canvas.width) || typeof canvas.height !== 'number' || !Number.isFinite(canvas.height)) {
      throw new TypeError('canvas.width and canvas.height must be finite numbers');
    }
    if (canvas.width <= 0 || canvas.height <= 0) {
      throw new RangeError('canvas.width and canvas.height must be greater than 0');
    }
  }

  updateCamera(player, currentMap, canvasWidth, canvasHeight) {
    this._validatePlayer(player);
    this._validateMapData(currentMap);

    if (typeof canvasWidth !== 'number' || !Number.isFinite(canvasWidth) || typeof canvasHeight !== 'number' || !Number.isFinite(canvasHeight)) {
      throw new TypeError('canvasWidth and canvasHeight must be finite numbers');
    }
    if (canvasWidth <= 0 || canvasHeight <= 0) {
      throw new RangeError('canvasWidth and canvasHeight must be greater than 0');
    }

    const mapData = currentMap.data;
    const mapWidthPixels = mapData[0].length * this.tileSize;
    const mapHeightPixels = mapData.length * this.tileSize;

    if (mapWidthPixels < canvasWidth) {
      this.camera.x = Math.floor((mapWidthPixels - canvasWidth) / 2);
    } else {
      const targetCameraX = player.pixelX + (this.tileSize / 2) - (canvasWidth / 2);
      const maxCameraX = mapWidthPixels - canvasWidth;
      this.camera.x = Math.floor(Math.max(0, Math.min(targetCameraX, maxCameraX)));
    }

    if (mapHeightPixels < canvasHeight) {
      this.camera.y = Math.floor((mapHeightPixels - canvasHeight) / 2);
    } else {
      const targetCameraY = player.pixelY + (this.tileSize / 2) - (canvasHeight / 2);
      const maxCameraY = mapHeightPixels - canvasHeight;
      this.camera.y = Math.floor(Math.max(0, Math.min(targetCameraY, maxCameraY)));
    }
  }

  drawStairs(ctx, px, py) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(px + 8, py + 8, 48, 48);
    ctx.fillStyle = '#888888';
    ctx.fillRect(px + 12, py + 14, 40, 6);
    ctx.fillRect(px + 12, py + 24, 40, 6);
    ctx.fillRect(px + 12, py + 34, 40, 6);
    ctx.fillRect(px + 12, py + 44, 40, 6);
  }

  drawInteractables(ctx, currentMap) {
    if (!Array.isArray(currentMap.interactables)) {
      return;
    }

    currentMap.interactables.forEach(obj => {
      const px = obj.gridX * this.tileSize;
      const py = obj.gridY * this.tileSize;
      if (obj.type === 'sign') {
        ctx.fillStyle = '#8b5a2b';
        ctx.fillRect(px + 28, py + 36, 8, 24);
        ctx.fillStyle = '#cd853f';
        ctx.fillRect(px + 8, py + 12, 48, 32);
        if (typeof ctx.strokeRect === 'function') {
          ctx.strokeStyle = '#4a2c11';
          ctx.lineWidth = 2;
          ctx.strokeRect(px + 8, py + 12, 48, 32);
        }
        ctx.fillStyle = '#4a2c11';
        ctx.fillRect(px + 14, py + 22, 36, 4);
        ctx.fillRect(px + 14, py + 30, 24, 4);
      } else if (obj.type === 'chest') {
        const chestImg = this.images.chest ? (obj.isOpen ? this.images.chest.open : this.images.chest.closed) : null;
        if (chestImg && chestImg.complete && !chestImg._loadFailed && chestImg.naturalWidth !== 0) {
          ctx.drawImage(chestImg, px, py, this.tileSize, this.tileSize);
        } else {
          if (!obj.isOpen) {
            ctx.fillStyle = '#b8860b';
            ctx.fillRect(px + 8, py + 16, 48, 40);
          } else {
            ctx.fillStyle = '#222';
            ctx.fillRect(px + 8, py + 8, 48, 20);
          }
        }
      } else if (obj.type === 'monument') {
        const monImg = this.images.monument;
        if (monImg && monImg.complete && !monImg._loadFailed && monImg.naturalWidth !== 0) {
          ctx.drawImage(monImg, px, py, this.tileSize, this.tileSize);
        } else {
          ctx.fillStyle = '#7f8c8d';
          ctx.fillRect(px + 8, py + 8, 48, 48);
        }
      } else if (obj.type === 'notebook') {
        const nbImg = this.images.notebook;
        if (nbImg && nbImg.complete && !nbImg._loadFailed && nbImg.naturalWidth !== 0) {
          ctx.drawImage(nbImg, px, py, this.tileSize, this.tileSize);
        } else {
          ctx.fillStyle = '#7f8c8d';
          ctx.fillRect(px + 8, py + 8, 48, 48);
        }
      }
    });
  }

  drawNpcs(ctx, currentMap) {
    if (!Array.isArray(currentMap.npcs)) {
      return;
    }

    currentMap.npcs.forEach(npc => {
      const spriteKey = npc.sprite || npc.id;
      const dirKey = typeof npc.direction === 'string' ? npc.direction : 'down';
      const animIdx = typeof npc.animFrame === 'number' ? npc.animFrame : 0;
      let drawn = false;

      if (this.images[spriteKey] && this.images[spriteKey][dirKey]) {
        const npcImg = this.images[spriteKey][dirKey][animIdx];
        if (npcImg && npcImg.complete && !npcImg._loadFailed && npcImg.naturalWidth !== 0) {
          ctx.drawImage(npcImg, npc.pixelX, npc.pixelY, this.tileSize, this.tileSize);
          drawn = true;
        }
      }

      if (!drawn) {
        ctx.fillStyle = npc.color || '#fff';
        ctx.fillRect(npc.pixelX + 12, npc.pixelY + 12, 40, 44);
        if (typeof ctx.strokeRect === 'function') {
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;
          ctx.strokeRect(npc.pixelX + 12, npc.pixelY + 12, 40, 44);
        }
        ctx.fillStyle = '#ffffff';
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(npc.name ? npc.name.slice(0, 3) : dirKey, npc.pixelX + 32, npc.pixelY + 38);
      }
    });
  }

  computeVisibilityPolygon(startX, startY, maxDist, currentMap, tileDb) {
    if (typeof startX !== 'number' || !Number.isFinite(startX) || typeof startY !== 'number' || !Number.isFinite(startY)) {
      throw new TypeError('startX and startY must be finite numbers');
    }
    if (typeof maxDist !== 'number' || !Number.isFinite(maxDist) || maxDist <= 0) {
      throw new RangeError('maxDist must be a positive finite number');
    }
    this._validateMapData(currentMap);
    if (typeof tileDb !== 'object' || tileDb === null) {
      throw new TypeError('tileDb must be a non-null object');
    }

    const mapData = currentMap.data;
    const tileSize = this.tileSize;
    const numRays = 120;
    const points = [];

    const mapHeight = mapData.length;
    const mapWidth = mapData[0].length;
    const wallPenetration = 24;

    for (let i = 0; i < numRays; i++) {
      const angle = (i * 2 * Math.PI) / numRays;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      let mapX = Math.floor(startX / tileSize);
      let mapY = Math.floor(startY / tileSize);

      const stepX = cos >= 0 ? 1 : -1;
      const stepY = sin >= 0 ? 1 : -1;

      const deltaDistX = Math.abs(cos) < 1e-6 ? Infinity : Math.abs(tileSize / cos);
      const deltaDistY = Math.abs(sin) < 1e-6 ? Infinity : Math.abs(tileSize / sin);

      let sideDistX = Infinity;
      if (Math.abs(cos) >= 1e-6) {
        sideDistX = cos > 0
          ? ((mapX + 1) * tileSize - startX) / cos
          : (startX - mapX * tileSize) / -cos;
      }

      let sideDistY = Infinity;
      if (Math.abs(sin) >= 1e-6) {
        sideDistY = sin > 0
          ? ((mapY + 1) * tileSize - startY) / sin
          : (startY - mapY * tileSize) / -sin;
      }

      let dist = 0;
      let hitWall = false;

      while (dist < maxDist) {
        if (sideDistX < sideDistY) {
          dist = sideDistX;
          sideDistX += deltaDistX;
          mapX += stepX;
        } else {
          dist = sideDistY;
          sideDistY += deltaDistY;
          mapY += stepY;
        }

        if (dist >= maxDist) {
          dist = maxDist;
          break;
        }

        if (mapY < 0 || mapY >= mapHeight || mapX < 0 || mapX >= mapWidth) {
          hitWall = true;
          break;
        }

        const tile = mapData[mapY][mapX];
        const tileDef = tileDb[tile];
        const isBlocking = tileDef
          ? (tileDef.blockLight !== undefined ? tileDef.blockLight : !tileDef.pass)
          : true;

        if (isBlocking) {
          hitWall = true;
          break;
        }
      }

      if (hitWall) {
        dist = Math.min(maxDist, dist + wallPenetration);
      } else if (dist > maxDist) {
        dist = maxDist;
      }

      points.push({
        x: startX + cos * dist,
        y: startY + sin * dist
      });
    }

    return points;
  }

  drawDarkness(ctx, canvas, player, remiraSteps, torchSteps, isLanternLit, currentMap, tileDb) {
    const worldPlayerX = player.pixelX + (this.tileSize / 2);
    const worldPlayerY = player.pixelY + (this.tileSize / 2);

    let radius = 50;
    if (remiraSteps > 0) {
      radius = 280;
    } else if (torchSteps > 0) {
      radius = 210;
    } else if (isLanternLit) {
      radius = 190;
    }

    // 視線レイキャストによる可視ポリゴンの生成（ヘッドレス環境でも計算を実行）
    const poly = this.computeVisibilityPolygon(worldPlayerX, worldPlayerY, radius, currentMap, tileDb);

    if (typeof document === 'undefined' || typeof document.createElement !== 'function') {
      return;
    }

    if (!this.darknessCanvas) {
      const createdDarknessCanvas = document.createElement('canvas');
      if (!createdDarknessCanvas || typeof createdDarknessCanvas.getContext !== 'function') {
        return;
      }
      this.darknessCanvas = createdDarknessCanvas;
      this.darknessCanvas.width = canvas.width;
      this.darknessCanvas.height = canvas.height;
      this.darknessCtx = this.darknessCanvas.getContext('2d');
    } else if (this.darknessCanvas.width !== canvas.width || this.darknessCanvas.height !== canvas.height) {
      this.darknessCanvas.width = canvas.width;
      this.darknessCanvas.height = canvas.height;
    }

    if (!this.lightCanvas) {
      const createdLightCanvas = document.createElement('canvas');
      if (!createdLightCanvas || typeof createdLightCanvas.getContext !== 'function') {
        return;
      }
      this.lightCanvas = createdLightCanvas;
      this.lightCanvas.width = canvas.width;
      this.lightCanvas.height = canvas.height;
      this.lightCtx = this.lightCanvas.getContext('2d');
    } else if (this.lightCanvas.width !== canvas.width || this.lightCanvas.height !== canvas.height) {
      this.lightCanvas.width = canvas.width;
      this.lightCanvas.height = canvas.height;
    }

    const dCtx = this.darknessCtx;
    const lCtx = this.lightCtx;
    if (!dCtx || !lCtx) {
      return;
    }

    dCtx.clearRect(0, 0, canvas.width, canvas.height);
    lCtx.clearRect(0, 0, canvas.width, canvas.height);

    // 暗闇ベース（0.99不透明度の黒）
    dCtx.fillStyle = 'rgba(0, 0, 0, 0.99)';
    dCtx.fillRect(0, 0, canvas.width, canvas.height);

    const screenX = worldPlayerX - this.camera.x;
    const screenY = worldPlayerY - this.camera.y;
    const innerRadius = Math.max(20, radius * 0.55);

    if (poly.length > 0) {
      // 1. 光マスク（lightCanvas）に可視ポリゴンを白で描画
      lCtx.save();
      lCtx.beginPath();
      lCtx.moveTo(poly[0].x - this.camera.x, poly[0].y - this.camera.y);
      for (let i = 1; i < poly.length; i++) {
        lCtx.lineTo(poly[i].x - this.camera.x, poly[i].y - this.camera.y);
      }
      lCtx.closePath();
      lCtx.fillStyle = '#ffffff';
      lCtx.fill();

      // 2. ポリゴン内部に放射グラデーションを合成して光源の減衰を表現
      lCtx.globalCompositeOperation = 'source-in';
      const grad = lCtx.createRadialGradient(screenX, screenY, innerRadius, screenX, screenY, radius);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.45)');
      grad.addColorStop(0.8, 'rgba(255, 255, 255, 0.15)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
      lCtx.fillStyle = grad;
      lCtx.fillRect(0, 0, canvas.width, canvas.height);
      lCtx.restore();

      // 3. 暗闇キャンバスに対し、影のエッジを適度にぼかして（ソフトシャドウ）くり抜く
      dCtx.save();
      dCtx.filter = 'blur(12px)';
      dCtx.globalCompositeOperation = 'destination-out';
      dCtx.drawImage(this.lightCanvas, 0, 0);
      dCtx.restore();
    }

    // メインキャンバスへ転送
    ctx.drawImage(this.darknessCanvas, 0, 0);
  }

  drawField(ctx, canvas, currentMap, currentMapId, player, tileDb, playerStats = null) {
    this._validateRenderContextAndCanvas(ctx, canvas);
    this._validateMapData(currentMap);
    this._validatePlayer(player);
    if (typeof tileDb !== 'object' || tileDb === null) {
      throw new TypeError('tileDb must be a non-null object');
    }

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    let shakeOffsetX = 0;
    let shakeOffsetY = 0;
    if (player.poisonShakeTimer > 0) {
      shakeOffsetX = (Math.random() - 0.5) * 6;
      shakeOffsetY = (Math.random() - 0.5) * 6;
    }
    ctx.translate(-this.camera.x + shakeOffsetX, -this.camera.y + shakeOffsetY);

    const mapData = currentMap.data;
    const mapWidth = mapData[0].length * this.tileSize;
    const mapHeight = mapData.length * this.tileSize;

    const bgImg = this.mapBgImages[currentMapId];
    if (bgImg && bgImg.complete && bgImg.naturalWidth !== 0) {
      ctx.drawImage(bgImg, 0, 0, mapWidth, mapHeight);
    } else {
      const startCol = Math.max(0, Math.floor(this.camera.x / this.tileSize));
      const endCol = Math.min(mapData[0].length - 1, Math.floor((this.camera.x + canvas.width) / this.tileSize));
      const startRow = Math.max(0, Math.floor(this.camera.y / this.tileSize));
      const endRow = Math.min(mapData.length - 1, Math.floor((this.camera.y + canvas.height) / this.tileSize));

      for (let y = startRow; y <= endRow; y++) {
        for (let x = startCol; x <= endCol; x++) {
          const tile = mapData[y][x];
          const px = x * this.tileSize;
          const py = y * this.tileSize;
          const tileDef = tileDb[tile];
          const img = this.tileImages[tile];

          if (img && img.complete && img.naturalWidth !== 0) {
            ctx.drawImage(img, px, py, this.tileSize, this.tileSize);
          } else {
            ctx.fillStyle = tileDef && tileDef.color ? tileDef.color : '#000000';
            ctx.fillRect(px, py, this.tileSize, this.tileSize);

            if (tileDef && tileDef.isSwamp) {
              ctx.fillStyle = '#a29bfe';
              ctx.fillRect(px + 16, py + 16, 8, 8);
              ctx.fillRect(px + 40, py + 36, 6, 6);
            } else if (tileDef && tileDef.isMagma) {
              ctx.fillStyle = '#f39c12';
              ctx.fillRect(px + 14, py + 14, 10, 8);
              ctx.fillRect(px + 38, py + 32, 12, 10);
              ctx.fillStyle = '#f1c40f';
              ctx.fillRect(px + 16, py + 16, 6, 4);
              ctx.fillRect(px + 40, py + 34, 6, 6);
            }
          }
          if (typeof ctx.strokeRect === 'function') {
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
            ctx.lineWidth = 1;
            ctx.strokeRect(px, py, this.tileSize, this.tileSize);
          }
        }
      }
    }

    this.drawInteractables(ctx, currentMap);
    this.drawNpcs(ctx, currentMap);

    const playerDir = typeof player.direction === 'string' ? player.direction : 'down';
    const playerAnim = typeof player.animFrame === 'number' ? player.animFrame : 0;
    const playerSprites = this.images.player && this.images.player[playerDir] ? this.images.player[playerDir] : null;
    const currentImg = playerSprites ? playerSprites[playerAnim] : null;
    const isImgLoaded = currentImg && currentImg.complete && !currentImg._loadFailed && currentImg.naturalWidth !== 0;

    const isPoisonFlashing = player.poisonFlashTimer > 0 && Math.floor(player.poisonFlashTimer / 4) % 2 === 0;
    const isMagmaFlashing = player.magmaFlashTimer > 0 && Math.floor(player.magmaFlashTimer / 4) % 2 === 0;

    if (isImgLoaded) {
      let canTint = false;
      if ((isPoisonFlashing || isMagmaFlashing) && typeof document !== 'undefined' && typeof document.createElement === 'function') {
        if (!this.playerTintCanvas) {
          const createdTintCanvas = document.createElement('canvas');
          if (createdTintCanvas && typeof createdTintCanvas.getContext === 'function') {
            this.playerTintCanvas = createdTintCanvas;
            this.playerTintCanvas.width = this.tileSize;
            this.playerTintCanvas.height = this.tileSize;
            this.playerTintCtx = this.playerTintCanvas.getContext('2d');
          }
        }
        if (this.playerTintCanvas && this.playerTintCtx) {
          canTint = true;
        }
      }

      if (canTint) {
        const pCtx = this.playerTintCtx;
        pCtx.clearRect(0, 0, this.tileSize, this.tileSize);
        pCtx.drawImage(currentImg, 0, 0, this.tileSize, this.tileSize);
        pCtx.save();
        pCtx.globalCompositeOperation = 'source-atop';
        pCtx.fillStyle = isMagmaFlashing ? 'rgba(231, 76, 60, 0.7)' : 'rgba(155, 89, 182, 0.6)';
        pCtx.fillRect(0, 0, this.tileSize, this.tileSize);
        pCtx.restore();
        ctx.drawImage(this.playerTintCanvas, player.pixelX, player.pixelY);
      } else {
        ctx.drawImage(currentImg, player.pixelX, player.pixelY, this.tileSize, this.tileSize);
      }
    } else {
      ctx.fillStyle = isMagmaFlashing ? '#e74c3c' : (isPoisonFlashing ? '#9b59b6' : '#e74c3c');
      ctx.fillRect(player.pixelX, player.pixelY, this.tileSize, this.tileSize);
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(playerDir, player.pixelX + 32, player.pixelY + 36);
    }

    ctx.restore();

    if (currentMap.isDark) {
      const stats = playerStats || player;
      const remiraSteps = (stats && stats.remiraSteps) ? stats.remiraSteps : 0;
      const torchSteps = (stats && stats.torchSteps) ? stats.torchSteps : 0;
      const isLanternLit = !!(stats && stats.isLanternLit && stats.inventory && stats.inventory.lantern > 0);
      this.drawDarkness(ctx, canvas, player, remiraSteps, torchSteps, isLanternLit, currentMap, tileDb);
    }
  }

  render(ctx, canvas, state) {
    if (typeof state !== 'object' || state === null) {
      throw new TypeError('state must be a non-null object');
    }
    const {
      currentMap,
      currentMapId = '',
      player,
      tileDb,
      playerStats = null
    } = state;

    this.drawField(ctx, canvas, currentMap, currentMapId, player, tileDb, playerStats);
  }
}