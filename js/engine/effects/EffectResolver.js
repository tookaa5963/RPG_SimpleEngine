import { HealHpEffect } from './HealHpEffect.js';
import { HealMpEffect } from './HealMpEffect.js';
import { CureStatusEffect } from './CureStatusEffect.js';
import { TeleportEffect } from './TeleportEffect.js';
import { MessageEffect } from './MessageEffect.js';

/**
 * 効果解決ディスパッチャ
 * 各種効果計算ストラテジーを管理し、データ定義に基づいて計算処理を振り分ける純粋コアモジュール。
 */
export class EffectResolver {
    constructor() {
        this.strategies = new Map();
        this.registerDefaultStrategies();
    }

    /**
     * 標準効果計算ストラテジーを初期登録する
     */
    registerDefaultStrategies() {
        this.registerStrategy('heal_hp', new HealHpEffect());
        this.registerStrategy('heal_mp', new HealMpEffect());
        this.registerStrategy('cure_status', new CureStatusEffect());
        this.registerStrategy('teleport', new TeleportEffect());
        this.registerStrategy('message', new MessageEffect());
    }

    /**
     * 効果計算ストラテジーを登録する
     * @param {string} type - 効果識別子（例: 'heal_hp', 'heal_mp', 'cure_status', 'teleport', 'message'）
     * @param {Object} strategy - calculate メソッドを実装したストラテジーインスタンス
     */
    registerStrategy(type, strategy) {
        if (typeof type !== 'string') {
            throw new TypeError('Strategy type must be a string.');
        }
        if (type.length === 0) {
            throw new Error('Strategy type cannot be empty.');
        }
        if (typeof strategy !== 'object') {
            throw new TypeError('Strategy must be an object.');
        }
        if (strategy === null) {
            throw new TypeError('Strategy cannot be null.');
        }
        if (typeof strategy.calculate !== 'function') {
            throw new TypeError('Strategy must implement a calculate method.');
        }

        this.strategies.set(type, strategy);
    }

    /**
     * 登録済みストラテジーを取得する
     * @param {string} type
     * @returns {Object}
     */
    getStrategy(type) {
        if (typeof type !== 'string') {
            throw new TypeError('Strategy type must be a string.');
        }
        if (!this.strategies.has(type)) {
            throw new Error(`Strategy not registered: ${type}`);
        }
        return this.strategies.get(type);
    }

    /**
     * 効果を計算し、Result オブジェクトを返却する
     * ※引数の user, target に対してプロパティ変更は行わない
     * @param {Object} effectDef - JSONから渡される効果定義オブジェクト
     * @param {Object} user - 発動者（Player または Monster）
     * @param {Object} target - 対象（Player または Monster）
     * @param {Object} [options] - 実行コンテキスト等の追加情報
     * @returns {Object} 計算結果オブジェクト
     */
    resolve(effectDef, user, target, options) {
        if (typeof effectDef !== 'object') {
            throw new TypeError('effectDef must be an object.');
        }
        if (effectDef === null) {
            throw new TypeError('effectDef cannot be null.');
        }
        if (typeof effectDef.type !== 'string') {
            throw new TypeError('effectDef.type must be a string.');
        }
        if (effectDef.type.length === 0) {
            throw new Error('effectDef.type cannot be empty.');
        }
        if (typeof user !== 'object') {
            throw new TypeError('user must be an object.');
        }
        if (user === null) {
            throw new TypeError('user cannot be null.');
        }
        if (typeof target !== 'object') {
            throw new TypeError('target must be an object.');
        }
        if (target === null) {
            throw new TypeError('target cannot be null.');
        }

        let resolvedOptions = {};
        if (typeof options === 'object') {
            if (options !== null) {
                resolvedOptions = options;
            }
        }

        const strategy = this.getStrategy(effectDef.type);
        return strategy.calculate(effectDef, user, target, resolvedOptions);
    }
}