/**
 * GenericFlags.js
 * Core層：ブール値フラグ管理コンポーネント
 * 
 * 責務：
 * - ゲーム内フラグ（イベント、宝箱、進行状態など）のブール値保持
 * - 不正な型入力に対する例外送出（フェイルファスト）
 * - セーブデータ入出力用のシリアライズおよび復元
 */

export default class GenericFlags {
    /**
     * @param {Object} [initialFlags=null] - 初期フラグオブジェクト
     */
    constructor(initialFlags) {
        this._flags = new Map();

        if (initialFlags !== undefined) {
            if (initialFlags !== null) {
                this.load(initialFlags);
            }
        }
    }

    /**
     * フラグの値を設定
     * @param {string} key - フラグ識別子
     * @param {boolean} value - 設定するブール値
     */
    set(key, value) {
        this._validateKey(key);

        if (typeof value !== 'boolean') {
            throw new TypeError(`GenericFlags.set: Value for key "${key}" must be a boolean.`);
        }

        this._flags.set(key, value);
    }

    /**
     * フラグの値を取得（未登録キーは false を返却）
     * @param {string} key - フラグ識別子
     * @returns {boolean}
     */
    get(key) {
        this._validateKey(key);

        if (this._flags.has(key)) {
            return this._flags.get(key);
        }

        return false;
    }

    /**
     * フラグが登録されているか判定
     * @param {string} key - フラグ識別子
     * @returns {boolean}
     */
    has(key) {
        this._validateKey(key);
        return this._flags.has(key);
    }

    /**
     * 指定キーのフラグを削除
     * @param {string} key - フラグ識別子
     * @returns {boolean} 削除成功の成否
     */
    delete(key) {
        this._validateKey(key);
        return this._flags.delete(key);
    }

    /**
     * 全フラグを初期化
     */
    clear() {
        this._flags.clear();
    }

    /**
     * 全フラグをプレーンオブジェクトとして返却（シリアライズ用）
     * @returns {Object.<string, boolean>}
     */
    getAll() {
        const result = {};
        for (const [key, value] of this._flags.entries()) {
            result[key] = value;
        }
        return result;
    }

    /**
     * 外部オブジェクトからフラグを一括検証・読み込み
     * @param {Object} flagsObj - 読み込み元オブジェクト
     */
    load(flagsObj) {
        if (typeof flagsObj !== 'object') {
            throw new TypeError('GenericFlags.load: Input must be a valid non-null object.');
        }
        if (flagsObj === null) {
            throw new TypeError('GenericFlags.load: Input cannot be null.');
        }
        if (Array.isArray(flagsObj)) {
            throw new TypeError('GenericFlags.load: Input cannot be an array.');
        }

        const entries = Object.entries(flagsObj);

        // 事前検証：全エントリが妥当か確認（一部のみ反映される状態を防ぐ）
        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            const k = entry[0];
            const v = entry[1];
            this._validateKey(k);
            if (typeof v !== 'boolean') {
                throw new TypeError(`GenericFlags.load: Value for key "${k}" must be a boolean.`);
            }
        }

        this.clear();
        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            this._flags.set(entry[0], entry[1]);
        }
    }

    /**
     * キー文字列のバリデーション
     * @private
     * @param {*} key 
     */
    _validateKey(key) {
        if (typeof key !== 'string') {
            throw new TypeError('GenericFlags: Key must be a string.');
        }
        if (key.trim().length === 0) {
            throw new Error('GenericFlags: Key cannot be empty or whitespace only.');
        }
    }
}