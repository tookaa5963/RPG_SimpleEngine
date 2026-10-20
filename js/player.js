// FILE_ENTRY: js/player.js
import { ITEM_DB, SPELL_DB } from './items.js';
import { i18n } from './i18n.js';

export const MAX_INVENTORY_CAPACITY = 12;

export class Player {
  constructor(gridX = 3, gridY = 4, tileSize = 64) {
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
    const weaponAtk = this.equipment.weapon && ITEM_DB[this.equipment.weapon]
      ? ITEM_DB[this.equipment.weapon].atk
      : 0;
    return this.baseAtk + weaponAtk;
  }

  get def() {
    const armorDef = this.equipment.armor && ITEM_DB[this.equipment.armor]
      ? ITEM_DB[this.equipment.armor].def
      : 0;
    const shieldDef = this.equipment.shield && ITEM_DB[this.equipment.shield]
      ? ITEM_DB[this.equipment.shield].def
      : 0;
    return this.baseDef + armorDef + shieldDef;
  }

  getInventoryCount() {
    let total = 0;
    for (const [id, count] of Object.entries(this.inventory)) {
      if (count > 0 && ITEM_DB[id]) {
        total += count;
      }
    }
    if (this.equipment.weapon) total--;
    if (this.equipment.armor) total--;
    if (this.equipment.shield) total--;
    return Math.max(0, total);
  }

  isInventoryFull(additional = 1) {
    return (this.getInventoryCount() + additional) > MAX_INVENTORY_CAPACITY;
  }

  getRequiredExpForLevel(level) {
    if (level <= 1) return 0;

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
        if (spell.learnLevel && spell.learnLevel === this.level) {
          if (!this.spells.includes(spell.id)) {
            this.spells.push(spell.id);
            newlyLearnedSpells.push(spell.name);
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

      messages.push(i18n.t('player.level_up', { level: String(this.level) }));
      messages.push(
        i18n.t('player.stat_gain', {
          hp: String(this.maxHp - oldMaxHp),
          mp: String(this.maxMp - oldMaxMp),
          atk: String(this.baseAtk - oldAtk),
          def: String(this.baseDef - oldDef),
          spd: String(this.spd - oldSpd)
        })
      );
      newlyLearnedSpells.forEach(spellName => {
        messages.push(i18n.t('player.learned_spell', { spell: spellName }));
      });
    }
    return messages;
  }

  applyExpDeathPenalty(ratio = 0.5) {
    const baseExp = this.getRequiredExpForLevel(this.level);
    const surplusExp = Math.max(0, this.exp - baseExp);
    const lostExp = Math.floor(surplusExp * ratio);
    this.exp -= lostExp;
    return lostExp;
  }

  damage(amount) {
    const actual = Math.max(0, Math.min(this.hp, Math.floor(amount)));
    this.hp -= actual;
    return actual;
  }

  heal(amount) {
    const actual = Math.max(0, Math.min(this.maxHp - this.hp, Math.floor(amount)));
    this.hp += actual;
    return actual;
  }

  healMp(amount) {
    const actual = Math.max(0, Math.min(this.maxMp - this.mp, Math.floor(amount)));
    this.mp += actual;
    return actual;
  }

  consumeMp(amount) {
    if (this.mp < amount) return false;
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
    this.gold += Math.max(0, Math.floor(amount));
    return this.gold;
  }

  useGold(amount) {
    if (this.gold < amount) return false;
    this.gold -= amount;
    return true;
  }

  addItem(id, count = 1) {
    if (!this.inventory[id]) this.inventory[id] = 0;
    this.inventory[id] += count;
    return this.inventory[id];
  }

  removeItem(id, count = 1) {
    if (!this.inventory[id] || this.inventory[id] < count) return false;
    this.inventory[id] -= count;
    if (id === 'lantern' && this.inventory.lantern <= 0) {
      this.isLanternLit = false;
    }
    return true;
  }

  updateSteps() {
    let remiraExpired = false;
    let holyWaterExpired = false;
    let poisonDamage = 0;

    if (this.remiraSteps > 0) {
      this.remiraSteps--;
      if (this.remiraSteps === 0 && this.torchSteps === 0) remiraExpired = true;
    }

    if (this.torchSteps > 0) {
      this.torchSteps--;
      if (this.torchSteps === 0 && this.remiraSteps === 0) remiraExpired = true;
    }

    if (this.holyWaterSteps > 0) {
      this.holyWaterSteps--;
      if (this.holyWaterSteps === 0) holyWaterExpired = true;
    }

    if (this.isPoisoned) {
      const hasCharm = (this.inventory.poison_charm || 0) > 0;
      const rate = hasCharm ? 0.01 : 0.02;
      poisonDamage = Math.max(1, Math.ceil(this.maxHp * rate));
      this.damage(poisonDamage);
      this.poisonFlashTimer = 24;
      this.poisonShakeTimer = 8;
    }

    return { remiraExpired, holyWaterExpired, poisonDamage };
  }

  setPosition(gridX, gridY, direction = null) {
    this.gridX = gridX;
    this.gridY = gridY;
    this.pixelX = gridX * this.tileSize;
    this.pixelY = gridY * this.tileSize;
    this.targetPixelX = this.pixelX;
    this.targetPixelY = this.pixelY;
    this.isMoving = false;
    this.turnDelay = 0;
    if (direction) this.direction = direction;
  }

  serialize() {
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
      returnPoint: this.returnPoint ? { ...this.returnPoint } : null,
      flags: { ...this.flags }
    };
  }

