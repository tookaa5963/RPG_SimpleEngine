import { EventTypes } from '../core/EventTypes.js';

/**
 * Actor.js
 * プレイヤーおよびモンスターの基本ステータス保持、境界防護、状態遷移を管理する基底エンティティ。
 * Core層規約に基づき完全ヘッドレスかつ純粋ロジックで構成され、イベント通知は EngineEventBus 経由で行います。
 */
export class Actor {
  /**
   * @param {Object} params - 初期化パラメータ
   * @param {string} params.id - エンティティ識別子
   * @param {string} params.name - 表示名
   * @param {number} params.maxHp - 最大HP（1以上の整数）
   * @param {number} [params.hp] - 現在HP（0以上maxHp以下の整数。省略時はmaxHp）
   * @param {number} [params.maxMp] - 最大MP（0以上の整数。省略時は0）
   * @param {number} [params.mp] - 現在MP（0以上maxMp以下の整数。省略時はmaxMp）
   * @param {number} [params.attack] - 攻撃力（0以上の整数。省略時は0）
   * @param {number} [params.defense] - 守備力（0以上の整数。省略時は0）
   * @param {number} [params.agility] - 素早さ（0以上の整数。省略時は0）
   * @param {Array<string>} [params.statusEffects] - 初期状態異常配列
   * @param {Object|null} [eventBus=null] - EngineEventBus インスタンス（任意注入）
   */
  constructor(params, eventBus) {
    if (params === null) {
      throw new Error('Actor: params must not be null');
    }
    if (typeof params !== 'object') {
      throw new Error('Actor: params must be an object');
    }

    // 必須文字列検証: id
    if (typeof params.id !== 'string') {
      throw new Error('Actor: id must be a string');
    }
    if (params.id.length === 0) {
      throw new Error('Actor: id must not be empty');
    }
    this._id = params.id;

    // 必須文字列検証: name
    if (typeof params.name !== 'string') {
      throw new Error('Actor: name must be a string');
    }
    if (params.name.length === 0) {
      throw new Error('Actor: name must not be empty');
    }
    this._name = params.name;

    // 必須数値検証: maxHp
    if (typeof params.maxHp !== 'number') {
      throw new Error('Actor: maxHp must be a number');
    }
    if (!Number.isInteger(params.maxHp)) {
      throw new Error('Actor: maxHp must be an integer');
    }
    if (params.maxHp <= 0) {
      throw new Error('Actor: maxHp must be greater than 0');
    }
    this._maxHp = params.maxHp;

    // 任意数値検証: hp
    let initialHp = this._maxHp;
    if (params.hp !== undefined) {
      if (typeof params.hp !== 'number') {
        throw new Error('Actor: hp must be a number');
      }
      if (!Number.isInteger(params.hp)) {
        throw new Error('Actor: hp must be an integer');
      }
      if (params.hp < 0) {
        throw new Error('Actor: hp must not be negative');
      }
      if (params.hp > this._maxHp) {
        throw new Error('Actor: hp must not exceed maxHp');
      }
      initialHp = params.hp;
    }
    this._hp = initialHp;

    // 任意数値検証: maxMp
    let initialMaxMp = 0;
    if (params.maxMp !== undefined) {
      if (typeof params.maxMp !== 'number') {
        throw new Error('Actor: maxMp must be a number');
      }
      if (!Number.isInteger(params.maxMp)) {
        throw new Error('Actor: maxMp must be an integer');
      }
      if (params.maxMp < 0) {
        throw new Error('Actor: maxMp must not be negative');
      }
      initialMaxMp = params.maxMp;
    }
    this._maxMp = initialMaxMp;

    // 任意数値検証: mp
    let initialMp = this._maxMp;
    if (params.mp !== undefined) {
      if (typeof params.mp !== 'number') {
        throw new Error('Actor: mp must be a number');
      }
      if (!Number.isInteger(params.mp)) {
        throw new Error('Actor: mp must be an integer');
      }
      if (params.mp < 0) {
        throw new Error('Actor: mp must not be negative');
      }
      if (params.mp > this._maxMp) {
        throw new Error('Actor: mp must not exceed maxMp');
      }
      initialMp = params.mp;
    }
    this._mp = initialMp;

    // 任意数値検証: attack
    let initialAttack = 0;
    if (params.attack !== undefined) {
      if (typeof params.attack !== 'number') {
        throw new Error('Actor: attack must be a number');
      }
      if (!Number.isInteger(params.attack)) {
        throw new Error('Actor: attack must be an integer');
      }
      if (params.attack < 0) {
        throw new Error('Actor: attack must not be negative');
      }
      initialAttack = params.attack;
    }
    this._attack = initialAttack;

    // 任意数値検証: defense
    let initialDefense = 0;
    if (params.defense !== undefined) {
      if (typeof params.defense !== 'number') {
        throw new Error('Actor: defense must be a number');
      }
      if (!Number.isInteger(params.defense)) {
        throw new Error('Actor: defense must be an integer');
      }
      if (params.defense < 0) {
        throw new Error('Actor: defense must not be negative');
      }
      initialDefense = params.defense;
    }
    this._defense = initialDefense;

    // 任意数値検証: agility
    let initialAgility = 0;
    if (params.agility !== undefined) {
      if (typeof params.agility !== 'number') {
        throw new Error('Actor: agility must be a number');
      }
      if (!Number.isInteger(params.agility)) {
        throw new Error('Actor: agility must be an integer');
      }
      if (params.agility < 0) {
        throw new Error('Actor: agility must not be negative');
      }
      initialAgility = params.agility;
    }
    this._agility = initialAgility;

    // 任意配列検証: statusEffects
    const safeStatusEffects = [];
    if (params.statusEffects !== undefined) {
      if (!Array.isArray(params.statusEffects)) {
        throw new Error('Actor: statusEffects must be an array');
      }
      for (let i = 0; i < params.statusEffects.length; i++) {
        const item = params.statusEffects[i];
        if (typeof item !== 'string') {
          throw new Error('Actor: statusEffect element must be a string');
        }
        if (item.length === 0) {
          throw new Error('Actor: statusEffect element must not be empty');
        }
        if (safeStatusEffects.indexOf(item) === -1) {
          safeStatusEffects.push(item);
        }
      }
    }
    this._statusEffects = safeStatusEffects;

    // 生存フラグの決定
    this._isAlive = this._hp > 0;

    // EventBus の検証と保持
    this._eventBus = null;
    if (eventBus !== undefined) {
      if (eventBus !== null) {
        if (typeof eventBus.emit !== 'function') {
          throw new Error('Actor: eventBus must implement emit function');
        }
        this._eventBus = eventBus;
      }
    }
  }

