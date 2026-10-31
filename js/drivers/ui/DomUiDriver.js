import { EventTypes } from '../../engine/core/EventTypes.js';

/**
 * DomUiDriver
 * EngineEventBus のアクター状態変化イベントを購読し、DOM表示（サイドバー等）を更新する出力ドライバ。
 */
export class DomUiDriver {
  /**
   * @param {Object} eventBus - EngineEventBus インスタンス
   * @param {Object} uiTarget - UIManager インスタンス または DOM要素キャッシュオブジェクト
   */
  constructor(eventBus, uiTarget) {
    if (typeof eventBus !== 'object') {
      throw new TypeError('[DomUiDriver] eventBus は有効なオブジェクトである必要があります');
    }
    if (eventBus === null) {
      throw new TypeError('[DomUiDriver] eventBus は有効なオブジェクトである必要があります');
    }
    if (typeof eventBus.on !== 'function') {
      throw new TypeError('[DomUiDriver] eventBus.on メソッドが存在しません');
    }

    if (typeof uiTarget !== 'object') {
      throw new TypeError('[DomUiDriver] uiTarget は有効なオブジェクトである必要があります');
    }
    if (uiTarget === null) {
      throw new TypeError('[DomUiDriver] uiTarget は有効なオブジェクトである必要があります');
    }

    let resolvedElements = null;
    if (typeof uiTarget.elements === 'object') {
      if (uiTarget.elements !== null) {
        resolvedElements = uiTarget.elements;
      }
    }
    if (resolvedElements === null) {
      resolvedElements = uiTarget;
    }

    this.eventBus = eventBus;
    this.uiTarget = uiTarget;
    this.elements = resolvedElements;
    this.unsubscribers = [];
    this.isSubscribed = false;
    this.isPoisoned = false;

    this.handleHpChanged = this.handleHpChanged.bind(this);
    this.handleMpChanged = this.handleMpChanged.bind(this);
    this.handleStatusAdded = this.handleStatusAdded.bind(this);
    this.handleStatusRemoved = this.handleStatusRemoved.bind(this);
    this.handleActorDied = this.handleActorDied.bind(this);
  }

  /**
   * UI更新イベントの購読を開始します。
   */
  subscribe() {
    if (this.isSubscribed) {
      return;
    }

    const unsubHp = this.eventBus.on(EventTypes.ACTOR.HP_CHANGED, this.handleHpChanged);
    const unsubMp = this.eventBus.on(EventTypes.ACTOR.MP_CHANGED, this.handleMpChanged);
    const unsubStatusAdded = this.eventBus.on(EventTypes.ACTOR.STATUS_ADDED, this.handleStatusAdded);
    const unsubStatusRemoved = this.eventBus.on(EventTypes.ACTOR.STATUS_REMOVED, this.handleStatusRemoved);
    const unsubDied = this.eventBus.on(EventTypes.ACTOR.DIED, this.handleActorDied);

    if (typeof unsubHp === 'function') {
      this.unsubscribers.push(unsubHp);
    }
    if (typeof unsubMp === 'function') {
      this.unsubscribers.push(unsubMp);
    }
    if (typeof unsubStatusAdded === 'function') {
      this.unsubscribers.push(unsubStatusAdded);
    }
    if (typeof unsubStatusRemoved === 'function') {
      this.unsubscribers.push(unsubStatusRemoved);
    }
    if (typeof unsubDied === 'function') {
      this.unsubscribers.push(unsubDied);
    }

    this.isSubscribed = true;
  }

  /**
   * UI更新イベントの購読を解除します。
   */
  unsubscribe() {
    if (!this.isSubscribed) {
      return;
    }

    for (let i = 0; i < this.unsubscribers.length; i = i + 1) {
      const unsub = this.unsubscribers[i];
      unsub();
    }

    this.unsubscribers = [];
    this.isSubscribed = false;
  }

  /**
   * HP変更イベントハンドラ
   * @param {Object} payload - { actorId, currentHp, maxHp, delta }
   */
  handleHpChanged(payload) {
    if (typeof payload !== 'object') {
      throw new TypeError('[DomUiDriver:handleHpChanged] payload はオブジェクトである必要があります');
    }
    if (payload === null) {
      throw new TypeError('[DomUiDriver:handleHpChanged] payload はオブジェクトである必要があります');
    }
    if (typeof payload.currentHp !== 'number') {
      throw new TypeError('[DomUiDriver:handleHpChanged] currentHp は数値である必要があります');
    }
    if (typeof payload.maxHp !== 'number') {
      throw new TypeError('[DomUiDriver:handleHpChanged] maxHp は数値である必要があります');
    }

    this.renderHp(payload.currentHp, payload.maxHp);
  }

  /**
   * MP変更イベントハンドラ
   * @param {Object} payload - { actorId, currentMp, maxMp, delta }
   */
  handleMpChanged(payload) {
    if (typeof payload !== 'object') {
      throw new TypeError('[DomUiDriver:handleMpChanged] payload はオブジェクトである必要があります');
    }
    if (payload === null) {
      throw new TypeError('[DomUiDriver:handleMpChanged] payload はオブジェクトである必要があります');
    }
    if (typeof payload.currentMp !== 'number') {
      throw new TypeError('[DomUiDriver:handleMpChanged] currentMp は数値である必要があります');
    }
    if (typeof payload.maxMp !== 'number') {
      throw new TypeError('[DomUiDriver:handleMpChanged] maxMp は数値である必要があります');
    }

    this.renderMp(payload.currentMp, payload.maxMp);
  }

