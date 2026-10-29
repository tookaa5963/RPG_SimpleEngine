/**
 * VariableStore.js
 * Core層：汎用変数（数値・文字列）管理コンポーネント
 * 
 * 責務：
 * - 討伐数、イベント進行度、NPC会話段階などの動的ステート保持
 * - 不正な型入力（NaN, Infinity, 未対応オブジェクトなど）の排除
 * - 加減算処理における型整合性の担保
 * - セーブデータ入出力用のシリアライズおよび復元
 */

export default class VariableStore {
    /**
     * @param {Object} [initialVariables=null] - 初期変数オブジェクト
     */
    constructor(initialVariables) {
        this._variables = new Map();

        if (initialVariables !== undefined) {
            if (initialVariables !== null) {
                this.load(initialVariables);
            }
        }
    }

    /**
     * 変数を設定（数値または文字列のみ許容）
     * @param {string} key - 変数識別子
     * @param {number|string} value - 設定する値
     */
    set(key, value) {
        this._validateKey(key);
        this._validateValue(key, value);

        this._variables.set(key, value);
    }

    /**
     * 変数を取得
     * @param {string} key - 変数識別子
     * @param {*} [defaultValue=null] - 未登録時に返却するデフォルト値
     * @returns {*}
     */
    get(key, defaultValue) {
        this._validateKey(key);

        if (this._variables.has(key)) {
            return this._variables.get(key);
        }

        if (defaultValue !== undefined) {
            return defaultValue;
        }

        return null;
    }

    /**
     * 数値変数を厳格取得
     * @param {string} key - 変数識別子
     * @param {number} [defaultValue=0] - 未登録時のデフォルト数値
     * @returns {number}
     */
    getNumber(key, defaultValue) {
        this._validateKey(key);

        let fallback = 0;
        if (defaultValue !== undefined) {
            if (typeof defaultValue !== 'number') {
                throw new TypeError(`VariableStore.getNumber: defaultValue for key "${key}" must be a number.`);
            }
            if (Number.isFinite(defaultValue) === false) {
                throw new TypeError(`VariableStore.getNumber: defaultValue for key "${key}" must be finite.`);
            }
            fallback = defaultValue;
        }

        if (this._variables.has(key)) {
            const val = this._variables.get(key);
            if (typeof val === 'number') {
                return val;
            }
            throw new TypeError(`VariableStore.getNumber: Stored value for key "${key}" is not a number.`);
        }

        return fallback;
    }

    /**
     * 数値変数に対する加減算
     * @param {string} key - 変数識別子
     * @param {number} delta - 加減算量（有限数値）
     * @returns {number} 計算後の値
     */
    add(key, delta) {
        this._validateKey(key);

        if (typeof delta !== 'number') {
            throw new TypeError(`VariableStore.add: Delta for key "${key}" must be a number.`);
        }
        if (Number.isFinite(delta) === false) {
            throw new TypeError(`VariableStore.add: Delta for key "${key}" must be a finite number.`);
        }

        let current = 0;
        if (this._variables.has(key)) {
            const val = this._variables.get(key);
            if (typeof val !== 'number') {
                throw new TypeError(`VariableStore.add: Existing value for key "${key}" is not a number.`);
            }
            current = val;
        }

        const nextValue = current + delta;
        this._variables.set(key, nextValue);
        return nextValue;
    }

    /**
     * 変数が登録されているか判定
     * @param {string} key - 変数識別子
     * @returns {boolean}
     */
    has(key) {
        this._validateKey(key);
        return this._variables.has(key);
    }

    /**
     * 変数を削除
     * @param {string} key - 変数識別子
     * @returns {boolean} 削除成功の成否
     */
    delete(key) {
        this._validateKey(key);
        return this._variables.delete(key);
    }

    /**
     * 全変数を初期化
     */
    clear() {
        this._variables.clear();
    }

    /**
     * 全変数をプレーンオブジェクトとして返却（シリアライズ用）
     * @returns {Object.<string, number|string>}
     */
    getAll() {
        const result = {};
        for (const [key, value] of this._variables.entries()) {
            result[key] = value;
        }
        return result;
    }

    /**
     * 外部オブジェクトから変数を一括検証・読み込み
     * @param {Object} variablesObj - 読み込み元オブジェクト
     */
    load(variablesObj) {
        if (typeof variablesObj !== 'object') {
            throw new TypeError('VariableStore.load: Input must be a valid non-null object.');
        }
        if (variablesObj === null) {
            throw new TypeError('VariableStore.load: Input cannot be null.');
        }
        if (Array.isArray(variablesObj)) {
            throw new TypeError('VariableStore.load: Input cannot be an array.');
        }

        const entries = Object.entries(variablesObj);

        // 事前検証
        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            const k = entry[0];
            const v = entry[1];
            this._validateKey(k);
            this._validateValue(k, v);
        }

        this.clear();
        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            this._variables.set(entry[0], entry[1]);
        }
    }

    /**
     * キー文字列のバリデーション
     * @private
     * @param {*} key 
     */
    _validateKey(key) {
        if (typeof key !== 'string') {
            throw new TypeError('VariableStore: Key must be a string.');
        }
        if (key.trim().length === 0) {
            throw new Error('VariableStore: Key cannot be empty or whitespace only.');
        }
    }

    /**
     * 値のバリデーション（有限数値または文字列のみ許可）
     * @private
     * @param {string} key 
     * @param {*} value 
     */
    _validateValue(key, value) {
        if (typeof value === 'number') {
            if (Number.isFinite(value) === false) {
                throw new TypeError(`VariableStore: Value for key "${key}" must be a finite number.`);
            }
            return;
        }

        if (typeof value === 'string') {
            return;
        }

        throw new TypeError(`VariableStore: Value for key "${key}" must be a finite number or string.`);
    }
}