  deserialize(data) {
    if (!data) return;
    const ps = data.playerStats || data;
    this.level = ps.level ?? this.level;
    this.hp = ps.hp ?? this.hp;
    this.maxHp = ps.maxHp ?? this.maxHp;
    this.mp = ps.mp ?? this.mp;
    this.maxMp = ps.maxMp ?? this.maxMp;
    this.baseAtk = ps.baseAtk ?? this.baseAtk;
    this.baseDef = ps.baseDef ?? this.baseDef;
    this.spd = ps.spd ?? this.spd;
    this.exp = ps.exp ?? this.exp;
    this.gold = ps.gold ?? this.gold;
    this.spells = Array.isArray(ps.spells) ? [...ps.spells] : [];
    this.inventory = ps.inventory ? { ...ps.inventory } : {};
    this.equipment = ps.equipment ? { ...ps.equipment } : { weapon: null, armor: null, shield: null };
    if (this.equipment.shield === undefined) this.equipment.shield = null;
    this.remiraSteps = ps.remiraSteps ?? 0;
    this.torchSteps = ps.torchSteps ?? 0;
    this.holyWaterSteps = ps.holyWaterSteps ?? 0;
    this.isLanternLit = ps.isLanternLit ?? false;
    this.isPoisoned = ps.isPoisoned ?? false;

    // 帰還地のフォールバック先を灯台守の小屋に修正
    this.returnPoint = ps.returnPoint ? { ...ps.returnPoint } : {
      mapId: 'lighthousekeeper_cottage',
      gridX: 3,
      gridY: 4,
      direction: 'up'
    };

    this.flags = ps.flags ? { ...ps.flags } : {
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

    if (this.flags.hasLeftInitialCottage === undefined) this.flags.hasLeftInitialCottage = false;
    if (this.flags.reportedMonumentToScholar === undefined) this.flags.reportedMonumentToScholar = false;
    if (this.flags.elfQuestStarted === undefined) this.flags.elfQuestStarted = false;
    if (this.flags.returnedLoversRing === undefined) this.flags.returnedLoversRing = false;
    if (this.flags.receivedWaterShield === undefined) this.flags.receivedWaterShield = false;
    if (this.flags.heardOfDwarf === undefined) this.flags.heardOfDwarf = false;

    // initItemDataでSPELL_DBが初期化されるのを待つため、deserializeは遅延評価する
    // この時点でSPELL_DBにアクセスしても安全である前提
    Object.values(SPELL_DB).forEach(spell => {
      if (spell.learnLevel && this.level >= spell.learnLevel) {
        if (!this.spells.includes(spell.id)) {
          this.spells.push(spell.id);
        }
      }
    });
  }
}