  get id() {
    return this._id;
  }

  get name() {
    return this._name;
  }

  get maxHp() {
    return this._maxHp;
  }

  get hp() {
    return this._hp;
  }

  get maxMp() {
    return this._maxMp;
  }

  get mp() {
    return this._mp;
  }

  get attack() {
    return this._attack;
  }

  get defense() {
    return this._defense;
  }

  get agility() {
    return this._agility;
  }

  get isAlive() {
    return this._isAlive;
  }

  get statusEffects() {
    return this._statusEffects.slice();
  }

  /**
   * ダメージ適用処理
   * @param {number} amount - 適用ダメージ量（1以上の整数）
   * @returns {number} 実際に減少したHP量
   */
  applyDamage(amount) {
    if (typeof amount !== 'number') {
      throw new Error('Actor.applyDamage: amount must be a number');
    }
    if (!Number.isInteger(amount)) {
      throw new Error('Actor.applyDamage: amount must be an integer');
    }
    if (amount <= 0) {
      throw new Error('Actor.applyDamage: amount must be greater than 0');
    }
    if (!this._isAlive) {
      return 0;
    }

    let actualDamage = amount;
    if (actualDamage > this._hp) {
      actualDamage = this._hp;
    }

    this._hp = this._hp - actualDamage;

    const diedNow = this._hp === 0;
    if (diedNow) {
      this._isAlive = false;
    }

    if (this._eventBus !== null) {
      this._eventBus.emit(EventTypes.ACTOR.HP_CHANGED, {
        actorId: this._id,
        currentHp: this._hp,
        maxHp: this._maxHp,
        delta: -actualDamage
      });
      if (diedNow) {
        this._eventBus.emit(EventTypes.ACTOR.DIED, {
          actorId: this._id
        });
      }
    }

    return actualDamage;
  }

