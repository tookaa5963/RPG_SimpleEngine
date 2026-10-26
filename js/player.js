// FILE_ENTRY: js/player.js
import { ITEM_DB, SPELL_DB } from './items.js';
import { logFormatter } from './logFormatter.js';

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

export const MAX_INVENTORY_CAPACITY = 12;

export class Player {
  constructor(gridX = 3, gridY = 4, tileSize = 64) {
    if (typeof gridX !== 'number') {
      throw createProtocolError('TypeError', 'player.js:constructor', 'gridX', gridX);
    }
    if (Number.isNaN(gridX)) {
      throw createProtocolError('RangeError', 'player.js:constructor', 'gridX', gridX);
    }
    if (typeof gridY !== 'number') {
      throw createProtocolError('TypeError', 'player.js:constructor', 'gridY', gridY);
    }
    if (Number.isNaN(gridY)) {
      throw createProtocolError('RangeError', 'player.js:constructor', 'gridY', gridY);
    }
    if (typeof tileSize !== 'number') {
      throw createProtocolError('TypeError', 'player.js:constructor', 'tileSize', tileSize);
    }
    if (Number.isNaN(tileSize)) {
      throw createProtocolError('RangeError', 'player.js:constructor', 'tileSize', tileSize);
    }

    this.tileSize = tileSize;

    this.gridX = gridX;
    this.gridY = gridY;
    this.pixelX = gridX * tileSize;
    this.pixelY = gridY * tileSize;
    this.targetPixelX = this.pixelX;
    this.targetPixelY = this.pixelY;
    this.isMoving = false;
    this.direction = 'up';
    this.animFrame = 0;
    this.turnDelay = 0;
    this.bumpCoolDown = 0;

    this.level = 1;
    this.hp = 15;
    this.maxHp = 15;
    this.mp = 0;
    this.maxMp = 0;
    this.baseAtk = 6;
    this.baseDef = 5;
    this.spd = 5;
    this.exp = 0;
    this.gold = 0;

    this.spells = [];
    this.inventory = { herb: 1, stick: 1, cloth_armor: 1 };
    this.equipment = { weapon: 'stick', armor: 'cloth_armor', shield: null };

    this.remiraSteps = 0;
    this.torchSteps = 0;
    this.holyWaterSteps = 0;
    this.isLanternLit = false;

    this.isPoisoned = false;
    this.poisonFlashTimer = 0;
    this.poisonShakeTimer = 0;

    // 初期帰還地を「灯台守の小屋」に設定
    this.returnPoint = {
      mapId: 'lighthousekeeper_cottage',
      gridX: 3,
      gridY: 4,
      direction: 'up'
    };

    this.flags = {
      talkedToSister: false,
      receivedSisterHerb: false,
      talkedToScholar: false,
      reportedMonumentToScholar: false,
      heardPassRequirement: false,
      kidnappingEventStarted: false,
      rescuedGirl: false,
      hasPass: false,
      heardOfTizona: false,
      hasTizona: false,
      defeatedDragon: false,
      hasLeftInitialCottage: false,
      elfQuestStarted: false,
      returnedLoversRing: false,
      receivedWaterShield: false,
      heardOfDwarf: false
    };
  }

  get atk() {
    let weaponAtk = 0;
    const weaponId = this.equipment.weapon;
    if (typeof weaponId === 'string') {
      if (weaponId in ITEM_DB) {
        const item = ITEM_DB[weaponId];
        if (typeof item.atk === 'number') {
          weaponAtk = item.atk;
        }
      }
    }
    return this.baseAtk + weaponAtk;
  }

  get def() {
    let armorDef = 0;
    const armorId = this.equipment.armor;
    if (typeof armorId === 'string') {
      if (armorId in ITEM_DB) {
        const item = ITEM_DB[armorId];
        if (typeof item.def === 'number') {
          armorDef = item.def;
        }
      }
    }

    let shieldDef = 0;
    const shieldId = this.equipment.shield;
    if (typeof shieldId === 'string') {
      if (shieldId in ITEM_DB) {
        const item = ITEM_DB[shieldId];
        if (typeof item.def === 'number') {
          shieldDef = item.def;
        }
      }
    }

    return this.baseDef + armorDef + shieldDef;
  }

