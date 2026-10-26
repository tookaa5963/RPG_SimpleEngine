import { i18n } from './i18n.js';

/**
 * プロトコル第3項準拠の高解像度例外を生成する決定論的ヘルパー
 * @param {string} type 例外種別
 * @param {string} contextId 発生箇所（ファイル名:関数名）
 * @param {string} propName 不正を検知したプロパティ名
 * @param {*} val 実際に渡された値
 * @returns {Error}
 */
export function createProtocolError(type, contextId, propName, val) {
    return new Error(`[${type}] ${contextId}: プロパティ "${propName}" が不正です (値: ${JSON.stringify(val)}, 型: ${typeof val})`);
}

export let INN_DATA = null;

export async function initInnData() {
    const res = await fetch('data/facilities/inn.json');
    if (!res.ok) {
        throw createProtocolError('HttpError', 'inn.js:initInnData', 'res.status', res.status);
    }
    INN_DATA = await res.json();
    console.log('INN_DATA initialized successfully from inn.json.');
}

export class InnManager {
    constructor(player, messageWindow, getCurrentMap, onFinish, options = {}) {
        if (typeof player === 'undefined') {
            throw createProtocolError('TypeError', 'inn.js:InnManager.constructor', 'player', undefined);
        }
        if (player === null) {
            throw createProtocolError('NullValueError', 'inn.js:InnManager.constructor', 'player', null);
        }
        if (typeof messageWindow === 'undefined') {
            throw createProtocolError('TypeError', 'inn.js:InnManager.constructor', 'messageWindow', undefined);
        }
        if (messageWindow === null) {
            throw createProtocolError('NullValueError', 'inn.js:InnManager.constructor', 'messageWindow', null);
        }

        this.player = player;
        this.msgWin = messageWindow;

        this.getCurrentMap = null;
        if (typeof getCurrentMap === 'function') {
            this.getCurrentMap = getCurrentMap;
        }

        this.onFinish = null;
        if (typeof onFinish === 'function') {
            this.onFinish = onFinish;
        }

        this.onAudio = null;
        if (typeof options === 'object') {
            if (options !== null) {
                if (typeof options.onAudio === 'function') {
                    this.onAudio = options.onAudio;
                }
            }
        }

        this.isStaying = false;
        this.fadeTimer = 0;
        this.FADE_MAX = 150;
    }

    _ensureData() {
        if (typeof INN_DATA === 'undefined') {
            throw createProtocolError('DataNotInitializedError', 'inn.js:InnManager._ensureData', 'INN_DATA', undefined);
        }
        if (INN_DATA === null) {
            throw createProtocolError('DataNotInitializedError', 'inn.js:InnManager._ensureData', 'INN_DATA', null);
        }
    }

    emitAudio(action, payload = null) {
        if (typeof this.onAudio === 'function') {
            this.onAudio(action, payload);
        }
    }

    getMessage(key, params = {}) {
        this._ensureData();
        if (typeof key !== 'string') {
            throw createProtocolError('TypeError', 'inn.js:InnManager.getMessage', 'key', key);
        }
        if (key.trim() === '') {
            throw createProtocolError('EmptyStringError', 'inn.js:InnManager.getMessage', 'key', key);
        }
        if (typeof INN_DATA.messages === 'undefined') {
            throw createProtocolError('MissingPropertyError', 'inn.js:InnManager.getMessage', 'INN_DATA.messages', undefined);
        }
        const msgObj = INN_DATA.messages[key];
        if (typeof msgObj === 'undefined') {
            throw createProtocolError('NotFoundError', 'inn.js:InnManager.getMessage', `messages.${key}`, undefined);
        }
        let text = i18n.resolve(msgObj);
        if (typeof params === 'object') {
            if (params !== null) {
                for (const [k, v] of Object.entries(params)) {
                    text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
                }
            }
        }
        return text;
    }

    open(npc) {
        this._ensureData();
        let cost = 10;
        if (typeof INN_DATA.defaultCost === 'number') {
            cost = INN_DATA.defaultCost;
        }
        if (typeof npc === 'object') {
            if (npc !== null) {
                if (typeof npc.cost === 'number') {
                    cost = npc.cost;
                }
            }
        }

        this.msgWin.openMenu(
            this.getMessage('greeting', { cost: String(cost) }),
            [i18n.t('common.yes'), i18n.t('common.no')],
            (selectedIndex) => {
                if (selectedIndex === 0) {
                    if (!this.player.useGold(cost)) {
                        this.emitAudio('bump');
                        this.msgWin.open([this.getMessage('gold_shortage')]);
                    } else {
                        this.msgWin.close();
                        this.startStaying();
                    }
                } else {
                    this.msgWin.open([this.getMessage('goodbye')]);
                }
            },
            () => {
                this.msgWin.open([this.getMessage('goodbye')]);
            }
        );
    }

    startStaying() {
        this.isStaying = true;
        this.fadeTimer = this.FADE_MAX;
        this.emitAudio('stopBgm');
        this.emitAudio('inn');
    }

    update() {
        if (!this.isStaying) {
            return;
        }
        this.fadeTimer--;
        if (this.fadeTimer === Math.floor(this.FADE_MAX / 2)) {
            this.player.fullRecovery();
        }
        if (this.fadeTimer <= 0) {
            this.isStaying = false;
            let currentMap = null;
            if (typeof this.getCurrentMap === 'function') {
                currentMap = this.getCurrentMap();
            }

            if (typeof currentMap === 'object') {
                if (currentMap !== null) {
                    if (typeof currentMap.bgm !== 'undefined') {
                        if (currentMap.bgm !== null) {
                            this.emitAudio('playBgm', currentMap.bgm);
                        }
                    }
                }
            }

            if (typeof this.onFinish === 'function') {
                this.onFinish();
            }
            this.msgWin.open([this.getMessage('morning')]);
        }
    }

    draw(ctx, canvas) {
        if (!this.isStaying) {
            return;
        }
        const half = this.FADE_MAX / 2;
        let alpha = 1.0;
        if (this.fadeTimer > half) {
            alpha = (this.FADE_MAX - this.fadeTimer) / half;
        } else {
            alpha = this.fadeTimer / half;
        }
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(1.0, Math.max(0.0, alpha))})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}
