/**
 * RewardCalculator.js
 * 
 * 戦闘終了後の報酬計算（経験値・ゴールド・ドロップ判定・破棄候補判定）を担当する純粋Coreモジュール。
 * 完全ヘッドレス（ブラウザAPI非依存）、外部状態非保持。
 */

export class RewardCalculator {
  /**
   * 経験値の計算（レベル差減衰・ボス判定・最低保証を含む）
   * 
   * @param {number} playerLevel - プレイヤーの現在レベル
   * @param {Object} enemy - 敵オブジェクト
   * @returns {number} 獲得経験値
   */
  static calculateExp(playerLevel, enemy) {
    if (typeof playerLevel !== 'number') {
      throw new TypeError('playerLevel must be a number');
    }
    if (Number.isNaN(playerLevel)) {
      throw new TypeError('playerLevel must not be NaN');
    }
    if (!Number.isFinite(playerLevel)) {
      throw new RangeError('playerLevel must be a finite number');
    }
    if (!Number.isInteger(playerLevel)) {
      throw new RangeError('playerLevel must be an integer');
    }
    if (playerLevel <= 0) {
      throw new RangeError('playerLevel must be a positive integer');
    }

    if (typeof enemy !== 'object') {
      throw new TypeError('enemy must be an object');
    }
    if (enemy === null) {
      throw new TypeError('enemy must not be null');
    }
    if (Array.isArray(enemy)) {
      throw new TypeError('enemy must not be an array');
    }

    if (typeof enemy.exp !== 'number') {
      throw new TypeError('enemy.exp must be a number');
    }
    if (Number.isNaN(enemy.exp)) {
      throw new TypeError('enemy.exp must not be NaN');
    }
    if (!Number.isFinite(enemy.exp)) {
      throw new RangeError('enemy.exp must be a finite number');
    }
    if (enemy.exp < 0) {
      throw new RangeError('enemy.exp must not be negative');
    }

    let enemyLevel = 1;
    if (typeof enemy.level !== 'undefined') {
      if (typeof enemy.level !== 'number') {
        throw new TypeError('enemy.level must be a number');
      }
      if (Number.isNaN(enemy.level)) {
        throw new TypeError('enemy.level must not be NaN');
      }
      if (!Number.isFinite(enemy.level)) {
        throw new RangeError('enemy.level must be a finite number');
      }
      if (enemy.level <= 0) {
        throw new RangeError('enemy.level must be positive');
      }
      enemyLevel = enemy.level;
    }

    let isBoss = false;
    if (typeof enemy.isBoss !== 'undefined') {
      if (typeof enemy.isBoss !== 'boolean') {
        throw new TypeError('enemy.isBoss must be a boolean');
      }
      isBoss = enemy.isBoss;
    }

    if (isBoss === true) {
      return Math.floor(enemy.exp);
    }

    const levelDiff = playerLevel - enemyLevel;
    if (levelDiff >= 3) {
      const reduced = Math.floor(enemy.exp * 0.25);
      return Math.max(1, reduced);
    } else {
      return Math.floor(enemy.exp);
    }
  }

  /**
   * 獲得ゴールドの計算
   * 
   * @param {Object} enemy - 敵オブジェクト
   * @returns {number} 獲得ゴールド
   */
  static calculateGold(enemy) {
    if (typeof enemy !== 'object') {
      throw new TypeError('enemy must be an object');
    }
    if (enemy === null) {
      throw new TypeError('enemy must not be null');
    }
    if (Array.isArray(enemy)) {
      throw new TypeError('enemy must not be an array');
    }

    if (typeof enemy.gold !== 'number') {
      throw new TypeError('enemy.gold must be a number');
    }
    if (Number.isNaN(enemy.gold)) {
      throw new TypeError('enemy.gold must not be NaN');
    }
    if (!Number.isFinite(enemy.gold)) {
      throw new RangeError('enemy.gold must be a finite number');
    }
    if (enemy.gold < 0) {
      throw new RangeError('enemy.gold must not be negative');
    }

    return Math.floor(enemy.gold);
  }

  /**
   * ドロップアイテムの判定
   * 
   * @param {Object} enemy - 敵オブジェクト
   * @returns {string|null} ドロップアイテムID、またはnull
   */
  static determineDropItem(enemy) {
    if (typeof enemy !== 'object') {
      throw new TypeError('enemy must be an object');
    }
    if (enemy === null) {
      throw new TypeError('enemy must not be null');
    }
    if (Array.isArray(enemy)) {
      throw new TypeError('enemy must not be an array');
    }

    if (typeof enemy.dropItem === 'undefined') {
      return null;
    }
    if (enemy.dropItem === null) {
      return null;
    }
    if (typeof enemy.dropItem !== 'string') {
      throw new TypeError('enemy.dropItem must be a string or null');
    }
    if (enemy.dropItem.length === 0) {
      return null;
    }

    return enemy.dropItem;
  }