  /**
   * 回復適用処理
   * @param {number} amount - 回復量（1以上の整数）
   * @returns {number} 実際に回復したHP量
   */
  applyHeal(amount) {
    if (typeof amount !== 'number') {
      throw new Error('Actor.applyHeal: amount must be a number');
    }
    if (!Number.isInteger(amount)) {
      throw new Error('Actor.applyHeal: amount must be an integer');
    }
    if (amount <= 0) {
      throw new Error('Actor.applyHeal: amount must be greater than 0');
    }
    if (!this._isAlive) {
      return 0;
    }

    const missingHp = this._maxHp - this._hp;
    let actualHeal = amount;
    if (actualHeal > missingHp) {
      actualHeal = missingHp;
    }

    this._hp = this._hp + actualHeal;

    if (actualHeal > 0) {
      if (this._eventBus !== null) {
        this._eventBus.emit(EventTypes.ACTOR.HP_CHANGED, {
          actorId: this._id,
          currentHp: this._hp,
          maxHp: this._maxHp,
          delta: actualHeal
        });
      }
    }

    return actualHeal;
  }

  /**
   * MP消費処理
   * @param {number} amount - 消費量（0以上の整数）
   * @returns {boolean} 消費成否（MP不足または戦闘不能時はfalse）
   */
  consumeMp(amount) {
    if (typeof amount !== 'number') {
      throw new Error('Actor.consumeMp: amount must be a number');
    }
    if (!Number.isInteger(amount)) {
      throw new Error('Actor.consumeMp: amount must be an integer');
    }
    if (amount < 0) {
      throw new Error('Actor.consumeMp: amount must not be negative');
    }
    if (!this._isAlive) {
      return false;
    }
    if (amount === 0) {
      return true;
    }
    if (this._mp < amount) {
      return false;
    }

    this._mp = this._mp - amount;

    if (this._eventBus !== null) {
      this._eventBus.emit(EventTypes.ACTOR.MP_CHANGED, {
        actorId: this._id,
        currentMp: this._mp,
        maxMp: this._maxMp,
        delta: -amount
      });
    }

    return true;
  }

  /**
   * MP回復処理
   * @param {number} amount - 回復量（1以上の整数）
   * @returns {number} 実際に回復したMP量
   */
  recoverMp(amount) {
    if (typeof amount !== 'number') {
      throw new Error('Actor.recoverMp: amount must be a number');
    }
    if (!Number.isInteger(amount)) {
      throw new Error('Actor.recoverMp: amount must be an integer');
    }
    if (amount <= 0) {
      throw new Error('Actor.recoverMp: amount must be greater than 0');
    }
    if (!this._isAlive) {
      return 0;
    }

    const missingMp = this._maxMp - this._mp;
    let actualRecover = amount;
    if (actualRecover > missingMp) {
      actualRecover = missingMp;
    }

    this._mp = this._mp + actualRecover;

    if (actualRecover > 0) {
      if (this._eventBus !== null) {
        this._eventBus.emit(EventTypes.ACTOR.MP_CHANGED, {
          actorId: this._id,
          currentMp: this._mp,
          maxMp: this._maxMp,
          delta: actualRecover
        });
      }
    }

    return actualRecover;
  }

