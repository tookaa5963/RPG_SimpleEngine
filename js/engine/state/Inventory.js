// FILE_ENTRY: js/engine/state/Inventory.js

/**
 * 汎用インベントリおよび装備管理クラス (Core層 / 完全ヘッドレス)
 * Tier 1 (疎結合・単一責任)
 * Tier 2 (完全ヘッドレス: DOM/ブラウザAPI完全排除)
 * Tier 3 (構文健全性: ||, ??, ?: 完全排除、明示的型検証と即時例外スロー)
 */

export const DEFAULT_MAX_CAPACITY = 12;

const VALID_EQUIP_SLOTS = ['weapon', 'armor', 'shield'];

export class Inventory {
  /**
   * @param {Object} [options={}] 初期化オプション
   * @param {number} [options.maxCapacity=12] 最大所持枠数
   * @param {Object|null} [options.eventBus=null] イベントバスインスタンス
   * @param {Object} [options.initialItems={}] 初期所持品マップ { itemId: count }
   * @param {Object} [options.initialEquipment={}] 初期装備マップ { weapon, armor, shield }
   */
  constructor(options = {}) {
    if (typeof options !== 'object') {
      throw new TypeError('[Inventory:constructor] options must be an object');
    }
    if (options === null) {
      throw new TypeError('[Inventory:constructor] options must not be null');
    }
    if (Array.isArray(options)) {
      throw new TypeError('[Inventory:constructor] options must not be an array');
    }

    let maxCap = DEFAULT_MAX_CAPACITY;
    if ('maxCapacity' in options) {
      if (typeof options.maxCapacity !== 'number') {
        throw new TypeError('[Inventory:constructor] maxCapacity must be a number');
      }
      if (Number.isNaN(options.maxCapacity)) {
        throw new RangeError('[Inventory:constructor] maxCapacity must not be NaN');
      }
      if (!Number.isInteger(options.maxCapacity)) {
        throw new RangeError('[Inventory:constructor] maxCapacity must be an integer');
      }
      if (options.maxCapacity <= 0) {
        throw new RangeError('[Inventory:constructor] maxCapacity must be greater than 0');
      }
      maxCap = options.maxCapacity;
    }
    this._maxCapacity = maxCap;

    this._eventBus = null;
    if ('eventBus' in options) {
      if (options.eventBus !== null) {
        if (typeof options.eventBus !== 'object') {
          throw new TypeError('[Inventory:constructor] eventBus must be an object or null');
        }
        this._eventBus = options.eventBus;
      }
    }

    this._items = {};
    this._equipment = {
      weapon: null,
      armor: null,
      shield: null
    };

    if ('initialItems' in options) {
      if (typeof options.initialItems !== 'object') {
        throw new TypeError('[Inventory:constructor] initialItems must be an object');
      }
      if (options.initialItems === null) {
        throw new TypeError('[Inventory:constructor] initialItems must not be null');
      }
      if (Array.isArray(options.initialItems)) {
        throw new TypeError('[Inventory:constructor] initialItems must not be an array');
      }
      for (const [key, val] of Object.entries(options.initialItems)) {
        this.addItem(key, val);
      }
    }

    if ('initialEquipment' in options) {
      if (typeof options.initialEquipment !== 'object') {
        throw new TypeError('[Inventory:constructor] initialEquipment must be an object');
      }
      if (options.initialEquipment === null) {
        throw new TypeError('[Inventory:constructor] initialEquipment must not be null');
      }
      if (Array.isArray(options.initialEquipment)) {
        throw new TypeError('[Inventory:constructor] initialEquipment must not be an array');
      }
      for (const [slot, itemId] of Object.entries(options.initialEquipment)) {
        if (itemId !== null) {
          this.equip(slot, itemId);
        }
      }
    }
  }

  get maxCapacity() {
    return this._maxCapacity;
  }