  /**
   * インベントリ満杯時における破棄候補アイテムの抽出
   * （装備中アイテムの余剰分抽出および重要アイテム type: key / keyItem の除外）
   * 
   * @param {Object} items - 所持アイテム一覧（キー: itemId, 値: 個数）
   * @param {Object} equipment - 装備中アイテム（スロット別 itemId）
   * @param {Object} itemDb - アイテムマスターデータ
   * @returns {Array<{id: string, name: string}>} 破棄候補リスト
   */
  static getDiscardCandidates(items, equipment, itemDb) {
    if (typeof items !== 'object') {
      throw new TypeError('items must be an object');
    }
    if (items === null) {
      throw new TypeError('items must not be null');
    }
    if (Array.isArray(items)) {
      throw new TypeError('items must not be an array');
    }

    if (typeof equipment !== 'object') {
      throw new TypeError('equipment must be an object');
    }
    if (equipment === null) {
      throw new TypeError('equipment must not be null');
    }
    if (Array.isArray(equipment)) {
      throw new TypeError('equipment must not be an array');
    }

    if (typeof itemDb !== 'object') {
      throw new TypeError('itemDb must be an object');
    }
    if (itemDb === null) {
      throw new TypeError('itemDb must not be null');
    }
    if (Array.isArray(itemDb)) {
      throw new TypeError('itemDb must not be an array');
    }

    const equippedCount = {};
    const slotKeys = Object.keys(equipment);
    for (let i = 0; i < slotKeys.length; i += 1) {
      const slot = slotKeys[i];
      const itemId = equipment[slot];
      if (typeof itemId === 'string') {
        if (itemId.length > 0) {
          if (typeof equippedCount[itemId] === 'number') {
            equippedCount[itemId] += 1;
          } else {
            equippedCount[itemId] = 1;
          }
        }
      }
    }

    const candidates = [];
    const itemKeys = Object.keys(items);
    for (let i = 0; i < itemKeys.length; i += 1) {
      const itemId = itemKeys[i];
      const count = items[itemId];
      if (typeof count === 'number') {
        if (count > 0) {
          const itemDef = itemDb[itemId];
          if (typeof itemDef === 'object') {
            if (itemDef !== null) {
              if (itemDef.type !== 'key') {
                if (itemDef.type !== 'keyItem') {
                  let equippedQty = 0;
                  if (typeof equippedCount[itemId] === 'number') {
                    equippedQty = equippedCount[itemId];
                  }

                  if (count > equippedQty) {
                    let itemName = itemId;
                    if (typeof itemDef.name === 'string') {
                      itemName = itemDef.name;
                    }
                    candidates.push({
                      id: itemId,
                      name: itemName
                    });
                  }
                }
              }
            }
          }
        }
      }
    }

    return candidates;
  }

  /**
   * 戦闘終了時の総合報酬サマリーを計算・判定
   * 
   * @param {Object} options
   * @param {number} options.playerLevel
   * @param {Object} options.enemy
   * @param {Object} options.items
   * @param {Object} options.equipment
   * @param {Object} options.itemDb
   * @param {boolean} options.isInventoryFull
   * @returns {{
   *   exp: number,
   *   gold: number,
   *   dropItemId: string|null,
   *   status: 'NO_DROP'|'DROP_OBTAINED'|'DISCARD_REQUIRED'|'DROP_ABANDONED',
   *   discardCandidates: Array<{id: string, name: string}>
   * }}
   */
  static calculateRewardSummary(options) {
    if (typeof options !== 'object') {
      throw new TypeError('options must be an object');
    }
    if (options === null) {
      throw new TypeError('options must not be null');
    }
    if (Array.isArray(options)) {
      throw new TypeError('options must not be an array');
    }

    if (typeof options.isInventoryFull !== 'boolean') {
      throw new TypeError('options.isInventoryFull must be a boolean');
    }
    if (typeof options.playerLevel === 'undefined') {
      throw new TypeError('options.playerLevel is required');
    }
    if (typeof options.enemy === 'undefined') {
      throw new TypeError('options.enemy is required');
    }
    if (typeof options.items === 'undefined') {
      throw new TypeError('options.items is required');
    }
    if (typeof options.equipment === 'undefined') {
      throw new TypeError('options.equipment is required');
    }
    if (typeof options.itemDb === 'undefined') {
      throw new TypeError('options.itemDb is required');
    }

    const exp = RewardCalculator.calculateExp(options.playerLevel, options.enemy);
    const gold = RewardCalculator.calculateGold(options.enemy);
    const dropItemId = RewardCalculator.determineDropItem(options.enemy);

    let status = 'NO_DROP';
    let discardCandidates = [];

    if (dropItemId !== null) {
      if (options.isInventoryFull === false) {
        status = 'DROP_OBTAINED';
      } else {
        discardCandidates = RewardCalculator.getDiscardCandidates(
          options.items,
          options.equipment,
          options.itemDb
        );
        if (discardCandidates.length > 0) {
          status = 'DISCARD_REQUIRED';
        } else {
          status = 'DROP_ABANDONED';
        }
      }
    }

    return {
      exp: exp,
      gold: gold,
      dropItemId: dropItemId,
      status: status,
      discardCandidates: discardCandidates
    };
  }
}