  getInventoryCount() {
    let total = 0;
    for (const [id, count] of Object.entries(this.inventory)) {
      if (typeof count === 'number') {
        if (count > 0) {
          if (id in ITEM_DB) {
            total += count;
          }
        }
      }
    }
    if (this.equipment.weapon !== null) {
      if (this.equipment.weapon !== undefined) {
        total--;
      }
    }
    if (this.equipment.armor !== null) {
      if (this.equipment.armor !== undefined) {
        total--;
      }
    }
    if (this.equipment.shield !== null) {
      if (this.equipment.shield !== undefined) {
        total--;
      }
    }
    return Math.max(0, total);
  }

  isInventoryFull(additional = 1) {
    if (typeof additional !== 'number') {
      throw createProtocolError('TypeError', 'player.js:isInventoryFull', 'additional', additional);
    }
    if (Number.isNaN(additional)) {
      throw createProtocolError('RangeError', 'player.js:isInventoryFull', 'additional', additional);
    }
    return (this.getInventoryCount() + additional) > MAX_INVENTORY_CAPACITY;
  }

  getRequiredExpForLevel(level) {
    if (typeof level !== 'number') {
      throw createProtocolError('TypeError', 'player.js:getRequiredExpForLevel', 'level', level);
    }
    if (Number.isNaN(level)) {
      throw createProtocolError('RangeError', 'player.js:getRequiredExpForLevel', 'level', level);
    }
    if (level <= 1) {
      return 0;
    }

    if (level <= 9) {
      return Math.floor(10 * Math.pow(2, level - 2));
    }

    let total = 1280;
    let diff = 1200;
    for (let l = 10; l <= level; l++) {
      total += diff;
      diff += 250;
    }
    return total;
  }

  addExp(amount) {
    if (typeof amount !== 'number') {
      throw createProtocolError('TypeError', 'player.js:addExp', 'amount', amount);
    }
    if (Number.isNaN(amount)) {
      throw createProtocolError('RangeError', 'player.js:addExp', 'amount', amount);
    }

    this.exp += Math.max(0, amount);
    let leveledUp = false;
    const oldMaxHp = this.maxHp;
    const oldMaxMp = this.maxMp;
    const oldAtk = this.baseAtk;
    const oldDef = this.baseDef;
    const oldSpd = this.spd;
    const newlyLearnedSpells = [];

    while (this.exp >= this.getRequiredExpForLevel(this.level + 1)) {
      this.level++;
      leveledUp = true;
      this.maxHp += Math.floor(Math.random() * 4) + 4;
      this.maxMp += Math.floor(Math.random() * 3) + 2;
      this.baseAtk += Math.floor(Math.random() * 2) + 2;
      this.baseDef += Math.floor(Math.random() * 2) + 1;
      this.spd += Math.floor(Math.random() * 2) + 1;

      Object.values(SPELL_DB).forEach(spell => {
        if (typeof spell.learnLevel === 'number') {
          if (spell.learnLevel === this.level) {
            if (!this.spells.includes(spell.id)) {
              this.spells.push(spell.id);
              newlyLearnedSpells.push(spell.name);
            }
          }
        }
      });
    }

    const messages = [];
    if (leveledUp) {
      // レベルアップ時にHP・MPを最大値まで完全回復し、毒も治癒
      this.hp = this.maxHp;
      this.mp = this.maxMp;
      this.curePoison();

      messages.push(logFormatter.format('player.level_up', { level: String(this.level) }));
      messages.push(
        logFormatter.format('player.stat_gain', {
          hp: String(this.maxHp - oldMaxHp),
          mp: String(this.maxMp - oldMaxMp),
          atk: String(this.baseAtk - oldAtk),
          def: String(this.baseDef - oldDef),
          spd: String(this.spd - oldSpd)
        })
      );
      newlyLearnedSpells.forEach(spellName => {
        messages.push(logFormatter.format('player.learned_spell', { spell: spellName }));
      });
    }
    return messages;
  }