  /**
   * アイテムの追加
   * @param {string} itemId
   * @param {number} [count=1]
   * @returns {number} 追加後のアイテム総所持数
   */
  addItem(itemId, count = 1) {
    if (typeof itemId !== 'string') {
      throw new TypeError('[Inventory:addItem] itemId must be a string');
    }
    if (itemId.trim() === '') {
      throw new Error('[Inventory:addItem] itemId must not be empty');
    }
    if (typeof count !== 'number') {
      throw new TypeError('[Inventory:addItem] count must be a number');
    }
    if (Number.isNaN(count)) {
      throw new RangeError('[Inventory:addItem] count must not be NaN');
    }
    if (!Number.isInteger(count)) {
      throw new RangeError('[Inventory:addItem] count must be an integer');
    }
    if (count <= 0) {
      throw new RangeError('[Inventory:addItem] count must be greater than 0');
    }

    if (!(itemId in this._items)) {
      this._items[itemId] = 0;
    }
    this._items[itemId] += count;

    this._notifyChange('item:added', { itemId: itemId, count: count, currentCount: this._items[itemId] });

    return this._items[itemId];
  }

  /**
   * アイテムの消費・削減
   * @param {string} itemId
   * @param {number} [count=1]
   * @returns {boolean} 減算に成功したかどうか
   */
  removeItem(itemId, count = 1) {
    if (typeof itemId !== 'string') {
      throw new TypeError('[Inventory:removeItem] itemId must be a string');
    }
    if (itemId.trim() === '') {
      throw new Error('[Inventory:removeItem] itemId must not be empty');
    }
    if (typeof count !== 'number') {
      throw new TypeError('[Inventory:removeItem] count must be a number');
    }
    if (Number.isNaN(count)) {
      throw new RangeError('[Inventory:removeItem] count must not be NaN');
    }
    if (!Number.isInteger(count)) {
      throw new RangeError('[Inventory:removeItem] count must be an integer');
    }
    if (count <= 0) {
      throw new RangeError('[Inventory:removeItem] count must be greater than 0');
    }

    if (!(itemId in this._items)) {
      return false;
    }
    if (this._items[itemId] < count) {
      return false;
    }

    this._items[itemId] -= count;
    const remaining = this._items[itemId];
    if (remaining === 0) {
      delete this._items[itemId];
    }

    // 所持数が0になった場合、該当アイテムの装備を自動解除
    if (remaining === 0) {
      for (const slot of VALID_EQUIP_SLOTS) {
        if (this._equipment[slot] === itemId) {
          this._equipment[slot] = null;
          this._notifyChange('equipment:unequipped', { slot: slot, itemId: itemId, auto: true });
        }
      }
    }

    this._notifyChange('item:removed', { itemId: itemId, count: count, currentCount: remaining });

    return true;
  }

  /**
   * 指定アイテムの所持数を取得
   * @param {string} itemId
   * @returns {number}
   */
  getItemCount(itemId) {
    if (typeof itemId !== 'string') {
      throw new TypeError('[Inventory:getItemCount] itemId must be a string');
    }
    if (itemId.trim() === '') {
      throw new Error('[Inventory:getItemCount] itemId must not be empty');
    }
    if (itemId in this._items) {
      return this._items[itemId];
    }
    return 0;
  }

  /**
   * 指定アイテムを指定個数以上所持しているか
   * @param {string} itemId
   * @param {number} [count=1]
   * @returns {boolean}
   */
  hasItem(itemId, count = 1) {
    if (typeof itemId !== 'string') {
      throw new TypeError('[Inventory:hasItem] itemId must be a string');
    }
    if (itemId.trim() === '') {
      throw new Error('[Inventory:hasItem] itemId must not be empty');
    }
    if (typeof count !== 'number') {
      throw new TypeError('[Inventory:hasItem] count must be a number');
    }
    if (Number.isNaN(count)) {
      throw new RangeError('[Inventory:hasItem] count must not be NaN');
    }
    if (!Number.isInteger(count)) {
      throw new RangeError('[Inventory:hasItem] count must be an integer');
    }
    if (count <= 0) {
      throw new RangeError('[Inventory:hasItem] count must be greater than 0');
    }

    return this.getItemCount(itemId) >= count;
  }

  /**
   * 全所持アイテムの防御的コピーを取得
   * @returns {Object}
   */
  getItems() {
    const copy = {};
    for (const [key, val] of Object.entries(this._items)) {
      copy[key] = val;
    }
    return copy;
  }

