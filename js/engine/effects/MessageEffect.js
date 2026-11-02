/**
 * メッセージ表示効果計算ストラテジー
 * 純粋計算を行い、メッセージキー配列および消費フラグを解決して返却する。
 * 対象および使用者に対するプロパティ変更（副作用）は一切行わない。
 */
export class MessageEffect {
  /**
   * メッセージ効果を計算し、結果オブジェクトを返却する
   * @param {Object} effectDef - 効果定義オブジェクト
   * @param {Object} user - 使用者オブジェクト
   * @param {Object} target - 対象オブジェクト
   * @param {Object} [options] - 実行コンテキスト
   * @returns {Object} 計算結果オブジェクト
   */
  calculate(effectDef, user, target, options) {
    if (typeof effectDef !== 'object') {
      throw new TypeError('effectDef must be an object.');
    }
    if (effectDef === null) {
      throw new TypeError('effectDef cannot be null.');
    }
    if (typeof effectDef.type !== 'string') {
      throw new TypeError('effectDef.type must be a string.');
    }
    if (effectDef.type !== 'message') {
      throw new Error('Invalid effect type for MessageEffect: ' + effectDef.type);
    }
    if (typeof effectDef.params !== 'object') {
      throw new TypeError('effectDef.params must be an object.');
    }
    if (effectDef.params === null) {
      throw new TypeError('effectDef.params cannot be null.');
    }

    let messageKeys = [];
    if (Array.isArray(effectDef.params.messageKeys)) {
      if (effectDef.params.messageKeys.length === 0) {
        throw new Error('effectDef.params.messageKeys cannot be empty array.');
      }
      for (const key of effectDef.params.messageKeys) {
        if (typeof key !== 'string') {
          throw new TypeError('All items in messageKeys must be strings.');
        }
        if (key.length === 0) {
          throw new Error('Items in messageKeys cannot be empty string.');
        }
      }
      messageKeys = effectDef.params.messageKeys;
    } else if (typeof effectDef.params.messageKey === 'string') {
      if (effectDef.params.messageKey.length === 0) {
        throw new Error('effectDef.params.messageKey cannot be empty string.');
      }
      messageKeys = [effectDef.params.messageKey];
    } else {
      throw new Error('Either messageKey or messageKeys must be provided.');
    }

    let consumeItem = false;
    if (typeof effectDef.params.consumeItem === 'boolean') {
      consumeItem = effectDef.params.consumeItem;
    }

    return {
      success: true,
      strategy: 'message',
      messageKeys: messageKeys,
      consumeItem: consumeItem,
      reason: null
    };
  }
}