  applyExpDeathPenalty(ratio = 0.5) {
    if (typeof ratio !== 'number') {
      throw createProtocolError('TypeError', 'player.js:applyExpDeathPenalty', 'ratio', ratio);
    }
    if (Number.isNaN(ratio)) {
      throw createProtocolError('RangeError', 'player.js:applyExpDeathPenalty', 'ratio', ratio);
    }

    const baseExp = this.getRequiredExpForLevel(this.level);
    const surplusExp = Math.max(0, this.exp - baseExp);
    const lostExp = Math.floor(surplusExp * ratio);
    this.exp -= lostExp;
    return lostExp;
  }

  damage(amount) {
    if (typeof amount !== 'number') {
      throw createProtocolError('TypeError', 'player.js:damage', 'amount', amount);
    }
    if (Number.isNaN(amount)) {
      throw createProtocolError('RangeError', 'player.js:damage', 'amount', amount);
    }

    const actual = Math.max(0, Math.min(this.hp, Math.floor(amount)));
    this.hp -= actual;
    return actual;
  }

  heal(amount) {
    if (typeof amount !== 'number') {
      throw createProtocolError('TypeError', 'player.js:heal', 'amount', amount);
    }
    if (Number.isNaN(amount)) {
      throw createProtocolError('RangeError', 'player.js:heal', 'amount', amount);
    }

    const actual = Math.max(0, Math.min(this.maxHp - this.hp, Math.floor(amount)));
    this.hp -= actual;
    return actual;
  }

  healMp(amount) {
    if (typeof amount !== 'number') {
      throw createProtocolError('TypeError', 'player.js:healMp', 'amount', amount);
    }
    if (Number.isNaN(amount)) {
      throw createProtocolError('RangeError', 'player.js:healMp', 'amount', amount);
    }

    const actual = Math.max(0, Math.min(this.maxMp - this.mp, Math.floor(amount)));
    this.mp += actual;
    return actual;
  }

  consumeMp(amount) {
    if (typeof amount !== 'number') {
      throw createProtocolError('TypeError', 'player.js:consumeMp', 'amount', amount);
    }
    if (Number.isNaN(amount)) {
      throw createProtocolError('RangeError', 'player.js:consumeMp', 'amount', amount);
    }

    if (this.mp < amount) {
      return false;
    }
    this.mp -= amount;
    return true;
  }

  fullRecovery() {
    this.hp = this.maxHp;
    this.mp = this.maxMp;
  }

  curePoison() {
    this.isPoisoned = false;
  }

  addGold(amount) {
    if (typeof amount !== 'number') {
      throw createProtocolError('TypeError', 'player.js:addGold', 'amount', amount);
    }
    if (Number.isNaN(amount)) {
      throw createProtocolError('RangeError', 'player.js:addGold', 'amount', amount);
    }

    this.gold += Math.max(0, Math.floor(amount));
    return this.gold;
  }

  useGold(amount) {
    if (typeof amount !== 'number') {
      throw createProtocolError('TypeError', 'player.js:useGold', 'amount', amount);
    }
    if (Number.isNaN(amount)) {
      throw createProtocolError('RangeError', 'player.js:useGold', 'amount', amount);
    }

    if (this.gold < amount) {
      return false;
    }
    this.gold -= amount;
    return true;
  }

  addItem(id, count = 1) {
    if (typeof id !== 'string') {
      throw createProtocolError('TypeError', 'player.js:addItem', 'id', id);
    }
    if (id.trim() === '') {
      throw createProtocolError('EmptyStringError', 'player.js:addItem', 'id', id);
    }
    if (typeof count !== 'number') {
      throw createProtocolError('TypeError', 'player.js:addItem', 'count', count);
    }
    if (Number.isNaN(count)) {
      throw createProtocolError('RangeError', 'player.js:addItem', 'count', count);
    }

    if (!(id in this.inventory)) {
      this.inventory[id] = 0;
    }
    this.inventory[id] += count;
    return this.inventory[id];
  }

