/**
 * DataRepository.js
 * ゲーム内マスタデータ（アイテム、呪文、モンスター等）のインメモリ保持および検索を行うリポジトリ。
 * 完全ヘッドレス（I/O分離）、Tier 3 構文準拠（禁止演算子排除・フェイルファスト）。
 */

export class DataRepository {
  constructor() {
    this._categories = new Map();
  }

  /**
   * 単一エントリを登録します。
   * @param {string} category - カテゴリ識別名（例: "items", "spells"）
   * @param {string} id - データID
   * @param {object} data - 登録データオブジェクト
   */
  register(category, id, data) {
    if (typeof category !== 'string') {
      throw new TypeError('category must be a non-empty string');
    }
    if (category.length === 0) {
      throw new Error('category must not be empty');
    }

    if (typeof id !== 'string') {
      throw new TypeError('id must be a non-empty string');
    }
    if (id.length === 0) {
      throw new Error('id must not be empty');
    }

    if (data === null) {
      throw new TypeError('data must be an object and not null');
    }
    if (typeof data !== 'object') {
      throw new TypeError('data must be an object and not null');
    }

    if (!this._categories.has(category)) {
      this._categories.set(category, new Map());
    }

    const categoryMap = this._categories.get(category);
    categoryMap.set(id, data);
  }

  /**
   * 複数のエントリを一括登録します。
   * @param {string} category - カテゴリ識別名
   * @param {Array<object>|Record<string, object>} entries - 登録データ配列（各要素に id を含む）または ID をキーとする辞書オブジェクト
   */
  registerAll(category, entries) {
    if (typeof category !== 'string') {
      throw new TypeError('category must be a non-empty string');
    }
    if (category.length === 0) {
      throw new Error('category must not be empty');
    }

    if (entries === null) {
      throw new TypeError('entries must be an array or an object');
    }
    if (typeof entries !== 'object') {
      throw new TypeError('entries must be an array or an object');
    }

    if (Array.isArray(entries)) {
      for (let i = 0; i < entries.length; i += 1) {
        const item = entries[i];
        if (item === null) {
          throw new TypeError('Entry item must not be null');
        }
        if (typeof item !== 'object') {
          throw new TypeError('Entry item must be an object');
        }
        if (typeof item.id !== 'string') {
          throw new TypeError('Entry item must have a string id property');
        }
        if (item.id.length === 0) {
          throw new Error('Entry item id must not be empty');
        }
        this.register(category, item.id, item);
      }
    } else {
      const keys = Object.keys(entries);
      for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i];
        const val = entries[key];
        this.register(category, key, val);
      }
    }
  }

  /**
   * 指定カテゴリ・ID のデータを取得します。存在しない場合は例外をスローします。
   * @param {string} category - カテゴリ識別名
   * @param {string} id - データID
   * @returns {object} 登録データ
   */
  get(category, id) {
    if (typeof category !== 'string') {
      throw new TypeError('category must be a non-empty string');
    }
    if (category.length === 0) {
      throw new Error('category must not be empty');
    }

    if (typeof id !== 'string') {
      throw new TypeError('id must be a non-empty string');
    }
    if (id.length === 0) {
      throw new Error('id must not be empty');
    }

    if (!this._categories.has(category)) {
      throw new Error('Category not found: ' + category);
    }

    const categoryMap = this._categories.get(category);
    if (!categoryMap.has(id)) {
      throw new Error('Data not found for id: ' + id + ' in category: ' + category);
    }

    return categoryMap.get(id);
  }

  /**
   * 指定カテゴリ・ID のデータが存在するか確認します。
   * @param {string} category - カテゴリ識別名
   * @param {string} id - データID
   * @returns {boolean}
   */
  has(category, id) {
    if (typeof category !== 'string') {
      return false;
    }
    if (category.length === 0) {
      return false;
    }
    if (typeof id !== 'string') {
      return false;
    }
    if (id.length === 0) {
      return false;
    }

    if (!this._categories.has(category)) {
      return false;
    }

    const categoryMap = this._categories.get(category);
    return categoryMap.has(id);
  }

  /**
   * 指定カテゴリ内の全データを配列で返却します。未登録カテゴリの場合は空配列を返却します。
   * @param {string} category - カテゴリ識別名
   * @returns {Array<object>}
   */
  getAll(category) {
    if (typeof category !== 'string') {
      throw new TypeError('category must be a non-empty string');
    }
    if (category.length === 0) {
      throw new Error('category must not be empty');
    }

    if (!this._categories.has(category)) {
      return [];
    }

    const categoryMap = this._categories.get(category);
    return Array.from(categoryMap.values());
  }

  /**
   * 登録されている全カテゴリ名の一覧を返却します。
   * @returns {Array<string>}
   */
  getCategories() {
    return Array.from(this._categories.keys());
  }

  /**
   * 保持している全データを消去します。
   */
  clear() {
    this._categories.clear();
  }
}