  /**
   * 全アイテムの合計個数を取得
   * @returns {number}
   */
  getTotalItemCount() {
    let total = 0;
    for (const val of Object.values(this._items)) {
      total += val;
    }
    return total;
  }

  /**
   * 現在装備中のスロット数（非null）を取得
   * @returns {number}
   */
  getEquippedCount() {
    let count = 0;
    for (const slot of VALID_EQUIP_SLOTS) {
      if (this._equipment[slot] !== null) {
        count += 1;
      }
    }
    return count;
  }

  /**
   * バッグ占有数（所持総数から装備中の数を引いた値。既存 getInventoryCount 互換）を取得
   * @returns {number}
   */
  getBagCount() {
    const total = this.getTotalItemCount();
    const equipped = this.getEquippedCount();
    const bagCount = total - equipped;
    if (bagCount < 0) {
      return 0;
    }
    return bagCount;
  }

  /**
   * インベントリが満杯かどうか（既存 isInventoryFull 互換）
   * @param {number} [additional=1] 追加予定個数
   * @returns {boolean}
   */
  isFull(additional = 1) {
    if (typeof additional !== 'number') {
      throw new TypeError('[Inventory:isFull] additional must be a number');
    }
    if (Number.isNaN(additional)) {
      throw new RangeError('[Inventory:isFull] additional must not be NaN');
    }
    if (!Number.isInteger(additional)) {
      throw new RangeError('[Inventory:isFull] additional must be an integer');
    }
    if (additional < 0) {
      throw new RangeError('[Inventory:isFull] additional must be non-negative');
    }

    return (this.getBagCount() + additional) > this._maxCapacity;
  }

  /**
   * 装備スロットへのアイテム装着
   * @param {string} slot 'weapon' | 'armor' | 'shield'
   * @param {string} itemId
   * @returns {boolean}
   */
  equip(slot, itemId) {
    if (typeof slot !== 'string') {
      throw new TypeError('[Inventory:equip] slot must be a string');
    }
    if (!VALID_EQUIP_SLOTS.includes(slot)) {
      throw new RangeError(`[Inventory:equip] Invalid equip slot: "${slot}"`);
    }
    if (typeof itemId !== 'string') {
      throw new TypeError('[Inventory:equip] itemId must be a string');
    }
    if (itemId.trim() === '') {
      throw new Error('[Inventory:equip] itemId must not be empty');
    }

    const availableCount = this.getItemCount(itemId);
    if (availableCount <= 0) {
      throw new Error(`[Inventory:equip] Cannot equip item not in inventory: "${itemId}"`);
    }

    // 同一アイテムが他のスロットに装備されている場合の所持数チェック
    let currentEquippedCountOfItem = 0;
    for (const s of VALID_EQUIP_SLOTS) {
      if (s !== slot) {
        if (this._equipment[s] === itemId) {
          currentEquippedCountOfItem += 1;
        }
      }
    }
    if (currentEquippedCountOfItem >= availableCount) {
      throw new Error(`[Inventory:equip] Insufficient item count to equip in multiple slots: "${itemId}"`);
    }

    const previousItem = this._equipment[slot];
    this._equipment[slot] = itemId;

    this._notifyChange('equipment:equipped', { slot: slot, itemId: itemId, previousItemId: previousItem });

    return true;
  }

  /**
   * 装備の解除
   * @param {string} slot 'weapon' | 'armor' | 'shield'
   * @returns {string|null} 解除されたアイテムID（未装備だった場合はnull）
   */
  unequip(slot) {
    if (typeof slot !== 'string') {
      throw new TypeError('[Inventory:unequip] slot must be a string');
    }
    if (!VALID_EQUIP_SLOTS.includes(slot)) {
      throw new RangeError(`[Inventory:unequip] Invalid equip slot: "${slot}"`);
    }

    const previousItem = this._equipment[slot];
    this._equipment[slot] = null;

    if (previousItem !== null) {
      this._notifyChange('equipment:unequipped', { slot: slot, itemId: previousItem, auto: false });
    }

    return previousItem;
  }