  removeItem(id, count = 1) {
    if (typeof id !== 'string') {
      throw createProtocolError('TypeError', 'player.js:removeItem', 'id', id);
    }
    if (id.trim() === '') {
      throw createProtocolError('EmptyStringError', 'player.js:removeItem', 'id', id);
    }
    if (typeof count !== 'number') {
      throw createProtocolError('TypeError', 'player.js:removeItem', 'count', count);
    }
    if (Number.isNaN(count)) {
      throw createProtocolError('RangeError', 'player.js:removeItem', 'count', count);
    }

    if (!(id in this.inventory)) {
      return false;
    }
    if (this.inventory[id] < count) {
      return false;
    }

    this.inventory[id] -= count;
    if (id === 'lantern') {
      if (this.inventory.lantern <= 0) {
        this.isLanternLit = false;
      }
    }
    return true;
  }

  updateSteps() {
    let remiraExpired = false;
    let holyWaterExpired = false;
    let poisonDamage = 0;

    if (this.remiraSteps > 0) {
      this.remiraSteps--;
      if (this.remiraSteps === 0) {
        if (this.torchSteps === 0) {
          remiraExpired = true;
        }
      }
    }

    if (this.torchSteps > 0) {
      this.torchSteps--;
      if (this.torchSteps === 0) {
        if (this.remiraSteps === 0) {
          remiraExpired = true;
        }
      }
    }

    if (this.holyWaterSteps > 0) {
      this.holyWaterSteps--;
      if (this.holyWaterSteps === 0) {
        holyWaterExpired = true;
      }
    }

    if (this.isPoisoned) {
      let hasCharm = false;
      if ('poison_charm' in this.inventory) {
        if (typeof this.inventory.poison_charm === 'number') {
          if (this.inventory.poison_charm > 0) {
            hasCharm = true;
          }
        }
      }

      let rate = 0.02;
      if (hasCharm) {
        rate = 0.01;
      }

      poisonDamage = Math.max(1, Math.ceil(this.maxHp * rate));
      this.damage(poisonDamage);
      this.poisonFlashTimer = 24;
      this.poisonShakeTimer = 8;
    }

    return { remiraExpired, holyWaterExpired, poisonDamage };
  }

  setPosition(gridX, gridY, direction = null) {
    if (typeof gridX !== 'number') {
      throw createProtocolError('TypeError', 'player.js:setPosition', 'gridX', gridX);
    }
    if (Number.isNaN(gridX)) {
      throw createProtocolError('RangeError', 'player.js:setPosition', 'gridX', gridX);
    }
    if (typeof gridY !== 'number') {
      throw createProtocolError('TypeError', 'player.js:setPosition', 'gridY', gridY);
    }
    if (Number.isNaN(gridY)) {
      throw createProtocolError('RangeError', 'player.js:setPosition', 'gridY', gridY);
    }

    this.gridX = gridX;
    this.gridY = gridY;
    this.pixelX = gridX * this.tileSize;
    this.pixelY = gridY * this.tileSize;
    this.targetPixelX = this.pixelX;
    this.targetPixelY = this.pixelY;
    this.isMoving = false;
    this.turnDelay = 0;
    if (typeof direction === 'string') {
      this.direction = direction;
    }
  }