  /**
   * 状態異常付与イベントハンドラ
   * @param {Object} payload - { actorId, statusId }
   */
  handleStatusAdded(payload) {
    if (typeof payload !== 'object') {
      throw new TypeError('[DomUiDriver:handleStatusAdded] payload はオブジェクトである必要があります');
    }
    if (payload === null) {
      throw new TypeError('[DomUiDriver:handleStatusAdded] payload はオブジェクトである必要があります');
    }
    if (typeof payload.statusId !== 'string') {
      throw new TypeError('[DomUiDriver:handleStatusAdded] statusId は文字列である必要があります');
    }

    if (payload.statusId === 'poison') {
      this.isPoisoned = true;
      if (this.elements.hpBar !== null) {
        if (typeof this.elements.hpBar === 'object') {
          if (typeof this.elements.hpBar.style === 'object') {
            if (this.elements.hpBar.style !== null) {
              this.elements.hpBar.style.backgroundColor = '#9b59b6';
            }
          }
        }
      }
    }
  }

  /**
   * 状態異常解除イベントハンドラ
   * @param {Object} payload - { actorId, statusId }
   */
  handleStatusRemoved(payload) {
    if (typeof payload !== 'object') {
      throw new TypeError('[DomUiDriver:handleStatusRemoved] payload はオブジェクトである必要があります');
    }
    if (payload === null) {
      throw new TypeError('[DomUiDriver:handleStatusRemoved] payload はオブジェクトである必要があります');
    }
    if (typeof payload.statusId !== 'string') {
      throw new TypeError('[DomUiDriver:handleStatusRemoved] statusId は文字列である必要があります');
    }

    if (payload.statusId === 'poison') {
      this.isPoisoned = false;
      if (this.elements.hpBar !== null) {
        if (typeof this.elements.hpBar === 'object') {
          if (typeof this.elements.hpBar.style === 'object') {
            if (this.elements.hpBar.style !== null) {
              this.elements.hpBar.style.backgroundColor = '#2ecc71';
            }
          }
        }
      }
    }
  }

  /**
   * 死亡イベントハンドラ
   * @param {Object} payload - { actorId }
   */
  handleActorDied(payload) {
    if (typeof payload !== 'object') {
      throw new TypeError('[DomUiDriver:handleActorDied] payload はオブジェクトである必要があります');
    }
    if (payload === null) {
      throw new TypeError('[DomUiDriver:handleActorDied] payload はオブジェクトである必要があります');
    }

    this.renderHp(0, 1);
  }

  /**
   * HP表示およびHPバーのDOM描画更新
   * @param {number} currentHp
   * @param {number} maxHp
   */
  renderHp(currentHp, maxHp) {
    let poisonBadge = '';
    if (this.isPoisoned === true) {
      poisonBadge = ' [毒]';
    }

    if (this.elements.hp !== null) {
      if (typeof this.elements.hp === 'object') {
        this.elements.hp.textContent = `${currentHp} / ${maxHp}${poisonBadge}`;
      }
    }

    if (this.elements.hpBar !== null) {
      if (typeof this.elements.hpBar === 'object') {
        if (typeof this.elements.hpBar.style === 'object') {
          if (this.elements.hpBar.style !== null) {
            let hpRatio = 0;
            if (maxHp > 0) {
              hpRatio = Math.max(0, Math.min(1, currentHp / maxHp));
            }
            this.elements.hpBar.style.width = `${(hpRatio * 100).toFixed(1)}%`;

            if (this.isPoisoned === true) {
              this.elements.hpBar.style.backgroundColor = '#9b59b6';
            } else if (hpRatio <= 0.25) {
              this.elements.hpBar.style.backgroundColor = '#e74c3c';
            } else if (hpRatio <= 0.5) {
              this.elements.hpBar.style.backgroundColor = '#f1c40f';
            } else {
              this.elements.hpBar.style.backgroundColor = '#2ecc71';
            }
          }
        }
      }
    }
  }

  /**
   * MP表示およびMPバーのDOM描画更新
   * @param {number} currentMp
   * @param {number} maxMp
   */
  renderMp(currentMp, maxMp) {
    if (this.elements.mp !== null) {
      if (typeof this.elements.mp === 'object') {
        this.elements.mp.textContent = `${currentMp} / ${maxMp}`;
      }
    }

    if (this.elements.mpBar !== null) {
      if (typeof this.elements.mpBar === 'object') {
        if (typeof this.elements.mpBar.style === 'object') {
          if (this.elements.mpBar.style !== null) {
            let mpRatio = 0;
            if (maxMp > 0) {
              mpRatio = Math.max(0, Math.min(1, currentMp / maxMp));
            }
            this.elements.mpBar.style.width = `${(mpRatio * 100).toFixed(1)}%`;
            this.elements.mpBar.style.backgroundColor = '#3498db';
          }
        }
      }
    }
  }
}