  /**
   * 指定部位の装備、または全装備の防御的コピーを取得
   * @param {string|null} [slot=null]
   * @returns {string|null|Object}
   */
  getEquipment(slot = null) {
    if (slot !== null) {
      if (typeof slot !== 'string') {
        throw new TypeError('[Inventory:getEquipment] slot must be a string or null');
      }
      if (!VALID_EQUIP_SLOTS.includes(slot)) {
        throw new RangeError(`[Inventory:getEquipment] Invalid equip slot: "${slot}"`);
      }
      return this._equipment[slot];
    }

    const copy = {};
    for (const s of VALID_EQUIP_SLOTS) {
      copy[s] = this._equipment[s];
    }
    return copy;
  }

  /**
   * 指定アイテムが現在装備されているか判定
   * @param {string} itemId
   * @returns {boolean}
   */
  isEquipped(itemId) {
    if (typeof itemId !== 'string') {
      throw new TypeError('[Inventory:isEquipped] itemId must be a string');
    }
    if (itemId.trim() === '') {
      throw new Error('[Inventory:isEquipped] itemId must not be empty');
    }
    for (const slot of VALID_EQUIP_SLOTS) {
      if (this._equipment[slot] === itemId) {
        return true;
      }
    }
    return false;
  }

  /**
   * JSONシリアライズ
   * @returns {Object}
   */
  toJSON() {
    return {
      maxCapacity: this._maxCapacity,
      items: this.getItems(),
      equipment: this.getEquipment(null)
    };
  }

  /**
   * JSONデシリアライズ（状態復元）
   * @param {Object} data
   */
  fromJSON(data) {
    if (typeof data !== 'object') {
      throw new TypeError('[Inventory:fromJSON] data must be an object');
    }
    if (data === null) {
      throw new TypeError('[Inventory:fromJSON] data must not be null');
    }
    if (Array.isArray(data)) {
      throw new TypeError('[Inventory:fromJSON] data must not be an array');
    }

    if ('maxCapacity' in data) {
      if (typeof data.maxCapacity !== 'number') {
        throw new TypeError('[Inventory:fromJSON] maxCapacity must be a number');
      }
      if (Number.isNaN(data.maxCapacity)) {
        throw new RangeError('[Inventory:fromJSON] maxCapacity must not be NaN');
      }
      if (!Number.isInteger(data.maxCapacity)) {
        throw new RangeError('[Inventory:fromJSON] maxCapacity must be an integer');
      }
      if (data.maxCapacity <= 0) {
        throw new RangeError('[Inventory:fromJSON] maxCapacity must be greater than 0');
      }
      this._maxCapacity = data.maxCapacity;
    }

    if (!('items' in data)) {
      throw new Error('[Inventory:fromJSON] data must contain items property');
    }
    if (typeof data.items !== 'object') {
      throw new TypeError('[Inventory:fromJSON] items must be an object');
    }
    if (data.items === null) {
      throw new TypeError('[Inventory:fromJSON] items must not be null');
    }
    if (Array.isArray(data.items)) {
      throw new TypeError('[Inventory:fromJSON] items must not be an array');
    }

    if (!('equipment' in data)) {
      throw new Error('[Inventory:fromJSON] data must contain equipment property');
    }
    if (typeof data.equipment !== 'object') {
      throw new TypeError('[Inventory:fromJSON] equipment must be an object');
    }
    if (data.equipment === null) {
      throw new TypeError('[Inventory:fromJSON] equipment must not be null');
    }
    if (Array.isArray(data.equipment)) {
      throw new TypeError('[Inventory:fromJSON] equipment must not be an array');
    }

    this._items = {};
    for (const [key, val] of Object.entries(data.items)) {
      this.addItem(key, val);
    }

    this._equipment = {
      weapon: null,
      armor: null,
      shield: null
    };
    for (const slot of VALID_EQUIP_SLOTS) {
      if (slot in data.equipment) {
        const val = data.equipment[slot];
        if (val !== null) {
          this.equip(slot, val);
        }
      }
    }
  }

  /**
   * 内部変更イベント通知ヘルパー
   * @private
   */
  _notifyChange(type, payload) {
    if (this._eventBus !== null) {
      if (typeof this._eventBus.emit === 'function') {
        this._eventBus.emit(type, payload);
      }
    }
  }
}