  serialize() {
    let returnPointCopy = null;
    if (this.returnPoint !== null) {
      if (typeof this.returnPoint === 'object') {
        returnPointCopy = { ...this.returnPoint };
      }
    }

    return {
      level: this.level,
      hp: this.hp,
      maxHp: this.maxHp,
      mp: this.mp,
      maxMp: this.maxMp,
      baseAtk: this.baseAtk,
      baseDef: this.baseDef,
      spd: this.spd,
      exp: this.exp,
      gold: this.gold,
      spells: [...this.spells],
      inventory: { ...this.inventory },
      equipment: { ...this.equipment },
      remiraSteps: this.remiraSteps,
      torchSteps: this.torchSteps,
      holyWaterSteps: this.holyWaterSteps,
      isLanternLit: this.isLanternLit,
      isPoisoned: this.isPoisoned,
      returnPoint: returnPointCopy,
      flags: { ...this.flags }
    };
  }

  deserialize(data) {
    if (data === null) {
      return;
    }
    if (typeof data !== 'object') {
      return;
    }

    let ps = data;
    if (data.playerStats !== undefined) {
      if (data.playerStats !== null) {
        if (typeof data.playerStats === 'object') {
          ps = data.playerStats;
        }
      }
    }

    const numberProps = [
      'level', 'hp', 'maxHp', 'mp', 'maxMp',
      'baseAtk', 'baseDef', 'spd', 'exp', 'gold',
      'remiraSteps', 'torchSteps', 'holyWaterSteps'
    ];

    numberProps.forEach(prop => {
      if (prop in ps) {
        if (typeof ps[prop] === 'number') {
          if (!Number.isNaN(ps[prop])) {
            this[prop] = ps[prop];
          }
        }
      }
    });

    if ('isLanternLit' in ps) {
      if (typeof ps.isLanternLit === 'boolean') {
        this.isLanternLit = ps.isLanternLit;
      }
    }

    if ('isPoisoned' in ps) {
      if (typeof ps.isPoisoned === 'boolean') {
        this.isPoisoned = ps.isPoisoned;
      }
    }

    if (Array.isArray(ps.spells)) {
      this.spells = [...ps.spells];
    } else {
      this.spells = [];
    }

    if (ps.inventory !== null) {
      if (typeof ps.inventory === 'object') {
        if (!Array.isArray(ps.inventory)) {
          this.inventory = { ...ps.inventory };
        }
      }
    }

    let defaultEquipment = { weapon: null, armor: null, shield: null };
    if (ps.equipment !== null) {
      if (typeof ps.equipment === 'object') {
        if (!Array.isArray(ps.equipment)) {
          defaultEquipment = { ...ps.equipment };
        }
      }
    }
    if (defaultEquipment.shield === undefined) {
      defaultEquipment.shield = null;
    }
    this.equipment = defaultEquipment;

    let defaultReturnPoint = {
      mapId: 'lighthousekeeper_cottage',
      gridX: 3,
      gridY: 4,
      direction: 'up'
    };
    if (ps.returnPoint !== null) {
      if (typeof ps.returnPoint === 'object') {
        if (!Array.isArray(ps.returnPoint)) {
          defaultReturnPoint = { ...ps.returnPoint };
        }
      }
    }
    this.returnPoint = defaultReturnPoint;

    const defaultFlags = {
      talkedToSister: false,
      receivedSisterHerb: false,
      talkedToScholar: false,
      reportedMonumentToScholar: false,
      heardPassRequirement: false,
      kidnappingEventStarted: false,
      rescuedGirl: false,
      hasPass: false,
      heardOfTizona: false,
      hasTizona: false,
      defeatedDragon: false,
      hasLeftInitialCottage: false,
      elfQuestStarted: false,
      returnedLoversRing: false,
      receivedWaterShield: false,
      heardOfDwarf: false
    };

    if (ps.flags !== null) {
      if (typeof ps.flags === 'object') {
        if (!Array.isArray(ps.flags)) {
          Object.assign(defaultFlags, ps.flags);
        }
      }
    }
    this.flags = defaultFlags;

    Object.values(SPELL_DB).forEach(spell => {
      if (typeof spell.learnLevel === 'number') {
        if (this.level >= spell.learnLevel) {
          if (!this.spells.includes(spell.id)) {
            this.spells.push(spell.id);
          }
        }
      }
    });
  }
}