  /**
   * 蘇生処理
   * @param {number} hpAmount - 蘇生時の設定HP（1以上の整数）
   * @returns {boolean} 蘇生成否（生存中はfalse）
   */
  revive(hpAmount) {
    if (typeof hpAmount !== 'number') {
      throw new Error('Actor.revive: hpAmount must be a number');
    }
    if (!Number.isInteger(hpAmount)) {
      throw new Error('Actor.revive: hpAmount must be an integer');
    }
    if (hpAmount <= 0) {
      throw new Error('Actor.revive: hpAmount must be greater than 0');
    }
    if (this._isAlive) {
      return false;
    }

    this._isAlive = true;
    let initialHp = hpAmount;
    if (initialHp > this._maxHp) {
      initialHp = this._maxHp;
    }
    this._hp = initialHp;

    if (this._eventBus !== null) {
      this._eventBus.emit(EventTypes.ACTOR.HP_CHANGED, {
        actorId: this._id,
        currentHp: this._hp,
        maxHp: this._maxHp,
        delta: this._hp
      });
    }

    return true;
  }

  /**
   * 状態異常の付与
   * @param {string} statusId - 状態異常識別子
   * @returns {boolean} 付与成否（既に付与済みの場合はfalse）
   */
  addStatusEffect(statusId) {
    if (typeof statusId !== 'string') {
      throw new Error('Actor.addStatusEffect: statusId must be a string');
    }
    if (statusId.length === 0) {
      throw new Error('Actor.addStatusEffect: statusId must not be empty');
    }
    if (this._statusEffects.indexOf(statusId) !== -1) {
      return false;
    }

    this._statusEffects.push(statusId);

    if (this._eventBus !== null) {
      this._eventBus.emit(EventTypes.ACTOR.STATUS_ADDED, {
        actorId: this._id,
        statusId: statusId
      });
    }

    return true;
  }

  /**
   * 状態異常の解除
   * @param {string} statusId - 状態異常識別子
   * @returns {boolean} 解除成否（存在しなかった場合はfalse）
   */
  removeStatusEffect(statusId) {
    if (typeof statusId !== 'string') {
      throw new Error('Actor.removeStatusEffect: statusId must be a string');
    }
    if (statusId.length === 0) {
      throw new Error('Actor.removeStatusEffect: statusId must not be empty');
    }

    const index = this._statusEffects.indexOf(statusId);
    if (index === -1) {
      return false;
    }

    this._statusEffects.splice(index, 1);

    if (this._eventBus !== null) {
      this._eventBus.emit(EventTypes.ACTOR.STATUS_REMOVED, {
        actorId: this._id,
        statusId: statusId
      });
    }

    return true;
  }

  /**
   * 状態異常の有無判定
   * @param {string} statusId - 状態異常識別子
   * @returns {boolean}
   */
  hasStatusEffect(statusId) {
    if (typeof statusId !== 'string') {
      return false;
    }
    return this._statusEffects.indexOf(statusId) !== -1;
  }

  /**
   * 状態異常の全解除
   */
  clearStatusEffects() {
    const list = this._statusEffects.slice();
    this._statusEffects = [];

    if (this._eventBus !== null) {
      for (let i = 0; i < list.length; i++) {
        this._eventBus.emit(EventTypes.ACTOR.STATUS_REMOVED, {
          actorId: this._id,
          statusId: list[i]
        });
      }
    }
  }

  /**
   * シリアライズ
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this._id,
      name: this._name,
      maxHp: this._maxHp,
      hp: this._hp,
      maxMp: this._maxMp,
      mp: this._mp,
      attack: this._attack,
      defense: this._defense,
      agility: this._agility,
      isAlive: this._isAlive,
      statusEffects: this._statusEffects.slice()
    };
  }

  /**
   * デシリアライズ
   * @param {Object} data - シリアライズデータ
   * @param {Object|null} [eventBus=null] - EngineEventBus インスタンス
   * @returns {Actor}
   */
  static fromJSON(data, eventBus) {
    if (data === null) {
      throw new Error('Actor.fromJSON: data must not be null');
    }
    if (typeof data !== 'object') {
      throw new Error('Actor.fromJSON: data must be an object');
    }
    let bus = null;
    if (eventBus !== undefined) {
      bus = eventBus;
    }
    return new Actor(data, bus);
  }
}